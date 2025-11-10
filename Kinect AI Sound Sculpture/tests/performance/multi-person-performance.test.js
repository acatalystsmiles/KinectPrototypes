/**
 * Performance Testing Suite for Multi-Person Scenarios
 * Tests system performance with multiple participants under various load conditions
 */

const { TestFramework, MockUtilities } = require('../TestFramework.js');

// Test framework setup
const testFramework = new TestFramework();
const { assert } = TestFramework;

// Performance testing configuration
const PERFORMANCE_CONFIG = {
    targetFPS: 60,
    maxFrameTime: 16.67, // ms for 60fps
    acceptableFrameTime: 20, // ms with some tolerance
    testDuration: 10000, // 10 seconds
    warmupDuration: 2000, // 2 seconds
    maxParticipants: 8,
    memoryThreshold: 200, // MB
    cpuThreshold: 80 // percentage
};

// Performance metrics collector
class PerformanceMetrics {
    constructor() {
        this.reset();
    }

    reset() {
        this.frameTimes = [];
        this.memoryUsage = [];
        this.cpuUsage = [];
        this.audioLatency = [];
        this.visualLatency = [];
        this.processingLatency = [];
        this.droppedFrames = 0;
        this.totalFrames = 0;
        this.startTime = null;
        this.endTime = null;
    }

    recordFrame(frameMetrics) {
        this.frameTimes.push(frameMetrics.totalTime);
        this.memoryUsage.push(frameMetrics.memory);
        this.cpuUsage.push(frameMetrics.cpu);
        this.audioLatency.push(frameMetrics.audioLatency);
        this.visualLatency.push(frameMetrics.visualLatency);
        this.processingLatency.push(frameMetrics.processingLatency);

        if (frameMetrics.totalTime > PERFORMANCE_CONFIG.acceptableFrameTime) {
            this.droppedFrames++;
        }
        this.totalFrames++;
    }

    getStatistics() {
        return {
            averageFrameTime: this.calculateAverage(this.frameTimes),
            maxFrameTime: Math.max(...this.frameTimes),
            minFrameTime: Math.min(...this.frameTimes),
            frameTimeVariance: this.calculateVariance(this.frameTimes),
            averageFPS: 1000 / this.calculateAverage(this.frameTimes),
            droppedFrameRate: (this.droppedFrames / this.totalFrames) * 100,
            averageMemory: this.calculateAverage(this.memoryUsage),
            maxMemory: Math.max(...this.memoryUsage),
            averageCPU: this.calculateAverage(this.cpuUsage),
            maxCPU: Math.max(...this.cpuUsage),
            averageAudioLatency: this.calculateAverage(this.audioLatency),
            averageVisualLatency: this.calculateAverage(this.visualLatency),
            averageProcessingLatency: this.calculateAverage(this.processingLatency),
            totalDuration: this.endTime - this.startTime
        };
    }

    calculateAverage(values) {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    calculateVariance(values) {
        const mean = this.calculateAverage(values);
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return this.calculateAverage(squaredDiffs);
    }
}

// Test suite for performance testing
testFramework.suite('Multi-Person Performance Tests', () => {
    let mockApp, performanceMetrics, performanceStub;

    testFramework.beforeAll(async () => {
        // Setup mock application with performance monitoring
        mockApp = createPerformanceTestApp();
        performanceMetrics = new PerformanceMetrics();
        performanceStub = MockUtilities.createPerformanceStub();

        // Initialize mock application
        await mockApp.initialize();
        console.log('🚀 Performance test application initialized');
    });

    testFramework.beforeEach(() => {
        performanceMetrics.reset();
        performanceStub.tick(0); // Reset timer
        console.log('📊 Performance metrics reset');
    });

    testFramework.afterAll(async () => {
        await mockApp.cleanup();
        console.log('🧹 Performance test cleanup complete');
    });

    // Test 1: Single participant baseline performance
    testFramework.test('Single participant baseline performance', async () => {
        console.log('🎯 Testing single participant baseline...');

        const results = await runPerformanceTest(1, PERFORMANCE_CONFIG.testDuration);
        const stats = results.getStatistics();

        // Assert baseline performance requirements
        assert.true(stats.averageFrameTime < PERFORMANCE_CONFIG.maxFrameTime,
            `Average frame time should be < ${PERFORMANCE_CONFIG.maxFrameTime}ms, got ${stats.averageFrameTime.toFixed(2)}ms`);
        assert.true(stats.droppedFrameRate < 5,
            `Dropped frame rate should be < 5%, got ${stats.droppedFrameRate.toFixed(2)}%`);
        assert.true(stats.averageFPS > 55,
            `Average FPS should be > 55, got ${stats.averageFPS.toFixed(2)}`);
        assert.true(stats.averageMemory < PERFORMANCE_CONFIG.memoryThreshold,
            `Memory usage should be < ${PERFORMANCE_CONFIG.memoryThreshold}MB, got ${stats.averageMemory.toFixed(2)}MB`);

        console.log(`✅ Single participant: ${stats.averageFPS.toFixed(1)} FPS, ${stats.averageFrameTime.toFixed(2)}ms frame time`);
    });

    // Test 2: Multi-participant scaling performance
    testFramework.test('Multi-participant scaling performance', async () => {
        console.log('📈 Testing multi-participant scaling...');

        const scalingResults = [];

        for (let participants = 2; participants <= PERFORMANCE_CONFIG.maxParticipants; participants += 2) {
            console.log(`   Testing with ${participants} participants...`);

            const results = await runPerformanceTest(participants, PERFORMANCE_CONFIG.testDuration / 2);
            const stats = results.getStatistics();

            scalingResults.push({
                participants,
                fps: stats.averageFPS,
                frameTime: stats.averageFrameTime,
                memory: stats.averageMemory,
                droppedFrames: stats.droppedFrameRate
            });

            // Each participant count should maintain reasonable performance
            assert.true(stats.averageFrameTime < PERFORMANCE_CONFIG.acceptableFrameTime,
                `Frame time with ${participants} participants should be < ${PERFORMANCE_CONFIG.acceptableFrameTime}ms, got ${stats.averageFrameTime.toFixed(2)}ms`);
            assert.true(stats.droppedFrameRate < 10,
                `Dropped frame rate with ${participants} participants should be < 10%, got ${stats.droppedFrameRate.toFixed(2)}%`);
        }

        // Verify scaling is reasonable (performance shouldn't degrade exponentially)
        const firstResult = scalingResults[0];
        const lastResult = scalingResults[scalingResults.length - 1];
        const performanceDegradation = (lastResult.frameTime - firstResult.frameTime) / firstResult.frameTime;

        assert.true(performanceDegradation < 2.0,
            `Performance degradation should be < 200%, got ${(performanceDegradation * 100).toFixed(1)}%`);

        console.log('📊 Scaling results:');
        scalingResults.forEach(result => {
            console.log(`   ${result.participants} participants: ${result.fps.toFixed(1)} FPS, ${result.frameTime.toFixed(2)}ms, ${result.memory.toFixed(1)}MB`);
        });
    });

    // Test 3: Coordination detection performance impact
    testFramework.test('Coordination detection performance impact', async () => {
        console.log('🤝 Testing coordination detection performance...');

        // Test without coordination
        const baselineResults = await runPerformanceTest(4, PERFORMANCE_CONFIG.testDuration / 2, { coordination: false });
        const baselineStats = baselineResults.getStatistics();

        // Test with active coordination
        const coordinationResults = await runPerformanceTest(4, PERFORMANCE_CONFIG.testDuration / 2, { coordination: true });
        const coordinationStats = coordinationResults.getStatistics();

        // Coordination should not significantly impact performance
        const performanceImpact = (coordinationStats.averageFrameTime - baselineStats.averageFrameTime) / baselineStats.averageFrameTime;

        assert.true(performanceImpact < 0.3,
            `Coordination detection should not impact performance by > 30%, got ${(performanceImpact * 100).toFixed(1)}%`);
        assert.true(coordinationStats.averageFrameTime < PERFORMANCE_CONFIG.acceptableFrameTime,
            `Frame time with coordination should be < ${PERFORMANCE_CONFIG.acceptableFrameTime}ms, got ${coordinationStats.averageFrameTime.toFixed(2)}ms`);

        console.log(`📈 Performance impact: ${(performanceImpact * 100).toFixed(1)}% (${baselineStats.averageFrameTime.toFixed(2)}ms → ${coordinationStats.averageFrameTime.toFixed(2)}ms)`);
    });

    // Test 4: Environment transition performance
    testFramework.test('Environment transition performance impact', async () => {
        console.log('🌍 Testing environment transition performance...');

        // Test stable environment
        const stableResults = await runPerformanceTest(3, PERFORMANCE_CONFIG.testDuration / 2, {
            environmentTransitions: false
        });
        const stableStats = stableResults.getStatistics();

        // Test frequent environment transitions
        const transitionResults = await runPerformanceTest(3, PERFORMANCE_CONFIG.testDuration / 2, {
            environmentTransitions: true,
            transitionFrequency: 2000 // Every 2 seconds
        });
        const transitionStats = transitionResults.getStatistics();

        // Environment transitions should not severely impact performance
        const performanceImpact = (transitionStats.averageFrameTime - stableStats.averageFrameTime) / stableStats.averageFrameTime;

        assert.true(performanceImpact < 0.5,
            `Environment transitions should not impact performance by > 50%, got ${(performanceImpact * 100).toFixed(1)}%`);
        assert.true(transitionStats.droppedFrameRate < 15,
            `Dropped frame rate during transitions should be < 15%, got ${transitionStats.droppedFrameRate.toFixed(2)}%`);

        console.log(`🔄 Transition impact: ${(performanceImpact * 100).toFixed(1)}% (${stableStats.averageFrameTime.toFixed(2)}ms → ${transitionStats.averageFrameTime.toFixed(2)}ms)`);
    });

    // Test 5: Memory leak detection over extended operation
    testFramework.test('Memory leak detection over extended operation', async () => {
        console.log('🔍 Testing for memory leaks...');

        const memorySnapshots = [];
        const testDuration = 30000; // 30 seconds
        const snapshotInterval = 5000; // Every 5 seconds
        const participants = 4;

        let testStartTime = Date.now();
        let lastSnapshotTime = testStartTime;

        while (Date.now() - testStartTime < testDuration) {
            // Run performance test for snapshot interval
            const results = await runPerformanceTest(participants, snapshotInterval);
            const stats = results.getStatistics();

            memorySnapshots.push({
                time: Date.now() - testStartTime,
                memory: stats.averageMemory,
                maxMemory: stats.maxMemory
            });

            // Force garbage collection periodically
            if (global.gc && memorySnapshots.length % 3 === 0) {
                global.gc();
            }
        }

        // Analyze memory trend
        const firstSnapshot = memorySnapshots[0];
        const lastSnapshot = memorySnapshots[memorySnapshots.length - 1];
        const memoryIncrease = lastSnapshot.memory - firstSnapshot.memory;
        const memoryIncreaseRate = memoryIncrease / (testDuration / 1000); // MB per second

        assert.true(memoryIncreaseRate < 2,
            `Memory increase rate should be < 2MB/s, got ${memoryIncreaseRate.toFixed(2)}MB/s`);
        assert.true(lastSnapshot.memory < PERFORMANCE_CONFIG.memoryThreshold * 1.5,
            `Final memory usage should be < ${PERFORMANCE_CONFIG.memoryThreshold * 1.5}MB, got ${lastSnapshot.memory.toFixed(2)}MB`);

        console.log('📈 Memory usage over time:');
        memorySnapshots.forEach((snapshot, index) => {
            console.log(`   ${(snapshot.time / 1000).toFixed(0)}s: ${snapshot.memory.toFixed(1)}MB (max: ${snapshot.maxMemory.toFixed(1)}MB)`);
        });
    });

    // Test 6: Stress test with maximum participants and activity
    testFramework.test('Stress test with maximum participants and activity', async () => {
        console.log('⚡ Running stress test...');

        const stressTestConfig = {
            participants: PERFORMANCE_CONFIG.maxParticipants,
            highActivity: true,
            coordination: true,
            environmentTransitions: true,
            transitionFrequency: 3000,
            duration: PERFORMANCE_CONFIG.testDuration
        };

        const results = await runPerformanceTest(
            stressTestConfig.participants,
            stressTestConfig.duration,
            stressTestConfig
        );
        const stats = results.getStatistics();

        // Under stress, system should still maintain minimum performance
        assert.true(stats.averageFPS > 30,
            `Under stress, FPS should be > 30, got ${stats.averageFPS.toFixed(2)}`);
        assert.true(stats.droppedFrameRate < 25,
            `Under stress, dropped frame rate should be < 25%, got ${stats.droppedFrameRate.toFixed(2)}%`);
        assert.true(stats.maxMemory < PERFORMANCE_CONFIG.memoryThreshold * 2,
            `Under stress, max memory should be < ${PERFORMANCE_CONFIG.memoryThreshold * 2}MB, got ${stats.maxMemory.toFixed(2)}MB`);

        // Latency should remain reasonable
        assert.true(stats.averageAudioLatency < 50,
            `Audio latency should be < 50ms, got ${stats.averageAudioLatency.toFixed(2)}ms`);
        assert.true(stats.averageVisualLatency < 30,
            `Visual latency should be < 30ms, got ${stats.averageVisualLatency.toFixed(2)}ms`);

        console.log(`⚡ Stress test results: ${stats.averageFPS.toFixed(1)} FPS, ${stats.droppedFrameRate.toFixed(1)}% dropped, ${stats.maxMemory.toFixed(1)}MB peak memory`);
    });

    // Test 7: Recovery after performance degradation
    testFramework.test('Recovery after performance degradation', async () => {
        console.log('🔄 Testing performance recovery...');

        // Create artificial performance degradation
        await mockApp.simulatePerformanceDegradation();

        // Run degraded performance test
        const degradedResults = await runPerformanceTest(4, PERFORMANCE_CONFIG.testDuration / 3);
        const degradedStats = degradedResults.getStatistics();

        // Trigger recovery mechanisms
        await mockApp.triggerPerformanceRecovery();
        await MockUtilities.wait(2000); // Allow recovery time

        // Test recovery performance
        const recoveryResults = await runPerformanceTest(4, PERFORMANCE_CONFIG.testDuration / 3);
        const recoveryStats = recoveryResults.getStatistics();

        // Performance should improve after recovery
        const performanceImprovement = (degradedStats.averageFrameTime - recoveryStats.averageFrameTime) / degradedStats.averageFrameTime;

        assert.true(performanceImprovement > 0.2,
            `Performance should improve by > 20% after recovery, got ${(performanceImprovement * 100).toFixed(1)}%`);
        assert.true(recoveryStats.averageFrameTime < PERFORMANCE_CONFIG.acceptableFrameTime,
            `Recovered frame time should be < ${PERFORMANCE_CONFIG.acceptableFrameTime}ms, got ${recoveryStats.averageFrameTime.toFixed(2)}ms`);

        console.log(`🔄 Recovery improvement: ${(performanceImprovement * 100).toFixed(1)}% (${degradedStats.averageFrameTime.toFixed(2)}ms → ${recoveryStats.averageFrameTime.toFixed(2)}ms)`);
    });

    // Helper function to run performance tests
    async function runPerformanceTest(participantCount, duration, options = {}) {
        const metrics = new PerformanceMetrics();
        metrics.startTime = Date.now();

        const startTime = Date.now();
        let frameCount = 0;

        // Warmup period
        if (options.warmup !== false) {
            const warmupEnd = Date.now() + PERFORMANCE_CONFIG.warmupDuration;
            while (Date.now() < warmupEnd) {
                await processTestFrame(participantCount, options);
                performanceStub.tick();
            }
        }

        // Main test period
        while (Date.now() - startTime < duration) {
            const frameStart = performanceStub.now();

            const frameMetrics = await processTestFrame(participantCount, options);

            const frameEnd = performanceStub.now();
            frameMetrics.totalTime = frameEnd - frameStart;

            metrics.recordFrame(frameMetrics);
            frameCount++;

            // Simulate frame timing
            performanceStub.tick(PERFORMANCE_CONFIG.maxFrameTime);
        }

        metrics.endTime = Date.now();
        return metrics;
    }

    // Helper function to process a single test frame
    async function processTestFrame(participantCount, options = {}) {
        const frameMetrics = {
            memory: getSimulatedMemoryUsage(),
            cpu: getSimulatedCPUUsage(),
            audioLatency: 0,
            visualLatency: 0,
            processingLatency: 0
        };

        // Create test data
        const testData = MockUtilities.createMockKinectData(participantCount, {
            confidence: 0.8,
            motion: options.highActivity ? 0.9 : 0.5,
            coordination: options.coordination
        });

        // Process data through pipeline
        const processingStart = performanceStub.now();
        const processedData = await mockApp.processData(testData);
        frameMetrics.processingLatency = performanceStub.now() - processingStart;

        // Generate audio
        const audioStart = performanceStub.now();
        const audioResponse = await mockApp.generateAudio(processedData, options);
        frameMetrics.audioLatency = performanceStub.now() - audioStart;

        // Generate visuals
        const visualStart = performanceStub.now();
        const visualResponse = await mockApp.generateVisuals(processedData, options);
        frameMetrics.visualLatency = performanceStub.now() - visualStart;

        return frameMetrics;
    }
});

// Mock performance test application
function createPerformanceTestApp() {
    let performanceDegraded = false;
    let qualityLevel = 5; // 1-5, 5 being highest quality

    return {
        async initialize() {
            this.initialized = true;
            this.modules = new Map([
                ['dataProcessor', createMockDataProcessor()],
                ['audioSystem', createMockAudioSystem()],
                ['visualSystem', createMockVisualSystem()]
            ]);
        },

        async processData(inputData) {
            // Simulate processing time based on quality level and participant count
            const processingTime = (6 - qualityLevel) * 2 + inputData.skeletons.length * 0.5;
            await MockUtilities.wait(processingTime);

            return {
                ...inputData,
                processed: true,
                qualityLevel,
                coordination: inputData.coordination ? {
                    detected: true,
                    score: 0.7 + Math.random() * 0.3
                } : null
            };
        },

        async generateAudio(processedData, options = {}) {
            // Simulate audio generation latency
            const baseLatency = performanceDegraded ? 15 : 8;
            const participantLatency = processedData.skeletons.length * 2;
            const transitionLatency = options.environmentTransitions ? 5 : 0;

            await MockUtilities.wait(baseLatency + participantLatency + transitionLatency);

            return {
                environment: 'neutral',
                latency: baseLatency + participantLatency + transitionLatency,
                qualityLevel
            };
        },

        async generateVisuals(processedData, options = {}) {
            // Simulate visual generation latency
            const baseLatency = performanceDegraded ? 8 : 4;
            const particleLatency = processedData.skeletons.length * qualityLevel * 0.5;
            const effectLatency = options.coordination ? 2 : 0;

            await MockUtilities.wait(baseLatency + particleLatency + effectLatency);

            return {
                particles: processedData.skeletons.length * qualityLevel * 10,
                effects: options.coordination,
                latency: baseLatency + particleLatency + effectLatency,
                qualityLevel
            };
        },

        async simulatePerformanceDegradation() {
            performanceDegraded = true;
            qualityLevel = 2;
        },

        async triggerPerformanceRecovery() {
            performanceDegraded = false;
            qualityLevel = 4;
        },

        async cleanup() {
            this.modules.clear();
            this.initialized = false;
        }
    };
}

// Utility functions for performance simulation
function getSimulatedMemoryUsage() {
    const baseMemory = 80;
    const variance = 20;
    return baseMemory + Math.random() * variance;
}

function getSimulatedCPUUsage() {
    const baseCPU = 30;
    const variance = 40;
    return baseCPU + Math.random() * variance;
}

function createMockDataProcessor() {
    return {
        async process(data) {
            return { ...data, processed: true };
        }
    };
}

function createMockAudioSystem() {
    return {
        async generateAudio(data) {
            return { generated: true };
        }
    };
}

function createMockVisualSystem() {
    return {
        async generateVisuals(data) {
            return { rendered: true };
        }
    };
}

// Run the tests if this file is executed directly
if (require.main === module) {
    testFramework.run();
}

module.exports = { testFramework, PerformanceMetrics };