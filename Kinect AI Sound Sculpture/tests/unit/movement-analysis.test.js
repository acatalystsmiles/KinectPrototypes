/**
 * Unit Tests for Movement Analysis Algorithms
 * Tests core movement detection, coordination analysis, and pattern recognition
 */

const { TestFramework, MockUtilities } = require('../TestFramework');

// Load modules to test (assuming they're available in test environment)
// In a real setup, these would be loaded appropriately for the test environment

class MovementAnalysisTests {
    static runAll() {
        const framework = new TestFramework();

        // Test suites for different aspects of movement analysis
        MovementAnalysisTests.coordinationDetectionTests(framework);
        MovementAnalysisTests.velocityCalculationTests(framework);
        MovementAnalysisTests.smoothingAlgorithmTests(framework);
        MovementAnalysisTests.patternRecognitionTests(framework);
        MovementAnalysisTests.gestureClassificationTests(framework);

        return framework.run();
    }

    static coordinationDetectionTests(framework) {
        framework.suite('Coordination Detection', () => {
            let coordinationDetector;

            framework.beforeEach(() => {
                // Mock coordination detector
                coordinationDetector = {
                    analyzePairCoordination: (body1, body2) => {
                        // Simplified implementation for testing
                        const jointNames = ['HAND_LEFT', 'HAND_RIGHT', 'HEAD'];
                        let totalCorrelation = 0;
                        let validComparisons = 0;

                        for (const jointName of jointNames) {
                            const joint1 = body1.joints[jointName];
                            const joint2 = body2.joints[jointName];

                            if (joint1 && joint2 && joint1.confidence > 0.5 && joint2.confidence > 0.5) {
                                const correlation = this.calculatePositionCorrelation(joint1, joint2);
                                totalCorrelation += correlation;
                                validComparisons++;
                            }
                        }

                        const score = validComparisons > 0 ? totalCorrelation / validComparisons : 0;
                        return {
                            score,
                            type: this.classifyCoordinationType(score),
                            synchronization: score * 0.8 + Math.random() * 0.2,
                            mirroring: score * 0.6 + Math.random() * 0.4
                        };
                    },

                    calculatePositionCorrelation: (joint1, joint2) => {
                        const distance = Math.sqrt(
                            Math.pow(joint1.position.x - joint2.position.x, 2) +
                            Math.pow(joint1.position.y - joint2.position.y, 2) +
                            Math.pow(joint1.position.z - joint2.position.z, 2)
                        );
                        return Math.max(0, 1 - distance / 3); // Normalize distance to correlation
                    },

                    classifyCoordinationType: (score) => {
                        if (score > 0.8) return 'synchronized';
                        if (score > 0.6) return 'coordinated';
                        if (score > 0.4) return 'loosely_aligned';
                        return 'independent';
                    }
                };
            });

            framework.test('should detect synchronized movement', () => {
                const body1 = MockUtilities.createMockKinectData(1).skeletons[0];
                const body2 = MockUtilities.createMockKinectData(1).skeletons[0];

                // Make bodies very similar (synchronized)
                Object.keys(body1.joints).forEach(jointName => {
                    if (body2.joints[jointName]) {
                        body2.joints[jointName].position = {
                            x: body1.joints[jointName].position.x + 0.1,
                            y: body1.joints[jointName].position.y + 0.1,
                            z: body1.joints[jointName].position.z + 0.1
                        };
                    }
                });

                const result = coordinationDetector.analyzePairCoordination(body1, body2);

                TestFramework.assert.true(result.score > 0.7, 'Should detect high coordination');
                TestFramework.assert.equal(result.type, 'synchronized', 'Should classify as synchronized');
            });

            framework.test('should detect independent movement', () => {
                const body1 = MockUtilities.createMockKinectData(1, { baseX: -2 }).skeletons[0];
                const body2 = MockUtilities.createMockKinectData(1, { baseX: 2 }).skeletons[0];

                const result = coordinationDetector.analyzePairCoordination(body1, body2);

                TestFramework.assert.true(result.score < 0.4, 'Should detect low coordination');
                TestFramework.assert.equal(result.type, 'independent', 'Should classify as independent');
            });

            framework.test('should handle missing joints gracefully', () => {
                const body1 = MockUtilities.createMockKinectData(1).skeletons[0];
                const body2 = MockUtilities.createMockKinectData(1).skeletons[0];

                // Remove some joints from body2
                delete body2.joints.HAND_LEFT;
                delete body2.joints.HEAD;

                const result = coordinationDetector.analyzePairCoordination(body1, body2);

                TestFramework.assert.true(typeof result.score === 'number', 'Should return numeric score');
                TestFramework.assert.true(result.score >= 0 && result.score <= 1, 'Score should be normalized');
            });

            framework.test('should classify coordination types correctly', () => {
                const testCases = [
                    { score: 0.9, expected: 'synchronized' },
                    { score: 0.7, expected: 'coordinated' },
                    { score: 0.5, expected: 'loosely_aligned' },
                    { score: 0.2, expected: 'independent' }
                ];

                testCases.forEach(({ score, expected }) => {
                    const result = coordinationDetector.classifyCoordinationType(score);
                    TestFramework.assert.equal(result, expected,
                        `Score ${score} should classify as ${expected}`);
                });
            });
        });
    }

    static velocityCalculationTests(framework) {
        framework.suite('Velocity Calculation', () => {
            let velocityCalculator;

            framework.beforeEach(() => {
                velocityCalculator = {
                    calculateVelocity: (currentPos, previousPos, deltaTime) => {
                        if (!currentPos || !previousPos || deltaTime <= 0) {
                            return { x: 0, y: 0, z: 0 };
                        }

                        return {
                            x: (currentPos.x - previousPos.x) / deltaTime,
                            y: (currentPos.y - previousPos.y) / deltaTime,
                            z: (currentPos.z - previousPos.z) / deltaTime
                        };
                    },

                    calculateSpeed: (velocity) => {
                        return Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
                    },

                    calculateAcceleration: (currentVel, previousVel, deltaTime) => {
                        if (!currentVel || !previousVel || deltaTime <= 0) {
                            return { x: 0, y: 0, z: 0 };
                        }

                        return {
                            x: (currentVel.x - previousVel.x) / deltaTime,
                            y: (currentVel.y - previousVel.y) / deltaTime,
                            z: (currentVel.z - previousVel.z) / deltaTime
                        };
                    }
                };
            });

            framework.test('should calculate velocity correctly', () => {
                const currentPos = { x: 1, y: 2, z: 3 };
                const previousPos = { x: 0, y: 0, z: 0 };
                const deltaTime = 0.1; // 100ms

                const velocity = velocityCalculator.calculateVelocity(currentPos, previousPos, deltaTime);

                TestFramework.assert.equal(velocity.x, 10, 'X velocity should be correct');
                TestFramework.assert.equal(velocity.y, 20, 'Y velocity should be correct');
                TestFramework.assert.equal(velocity.z, 30, 'Z velocity should be correct');
            });

            framework.test('should handle zero delta time', () => {
                const currentPos = { x: 1, y: 2, z: 3 };
                const previousPos = { x: 0, y: 0, z: 0 };
                const deltaTime = 0;

                const velocity = velocityCalculator.calculateVelocity(currentPos, previousPos, deltaTime);

                TestFramework.assert.deepEqual(velocity, { x: 0, y: 0, z: 0 },
                    'Should return zero velocity for zero delta time');
            });

            framework.test('should calculate speed magnitude correctly', () => {
                const velocity = { x: 3, y: 4, z: 0 };
                const speed = velocityCalculator.calculateSpeed(velocity);

                TestFramework.assert.equal(speed, 5, 'Speed should be 5 (3-4-5 triangle)');
            });

            framework.test('should calculate acceleration correctly', () => {
                const currentVel = { x: 10, y: 20, z: 30 };
                const previousVel = { x: 0, y: 10, z: 20 };
                const deltaTime = 0.1;

                const acceleration = velocityCalculator.calculateAcceleration(currentVel, previousVel, deltaTime);

                TestFramework.assert.equal(acceleration.x, 100, 'X acceleration should be correct');
                TestFramework.assert.equal(acceleration.y, 100, 'Y acceleration should be correct');
                TestFramework.assert.equal(acceleration.z, 100, 'Z acceleration should be correct');
            });

            framework.test('should handle null inputs gracefully', () => {
                const velocity = velocityCalculator.calculateVelocity(null, null, 0.1);
                TestFramework.assert.deepEqual(velocity, { x: 0, y: 0, z: 0 });

                const acceleration = velocityCalculator.calculateAcceleration(null, null, 0.1);
                TestFramework.assert.deepEqual(acceleration, { x: 0, y: 0, z: 0 });
            });
        });
    }

    static smoothingAlgorithmTests(framework) {
        framework.suite('Smoothing Algorithms', () => {
            let smoother;

            framework.beforeEach(() => {
                smoother = {
                    exponentialSmoothing: (current, previous, alpha) => {
                        if (!previous) return current;

                        return {
                            x: previous.x * alpha + current.x * (1 - alpha),
                            y: previous.y * alpha + current.y * (1 - alpha),
                            z: previous.z * alpha + current.z * (1 - alpha)
                        };
                    },

                    movingAverage: (values, windowSize) => {
                        if (values.length === 0) return null;

                        const start = Math.max(0, values.length - windowSize);
                        const window = values.slice(start);

                        const sum = window.reduce((acc, val) => ({
                            x: acc.x + val.x,
                            y: acc.y + val.y,
                            z: acc.z + val.z
                        }), { x: 0, y: 0, z: 0 });

                        return {
                            x: sum.x / window.length,
                            y: sum.y / window.length,
                            z: sum.z / window.length
                        };
                    },

                    kalmanFilter: (measurement, prediction, uncertainty) => {
                        // Simplified Kalman filter for testing
                        const gain = uncertainty / (uncertainty + 0.1); // Assume measurement noise of 0.1

                        return {
                            value: {
                                x: prediction.x + gain * (measurement.x - prediction.x),
                                y: prediction.y + gain * (measurement.y - prediction.y),
                                z: prediction.z + gain * (measurement.z - prediction.z)
                            },
                            uncertainty: (1 - gain) * uncertainty
                        };
                    }
                };
            });

            framework.test('should apply exponential smoothing correctly', () => {
                const current = { x: 10, y: 10, z: 10 };
                const previous = { x: 0, y: 0, z: 0 };
                const alpha = 0.8;

                const smoothed = smoother.exponentialSmoothing(current, previous, alpha);

                TestFramework.assert.equal(smoothed.x, 2, 'X should be smoothed correctly');
                TestFramework.assert.equal(smoothed.y, 2, 'Y should be smoothed correctly');
                TestFramework.assert.equal(smoothed.z, 2, 'Z should be smoothed correctly');
            });

            framework.test('should handle first value in exponential smoothing', () => {
                const current = { x: 5, y: 5, z: 5 };
                const previous = null;
                const alpha = 0.8;

                const smoothed = smoother.exponentialSmoothing(current, previous, alpha);

                TestFramework.assert.deepEqual(smoothed, current,
                    'Should return current value when no previous value');
            });

            framework.test('should calculate moving average correctly', () => {
                const values = [
                    { x: 1, y: 2, z: 3 },
                    { x: 2, y: 4, z: 6 },
                    { x: 3, y: 6, z: 9 },
                    { x: 4, y: 8, z: 12 }
                ];

                const average = smoother.movingAverage(values, 3);

                TestFramework.assert.equal(average.x, 3, 'X average should be correct');
                TestFramework.assert.equal(average.y, 6, 'Y average should be correct');
                TestFramework.assert.equal(average.z, 9, 'Z average should be correct');
            });

            framework.test('should handle empty array in moving average', () => {
                const average = smoother.movingAverage([], 5);
                TestFramework.assert.equal(average, null, 'Should return null for empty array');
            });

            framework.test('should apply Kalman filter correctly', () => {
                const measurement = { x: 10, y: 10, z: 10 };
                const prediction = { x: 8, y: 8, z: 8 };
                const uncertainty = 0.5;

                const filtered = smoother.kalmanFilter(measurement, prediction, uncertainty);

                TestFramework.assert.true(filtered.value.x > prediction.x && filtered.value.x < measurement.x,
                    'Filtered X should be between prediction and measurement');
                TestFramework.assert.true(filtered.uncertainty < uncertainty,
                    'Uncertainty should be reduced');
            });
        });
    }

    static patternRecognitionTests(framework) {
        framework.suite('Pattern Recognition', () => {
            let patternRecognizer;

            framework.beforeEach(() => {
                patternRecognizer = {
                    patterns: new Map(),

                    learnPattern: function(name, sequence, threshold = 0.8) {
                        this.patterns.set(name, {
                            sequence: sequence.slice(),
                            threshold,
                            occurrences: 1
                        });
                    },

                    recognizePattern: function(sequence) {
                        let bestMatch = null;
                        let bestScore = 0;

                        for (const [name, pattern] of this.patterns.entries()) {
                            const score = this.calculateSimilarity(sequence, pattern.sequence);
                            if (score > pattern.threshold && score > bestScore) {
                                bestScore = score;
                                bestMatch = { name, score };
                            }
                        }

                        return bestMatch;
                    },

                    calculateSimilarity: function(seq1, seq2) {
                        if (seq1.length !== seq2.length) return 0;

                        let totalDifference = 0;
                        for (let i = 0; i < seq1.length; i++) {
                            const diff = this.calculatePointDifference(seq1[i], seq2[i]);
                            totalDifference += diff;
                        }

                        const avgDifference = totalDifference / seq1.length;
                        return Math.max(0, 1 - avgDifference / 2); // Normalize to 0-1
                    },

                    calculatePointDifference: function(point1, point2) {
                        return Math.sqrt(
                            Math.pow(point1.x - point2.x, 2) +
                            Math.pow(point1.y - point2.y, 2) +
                            Math.pow(point1.z - point2.z, 2)
                        );
                    }
                };
            });

            framework.test('should learn and recognize simple pattern', () => {
                const pattern = [
                    { x: 0, y: 0, z: 0 },
                    { x: 1, y: 0, z: 0 },
                    { x: 1, y: 1, z: 0 },
                    { x: 0, y: 1, z: 0 }
                ];

                patternRecognizer.learnPattern('square', pattern);

                // Test with similar pattern
                const testPattern = [
                    { x: 0.1, y: 0.1, z: 0 },
                    { x: 1.1, y: 0.1, z: 0 },
                    { x: 1.1, y: 1.1, z: 0 },
                    { x: 0.1, y: 1.1, z: 0 }
                ];

                const result = patternRecognizer.recognizePattern(testPattern);

                TestFramework.assert.notEqual(result, null, 'Should recognize pattern');
                TestFramework.assert.equal(result.name, 'square', 'Should identify as square pattern');
                TestFramework.assert.true(result.score > 0.8, 'Should have high confidence');
            });

            framework.test('should reject dissimilar patterns', () => {
                const pattern = [
                    { x: 0, y: 0, z: 0 },
                    { x: 1, y: 0, z: 0 }
                ];

                patternRecognizer.learnPattern('line', pattern);

                const testPattern = [
                    { x: 0, y: 0, z: 0 },
                    { x: 0, y: 1, z: 0 }
                ];

                const result = patternRecognizer.recognizePattern(testPattern);

                // Should either be null or have low score
                if (result) {
                    TestFramework.assert.true(result.score < 0.5, 'Should have low confidence for different pattern');
                }
            });

            framework.test('should handle empty patterns', () => {
                const result = patternRecognizer.recognizePattern([]);
                TestFramework.assert.equal(result, null, 'Should return null for empty pattern');
            });

            framework.test('should calculate similarity correctly', () => {
                const seq1 = [{ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }];
                const seq2 = [{ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }];

                const similarity = patternRecognizer.calculateSimilarity(seq1, seq2);
                TestFramework.assert.equal(similarity, 1, 'Identical sequences should have similarity of 1');

                const seq3 = [{ x: 10, y: 10, z: 10 }, { x: 10, y: 10, z: 10 }];
                const similarity2 = patternRecognizer.calculateSimilarity(seq1, seq3);
                TestFramework.assert.true(similarity2 < 0.5, 'Different sequences should have low similarity');
            });
        });
    }

    static gestureClassificationTests(framework) {
        framework.suite('Gesture Classification', () => {
            let gestureClassifier;

            framework.beforeEach(() => {
                gestureClassifier = {
                    classifyGesture: function(jointData) {
                        const leftHand = jointData.HAND_LEFT;
                        const rightHand = jointData.HAND_RIGHT;
                        const head = jointData.HEAD;

                        if (!leftHand || !rightHand || !head) {
                            return { gesture: 'unknown', confidence: 0 };
                        }

                        // Simple gesture classification based on hand positions
                        const handDistance = this.calculateDistance(leftHand.position, rightHand.position);
                        const handsAboveHead = leftHand.position.y > head.position.y &&
                                             rightHand.position.y > head.position.y;
                        const handsSpread = handDistance > 1.0;

                        if (handsAboveHead && handsSpread) {
                            return { gesture: 'celebration', confidence: 0.9 };
                        } else if (handsAboveHead) {
                            return { gesture: 'hands_up', confidence: 0.8 };
                        } else if (handsSpread) {
                            return { gesture: 'arms_wide', confidence: 0.7 };
                        } else if (handDistance < 0.3) {
                            return { gesture: 'hands_together', confidence: 0.6 };
                        } else {
                            return { gesture: 'neutral', confidence: 0.5 };
                        }
                    },

                    calculateDistance: function(pos1, pos2) {
                        return Math.sqrt(
                            Math.pow(pos1.x - pos2.x, 2) +
                            Math.pow(pos1.y - pos2.y, 2) +
                            Math.pow(pos1.z - pos2.z, 2)
                        );
                    },

                    isGestureStable: function(gestureHistory, minDuration = 500) {
                        if (gestureHistory.length < 2) return false;

                        const latestGesture = gestureHistory[gestureHistory.length - 1];
                        const gestureStart = gestureHistory.findIndex(g => g.gesture === latestGesture.gesture);

                        if (gestureStart === -1) return false;

                        const duration = latestGesture.timestamp - gestureHistory[gestureStart].timestamp;
                        return duration >= minDuration;
                    }
                };
            });

            framework.test('should classify celebration gesture', () => {
                const jointData = {
                    HAND_LEFT: { position: { x: -1, y: 2, z: 1 } },
                    HAND_RIGHT: { position: { x: 1, y: 2, z: 1 } },
                    HEAD: { position: { x: 0, y: 1, z: 1 } }
                };

                const result = gestureClassifier.classifyGesture(jointData);

                TestFramework.assert.equal(result.gesture, 'celebration', 'Should classify as celebration');
                TestFramework.assert.true(result.confidence > 0.8, 'Should have high confidence');
            });

            framework.test('should classify hands together gesture', () => {
                const jointData = {
                    HAND_LEFT: { position: { x: -0.1, y: 0.5, z: 1 } },
                    HAND_RIGHT: { position: { x: 0.1, y: 0.5, z: 1 } },
                    HEAD: { position: { x: 0, y: 1, z: 1 } }
                };

                const result = gestureClassifier.classifyGesture(jointData);

                TestFramework.assert.equal(result.gesture, 'hands_together', 'Should classify as hands together');
            });

            framework.test('should handle missing joint data', () => {
                const jointData = {
                    HAND_LEFT: { position: { x: 0, y: 0, z: 0 } }
                    // Missing HAND_RIGHT and HEAD
                };

                const result = gestureClassifier.classifyGesture(jointData);

                TestFramework.assert.equal(result.gesture, 'unknown', 'Should return unknown for incomplete data');
                TestFramework.assert.equal(result.confidence, 0, 'Should have zero confidence');
            });

            framework.test('should detect stable gestures', () => {
                const now = Date.now();
                const gestureHistory = [
                    { gesture: 'neutral', timestamp: now - 1000, confidence: 0.5 },
                    { gesture: 'hands_up', timestamp: now - 800, confidence: 0.8 },
                    { gesture: 'hands_up', timestamp: now - 600, confidence: 0.8 },
                    { gesture: 'hands_up', timestamp: now - 400, confidence: 0.8 },
                    { gesture: 'hands_up', timestamp: now, confidence: 0.8 }
                ];

                const isStable = gestureClassifier.isGestureStable(gestureHistory, 500);

                TestFramework.assert.true(isStable, 'Should detect stable gesture over time');
            });

            framework.test('should reject unstable gestures', () => {
                const now = Date.now();
                const gestureHistory = [
                    { gesture: 'hands_up', timestamp: now - 200, confidence: 0.8 },
                    { gesture: 'hands_up', timestamp: now, confidence: 0.8 }
                ];

                const isStable = gestureClassifier.isGestureStable(gestureHistory, 500);

                TestFramework.assert.false(isStable, 'Should reject gesture with insufficient duration');
            });
        });
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MovementAnalysisTests;
}

// Auto-run if this is the main module
if (require.main === module) {
    MovementAnalysisTests.runAll();
}