# Troubleshooting Guide
## Kinect Sound Sculpture - Problem Resolution

> **Version:** 2.0.0
> **Last Updated:** September 2025
> **Target Audience:** Museum staff, technicians, support personnel

---

## 📋 Table of Contents
1. [Quick Problem Resolution](#quick-problem-resolution)
2. [Kinect Hardware Issues](#kinect-hardware-issues)
3. [Audio System Problems](#audio-system-problems)
4. [Software and Application Issues](#software-and-application-issues)
5. [Performance and Lag Issues](#performance-and-lag-issues)
6. [Network and Connectivity Problems](#network-and-connectivity-problems)
7. [Multi-Person Interaction Issues](#multi-person-interaction-issues)
8. [Environment and Calibration Problems](#environment-and-calibration-problems)
9. [Emergency Procedures](#emergency-procedures)
10. [Diagnostic Tools and Logs](#diagnostic-tools-and-logs)

---

## 🚨 Quick Problem Resolution

### Most Common Issues (90% of problems)

| Problem | Quick Fix | Time |
|---------|-----------|------|
| No sound | Check volume, restart audio | 2 min |
| Kinect not working | Check USB connection, restart app | 3 min |
| Laggy performance | Restart application | 2 min |
| No movement detection | Check Kinect positioning | 5 min |
| System frozen | Force restart, check logs | 5 min |

### Emergency Reset Procedure

**If nothing else works:**
```bash
# 1. Stop the application
Ctrl+C (or close application window)

# 2. Restart the system
npm start

# 3. If system is completely frozen
# Power cycle the computer (last resort)
```

---

## 📷 Kinect Hardware Issues

### Problem: Kinect Not Detected

**Symptoms:**
- Error message: "Kinect device not found"
- No skeleton tracking visible
- Red light on Kinect sensor

**Solutions:**

1. **Check Physical Connections:**
   ```bash
   # Verify Kinect is connected
   lsusb | grep Microsoft  # Linux
   # or Device Manager → Universal Serial Bus → Azure Kinect # Windows
   ```
   - Ensure USB 3.0 cable is firmly connected
   - Try a different USB 3.0 port
   - Check power adapter connection

2. **Driver Issues (Windows):**
   - Open Device Manager
   - Look for "Azure Kinect DK" under "Azure Kinect"
   - If showing warning: Update driver
   - Restart computer after driver update

3. **SDK Issues:**
   ```bash
   # Test Kinect with official tools
   k4aviewer  # Should show camera feeds
   ```

**Still Not Working?**
- Replace USB cable (most common cause)
- Test with different computer
- Contact support with Kinect serial number

### Problem: Poor Tracking Quality

**Symptoms:**
- Skeleton tracking intermittent
- Joints jumping or disconnected
- Low confidence scores

**Solutions:**

1. **Lighting Conditions:**
   - Avoid direct sunlight on sensor
   - Ensure adequate ambient lighting
   - Remove reflective surfaces from tracking area

2. **Kinect Positioning:**
   ```
   Optimal Setup:
   Height: 2.5-3.0m above floor
   Angle: 15-30° downward
   Distance: 1.5-5m from participants
   ```

3. **Environmental Factors:**
   - Remove mirrors or reflective surfaces
   - Ensure stable mounting (no vibration)
   - Check for interfering infrared sources

4. **Calibration Reset:**
   ```bash
   # Access calibration interface
   http://localhost:3000/calibration
   # Follow recalibration steps
   ```

### Problem: Kinect Overheating

**Symptoms:**
- Kinect becomes hot to touch
- Tracking stops after 30+ minutes
- Error messages about thermal protection

**Solutions:**
- Ensure adequate ventilation around Kinect
- Check ambient temperature (should be <25°C)
- Reduce continuous operation time
- Contact support if persistent

---

## 🔊 Audio System Problems

### Problem: No Audio Output

**Symptoms:**
- Visual feedback working but no sound
- Participants moving but silence

**Solutions:**

1. **Basic Audio Checks:**
   ```bash
   # Check system volume
   # Windows: Volume mixer
   # Linux: alsamixer or pavucontrol

   # Test audio with simple sound
   npm run test:audio
   ```

2. **Audio Device Configuration:**
   - Verify correct audio output device selected
   - Check audio cable connections
   - Test with headphones directly connected

3. **Application Audio Settings:**
   ```javascript
   // Check config: public/config/config.json
   {
     "audio": {
       "enabled": true,           // Must be true
       "masterVolume": 0.7,       // 0.0 to 1.0
       "device": "default"        // or specific device
     }
   }
   ```

### Problem: Audio Distortion or Crackling

**Symptoms:**
- Sound cutting in and out
- Static or digital noise
- Audio delayed or choppy

**Solutions:**

1. **Buffer Size Adjustment:**
   ```javascript
   // In config file
   "audio": {
     "bufferSize": 2048,  // Try 1024, 2048, or 4096
     "sampleRate": 44100  // Standard rate
   }
   ```

2. **Performance Issues:**
   - Close other audio applications
   - Check CPU usage (should be <70%)
   - Restart audio system:
     ```bash
     # Windows
     # Restart "Windows Audio" service

     # Linux
     sudo service pulse-audio restart
     ```

### Problem: Spatial Audio Not Working

**Symptoms:**
- Sound not following participant movement
- No stereo separation
- Audio feels "flat"

**Solutions:**

1. **Speaker Configuration:**
   ```javascript
   // Verify speaker setup in config
   "audio": {
     "spatialAudio": true,
     "speakers": {
       "layout": "stereo",  // or "surround_5.1"
       "calibration": {
         // Speaker positions must be accurate
       }
     }
   }
   ```

2. **Test Spatial Audio:**
   - Use built-in audio test: `http://localhost:3000/audio-test`
   - Move through space while test tone plays
   - Verify sound panning left/right

---

## 💻 Software and Application Issues

### Problem: Application Won't Start

**Symptoms:**
- Error messages when running `npm start`
- Application crashes immediately
- "Module not found" errors

**Solutions:**

1. **Dependency Issues:**
   ```bash
   # Reinstall dependencies
   npm install

   # Clear npm cache if needed
   npm cache clean --force
   npm install
   ```

2. **Configuration Problems:**
   ```bash
   # Reset to default configuration
   npm run build:dev

   # Validate configuration
   npm run validate
   ```

3. **Port Conflicts:**
   ```bash
   # Check if port 3000 is in use
   netstat -an | grep 3000

   # If occupied, change port in config or kill process
   # Windows: taskkill /PID [process-id] /F
   # Linux: kill -9 [process-id]
   ```

### Problem: Application Crashes or Freezes

**Symptoms:**
- App stops responding
- Participants not being tracked
- Browser shows "connection lost"

**Solutions:**

1. **Check System Resources:**
   ```bash
   # Monitor resource usage
   # Windows: Task Manager
   # Linux: htop or top

   # Memory usage should be <4GB
   # CPU usage should be <80%
   ```

2. **View Error Logs:**
   ```bash
   # Check application logs
   tail -f logs/application.log

   # Look for error patterns
   grep "ERROR" logs/application.log
   ```

3. **Restart Application:**
   ```bash
   # Clean restart
   npm stop  # if available
   npm start
   ```

### Problem: Web Interface Not Loading

**Symptoms:**
- Browser shows "site can't be reached"
- Blank page when accessing localhost:3000
- Connection timeout errors

**Solutions:**

1. **Network Configuration:**
   ```bash
   # Test local connection
   ping localhost
   telnet localhost 3000
   ```

2. **Firewall Issues:**
   - Check Windows Firewall settings
   - Ensure port 3000 is allowed
   - Try accessing from same computer first

3. **Browser Issues:**
   - Clear browser cache
   - Try different browser
   - Disable browser extensions
   - Check for JavaScript errors in console

---

## ⚡ Performance and Lag Issues

### Problem: Low Frame Rate

**Symptoms:**
- Choppy visual feedback
- Delayed response to movement
- Audio timing issues

**Solutions:**

1. **Reduce Quality Settings:**
   ```javascript
   // Lower particle count in config
   "visual": {
     "particles": {
       "count": 300,  // Reduce from 750
       "trails": false  // Disable for performance
     }
   }
   ```

2. **Check System Performance:**
   ```bash
   # Run performance test
   npm run test:performance

   # Expected: >50 FPS average
   # If lower, investigate system bottlenecks
   ```

3. **Graphics Card Issues:**
   - Update graphics drivers
   - Check GPU temperature
   - Close other graphics-intensive applications

### Problem: High Memory Usage

**Symptoms:**
- System becomes slow over time
- Memory usage constantly increasing
- Eventually runs out of memory

**Solutions:**

1. **Memory Leak Detection:**
   ```bash
   # Run memory test
   npm run test:load

   # Monitor memory usage over time
   # Should stabilize, not constantly increase
   ```

2. **Restart Application Regularly:**
   ```bash
   # Set up automatic restart (cron job)
   # Every 12 hours during off-hours
   0 2,14 * * * cd /path/to/app && npm restart
   ```

3. **Reduce Memory Usage:**
   ```javascript
   "system": {
     "performance": {
       "maxParticles": 500,  // Reduce from 1000
       "garbageCollection": true
     }
   }
   ```

---

## 🌐 Network and Connectivity Problems

### Problem: Remote Access Not Working

**Symptoms:**
- Can't access from other computers
- Network monitoring unavailable
- Connection refused errors

**Solutions:**

1. **Network Configuration:**
   ```bash
   # Check if service is listening
   netstat -an | grep 3000

   # Should show: 0.0.0.0:3000 LISTENING
   ```

2. **Firewall Configuration:**
   - Windows: Add port 3000 to firewall exceptions
   - Linux: Configure iptables or ufw
   ```bash
   # Linux firewall
   sudo ufw allow 3000
   ```

3. **IP Address Issues:**
   - Verify computer IP address: `ipconfig` (Windows) or `ip addr` (Linux)
   - Update configuration with correct IP
   - Test local access first

### Problem: WebSocket Connection Lost

**Symptoms:**
- Real-time updates stop working
- Browser console shows WebSocket errors
- Interface becomes unresponsive

**Solutions:**

1. **Check WebSocket Service:**
   ```bash
   # Restart application to reset WebSocket
   npm restart
   ```

2. **Network Stability:**
   - Check for network interruptions
   - Verify stable internet connection
   - Test with ethernet instead of WiFi

---

## 👥 Multi-Person Interaction Issues

### Problem: Coordination Not Detected

**Symptoms:**
- Multiple people present but no duet modes
- No group interaction effects
- System treats each person independently

**Solutions:**

1. **Check Participant Detection:**
   ```bash
   # Access debug interface
   http://localhost:3000/debug

   # Verify all participants are being tracked
   # Should show skeleton for each person
   ```

2. **Coordination Sensitivity:**
   ```javascript
   // Adjust coordination threshold
   "multiPerson": {
     "coordination": {
       "threshold": 0.5,  // Lower = more sensitive
       "syncWindow": 1500  // Longer window
     }
   }
   ```

3. **Space Configuration:**
   - Ensure all participants within tracking area
   - Check for tracking occlusion
   - Verify Kinect can see all participants

### Problem: Too Many False Positives

**Symptoms:**
- System thinks people are coordinating when they're not
- Duet modes activating randomly
- Overly sensitive interaction detection

**Solutions:**

1. **Increase Thresholds:**
   ```javascript
   "multiPerson": {
     "coordination": {
       "threshold": 0.75,  // Higher = less sensitive
       "minDuration": 3000  // Require longer coordination
     }
   }
   ```

2. **Calibrate for Space:**
   - Recalibrate coordination detection
   - Test with known coordinated movements
   - Adjust based on typical visitor behavior

---

## 🎯 Environment and Calibration Problems

### Problem: Environment Changes Not Triggered

**Symptoms:**
- Stuck in one sound environment
- Gestures not recognized
- No environment transitions

**Solutions:**

1. **Gesture Recognition:**
   ```bash
   # Test gesture detection
   http://localhost:3000/gesture-test

   # Perform known gestures and verify recognition
   ```

2. **Environment Sensitivity:**
   ```javascript
   "environments": {
     "discovery": {
       "sensitivity": 0.7,  // Lower = easier to trigger
       "gestureThreshold": 5  // Reduce required gestures
     }
   }
   ```

### Problem: Tracking Area Incorrect

**Symptoms:**
- Participants outside tracking area still detected
- Missing participants who should be tracked
- Inconsistent tracking boundaries

**Solutions:**

1. **Recalibration:**
   ```bash
   # Access calibration interface
   http://localhost:3000/calibration

   # Redefine tracking boundaries
   # Test all corners and edges
   ```

2. **Kinect Repositioning:**
   - Check if Kinect has moved since installation
   - Verify mounting is secure
   - Recalibrate after any position changes

---

## 🚨 Emergency Procedures

### Immediate System Shutdown

**When to use:** System malfunction, safety concerns, technical emergency

```bash
# Emergency shutdown procedure:
1. Press Ctrl+C in application terminal
2. If unresponsive: Close all application windows
3. If still unresponsive: Power off computer
4. Unplug Kinect sensor if overheating
5. Document issue and contact support
```

### Rapid Recovery Procedure

**Goal:** Get system running quickly for visitors

```bash
# 5-minute recovery procedure:
1. Power cycle computer (2 min)
2. Restart application: npm start (1 min)
3. Quick test: http://localhost:3000 (1 min)
4. Verify tracking and audio (1 min)
5. If working: Resume operation
6. If not: Use backup procedures
```

### Backup Procedures

**Option 1: Minimal Functionality**
```bash
# Start in safe mode with reduced features
npm start --safe-mode
```

**Option 2: Audio-Only Mode**
```bash
# Disable video processing, audio only
npm start --audio-only
```

**Option 3: Demonstration Mode**
```bash
# Use recorded data instead of live Kinect
npm start --demo-mode
```

### Contact Escalation

1. **Level 1 - Museum Staff:**
   - Try troubleshooting steps
   - Check common issues
   - Document problem

2. **Level 2 - Technical Support:**
   - Call: [SUPPORT-PHONE]
   - Email: [SUPPORT-EMAIL]
   - Provide: Error logs, system info

3. **Level 3 - Emergency:**
   - Call: [EMERGENCY-PHONE]
   - For: Safety issues, complete system failure
   - Available: 24/7

---

## 🔧 Diagnostic Tools and Logs

### Built-in Diagnostic Tools

1. **System Health Check:**
   ```bash
   http://localhost:3000/health
   ```
   Shows: System status, performance metrics, error counts

2. **Debug Interface:**
   ```bash
   http://localhost:3000/debug
   ```
   Shows: Live tracking data, audio levels, system resources

3. **Performance Monitor:**
   ```bash
   http://localhost:3000/performance
   ```
   Shows: FPS, memory usage, processing times

### Log Files

**Application Logs:**
```bash
# View recent logs
tail -f logs/application.log

# Search for errors
grep "ERROR\|FATAL" logs/application.log

# View startup logs
head -50 logs/application.log
```

**System Logs:**
```bash
# Windows Event Viewer
eventvwr.msc

# Linux system logs
journalctl -u kinect-sculpture.service
```

### Performance Diagnostics

```bash
# Run comprehensive diagnostic
npm run test:performance

# Generate diagnostic report
npm run diagnostics:full

# Quick system check
npm run diagnostics:quick
```

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| KIN001 | Kinect not connected | Check USB connection |
| AUD001 | Audio device error | Check audio settings |
| NET001 | Network error | Check network configuration |
| MEM001 | Memory limit exceeded | Restart application |
| CAL001 | Calibration error | Recalibrate system |

---

## 📞 Support Information

### Self-Service Resources

- **Installation Guide:** `docs/installation-setup-guide.md`
- **Calibration Guide:** `docs/calibration-procedures.md`
- **Performance Guide:** `docs/performance-optimization.md`
- **FAQ:** `docs/frequently-asked-questions.md`

### Technical Support

**Primary Contact:**
- **Phone:** [SUPPORT-PHONE]
- **Email:** [SUPPORT-EMAIL]
- **Hours:** Monday-Friday, 9AM-5PM EST

**Emergency Contact:**
- **Phone:** [EMERGENCY-PHONE]
- **Available:** 24/7 for critical issues

### Information to Provide When Calling Support

1. **System Information:**
   - Installation location
   - Software version (`npm run version`)
   - Hardware configuration

2. **Problem Description:**
   - When did it start?
   - What was happening when it occurred?
   - How many visitors were present?

3. **Error Information:**
   - Error messages (exact text)
   - Log file excerpts
   - Screenshots if applicable

4. **Troubleshooting Attempted:**
   - What steps have you already tried?
   - Results of diagnostic tests

---

## 📝 Troubleshooting Log Template

**Date:** _______________
**Time:** _______________
**Reported By:** ________________________

**Problem Description:**
_________________________________________________
_________________________________________________

**Symptoms Observed:**
☐ No audio
☐ No tracking
☐ Poor performance
☐ System crash
☐ Network issues
☐ Other: ________________________________

**Troubleshooting Steps Taken:**
☐ Checked connections
☐ Restarted application
☐ Checked logs
☐ Ran diagnostics
☐ Other: ________________________________

**Resolution:**
_________________________________________________
_________________________________________________

**Resolved By:** ________________________
**Time to Resolution:** _______________

**Follow-up Required:** ☐ Yes ☐ No
**Notes:**
_________________________________________________

---

*This troubleshooting guide is designed to help museum staff resolve common issues quickly. For problems not covered here, please contact technical support using the information provided.*