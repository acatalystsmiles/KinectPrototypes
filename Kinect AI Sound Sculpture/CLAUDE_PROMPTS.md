# Claude Code Prompts for Movement Soundscape Development

This document contains specific prompts to help efficiently develop each phase of the Movement Soundscape installation. Copy and paste these prompts to Claude Code to implement each feature systematically.

## Phase 1: Sound Generation Engine 🎵

### 1.1 Core Audio Architecture

**Prompt 1.1.1: Set up Web Audio API and Tone.js Integration**
```
I need to create a comprehensive sound generation system for my Kinect movement installation. Please:

1. Set up Tone.js in the existing web interface with proper Web Audio API configuration
2. Create a SoundEngine class that can receive movement data via Socket.io
3. Implement a low-latency audio context with proper buffer management
4. Add audio controls to the web interface (volume, mute, audio visualization)
5. Test the system with the existing movement data stream

The sound engine should be modular and ready to add multiple synthesis layers. Please ensure <50ms latency between movement data and audio response.
```

**Prompt 1.1.2: Create Ambient Drone Foundation**
```
Building on the existing Tone.js setup, please create an ambient drone foundation layer that:

1. Provides a continuous pad/texture in C major/modal scales (80Hz-8kHz range)
2. Responds to overall energy levels from the movement metrics
3. Has smooth parameter transitions to avoid audio artifacts
4. Includes a reverb space that expands/contracts with movement amplitude
5. Can be controlled independently from other sound layers

Use the existing movement metrics (energyLevel, averageMotion) to drive the drone parameters. The foundation should be subtle but always present.
```

### 1.2 Movement-Responsive Sound Layers

**Prompt 1.2.1: Implement Hand Movement Melodic Triggers**
```
Please add a melodic layer to the sound engine that:

1. Triggers notes based on hand velocity data from the movement analysis
2. Uses pentatonic or modal scales for accessibility
3. Maps left/right hand velocities to different note ranges or timbres
4. Includes note filtering to prevent overly rapid triggering
5. Has musical phrases that build and release tension

Use the existing handVelocities data from the movement metrics. The melodies should feel responsive but musical, not just data sonification.
```

**Prompt 1.2.2: Create Body Expansion Harmonic Control**
```
Add a harmonic layer that responds to body expansion/contraction:

1. Use the bodyExpansion metric to control chord density and brightness
2. More expansion = richer harmonies, more contraction = simpler chords
3. Smooth transitions between harmonic states
4. Compatible with the existing drone foundation in C major/modal
5. Include visual feedback showing the current harmonic state

The harmony should enhance the ambient foundation without overwhelming it. Consider using pad synthesizers or string-like timbres.
```

### 1.3 Multi-Person Audio Features

**Prompt 1.3.1: Implement Individual Timbral Identity**
```
Extend the sound engine to handle multiple people with unique timbral identities:

1. Assign different instrument timbres to each tracked body (use the body ID)
2. Create spatial panning based on body position (X coordinate)
3. Each person's movements contribute to their own melodic/harmonic layer
4. Implement cross-mixing so people can influence each other's sounds
5. Show visual indicators of each person's sound identity

Use the existing body tracking data structure. Ensure the system gracefully handles people entering/leaving the scene.
```

## Phase 2: Enhanced Visual Feedback 🎨

### 2.1 Particle System Integration

**Prompt 2.1.1: Create Movement-Responsive Particle System**
```
Please enhance the existing web visualization with a particle system that:

1. Generates particles that flow with hand and body movements
2. Uses the existing movement trails data as input
3. Particles have lifespan, velocity, and color that respond to movement quality
4. Integrates smoothly with the existing skeleton visualization
5. Performance-optimized for real-time rendering

Use Canvas 2D or WebGL for the particle rendering. The particles should enhance the movement visualization without overwhelming the skeleton display.
```

**Prompt 2.1.2: Add Color Temperature and Visual Mood**
```
Add dynamic color systems to the visualization that respond to movement qualities:

1. Color temperature shifts based on movement quality metrics (flowing vs sharp)
2. Background gradient that responds to energy levels
3. Joint/bone colors that reflect individual movement characteristics
4. Smooth color transitions to avoid jarring changes
5. Accessibility considerations for color-blind users

Use the existing movementQuality metrics from the movement analyzer. The color system should reinforce the audio-visual connection.
```

### 2.2 Audio-Visual Synchronization

**Prompt 2.2.1: Synchronize Visual Elements with Audio**
```
Create synchronized audio-visual elements that:

1. Visual beats/pulses that sync with detected rhythmic patterns
2. Visual harmony representation (color palettes) that match audio harmony
3. Particle behavior that responds to audio frequency content
4. Visual spatial elements that match audio panning
5. Real-time audio analysis for visual synchronization

This should create a strong connection between the movement, sound, and visual elements. Use Web Audio API's AnalyserNode for real-time audio analysis.
```

## Phase 3: AI Movement Interpretation 🧠

### 3.1 Pattern Recognition

**Prompt 3.1.1: Build Gesture Recognition System**
```
Please create an AI pattern recognition system for movement analysis:

1. Implement gesture sequence detection using the existing movement history
2. Create a library of common movement patterns (wave, reach, crouch, etc.)
3. Use machine learning or pattern matching to classify movements
4. Build "movement phrases" from individual gestures
5. Store and recognize personal movement signatures within a session

Use the existing movement analyzer's history data. The system should recognize meaningful movement patterns, not just individual poses.
```

**Prompt 3.1.2: Implement Musical Intelligence Layer**
```
Create a musical intelligence system that:

1. Applies music theory rules to movement-to-sound translation
2. Creates musical phrases from movement phrases
3. Builds and resolves musical tension based on movement patterns
4. Develops musical themes/motifs from repeated movement patterns
5. Adapts musical complexity based on movement sophistication

This should sit between the movement analysis and sound generation, making the audio more musical and less directly data-driven.
```

### 3.2 Adaptive Learning

**Prompt 3.2.1: Build Visitor Profiling System**
```
Implement an adaptive system that profiles visitor movement characteristics:

1. Analyze movement complexity and style to determine visitor "expertise"
2. Adjust sound complexity and responsiveness accordingly
3. Learn individual movement patterns within a session
4. Provide more sophisticated responses for experienced movers
5. Keep beginners engaged with simpler, more obvious responses

The system should enhance the experience for both casual visitors and movement professionals like dancers.
```

## Phase 4: Installation-Ready Features 🏛️

### 4.1 Museum Integration

**Prompt 4.1.1: Create Proximity Activation System**
```
Please implement museum-ready activation and management features:

1. Proximity detection to automatically start/stop the experience
2. Attract mode with beautiful idle visuals and ambient sound
3. Session management with clear transitions between visitors
4. Timeout handling with gradual fade-out after inactivity
5. Staff controls for volume, emergency stop, and system reset

Use the existing body detection to trigger activation. The system should feel welcoming and handle visitor flow gracefully.
```

**Prompt 4.1.2: Add Health Monitoring and Analytics**
```
Create a system monitoring and analytics dashboard:

1. Real-time system health monitoring (FPS, latency, connection status)
2. Usage analytics (session duration, number of visitors, popular movements)
3. Error logging and notification system
4. Performance metrics dashboard for museum staff
5. Simple troubleshooting interface

This should help museum staff maintain the installation and understand visitor engagement patterns.
```

### 4.2 Accessibility and Comfort

**Prompt 4.2.1: Implement Accessibility Features**
```
Add accessibility features to make the installation inclusive:

1. Visual feedback for hearing-impaired visitors
2. Alternative interaction methods for wheelchair users
3. Adjustments for different heights and body types
4. Clear privacy indicators and data handling transparency
5. Graceful handling of partial occlusion or poor tracking

The system should work beautifully for visitors of all abilities and provide clear feedback about what's being sensed.
```

## Phase 5: Advanced Features 🚀

### 5.1 Multiple Sound Environments

**Prompt 5.1.1: Create Multiple Sound Worlds**
```
Implement a system for multiple discoverable sound environments:

1. Create 3-5 different sonic "worlds" with distinct characteristics
2. Allow visitors to discover new environments through specific movements
3. Smooth transitions between environments
4. Visual indicators of which environment is active
5. Each environment uses the same movement data but creates different musical responses

Examples: Forest (organic, natural sounds), Space (ethereal, ambient), Ocean (flowing, rhythmic), Urban (rhythmic, electronic), Classical (orchestral, harmonic).
```

### 5.2 Social Interaction Features

**Prompt 5.2.1: Implement Collaborative Features**
```
Add advanced multi-person interaction capabilities:

1. Detect when people are moving in coordination
2. Special audio-visual responses for synchronized movement
3. "Duet modes" for two people with complementary sounds
4. Group choreography detection and response
5. Ability to "teach" the system new movement patterns through repetition

This should encourage social interaction and collaborative exploration of the movement-sound space.
```

## General Development Prompts

### Code Organization

**Prompt: Modular Architecture Review**
```
Please review the current codebase and refactor for better modularity:

1. Separate concerns between movement analysis, sound generation, and visualization
2. Create plugin architecture for different sound "environments"
3. Make the system easily configurable without rebuilding
4. Add comprehensive error handling and graceful degradation
5. Optimize performance for real-time operation with multiple users

Focus on maintainability and extensibility for museum deployment.
```

### Testing and Quality Assurance

**Prompt: Comprehensive Testing Suite**
```
Create a comprehensive testing system for the installation:

1. Unit tests for movement analysis algorithms
2. Integration tests for the complete data pipeline
3. Performance tests for multi-person scenarios
4. Automated testing with recorded movement data
5. Load testing for extended operation

Include test data generators and automated test runners. The system needs to be rock-solid for museum deployment.
```

### Documentation and Deployment

**Prompt: Deployment Documentation**
```
Create comprehensive deployment and maintenance documentation:

1. Installation setup guide for museum technicians
2. Troubleshooting guide for common issues
3. Calibration procedures for different spaces
4. Performance optimization guide
5. Emergency procedures and contact information

The documentation should enable museum staff to successfully deploy and maintain the installation independently.
```

## Usage Tips for Claude Code

### When Using These Prompts:

1. **Context Setup**: Before using any prompt, ensure Claude has read the current codebase with the Read tool

2. **Incremental Development**: Use one prompt at a time and test each feature before moving to the next

3. **Customization**: Adapt prompts based on your specific needs and space requirements

4. **Error Handling**: Always ask Claude to include comprehensive error handling and user feedback

5. **Performance**: Emphasize real-time performance requirements in audio-related prompts

6. **Integration**: When adding new features, ask Claude to ensure compatibility with existing systems

### Example Usage:
```
[First read the current codebase]
Then: "Using the existing movement analysis system, [paste prompt 1.1.1 here]"
```

### Troubleshooting Prompts:

**If audio has latency issues:**
```
The audio system has latency issues. Please analyze the current implementation and optimize for <50ms response time. Focus on Web Audio API configuration, buffer management, and synthesis efficiency.
```

**If visualization performance is poor:**
```
The real-time visualization is dropping frames with multiple people. Please optimize the rendering pipeline, implement efficient particle systems, and add performance monitoring.
```

**If movement tracking is inaccurate:**
```
The movement analysis seems to miss certain gestures or movements. Please review the pattern recognition algorithms and improve gesture detection accuracy while maintaining real-time performance.
```

These prompts are designed to systematically build the complete installation while maintaining code quality and performance standards throughout the development process.