using Microsoft.Azure.Kinect.Sensor;
using Microsoft.Azure.Kinect.BodyTracking;
using WebSocketSharp;
using WebSocketSharp.Server;
using Newtonsoft.Json;
using System.Numerics;

namespace KinectBridge;

public class Program
{
    private static Device? device;
    private static Tracker? tracker;
    private static WebSocketServer? wsServer;
    private static KinectWebSocketService? wsService;
    private static bool isRunning = true;
    private static readonly object lockObject = new object();

    public static async Task Main(string[] args)
    {
        Console.WriteLine("🔷 Azure Kinect Bridge Application");
        Console.WriteLine("📡 Streaming skeleton data to Node.js server");
        Console.WriteLine();

        try
        {
            await InitializeKinect();
            StartWebSocketServer();
            await StartBodyTracking();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Fatal error: {ex.Message}");
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }
        finally
        {
            Cleanup();
        }
    }

    private static async Task InitializeKinect()
    {
        Console.WriteLine("🔌 Initializing Azure Kinect device...");

        if (Device.GetInstalledCount() == 0)
        {
            throw new InvalidOperationException("No Azure Kinect devices found. Please connect your device and try again.");
        }

        device = Device.Open(0);
        Console.WriteLine($"✅ Kinect device opened: {device.SerialNum}");

        var config = new DeviceConfiguration
        {
            ColorFormat = ImageFormat.ColorBGRA32,
            ColorResolution = ColorResolution.R720p,
            DepthMode = DepthMode.NFOV_Unbinned,
            SynchronizedImagesOnly = true,
            CameraFPS = FPS.FPS30
        };

        device.StartCameras(config);
        Console.WriteLine("📹 Cameras started successfully");

        // Initialize body tracker
        var trackerConfig = new TrackerConfiguration
        {
            SensorOrientation = SensorOrientation.Default,
            ProcessingMode = TrackerProcessingMode.Gpu,
            GpuDeviceId = 0
        };

        tracker = Tracker.Create(device.GetCalibration(), trackerConfig);
        Console.WriteLine("🏃 Body tracker initialized");

        // Warm up the tracker
        Console.WriteLine("🔥 Warming up tracker...");
        await Task.Delay(2000);
    }

    private static void StartWebSocketServer()
    {
        Console.WriteLine("🌐 Starting WebSocket server on port 8080...");

        wsServer = new WebSocketServer(8080);
        wsService = new KinectWebSocketService();
        wsServer.AddWebSocketService<KinectWebSocketService>("/", () => wsService);

        wsServer.Start();
        Console.WriteLine("✅ WebSocket server started");
    }

    private static async Task StartBodyTracking()
    {
        Console.WriteLine("🎯 Starting body tracking loop...");
        Console.WriteLine("📊 Press 'Q' to quit, 'S' for statistics");
        Console.WriteLine();

        var frameCount = 0;
        var lastStatsTime = DateTime.Now;
        var bodiesDetected = 0;

        while (isRunning)
        {
            try
            {
                if (Console.KeyAvailable)
                {
                    var key = Console.ReadKey(true);
                    if (key.KeyChar == 'q' || key.KeyChar == 'Q')
                    {
                        isRunning = false;
                        break;
                    }
                    else if (key.KeyChar == 's' || key.KeyChar == 'S')
                    {
                        PrintStatistics(frameCount, bodiesDetected, lastStatsTime);
                    }
                }

                using var capture = await device!.GetCaptureAsync();

                if (capture.Depth != null)
                {
                    tracker!.EnqueueCapture(capture);

                    using var frame = tracker.PopResult(TimeSpan.Zero, throwOnTimeout: false);

                    if (frame != null)
                    {
                        frameCount++;
                        var skeletonData = ProcessFrame(frame);

                        if (skeletonData.Bodies.Count > 0)
                        {
                            bodiesDetected++;
                            BroadcastSkeletonData(skeletonData);

                            if (frameCount % 30 == 0) // Update console every 30 frames (~1 second)
                            {
                                Console.Write($"\r🎯 Frame: {frameCount:D6} | Bodies: {skeletonData.Bodies.Count} | Clients: {wsService?.ClientCount ?? 0}");
                            }
                        }
                    }
                }

                await Task.Delay(33); // ~30 FPS
            }
            catch (TimeoutException)
            {
                // Normal timeout, continue
                continue;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\n⚠️ Frame processing error: {ex.Message}");
                await Task.Delay(100);
            }
        }

        Console.WriteLine("\n🛑 Stopping body tracking...");
    }

    private static SkeletonData ProcessFrame(Frame frame)
    {
        var skeletonData = new SkeletonData
        {
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            Bodies = new List<BodyData>()
        };

        for (uint i = 0; i < frame.NumberOfBodies; i++)
        {
            var skeleton = frame.GetBodySkeleton(i);
            var bodyId = frame.GetBodyId(i);

            var bodyData = new BodyData
            {
                Id = (int)bodyId,
                Confidence = CalculateBodyConfidence(skeleton),
                Joints = new Dictionary<int, JointData>()
            };

            // Process all 32 Azure Kinect joints
            for (int jointId = 0; jointId < (int)JointId.Count; jointId++)
            {
                var joint = skeleton.GetJoint((JointId)jointId);

                bodyData.Joints[jointId] = new JointData
                {
                    Position = new PositionData
                    {
                        X = joint.Position.X / 1000.0f, // Convert mm to meters
                        Y = joint.Position.Y / 1000.0f,
                        Z = joint.Position.Z / 1000.0f
                    },
                    Confidence = GetJointConfidence(joint.ConfidenceLevel)
                };
            }

            skeletonData.Bodies.Add(bodyData);
        }

        return skeletonData;
    }

    private static float CalculateBodyConfidence(Skeleton skeleton)
    {
        float totalConfidence = 0;
        int validJoints = 0;

        for (int i = 0; i < (int)JointId.Count; i++)
        {
            var joint = skeleton.GetJoint((JointId)i);
            if (joint.ConfidenceLevel != JointConfidenceLevel.None)
            {
                totalConfidence += GetJointConfidence(joint.ConfidenceLevel);
                validJoints++;
            }
        }

        return validJoints > 0 ? totalConfidence / validJoints : 0.0f;
    }

    private static float GetJointConfidence(JointConfidenceLevel level)
    {
        return level switch
        {
            JointConfidenceLevel.High => 0.95f,
            JointConfidenceLevel.Medium => 0.75f,
            JointConfidenceLevel.Low => 0.35f,
            _ => 0.0f
        };
    }

    private static void BroadcastSkeletonData(SkeletonData data)
    {
        try
        {
            var json = JsonConvert.SerializeObject(data, Formatting.None);
            wsService?.Broadcast(json);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"\n⚠️ Broadcast error: {ex.Message}");
        }
    }

    private static void PrintStatistics(int frameCount, int bodiesDetected, DateTime lastStatsTime)
    {
        var elapsed = DateTime.Now - lastStatsTime;
        var fps = frameCount / elapsed.TotalSeconds;

        Console.WriteLine($"\n📊 Statistics:");
        Console.WriteLine($"   Frames processed: {frameCount}");
        Console.WriteLine($"   Bodies detected: {bodiesDetected}");
        Console.WriteLine($"   Average FPS: {fps:F2}");
        Console.WriteLine($"   Connected clients: {wsService?.ClientCount ?? 0}");
        Console.WriteLine($"   Runtime: {elapsed:hh\\:mm\\:ss}");
        Console.WriteLine();
    }

    private static void Cleanup()
    {
        Console.WriteLine("🧹 Cleaning up resources...");

        try
        {
            tracker?.Dispose();
            device?.StopCameras();
            device?.Dispose();
            wsServer?.Stop();
            Console.WriteLine("✅ Cleanup completed");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Cleanup error: {ex.Message}");
        }
    }
}

public class KinectWebSocketService : WebSocketBehavior
{
    private static readonly HashSet<KinectWebSocketService> clients = new();
    private static readonly object clientsLock = new();

    public static int ClientCount
    {
        get
        {
            lock (clientsLock)
            {
                return clients.Count;
            }
        }
    }

    protected override void OnOpen()
    {
        lock (clientsLock)
        {
            clients.Add(this);
        }
        Console.WriteLine($"\n📱 Client connected from {Context.UserEndPoint}. Total clients: {ClientCount}");
    }

    protected override void OnClose(CloseEventArgs e)
    {
        lock (clientsLock)
        {
            clients.Remove(this);
        }
        Console.WriteLine($"\n📱 Client disconnected. Total clients: {ClientCount}");
    }

    protected override void OnError(WebSocketSharp.ErrorEventArgs e)
    {
        Console.WriteLine($"\n⚠️ WebSocket error: {e.Message}");
    }

    public static void Broadcast(string data)
    {
        lock (clientsLock)
        {
            foreach (var client in clients.ToList())
            {
                try
                {
                    if (client.State == WebSocketState.Open)
                    {
                        client.Send(data);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"\n⚠️ Failed to send to client: {ex.Message}");
                }
            }
        }
    }
}

// Data structure classes
public class SkeletonData
{
    [JsonProperty("timestamp")]
    public long Timestamp { get; set; }

    [JsonProperty("bodies")]
    public List<BodyData> Bodies { get; set; } = new();
}

public class BodyData
{
    [JsonProperty("id")]
    public int Id { get; set; }

    [JsonProperty("confidence")]
    public float Confidence { get; set; }

    [JsonProperty("joints")]
    public Dictionary<int, JointData> Joints { get; set; } = new();
}

public class JointData
{
    [JsonProperty("position")]
    public PositionData Position { get; set; } = new();

    [JsonProperty("confidence")]
    public float Confidence { get; set; }
}

public class PositionData
{
    [JsonProperty("x")]
    public float X { get; set; }

    [JsonProperty("y")]
    public float Y { get; set; }

    [JsonProperty("z")]
    public float Z { get; set; }
}