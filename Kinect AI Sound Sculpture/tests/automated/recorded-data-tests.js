/**
 * Automated Testing with Recorded Movement Data
 * Tests system behavior using recorded movement sequences for reproducible testing
 */

const { TestFramework, MockUtilities } = require('../TestFramework.js');
const fs = require('fs').promises;
const path = require('path');

// Test framework setup
const testFramework = new TestFramework();
const { assert } = TestFramework;

// Recorded data management
class RecordedDataManager {
    constructor(dataDirectory = './tests/data/recorded') {
        this.dataDirectory = dataDirectory;
        this.datasets = new Map();
        this.currentPlayback = null;
    }

    async initialize() {
        try {
            await this.ensureDataDirectory();
            await this.loadRecordedDatasets();
            console.log(`📁 Loaded ${this.datasets.size} recorded datasets`);
        } catch (error) {
            console.warn('⚠️  Could not load recorded datasets, using generated data');
            await this.generateTestDatasets();
        }
    }

    async ensureDataDirectory() {
        try {
            await fs.access(this.dataDirectory);
        } catch {
            await fs.mkdir(this.dataDirectory, { recursive: true });
        }
    }

    async loadRecordedDatasets() {
        const files = await fs.readdir(this.dataDirectory);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        for (const file of jsonFiles) {
            try {
                const filePath = path.join(this.dataDirectory, file);
                const content = await fs.readFile(filePath, 'utf8');
                const dataset = JSON.parse(content);
                const datasetName = path.basename(file, '.json');
                this.datasets.set(datasetName, dataset);
                console.log(`   ✅ Loaded dataset: ${datasetName} (${dataset.frames.length} frames)`);
            } catch (error) {
                console.warn(`   ⚠️  Failed to load ${file}:`, error.message);
            }
        }
    }

    async generateTestDatasets() {
        console.log('🔧 Generating test datasets...');

        // Single person datasets
        await this.createAndSaveDataset('single-person-calm', this.generateSinglePersonSequence('calm', 300));
        await this.createAndSaveDataset('single-person-active', this.generateSinglePersonSequence('active', 300));
        await this.createAndSaveDataset('single-person-gestures', this.generateGestureSequence(1, 400));

        // Multi-person datasets
        await this.createAndSaveDataset('two-person-coordination', this.generateCoordinationSequence(2, 500));
        await this.createAndSaveDataset('three-person-group', this.generateGroupSequence(3, 400));
        await this.createAndSaveDataset('duet-mirroring', this.generateMirroringSequence(2, 350));

        // Stress test datasets
        await this.createAndSaveDataset('max-participants', this.generateMaxParticipantSequence(6, 200));
        await this.createAndSaveDataset('rapid-transitions', this.generateTransitionSequence(3, 600));

        // Edge case datasets
        await this.createAndSaveDataset('low-confidence', this.generateLowConfidenceSequence(2, 300));
        await this.createAndSaveDataset('intermittent-tracking', this.generateIntermittentTrackingSequence(2, 300));

        console.log(`✅ Generated ${this.datasets.size} test datasets`);
    }

    async createAndSaveDataset(name, frames) {
        const dataset = {
            name,
            description: `Generated test dataset: ${name}`,
            created: new Date().toISOString(),
            frameCount: frames.length,
            duration: frames.length * 33.33, // Assuming 30fps
            frames
        };

        this.datasets.set(name, dataset);

        try {
            const filePath = path.join(this.dataDirectory, `${name}.json`);
            await fs.writeFile(filePath, JSON.stringify(dataset, null, 2));
            console.log(`   💾 Saved dataset: ${name}`);
        } catch (error) {
            console.warn(`   ⚠️  Failed to save ${name}:`, error.message);
        }
    }

    generateSinglePersonSequence(activity, frameCount) {
        const frames = [];
        const motionLevel = activity === 'active' ? 0.8 : 0.3;

        for (let i = 0; i < frameCount; i++) {
            const time = i * 33.33; // 30fps
            frames.push({
                timestamp: Date.now() + time,
                frameIndex: i,
                data: MockUtilities.createMockKinectData(1, {
                    confidence: 0.7 + Math.random() * 0.3,
                    motion: motionLevel + Math.sin(i * 0.1) * 0.2,
                    expansion: 1.0 + Math.sin(i * 0.05) * 0.5
                })
            });
        }

        return frames;
    }

    generateCoordinationSequence(participants, frameCount) {
        const frames = [];

        for (let i = 0; i < frameCount; i++) {
            const time = i * 33.33;
            const coordinationLevel = Math.sin(i * 0.02) * 0.5 + 0.5; // Varies 0-1

            frames.push({
                timestamp: Date.now() + time,
                frameIndex: i,
                data: MockUtilities.createMockKinectData(participants, {
                    confidence: 0.8,
                    motion: 0.6,
                    coordination: coordinationLevel > 0.6,
                    coordinationStrength: coordinationLevel
                })
            });
        }

        return frames;
    }

    generateGestureSequence(participants, frameCount) {
        const frames = [];
        const gestures = ['reaching_up', 'circular_motion', 'gentle_wave', 'still'];
        let currentGesture = 0;
        let gestureFrameCount = 0;
        const gestureLength = 60; // frames per gesture

        for (let i = 0; i < frameCount; i++) {
            if (gestureFrameCount >= gestureLength) {
                currentGesture = (currentGesture + 1) % gestures.length;
                gestureFrameCount = 0;
            }

            const time = i * 33.33;
            frames.push({
                timestamp: Date.now() + time,
                frameIndex: i,
                gesture: gestures[currentGesture],
                data: MockUtilities.createMockKinectData(participants, {
                    confidence: 0.85,
                    motion: gestures[currentGesture] === 'still' ? 0.1 : 0.7,
                    gesture: gestures[currentGesture]
                })
            });

            gestureFrameCount++;
        }

        return frames;
    }

    generateGroupSequence(participants, frameCount) {
        const frames = [];

        for (let i = 0; i < frameCount; i++) {
            const time = i * 33.33;
            const groupActivity = Math.sin(i * 0.03) * 0.4 + 0.6; // Varies 0.2-1.0

            frames.push({
                timestamp: Date.now() + time,
                frameIndex: i,
                data: MockUtilities.createMockKinectData(participants, {
                    confidence: 0.75,
                    motion: groupActivity,
                    groupActivity: true
                })
            });
        }

        return frames;
    }

    generateMirroringSequence(participants, frameCount) {
        const frames = [];

        for (let i = 0; i < frameCount; i++) {
            const time = i * 33.33;
            const mirroringStrength = Math.cos(i * 0.05) * 0.5 + 0.5;

            frames.push({
                timestamp: Date.now() + time,
                frameIndex: i,
                data: MockUtilities.createMockKinectData(participants, {
                    confidence: 0.8,
                    motion: 0.6,
                    mirroring: true,
                    mirroringStrength
                })
            });
        }

        return frames;
    }

    generateMaxParticipantSequence(participants, frameCount) {
        const frames = [];

        for (let i = 0; i < frameCount; i++) {
            const time = i * 33.33;

            frames.push({
                timestamp: Date.now() + time,
                frameIndex: i,
                data: MockUtilities.createMockKinectData(participants, {
                    confidence: 0.6 + Math.random() * 0.3,
                    motion: 0.5 + Math.random() * 0.4,
                    stress: true
                })
            });
        }

        return frames;
    }

    generateTransitionSequence(participants, frameCount) {
        const frames = [];
        const environments = ['neutral', 'forest', 'space', 'ocean'];
        let currentEnv = 0;
        let transitionFrameCount = 0;
        const transitionInterval = 120; // frames between transitions

        for (let i = 0; i < frameCount; i++) {
            if (transitionFrameCount >= transitionInterval) {
                currentEnv = (currentEnv + 1) % environments.length;
                transitionFrameCount = 0;
            }

            const time = i * 33.33;
            frames.push({
                timestamp: Date.now() + time,
                frameIndex: i,
                environment: environments[currentEnv],
                transition: transitionFrameCount < 30, // First 30 frames are transition
                data: MockUtilities.createMockKinectData(participants, {
                    confidence: 0.8,
                    motion: 0.6,
                    environmentTrigger: transitionFrameCount === 0
                })
            });

            transitionFrameCount++;
        }

        return frames;
    }

    generateLowConfidenceSequence(participants, frameCount) {
        const frames = [];

        for (let i = 0; i < frameCount; i++) {
            const time = i * 33.33;
            const confidence = 0.2 + Math.random() * 0.4; // Low confidence 0.2-0.6

            frames.push({
                timestamp: Date.now() + time,
                frameIndex: i,
                data: MockUtilities.createMockKinectData(participants, {
                    confidence,
                    motion: 0.3,
                    lowQuality: true
                })
            });
        }

        return frames;
    }

    generateIntermittentTrackingSequence(participants, frameCount) {
        const frames = [];

        for (let i = 0; i < frameCount; i++) {
            const time = i * 33.33;
            const trackingLoss = Math.random() < 0.2; // 20% chance of tracking loss

            frames.push({
                timestamp: Date.now() + time,
                frameIndex: i,
                trackingLoss,
                data: trackingLoss ? null : MockUtilities.createMockKinectData(participants, {
                    confidence: 0.8,
                    motion: 0.5
                })
            });
        }

        return frames;
    }

    getDataset(name) {
        return this.datasets.get(name);
    }

    listDatasets() {
        return Array.from(this.datasets.keys());
    }

    createPlayback(datasetName) {
        const dataset = this.datasets.get(datasetName);
        if (!dataset) {
            throw new Error(`Dataset '${datasetName}' not found`);
        }

        return new DatasetPlayback(dataset);
    }
}

// Dataset playback controller
class DatasetPlayback {
    constructor(dataset) {
        this.dataset = dataset;
        this.currentFrame = 0;
        this.playing = false;
        this.playbackSpeed = 1.0;
        this.loop = false;
        this.callbacks = new Map();
    }

    onFrame(callback) {
        const id = Math.random().toString(36).substr(2, 9);
        this.callbacks.set(id, callback);
        return () => this.callbacks.delete(id);
    }

    async play() {
        this.playing = true;
        console.log(`▶️  Playing dataset: ${this.dataset.name} (${this.dataset.frameCount} frames)`);

        while (this.playing && this.currentFrame < this.dataset.frames.length) {
            const frame = this.dataset.frames[this.currentFrame];

            // Notify callbacks
            for (const callback of this.callbacks.values()) {
                try {
                    await callback(frame, this.currentFrame);
                } catch (error) {
                    console.error('Playback callback error:', error);
                }
            }

            this.currentFrame++;

            // Simulate frame timing
            const frameTime = 33.33 / this.playbackSpeed; // Adjust for playback speed
            await MockUtilities.wait(frameTime);
        }

        if (this.loop && this.playing) {
            this.currentFrame = 0;
            return this.play();
        }

        this.playing = false;
        console.log(`⏹️  Playback finished: ${this.dataset.name}`);
    }

    pause() {
        this.playing = false;
    }

    stop() {
        this.playing = false;
        this.currentFrame = 0;
    }

    seek(frameIndex) {
        this.currentFrame = Math.max(0, Math.min(frameIndex, this.dataset.frames.length - 1));
    }

    setSpeed(speed) {
        this.playbackSpeed = Math.max(0.1, Math.min(speed, 10.0));
    }

    setLoop(loop) {
        this.loop = loop;
    }

    getProgress() {
        return this.currentFrame / this.dataset.frames.length;
    }

    getCurrentFrame() {
        return this.dataset.frames[this.currentFrame];
    }
}

// Test suite for recorded data testing
testFramework.suite('Automated Recorded Data Tests', () => {
    let dataManager, mockApp, testResults;

    testFramework.beforeAll(async () => {
        // Initialize recorded data manager
        dataManager = new RecordedDataManager();
        await dataManager.initialize();

        // Setup mock application
        mockApp = createRecordedDataTestApp();
        await mockApp.initialize();

        testResults = new Map();
        console.log('🎬 Recorded data testing system initialized');
    });

    testFramework.afterAll(async () => {
        await mockApp.cleanup();
        console.log('🧹 Recorded data testing cleanup complete');
    });

    // Test 1: Single person movement sequences
    testFramework.test('Single person recorded movement sequences', async () => {
        const datasets = ['single-person-calm', 'single-person-active'];

        for (const datasetName of datasets) {
            console.log(`   🎯 Testing dataset: ${datasetName}`);

            const playback = dataManager.createPlayback(datasetName);
            const results = await runRecordedDataTest(playback, mockApp);

            // Verify consistent behavior
            assert.true(results.processedFrames > 0, `Should process frames from ${datasetName}`);
            assert.true(results.averageProcessingTime < 16, `Processing time should be reasonable for ${datasetName}`);
            assert.true(results.errorRate < 0.05, `Error rate should be low for ${datasetName}: got ${results.errorRate}`);

            testResults.set(datasetName, results);
        }
    });

    // Test 2: Gesture recognition consistency
    testFramework.test('Gesture recognition consistency with recorded data', async () => {
        console.log('   🤏 Testing gesture recognition...');

        const playback = dataManager.createPlayback('single-person-gestures');
        const gestureResults = new Map();

        const unsubscribe = playback.onFrame(async (frame) => {
            if (frame.gesture) {
                const result = await mockApp.processFrame(frame.data);
                if (!gestureResults.has(frame.gesture)) {
                    gestureResults.set(frame.gesture, []);
                }
                gestureResults.get(frame.gesture).push(result.detectedGesture);
            }
        });

        await playback.play();
        unsubscribe();

        // Verify gesture recognition accuracy
        for (const [expectedGesture, detectedGestures] of gestureResults.entries()) {
            const correctDetections = detectedGestures.filter(g => g === expectedGesture).length;
            const accuracy = correctDetections / detectedGestures.length;

            assert.true(accuracy > 0.8, `Gesture '${expectedGesture}' should be detected with > 80% accuracy, got ${(accuracy * 100).toFixed(1)}%`);
        }

        console.log('   📊 Gesture recognition accuracies:');
        for (const [gesture, detections] of gestureResults.entries()) {
            const accuracy = detections.filter(g => g === gesture).length / detections.length;
            console.log(`     ${gesture}: ${(accuracy * 100).toFixed(1)}%`);
        }
    });

    // Test 3: Multi-person coordination detection
    testFramework.test('Multi-person coordination detection with recorded data', async () => {
        const coordinationDatasets = ['two-person-coordination', 'duet-mirroring'];

        for (const datasetName of coordinationDatasets) {
            console.log(`   🤝 Testing coordination dataset: ${datasetName}`);

            const playback = dataManager.createPlayback(datasetName);
            const coordinationResults = [];

            const unsubscribe = playback.onFrame(async (frame) => {
                if (frame.data) {
                    const result = await mockApp.processFrame(frame.data);
                    coordinationResults.push({
                        expected: frame.data.coordination || false,
                        detected: result.coordination?.detected || false,
                        score: result.coordination?.score || 0
                    });
                }
            });

            await playback.play();
            unsubscribe();

            // Analyze coordination detection accuracy
            const correctDetections = coordinationResults.filter(r =>
                r.expected === r.detected
            ).length;
            const accuracy = correctDetections / coordinationResults.length;

            assert.true(accuracy > 0.75, `Coordination detection accuracy should be > 75% for ${datasetName}, got ${(accuracy * 100).toFixed(1)}%`);

            // Verify coordination scores are reasonable
            const coordinatedFrames = coordinationResults.filter(r => r.expected);
            if (coordinatedFrames.length > 0) {
                const averageScore = coordinatedFrames.reduce((sum, r) => sum + r.score, 0) / coordinatedFrames.length;
                assert.true(averageScore > 0.6, `Average coordination score should be > 0.6 for ${datasetName}, got ${averageScore.toFixed(2)}`);
            }
        }
    });

    // Test 4: Environment transition sequences
    testFramework.test('Environment transition sequences', async () => {
        console.log('   🌍 Testing environment transitions...');

        const playback = dataManager.createPlayback('rapid-transitions');
        const transitionResults = [];
        let currentEnvironment = 'neutral';

        const unsubscribe = playback.onFrame(async (frame) => {
            if (frame.data) {
                const result = await mockApp.processFrame(frame.data);

                if (frame.transition) {
                    transitionResults.push({
                        expectedEnvironment: frame.environment,
                        detectedTransition: result.environmentChange || false,
                        currentEnvironment: result.currentEnvironment || 'neutral'
                    });
                }

                if (result.currentEnvironment) {
                    currentEnvironment = result.currentEnvironment;
                }
            }
        });

        await playback.play();
        unsubscribe();

        // Verify environment transitions are detected
        const transitionDetections = transitionResults.filter(r => r.detectedTransition).length;
        const transitionRate = transitionDetections / transitionResults.length;

        assert.true(transitionRate > 0.5, `Environment transitions should be detected at > 50% rate, got ${(transitionRate * 100).toFixed(1)}%`);
    });

    // Test 5: Error handling with problematic data
    testFramework.test('Error handling with low-quality recorded data', async () => {
        const problematicDatasets = ['low-confidence', 'intermittent-tracking'];

        for (const datasetName of problematicDatasets) {
            console.log(`   ⚠️  Testing problematic dataset: ${datasetName}`);

            const playback = dataManager.createPlayback(datasetName);
            const errorResults = [];

            const unsubscribe = playback.onFrame(async (frame) => {
                try {
                    const result = await mockApp.processFrame(frame.data);
                    errorResults.push({
                        hasData: frame.data !== null,
                        processed: result !== null,
                        errors: result?.errors || [],
                        fallback: result?.fallbackMode || false
                    });
                } catch (error) {
                    errorResults.push({
                        hasData: frame.data !== null,
                        processed: false,
                        errors: [error.message],
                        exception: true
                    });
                }
            });

            await playback.play();
            unsubscribe();

            // Verify graceful error handling
            const exceptionsThrown = errorResults.filter(r => r.exception).length;
            const fallbackActivations = errorResults.filter(r => r.fallback).length;

            assert.true(exceptionsThrown === 0, `No exceptions should be thrown for ${datasetName}`);
            assert.true(fallbackActivations > 0, `Fallback mode should be activated for ${datasetName}`);

            console.log(`     Fallback activations: ${fallbackActivations}/${errorResults.length} frames`);
        }
    });

    // Test 6: Performance consistency across datasets
    testFramework.test('Performance consistency across recorded datasets', async () => {
        console.log('   📈 Testing performance consistency...');

        const datasets = dataManager.listDatasets();
        const performanceResults = new Map();

        for (const datasetName of datasets) {
            const playback = dataManager.createPlayback(datasetName);
            const frameTimes = [];

            const unsubscribe = playback.onFrame(async (frame) => {
                const start = performance.now();
                await mockApp.processFrame(frame.data);
                const end = performance.now();
                frameTimes.push(end - start);
            });

            await playback.play();
            unsubscribe();

            const avgFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
            const maxFrameTime = Math.max(...frameTimes);

            performanceResults.set(datasetName, {
                averageFrameTime: avgFrameTime,
                maxFrameTime: maxFrameTime,
                frameCount: frameTimes.length
            });

            // Verify performance requirements
            assert.true(avgFrameTime < 16, `Average frame time should be < 16ms for ${datasetName}, got ${avgFrameTime.toFixed(2)}ms`);
            assert.true(maxFrameTime < 50, `Max frame time should be < 50ms for ${datasetName}, got ${maxFrameTime.toFixed(2)}ms`);
        }

        console.log('   📊 Performance summary:');
        for (const [dataset, perf] of performanceResults.entries()) {
            console.log(`     ${dataset}: ${perf.averageFrameTime.toFixed(2)}ms avg, ${perf.maxFrameTime.toFixed(2)}ms max`);
        }
    });

    // Test 7: Reproducibility verification
    testFramework.test('Reproducibility of results with same recorded data', async () => {
        console.log('   🔄 Testing result reproducibility...');

        const datasetName = 'single-person-gestures';
        const runs = 3;
        const runResults = [];

        for (let run = 0; run < runs; run++) {
            const playback = dataManager.createPlayback(datasetName);
            const frameResults = [];

            const unsubscribe = playback.onFrame(async (frame) => {
                const result = await mockApp.processFrame(frame.data);
                frameResults.push({
                    frameIndex: frame.frameIndex,
                    gesture: result.detectedGesture,
                    confidence: result.confidence,
                    coordination: result.coordination?.score || 0
                });
            });

            await playback.play();
            unsubscribe();

            runResults.push(frameResults);
        }

        // Compare results across runs
        const firstRun = runResults[0];
        for (let runIndex = 1; runIndex < runs; runIndex++) {
            const currentRun = runResults[runIndex];

            assert.equal(currentRun.length, firstRun.length, `Run ${runIndex + 1} should have same frame count as first run`);

            // Compare frame-by-frame results
            let matchingFrames = 0;
            for (let frameIndex = 0; frameIndex < firstRun.length; frameIndex++) {
                const frame1 = firstRun[frameIndex];
                const frame2 = currentRun[frameIndex];

                if (frame1.gesture === frame2.gesture &&
                    Math.abs(frame1.confidence - frame2.confidence) < 0.01) {
                    matchingFrames++;
                }
            }

            const reproducibilityRate = matchingFrames / firstRun.length;
            assert.true(reproducibilityRate > 0.95, `Reproducibility should be > 95% between runs, got ${(reproducibilityRate * 100).toFixed(1)}%`);
        }

        console.log('   ✅ Results are reproducible across multiple runs');
    });

    // Helper function to run recorded data test
    async function runRecordedDataTest(playback, app) {
        const results = {
            processedFrames: 0,
            totalFrames: 0,
            processingTimes: [],
            errors: [],
            startTime: Date.now()
        };

        const unsubscribe = playback.onFrame(async (frame) => {
            results.totalFrames++;

            if (frame.data) {
                const start = performance.now();
                try {
                    await app.processFrame(frame.data);
                    results.processedFrames++;
                    results.processingTimes.push(performance.now() - start);
                } catch (error) {
                    results.errors.push(error.message);
                }
            }
        });

        await playback.play();
        unsubscribe();

        results.endTime = Date.now();
        results.averageProcessingTime = results.processingTimes.reduce((sum, time) => sum + time, 0) / results.processingTimes.length;
        results.errorRate = results.errors.length / results.totalFrames;

        return results;
    }
});

// Mock application for recorded data testing
function createRecordedDataTestApp() {
    return {
        async initialize() {
            this.initialized = true;
            this.currentEnvironment = 'neutral';
        },

        async processFrame(frameData) {
            if (!frameData) {
                return {
                    processed: false,
                    fallbackMode: true,
                    errors: ['No frame data provided']
                };
            }

            // Simulate processing
            await MockUtilities.wait(2 + Math.random() * 8);

            const result = {
                processed: true,
                timestamp: frameData.timestamp,
                detectedGesture: this.detectGesture(frameData),
                confidence: this.calculateConfidence(frameData),
                currentEnvironment: this.currentEnvironment,
                errors: []
            };

            // Handle coordination
            if (frameData.skeletons && frameData.skeletons.length >= 2) {
                result.coordination = {
                    detected: frameData.coordination || Math.random() > 0.7,
                    score: frameData.coordinationStrength || Math.random()
                };
            }

            // Handle environment changes
            if (frameData.environmentTrigger) {
                result.environmentChange = true;
                this.currentEnvironment = this.getNextEnvironment();
            }

            // Handle low quality data
            if (frameData.lowQuality) {
                result.fallbackMode = true;
                result.confidence *= 0.5;
            }

            return result;
        },

        detectGesture(frameData) {
            if (frameData.gesture) {
                return frameData.gesture;
            }

            const gestures = ['reaching_up', 'circular_motion', 'gentle_wave', 'still'];
            return gestures[Math.floor(Math.random() * gestures.length)];
        },

        calculateConfidence(frameData) {
            if (frameData.skeletons && frameData.skeletons.length > 0) {
                return frameData.skeletons[0].confidence || 0.8;
            }
            return 0.5;
        },

        getNextEnvironment() {
            const environments = ['neutral', 'forest', 'space', 'ocean', 'urban'];
            const currentIndex = environments.indexOf(this.currentEnvironment);
            return environments[(currentIndex + 1) % environments.length];
        },

        async cleanup() {
            this.initialized = false;
        }
    };
}

// Run the tests if this file is executed directly
if (require.main === module) {
    testFramework.run();
}

module.exports = { testFramework, RecordedDataManager, DatasetPlayback };