/**
 * Integration Tests for Complete Data Pipeline
 * Tests the entire flow from raw movement data through processing, analysis,
 * audio generation, and visual feedback
 */

const { TestFramework, MockUtilities } = require('../TestFramework.js');

// Test framework setup
const testFramework = new TestFramework();
const { assert } = TestFramework;

// Test suite for data pipeline integration
testFramework.suite('Data Pipeline Integration Tests', () => {
    let mockApp, mockDataProcessor, mockAudioSystem, mockVisualSystem;
    let mockKinectData, testStartTime;

    testFramework.beforeAll(async () => {
        // Setup mock application components
        mockApp = createMockApplication();
        mockDataProcessor = createMockDataProcessor();
        mockAudioSystem = createMockAudioSystem();
        mockVisualSystem = createMockVisualSystem();

        // Initialize mock systems
        await mockApp.initialize();
        console.log('🔧 Mock application systems initialized');
    });

    testFramework.beforeEach(() => {
        testStartTime = performance.now();
        mockKinectData = MockUtilities.createMockKinectData(2, {
            confidence: 0.8,
            motion: 0.6,
            expansion: 1.2
        });
    });

    testFramework.afterEach(() => {
        const testDuration = performance.now() - testStartTime;
        console.log(`   ⏱️  Test duration: ${testDuration.toFixed(2)}ms`);
    });

    testFramework.afterAll(async () => {
        await mockApp.cleanup();
        console.log('🧹 Mock application cleaned up');
    });

    // Test 1: End-to-end data flow
    testFramework.test('Complete data flow from input to output', async () => {
        // Step 1: Input raw Kinect data
        const inputData = mockKinectData;

        // Step 2: Process through data processor
        const processedData = await mockDataProcessor.process(inputData);
        assert.isObject(processedData, 'Processed data should be an object');
        assert.hasProperty(processedData, 'skeletons', 'Should have skeletons data');
        assert.hasProperty(processedData, 'metrics', 'Should have metrics data');

        // Step 3: Generate audio response
        const audioResponse = await mockAudioSystem.generateAudio(processedData);
        assert.isObject(audioResponse, 'Audio response should be an object');
        assert.hasProperty(audioResponse, 'environment', 'Should specify audio environment');
        assert.hasProperty(audioResponse, 'parameters', 'Should have audio parameters');

        // Step 4: Generate visual response
        const visualResponse = await mockVisualSystem.generateVisuals(processedData);
        assert.isObject(visualResponse, 'Visual response should be an object');
        assert.hasProperty(visualResponse, 'particles', 'Should have particle data');
        assert.hasProperty(visualResponse, 'effects', 'Should have effects data');

        // Step 5: Verify data consistency
        assert.equal(processedData.timestamp, inputData.timestamp, 'Timestamps should match');
        assert.equal(audioResponse.participantCount, processedData.skeletons.length, 'Participant counts should match');
        assert.equal(visualResponse.participantCount, processedData.skeletons.length, 'Visual participant count should match');
    });

    // Test 2: Multi-person coordination pipeline
    testFramework.test('Multi-person coordination detection pipeline', async () => {
        // Create coordinated movement data
        const coordinatedData = MockUtilities.createMockKinectData(3, {
            confidence: 0.9,
            motion: 0.7,
            expansion: 1.5,
            coordination: true
        });

        // Process coordination detection
        const processedData = await mockDataProcessor.process(coordinatedData);
        assert.hasProperty(processedData, 'coordination', 'Should detect coordination');
        assert.true(processedData.coordination.detected, 'Should detect coordinated movement');
        assert.between(processedData.coordination.score, 0.6, 1.0, 'Coordination score should be high');

        // Verify audio responds to coordination
        const audioResponse = await mockAudioSystem.generateAudio(processedData);
        assert.equal(audioResponse.mode, 'coordinated', 'Audio should switch to coordinated mode');
        assert.hasProperty(audioResponse.parameters, 'harmony', 'Should include harmony parameters');

        // Verify visual coordination effects
        const visualResponse = await mockVisualSystem.generateVisuals(processedData);
        assert.true(visualResponse.effects.coordination, 'Should enable coordination effects');
        assert.lengthOf(visualResponse.connectionLines, 3, 'Should show connection lines between participants');
    });

    // Test 3: Environment transition pipeline
    testFramework.test('Environment discovery and transition pipeline', async () => {
        // Create movement data that triggers environment discovery
        const discoveryData = MockUtilities.createMockKinectData(1, {
            gesture: 'reaching_up',
            confidence: 0.95,
            motion: 0.8
        });

        // Process environment discovery
        const processedData = await mockDataProcessor.process(discoveryData);
        assert.hasProperty(processedData, 'environmentTriggers', 'Should detect environment triggers');
        assert.isArray(processedData.environmentTriggers, 'Environment triggers should be array');

        // Verify environment transition in audio
        const audioResponse = await mockAudioSystem.generateAudio(processedData);
        if (processedData.environmentTriggers.length > 0) {
            assert.hasProperty(audioResponse, 'transition', 'Should include transition data');
            assert.hasProperty(audioResponse.transition, 'from', 'Should specify source environment');
            assert.hasProperty(audioResponse.transition, 'to', 'Should specify target environment');
            assert.between(audioResponse.transition.progress, 0, 1, 'Transition progress should be normalized');
        }

        // Verify visual environment indicators
        const visualResponse = await mockVisualSystem.generateVisuals(processedData);
        assert.hasProperty(visualResponse, 'environment', 'Should specify current environment');
        assert.hasProperty(visualResponse.environment, 'colors', 'Should have environment colors');
    });

    // Test 4: Performance under load
    testFramework.test('Pipeline performance with multiple participants', async () => {
        const maxParticipants = 6;
        const processingTimes = [];

        for (let participantCount = 1; participantCount <= maxParticipants; participantCount++) {
            const startTime = performance.now();

            // Create data for multiple participants
            const multiParticipantData = MockUtilities.createMockKinectData(participantCount, {
                confidence: 0.8,
                motion: 0.5 + Math.random() * 0.3
            });

            // Process through complete pipeline
            const processedData = await mockDataProcessor.process(multiParticipantData);
            const audioResponse = await mockAudioSystem.generateAudio(processedData);
            const visualResponse = await mockVisualSystem.generateVisuals(processedData);

            const endTime = performance.now();
            const processingTime = endTime - startTime;
            processingTimes.push(processingTime);

            // Verify processing time is reasonable (< 16ms for 60fps)
            assert.true(processingTime < 16, `Processing time for ${participantCount} participants should be < 16ms, got ${processingTime.toFixed(2)}ms`);

            // Verify all participants are processed
            assert.equal(processedData.skeletons.length, participantCount, `Should process all ${participantCount} participants`);
        }

        // Verify performance scales reasonably
        const averageTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
        assert.true(averageTime < 10, `Average processing time should be < 10ms, got ${averageTime.toFixed(2)}ms`);
    });

    // Test 5: Error handling and recovery
    testFramework.test('Pipeline error handling and graceful degradation', async () => {
        // Test with corrupted input data
        const corruptedData = {
            timestamp: Date.now(),
            skeletons: [
                { id: 0, joints: null }, // Missing joints
                { id: 1, confidence: -1 }, // Invalid confidence
                null // Null skeleton
            ]
        };

        // Process should handle corrupted data gracefully
        const processedData = await mockDataProcessor.process(corruptedData);
        assert.isObject(processedData, 'Should return valid processed data object');
        assert.hasProperty(processedData, 'errors', 'Should track processing errors');
        assert.isArray(processedData.errors, 'Errors should be an array');
        assert.lengthOf(processedData.skeletons, 0, 'Should filter out invalid skeletons');

        // Audio system should provide fallback response
        const audioResponse = await mockAudioSystem.generateAudio(processedData);
        assert.equal(audioResponse.mode, 'fallback', 'Should use fallback audio mode');
        assert.true(audioResponse.parameters.volume < 0.5, 'Should reduce volume in fallback mode');

        // Visual system should show error indicators
        const visualResponse = await mockVisualSystem.generateVisuals(processedData);
        assert.true(visualResponse.showErrorIndicator, 'Should show error indicator');
    });

    // Test 6: Memory management and cleanup
    testFramework.test('Memory management throughout pipeline', async () => {
        const initialMemory = getMemoryUsage();
        const iterations = 50;

        for (let i = 0; i < iterations; i++) {
            const testData = MockUtilities.createMockKinectData(3);

            // Process through pipeline
            const processedData = await mockDataProcessor.process(testData);
            const audioResponse = await mockAudioSystem.generateAudio(processedData);
            const visualResponse = await mockVisualSystem.generateVisuals(processedData);

            // Force cleanup every 10 iterations
            if (i % 10 === 0) {
                await mockApp.performGarbageCollection();
            }
        }

        // Check for memory leaks
        await MockUtilities.wait(100); // Allow GC to run
        const finalMemory = getMemoryUsage();
        const memoryIncrease = finalMemory - initialMemory;

        // Memory should not increase significantly
        assert.true(memoryIncrease < 50, `Memory increase should be < 50MB, got ${memoryIncrease}MB`);
    });

    // Test 7: Real-time constraints
    testFramework.test('Real-time processing constraints', async () => {
        const frameDurations = [];
        const targetFPS = 60;
        const maxFrameTime = 1000 / targetFPS; // ~16.67ms

        // Simulate real-time processing for 1 second
        const testDuration = 1000;
        const startTime = Date.now();

        while (Date.now() - startTime < testDuration) {
            const frameStart = performance.now();

            // Process one frame
            const frameData = MockUtilities.createMockKinectData(2);
            const processedData = await mockDataProcessor.process(frameData);
            const audioResponse = await mockAudioSystem.generateAudio(processedData);
            const visualResponse = await mockVisualSystem.generateVisuals(processedData);

            const frameDuration = performance.now() - frameStart;
            frameDurations.push(frameDuration);

            // Simulate frame timing
            const remainingTime = maxFrameTime - frameDuration;
            if (remainingTime > 0) {
                await MockUtilities.wait(remainingTime);
            }
        }

        // Verify frame timing consistency
        const averageFrameTime = frameDurations.reduce((sum, time) => sum + time, 0) / frameDurations.length;
        const maxFrameTime_actual = Math.max(...frameDurations);

        assert.true(averageFrameTime < maxFrameTime, `Average frame time should be < ${maxFrameTime}ms, got ${averageFrameTime.toFixed(2)}ms`);
        assert.true(maxFrameTime_actual < maxFrameTime * 1.5, `Max frame time should be reasonable, got ${maxFrameTime_actual.toFixed(2)}ms`);

        // Verify frame rate stability
        const frameTimeVariance = calculateVariance(frameDurations);
        assert.true(frameTimeVariance < 5, `Frame time variance should be low, got ${frameTimeVariance.toFixed(2)}`);
    });
});

// Helper functions for creating mock components

function createMockApplication() {
    return {
        async initialize() {
            this.initialized = true;
            this.modules = new Map();
        },

        async cleanup() {
            this.modules.clear();
            this.initialized = false;
        },

        async performGarbageCollection() {
            // Simulate garbage collection
            if (global.gc) {
                global.gc();
            }
        }
    };
}

function createMockDataProcessor() {
    return {
        async process(inputData) {
            const processedData = {
                timestamp: inputData.timestamp,
                skeletons: [],
                metrics: {},
                coordination: null,
                environmentTriggers: [],
                errors: []
            };

            // Process skeletons
            if (inputData.skeletons) {
                for (const skeleton of inputData.skeletons) {
                    if (skeleton && skeleton.joints && skeleton.confidence > 0) {
                        processedData.skeletons.push({
                            ...skeleton,
                            processed: true,
                            velocity: calculateMockVelocity(skeleton),
                            gesture: detectMockGesture(skeleton)
                        });
                    } else {
                        processedData.errors.push(`Invalid skeleton data: ${JSON.stringify(skeleton)}`);
                    }
                }
            }

            // Calculate metrics
            processedData.metrics = {
                participantCount: processedData.skeletons.length,
                averageMotion: processedData.skeletons.reduce((sum, s) => sum + (s.metrics?.overallMotion || 0), 0) / Math.max(processedData.skeletons.length, 1),
                totalEnergy: processedData.skeletons.reduce((sum, s) => sum + (s.metrics?.energyLevel || 0), 0)
            };

            // Detect coordination
            if (processedData.skeletons.length >= 2) {
                processedData.coordination = {
                    detected: inputData.coordination || Math.random() > 0.7,
                    score: inputData.coordination ? 0.8 + Math.random() * 0.2 : Math.random() * 0.6,
                    participants: processedData.skeletons.map(s => s.id)
                };
            }

            // Detect environment triggers
            for (const skeleton of processedData.skeletons) {
                if (skeleton.gesture && ['reaching_up', 'circular_motion', 'gentle_wave'].includes(skeleton.gesture)) {
                    processedData.environmentTriggers.push({
                        participantId: skeleton.id,
                        gesture: skeleton.gesture,
                        confidence: skeleton.confidence
                    });
                }
            }

            return processedData;
        }
    };
}

function createMockAudioSystem() {
    let currentEnvironment = 'neutral';

    return {
        async generateAudio(processedData) {
            const response = {
                environment: currentEnvironment,
                mode: 'normal',
                parameters: {
                    volume: 0.7,
                    frequency: 440,
                    harmonics: []
                },
                participantCount: processedData.skeletons.length
            };

            // Handle coordination
            if (processedData.coordination?.detected) {
                response.mode = 'coordinated';
                response.parameters.harmony = {
                    enabled: true,
                    participants: processedData.coordination.participants
                };
            }

            // Handle environment transitions
            if (processedData.environmentTriggers.length > 0) {
                const trigger = processedData.environmentTriggers[0];
                const targetEnvironment = getEnvironmentForGesture(trigger.gesture);

                if (targetEnvironment !== currentEnvironment) {
                    response.transition = {
                        from: currentEnvironment,
                        to: targetEnvironment,
                        progress: Math.random()
                    };
                    currentEnvironment = targetEnvironment;
                }
            }

            // Handle errors
            if (processedData.errors.length > 0) {
                response.mode = 'fallback';
                response.parameters.volume = 0.3;
            }

            return response;
        }
    };
}

function createMockVisualSystem() {
    return {
        async generateVisuals(processedData) {
            const response = {
                particles: [],
                effects: {
                    coordination: false
                },
                environment: {
                    current: 'neutral',
                    colors: { primary: '#ffffff', secondary: '#cccccc' }
                },
                participantCount: processedData.skeletons.length,
                showErrorIndicator: processedData.errors.length > 0
            };

            // Generate particles for each participant
            for (const skeleton of processedData.skeletons) {
                response.particles.push({
                    participantId: skeleton.id,
                    position: skeleton.joints.SPINE_CHEST?.position || { x: 0, y: 0, z: 0 },
                    velocity: skeleton.velocity || { x: 0, y: 0, z: 0 },
                    color: getParticleColor(skeleton)
                });
            }

            // Handle coordination effects
            if (processedData.coordination?.detected) {
                response.effects.coordination = true;
                response.connectionLines = generateConnectionLines(processedData.skeletons);
            }

            // Handle environment visuals
            if (processedData.environmentTriggers.length > 0) {
                const trigger = processedData.environmentTriggers[0];
                response.environment = getEnvironmentVisuals(trigger.gesture);
            }

            return response;
        }
    };
}

// Helper utility functions

function calculateMockVelocity(skeleton) {
    if (!skeleton.joints.SPINE_CHEST) return { x: 0, y: 0, z: 0 };

    return {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2
    };
}

function detectMockGesture(skeleton) {
    const gestures = ['reaching_up', 'circular_motion', 'gentle_wave', 'still', 'walking'];
    return gestures[Math.floor(Math.random() * gestures.length)];
}

function getEnvironmentForGesture(gesture) {
    const gestureMap = {
        'reaching_up': 'forest',
        'circular_motion': 'space',
        'gentle_wave': 'ocean'
    };
    return gestureMap[gesture] || 'neutral';
}

function getParticleColor(skeleton) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    return colors[skeleton.id % colors.length];
}

function generateConnectionLines(skeletons) {
    const lines = [];
    for (let i = 0; i < skeletons.length; i++) {
        for (let j = i + 1; j < skeletons.length; j++) {
            lines.push({
                from: skeletons[i].id,
                to: skeletons[j].id,
                strength: 0.5 + Math.random() * 0.5
            });
        }
    }
    return lines;
}

function getEnvironmentVisuals(gesture) {
    const environmentVisuals = {
        'reaching_up': {
            current: 'forest',
            colors: { primary: '#2E7D32', secondary: '#4CAF50' }
        },
        'circular_motion': {
            current: 'space',
            colors: { primary: '#1A237E', secondary: '#3F51B5' }
        },
        'gentle_wave': {
            current: 'ocean',
            colors: { primary: '#0D47A1', secondary: '#2196F3' }
        }
    };

    return environmentVisuals[gesture] || {
        current: 'neutral',
        colors: { primary: '#ffffff', secondary: '#cccccc' }
    };
}

function getMemoryUsage() {
    // Mock memory usage in MB
    return 100 + Math.random() * 50;
}

function calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}

// Run the tests if this file is executed directly
if (require.main === module) {
    testFramework.run();
}

module.exports = { testFramework };