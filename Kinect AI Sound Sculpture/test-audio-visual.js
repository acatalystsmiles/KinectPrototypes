const KinectDataSimulator = require('./test-data-simulator');

class AudioVisualTester {
    constructor() {
        this.simulator = new KinectDataSimulator();
        this.testDuration = 45000; // 45 seconds for comprehensive test
        this.testPhases = [
            {
                name: 'Initialization & Ambient',
                duration: 5000,
                intensity: 0.1,
                description: 'Test background effects and ambient foundation'
            },
            {
                name: 'Hand Movement Particles',
                duration: 8000,
                intensity: 0.6,
                description: 'Test melodic triggers and hand-based particles'
            },
            {
                name: 'Body Expansion Effects',
                duration: 8000,
                intensity: 0.7,
                description: 'Test harmonic layers and expansion particles'
            },
            {
                name: 'High Energy Synchronization',
                duration: 10000,
                intensity: 1.0,
                description: 'Test beat detection and energy rings'
            },
            {
                name: 'Multi-Person Dynamics',
                duration: 8000,
                intensity: 0.8,
                description: 'Test group cohesion and color palettes'
            },
            {
                name: 'Gradual Return to Calm',
                duration: 6000,
                intensity: 0.3,
                description: 'Test smooth transitions and cleanup'
            }
        ];

        this.currentPhase = 0;
        this.phaseStartTime = 0;
        this.testResults = {
            phasesCompleted: 0,
            errorsDetected: [],
            performanceMetrics: []
        };
    }

    start() {
        console.log('🎭🎵 Starting Audio-Visual Integration Test...');
        console.log('========================================');
        console.log('📊 Test Duration: 45 seconds');
        console.log('🎨 Testing: Particles, Visual Effects, Audio Sync, Beat Detection');
        console.log('🌐 Open http://localhost:3000 to experience the audio-visual test');
        console.log('🔊 IMPORTANT: Click "Start Audio" button when prompted!');
        console.log('📋 Visual Checklist:');
        console.log('   ✅ Dynamic background gradients');
        console.log('   ✅ Particle effects following hands');
        console.log('   ✅ Beat indicators on rhythmic movement');
        console.log('   ✅ Color changes based on movement quality');
        console.log('   ✅ Energy rings on high activity');
        console.log('   ✅ Audio visualization in sidebar');
        console.log();

        // Override simulator for enhanced audio-visual testing
        this.setupEnhancedSimulation();

        // Start the simulator
        this.simulator.start();
        this.phaseStartTime = Date.now();

        console.log(`🎪 Phase 1: ${this.testPhases[0].name}`);
        console.log(`   ${this.testPhases[0].description}`);

        // Auto-stop after test duration
        setTimeout(() => {
            this.stop();
        }, this.testDuration);

        // Print progress updates
        this.printProgress();
    }

    setupEnhancedSimulation() {
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
                    console.log(`\n🎪 Phase ${this.currentPhase + 1}: ${this.testPhases[this.currentPhase].name}`);
                    console.log(`   ${this.testPhases[this.currentPhase].description}`);
                }
            }

            // Apply phase-specific enhancements
            this.enhanceForPhase(body, this.testPhases[this.currentPhase]);

            return body;
        };

        // Override generateSkeletonData for multi-person testing
        const originalGenerateSkeletonData = this.simulator.generateSkeletonData.bind(this.simulator);

        this.simulator.generateSkeletonData = () => {
            const data = originalGenerateSkeletonData();

            // Add second person during multi-person phase
            if (this.currentPhase === 4 && Math.random() < 0.7) {
                const secondPerson = this.simulator.generateBody(1);

                // Position second person differently for group dynamics
                Object.keys(secondPerson.joints).forEach(jointKey => {
                    secondPerson.joints[jointKey].position.x += 1.8;
                    secondPerson.joints[jointKey].position.z += 0.3;
                });

                data.bodies.push(secondPerson);
            }

            return data;
        };
    }

    enhanceForPhase(body, phase) {
        if (!phase) return;

        const time = (Date.now() - this.phaseStartTime) * 0.001;
        const intensity = phase.intensity;
        const joints = body.joints;

        switch (this.currentPhase) {
            case 0: // Initialization & Ambient
                this.addSubtleMovement(joints, time, intensity);
                break;

            case 1: // Hand Movement Particles
                this.addDynamicHandMovement(joints, time, intensity);
                break;

            case 2: // Body Expansion Effects
                this.addExpansionMovement(joints, time, intensity);
                break;

            case 3: // High Energy Synchronization
                this.addRhythmicMovement(joints, time, intensity);
                this.addEnergyBursts(joints, time, intensity);
                break;

            case 4: // Multi-Person Dynamics
                this.addCoordinatedMovement(joints, time, intensity);
                break;

            case 5: // Gradual Return to Calm
                this.addCalmingMovement(joints, time, intensity);
                break;
        }
    }

    addSubtleMovement(joints, time, intensity) {
        // Gentle swaying motion
        const sway = Math.sin(time * 0.5) * intensity * 0.1;

        [0, 1, 2, 3, 26].forEach(jointId => {
            if (joints[jointId]) {
                joints[jointId].position.x += sway;
            }
        });
    }

    addDynamicHandMovement(joints, time, intensity) {
        // Enhanced hand movement for particle generation
        if (joints[8]) { // Left hand
            const handWave = Math.sin(time * 3) * intensity;
            joints[8].position.y += handWave * 0.4;
            joints[8].position.z += Math.cos(time * 2) * intensity * 0.3;
        }

        if (joints[15]) { // Right hand
            const handWave = Math.cos(time * 2.5) * intensity;
            joints[15].position.y += handWave * 0.4;
            joints[15].position.x += Math.sin(time * 3) * intensity * 0.2;
        }
    }

    addExpansionMovement(joints, time, intensity) {
        // Body expansion/contraction cycles
        const expansion = Math.sin(time * 0.8) * intensity;

        // Arms expand/contract
        if (joints[8]) joints[8].position.x -= expansion * 0.3;
        if (joints[15]) joints[15].position.x += expansion * 0.3;

        // Legs expand/contract
        if (joints[21]) joints[21].position.x -= expansion * 0.15;
        if (joints[25]) joints[25].position.x += expansion * 0.15;
    }

    addRhythmicMovement(joints, time, intensity) {
        // Strong rhythmic beats for beat detection
        const beat = Math.sin(time * 4) * intensity;
        const beatTrigger = beat > 0.8;

        if (beatTrigger) {
            // Quick hand gestures on beats
            if (joints[8]) {
                joints[8].position.y += 0.2;
                joints[8].position.z += 0.15;
            }
            if (joints[15]) {
                joints[15].position.y += 0.2;
                joints[15].position.z += 0.15;
            }
        }

        // Vertical bounce on strong beats
        const bounce = Math.max(0, beat) * 0.2;
        [0, 1, 2, 3, 26].forEach(jointId => {
            if (joints[jointId]) {
                joints[jointId].position.y += bounce;
            }
        });
    }

    addEnergyBursts(joints, time, intensity) {
        // Sudden energy bursts for energy ring generation
        if (Math.random() < 0.1) { // 10% chance per frame
            const burstIntensity = intensity * 2;

            // All joints move outward from center
            Object.keys(joints).forEach(jointKey => {
                const joint = joints[jointKey];
                if (joint) {
                    const distance = Math.sqrt(joint.position.x ** 2 + joint.position.z ** 2);
                    if (distance > 0) {
                        joint.position.x += (joint.position.x / distance) * burstIntensity * 0.1;
                        joint.position.z += (joint.position.z / distance) * burstIntensity * 0.1;
                    }
                }
            });
        }
    }

    addCoordinatedMovement(joints, time, intensity) {
        // Coordinated movement for group dynamics testing
        const groupWave = Math.sin(time * 1.5) * intensity;

        // All joints move in harmony
        Object.keys(joints).forEach(jointKey => {
            if (joints[jointKey]) {
                joints[jointKey].position.y += groupWave * 0.1;
                joints[jointKey].position.x += Math.cos(time * 1.2) * intensity * 0.05;
            }
        });
    }

    addCalmingMovement(joints, time, intensity) {
        // Gradual decrease in movement
        const calm = Math.sin(time * 0.3) * intensity * 0.5;

        [8, 15].forEach(jointId => { // Just hands
            if (joints[jointId]) {
                joints[jointId].position.y += calm * 0.1;
            }
        });
    }

    printProgress() {
        let elapsedTime = 0;
        const interval = setInterval(() => {
            elapsedTime += 1000;
            const remaining = Math.max(0, this.testDuration - elapsedTime);
            const progress = Math.round((elapsedTime / this.testDuration) * 100);

            process.stdout.write(`\r⏱️  Progress: ${progress}% | Phase: ${this.currentPhase + 1}/6 | Time remaining: ${Math.round(remaining / 1000)}s`);

            if (remaining <= 0) {
                clearInterval(interval);
                console.log('\n');
            }
        }, 1000);
    }

    stop() {
        console.log('\n🏁 Audio-Visual Integration Test Complete!');
        console.log('\n📊 Test Results Summary:');
        console.log(`   ✅ Phases completed: ${this.testResults.phasesCompleted}/6`);
        console.log(`   🎨 Visual systems tested:`);
        console.log('      - Dynamic background gradients');
        console.log('      - Movement-responsive particles');
        console.log('      - Audio-synchronized beat indicators');
        console.log('      - Color temperature adaptation');
        console.log('      - Energy visualization rings');
        console.log('      - Multi-person color coordination');

        console.log('\n📋 What you should have experienced:');
        console.log('   🎵 Audio Layers:');
        console.log('      - Ambient foundation responding to energy');
        console.log('      - Melodic notes triggered by hand movements');
        console.log('      - Harmonic chords changing with body expansion');
        console.log('      - Rhythmic beats following movement patterns');

        console.log('   🎨 Visual Effects:');
        console.log('      - Particles flowing from moving hands');
        console.log('      - Background colors shifting with movement quality');
        console.log('      - Beat indicators appearing on rhythmic movement');
        console.log('      - Energy rings on high activity phases');
        console.log('      - Smooth color transitions between phases');

        console.log('\n🔍 Verification Checklist:');
        console.log('   ☐ Audio started automatically on movement');
        console.log('   ☐ Particles generated from hand movement');
        console.log('   ☐ Background changed colors during phases');
        console.log('   ☐ Beat indicators appeared during rhythmic phase');
        console.log('   ☐ Energy rings during high-energy phase');
        console.log('   ☐ Multiple people had different colors');
        console.log('   ☐ Audio latency stayed below 50ms');
        console.log('   ☐ Frame rate remained smooth (>30 FPS)');

        console.log('\n🎯 Next Steps:');
        console.log('   1. Fine-tune visual parameters for your space');
        console.log('   2. Test with real Azure Kinect hardware');
        console.log('   3. Add Phase 3: AI Movement Interpretation');
        console.log('   4. Implement museum-ready features');

        console.log('\n✨ The audio-visual foundation is ready!');

        this.simulator.stop();
        process.exit(0);
    }
}

// Start test if run directly
if (require.main === module) {
    const tester = new AudioVisualTester();

    console.log('🎭🎵 Audio-Visual Integration Test');
    console.log('==================================');
    console.log();

    tester.start();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Test interrupted by user');
        tester.stop();
    });
}

module.exports = AudioVisualTester;