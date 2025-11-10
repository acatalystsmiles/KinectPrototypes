# Installation Setup Guide
## Kinect Sound Sculpture - Museum Deployment

> **Version:** 2.0.0
> **Last Updated:** September 2025
> **Target Audience:** Museum technicians, installation staff

---

## 📋 Table of Contents
1. [Pre-Installation Requirements](#pre-installation-requirements)
2. [Hardware Setup](#hardware-setup)
3. [Software Installation](#software-installation)
4. [Network Configuration](#network-configuration)
5. [Initial System Testing](#initial-system-testing)
6. [Space Calibration](#space-calibration)
7. [Audio System Setup](#audio-system-setup)
8. [Visual Display Configuration](#visual-display-configuration)
9. [Final Verification](#final-verification)
10. [Post-Installation Checklist](#post-installation-checklist)

---

## 🔧 Pre-Installation Requirements

### System Requirements
- **Computer:** Windows 10/11 or Ubuntu 18.04+ with USB 3.0 ports
- **CPU:** Intel i5-8400 or AMD Ryzen 5 2600 (minimum)
- **RAM:** 16GB DDR4 (32GB recommended for >4 participants)
- **Storage:** 500GB SSD with 100GB free space
- **Graphics:** Dedicated GPU with 4GB VRAM (NVIDIA GTX 1060 or better)
- **Network:** Gigabit Ethernet connection

### Hardware Components Checklist
- [ ] Azure Kinect DK sensor
- [ ] USB 3.0 cable (minimum 3m length)
- [ ] Power adapter for Kinect
- [ ] Audio system (speakers/headphones)
- [ ] Display monitor(s)
- [ ] Network cable
- [ ] Mounting hardware for Kinect
- [ ] Power strips/UPS

### Space Requirements
- **Installation Area:** Minimum 4m × 4m × 3m (W×D×H)
- **Participant Zone:** 3m × 3m clear area
- **Kinect Positioning:** 2-3m height, centered above participant area
- **Audio Coverage:** 360° sound field or surround speaker setup
- **Lighting:** Avoid direct sunlight on Kinect sensor
- **Temperature:** 15-30°C operating range

---

## 🔌 Hardware Setup

### Step 1: Kinect Sensor Mounting

**⚠️ IMPORTANT:** Kinect must be securely mounted at correct height and angle.

1. **Height Positioning:**
   - Mount Kinect 2.5-3.0m above floor level
   - Ensure downward angle of 15-30° for optimal tracking
   - Use provided mounting bracket or secure tripod

2. **Angle Adjustment:**
   ```
   Kinect Position Guide:

   Side View:        Top View:
   ┌─────┐          ┌─────────┐
   │     │          │    K    │ K = Kinect
   │  K  │ 15-30°   │         │
   │     │   ↘      │    P    │ P = Participant Area
   └─────┘          └─────────┘
     3m               4m×4m
   ```

3. **Cable Management:**
   - Route USB 3.0 cable safely to computer
   - Secure all cables to prevent tripping hazards
   - Test cable length allows full range of motion

### Step 2: Computer Setup

1. **Position computer away from participant area**
2. **Ensure adequate ventilation around computer**
3. **Connect all peripherals:**
   - Kinect USB cable to USB 3.0 port
   - Audio output to sound system
   - Display output to monitor(s)
   - Network cable to router/switch

### Step 3: Audio System Connection

1. **For Stereo Setup:**
   - Connect computer audio out to amplifier input
   - Position speakers at 45° angles from center

2. **For Surround Setup:**
   - Use 5.1 or 7.1 surround sound system
   - Connect via HDMI, optical, or multiple audio jacks
   - Position speakers around participant area perimeter

---

## 💻 Software Installation

### Step 1: Operating System Preparation

**Windows Installation:**
```batch
# Ensure Windows is updated
Windows Update → Check for updates

# Install required Visual C++ redistributables
Download from Microsoft:
- Visual C++ 2019 Redistributable (x64)
- Visual C++ 2022 Redistributable (x64)
```

**Linux Installation:**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required dependencies
sudo apt install -y curl git build-essential nodejs npm
```

### Step 2: Azure Kinect SDK Installation

**Windows:**
1. Download Azure Kinect SDK from Microsoft
2. Run installer with administrator privileges
3. Follow installation wizard
4. Restart computer when prompted

**Linux:**
```bash
# Add Microsoft package repository
curl -sSL https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
sudo apt-add-repository https://packages.microsoft.com/ubuntu/18.04/prod

# Install Azure Kinect SDK
sudo apt update
sudo apt install k4a-tools libk4a1.4 libk4a1.4-dev
```

### Step 3: Node.js and Application Installation

```bash
# Install Node.js (version 16 or higher)
# Download from https://nodejs.org or use package manager

# Verify installation
node --version  # Should show v16.0.0 or higher
npm --version   # Should show 6.0.0 or higher

# Navigate to installation directory
cd "C:\Users\[USER]\Documents\Kinect AI Sound Sculpture"

# Install application dependencies
npm install

# Verify installation
npm run validate
```

### Step 4: Initial Configuration

```bash
# Copy development configuration
npm run build:dev

# Test basic functionality
npm run test:unit
```

---

## 🌐 Network Configuration

### Local Network Setup

1. **Assign Static IP (Recommended):**
   ```
   IP Address: 192.168.1.100
   Subnet Mask: 255.255.255.0
   Gateway: 192.168.1.1
   DNS: 8.8.8.8, 8.8.4.4
   ```

2. **Firewall Configuration:**
   - Allow port 3000 (HTTP server)
   - Allow port 3001 (WebSocket)
   - Enable local network communication

3. **For Multiple Installations:**
   ```
   Installation A: 192.168.1.100:3000
   Installation B: 192.168.1.101:3000
   Installation C: 192.168.1.102:3000
   ```

### Remote Monitoring Setup (Optional)

```javascript
// Enable remote monitoring in config
{
  "network": {
    "remoteMonitoring": true,
    "monitoringPort": 3002,
    "allowedIPs": ["192.168.1.0/24"]
  }
}
```

---

## 🧪 Initial System Testing

### Step 1: Hardware Verification

```bash
# Test Kinect connectivity
cd /path/to/kinect/tools
k4aviewer  # Should show Kinect camera feeds

# Alternative test
npm run test:unit
```

### Step 2: Software Testing

```bash
# Run comprehensive tests
npm run test

# Expected output:
# ✅ Unit Tests - Movement Analysis: PASSED
# ✅ Integration Tests - Data Pipeline: PASSED
# ✅ Performance Tests - Multi-Person: PASSED
# 🎉 All tests passed! System is ready for deployment.
```

### Step 3: Audio Testing

1. **Start the application:**
   ```bash
   npm start
   ```

2. **Open web interface:**
   - Navigate to `http://localhost:3000`
   - Click "Test Audio" button
   - Verify audio output through speakers

3. **Test movement detection:**
   - Stand in front of Kinect
   - Move arms and observe real-time tracking
   - Listen for audio feedback

---

## 📐 Space Calibration

### Step 1: Kinect Calibration

1. **Access calibration interface:**
   - Open `http://localhost:3000/calibration`
   - Enter administrator password (default: `museum2024`)

2. **Set tracking boundaries:**
   ```
   Calibration Steps:
   1. Mark four corners of participant area
   2. Set height boundaries (floor/ceiling)
   3. Define safe zones and restricted areas
   4. Test with multiple people
   ```

3. **Verify tracking accuracy:**
   - Walk to each corner of space
   - Confirm skeleton tracking throughout area
   - Adjust Kinect angle if needed

### Step 2: Audio Calibration

1. **Speaker positioning test:**
   ```bash
   # Run audio calibration
   npm run calibrate:audio
   ```

2. **Set volume levels:**
   - Base volume: 60-70% of maximum
   - Peak volume: 85% maximum
   - Minimum volume: 30% for ambient

3. **Test spatial audio:**
   - Move through space while audio plays
   - Verify smooth volume transitions
   - Adjust speaker balance as needed

### Step 3: Performance Optimization

```bash
# Run performance test
npm run test:performance

# Expected results:
# - Average FPS: >55
# - Memory usage: <300MB
# - Audio latency: <50ms
# - Response time: <100ms
```

---

## 🔊 Audio System Setup

### Speaker Configuration

**Option 1: Stereo Setup (Simple)**
```
Layout:
    L     Center     R
     \      |      /
      \     |     /
       Participant Area
```

**Option 2: Surround Setup (Advanced)**
```
Layout:
    FL    FC    FR
     |     |     |
     |     P     |  P = Participants
     |     |     |
    RL    RC    RR
```

### Audio Settings Configuration

```javascript
// Edit: public/config/production.json
{
  "audio": {
    "masterVolume": 0.8,
    "spatialAudio": true,
    "speakers": {
      "layout": "surround_5.1",  // or "stereo"
      "calibration": {
        "frontLeft": { "x": -2, "y": 2, "z": 0 },
        "frontRight": { "x": 2, "y": 2, "z": 0 },
        "center": { "x": 0, "y": 2, "z": 0 },
        "rearLeft": { "x": -2, "y": -2, "z": 0 },
        "rearRight": { "x": 2, "y": -2, "z": 0 }
      }
    }
  }
}
```

### Volume Level Guidelines

| Environment | Base Volume | Peak Volume | Notes |
|-------------|-------------|-------------|-------|
| Gallery | 60% | 80% | Respectful of other exhibits |
| Dedicated Room | 70% | 90% | Immersive experience |
| Children's Area | 50% | 70% | Protect hearing |
| Evening Events | 75% | 95% | Enhanced experience |

---

## 🖥️ Visual Display Configuration

### Monitor Setup

1. **Single Display:**
   - 43" minimum for group viewing
   - Mount at 2m height for visibility
   - Configure as secondary display

2. **Multiple Displays:**
   - Surround participant area with screens
   - Synchronize content across displays
   - Use dedicated graphics card

### Display Settings

```javascript
// Configure in: public/config/config.json
{
  "visual": {
    "displays": [
      {
        "id": "main",
        "resolution": "1920x1080",
        "position": { "x": 0, "y": 0 },
        "fullscreen": true
      }
    ],
    "particles": {
      "count": 750,
      "trails": true,
      "quality": "high"
    }
  }
}
```

---

## ✅ Final Verification

### System Health Check

1. **Run full system test:**
   ```bash
   npm run deploy
   ```

2. **Performance benchmark:**
   ```bash
   npm run test:load
   ```

3. **24-hour stability test:**
   ```bash
   # Leave system running overnight
   # Check logs next day for errors
   npm run monitor
   ```

### User Experience Test

1. **Single user test:**
   - One person enters space
   - Verify immediate audio response
   - Test all gestures and movements

2. **Multi-user test:**
   - 2-6 people enter simultaneously
   - Verify coordination detection
   - Test duet modes and group interactions

3. **Edge case testing:**
   - Very slow movements
   - Very fast movements
   - People entering/leaving frequently

---

## 📋 Post-Installation Checklist

### Documentation
- [ ] Record Kinect serial number and position
- [ ] Document network configuration
- [ ] Note any custom calibration settings
- [ ] Create backup of working configuration
- [ ] Update installation log with completion date

### Training
- [ ] Train museum staff on basic operation
- [ ] Provide emergency contact information
- [ ] Demonstrate restart procedures
- [ ] Show monitoring interface

### Monitoring Setup
- [ ] Configure automatic startup
- [ ] Set up log rotation
- [ ] Enable remote monitoring (if applicable)
- [ ] Schedule regular system health checks

### Emergency Procedures
- [ ] Create emergency shutdown procedure
- [ ] Document backup contact information
- [ ] Provide troubleshooting quick reference
- [ ] Establish maintenance schedule

---

## 📞 Support Contact Information

**Primary Support:**
- **Technical Lead:** [Name] - [email] - [phone]
- **Available:** Monday-Friday, 9AM-5PM EST
- **Emergency:** [emergency-phone]

**Secondary Support:**
- **System Administrator:** [Name] - [email] - [phone]
- **Available:** 24/7 for critical issues

**Documentation:**
- **Installation Guide:** `docs/installation-setup-guide.md`
- **Troubleshooting:** `docs/troubleshooting-guide.md`
- **API Reference:** `docs/api-reference.md`

---

## 📝 Installation Log

**Installation Completed By:** ________________________

**Date:** _______________

**Kinect Serial Number:** ________________________

**Network Configuration:** ________________________

**Special Notes:**
_________________________________________________
_________________________________________________
_________________________________________________

**Verification Tests Passed:** ☐ Yes ☐ No

**Staff Training Completed:** ☐ Yes ☐ No

**System Status:** ☐ Ready for Public Use ☐ Needs Additional Work

---

*For technical support, please refer to the troubleshooting guide or contact our support team using the information provided above.*