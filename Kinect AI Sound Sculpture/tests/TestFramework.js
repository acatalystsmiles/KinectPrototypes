/**
 * Comprehensive Testing Framework for Kinect Sound Sculpture
 * Provides unit testing, integration testing, and performance testing capabilities
 */

class TestFramework {
    constructor() {
        this.tests = new Map();
        this.testSuites = new Map();
        this.results = new Map();
        this.startTime = null;
        this.endTime = null;
        this.config = {
            timeout: 30000, // 30 seconds default timeout
            retries: 3,
            parallel: true,
            verbose: true,
            stopOnFirstFailure: false
        };
        this.hooks = {
            beforeAll: [],
            afterAll: [],
            beforeEach: [],
            afterEach: []
        };
    }

    /**
     * Create a test suite
     */
    suite(name, testFn) {
        if (!this.testSuites.has(name)) {
            this.testSuites.set(name, {
                name,
                tests: [],
                hooks: {
                    beforeAll: [],
                    afterAll: [],
                    beforeEach: [],
                    afterEach: []
                },
                results: []
            });
        }

        const suite = this.testSuites.get(name);
        const originalTest = this.test.bind(this);
        const originalBeforeAll = this.beforeAll.bind(this);
        const originalAfterAll = this.afterAll.bind(this);
        const originalBeforeEach = this.beforeEach.bind(this);
        const originalAfterEach = this.afterEach.bind(this);

        // Override test methods to add to current suite
        this.test = (testName, testFn, options) => {
            suite.tests.push({ name: testName, fn: testFn, options: options || {} });
        };

        this.beforeAll = (fn) => suite.hooks.beforeAll.push(fn);
        this.afterAll = (fn) => suite.hooks.afterAll.push(fn);
        this.beforeEach = (fn) => suite.hooks.beforeEach.push(fn);
        this.afterEach = (fn) => suite.hooks.afterEach.push(fn);

        // Execute suite definition
        testFn();

        // Restore original methods
        this.test = originalTest;
        this.beforeAll = originalBeforeAll;
        this.afterAll = originalAfterAll;
        this.beforeEach = originalBeforeEach;
        this.afterEach = originalAfterEach;
    }

    /**
     * Register a test
     */
    test(name, testFn, options = {}) {
        this.tests.set(name, {
            name,
            fn: testFn,
            options: {
                timeout: options.timeout || this.config.timeout,
                retries: options.retries || this.config.retries,
                skip: options.skip || false,
                only: options.only || false
            }
        });
    }

    /**
     * Register hooks
     */
    beforeAll(fn) { this.hooks.beforeAll.push(fn); }
    afterAll(fn) { this.hooks.afterAll.push(fn); }
    beforeEach(fn) { this.hooks.beforeEach.push(fn); }
    afterEach(fn) { this.hooks.afterEach.push(fn); }

    /**
     * Run all tests
     */
    async run() {
        this.startTime = Date.now();
        console.log('🧪 Starting test execution...');
        console.log('═'.repeat(60));

        try {
            // Run global beforeAll hooks
            await this.runHooks(this.hooks.beforeAll);

            // Run test suites
            for (const [suiteName, suite] of this.testSuites.entries()) {
                await this.runSuite(suite);
            }

            // Run standalone tests
            if (this.tests.size > 0) {
                await this.runStandaloneTests();
            }

            // Run global afterAll hooks
            await this.runHooks(this.hooks.afterAll);

        } catch (error) {
            console.error('💥 Test execution failed:', error);
        } finally {
            this.endTime = Date.now();
            this.printResults();
        }
    }

    /**
     * Run a test suite
     */
    async runSuite(suite) {
        console.log(`\n📦 Suite: ${suite.name}`);
        console.log('─'.repeat(40));

        try {
            // Run suite beforeAll hooks
            await this.runHooks(suite.hooks.beforeAll);

            // Run tests in suite
            for (const test of suite.tests) {
                if (test.options.skip) {
                    console.log(`⏭️  SKIP: ${test.name}`);
                    continue;
                }

                const result = await this.runSingleTest(test, suite.hooks);
                suite.results.push(result);

                if (result.status === 'failed' && this.config.stopOnFirstFailure) {
                    break;
                }
            }

            // Run suite afterAll hooks
            await this.runHooks(suite.hooks.afterAll);

        } catch (error) {
            console.error(`💥 Suite ${suite.name} failed:`, error);
        }
    }

    /**
     * Run standalone tests
     */
    async runStandaloneTests() {
        console.log('\n📝 Standalone Tests');
        console.log('─'.repeat(40));

        for (const [testName, test] of this.tests.entries()) {
            if (test.options.skip) {
                console.log(`⏭️  SKIP: ${testName}`);
                continue;
            }

            const result = await this.runSingleTest(test, this.hooks);
            this.results.set(testName, result);

            if (result.status === 'failed' && this.config.stopOnFirstFailure) {
                break;
            }
        }
    }

    /**
     * Run a single test with retries
     */
    async runSingleTest(test, hooks = {}) {
        const result = {
            name: test.name,
            status: 'pending',
            duration: 0,
            error: null,
            retries: 0,
            startTime: Date.now()
        };

        for (let attempt = 0; attempt <= test.options.retries; attempt++) {
            if (attempt > 0) {
                result.retries++;
                console.log(`🔄 Retry ${attempt} for: ${test.name}`);
            }

            try {
                // Run beforeEach hooks
                await this.runHooks([...this.hooks.beforeEach, ...hooks.beforeEach || []]);

                // Run the test with timeout
                await this.runWithTimeout(test.fn, test.options.timeout);

                // Run afterEach hooks
                await this.runHooks([...this.hooks.afterEach, ...hooks.afterEach || []]);

                result.status = 'passed';
                result.duration = Date.now() - result.startTime;

                console.log(`✅ PASS: ${test.name} (${result.duration}ms)`);
                break;

            } catch (error) {
                result.error = error;

                // Run afterEach hooks even on failure
                try {
                    await this.runHooks([...this.hooks.afterEach, ...hooks.afterEach || []]);
                } catch (hookError) {
                    console.error('Hook error:', hookError);
                }

                if (attempt === test.options.retries) {
                    result.status = 'failed';
                    result.duration = Date.now() - result.startTime;
                    console.log(`❌ FAIL: ${test.name} (${result.duration}ms)`);
                    if (this.config.verbose) {
                        console.log(`   Error: ${error.message}`);
                        if (error.stack) {
                            console.log(`   Stack: ${error.stack.split('\n')[1]?.trim()}`);
                        }
                    }
                }
            }
        }

        return result;
    }

    /**
     * Run hooks
     */
    async runHooks(hooks) {
        for (const hook of hooks) {
            await hook();
        }
    }

    /**
     * Run function with timeout
     */
    async runWithTimeout(fn, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Test timed out after ${timeout}ms`));
            }, timeout);

            Promise.resolve(fn())
                .then(resolve)
                .catch(reject)
                .finally(() => clearTimeout(timer));
        });
    }

    /**
     * Print test results
     */
    printResults() {
        console.log('\n' + '═'.repeat(60));
        console.log('📊 TEST RESULTS');
        console.log('═'.repeat(60));

        let totalTests = 0;
        let passedTests = 0;
        let failedTests = 0;
        let skippedTests = 0;

        // Count suite results
        for (const [suiteName, suite] of this.testSuites.entries()) {
            console.log(`\n📦 ${suiteName}:`);
            for (const result of suite.results) {
                totalTests++;
                if (result.status === 'passed') passedTests++;
                else if (result.status === 'failed') failedTests++;
                else if (result.status === 'skipped') skippedTests++;

                const statusIcon = result.status === 'passed' ? '✅' : '❌';
                console.log(`  ${statusIcon} ${result.name} (${result.duration}ms)`);
            }
        }

        // Count standalone results
        for (const [testName, result] of this.results.entries()) {
            totalTests++;
            if (result.status === 'passed') passedTests++;
            else if (result.status === 'failed') failedTests++;
            else if (result.status === 'skipped') skippedTests++;
        }

        const duration = this.endTime - this.startTime;
        const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;

        console.log('\n📈 SUMMARY:');
        console.log(`   Total: ${totalTests}`);
        console.log(`   ✅ Passed: ${passedTests}`);
        console.log(`   ❌ Failed: ${failedTests}`);
        console.log(`   ⏭️  Skipped: ${skippedTests}`);
        console.log(`   📊 Success Rate: ${successRate}%`);
        console.log(`   ⏱️  Duration: ${duration}ms`);

        if (failedTests === 0) {
            console.log('\n🎉 All tests passed!');
        } else {
            console.log(`\n⚠️  ${failedTests} test(s) failed`);
        }
    }

    /**
     * Assertion methods
     */
    static assert = {
        equal(actual, expected, message) {
            if (actual !== expected) {
                throw new Error(message || `Expected ${expected}, got ${actual}`);
            }
        },

        notEqual(actual, expected, message) {
            if (actual === expected) {
                throw new Error(message || `Expected ${actual} to not equal ${expected}`);
            }
        },

        deepEqual(actual, expected, message) {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error(message || `Objects are not deeply equal`);
            }
        },

        true(value, message) {
            if (value !== true) {
                throw new Error(message || `Expected true, got ${value}`);
            }
        },

        false(value, message) {
            if (value !== false) {
                throw new Error(message || `Expected false, got ${value}`);
            }
        },

        throws(fn, expectedError, message) {
            try {
                fn();
                throw new Error(message || 'Expected function to throw');
            } catch (error) {
                if (expectedError && !(error instanceof expectedError)) {
                    throw new Error(message || `Expected ${expectedError.name}, got ${error.constructor.name}`);
                }
            }
        },

        async throwsAsync(fn, expectedError, message) {
            try {
                await fn();
                throw new Error(message || 'Expected async function to throw');
            } catch (error) {
                if (expectedError && !(error instanceof expectedError)) {
                    throw new Error(message || `Expected ${expectedError.name}, got ${error.constructor.name}`);
                }
            }
        },

        approximately(actual, expected, delta, message) {
            if (Math.abs(actual - expected) > delta) {
                throw new Error(message || `Expected ${actual} to be approximately ${expected} (±${delta})`);
            }
        },

        between(value, min, max, message) {
            if (value < min || value > max) {
                throw new Error(message || `Expected ${value} to be between ${min} and ${max}`);
            }
        },

        isArray(value, message) {
            if (!Array.isArray(value)) {
                throw new Error(message || `Expected array, got ${typeof value}`);
            }
        },

        isObject(value, message) {
            if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                throw new Error(message || `Expected object, got ${typeof value}`);
            }
        },

        hasProperty(object, property, message) {
            if (!(property in object)) {
                throw new Error(message || `Expected object to have property ${property}`);
            }
        },

        lengthOf(array, expectedLength, message) {
            if (array.length !== expectedLength) {
                throw new Error(message || `Expected length ${expectedLength}, got ${array.length}`);
            }
        }
    };
}

// Mock utilities for testing
class MockUtilities {
    static createMockKinectData(bodyCount = 1, options = {}) {
        const skeletons = [];

        for (let i = 0; i < bodyCount; i++) {
            const skeleton = {
                id: i,
                confidence: options.confidence || 0.9,
                joints: this.createMockJoints(options.jointOptions || {}),
                metrics: {
                    overallMotion: options.motion || Math.random() * 0.5,
                    bodyExpansion: options.expansion || Math.random() * 2,
                    jointCount: 25,
                    averageConfidence: options.confidence || 0.9
                }
            };
            skeletons.push(skeleton);
        }

        return {
            timestamp: Date.now(),
            skeletons,
            metrics: {
                totalBodies: bodyCount,
                averageMotion: skeletons.reduce((sum, s) => sum + s.metrics.overallMotion, 0) / bodyCount,
                totalHandActivity: Math.random() * 2,
                groupCohesion: bodyCount > 1 ? Math.random() : 0,
                energyLevel: Math.random() * 3
            }
        };
    }

    static createMockJoints(options = {}) {
        const jointNames = [
            'PELVIS', 'SPINE_NAVAL', 'SPINE_CHEST', 'NECK', 'HEAD',
            'SHOULDER_LEFT', 'ELBOW_LEFT', 'WRIST_LEFT', 'HAND_LEFT', 'HANDTIP_LEFT',
            'SHOULDER_RIGHT', 'ELBOW_RIGHT', 'WRIST_RIGHT', 'HAND_RIGHT', 'HANDTIP_RIGHT',
            'HIP_LEFT', 'KNEE_LEFT', 'ANKLE_LEFT', 'FOOT_LEFT',
            'HIP_RIGHT', 'KNEE_RIGHT', 'ANKLE_RIGHT', 'FOOT_RIGHT'
        ];

        const joints = {};
        const baseX = options.baseX || 0;
        const baseY = options.baseY || 0;
        const baseZ = options.baseZ || 2;

        jointNames.forEach((jointName, index) => {
            joints[jointName] = {
                position: {
                    x: baseX + (Math.random() - 0.5) * 2,
                    y: baseY + (Math.random() - 0.5) * 2,
                    z: baseZ + Math.random() * 2
                },
                confidence: options.confidence || (0.5 + Math.random() * 0.5),
                velocity: {
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 2,
                    z: (Math.random() - 0.5) * 2
                },
                acceleration: {
                    x: (Math.random() - 0.5) * 0.5,
                    y: (Math.random() - 0.5) * 0.5,
                    z: (Math.random() - 0.5) * 0.5
                }
            };
        });

        return joints;
    }

    static createMockAudioContext() {
        return {
            currentTime: 0,
            sampleRate: 44100,
            destination: { connect: () => {}, disconnect: () => {} },
            createGain: () => ({
                gain: { value: 1, setTargetAtTime: () => {} },
                connect: () => {},
                disconnect: () => {}
            }),
            createOscillator: () => ({
                frequency: { value: 440, setTargetAtTime: () => {} },
                type: 'sine',
                connect: () => {},
                disconnect: () => {},
                start: () => {},
                stop: () => {}
            }),
            createBiquadFilter: () => ({
                type: 'lowpass',
                frequency: { value: 1000, setTargetAtTime: () => {} },
                Q: { value: 1, setTargetAtTime: () => {} },
                connect: () => {},
                disconnect: () => {}
            })
        };
    }

    static wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static createPerformanceStub() {
        let now = 0;
        return {
            now: () => now,
            tick: (ms = 16.67) => { now += ms; } // Simulate 60fps by default
        };
    }
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestFramework, MockUtilities };
} else if (typeof window !== 'undefined') {
    window.TestFramework = TestFramework;
    window.MockUtilities = MockUtilities;
}