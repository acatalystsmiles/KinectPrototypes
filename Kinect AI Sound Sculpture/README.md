# Movement Soundscape Installation - Technical README

## Project Overview

An interactive museum installation for Science Museum Oklahoma's SMart Space where visitors' body movements generate evolving ambient soundscapes. Using Azure Kinect depth sensing, the system interprets movement qualities through AI to create responsive, meditative sonic experiences.

## Core Concept

- **Primary Goal**: Transform human movement into musical expression through AI interpretation
- **Experience**: Visitors discover their movement creates unique sounds within an ambient landscape
- **Key Insight**: Movement becomes a language that AI translates into sound, creating a "juicy self-encounter" where visitors discover their unique movement signature

## Technical Architecture

### Hardware Setup

- **Sensor**: Microsoft Azure Kinect DK
- **Computer**: Windows PC with USB 3.0 for Kinect
- **Audio**: Speakers/headphones for ambient sound output
- **Display**: Large screen or projection for minimal visual feedback

### Software Stack

- **Kinect Integration**: Azure Kinect SDK + Body Tracking SDK
- **Bridge Application**: C# app streaming skeleton data via WebSocket
- **Server**: Node.js with Socket.io for real-time data handling
- **Frontend**: Web interface with Web Audio API/Tone.js
- **Movement Analysis**: JavaScript-based pattern recognition
- **Sound Engine**: Tone.js for synthesis and effects

## Data Pipeline

```
Azure Kinect → C# Bridge App → WebSocket (port 8080) → Node.js Server → Socket.io → Web Client
                                                                                      ↓
                                                                              Movement Analysis
                                                                                      ↓
                                                                              AI Interpretation
                                                                                      ↓
                                                                              Sound Generation
```

## Movement Metrics to Track

### Primary Metrics

- **Overall Motion**: Sum of all joint velocities
- **Hand Velocities**: Speed and acceleration of hand movements
- **Center of Mass**: Body sway and weight shifts
- **Body Expansion**: Distance between joints (open vs closed postures)
- **Vertical Movement**: Jumping, crouching, rising
- **Symmetry**: Bilateral vs unilateral movement

### Movement Qualities

- **Flowing vs Sharp**: Analyze acceleration patterns
- **Expansive vs Contracted**: Joint distance from center
- **Rhythmic vs Irregular**: FFT analysis of movement patterns
- **Smooth vs Jerky**: Jerk (rate of acceleration change)
- **Fast vs Slow**: Overall velocity measurements
- **Grounded vs Lifted**: Contact with floor, center of gravity

## Sound Design Specifications

### Ambient Foundation

- **Drone Base**: Continuous pad/texture always present
- **Key**: C major or modal (for accessibility)
- **Frequency Range**: 80Hz - 8kHz (full but not harsh)

### Movement-Responsive Layers

1. **Melodic Elements**: Triggered by hand movements
2. **Harmonic Swells**: Respond to body expansion/contraction
3. **Rhythmic Pulses**: Echo detected rhythmic patterns
4. **Textural Grains**: Multiply with more people present
5. **Filter Sweeps**: Follow vertical movement
6. **Reverb Space**: Expands with movement amplitude

### AI Interpretation Goals

- Don't just map movement to parameters directly
- Recognize "phrases" or gesture patterns
- Create call-and-response relationships
- Build harmonic progressions based on movement history
- Adjust complexity based on expertise (subtle for beginners, rich for dancers)

## Multi-Person Interaction

### Solo Experience

- Personal movement signature emerges
- Sound builds layers based on individual exploration
- More intimate, contemplative atmosphere

### Group Dynamics

- Each person gets a unique timbral identity
- Movements can harmonize or create counterpoint
- Collective energy affects overall soundscape intensity
- Possible "conductor" role for most active mover

## Visual Feedback Design

### Principles

- **Minimal**: Don't distract from movement and sound
- **Abstract**: No literal body representation
- **Responsive**: Clear connection to movement without being 1:1
- **Beautiful**: Aesthetically compelling but not overwhelming

### Suggested Approaches

- Particle systems that flow with movement
- Abstract shapes that grow/shrink with body expansion
- Color temperature shifts based on movement quality
- Subtle trails showing movement history
- Constellation patterns connecting multiple people

## Privacy & Ethics

### Data Handling

- **No Recording**: Never store video or depth images
- **Anonymous**: Only skeleton data, no facial recognition
- **Temporary**: Movement patterns cleared after each session
- **Transparent**: Clear signage about what's being sensed

### Visitor Comfort

- Works fully clothed at normal viewing distance
- No requirement to wear sensors
- Natural interaction without instructions
- Graceful handling when people enter/exit

## Development Phases

### Phase 1: Data Pipeline

- Set up Kinect to Node.js streaming
- Verify skeleton tracking accuracy
- Display raw joint data in browser
- Test with 1-3 people simultaneously

### Phase 2: Movement Analysis

- Implement movement quality detection
- Create movement history buffers
- Develop gesture recognition system
- Test pattern detection accuracy

### Phase 3: Sound Engine

- Build Tone.js ambient foundation
- Create parameter mapping system
- Implement basic movement-to-sound relationships
- Test sonic range and responsiveness

### Phase 4: AI Layer

- Develop pattern learning system
- Create musical interpretation algorithms
- Build call-and-response behaviors
- Implement adaptive complexity

### Phase 5: Polish

- Refine visual feedback
- Optimize performance
- Add calibration/reset mechanisms
- Create attract mode for idle state

## Testing Considerations

### Movement Scenarios to Test

- Subtle hand gestures
- Full body dancing
- Multiple people moving in sync
- One person still while others move
- Rapid movements vs slow tai chi
- Children's unpredictable movement
- Wheelchair users
- Different heights and body types

### Success Metrics

- Visitors naturally discover movement-sound relationship
- Extended engagement (>2 minutes average)
- Variation in movement exploration
- Social interaction and play
- Return visits to try new movements

## Code Architecture Guidelines

### Modularity

- Separate concerns: data input, analysis, sound generation
- Plugin architecture for different sound "environments"
- Swappable AI interpretation strategies
- Easy to adjust mappings without rebuilding

### Performance

- 60 FPS minimum for visual feedback
- <50ms latency from movement to sound
- Handle 5 simultaneous skeletons
- Graceful degradation if overloaded

### Debugging

- Visual overlay showing detected joints
- Real-time metrics display (velocities, qualities)
- Sound parameter visualization
- Recording/playback of movement data for testing

## Installation Requirements

### Physical Space

- Minimum 10' x 10' clear floor space
- Kinect mounted 6-8 feet high
- Speakers positioned for even coverage
- Ambient lighting (Kinect uses infrared)

### Museum Integration

- Start button or proximity activation
- Timeout after inactivity
- Volume controls for staff
- Emergency stop capability

## Future Expansions

- Machine learning on collected movement patterns
- Different sonic "worlds" to explore
- Collaborative composition recording
- Movement pattern sharing between visitors
- Integration with other exhibition stations

## Resources & References

### Azure Kinect Documentation

- [SDK Setup](https://docs.microsoft.com/en-us/azure/kinect-dk/)
- [Body Tracking Guide](https://docs.microsoft.com/en-us/azure/kinect-dk/body-sdk-download)

### Audio Libraries

- [Tone.js Documentation](https://tonejs.github.io/)
- [Web Audio API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

### Movement Analysis

- Laban Movement Analysis principles
- Musical gesture recognition research
- Dance technology artistic references

## Contact & Context

- **Institution**: Science Museum Oklahoma, SMart Space
- **Project**: Artist Residency exploring AI and attention
- **Budget**: $70k for materials and equipment
- **Timeline**: [Add your timeline]
- **Previous Work**: Exploration of attention as creative force, contemplative practice integration

## Key Design Philosophy

"What makes for a juicy self-encounter? That moment when you catch yourself in the act of being yourself - seeing your own patterns, discovering capacities you didn't know you had, or realizing you've been creating something you thought was just happening to you."

This installation aims to create that moment through movement and sound.