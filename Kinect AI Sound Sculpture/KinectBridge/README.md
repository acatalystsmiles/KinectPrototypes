# Azure Kinect Bridge Application

This C# application connects to the Azure Kinect DK, performs real-time body tracking, and streams skeleton data via WebSocket to the Node.js visualization server.

## Prerequisites

### Software Requirements
- Windows 10/11 (64-bit)
- .NET 6.0 SDK or later
- Visual Studio 2022 or Visual Studio Code
- Azure Kinect SDK v1.4.1 or later
- Azure Kinect Body Tracking SDK v1.1.2 or later

### Hardware Requirements
- Azure Kinect DK device
- USB 3.0 port
- DirectX 12 compatible GPU (recommended for best performance)

## Installation

### 1. Install Azure Kinect SDK
Download and install from: https://docs.microsoft.com/en-us/azure/kinect-dk/sensor-sdk-download

### 2. Install Azure Kinect Body Tracking SDK
Download and install from: https://docs.microsoft.com/en-us/azure/kinect-dk/body-sdk-download

### 3. Download ONNX Model
The body tracking requires an ONNX model file:
- Download `dnn_model_2_0_op11.onnx` from the Body Tracking SDK installation
- Usually located at: `C:\Program Files\Azure Kinect Body Tracking SDK\sdk\windows-desktop\amd64\release\bin\dnn_model_2_0_op11.onnx`
- Copy it to the KinectBridge project directory

### 4. Build the Application
```bash
cd KinectBridge
dotnet restore
dotnet build --configuration Release --platform x64
```

## Usage

### 1. Connect Azure Kinect
- Plug in your Azure Kinect DK via USB 3.0
- Ensure the device is recognized (check Device Manager)
- Test with Azure Kinect Viewer if needed

### 2. Start the Bridge Application
```bash
cd KinectBridge
dotnet run --configuration Release
```

### 3. Expected Output
```
🔷 Azure Kinect Bridge Application
📡 Streaming skeleton data to Node.js server

🔌 Initializing Azure Kinect device...
✅ Kinect device opened: 123456789
📹 Cameras started successfully
🏃 Body tracker initialized
🔥 Warming up tracker...
🌐 Starting WebSocket server on port 8080...
✅ WebSocket server started
🎯 Starting body tracking loop...
📊 Press 'Q' to quit, 'S' for statistics

🎯 Frame: 000180 | Bodies: 1 | Clients: 1
```

### 4. Controls
- **Q**: Quit the application
- **S**: Show statistics (frames processed, FPS, etc.)

## Data Format

The application streams JSON data in this format:

```json
{
  "timestamp": 1694123456789,
  "bodies": [
    {
      "id": 0,
      "confidence": 0.95,
      "joints": {
        "0": {
          "position": { "x": 0.1, "y": 1.2, "z": 2.0 },
          "confidence": 0.9
        },
        "8": {
          "position": { "x": -0.3, "y": 1.0, "z": 1.8 },
          "confidence": 0.85
        }
        // ... joints 0-31 for all Azure Kinect joints
      }
    }
  ]
}
```

### Joint Mapping (0-31)
- 0: Pelvis
- 1: Spine Naval
- 2: Spine Chest
- 3: Neck
- 4-10: Left arm (clavicle, shoulder, elbow, wrist, hand, handtip, thumb)
- 11-17: Right arm
- 18-21: Left leg (hip, knee, ankle, foot)
- 22-25: Right leg
- 26-31: Head (head, nose, eyes, ears)

## Integration with Node.js

1. **Start this C# application first**
2. **Then start the Node.js server:**
   ```bash
   cd ..
   npm start
   ```
3. **Open web interface:** http://localhost:3000

## Troubleshooting

### Device Not Found
- Ensure Azure Kinect is connected via USB 3.0
- Check Windows Device Manager for "Azure Kinect 4K Camera"
- Try different USB port
- Restart the device (unplug/replug)

### Body Tracking Not Working
- Ensure adequate lighting
- Stand 0.5-3.86 meters from the device
- Make sure the ONNX model file is in the project directory
- Check GPU compatibility (CUDA support recommended)

### Performance Issues
- Close other applications using camera/GPU
- Use GPU processing mode (default)
- Ensure USB 3.0 connection
- Check thermal throttling

### WebSocket Connection Issues
- Verify port 8080 is not blocked by firewall
- Check if another application is using port 8080
- Ensure Node.js server is trying to connect to the right port

## Configuration Options

You can modify these settings in `Program.cs`:

### Camera Configuration
```csharp
var config = new DeviceConfiguration
{
    ColorFormat = ImageFormat.ColorBGRA32,
    ColorResolution = ColorResolution.R720p,  // Adjust for performance
    DepthMode = DepthMode.NFOV_Unbinned,      // Or NFOV_2x2Binned for speed
    SynchronizedImagesOnly = true,
    CameraFPS = FPS.FPS30                     // Or FPS15 for lower CPU usage
};
```

### Tracker Configuration
```csharp
var trackerConfig = new TrackerConfiguration
{
    SensorOrientation = SensorOrientation.Default,
    ProcessingMode = TrackerProcessingMode.Gpu,  // Or Cpu for compatibility
    GpuDeviceId = 0
};
```

### WebSocket Port
Change port 8080 in the `StartWebSocketServer()` method if needed (must match Node.js configuration).

## Performance Optimization

### For Better FPS
- Use `DepthMode.NFOV_2x2Binned`
- Set `CameraFPS = FPS.FPS15`
- Use `ProcessingMode = TrackerProcessingMode.Gpu`

### For Better Quality
- Use `DepthMode.NFOV_Unbinned`
- Set `CameraFPS = FPS.FPS30`
- Ensure good lighting conditions

## Support

Common issues and solutions:

1. **"No Azure Kinect devices found"**: Check USB connection and drivers
2. **High CPU usage**: Switch to GPU processing mode
3. **Tracking accuracy issues**: Improve lighting and ensure proper distance
4. **Connection drops**: Check USB 3.0 connection stability