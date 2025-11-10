const KinectDataSimulator = require('./test-data-simulator');

class SoundSystemTester {
    constructor() {
        this.simulator = new KinectDataSimulator();
        this.testDuration = 30000; // 30 seconds
        this.testPhases = [
            { name: 'Subtle Movement', duration: 5000, intensity: 0.3 },
            { name: 'Active Movement', duration: 8000, intensity: 0.7 },
            { name: 'High Energy', duration: 7000, intensity: 1.0 },
            { name: 'Gradual Calm', duration: 5000, intensity: 0.4 },
            { name: 'Stillness', duration: 5000, intensity: 0.1 }
        ];
        this.currentPhase = 0;
        this.phaseStartTime = 0;
    }

    start() {
        console.log('🎭 Starting Sound System Test...');
        console.log('📊 Test will run for 30 seconds with varying movement intensities');
        console.log('🌐 Open http://localhost:3000 in your browser to see and hear the test');
        console.log('📋 Make sure to click "Start Audio" when prompted');
        console.log();

        // Override the simulator's generateBody method for more dynamic testing
        const originalGenerateBody = this.simulator.generateBody.bind(this.simulator);
        this.simulator.generateBody = (bodyId) => {
            const body = originalGenerateBody(bodyId);

            // Get current test phase
            const currentTime = Date.now();
            if (currentTime - this.phaseStartTime > this.testPhases[this.currentPhase]?.duration) {
                this.currentPhase = Math.min(this.currentPhase + 1, this.testPhases.length - 1);
                this.phaseStartTime = currentTime;

                if (this.testPhases[this.currentPhase]) {
                    console.log(`🎪 Phase ${this.currentPhase + 1}: ${this.testPhases[this.currentPhase].name}`);
                }
            }

            // Apply phase intensity to movement
            const phase = this.testPhases[this.currentPhase] || this.testPhases[0];
            const intensity = phase.intensity;

            // Enhance movement based on test phase
            this.enhanceBodyMovement(body, intensity);

            return body;
        };

        // Start the simulator
        this.simulator.start();
        this.phaseStartTime = Date.now();

        console.log(`🎪 Phase 1: ${this.testPhases[0].name}`);

        // Auto-stop after test duration
        setTimeout(() => {
            this.stop();
        }, this.testDuration);

        // Print progress updates
        this.printProgress();
    }

    enhanceBodyMovement(body, intensity) {
        const time = Date.now() * 0.001; // Convert to seconds
        const joints = body.joints;

        if (!joints) return;

        // Scale movement amplitude based on intensity
        const amplitudeScale = intensity;

        // Enhance hand movements for melodic triggers
        if (joints[8]) { // Left hand
            const handWave = Math.sin(time * 2 + Math.PI) * amplitudeScale;
            joints[8].position.y += handWave * 0.3;
            joints[8].position.z += handWave * 0.2;
        }

        if (joints[15]) { // Right hand
            const handWave = Math.cos(time * 2.5) * amplitudeScale;
            joints[15].position.y += handWave * 0.3;
            joints[15].position.z += handWave * 0.2;
        }

        // Create body expansion/contraction cycles
        const expansionCycle = Math.sin(time * 0.5) * amplitudeScale;

        // Expand/contract arms
        if (joints[8]) { // Left hand
            joints[8].position.x -= expansionCycle * 0.2;
        }
        if (joints[15]) { // Right hand
            joints[15].position.x += expansionCycle * 0.2;
        }

        // Add vertical movement (jumping/crouching)
        const verticalMovement = Math.sin(time * 1.5) * amplitudeScale * 0.15;

        // Apply to core joints
        [0, 1, 2, 3, 26].forEach(jointId => { // Pelvis, spine, neck, head
            if (joints[jointId]) {
                joints[jointId].position.y += verticalMovement;
            }
        });

        // Add rhythmic elements
        const rhythmBeat = Math.sin(time * 4) * amplitudeScale;
        if (rhythmBeat > 0.7) {
            // Quick hand gesture for rhythm detection
            if (joints[8]) joints[8].position.y += 0.1;
            if (joints[15]) joints[15].position.y += 0.1;
        }

        // Multi-person scenarios for group cohesion testing
        if (intensity > 0.6 && Math.random() < 0.3) {
            // Sometimes add a second person for group dynamics
            this.addSecondPerson = true;
        }
    }

    printProgress() {
        let elapsedTime = 0;
        const interval = setInterval(() => {
            elapsedTime += 1000;
            const remaining = Math.max(0, this.testDuration - elapsedTime);
            const progress = Math.round((elapsedTime / this.testDuration) * 100);

            process.stdout.write(`\r⏱️  Progress: ${progress}% | Time remaining: ${Math.round(remaining / 1000)}s`);

            if (remaining <= 0) {
                clearInterval(interval);
                console.log('\n');
            }
        }, 1000);
    }

    stop() {
        console.log('\n🏁 Sound System Test Complete!');
        console.log('\n📊 Test Results Summary:');
        console.log('   ✅ Completed all movement phases');
        console.log('   🎵 Audio layers should have been triggered:');
        console.log('      - Ambient Foundation (continuous drone)');
        console.log('      - Melodic Layer (hand movement notes)');
        console.log('      - Harmonic Layer (body expansion chords)');
        console.log('      - Rhythmic Layer (movement beat detection)');
        console.log('\n📋 What to verify in the web interface:');
        console.log('   🔊 Audio controls responded to movement');
        console.log('   📈 Audio visualization showed activity');
        console.log('   📊 Latency stayed below 50ms');
        console.log('   🎶 Multiple synthesis layers were active');
        console.log('\n🎯 Next steps:');
        console.log('   1. Test with real Kinect data using the C# bridge');
        console.log('   2. Fine-tune sound parameters for museum environment');
        console.log('   3. Add more synthesis layers as needed');
        console.log();

        this.simulator.stop();
        process.exit(0);
    }
}

// Enhanced simulator with dual-person support
class EnhancedSimulator extends KinectDataSimulator {
    generateSkeletonData() {
        const data = super.generateSkeletonData();

        // Sometimes add a second person for group dynamics testing
        if (Math.random() < 0.4 && data.bodies.length === 1) {
            const secondPerson = this.generateBody(1);

            // Position second person differently
            Object.keys(secondPerson.joints).forEach(jointKey => {
                secondPerson.joints[jointKey].position.x += 2.0; // 2 meters apart
                secondPerson.joints[jointKey].position.z += 0.5; // Slightly behind
            });

            data.bodies.push(secondPerson);
        }

        return data;
    }
}

// Start test if run directly
if (require.main === module) {
    const tester = new SoundSystemTester();

    console.log('🎵 Kinect Sound System Integration Test');
    console.log('=====================================');
    console.log();

    tester.start();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Test interrupted by user');
        tester.stop();
    });
}

module.exports = SoundSystemTester;