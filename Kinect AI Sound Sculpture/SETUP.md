# Kinect Movement Soundscape - Setup Guide

## Overview

This Node.js application receives Azure Kinect body tracking data from a C# application via WebSocket, processes movement metrics, and provides real-time visualization through a web interface.

## System Requirements

- Node.js 16.0.0 or higher
- Windows 10/11 (for Azure Kinect SDK)
- Azure Kinect DK device
- C# application that streams skeleton data via WebSocket on port 8080

## Installation

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Start the application:**
   ```bash
   npm start
   ```

   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

## Usage

### Starting the System

1. **Start the C# Kinect Bridge Application** (must be running first)
   - The C# app should stream skeleton data to `ws://localhost:8080`
   - Ensure the Kinect device is connected and body tracking is enabled

2. **Start the Node.js Server:**
   ```bash
   npm start
   ```

3. **Open the Web Interface:**
   - Navigate to `http://localhost:3000` in your web browser
   - The interface will show connection status and real-time skeleton visualization

### Web Interface Features

- **Real-time skeleton visualization** with joints and bones
- **Movement trails** showing hand and head movement paths
- **Live metrics dashboard** showing:
  - Overall body motion
  - Hand velocities
  - Center of mass shifts
  - Body expansion/contraction
  - Movement quality analysis
- **Connection status indicators**
- **Multi-person tracking** (up to 10 different colors)
- **Visualization controls** (toggle joints, bones, trails, metrics overlay)

### API Endpoints

- `GET /` - Web interface
- `GET /health` - System health check
- WebSocket on port 3000 - Socket.io connection for real-time data

### Expected Data Format

The C# application should send JSON data in this format:

```json
{
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
        // ... more joints (32 total for Azure Kinect)
      }
    }
  ]
}
```

### Joint Mapping (Azure Kinect)

The system expects joints numbered 0-31 according to the Azure Kinect Body Tracking SDK:

- 0: Pelvis
- 1: Spine Naval
- 2: Spine Chest
- 3: Neck
- 4-10: Left arm (clavicle, shoulder, elbow, wrist, hand, handtip, thumb)
- 11-17: Right arm
- 18-21: Left leg (hip, knee, ankle, foot)
- 22-25: Right leg
- 26-31: Head (head, nose, eyes, ears)

## Movement Metrics

The system calculates comprehensive movement analysis:

### Individual Body Metrics
- **Overall Motion**: Sum of all joint velocities
- **Hand Velocities**: Left and right hand movement speeds
- **Center of Mass**: Body balance point and shifts
- **Body Expansion**: Distance of extremities from center
- **Vertical Movement**: Jumping, crouching detection
- **Symmetry**: Bilateral movement balance

### Movement Quality Analysis
- **Flowing vs Sharp**: Acceleration pattern analysis
- **Expansive vs Contracted**: Joint distance from center
- **Rhythmic vs Irregular**: FFT analysis of movement patterns
- **Smooth vs Jerky**: Jerk calculation (rate of acceleration change)
- **Speed**: Overall velocity measurements
- **Grounded vs Lifted**: Contact with floor estimation

### Aggregate Metrics
- **Total Bodies**: Number of people being tracked
- **Average Motion**: Mean motion across all bodies
- **Total Hand Activity**: Combined hand movement energy
- **Group Cohesion**: How close people are to each other
- **Energy Level**: Overall system activity level

## Troubleshooting

### Connection Issues
- Ensure the C# Kinect application is running first
- Check that WebSocket server is listening on port 8080
- Verify no firewall is blocking the connection
- Check the console for connection error messages

### Performance Issues
- Reduce trail length by modifying `maxTrailLength` in app.js
- Disable trails or reduce visualization complexity
- Ensure adequate CPU/GPU resources for real-time processing

### No Skeleton Data
- Verify Kinect device is properly connected
- Check that body tracking is enabled in the C# application
- Ensure proper lighting for depth sensing
- Verify people are within the Kinect's tracking range (0.5-3.86m)

## Configuration

### Ports
- Web server: 3000 (configurable in server.js)
- Kinect WebSocket: 8080 (must match C# application)

### Movement Analysis Parameters
- History length: 30 frames (~0.5 seconds at 60fps)
- Smoothing factor: 0.7
- Trail length: 50 points
- Connection timeout: 5 seconds

## Development

### File Structure
```
├── server.js              # Main Node.js server
├── movement-analyzer.js   # Movement metrics calculation
├── package.json           # Dependencies and scripts
├── public/
│   ├── index.html         # Web interface
│   └── app.js            # Client-side visualization
└── SETUP.md              # This file
```

### Adding New Metrics
1. Extend the `MovementAnalyzer` class in `movement-analyzer.js`
2. Add calculation methods for new metrics
3. Update the web interface to display new metrics
4. Test with sample data

### Customizing Visualization
- Modify colors in `bodyColors` array in app.js
- Adjust bone connections in `boneConnections` array
- Change rendering styles in the render methods
- Add new visualization modes in the UI controls

## Integration with Sound Generation

This system is designed to integrate with Tone.js or Web Audio API for sound generation. The calculated movement metrics can be mapped to:

- **Melodic Elements**: Hand movements → note triggers
- **Harmonic Content**: Body expansion → chord density
- **Rhythmic Patterns**: Detected rhythms → beat generation
- **Textural Changes**: Group activity → sound complexity
- **Spatial Audio**: Body positions → stereo panning
- **Dynamic Range**: Energy levels → volume control

## Support

For technical issues:
1. Check the browser console for JavaScript errors
2. Check the Node.js console for server errors
3. Verify the C# application is sending data correctly
4. Test the `/health` endpoint for system status