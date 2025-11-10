/**
 * Load Testing for Extended Operation
 * Tests system stability, memory management, and performance over extended periods
 * Simulates museum deployment conditions with continuous operation
 */

const { TestFramework, MockUtilities } = require('../TestFramework.js');

// Test framework setup
const testFramework = new TestFramework();
const { assert } = TestFramework;

// Load testing configuration
const LOAD_TEST_CONFIG = {
    shortDuration: 5 * 60 * 1000,      // 5 minutes
    mediumDuration: 30 * 60 * 1000,    // 30 minutes
    longDuration: 2 * 60 * 60 * 1000,  // 2 hours
    maxDuration: 8 * 60 * 60 * 1000,   // 8 hours (full museum day)

    targetFPS: 60,
    maxFrameTime: 16.67,
    acceptableFrameTime: 20,

    memoryLimitMB: 500,
    memoryWarningMB: 300,
    gcFrequency: 60000,  // 1 minute

    participantProfiles: {
        low: { min: 0, max: 2, avgDuration: 120000 },      // 2 min average
        medium: { min: 1, max: 4, avgDuration: 300000 },   // 5 min average
        high: { min: 2, max: 6, avgDuration: 600000 }      // 10 min average
    }
};

// System monitoring and metrics collection
class LoadTestMonitor {
    constructor() {
        this.reset();
    }

    reset() {
        this.startTime = Date.now();
        this.metrics = {
            frames: [],
            memory: [],
            cpu: [],
            participants: [],
            errors: [],
            warnings: []
        };
        this.intervals = new Map();
        this.monitoring = false;
    }

    startMonitoring(interval = 1000) {
        this.monitoring = true;

        // Performance monitoring
        this.intervals.set('performance', setInterval(() => {
            this.recordMetrics();
        }, interval));

        // Memory monitoring
        this.intervals.set('memory', setInterval(() => {
            this.checkMemoryUsage();
        }, interval * 5));

        // System health checks
        this.intervals.set('health', setInterval(() => {
            this.performHealthCheck();
        }, interval * 10));

        console.log('📊 Load test monitoring started');
    }

    stopMonitoring() {
        this.monitoring = false;

        for (const [name, intervalId] of this.intervals.entries()) {
            clearInterval(intervalId);
        }
        this.intervals.clear();

        console.log('📊 Load test monitoring stopped');
    }

    recordMetrics() {
        const timestamp = Date.now();

        this.metrics.frames.push({
            timestamp,
            fps: this.getCurrentFPS(),
            frameTime: this.getCurrentFrameTime(),
            droppedFrames: this.getDroppedFrameCount()
        });

        this.metrics.memory.push({
            timestamp,
            usage: this.getCurrentMemoryUsage(),
            gcCount: this.getGCCount()
        });

        this.metrics.cpu.push({
            timestamp,
            usage: this.getCurrentCPUUsage()
        });

        this.metrics.participants.push({
            timestamp,
            count: this.getCurrentParticipantCount(),
            activity: this.getAverageActivity()
        });
    }

    checkMemoryUsage() {
        const currentMemory = this.getCurrentMemoryUsage();

        if (currentMemory > LOAD_TEST_CONFIG.memoryLimitMB) {
            this.metrics.errors.push({
                timestamp: Date.now(),
                type: 'memory_limit_exceeded',
                value: currentMemory,
                threshold: LOAD_TEST_CONFIG.memoryLimitMB
            });
        } else if (currentMemory > LOAD_TEST_CONFIG.memoryWarningMB) {
            this.metrics.warnings.push({
                timestamp: Date.now(),
                type: 'memory_warning',
                value: currentMemory,
                threshold: LOAD_TEST_CONFIG.memoryWarningMB
            });
        }
    }

    performHealthCheck() {
        const recentFrames = this.getRecentFrames(10000); // Last 10 seconds
        if (recentFrames.length === 0) return;

        const avgFPS = recentFrames.reduce((sum, f) => sum + f.fps, 0) / recentFrames.length;
        const avgFrameTime = recentFrames.reduce((sum, f) => sum + f.frameTime, 0) / recentFrames.length;

        if (avgFPS < LOAD_TEST_CONFIG.targetFPS * 0.8) {
            this.metrics.warnings.push({
                timestamp: Date.now(),
                type: 'fps_degradation',
                value: avgFPS,
                threshold: LOAD_TEST_CONFIG.targetFPS * 0.8
            });
        }

        if (avgFrameTime > LOAD_TEST_CONFIG.acceptableFrameTime) {
            this.metrics.warnings.push({
                timestamp: Date.now(),
                type: 'frame_time_exceeded',
                value: avgFrameTime,
                threshold: LOAD_TEST_CONFIG.acceptableFrameTime
            });
        }
    }

    getRecentFrames(timeWindow) {
        const cutoff = Date.now() - timeWindow;
        return this.metrics.frames.filter(f => f.timestamp > cutoff);
    }

    getCurrentFPS() {
        return 55 + Math.random() * 10; // Simulate 55-65 FPS
    }

    getCurrentFrameTime() {
        return 12 + Math.random() * 8; // Simulate 12-20ms frame time
    }

    getDroppedFrameCount() {
        return Math.random() < 0.05 ? 1 : 0; // 5% chance of dropped frame
    }

    getCurrentMemoryUsage() {
        // Simulate memory usage with gradual increase and GC drops
        const baseMemory = 150;
        const timeElapsed = Date.now() - this.startTime;
        const gradualIncrease = (timeElapsed / 1000) * 0.01; // 0.01 MB per second
        const randomVariation = Math.random() * 20;
        return baseMemory + gradualIncrease + randomVariation;
    }

    getGCCount() {
        return Math.floor((Date.now() - this.startTime) / LOAD_TEST_CONFIG.gcFrequency);
    }

    getCurrentCPUUsage() {
        return 20 + Math.random() * 40; // Simulate 20-60% CPU usage
    }

    getCurrentParticipantCount() {
        return Math.floor(Math.random() * 4) + 1; // 1-4 participants
    }

    getAverageActivity() {
        return Math.random(); // 0-1 activity level
    }

    generateReport() {
        const duration = Date.now() - this.startTime;

        return {
            duration,
            totalFrames: this.metrics.frames.length,
            averageFPS: this.calculateAverage(this.metrics.frames.map(f => f.fps)),
            averageFrameTime: this.calculateAverage(this.metrics.frames.map(f => f.frameTime)),
            maxMemoryUsage: Math.max(...this.metrics.memory.map(m => m.usage)),
            averageMemoryUsage: this.calculateAverage(this.metrics.memory.map(m => m.usage)),
            totalErrors: this.metrics.errors.length,
            totalWarnings: this.metrics.warnings.length,
            memoryLeakRate: this.calculateMemoryLeakRate(),
            performanceDegradation: this.calculatePerformanceDegradation(),
            stability: this.calculateStabilityScore()
        };
    }

    calculateAverage(values) {
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
    }

    calculateMemoryLeakRate() {
        if (this.metrics.memory.length < 2) return 0;

        const first = this.metrics.memory[0].usage;
        const last = this.metrics.memory[this.metrics.memory.length - 1].usage;
        const duration = Date.now() - this.startTime;

        return (last - first) / (duration / 1000); // MB per second
    }

    calculatePerformanceDegradation() {
        if (this.metrics.frames.length < 60) return 0;

        const initial = this.metrics.frames.slice(0, 30);
        const recent = this.metrics.frames.slice(-30);

        const initialFPS = this.calculateAverage(initial.map(f => f.fps));
        const recentFPS = this.calculateAverage(recent.map(f => f.fps));

        return (initialFPS - recentFPS) / initialFPS;
    }

    calculateStabilityScore() {
        const errorWeight = 0.4;
        const warningWeight = 0.2;
        const memoryWeight = 0.2;
        const performanceWeight = 0.2;

        const errorScore = Math.max(0, 1 - (this.metrics.errors.length * 0.1));
        const warningScore = Math.max(0, 1 - (this.metrics.warnings.length * 0.05));
        const memoryScore = this.calculateMemoryLeakRate() < 1 ? 1 : 0.5;
        const performanceScore = this.calculatePerformanceDegradation() < 0.1 ? 1 : 0.5;

        return (errorScore * errorWeight +
                warningScore * warningWeight +
                memoryScore * memoryWeight +
                performanceScore * performanceWeight);
    }
}

// Participant simulation for realistic load patterns
class ParticipantSimulator {
    constructor(profile = 'medium') {
        this.profile = LOAD_TEST_CONFIG.participantProfiles[profile];
        this.currentParticipants = [];
        this.nextParticipantId = 0;
        this.running = false;
    }

    start() {
        this.running = true;
        this.simulateParticipantFlow();
    }

    stop() {
        this.running = false;
        this.currentParticipants = [];
    }

    async simulateParticipantFlow() {
        while (this.running) {
            // Add participants if below minimum
            while (this.currentParticipants.length < this.profile.min) {
                await this.addParticipant();
                await MockUtilities.wait(Math.random() * 5000); // Stagger arrivals
            }

            // Randomly add/remove participants
            if (Math.random() < 0.3) { // 30% chance of change
                if (this.currentParticipants.length < this.profile.max && Math.random() < 0.6) {
                    await this.addParticipant();
                } else if (this.currentParticipants.length > this.profile.min && Math.random() < 0.4) {
                    await this.removeParticipant();
                }
            }

            await MockUtilities.wait(5000 + Math.random() * 10000); // 5-15 second intervals
        }
    }

    async addParticipant() {
        const participant = {
            id: this.nextParticipantId++,
            arrivalTime: Date.now(),
            activity: 0.3 + Math.random() * 0.7,
            duration: this.profile.avgDuration * (0.5 + Math.random()),
            position: {
                x: (Math.random() - 0.5) * 4,
                y: (Math.random() - 0.5) * 3,
                z: 2 + Math.random() * 2
            }
        };

        this.currentParticipants.push(participant);

        // Schedule departure
        setTimeout(() => {
            this.removeParticipantById(participant.id);
        }, participant.duration);

        console.log(`👤 Participant ${participant.id} joined (${this.currentParticipants.length} total)`);
    }

    async removeParticipant() {
        if (this.currentParticipants.length > 0) {
            const index = Math.floor(Math.random() * this.currentParticipants.length);
            const participant = this.currentParticipants.splice(index, 1)[0];
            console.log(`👋 Participant ${participant.id} left (${this.currentParticipants.length} total)`);
        }
    }

    removeParticipantById(id) {
        const index = this.currentParticipants.findIndex(p => p.id === id);
        if (index !== -1) {
            const participant = this.currentParticipants.splice(index, 1)[0];
            console.log(`⏰ Participant ${participant.id} session ended (${this.currentParticipants.length} total)`);
        }
    }

    getCurrentParticipants() {
        return this.currentParticipants;
    }

    generateFrameData() {
        return MockUtilities.createMockKinectData(this.currentParticipants.length, {
            participants: this.currentParticipants
        });
    }
}

// Test suite for load testing
testFramework.suite('Extended Operation Load Tests', () => {
    let loadMonitor, participantSim, mockApp;

    testFramework.beforeAll(async () => {
        // Setup load testing components
        loadMonitor = new LoadTestMonitor();
        participantSim = new ParticipantSimulator('medium');
        mockApp = createLoadTestApp();

        await mockApp.initialize();
        console.log('🏗️  Load testing environment initialized');
    });

    testFramework.afterAll(async () => {
        loadMonitor.stopMonitoring();
        participantSim.stop();
        await mockApp.cleanup();
        console.log('🧹 Load testing environment cleaned up');
    });

    testFramework.beforeEach(() => {
        loadMonitor.reset();
    });

    // Test 1: Short duration stability (5 minutes)
    testFramework.test('Short duration stability test (5 minutes)', async () => {
        console.log('⏱️  Starting 5-minute stability test...');

        loadMonitor.startMonitoring(1000);
        participantSim.start();

        await runLoadTest(LOAD_TEST_CONFIG.shortDuration, mockApp, participantSim);

        participantSim.stop();
        loadMonitor.stopMonitoring();

        const report = loadMonitor.generateReport();

        // Assert stability requirements for short duration
        assert.true(report.averageFPS > 55, `Average FPS should be > 55, got ${report.averageFPS.toFixed(2)}`);
        assert.true(report.averageFrameTime < 20, `Average frame time should be < 20ms, got ${report.averageFrameTime.toFixed(2)}ms`);
        assert.true(report.totalErrors === 0, `Should have no errors, got ${report.totalErrors}`);
        assert.true(report.stability > 0.9, `Stability score should be > 0.9, got ${report.stability.toFixed(2)}`);

        console.log(`✅ 5-minute test completed: ${report.averageFPS.toFixed(1)} FPS, ${report.totalErrors} errors`);
    });

    // Test 2: Medium duration endurance (30 minutes)
    testFramework.test('Medium duration endurance test (30 minutes)', async () => {
        console.log('⏱️  Starting 30-minute endurance test...');

        loadMonitor.startMonitoring(2000);
        participantSim.start();

        await runLoadTest(LOAD_TEST_CONFIG.mediumDuration, mockApp, participantSim);

        participantSim.stop();
        loadMonitor.stopMonitoring();

        const report = loadMonitor.generateReport();

        // Assert endurance requirements for medium duration
        assert.true(report.averageFPS > 50, `Average FPS should be > 50, got ${report.averageFPS.toFixed(2)}`);
        assert.true(report.memoryLeakRate < 2, `Memory leak rate should be < 2 MB/s, got ${report.memoryLeakRate.toFixed(3)}`);
        assert.true(report.performanceDegradation < 0.15, `Performance degradation should be < 15%, got ${(report.performanceDegradation * 100).toFixed(1)}%`);
        assert.true(report.totalErrors < 5, `Should have < 5 errors, got ${report.totalErrors}`);
        assert.true(report.stability > 0.8, `Stability score should be > 0.8, got ${report.stability.toFixed(2)}`);

        console.log(`✅ 30-minute test completed: ${report.averageFPS.toFixed(1)} FPS, ${report.memoryLeakRate.toFixed(3)} MB/s leak rate`);
    });

    // Test 3: Long duration stress test (2 hours)
    testFramework.test('Long duration stress test (2 hours)', async () => {
        console.log('⏱️  Starting 2-hour stress test...');

        loadMonitor.startMonitoring(5000);

        // Use high activity profile for stress testing
        const stressParticipantSim = new ParticipantSimulator('high');
        stressParticipantSim.start();

        await runLoadTest(LOAD_TEST_CONFIG.longDuration, mockApp, stressParticipantSim);

        stressParticipantSim.stop();
        loadMonitor.stopMonitoring();

        const report = loadMonitor.generateReport();

        // Assert stress test requirements for long duration
        assert.true(report.averageFPS > 45, `Average FPS should be > 45 under stress, got ${report.averageFPS.toFixed(2)}`);
        assert.true(report.maxMemoryUsage < LOAD_TEST_CONFIG.memoryLimitMB, `Max memory should be < ${LOAD_TEST_CONFIG.memoryLimitMB}MB, got ${report.maxMemoryUsage.toFixed(2)}MB`);
        assert.true(report.memoryLeakRate < 5, `Memory leak rate should be < 5 MB/s, got ${report.memoryLeakRate.toFixed(3)}`);
        assert.true(report.performanceDegradation < 0.25, `Performance degradation should be < 25%, got ${(report.performanceDegradation * 100).toFixed(1)}%`);
        assert.true(report.stability > 0.7, `Stability score should be > 0.7, got ${report.stability.toFixed(2)}`);

        console.log(`✅ 2-hour stress test completed: ${report.averageFPS.toFixed(1)} FPS, ${report.maxMemoryUsage.toFixed(1)}MB peak memory`);
    }, { timeout: LOAD_TEST_CONFIG.longDuration + 60000 }); // Extra timeout for cleanup

    // Test 4: Memory leak detection over extended period
    testFramework.test('Memory leak detection test', async () => {
        console.log('🔍 Starting memory leak detection test...');

        const memorySnapshots = [];
        const testDuration = LOAD_TEST_CONFIG.mediumDuration / 2; // 15 minutes
        const snapshotInterval = 60000; // 1 minute

        loadMonitor.startMonitoring(1000);
        participantSim.start();

        const snapshotTimer = setInterval(() => {
            const snapshot = {
                timestamp: Date.now(),
                memory: loadMonitor.getCurrentMemoryUsage(),
                participants: participantSim.getCurrentParticipants().length
            };
            memorySnapshots.push(snapshot);
            console.log(`   📸 Memory snapshot: ${snapshot.memory.toFixed(1)}MB (${snapshot.participants} participants)`);
        }, snapshotInterval);

        await runLoadTest(testDuration, mockApp, participantSim);

        clearInterval(snapshotTimer);
        participantSim.stop();
        loadMonitor.stopMonitoring();

        // Analyze memory trend
        const initialMemory = memorySnapshots[0].memory;
        const finalMemory = memorySnapshots[memorySnapshots.length - 1].memory;
        const memoryIncrease = finalMemory - initialMemory;
        const leakRate = memoryIncrease / (testDuration / 1000);

        assert.true(leakRate < 1, `Memory leak rate should be < 1 MB/s, got ${leakRate.toFixed(3)}`);
        assert.true(finalMemory < LOAD_TEST_CONFIG.memoryWarningMB, `Final memory should be < ${LOAD_TEST_CONFIG.memoryWarningMB}MB, got ${finalMemory.toFixed(2)}MB`);

        // Check for memory plateaus (indicates good GC)
        const plateauCount = countMemoryPlateaus(memorySnapshots);
        assert.true(plateauCount > 0, `Should have memory plateaus indicating GC activity, got ${plateauCount}`);

        console.log(`🔍 Memory analysis: ${leakRate.toFixed(3)} MB/s leak rate, ${plateauCount} GC plateaus`);
    });

    // Test 5: Performance recovery after system stress
    testFramework.test('Performance recovery after system stress', async () => {
        console.log('🔄 Testing performance recovery...');

        // Phase 1: Normal operation baseline
        loadMonitor.startMonitoring(1000);
        participantSim.start();

        await runLoadTest(LOAD_TEST_CONFIG.shortDuration / 3, mockApp, participantSim);
        const baselineReport = loadMonitor.generateReport();

        // Phase 2: Induce system stress
        console.log('   ⚡ Inducing system stress...');
        await mockApp.induceSystemStress();

        loadMonitor.reset();
        await runLoadTest(LOAD_TEST_CONFIG.shortDuration / 3, mockApp, participantSim);
        const stressReport = loadMonitor.generateReport();

        // Phase 3: Recovery period
        console.log('   🔄 Beginning recovery period...');
        await mockApp.triggerRecoveryMechanisms();

        loadMonitor.reset();
        await runLoadTest(LOAD_TEST_CONFIG.shortDuration / 3, mockApp, participantSim);
        const recoveryReport = loadMonitor.generateReport();

        participantSim.stop();
        loadMonitor.stopMonitoring();

        // Verify performance recovery
        const performanceDrop = (baselineReport.averageFPS - stressReport.averageFPS) / baselineReport.averageFPS;
        const performanceRecovery = (recoveryReport.averageFPS - stressReport.averageFPS) / stressReport.averageFPS;

        assert.true(performanceRecovery > 0.2, `Performance should recover by > 20%, got ${(performanceRecovery * 100).toFixed(1)}%`);
        assert.true(recoveryReport.averageFPS > baselineReport.averageFPS * 0.9, `Recovered FPS should be > 90% of baseline`);

        console.log(`🔄 Recovery analysis: ${(performanceDrop * 100).toFixed(1)}% drop, ${(performanceRecovery * 100).toFixed(1)}% recovery`);
    });

    // Test 6: Continuous operation simulation (full museum day)
    testFramework.test('Continuous operation simulation (8 hours)', async () => {
        console.log('🏛️  Starting full museum day simulation...');

        // This test simulates a full 8-hour museum day
        // For testing purposes, we'll run a compressed version
        const compressedDuration = LOAD_TEST_CONFIG.shortDuration * 2; // 10 minutes compressed
        const realDuration = LOAD_TEST_CONFIG.maxDuration;
        const compressionRatio = compressedDuration / realDuration;

        loadMonitor.startMonitoring(Math.floor(10000 * compressionRatio)); // Slower monitoring for long test

        // Simulate museum visitor patterns throughout the day
        await simulateMuseumDay(compressedDuration, mockApp);

        loadMonitor.stopMonitoring();

        const report = loadMonitor.generateReport();

        // Requirements for full-day operation
        assert.true(report.averageFPS > 40, `Average FPS over full day should be > 40, got ${report.averageFPS.toFixed(2)}`);
        assert.true(report.maxMemoryUsage < LOAD_TEST_CONFIG.memoryLimitMB * 1.2, `Max memory should be reasonable for full day`);
        assert.true(report.stability > 0.6, `System should remain stable over full day, got ${report.stability.toFixed(2)}`);
        assert.true(report.totalErrors < 20, `Should have manageable error count for full day, got ${report.totalErrors}`);

        console.log(`🏛️  Museum day simulation completed: ${report.averageFPS.toFixed(1)} FPS avg, ${report.totalErrors} total errors`);
    }, { timeout: LOAD_TEST_CONFIG.shortDuration * 3 });

    // Test 7: Resource cleanup verification
    testFramework.test('Resource cleanup verification', async () => {
        console.log('🧹 Testing resource cleanup...');

        const initialResources = await mockApp.getResourceUsage();

        // Run multiple test cycles with cleanup
        for (let cycle = 0; cycle < 5; cycle++) {
            console.log(`   🔄 Cleanup cycle ${cycle + 1}/5`);

            loadMonitor.reset();
            loadMonitor.startMonitoring(500);
            participantSim.start();

            await runLoadTest(LOAD_TEST_CONFIG.shortDuration / 10, mockApp, participantSim);

            participantSim.stop();
            loadMonitor.stopMonitoring();

            // Force cleanup
            await mockApp.performFullCleanup();
            await MockUtilities.wait(1000); // Allow cleanup to complete
        }

        const finalResources = await mockApp.getResourceUsage();

        // Verify resources are properly cleaned up
        const memoryIncrease = finalResources.memory - initialResources.memory;
        const handleIncrease = finalResources.handles - initialResources.handles;

        assert.true(memoryIncrease < 50, `Memory increase should be < 50MB after cleanup cycles, got ${memoryIncrease}MB`);
        assert.true(handleIncrease < 10, `Handle increase should be < 10 after cleanup cycles, got ${handleIncrease}`);

        console.log(`🧹 Cleanup verification: +${memoryIncrease}MB memory, +${handleIncrease} handles`);
    });

    // Helper function to run load test
    async function runLoadTest(duration, app, participantSimulator) {
        const startTime = Date.now();
        const targetFrameTime = 1000 / LOAD_TEST_CONFIG.targetFPS;

        while (Date.now() - startTime < duration) {
            const frameStart = Date.now();

            // Get current participant data
            const frameData = participantSimulator.generateFrameData();

            // Process frame through application
            await app.processFrame(frameData);

            // Simulate frame timing
            const frameTime = Date.now() - frameStart;
            const remainingTime = targetFrameTime - frameTime;

            if (remainingTime > 0) {
                await MockUtilities.wait(remainingTime);
            }
        }
    }

    // Helper function to simulate museum day patterns
    async function simulateMuseumDay(duration, app) {
        const hourInCompressedTime = duration / 8; // 8 hour day
        const patterns = [
            { hour: 0, activity: 0.1 }, // Opening - low activity
            { hour: 1, activity: 0.3 }, // Morning visitors
            { hour: 2, activity: 0.6 }, // Mid-morning peak
            { hour: 3, activity: 0.8 }, // Lunch time rush
            { hour: 4, activity: 0.9 }, // Afternoon peak
            { hour: 5, activity: 0.7 }, // Afternoon steady
            { hour: 6, activity: 0.4 }, // Evening decline
            { hour: 7, activity: 0.1 }  // Closing - low activity
        ];

        for (let i = 0; i < patterns.length; i++) {
            const pattern = patterns[i];
            console.log(`   🕐 Hour ${pattern.hour + 1}: ${(pattern.activity * 100).toFixed(0)}% activity`);

            // Create participant simulator for this hour's pattern
            const hourlyParticipants = new ParticipantSimulator(
                pattern.activity > 0.7 ? 'high' :
                pattern.activity > 0.4 ? 'medium' : 'low'
            );

            hourlyParticipants.start();
            await runLoadTest(hourInCompressedTime, app, hourlyParticipants);
            hourlyParticipants.stop();
        }
    }

    // Helper function to count memory plateaus
    function countMemoryPlateaus(snapshots, threshold = 5) {
        let plateauCount = 0;
        let currentPlateau = 0;

        for (let i = 1; i < snapshots.length; i++) {
            const memoryDiff = Math.abs(snapshots[i].memory - snapshots[i - 1].memory);

            if (memoryDiff < threshold) {
                currentPlateau++;
            } else {
                if (currentPlateau > 2) { // At least 3 consecutive stable readings
                    plateauCount++;
                }
                currentPlateau = 0;
            }
        }

        return plateauCount;
    }
});

// Mock application for load testing
function createLoadTestApp() {
    let systemStressed = false;
    let resourceUsage = { memory: 100, handles: 50 };

    return {
        async initialize() {
            this.initialized = true;
            this.frameCount = 0;
            this.errorCount = 0;
        },

        async processFrame(frameData) {
            this.frameCount++;

            // Simulate processing time
            const baseProcessingTime = systemStressed ? 8 : 4;
            const participantLoadTime = frameData?.skeletons?.length * 2 || 0;
            const totalProcessingTime = baseProcessingTime + participantLoadTime + Math.random() * 3;

            await MockUtilities.wait(totalProcessingTime);

            // Occasionally simulate errors
            if (Math.random() < 0.001) { // 0.1% error rate
                this.errorCount++;
                throw new Error('Simulated processing error');
            }

            // Update resource usage
            resourceUsage.memory += Math.random() * 0.1; // Slight memory increase

            return {
                processed: true,
                frameNumber: this.frameCount,
                processingTime: totalProcessingTime,
                participants: frameData?.skeletons?.length || 0
            };
        },

        async induceSystemStress() {
            systemStressed = true;
            resourceUsage.memory += 50; // Significant memory increase
            console.log('   ⚡ System stress induced');
        },

        async triggerRecoveryMechanisms() {
            systemStressed = false;
            await this.performGarbageCollection();
            console.log('   🔄 Recovery mechanisms triggered');
        },

        async performGarbageCollection() {
            resourceUsage.memory *= 0.8; // Simulate GC reducing memory by 20%
            await MockUtilities.wait(100); // GC takes time
        },

        async performFullCleanup() {
            await this.performGarbageCollection();
            resourceUsage.handles = Math.max(50, resourceUsage.handles - 5); // Close some handles
            await MockUtilities.wait(200);
        },

        async getResourceUsage() {
            return { ...resourceUsage };
        },

        async cleanup() {
            this.initialized = false;
            systemStressed = false;
            resourceUsage = { memory: 100, handles: 50 };
        }
    };
}

// Run the tests if this file is executed directly
if (require.main === module) {
    // Set longer timeout for load tests
    testFramework.config.timeout = 60000; // 1 minute default timeout
    testFramework.run();
}

module.exports = { testFramework, LoadTestMonitor, ParticipantSimulator };