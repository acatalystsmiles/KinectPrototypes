# Sound System Testing Guide

## Quick Test Setup

### 1. Start the Node.js Server
```bash
npm start
```
Server will run on http://localhost:3000

### 2. Start the Movement Data Simulator
```bash
node test-sound-system.js
```
This runs a comprehensive 30-second test with varying movement intensities.

### 3. Open Web Interface
Navigate to http://localhost:3000 in your browser

### 4. Enable Audio
- Click "🔊 Start Audio" when prompted by browser
- Browser will request audio permission (required for Web Audio API)

## What You Should Experience

### 🎵 Audio Layers
The system includes 4 modular synthesis layers:

1. **Ambient Foundation** (always present)
   - Continuous drone in C major
   - Responds to overall energy levels
   - Creates spatial depth with reverb

2. **Melodic Layer** (hand movements)
   - Triggered by hand velocity
   - Uses pentatonic scale for accessibility
   - Left/right hands trigger different note ranges

3. **Harmonic Layer** (body expansion)
   - Simple triads when contracted
   - Rich extended chords when expanded
   - Smooth transitions between chord types

4. **Rhythmic Layer** (movement beats)
   - Detects movement peaks for drum triggers
   - Prevents over-triggering with timing limits
   - Maps motion intensity to drum dynamics

### 📊 Visual Feedback
The interface shows:
- **Audio Status**: Current state (stopped/playing/error)
- **Volume Control**: Adjustable master volume
- **Audio Visualization**: Real-time frequency analysis
- **Latency Monitor**: Should stay below 50ms
- **Active Layers**: Number of synthesis layers running

### 🎭 Test Phases
The automated test cycles through:
1. **Subtle Movement** (5s) - Basic ambient response
2. **Active Movement** (8s) - Melodic triggers activate
3. **High Energy** (7s) - All layers active, rhythmic beats
4. **Gradual Calm** (5s) - Harmonic transitions
5. **Stillness** (5s) - Return to ambient foundation

## Performance Monitoring

### ✅ Success Indicators
- Latency consistently below 50ms
- Audio visualization shows frequency activity
- No audio dropouts or glitches
- Smooth parameter transitions
- All 4 synthesis layers activate during test

### ⚠️ Warning Signs
- Latency above 50ms (performance issue)
- Audio cutting out (buffer underruns)
- Delayed response to movement (processing lag)
- Browser console errors (JavaScript issues)

## Testing with Real Kinect Data

### 1. Start C# Bridge Application
```bash
cd KinectBridge
dotnet run
```
Make sure Azure Kinect is connected.

### 2. Start Node.js Server
```bash
npm start
```

### 3. Test Movement Scenarios
Try these movements to test different layers:
- **Slow hand waves** → Melodic triggers
- **Arms spread wide/contracted** → Harmonic changes
- **Rhythmic movements** → Beat detection
- **Overall body motion** → Ambient foundation response

## Troubleshooting

### Audio Not Starting
- **Browser Permission**: Check for blocked audio autoplay
- **Web Audio Context**: Click "Start Audio" manually first
- **Console Errors**: Check browser developer tools

### High Latency
- **Processing Load**: Close other applications
- **Buffer Settings**: Audio context may need adjustment
- **Data Rate**: Check WebSocket connection stability

### No Sound Response
- **Movement Detection**: Verify skeleton data is arriving
- **Layer Activation**: Check that synthesis layers are enabled
- **Volume Levels**: Ensure master volume and layer volumes are up
- **Audio Routing**: Verify speakers/headphones are working

### Performance Issues
- **Frame Rate**: Should maintain 30 FPS for movement data
- **Memory Usage**: Monitor for memory leaks during extended operation
- **CPU Usage**: Audio synthesis is CPU-intensive

## Browser Compatibility

### ✅ Recommended Browsers
- **Chrome 66+** (best Web Audio API support)
- **Firefox 60+** (good compatibility)
- **Edge 79+** (Chromium-based)

### ⚠️ Limited Support
- **Safari** (Web Audio API limitations)
- **Mobile browsers** (performance constraints)

## Audio Configuration

### Low Latency Settings
The system is optimized for <50ms latency:
```javascript
Tone.context.lookAhead = 0.01; // 10ms lookahead
Tone.context.latencyHint = 'interactive';
```

### Buffer Management
- Movement data smoothing over 10 frames
- Exponential smoothing for stable parameters
- Trigger limiting to prevent audio overload

### Volume Levels
Default volumes optimized for museum environment:
- **Master**: 70%
- **Foundation**: 30%
- **Melodic**: 40%
- **Harmonic**: 25%
- **Rhythmic**: 30%

## Customization Points

### Musical Parameters
Edit `sound-engine.js` to adjust:
- **Scales**: Change melodic note sequences
- **Chords**: Modify harmonic progressions
- **Timing**: Adjust trigger thresholds and intervals
- **Effects**: Reverb, chorus, filtering parameters

### Movement Mapping
Modify how movement data controls sound:
- **Velocity Thresholds**: Minimum motion for triggers
- **Smoothing Factors**: Balance responsiveness vs stability
- **Range Mapping**: How movement values map to audio parameters

### Visual Integration
Synchronize audio-visual elements:
- **Color Mapping**: Link audio frequency to visual colors
- **Particle Behavior**: Make particles respond to audio
- **Beat Visualization**: Show rhythmic elements visually

## Next Steps

### Phase 2 Enhancements
1. **AI Musical Interpretation**: Pattern recognition for musical phrases
2. **Multiple Sound Environments**: Different sonic worlds to discover
3. **Social Interaction**: Enhanced multi-person features
4. **Museum Integration**: Proximity activation, staff controls

### Fine-Tuning
1. **Parameter Optimization**: Adjust for specific installation space
2. **Accessibility Features**: Visual feedback for hearing impaired
3. **Performance Optimization**: Extended operation stability
4. **User Testing**: Gather feedback from museum visitors

## Support

### Debug Information
Enable detailed logging by opening browser console and typing:
```javascript
window.soundEngine.debugMode = true;
```

### Common Issues
- **"AudioContext was not allowed to start"**: User interaction required
- **High CPU usage**: Reduce synthesis complexity or lower frame rate
- **Memory leaks**: Restart application after extended testing

### Performance Monitoring
Monitor these metrics during operation:
- **Audio latency**: <50ms target
- **Frame rate**: 30 FPS movement data
- **Memory usage**: Should be stable over time
- **CPU usage**: Depends on number of synthesis layers