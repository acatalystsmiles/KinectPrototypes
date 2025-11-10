class InstallationConfig {
    constructor() {
        // Physical installation parameters
        this.physicalSetup = {
            spaceWidth: 4.0,        // meters
            spaceDepth: 4.0,        // meters
            spaceHeight: 3.0,       // meters
            kinectHeight: 2.5,      // meters
            kinectAngle: 0,         // degrees
            kinectPosition: { x: 0, y: 2.5, z: -2 }, // meters from center

            // Audio setup
            speakerPositions: [
                { id: 'front_left', x: -1.5, y: 1.8, z: 1.5 },
                { id: 'front_right', x: 1.5, y: 1.8, z: 1.5 },
                { id: 'rear_left', x: -1.5, y: 1.8, z: -1.5 },
                { id: 'rear_right', x: 1.5, y: 1.8, z: -1.5 }
            ],

            // Visual display
            displaySetup: {
                hasProjector: false,
                projectorPosition: null,
                hasLEDs: false,
                ledConfiguration: null,
                hasMonitors: true,
                monitorCount: 1
            }
        };

        // Kinect calibration data
        this.kinectCalibration = {
            isCalibrated: false,
            calibrationDate: null,
            backgroundPoints: [],
            floorPlane: { a: 0, b: 1, c: 0, d: 0 }, // y = 0
            trackingBounds: {
                minX: -2.0,
                maxX: 2.0,
                minY: 0.0,
                maxY: 2.5,
                minZ: -1.0,
                maxZ: 3.0
            },
            depthRange: {
                min: 500,   // mm
                max: 4500   // mm
            },
            confidenceThresholds: {
                joint: 0.5,
                body: 0.7,
                gesture: 0.6
            }
        };

        // Audio calibration
        this.audioCalibration = {
            isCalibrated: false,
            roomAcoustics: {
                reverbTime: 1.2,      // seconds
                ambientNoise: 35,     // dB
                frequencyResponse: null
            },
            speakerLevels: {
                master: 0.7,
                ambient: 0.6,
                melodic: 0.8,
                harmonic: 0.7,
                rhythmic: 0.75
            },
            spatialAudio: {
                enabled: true,
                listenerPosition: { x: 0, y: 1.7, z: 0 }, // average human head height
                roomModel: 'medium-room'
            },
            latencyCompensation: {
                audioBuffer: 128,     // samples
                targetLatency: 40,    // ms
                measuredLatency: 0
            }
        };

        // Visual calibration
        this.visualCalibration = {
            isCalibrated: false,
            displaySettings: {
                brightness: 0.8,
                contrast: 1.0,
                colorTemperature: 6500, // K
                gammaCorrection: 2.2
            },
            projectionMapping: null, // For projector setups
            particleSettings: {
                density: 1.0,
                lifespan: 1.0,
                responseIntensity: 1.0
            }
        };

        // AI system configuration
        this.aiConfiguration = {
            processingMode: 'enhanced',
            gestureLibrary: 'standard', // 'minimal', 'standard', 'extended'
            learningEnabled: true,
            memoryRetention: 'session', // 'disabled', 'session', 'daily', 'persistent'
            adaptationRate: 0.1,
            confidenceThresholds: {
                gesture: 0.6,
                musical: 0.5,
                learning: 0.7
            },
            performanceTargets: {
                maxProcessingTime: 10,  // ms
                maxMemoryUsage: 200,    // MB
                targetFrameRate: 30     // fps
            }
        };

        // Museum operation settings
        this.operationSettings = {
            operatingHours: {
                open: '09:00',
                close: '17:00',
                timezone: 'local'
            },
            visitorManagement: {
                maxSimultaneous: 6,
                sessionTimeout: 300,    // seconds
                queueTimeout: 180,      // seconds
                maxDailyVisitors: 500
            },
            safetySettings: {
                emergencyStopEnabled: true,
                volumeLimits: {
                    maximum: 85,        // dB
                    warning: 80,        // dB
                    night: 60           // dB
                },
                motionSafety: {
                    maxVelocity: 5.0,   // m/s (detection threshold)
                    fallDetection: true,
                    crowdDensity: 0.8   // people per m²
                }
            },
            maintenance: {
                dailyRestart: true,
                restartTime: '08:30',
                performanceMonitoring: true,
                autoBackup: true,
                backupInterval: 3600    // seconds
            }
        };

        // Data collection and privacy
        this.dataSettings = {
            dataCollection: {
                enabled: true,
                anonymized: true,
                retentionDays: 30,
                exportEnabled: true
            },
            analytics: {
                realTimeEnabled: true,
                historicalEnabled: true,
                performanceTracking: true,
                visitorInsights: true
            },
            privacy: {
                noPersonalData: true,
                noFacialRecognition: true,
                noVideoRecording: true,
                dataEncryption: true
            }
        };

        // Load saved configuration
        this.loadConfiguration();

        console.log('⚙️ Installation Configuration initialized');
    }

    // Kinect calibration methods
    startKinectCalibration() {
        console.log('📐 Starting Kinect calibration process...');

        return new Promise((resolve, reject) => {
            const calibrationSteps = [
                { name: 'Background Capture', duration: 5000 },
                { name: 'Floor Plane Detection', duration: 3000 },
                { name: 'Tracking Bounds Setup', duration: 4000 },
                { name: 'Confidence Validation', duration: 3000 }
            ];

            let currentStep = 0;
            const stepInterval = setInterval(() => {
                if (currentStep < calibrationSteps.length) {
                    const step = calibrationSteps[currentStep];
                    console.log(`🔄 Calibration: ${step.name}...`);

                    // Simulate calibration step
                    setTimeout(() => {
                        this.performCalibrationStep(step.name);
                        currentStep++;
                    }, step.duration);
                } else {
                    clearInterval(stepInterval);
                    this.kinectCalibration.isCalibrated = true;
                    this.kinectCalibration.calibrationDate = new Date().toISOString();
                    console.log('✅ Kinect calibration completed');
                    resolve(this.kinectCalibration);
                }
            }, 100);
        });
    }

    performCalibrationStep(stepName) {
        switch (stepName) {
            case 'Background Capture':
                // Simulate capturing background depth data
                this.kinectCalibration.backgroundPoints = this.generateBackgroundPoints();
                break;

            case 'Floor Plane Detection':
                // Simulate floor plane calculation
                this.kinectCalibration.floorPlane = {
                    a: 0.02, b: 0.98, c: 0.01, d: -0.1 // Slightly tilted floor
                };
                break;

            case 'Tracking Bounds Setup':
                // Optimize tracking bounds based on space
                this.kinectCalibration.trackingBounds = {
                    minX: -this.physicalSetup.spaceWidth / 2,
                    maxX: this.physicalSetup.spaceWidth / 2,
                    minY: 0.0,
                    maxY: this.physicalSetup.spaceHeight - 0.5,
                    minZ: -this.physicalSetup.spaceDepth / 2,
                    maxZ: this.physicalSetup.spaceDepth / 2
                };
                break;

            case 'Confidence Validation':
                // Test confidence thresholds
                this.kinectCalibration.confidenceThresholds = {
                    joint: 0.6,
                    body: 0.75,
                    gesture: 0.65
                };
                break;
        }
    }

    generateBackgroundPoints() {
        // Simulate background depth points for subtraction
        const points = [];
        for (let i = 0; i < 1000; i++) {
            points.push({
                x: (Math.random() - 0.5) * this.physicalSetup.spaceWidth,
                y: Math.random() * this.physicalSetup.spaceHeight,
                z: (Math.random() - 0.5) * this.physicalSetup.spaceDepth,
                depth: 500 + Math.random() * 4000
            });
        }
        return points;
    }

    // Audio calibration methods
    startAudioCalibration() {
        console.log('🔊 Starting audio calibration process...');

        return new Promise((resolve, reject) => {
            const testSequence = [
                { name: 'Room Acoustics Analysis', duration: 8000 },
                { name: 'Speaker Level Adjustment', duration: 6000 },
                { name: 'Latency Measurement', duration: 4000 },
                { name: 'Spatial Audio Setup', duration: 5000 }
            ];

            let currentTest = 0;
            const testInterval = setInterval(() => {
                if (currentTest < testSequence.length) {
                    const test = testSequence[currentTest];
                    console.log(`🔊 Audio Calibration: ${test.name}...`);

                    setTimeout(() => {
                        this.performAudioCalibration(test.name);
                        currentTest++;
                    }, test.duration);
                } else {
                    clearInterval(testInterval);
                    this.audioCalibration.isCalibrated = true;
                    console.log('✅ Audio calibration completed');
                    resolve(this.audioCalibration);
                }
            }, 100);
        });
    }

    performAudioCalibration(testName) {
        switch (testName) {
            case 'Room Acoustics Analysis':
                // Simulate room acoustic measurement
                this.audioCalibration.roomAcoustics = {
                    reverbTime: 1.0 + Math.random() * 0.5,
                    ambientNoise: 30 + Math.random() * 10,
                    frequencyResponse: this.generateFrequencyResponse()
                };
                break;

            case 'Speaker Level Adjustment':
                // Optimize speaker levels for the space
                this.audioCalibration.speakerLevels = {
                    master: 0.75,
                    ambient: 0.65,
                    melodic: 0.8,
                    harmonic: 0.7,
                    rhythmic: 0.78
                };
                break;

            case 'Latency Measurement':
                // Measure and optimize audio latency
                this.audioCalibration.latencyCompensation.measuredLatency = 35 + Math.random() * 10;
                break;

            case 'Spatial Audio Setup':
                // Configure spatial audio for the room
                this.audioCalibration.spatialAudio.listenerPosition = {
                    x: 0,
                    y: 1.7,
                    z: 0
                };
                break;
        }
    }

    generateFrequencyResponse() {
        // Simulate frequency response measurement
        const frequencies = [63, 125, 250, 500, 1000, 2000, 4000, 8000];
        return frequencies.map(freq => ({
            frequency: freq,
            gain: -3 + Math.random() * 6 // ±3dB variation
        }));
    }

    // Visual calibration methods
    startVisualCalibration() {
        console.log('🎨 Starting visual calibration process...');

        return new Promise((resolve, reject) => {
            const visualTests = [
                { name: 'Display Brightness Adjustment', duration: 3000 },
                { name: 'Color Temperature Optimization', duration: 4000 },
                { name: 'Particle System Tuning', duration: 5000 },
                { name: 'Response Sensitivity Setup', duration: 3000 }
            ];

            let currentTest = 0;
            const testInterval = setInterval(() => {
                if (currentTest < visualTests.length) {
                    const test = visualTests[currentTest];
                    console.log(`🎨 Visual Calibration: ${test.name}...`);

                    setTimeout(() => {
                        this.performVisualCalibration(test.name);
                        currentTest++;
                    }, test.duration);
                } else {
                    clearInterval(testInterval);
                    this.visualCalibration.isCalibrated = true;
                    console.log('✅ Visual calibration completed');
                    resolve(this.visualCalibration);
                }
            }, 100);
        });
    }

    performVisualCalibration(testName) {
        switch (testName) {
            case 'Display Brightness Adjustment':
                // Adjust for ambient lighting
                this.visualCalibration.displaySettings.brightness = 0.7 + Math.random() * 0.2;
                break;

            case 'Color Temperature Optimization':
                // Optimize color temperature for space
                this.visualCalibration.displaySettings.colorTemperature = 6000 + Math.random() * 1000;
                break;

            case 'Particle System Tuning':
                // Tune particle effects for performance and aesthetics
                this.visualCalibration.particleSettings = {
                    density: 0.8 + Math.random() * 0.4,
                    lifespan: 0.9 + Math.random() * 0.2,
                    responseIntensity: 0.8 + Math.random() * 0.4
                };
                break;

            case 'Response Sensitivity Setup':
                // Set optimal response sensitivity
                this.aiConfiguration.confidenceThresholds.gesture = 0.55 + Math.random() * 0.1;
                break;
        }
    }

    // Complete system calibration
    async performFullCalibration() {
        console.log('🎯 Starting complete system calibration...');

        try {
            console.log('Phase 1: Kinect Calibration');
            await this.startKinectCalibration();

            console.log('Phase 2: Audio Calibration');
            await this.startAudioCalibration();

            console.log('Phase 3: Visual Calibration');
            await this.startVisualCalibration();

            console.log('Phase 4: AI System Optimization');
            await this.optimizeAISystem();

            console.log('✅ Complete system calibration finished');
            this.saveConfiguration();

            return {
                success: true,
                kinect: this.kinectCalibration,
                audio: this.audioCalibration,
                visual: this.visualCalibration,
                ai: this.aiConfiguration
            };

        } catch (error) {
            console.error('❌ Calibration failed:', error);
            return { success: false, error: error.message };
        }
    }

    async optimizeAISystem() {
        console.log('🧠 Optimizing AI system for installation...');

        // Simulate AI optimization
        await new Promise(resolve => setTimeout(resolve, 3000));

        this.aiConfiguration.performanceTargets = {
            maxProcessingTime: 8,   // Optimized
            maxMemoryUsage: 180,    // Optimized
            targetFrameRate: 30
        };

        console.log('✅ AI system optimized');
    }

    // Configuration persistence
    saveConfiguration() {
        const config = {
            physicalSetup: this.physicalSetup,
            kinectCalibration: this.kinectCalibration,
            audioCalibration: this.audioCalibration,
            visualCalibration: this.visualCalibration,
            aiConfiguration: this.aiConfiguration,
            operationSettings: this.operationSettings,
            dataSettings: this.dataSettings,
            lastSaved: new Date().toISOString()
        };

        // In a real implementation, this would save to a file or database
        localStorage.setItem('installationConfig', JSON.stringify(config));
        console.log('💾 Configuration saved');
    }

    loadConfiguration() {
        try {
            const saved = localStorage.getItem('installationConfig');
            if (saved) {
                const config = JSON.parse(saved);

                // Merge saved configuration
                Object.assign(this.physicalSetup, config.physicalSetup || {});
                Object.assign(this.kinectCalibration, config.kinectCalibration || {});
                Object.assign(this.audioCalibration, config.audioCalibration || {});
                Object.assign(this.visualCalibration, config.visualCalibration || {});
                Object.assign(this.aiConfiguration, config.aiConfiguration || {});
                Object.assign(this.operationSettings, config.operationSettings || {});
                Object.assign(this.dataSettings, config.dataSettings || {});

                console.log('📂 Configuration loaded from storage');
            }
        } catch (error) {
            console.warn('⚠️ Failed to load saved configuration:', error);
        }
    }

    exportConfiguration() {
        const config = {
            physicalSetup: this.physicalSetup,
            kinectCalibration: this.kinectCalibration,
            audioCalibration: this.audioCalibration,
            visualCalibration: this.visualCalibration,
            aiConfiguration: this.aiConfiguration,
            operationSettings: this.operationSettings,
            dataSettings: this.dataSettings,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };

        return config;
    }

    importConfiguration(configData) {
        try {
            Object.assign(this.physicalSetup, configData.physicalSetup || {});
            Object.assign(this.kinectCalibration, configData.kinectCalibration || {});
            Object.assign(this.audioCalibration, configData.audioCalibration || {});
            Object.assign(this.visualCalibration, configData.visualCalibration || {});
            Object.assign(this.aiConfiguration, configData.aiConfiguration || {});
            Object.assign(this.operationSettings, configData.operationSettings || {});
            Object.assign(this.dataSettings, configData.dataSettings || {});

            this.saveConfiguration();
            console.log('📥 Configuration imported successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to import configuration:', error);
            return false;
        }
    }

    // Getters for configuration validation
    isSystemCalibrated() {
        return this.kinectCalibration.isCalibrated &&
               this.audioCalibration.isCalibrated &&
               this.visualCalibration.isCalibrated;
    }

    getCalibrationStatus() {
        return {
            kinect: this.kinectCalibration.isCalibrated,
            audio: this.audioCalibration.isCalibrated,
            visual: this.visualCalibration.isCalibrated,
            overallStatus: this.isSystemCalibrated(),
            lastCalibrated: this.kinectCalibration.calibrationDate
        };
    }

    getSystemStatus() {
        return {
            calibration: this.getCalibrationStatus(),
            operation: this.operationSettings,
            performance: this.aiConfiguration.performanceTargets,
            safety: this.operationSettings.safetySettings
        };
    }

    // Configuration validation
    validateConfiguration() {
        const issues = [];

        // Check physical setup
        if (this.physicalSetup.spaceWidth < 2.0) {
            issues.push('Space width too narrow (minimum 2.0m)');
        }

        // Check Kinect placement
        if (this.physicalSetup.kinectHeight < 2.0) {
            issues.push('Kinect height too low (minimum 2.0m)');
        }

        // Check speaker configuration
        if (this.physicalSetup.speakerPositions.length < 2) {
            issues.push('Insufficient speakers (minimum 2 required)');
        }

        // Check safety settings
        if (this.operationSettings.safetySettings.volumeLimits.maximum > 90) {
            issues.push('Maximum volume exceeds safety limits (90dB)');
        }

        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }

    // Reset configuration
    resetToDefaults() {
        this.kinectCalibration.isCalibrated = false;
        this.audioCalibration.isCalibrated = false;
        this.visualCalibration.isCalibrated = false;

        console.log('🔄 Configuration reset to defaults');
        this.saveConfiguration();
    }
}

// Export for use in main application
window.InstallationConfig = InstallationConfig;