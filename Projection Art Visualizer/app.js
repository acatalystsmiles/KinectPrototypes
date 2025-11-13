/**
 * Main Application
 * Handles canvas setup, animation loop, UI controls, and data sources
 */

let canvas, ctx, vizManager;
let lastTime = 0;
let frameCount = 0;
let fps = 60;
let fpsUpdateTime = 0;

// Data source
let dataSource = 'mock';
let mousePosition = { x: 0.5, y: 0.5 };
let mockBodies = [];

// Initialize the application
function init() {
    // Setup canvas
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();

    // Create visualization manager
    vizManager = new VisualizationManager(canvas, ctx);
    vizManager.switchMode('particleField');

    // Setup UI controls
    setupControls();

    // Setup data sources
    setupDataSources();

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);

    // Start animation loop
    requestAnimationFrame(animate);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (vizManager) {
        vizManager.resize(canvas.width, canvas.height);
    }
}

function animate(currentTime) {
    requestAnimationFrame(animate);

    // Calculate delta time
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Update FPS counter
    frameCount++;
    if (currentTime - fpsUpdateTime > 1000) {
        fps = frameCount;
        frameCount = 0;
        fpsUpdateTime = currentTime;
        document.getElementById('fps').textContent = `FPS: ${fps}`;
    }

    // Update visualization
    vizManager.update(deltaTime);

    // Render visualization
    vizManager.render();
}

function setupControls() {
    // Visualization mode selector
    document.getElementById('viz-mode').addEventListener('change', (e) => {
        vizManager.switchMode(e.target.value);
    });

    // Particle controls
    const controls = {
        'particle-count': (value) => {
            vizManager.updateParams({ particleCount: parseInt(value) });
            document.getElementById('particle-count-val').textContent = value;
        },
        'force-strength': (value) => {
            vizManager.updateParams({ forceStrength: parseFloat(value) });
            document.getElementById('force-strength-val').textContent = value;
        },
        'flow-speed': (value) => {
            vizManager.updateParams({ flowSpeed: parseFloat(value) });
            document.getElementById('flow-speed-val').textContent = value;
        },
        'particle-size': (value) => {
            vizManager.updateParams({ particleSize: parseInt(value) });
            document.getElementById('particle-size-val').textContent = value;
        },
        'trail-length': (value) => {
            vizManager.updateParams({ trailLength: parseFloat(value) });
            document.getElementById('trail-length-val').textContent = value;
        }
    };

    // Setup slider listeners
    for (let [id, handler] of Object.entries(controls)) {
        const element = document.getElementById(id);
        element.addEventListener('input', (e) => handler(e.target.value));
    }

    // Color mode selector
    document.getElementById('color-mode').addEventListener('change', (e) => {
        vizManager.updateParams({ colorMode: e.target.value });
    });

    // Reset button
    document.getElementById('reset-particles').addEventListener('click', () => {
        vizManager.reset();
    });

    // Data source selector
    document.getElementById('data-source').addEventListener('change', (e) => {
        dataSource = e.target.value;
        setupDataSources();
    });

    // Toggle controls visibility
    const controlsPanel = document.getElementById('controls');
    const toggleButton = document.getElementById('toggle-controls');

    toggleButton.addEventListener('click', () => {
        controlsPanel.classList.toggle('hidden');
    });

    // Keyboard shortcut (H key)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'h' || e.key === 'H') {
            controlsPanel.classList.toggle('hidden');
        }
    });
}

function setupDataSources() {
    // Clear any existing data
    mockBodies = [];

    switch (dataSource) {
        case 'mock':
            startMockData();
            break;

        case 'mouse':
            startMouseTracking();
            break;

        case 'kinect':
            startKinectConnection();
            break;
    }
}

/**
 * Mock Data Source
 * Simulates body tracking with animated joints
 */
function startMockData() {
    function updateMockData() {
        if (dataSource !== 'mock') return;

        const time = Date.now() * 0.001;

        // Create 1-2 mock bodies with animated joints
        mockBodies = [{
            id: 1,
            joints: {
                head: {
                    x: 0.5 + Math.sin(time) * 0.1,
                    y: 0.3 + Math.cos(time * 0.5) * 0.05
                },
                handLeft: {
                    x: 0.3 + Math.sin(time * 1.5) * 0.15,
                    y: 0.5 + Math.cos(time * 1.2) * 0.15
                },
                handRight: {
                    x: 0.7 + Math.sin(time * 1.3) * 0.15,
                    y: 0.5 + Math.cos(time * 1.4) * 0.15
                },
                pelvis: {
                    x: 0.5 + Math.sin(time * 0.8) * 0.05,
                    y: 0.6
                }
            }
        }];

        vizManager.updateBodies(mockBodies);
        setTimeout(updateMockData, 1000 / 30); // 30fps for mock data
    }

    updateMockData();
}

/**
 * Mouse Tracking Data Source
 * Uses mouse position as a single "hand" joint
 */
function startMouseTracking() {
    canvas.addEventListener('mousemove', (e) => {
        if (dataSource !== 'mouse') return;

        mousePosition = {
            x: e.clientX / canvas.width,
            y: e.clientY / canvas.height
        };

        mockBodies = [{
            id: 1,
            joints: {
                handRight: mousePosition,
                handLeft: {
                    x: mousePosition.x - 0.1,
                    y: mousePosition.y
                },
                head: {
                    x: mousePosition.x,
                    y: Math.max(0, mousePosition.y - 0.2)
                },
                pelvis: {
                    x: mousePosition.x,
                    y: Math.min(1, mousePosition.y + 0.3)
                }
            }
        }];

        vizManager.updateBodies(mockBodies);
    });
}

/**
 * Kinect Data Source
 * Connects to WebSocket server streaming Kinect data
 */
function startKinectConnection() {
    // Attempt to connect to the Kinect WebSocket server
    // This assumes the Kinect Bridge app from the Sound Sculpture project is running

    let ws;
    const wsUrl = 'ws://localhost:8080';

    function connect() {
        console.log('Attempting to connect to Kinect WebSocket...');

        try {
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('Connected to Kinect WebSocket');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'bodies' && data.bodies) {
                        // Convert Kinect body data to our format
                        const bodies = data.bodies.map(body => ({
                            id: body.id,
                            joints: convertKinectJoints(body.joints)
                        }));

                        vizManager.updateBodies(bodies);
                    }
                } catch (error) {
                    console.error('Error parsing Kinect data:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            ws.onclose = () => {
                console.log('WebSocket connection closed. Retrying in 5 seconds...');
                setTimeout(connect, 5000);
            };
        } catch (error) {
            console.error('Error creating WebSocket:', error);
            setTimeout(connect, 5000);
        }
    }

    // Helper function to convert Kinect joint data to normalized coordinates
    function convertKinectJoints(kinectJoints) {
        const joints = {};

        // Map Kinect joint names to our simplified format
        // Normalize coordinates to 0-1 range
        const jointMap = {
            'Head': 'head',
            'HandLeft': 'handLeft',
            'HandRight': 'handRight',
            'SpineBase': 'pelvis'
        };

        for (let [kinectName, ourName] of Object.entries(jointMap)) {
            if (kinectJoints[kinectName]) {
                const joint = kinectJoints[kinectName];
                // Kinect coordinates need to be normalized
                // This is a simplified conversion - adjust based on actual Kinect data format
                joints[ourName] = {
                    x: (joint.x + 2) / 4, // Rough normalization
                    y: (joint.y + 2) / 4
                };
            }
        }

        return joints;
    }

    connect();
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
