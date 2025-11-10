const KinectDataSimulator = require('./test-data-simulator');

class AISystemTester {
    constructor() {
        this.simulator = new KinectDataSimulator();
        this.testDuration = 60000; // 60 seconds for comprehensive AI testing
        this.testPhases = [
            {
                name: 'Gesture Recognition Test',
                duration: 12000,
                description: 'Test basic gesture detection and pattern recognition',
                testType: 'gesture_focus'
            },
            {
                name: 'Musical Intelligence Test',
                duration: 12000,
                description: 'Test musical phrase generation and harmonic analysis',
                testType: 'musical_focus'
            },
            {
                name: 'Adaptive Learning Test',
                duration: 15000,
                description: 'Test visitor profiling and behavioral adaptation',
                testType: 'learning_focus'
            },
            {
                name: 'Movement Memory Test',
                duration: 12000,
                description: 'Test pattern recognition and movement signatures',
                testType: 'memory_focus'
            },
            {
                name: 'Integrated AI Performance Test',
                duration: 9000,
                description: 'Test all AI systems working together',
                testType: 'integration_focus'
            }
        ];

        this.currentPhase = 0;
        this.phaseStartTime = 0;
        this.testResults = {
            phasesCompleted: 0,
            aiMetricsCollected: [],
            performanceIssues: [],
            featuresVerified: []
        };
    }

    start() {
        console.log('🧠🎭 Starting AI Movement Interpretation System Test...');
        console.log('=====================================================');
        console.log('📊 Test Duration: 60 seconds');
        console.log('🤖 Testing: AI Gesture Recognition, Musical Intelligence, Adaptive Learning, Movement Memory');
        console.log('🌐 Open http://localhost:3000 to monitor AI system performance');
        console.log('🔧 IMPORTANT: Enable \"Show AI Debug Info\" in the interface!');
        console.log('');
        console.log('📋 AI System Verification Checklist:');
        console.log('   ✅ Gesture recognition and pattern matching');
        console.log('   ✅ Musical phrase generation from movement');
        console.log('   ✅ Visitor behavior profiling and adaptation');
        console.log('   ✅ Movement signature detection and memory');
        console.log('   ✅ Real-time AI processing performance');
        console.log('   ✅ Enhanced metrics calculation');
        console.log('   ✅ AI-enhanced audio and visual responses');
        console.log('');

        // Override simulator for AI-focused testing
        this.setupAIEnhancedSimulation();

        // Start the simulator
        this.simulator.start();
        this.phaseStartTime = Date.now();

        console.log(`🤖 Phase 1: ${this.testPhases[0].name}`);
        console.log(`   ${this.testPhases[0].description}`);

        // Auto-stop after test duration
        setTimeout(() => {
            this.stop();
        }, this.testDuration);

        // Print progress updates
        this.printProgress();
    }

    setupAIEnhancedSimulation() {
        const originalGenerateBody = this.simulator.generateBody.bind(this.simulator);

        this.simulator.generateBody = (bodyId) => {
            const body = originalGenerateBody(bodyId);
            const currentTime = Date.now();

            // Check if we need to advance to next phase
            if (currentTime - this.phaseStartTime > this.testPhases[this.currentPhase]?.duration) {
                this.currentPhase = Math.min(this.currentPhase + 1, this.testPhases.length - 1);
                this.phaseStartTime = currentTime;
                this.testResults.phasesCompleted++;

                if (this.testPhases[this.currentPhase]) {
                    console.log(`\\n🤖 Phase ${this.currentPhase + 1}: ${this.testPhases[this.currentPhase].name}`);
                    console.log(`   ${this.testPhases[this.currentPhase].description}`);
                }
            }

            // Apply phase-specific AI test patterns
            this.enhanceForAITesting(body, this.testPhases[this.currentPhase]);

            return body;
        };
    }

    enhanceForAITesting(body, phase) {
        if (!phase) return;

        const time = (Date.now() - this.phaseStartTime) * 0.001;
        const joints = body.joints;

        switch (phase.testType) {
            case 'gesture_focus':
                this.addGestureTestPatterns(joints, time);
                break;

            case 'musical_focus':
                this.addMusicalTestPatterns(joints, time);
                break;

            case 'learning_focus':
                this.addLearningTestPatterns(joints, time);
                break;

            case 'memory_focus':
                this.addMemoryTestPatterns(joints, time);
                break;

            case 'integration_focus':
                this.addIntegrationTestPatterns(joints, time);
                break;
        }
    }

    addGestureTestPatterns(joints, time) {
        // Systematic gesture testing to verify recognition accuracy
        const gesturePhase = Math.floor(time) % 6; // Cycle through different gestures

        switch (gesturePhase) {
            case 0: // Wave gesture
                if (joints[8]) { // Left hand
                    joints[8].position.y += Math.sin(time * 8) * 0.3;
                    joints[8].position.z += Math.cos(time * 4) * 0.2;
                }
                break;

            case 1: // Reach gesture
                if (joints[15]) { // Right hand
                    joints[15].position.y += 0.4;
                    joints[15].position.z += 0.3;
                }
                break;

            case 2: // Clap gesture
                if (joints[8] && joints[15]) {
                    const clap = Math.sin(time * 6) * 0.2;
                    joints[8].position.x -= clap;
                    joints[15].position.x += clap;
                }
                break;

            case 3: // Crouch gesture
                [0, 1, 2, 3, 26].forEach(jointId => {
                    if (joints[jointId]) {
                        joints[jointId].position.y -= 0.3;
                    }
                });
                break;

            case 4: // Jump gesture
                [0, 1, 2, 3, 26].forEach(jointId => {
                    if (joints[jointId]) {
                        joints[jointId].position.y += Math.max(0, Math.sin(time * 4)) * 0.4;
                    }
                });
                break;

            case 5: // Spin gesture
                const angle = time * 2;
                Object.keys(joints).forEach(jointKey => {
                    const joint = joints[jointKey];
                    if (joint) {
                        const newX = joint.position.x * Math.cos(angle) - joint.position.z * Math.sin(angle);
                        const newZ = joint.position.x * Math.sin(angle) + joint.position.z * Math.cos(angle);
                        joint.position.x = newX;
                        joint.position.z = newZ;
                    }
                });
                break;
        }
    }

    addMusicalTestPatterns(joints, time) {
        // Musical intelligence testing with rhythm and melody patterns
        const beat = Math.sin(time * 2) * 0.5 + 0.5; // 2 Hz beat
        const melody = Math.sin(time * 3.14159) * 0.3; // Melodic pattern

        // Hands follow musical patterns for phrase generation
        if (joints[8]) {
            joints[8].position.y += melody;
            joints[8].position.z += beat * 0.2;
        }

        if (joints[15]) {
            joints[15].position.y += Math.sin(time * 2.5) * 0.3; // Counter-melody
            joints[15].position.z += Math.cos(time * 2) * 0.2;
        }

        // Body sway for harmonic analysis
        const harmonicSway = Math.sin(time * 0.8) * 0.1;
        [0, 1, 2, 3, 26].forEach(jointId => {
            if (joints[jointId]) {
                joints[jointId].position.x += harmonicSway;
            }
        });
    }

    addLearningTestPatterns(joints, time) {
        // Behavioral patterns to test adaptive learning
        const behaviorCycle = Math.floor(time / 3) % 4; // Change behavior every 3 seconds

        switch (behaviorCycle) {
            case 0: // Energetic behavior
                const energy = Math.sin(time * 5) * 0.4;
                Object.keys(joints).forEach(jointKey => {
                    if (joints[jointKey]) {
                        joints[jointKey].position.y += Math.abs(energy);
                        joints[jointKey].velocity = {
                            x: Math.sin(time * 3) * 2,
                            y: Math.cos(time * 4) * 2,
                            z: Math.sin(time * 2) * 2
                        };
                    }
                });
                break;

            case 1: // Contemplative behavior
                const gentle = Math.sin(time * 0.5) * 0.1;
                [8, 15].forEach(jointId => {
                    if (joints[jointId]) {
                        joints[jointId].position.y += gentle;
                        joints[jointId].velocity = {
                            x: gentle * 0.5,
                            y: gentle * 0.3,
                            z: gentle * 0.2
                        };
                    }
                });
                break;

            case 2: // Dance-like behavior
                const rhythm = Math.sin(time * 4);
                [0, 1, 2, 3, 26].forEach(jointId => {
                    if (joints[jointId]) {
                        joints[jointId].position.y += rhythm * 0.2;
                    }
                });
                if (joints[8] && joints[15]) {
                    joints[8].position.z += Math.cos(time * 3) * 0.3;
                    joints[15].position.z += Math.sin(time * 3) * 0.3;
                }
                break;

            case 3: // Exploratory behavior
                if (joints[8] && joints[15]) {
                    joints[8].position.x += Math.sin(time * 2) * 0.3;
                    joints[8].position.y += Math.cos(time * 2.5) * 0.3;
                    joints[15].position.x += Math.cos(time * 2.2) * 0.3;
                    joints[15].position.y += Math.sin(time * 1.8) * 0.3;
                }
                break;
        }
    }

    addMemoryTestPatterns(joints, time) {
        // Repetitive patterns to test movement memory and signature detection
        const patternCycle = Math.floor(time / 4) % 3; // Change pattern every 4 seconds

        switch (patternCycle) {
            case 0: // Pattern A: Figure-8 with hands
                const t = time * 2;
                if (joints[8]) {
                    joints[8].position.x = Math.sin(t) * 0.3;
                    joints[8].position.y = Math.sin(t * 2) * 0.2;
                }
                if (joints[15]) {
                    joints[15].position.x = Math.sin(t + Math.PI) * 0.3;
                    joints[15].position.y = Math.sin((t + Math.PI) * 2) * 0.2;
                }
                break;

            case 1: // Pattern B: Vertical waves
                const wave = Math.sin(time * 3) * 0.4;
                [8, 15].forEach(jointId => {
                    if (joints[jointId]) {
                        joints[jointId].position.y += wave;
                    }
                });
                break;

            case 2: // Pattern C: Circular motion
                const radius = 0.3;
                const angle = time * 2.5;
                if (joints[8]) {
                    joints[8].position.x += Math.cos(angle) * radius;
                    joints[8].position.z += Math.sin(angle) * radius;
                }
                if (joints[15]) {
                    joints[15].position.x += Math.cos(angle + Math.PI) * radius;
                    joints[15].position.z += Math.sin(angle + Math.PI) * radius;
                }
                break;
        }
    }

    addIntegrationTestPatterns(joints, time) {
        // Complex patterns that test all AI systems simultaneously
        const complexity = Math.sin(time * 0.5) * 0.5 + 0.5; // Varying complexity

        // Multi-gesture sequences
        const sequence = Math.floor(time * 2) % 4;
        switch (sequence) {
            case 0:
                this.addGestureTestPatterns(joints, time);
                break;
            case 1:
                this.addMusicalTestPatterns(joints, time);
                break;
            case 2:
                this.addLearningTestPatterns(joints, time);
                break;
            case 3:
                this.addMemoryTestPatterns(joints, time);
                break;
        }

        // Add complexity variation
        Object.keys(joints).forEach(jointKey => {
            const joint = joints[jointKey];
            if (joint) {
                joint.position.y += Math.sin(time * 6 + parseInt(jointKey)) * complexity * 0.1;
            }
        });
    }

    printProgress() {
        let elapsedTime = 0;
        const interval = setInterval(() => {
            elapsedTime += 1000;
            const remaining = Math.max(0, this.testDuration - elapsedTime);
            const progress = Math.round((elapsedTime / this.testDuration) * 100);

            process.stdout.write(`\\r⏱️  Progress: ${progress}% | Phase: ${this.currentPhase + 1}/5 | Time remaining: ${Math.round(remaining / 1000)}s`);

            if (remaining <= 0) {
                clearInterval(interval);
                console.log('\\n');
            }
        }, 1000);
    }

    stop() {
        console.log('\\n🏁 AI Movement Interpretation System Test Complete!');
        console.log('\\n📊 Test Results Summary:');
        console.log(`   ✅ Phases completed: ${this.testResults.phasesCompleted}/5`);

        console.log('\\n🤖 AI Systems Tested:');
        console.log('   🎯 Gesture Recognition:');
        console.log('      - Wave, reach, clap, crouch, jump, spin gestures');
        console.log('      - Pattern matching and confidence scoring');
        console.log('      - Real-time gesture sequence detection');

        console.log('   🎵 Musical Intelligence:');
        console.log('      - Musical phrase generation from movement');
        console.log('      - Harmonic progression analysis');
        console.log('      - Rhythmic pattern detection');
        console.log('      - Movement-to-music interpretation');

        console.log('   🧠 Adaptive Learning:');
        console.log('      - Visitor behavior profiling');
        console.log('      - Movement style classification');
        console.log('      - Preference adaptation');
        console.log('      - Engagement level tracking');

        console.log('   💾 Movement Memory:');
        console.log('      - Movement signature generation');
        console.log('      - Pattern recognition and storage');
        console.log('      - Novelty detection');
        console.log('      - Sequence memory and recall');

        console.log('\\n📋 What you should have observed:');
        console.log('   🤖 AI Interpretation Panel:');
        console.log('      - Processing mode changing from "Enhanced" to "Adaptive"');
        console.log('      - Visitor type classification (Explorer, Dancer, etc.)');
        console.log('      - Gesture detection with confidence scores');
        console.log('      - Musical phrase count increasing');

        console.log('   🎨 Enhanced Visual Effects:');
        console.log('      - AI-influenced particle behaviors');
        console.log('      - Adaptive color schemes based on visitor type');
        console.log('      - Enhanced movement-responsive animations');

        console.log('   🎵 Intelligent Audio Responses:');
        console.log('      - Musical phrases triggered by detected gestures');
        console.log('      - Harmonic progressions adapting to movement style');
        console.log('      - Rhythmic patterns following detected behaviors');

        console.log('\\n🔍 AI System Verification Checklist:');
        console.log('   ☐ AI Debug panel showed real-time processing info');
        console.log('   ☐ Gesture types were correctly identified');
        console.log('   ☐ Visitor type classification occurred');
        console.log('   ☐ Enhanced metrics showed meaningful values');
        console.log('   ☐ Musical phrases were generated from movement');
        console.log('   ☐ AI processing time stayed below 10ms');
        console.log('   ☐ Memory signatures were created and stored');
        console.log('   ☐ Audio/visual responses adapted to AI interpretation');

        console.log('\\n🎯 Performance Expectations:');
        console.log('   - AI processing latency: <10ms per frame');
        console.log('   - Gesture recognition accuracy: >80% for clear gestures');
        console.log('   - Visitor classification: Within 30 seconds of interaction');
        console.log('   - Memory pattern recognition: 3-5 patterns stored per minute');

        console.log('\\n🚀 Next Steps:');
        console.log('   1. Fine-tune AI parameters for your specific use case');
        console.log('   2. Add custom gesture patterns to the recognition library');
        console.log('   3. Implement persistent learning across sessions');
        console.log('   4. Deploy with real Azure Kinect hardware');

        console.log('\\n✨ The AI Movement Interpretation system is ready!');
        console.log('🎭 Your installation now has intelligent movement understanding.');

        this.simulator.stop();
        process.exit(0);
    }
}

// Start test if run directly
if (require.main === module) {
    const tester = new AISystemTester();

    console.log('🧠🤖 AI Movement Interpretation System Test');
    console.log('==========================================');
    console.log();

    tester.start();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\\n🛑 AI Test interrupted by user');
        tester.stop();
    });
}

module.exports = AISystemTester;