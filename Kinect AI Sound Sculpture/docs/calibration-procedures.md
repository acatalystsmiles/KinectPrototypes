# Calibration Procedures
## Kinect Sound Sculpture - Space Configuration

> **Version:** 2.0.0
> **Last Updated:** September 2025
> **Target Audience:** Museum technicians, installation managers

---

## 📋 Table of Contents
1. [Calibration Overview](#calibration-overview)
2. [Pre-Calibration Setup](#pre-calibration-setup)
3. [Kinect Sensor Calibration](#kinect-sensor-calibration)
4. [Tracking Area Definition](#tracking-area-definition)
5. [Audio Spatial Calibration](#audio-spatial-calibration)
6. [Multi-Person Interaction Tuning](#multi-person-interaction-tuning)
7. [Environment Sensitivity Adjustment](#environment-sensitivity-adjustment)
8. [Performance Optimization](#performance-optimization)
9. [Space-Specific Configurations](#space-specific-configurations)
10. [Validation and Testing](#validation-and-testing)

---

## 🎯 Calibration Overview

### Purpose
Calibration ensures the Kinect Sound Sculpture system performs optimally in your specific installation space, accounting for:
- Physical space dimensions and layout
- Acoustic properties
- Lighting conditions
- Visitor traffic patterns
- Museum requirements

### Calibration Components
1. **Kinect Sensor Positioning** - Optimal tracking coverage
2. **Tracking Boundaries** - Define participant interaction area
3. **Audio Spatial Mapping** - Sound positioning and movement
4. **Interaction Sensitivity** - Gesture and coordination detection
5. **Performance Tuning** - Optimize for space and visitor load

### Time Requirements
- **Basic Calibration:** 30-45 minutes
- **Advanced Calibration:** 1-2 hours
- **Space-Specific Tuning:** 2-4 hours

---

## 🔧 Pre-Calibration Setup

### Required Tools
- [ ] Measuring tape (minimum 5m)
- [ ] Laser pointer or marking tool
- [ ] Laptop/tablet for calibration interface
- [ ] Audio level meter (smartphone app acceptable)
- [ ] 2-3 test participants for validation
- [ ] Notepad for recording measurements

### Environmental Assessment

**Document Current Conditions:**
```
Space Dimensions:
Width: _______ m    Length: _______ m    Height: _______ m

Kinect Position:
Height: _______ m   Angle: _______ °    Distance from center: _______ m

Lighting:
Natural light sources: _________________________________
Artificial lighting: __________________________________
Potential interference: _______________________________

Acoustics:
Ceiling type: ____________________________________
Wall materials: __________________________________
Background noise level: _______ dB
Reverb characteristics: ___________________________

Visitor Patterns:
Expected group size: _______ people
Peak times: _____________________________________
Average visit duration: _______ minutes
```

### System Verification

```bash
# Ensure system is running
npm start

# Verify all components active
npm run diagnostics:quick

# Access calibration interface
# Navigate to: http://localhost:3000/calibration
# Password: museum2024 (default)
```

---

## 📷 Kinect Sensor Calibration

### Step 1: Optimal Positioning Assessment

**Height Optimization:**
```
Test Heights:
2.5m: ☐ Tested  Coverage: _____ m²  Quality: _____/10
2.7m: ☐ Tested  Coverage: _____ m²  Quality: _____/10
3.0m: ☐ Tested  Coverage: _____ m²  Quality: _____/10

Recommended Height: _______ m
Reason: _________________________________
```

**Angle Adjustment:**
```
Test Angles:
15°:  ☐ Tested  Edge tracking: _____/10  Center quality: _____/10
20°:  ☐ Tested  Edge tracking: _____/10  Center quality: _____/10
25°:  ☐ Tested  Edge tracking: _____/10  Center quality: _____/10
30°:  ☐ Tested  Edge tracking: _____/10  Center quality: _____/10

Recommended Angle: _______ °
```

### Step 2: Tracking Quality Verification

**Coverage Test:**
1. Access calibration interface: `http://localhost:3000/calibration`
2. Select "Tracking Coverage Test"
3. Have test participant move to each marked position:

```
Grid Test Pattern:
   1     2     3
   |     |     |
   4  Center  5
   |     |     |
   6     7     8

Position Test Results:
1: ☐ Good  ☐ Fair  ☐ Poor    5: ☐ Good  ☐ Fair  ☐ Poor
2: ☐ Good  ☐ Fair  ☐ Poor    6: ☐ Good  ☐ Fair  ☐ Poor
3: ☐ Good  ☐ Fair  ☐ Poor    7: ☐ Good  ☐ Fair  ☐ Poor
4: ☐ Good  ☐ Fair  ☐ Poor    8: ☐ Good  ☐ Fair  ☐ Poor
Center: ☐ Good  ☐ Fair  ☐ Poor
```

**Quality Metrics:**
- **Good:** Stable skeleton, confidence >80%, all joints tracked
- **Fair:** Occasional joint loss, confidence 60-80%
- **Poor:** Frequent tracking loss, confidence <60%

### Step 3: Environmental Interference Check

**Lighting Interference:**
```bash
# Test different lighting conditions
# Morning/Afternoon/Evening if applicable

Time: _______ Lighting: _____________ Quality: _____/10
Time: _______ Lighting: _____________ Quality: _____/10
Time: _______ Lighting: _____________ Quality: _____/10

Issues Identified:
☐ Direct sunlight interference
☐ Reflective surface interference
☐ Insufficient ambient light
☐ Infrared interference from other devices
```

---

## 🎯 Tracking Area Definition

### Step 1: Physical Boundary Mapping

**Safety Boundaries:**
1. Mark safe interaction area with tape/markers
2. Define minimum clearances:
   - Walls: 1m minimum
   - Objects: 0.5m minimum
   - Other installations: 2m minimum

**Optimal Interaction Zone:**
```
Recommended Tracking Area:
Small Space (< 16m²):    2m × 2m center area
Medium Space (16-36m²):  3m × 3m center area
Large Space (> 36m²):    4m × 4m center area

Your Space Configuration:
Total area: _______ m²
Tracking area: _______ m × _______ m
Center point coordinates: (_____, _____)
```

### Step 2: Digital Boundary Configuration

**In Calibration Interface:**
1. Select "Define Tracking Boundaries"
2. Mark four corners of interaction area
3. Set height boundaries (floor and ceiling detection)

```javascript
// Boundary Configuration Example
{
  "trackingArea": {
    "corners": [
      {"x": -2.0, "y": 0, "z": 1.5},  // Front-left
      {"x": 2.0, "y": 0, "z": 1.5},   // Front-right
      {"x": 2.0, "y": 0, "z": 4.5},   // Back-right
      {"x": -2.0, "y": 0, "z": 4.5}   // Back-left
    ],
    "heightLimits": {
      "floor": 0.0,
      "ceiling": 3.0
    }
  }
}
```

### Step 3: Edge Behavior Configuration

**Boundary Crossing Behavior:**
```javascript
"boundarySettings": {
  "softEdge": 0.3,        // 30cm soft boundary
  "fadeDistance": 0.5,    // Fade audio over 50cm
  "exitDelay": 2000,      // 2 second delay before exit
  "reentryDelay": 1000    // 1 second delay for reentry
}
```

**Test Edge Behavior:**
- Walk to each boundary edge
- Verify smooth audio transitions
- Test rapid entry/exit scenarios

---

## 🔊 Audio Spatial Calibration

### Step 1: Speaker System Configuration

**Speaker Layout Documentation:**
```
Speaker Configuration: ☐ Stereo  ☐ 5.1 Surround  ☐ 7.1 Surround  ☐ Custom

Speaker Positions (measured from center):
Front Left:     X: _____ Y: _____ Z: _____
Front Right:    X: _____ Y: _____ Z: _____
Center:         X: _____ Y: _____ Z: _____
Rear Left:      X: _____ Y: _____ Z: _____
Rear Right:     X: _____ Y: _____ Z: _____
Subwoofer:      X: _____ Y: _____ Z: _____
```

**Physical Measurement:**
- Use measuring tape from tracking area center
- Record speaker angles and distances
- Note any acoustic obstacles

### Step 2: Audio Mapping Configuration

**Configure Speaker Positions:**
```javascript
// Audio spatial configuration
{
  "audio": {
    "spatialAudio": true,
    "speakers": {
      "layout": "stereo",  // or "surround_5.1"
      "calibration": {
        "frontLeft": {"x": -2.5, "y": 2.0, "z": 0.0},
        "frontRight": {"x": 2.5, "y": 2.0, "z": 0.0}
      }
    }
  }
}
```

### Step 3: Audio Level Calibration

**Base Volume Setting:**
1. Access audio test: `http://localhost:3000/audio-test`
2. Play test tone at center position
3. Measure audio level with meter

```
Target Audio Levels:
Ambient/Background:    50-60 dB
Normal Activity:       65-75 dB
Peak Activity:         75-85 dB
Maximum (Emergency):   90 dB

Your Measurements:
Base Volume (60%):     _____ dB
Active Volume (80%):   _____ dB
Peak Volume (95%):     _____ dB
```

**Spatial Audio Test:**
1. Play moving test tone
2. Walk through tracking area
3. Verify smooth audio positioning

```
Spatial Test Results:
Center Position:     ☐ Accurate  ☐ Needs adjustment
Front Edge:          ☐ Accurate  ☐ Needs adjustment
Back Edge:           ☐ Accurate  ☐ Needs adjustment
Left Edge:           ☐ Accurate  ☐ Needs adjustment
Right Edge:          ☐ Accurate  ☐ Needs adjustment

Notes: ________________________________
```

### Step 4: Acoustic Environment Tuning

**Reverb and Echo Management:**
```javascript
"audioEnvironment": {
  "roomSize": "medium",        // small, medium, large
  "reverbAmount": 0.3,         // 0.0 to 1.0
  "echoDelay": 150,           // milliseconds
  "dampening": 0.7            // 0.0 to 1.0
}
```

**Test Different Settings:**
- Play complex audio sequence
- Adjust reverb for space
- Test with multiple participants

---

## 👥 Multi-Person Interaction Tuning

### Step 1: Coordination Detection Sensitivity

**Basic Coordination Test:**
1. Two participants perform synchronized movements
2. Monitor coordination detection in real-time
3. Adjust sensitivity based on results

```javascript
"multiPerson": {
  "coordination": {
    "threshold": 0.6,           // Adjust based on test results
    "syncWindow": 1200,         // Time window for sync detection
    "minDuration": 2000,        // Minimum coordination time
    "maxDistance": 3.0          // Maximum distance between participants
  }
}
```

**Coordination Test Results:**
```
Test Scenarios:
Mirror Movements:        Detected: ____/10  False Positives: ____
Synchronized Clapping:   Detected: ____/10  False Positives: ____
Walking Together:        Detected: ____/10  False Positives: ____
Independent Movement:    Detected: ____/10  (Should be 0)

Recommended Threshold: _______ (0.0-1.0)
```

### Step 2: Duet Mode Configuration

**Duet Sensitivity Tuning:**
```javascript
"duetModes": {
  "enabled": true,
  "autoActivation": true,
  "compatibilityThreshold": 0.65,    // Adjust based on testing
  "activationDelay": 3000,           // Time before duet mode starts
  "minParticipationTime": 5000       // Minimum duet duration
}
```

**Duet Test Protocol:**
1. Two participants enter space
2. Perform complementary movements
3. Verify duet mode activation

```
Duet Test Results:
Mode: "Mirror Dance"     Activation Time: _____ s  Quality: ____/10
Mode: "Call Response"    Activation Time: _____ s  Quality: ____/10
Mode: "Harmony"          Activation Time: _____ s  Quality: ____/10
Mode: "Counterpoint"     Activation Time: _____ s  Quality: ____/10

Notes: ________________________________
```

### Step 3: Group Choreography Settings

**Group Interaction Tuning:**
```javascript
"groupChoreography": {
  "enabled": true,
  "minParticipants": 3,              // Adjust for your space
  "detectionSensitivity": 0.7,       // Group movement sensitivity
  "leaderFollowerRatio": 0.6,        // Leader detection threshold
  "groupCohesionThreshold": 0.8      // How tight group must be
}
```

**Group Test with 3+ Participants:**
- Test leader-follower dynamics
- Verify group cohesion detection
- Adjust thresholds based on visitor behavior

---

## 🌍 Environment Sensitivity Adjustment

### Step 1: Gesture Recognition Tuning

**Environment Trigger Gestures:**
```
Gesture: "Reaching Up" (Forest Environment)
Recognition Rate: ____/10 attempts
False Positive Rate: ____/10 non-gestures
Recommended Sensitivity: _______ (0.0-1.0)

Gesture: "Circular Motion" (Space Environment)
Recognition Rate: ____/10 attempts
False Positive Rate: ____/10 non-gestures
Recommended Sensitivity: _______ (0.0-1.0)

Gesture: "Gentle Wave" (Ocean Environment)
Recognition Rate: ____/10 attempts
False Positive Rate: ____/10 non-gestures
Recommended Sensitivity: _______ (0.0-1.0)
```

### Step 2: Environment Transition Timing

**Transition Configuration:**
```javascript
"environments": {
  "autoTransition": true,
  "transitionDuration": 3000,        // 3 second transitions
  "gestureRequirement": 3,           // Gestures needed to unlock
  "discoveryTimeout": 30000,         // 30 seconds to complete discovery
  "cooldownPeriod": 10000           // 10 seconds between transitions
}
```

**Test Environment Transitions:**
1. Perform required gestures for each environment
2. Verify smooth audio/visual transitions
3. Test rapid environment switching

### Step 3: Visitor Behavior Adaptation

**Typical Visitor Patterns:**
```
Visitor Type: Children (5-12 years)
Movement Style: ☐ Fast ☐ Erratic ☐ Energetic ☐ Curious
Recommended Settings: High sensitivity, fast transitions

Visitor Type: Adults (20-60 years)
Movement Style: ☐ Deliberate ☐ Cautious ☐ Explorative ☐ Social
Recommended Settings: Medium sensitivity, medium transitions

Visitor Type: Seniors (60+ years)
Movement Style: ☐ Slow ☐ Careful ☐ Limited range ☐ Observational
Recommended Settings: Low sensitivity, slow transitions

Your Primary Audience: _________________
Recommended Configuration: _____________
```

---

## ⚡ Performance Optimization

### Step 1: System Performance Baseline

**Performance Metrics Collection:**
```bash
# Run performance test
npm run test:performance

# Record baseline metrics
Target FPS: 60
Actual FPS: _______
Memory Usage: _______ MB
CPU Usage: _______ %
Audio Latency: _______ ms
Response Time: _______ ms
```

### Step 2: Quality vs Performance Tuning

**Visual Quality Settings:**
```javascript
"visual": {
  "particles": {
    "count": 750,              // Reduce for lower-end systems
    "trails": true,            // Disable for performance
    "trailLength": 40,         // Reduce for performance
    "quality": "high"          // high, medium, low
  },
  "effects": {
    "coordination": true,       // Disable if not needed
    "duetAuras": true,         // Disable for performance
    "environmentTransitions": true
  }
}
```

**Performance Optimization Steps:**
1. Test with maximum expected participants
2. Monitor frame rate and memory usage
3. Adjust quality settings if performance drops

```
Performance Test Results:
1 Participant:  FPS: _____  Memory: _____ MB
2 Participants: FPS: _____  Memory: _____ MB
4 Participants: FPS: _____  Memory: _____ MB
6 Participants: FPS: _____  Memory: _____ MB

Performance Issues: ☐ None ☐ Minor ☐ Significant
Optimization Needed: ☐ None ☐ Visual ☐ Audio ☐ Processing
```

### Step 3: Adaptive Quality Configuration

**Automatic Performance Adjustment:**
```javascript
"system": {
  "adaptiveQuality": {
    "enabled": true,
    "targetFPS": 55,
    "qualityLevels": 5,
    "adjustmentSpeed": "medium"
  }
}
```

---

## 🏛️ Space-Specific Configurations

### Small Gallery Space (< 25m²)

**Recommended Configuration:**
```javascript
{
  "trackingArea": {
    "size": "2x2m",
    "maxParticipants": 3
  },
  "audio": {
    "masterVolume": 0.6,
    "spatialRange": 2.0
  },
  "multiPerson": {
    "coordination": {
      "threshold": 0.7,
      "maxDistance": 2.0
    }
  },
  "performance": {
    "particles": 300,
    "quality": "medium"
  }
}
```

### Medium Exhibition Hall (25-100m²)

**Recommended Configuration:**
```javascript
{
  "trackingArea": {
    "size": "3x3m",
    "maxParticipants": 4
  },
  "audio": {
    "masterVolume": 0.7,
    "spatialRange": 3.0
  },
  "multiPerson": {
    "coordination": {
      "threshold": 0.6,
      "maxDistance": 3.0
    }
  },
  "performance": {
    "particles": 500,
    "quality": "high"
  }
}
```

### Large Dedicated Space (> 100m²)

**Recommended Configuration:**
```javascript
{
  "trackingArea": {
    "size": "4x4m",
    "maxParticipants": 6
  },
  "audio": {
    "masterVolume": 0.8,
    "spatialRange": 4.0
  },
  "multiPerson": {
    "coordination": {
      "threshold": 0.5,
      "maxDistance": 4.0
    }
  },
  "performance": {
    "particles": 750,
    "quality": "high"
  }
}
```

### Special Considerations

**High Traffic Areas:**
- Reduce environment transition sensitivity
- Increase coordination thresholds
- Enable rapid reset between visitors

**Quiet Zones:**
- Reduce maximum volume levels
- Increase gesture requirements
- Add volume-based time-of-day adjustments

**Children's Areas:**
- Increase gesture sensitivity
- Reduce coordination complexity
- Enable simpler interaction modes

---

## ✅ Validation and Testing

### Comprehensive System Validation

**Pre-Validation Checklist:**
- [ ] All calibration steps completed
- [ ] Configuration saved and backed up
- [ ] System restart completed
- [ ] Performance test passed

### User Experience Testing

**Single Visitor Test:**
```
Test Scenario: Individual exploration
Duration: 10 minutes
Observer: _________________

Tracking Quality:     ☐ Excellent ☐ Good ☐ Fair ☐ Poor
Audio Response:       ☐ Excellent ☐ Good ☐ Fair ☐ Poor
Environment Changes:  ☐ Excellent ☐ Good ☐ Fair ☐ Poor
Overall Experience:   ☐ Excellent ☐ Good ☐ Fair ☐ Poor

Notes: ________________________________
```

**Multi-Visitor Test:**
```
Test Scenario: 2-4 visitors, mixed ages
Duration: 15 minutes
Observers: _________________

Coordination Detection: ☐ Excellent ☐ Good ☐ Fair ☐ Poor
Duet Mode Activation:   ☐ Excellent ☐ Good ☐ Fair ☐ Poor
Group Interactions:     ☐ Excellent ☐ Good ☐ Fair ☐ Poor
System Performance:     ☐ Excellent ☐ Good ☐ Fair ☐ Poor

Notes: ________________________________
```

### Performance Validation

**System Stress Test:**
```bash
# Run extended performance test
npm run test:load

# Monitor for 30 minutes with maximum participants
# Record any performance degradation
```

**Results Documentation:**
```
Stress Test Results:
Start FPS: _______    End FPS: _______
Start Memory: _____ MB    End Memory: _____ MB
Errors Encountered: _______
System Stability: ☐ Excellent ☐ Good ☐ Fair ☐ Poor
```

### Final Validation Sign-off

**Technical Validation:**
- [ ] All systems responding correctly
- [ ] Performance within acceptable limits
- [ ] No error conditions present
- [ ] Backup configuration created

**User Experience Validation:**
- [ ] Intuitive interaction for visitors
- [ ] Appropriate audio levels for space
- [ ] Engaging multi-person experiences
- [ ] Safe and accessible for all users

**Documentation:**
- [ ] Calibration settings recorded
- [ ] Custom configurations backed up
- [ ] Staff training materials updated
- [ ] Maintenance schedule established

---

## 📝 Calibration Report Template

**Installation:** _________________________________
**Date:** _______________
**Calibrated By:** _________________________________

### System Configuration
- **Kinect Position:** Height: _____ Angle: _____ Location: __________
- **Tracking Area:** _____ m × _____ m
- **Audio System:** _________________________________
- **Max Participants:** _______

### Calibration Results
- **Tracking Quality:** ☐ Excellent ☐ Good ☐ Acceptable ☐ Needs Work
- **Audio Spatial:** ☐ Excellent ☐ Good ☐ Acceptable ☐ Needs Work
- **Multi-Person:** ☐ Excellent ☐ Good ☐ Acceptable ☐ Needs Work
- **Performance:** ☐ Excellent ☐ Good ☐ Acceptable ☐ Needs Work

### Custom Settings Applied
```javascript
// Record any custom configuration changes
{
  "tracking": {
    // Custom tracking settings
  },
  "audio": {
    // Custom audio settings
  },
  "interaction": {
    // Custom interaction settings
  }
}
```

### Recommendations
_________________________________________________
_________________________________________________

### Next Calibration Due: _______________

**Signature:** _________________________________
**Date:** _______________

---

*This calibration should be repeated whenever the installation is moved, after significant environmental changes, or every 6 months for optimal performance.*