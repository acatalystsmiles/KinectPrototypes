/**
 * Advanced Gesture Recognition System
 *
 * Significantly enhanced gesture taxonomy with:
 * - Laban Movement Analysis integration
 * - Multi-dimensional gesture classification
 * - Contextual gesture interpretation
 * - Temporal pattern recognition
 * - Emotional/expressive quality detection
 */

class AdvancedGestureRecognition {
    constructor() {
        // Multi-dimensional gesture taxonomy
        this.gestureTaxonomy = {
            spatial: new Map(),      // Where the movement happens
            dynamic: new Map(),      // How the movement happens (effort)
            temporal: new Map(),     // When and timing patterns
            relational: new Map(),   // Relationships between body parts
            expressive: new Map()    // Emotional/artistic qualities
        };

        // Laban Movement Analysis dimensions
        this.labanEfforts = {
            weight: { light: 0, strong: 1 },
            time: { sustained: 0, sudden: 1 },
            space: { indirect: 0, direct: 1 },
            flow: { bound: 0, free: 1 }
        };

        // Recognition state
        this.recognitionBuffer = [];
        this.bufferSize = 180; // 3 seconds at 60fps
        this.detectedGestures = new Map();
        this.gestureSequences = [];
        this.contextualMemory = {
            recentGestures: [],
            emotionalState: 'neutral',
            engagementLevel: 0.5
        };

        // Advanced pattern matching
        this.patternMatchers = {
            dtw: new DynamicTimeWarping(),
            hmm: new HiddenMarkovModel(),
            neural: new SimpleNeuralMatcher()
        };

        // Performance tracking
        this.stats = {
            totalGesturesDetected: 0,
            uniqueGesturesUsed: new Set(),
            avgConfidence: 0,
            processingTime: []
        };

        this.initializeEnhancedTaxonomy();
        console.log('🧠 Advanced Gesture Recognition initialized');
    }

    initializeEnhancedTaxonomy() {
        // SPATIAL GESTURES - Where movement occurs
        this.gestureTaxonomy.spatial.set('overhead_reach', {
            description: 'Arms reaching upward into overhead space',
            joints: ['HAND_LEFT', 'HAND_RIGHT', 'ELBOW_LEFT', 'ELBOW_RIGHT'],
            spatialZone: 'high',
            musicalMapping: {
                pitch: 'ascending',
                timbre: 'bright',
                intensity: 'crescendo',
                spatialPosition: 'high'
            },
            emotionalQualities: ['hopeful', 'expansive', 'reaching']
        });

        this.gestureTaxonomy.spatial.set('grounded_crouch', {
            description: 'Body lowering into grounded position',
            joints: ['PELVIS', 'KNEE_LEFT', 'KNEE_RIGHT', 'ANKLE_LEFT', 'ANKLE_RIGHT'],
            spatialZone: 'low',
            musicalMapping: {
                pitch: 'descending',
                timbre: 'dark',
                intensity: 'diminuendo',
                spatialPosition: 'low'
            },
            emotionalQualities: ['grounded', 'heavy', 'contemplative']
        });

        this.gestureTaxonomy.spatial.set('peripheral_sweep', {
            description: 'Arms sweeping through peripheral space',
            joints: ['HAND_LEFT', 'HAND_RIGHT'],
            spatialZone: 'far',
            musicalMapping: {
                pitch: 'wide_intervals',
                timbre: 'spacious',
                intensity: 'dynamic',
                spatialPosition: 'wide'
            },
            emotionalQualities: ['expansive', 'generous', 'embracing']
        });

        // DYNAMIC GESTURES - Laban Effort Actions
        this.gestureTaxonomy.dynamic.set('punch', {
            description: 'Sudden, strong, direct movement (Thrust)',
            efforts: { weight: 'strong', time: 'sudden', space: 'direct' },
            musicalMapping: {
                articulation: 'staccato',
                attack: 'sharp',
                timbre: 'percussive',
                intensity: 1.0
            },
            emotionalQualities: ['assertive', 'powerful', 'decisive']
        });

        this.gestureTaxonomy.dynamic.set('float', {
            description: 'Sustained, light, indirect movement',
            efforts: { weight: 'light', time: 'sustained', space: 'indirect' },
            musicalMapping: {
                articulation: 'legato',
                attack: 'soft',
                timbre: 'ethereal',
                intensity: 0.3
            },
            emotionalQualities: ['dreamy', 'weightless', 'gentle']
        });

        this.gestureTaxonomy.dynamic.set('slash', {
            description: 'Sudden, strong, flexible movement',
            efforts: { weight: 'strong', time: 'sudden', space: 'indirect' },
            musicalMapping: {
                articulation: 'accent',
                attack: 'sharp',
                timbre: 'bright',
                intensity: 0.9
            },
            emotionalQualities: ['dramatic', 'energetic', 'expressive']
        });

        this.gestureTaxonomy.dynamic.set('glide', {
            description: 'Sustained, light, direct movement',
            efforts: { weight: 'light', time: 'sustained', space: 'direct' },
            musicalMapping: {
                articulation: 'smooth',
                attack: 'gentle',
                timbre: 'flowing',
                intensity: 0.5
            },
            emotionalQualities: ['graceful', 'serene', 'focused']
        });

        this.gestureTaxonomy.dynamic.set('dab', {
            description: 'Sudden, light, direct movement',
            efforts: { weight: 'light', time: 'sudden', space: 'direct' },
            musicalMapping: {
                articulation: 'short',
                attack: 'quick',
                timbre: 'delicate',
                intensity: 0.6
            },
            emotionalQualities: ['playful', 'precise', 'nimble']
        });

        this.gestureTaxonomy.dynamic.set('wring', {
            description: 'Sustained, strong, flexible movement',
            efforts: { weight: 'strong', time: 'sustained', space: 'indirect' },
            musicalMapping: {
                articulation: 'twisted',
                attack: 'gradual',
                timbre: 'complex',
                intensity: 0.8
            },
            emotionalQualities: ['intense', 'emotional', 'struggling']
        });

        // TEMPORAL GESTURES - Timing patterns
        this.gestureTaxonomy.temporal.set('rhythmic_pulse', {
            description: 'Regular rhythmic pulsing movement',
            timing: { pattern: 'regular', tempo: 'moderate', sync: true },
            musicalMapping: {
                rhythm: 'pulse',
                meter: 'strong_beats',
                tempo: 'matched',
                polyrhythm: false
            },
            emotionalQualities: ['steady', 'grounded', 'rhythmic']
        });

        this.gestureTaxonomy.temporal.set('syncopated_bounce', {
            description: 'Off-beat rhythmic movement',
            timing: { pattern: 'syncopated', tempo: 'variable', sync: false },
            musicalMapping: {
                rhythm: 'syncopation',
                meter: 'off_beats',
                tempo: 'variable',
                polyrhythm: true
            },
            emotionalQualities: ['playful', 'jazzy', 'unexpected']
        });

        this.gestureTaxonomy.temporal.set('accelerando_gesture', {
            description: 'Gradually accelerating movement',
            timing: { pattern: 'accelerating', tempo: 'increasing', sync: false },
            musicalMapping: {
                rhythm: 'accelerando',
                meter: 'building',
                tempo: 'increasing',
                tension: 'rising'
            },
            emotionalQualities: ['building', 'exciting', 'urgent']
        });

        this.gestureTaxonomy.temporal.set('ritardando_gesture', {
            description: 'Gradually decelerating movement',
            timing: { pattern: 'decelerating', tempo: 'decreasing', sync: false },
            musicalMapping: {
                rhythm: 'ritardando',
                meter: 'settling',
                tempo: 'decreasing',
                tension: 'releasing'
            },
            emotionalQualities: ['calming', 'settling', 'resolving']
        });

        // RELATIONAL GESTURES - Body part relationships
        this.gestureTaxonomy.relational.set('symmetrical_expansion', {
            description: 'Both arms expanding symmetrically',
            relationship: 'bilateral_symmetric',
            musicalMapping: {
                harmony: 'parallel',
                texture: 'doubled',
                balance: 'centered'
            },
            emotionalQualities: ['balanced', 'whole', 'opening']
        });

        this.gestureTaxonomy.relational.set('asymmetrical_counterbalance', {
            description: 'Contrasting movements in opposite body parts',
            relationship: 'bilateral_asymmetric',
            musicalMapping: {
                harmony: 'contrary',
                texture: 'counterpoint',
                balance: 'dynamic'
            },
            emotionalQualities: ['dynamic', 'interesting', 'balanced']
        });

        this.gestureTaxonomy.relational.set('sequential_wave', {
            description: 'Movement rippling through body sequentially',
            relationship: 'sequential',
            musicalMapping: {
                melody: 'arpeggiated',
                texture: 'sequential',
                flow: 'connected'
            },
            emotionalQualities: ['flowing', 'connected', 'organic']
        });

        // EXPRESSIVE GESTURES - Emotional/artistic qualities
        this.gestureTaxonomy.expressive.set('spiraling_journey', {
            description: 'Continuous spiraling movement with journey quality',
            expression: 'journey',
            musicalMapping: {
                phrasing: 'continuous',
                development: 'evolving',
                arc: 'narrative',
                progression: 'harmonic'
            },
            emotionalQualities: ['searching', 'transforming', 'evolving']
        });

        this.gestureTaxonomy.expressive.set('explosive_burst', {
            description: 'Sudden explosive outward movement',
            expression: 'explosive',
            musicalMapping: {
                dynamics: 'fortissimo',
                attack: 'explosive',
                texture: 'dense',
                climax: true
            },
            emotionalQualities: ['explosive', 'releasing', 'powerful']
        });

        this.gestureTaxonomy.expressive.set('melting_dissolve', {
            description: 'Gradual melting, dissolving quality',
            expression: 'dissolving',
            musicalMapping: {
                dynamics: 'diminuendo',
                texture: 'thinning',
                dissolution: true,
                resolution: 'soft'
            },
            emotionalQualities: ['surrendering', 'releasing', 'melting']
        });

        this.gestureTaxonomy.expressive.set('sustained_tension', {
            description: 'Holding position with visible tension',
            expression: 'tension',
            musicalMapping: {
                harmony: 'dissonant',
                suspension: true,
                tension: 'high',
                release: 'delayed'
            },
            emotionalQualities: ['tense', 'anticipatory', 'suspended']
        });

        this.gestureTaxonomy.expressive.set('joyful_bounce', {
            description: 'Bouncy, buoyant quality with lightness',
            expression: 'joyful',
            musicalMapping: {
                rhythm: 'bouncy',
                mode: 'major',
                articulation: 'staccato',
                mood: 'bright'
            },
            emotionalQualities: ['joyful', 'light', 'playful']
        });

        console.log(`📚 Enhanced taxonomy: ${this.getTotalGestureCount()} gesture patterns across 5 dimensions`);
    }

    /**
     * Main analysis pipeline - processes movement data through multiple recognition stages
     */
    analyzeMovement(movementData) {
        const startTime = performance.now();

        try {
            // Add to buffer
            this.recognitionBuffer.push({
                timestamp: Date.now(),
                data: movementData
            });

            if (this.recognitionBuffer.length > this.bufferSize) {
                this.recognitionBuffer.shift();
            }

            // Multi-stage recognition
            const results = {
                spatial: this.recognizeSpatialGestures(movementData),
                dynamic: this.recognizeDynamicGestures(movementData),
                temporal: this.recognizeTemporalPatterns(movementData),
                relational: this.recognizeRelationalGestures(movementData),
                expressive: this.recognizeExpressiveQualities(movementData),

                // Meta-analysis
                emotionalState: this.inferEmotionalState(),
                movementIntent: this.inferMovementIntent(),
                engagementLevel: this.calculateEngagementLevel(),

                // Contextual understanding
                gestureSequence: this.analyzeGestureSequence(),
                narrative: this.interpretNarrativeArc()
            };

            // Update stats
            this.updateStatistics(results, performance.now() - startTime);

            return results;

        } catch (error) {
            console.error('Advanced gesture recognition error:', error);
            return this.getDefaultResults();
        }
    }

    /**
     * Recognize spatial gestures based on body position in space
     */
    recognizeSpatialGestures(movementData) {
        const detected = [];

        if (!movementData.bodies || movementData.bodies.length === 0) {
            return detected;
        }

        for (const body of movementData.bodies) {
            const joints = body.joints || {};

            // Check overhead reach
            const handHeight = this.getAverageHeight([
                joints[8], // HAND_LEFT
                joints[15]  // HAND_RIGHT
            ]);
            const headHeight = joints[26] ? joints[26].position.y : 0;

            if (handHeight > headHeight + 0.2) {
                detected.push({
                    type: 'overhead_reach',
                    confidence: this.calculateHeightConfidence(handHeight, headHeight),
                    bodyId: body.id,
                    timestamp: Date.now()
                });
            }

            // Check grounded crouch
            const pelvisHeight = joints[0] ? joints[0].position.y : 0;
            if (pelvisHeight < 0.8 && this.recognitionBuffer.length > 10) {
                const previousHeight = this.getPreviousJointHeight(body.id, 0, 10);
                if (previousHeight > pelvisHeight + 0.1) {
                    detected.push({
                        type: 'grounded_crouch',
                        confidence: 0.8,
                        bodyId: body.id,
                        timestamp: Date.now()
                    });
                }
            }

            // Check peripheral sweep
            const armSpan = this.calculateArmSpan(joints);
            if (armSpan > 1.5 && body.metrics.handVelocities) {
                const handSpeed = body.metrics.handVelocities.left + body.metrics.handVelocities.right;
                if (handSpeed > 0.5) {
                    detected.push({
                        type: 'peripheral_sweep',
                        confidence: Math.min(armSpan / 2.0, 1.0),
                        bodyId: body.id,
                        timestamp: Date.now()
                    });
                }
            }
        }

        return detected;
    }

    /**
     * Recognize dynamic gestures based on Laban Effort qualities
     */
    recognizeDynamicGestures(movementData) {
        const detected = [];

        if (!movementData.bodies || movementData.bodies.length === 0) {
            return detected;
        }

        for (const body of movementData.bodies) {
            if (!body.metrics || !body.metrics.movementQuality) continue;

            const efforts = this.analyzeLabanEfforts(body.metrics);

            // Match effort combinations to gesture types
            if (efforts.weight === 'strong' && efforts.time === 'sudden' && efforts.space === 'direct') {
                detected.push({
                    type: 'punch',
                    confidence: 0.85,
                    efforts: efforts,
                    bodyId: body.id,
                    timestamp: Date.now()
                });
            } else if (efforts.weight === 'light' && efforts.time === 'sustained' && efforts.space === 'indirect') {
                detected.push({
                    type: 'float',
                    confidence: 0.8,
                    efforts: efforts,
                    bodyId: body.id,
                    timestamp: Date.now()
                });
            } else if (efforts.weight === 'strong' && efforts.time === 'sudden' && efforts.space === 'indirect') {
                detected.push({
                    type: 'slash',
                    confidence: 0.82,
                    efforts: efforts,
                    bodyId: body.id,
                    timestamp: Date.now()
                });
            } else if (efforts.weight === 'light' && efforts.time === 'sustained' && efforts.space === 'direct') {
                detected.push({
                    type: 'glide',
                    confidence: 0.78,
                    efforts: efforts,
                    bodyId: body.id,
                    timestamp: Date.now()
                });
            } else if (efforts.weight === 'light' && efforts.time === 'sudden' && efforts.space === 'direct') {
                detected.push({
                    type: 'dab',
                    confidence: 0.75,
                    efforts: efforts,
                    bodyId: body.id,
                    timestamp: Date.now()
                });
            } else if (efforts.weight === 'strong' && efforts.time === 'sustained' && efforts.space === 'indirect') {
                detected.push({
                    type: 'wring',
                    confidence: 0.8,
                    efforts: efforts,
                    bodyId: body.id,
                    timestamp: Date.now()
                });
            }
        }

        return detected;
    }

    /**
     * Recognize temporal patterns in movement
     */
    recognizeTemporalPatterns(movementData) {
        const detected = [];

        if (this.recognitionBuffer.length < 30) {
            return detected; // Need enough history
        }

        // Analyze movement tempo changes
        const recentMotion = this.recognitionBuffer.slice(-30).map(frame => {
            const body = frame.data.bodies ? frame.data.bodies[0] : null;
            return body && body.metrics ? body.metrics.overallMotion : 0;
        });

        // Check for acceleration
        const velocityChange = this.calculateVelocityChange(recentMotion);
        if (velocityChange > 0.3) {
            detected.push({
                type: 'accelerando_gesture',
                confidence: Math.min(velocityChange, 1.0),
                tempo: 'increasing',
                timestamp: Date.now()
            });
        } else if (velocityChange < -0.3) {
            detected.push({
                type: 'ritardando_gesture',
                confidence: Math.min(Math.abs(velocityChange), 1.0),
                tempo: 'decreasing',
                timestamp: Date.now()
            });
        }

        // Check for rhythmic pulse
        const rhythmicity = this.detectRhythm(recentMotion);
        if (rhythmicity.isRhythmic && rhythmicity.regularity > 0.7) {
            detected.push({
                type: 'rhythmic_pulse',
                confidence: rhythmicity.regularity,
                tempo: rhythmicity.tempo,
                timestamp: Date.now()
            });
        } else if (rhythmicity.isRhythmic && rhythmicity.regularity < 0.7 && rhythmicity.syncopation > 0.6) {
            detected.push({
                type: 'syncopated_bounce',
                confidence: rhythmicity.syncopation,
                tempo: rhythmicity.tempo,
                timestamp: Date.now()
            });
        }

        return detected;
    }

    /**
     * Recognize relational gestures between body parts
     */
    recognizeRelationalGestures(movementData) {
        const detected = [];

        if (!movementData.bodies || movementData.bodies.length === 0) {
            return detected;
        }

        for (const body of movementData.bodies) {
            const joints = body.joints || {};

            // Check symmetry
            if (body.metrics && body.metrics.symmetry > 0.8) {
                const bodyExpansion = body.metrics.bodyExpansion || 0;
                if (bodyExpansion > 0.7) {
                    detected.push({
                        type: 'symmetrical_expansion',
                        confidence: body.metrics.symmetry,
                        symmetry: body.metrics.symmetry,
                        bodyId: body.id,
                        timestamp: Date.now()
                    });
                }
            } else if (body.metrics && body.metrics.symmetry < 0.4) {
                detected.push({
                    type: 'asymmetrical_counterbalance',
                    confidence: 1.0 - body.metrics.symmetry,
                    asymmetry: 1.0 - body.metrics.symmetry,
                    bodyId: body.id,
                    timestamp: Date.now()
                });
            }

            // Check for sequential movement (wave through body)
            const sequentialScore = this.detectSequentialMovement(body.id);
            if (sequentialScore > 0.6) {
                detected.push({
                    type: 'sequential_wave',
                    confidence: sequentialScore,
                    bodyId: body.id,
                    timestamp: Date.now()
                });
            }
        }

        return detected;
    }

    /**
     * Recognize expressive qualities
     */
    recognizeExpressiveQualities(movementData) {
        const detected = [];

        if (!movementData.bodies || movementData.bodies.length === 0) {
            return detected;
        }

        for (const body of movementData.bodies) {
            if (!body.metrics) continue;

            // Check for spiraling (using hand trajectories)
            const spiralScore = this.detectSpiralMotion(body.id);
            if (spiralScore > 0.6) {
                detected.push({
                    type: 'spiraling_journey',
                    confidence: spiralScore,
                    bodyId: body.id,
                    timestamp: Date.now()
                });
            }

            // Check for explosive movement
            if (body.metrics.overallMotion > 3.0 && body.metrics.movementQuality) {
                const suddenness = 1.0 - body.metrics.movementQuality.smooth;
                if (suddenness > 0.7) {
                    detected.push({
                        type: 'explosive_burst',
                        confidence: suddenness,
                        bodyId: body.id,
                        timestamp: Date.now()
                    });
                }
            }

            // Check for melting/dissolving
            if (this.recognitionBuffer.length > 30) {
                const meltingScore = this.detectMeltingQuality(body.id);
                if (meltingScore > 0.6) {
                    detected.push({
                        type: 'melting_dissolve',
                        confidence: meltingScore,
                        bodyId: body.id,
                        timestamp: Date.now()
                    });
                }
            }

            // Check for joyful bounce
            const bounceScore = this.detectBounceQuality(body.metrics);
            if (bounceScore > 0.65) {
                detected.push({
                    type: 'joyful_bounce',
                    confidence: bounceScore,
                    bodyId: body.id,
                    timestamp: Date.now()
                });
            }

            // Check for sustained tension
            const tensionScore = this.detectTensionQuality(body.id);
            if (tensionScore > 0.7) {
                detected.push({
                    type: 'sustained_tension',
                    confidence: tensionScore,
                    bodyId: body.id,
                    timestamp: Date.now()
                });
            }
        }

        return detected;
    }

    // Helper methods for gesture recognition

    analyzeLabanEfforts(metrics) {
        const efforts = {};

        // Weight: strong vs light
        const overallMotion = metrics.overallMotion || 0;
        efforts.weight = overallMotion > 1.5 ? 'strong' : 'light';
        efforts.weightValue = overallMotion;

        // Time: sudden vs sustained
        const speed = metrics.movementQuality ? metrics.movementQuality.speed : 0;
        efforts.time = speed > 0.6 ? 'sudden' : 'sustained';
        efforts.timeValue = speed;

        // Space: direct vs indirect
        const flowing = metrics.movementQuality ? metrics.movementQuality.flowing : 0.5;
        efforts.space = flowing > 0.6 ? 'indirect' : 'direct';
        efforts.spaceValue = flowing;

        // Flow: bound vs free
        const smooth = metrics.movementQuality ? metrics.movementQuality.smooth : 0.5;
        efforts.flow = smooth > 0.6 ? 'free' : 'bound';
        efforts.flowValue = smooth;

        return efforts;
    }

    inferEmotionalState() {
        // Analyze recent gestures to infer emotional state
        const recentGestures = this.contextualMemory.recentGestures.slice(-10);

        if (recentGestures.length === 0) {
            return 'neutral';
        }

        const emotionalQualities = [];
        for (const gesture of recentGestures) {
            const taxonomy = this.findGestureInTaxonomy(gesture.type);
            if (taxonomy && taxonomy.emotionalQualities) {
                emotionalQualities.push(...taxonomy.emotionalQualities);
            }
        }

        // Find most common emotional quality
        const emotionCounts = {};
        for (const emotion of emotionalQualities) {
            emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        }

        let dominantEmotion = 'neutral';
        let maxCount = 0;
        for (const [emotion, count] of Object.entries(emotionCounts)) {
            if (count > maxCount) {
                maxCount = count;
                dominantEmotion = emotion;
            }
        }

        this.contextualMemory.emotionalState = dominantEmotion;
        return dominantEmotion;
    }

    inferMovementIntent() {
        // Analyze patterns to infer what the user is trying to do
        const recentGestures = this.contextualMemory.recentGestures.slice(-5);

        if (recentGestures.length === 0) {
            return 'exploring';
        }

        // Check for patterns
        const hasRhythmic = recentGestures.some(g => g.type.includes('rhythmic') || g.type.includes('bounce'));
        const hasExpansive = recentGestures.some(g => g.type.includes('expansion') || g.type.includes('sweep'));
        const hasGrounded = recentGestures.some(g => g.type.includes('grounded') || g.type.includes('crouch'));
        const hasEnergetic = recentGestures.some(g => g.type.includes('explosive') || g.type.includes('punch'));

        if (hasRhythmic) return 'dancing';
        if (hasExpansive) return 'expanding';
        if (hasGrounded) return 'centering';
        if (hasEnergetic) return 'expressing';

        return 'exploring';
    }

    calculateEngagementLevel() {
        // Calculate how engaged the user is based on movement variety and intensity
        const recentGestures = this.contextualMemory.recentGestures.slice(-20);

        if (recentGestures.length === 0) {
            return 0.3;
        }

        const variety = new Set(recentGestures.map(g => g.type)).size / 10; // Normalized by 10 types
        const avgConfidence = recentGestures.reduce((sum, g) => sum + g.confidence, 0) / recentGestures.length;
        const frequency = Math.min(recentGestures.length / 20, 1.0);

        const engagement = (variety * 0.3 + avgConfidence * 0.4 + frequency * 0.3);
        this.contextualMemory.engagementLevel = engagement;

        return engagement;
    }

    analyzeGestureSequence() {
        // Look for meaningful sequences of gestures
        const recentGestures = this.contextualMemory.recentGestures.slice(-6);

        if (recentGestures.length < 3) {
            return { hasSequence: false, pattern: 'none' };
        }

        const types = recentGestures.map(g => g.type);

        // Check for common sequences
        if (types.includes('grounded_crouch') && types.includes('overhead_reach')) {
            return {
                hasSequence: true,
                pattern: 'rise_and_reach',
                description: 'Rising from ground to reaching high',
                musicalMeaning: 'ascension'
            };
        }

        if (types.filter(t => t.includes('rhythmic')).length >= 3) {
            return {
                hasSequence: true,
                pattern: 'sustained_rhythm',
                description: 'Maintaining rhythmic movement',
                musicalMeaning: 'groove'
            };
        }

        return { hasSequence: false, pattern: 'varied' };
    }

    interpretNarrativeArc() {
        // Look at the whole session to identify a narrative arc
        if (this.contextualMemory.recentGestures.length < 10) {
            return 'beginning';
        }

        const totalGestures = this.contextualMemory.recentGestures.length;
        const recentEngagement = this.contextualMemory.engagementLevel;

        if (totalGestures < 30 && recentEngagement < 0.5) {
            return 'introduction';
        } else if (totalGestures < 30 && recentEngagement >= 0.5) {
            return 'discovery';
        } else if (totalGestures >= 30 && totalGestures < 100 && recentEngagement >= 0.6) {
            return 'exploration';
        } else if (totalGestures >= 100 && recentEngagement >= 0.7) {
            return 'mastery';
        } else if (recentEngagement < 0.4) {
            return 'winding_down';
        }

        return 'exploration';
    }

    // Utility methods

    getAverageHeight(joints) {
        const validJoints = joints.filter(j => j && j.position);
        if (validJoints.length === 0) return 0;
        return validJoints.reduce((sum, j) => sum + j.position.y, 0) / validJoints.length;
    }

    calculateHeightConfidence(handHeight, headHeight) {
        const diff = handHeight - headHeight;
        return Math.min(Math.max(diff / 0.5, 0), 1);
    }

    getPreviousJointHeight(bodyId, jointIndex, framesBack) {
        const frame = this.recognitionBuffer[this.recognitionBuffer.length - framesBack];
        if (!frame || !frame.data.bodies) return 0;

        const body = frame.data.bodies.find(b => b.id === bodyId);
        if (!body || !body.joints || !body.joints[jointIndex]) return 0;

        return body.joints[jointIndex].position.y;
    }

    calculateArmSpan(joints) {
        if (!joints[8] || !joints[15]) return 0;
        const dx = joints[8].position.x - joints[15].position.x;
        const dy = joints[8].position.y - joints[15].position.y;
        const dz = joints[8].position.z - joints[15].position.z;
        return Math.sqrt(dx*dx + dy*dy + dz*dz);
    }

    calculateVelocityChange(motionArray) {
        if (motionArray.length < 2) return 0;
        const firstHalf = motionArray.slice(0, Math.floor(motionArray.length / 2));
        const secondHalf = motionArray.slice(Math.floor(motionArray.length / 2));

        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        return avgSecond - avgFirst;
    }

    detectRhythm(motionArray) {
        // Simple rhythm detection using autocorrelation
        const result = {
            isRhythmic: false,
            regularity: 0,
            syncopation: 0,
            tempo: 0
        };

        if (motionArray.length < 20) return result;

        // Find peaks in motion
        const peaks = [];
        for (let i = 1; i < motionArray.length - 1; i++) {
            if (motionArray[i] > motionArray[i-1] && motionArray[i] > motionArray[i+1] && motionArray[i] > 0.3) {
                peaks.push(i);
            }
        }

        if (peaks.length < 3) return result;

        // Calculate intervals between peaks
        const intervals = [];
        for (let i = 1; i < peaks.length; i++) {
            intervals.push(peaks[i] - peaks[i-1]);
        }

        // Check regularity
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);

        result.regularity = Math.max(0, 1 - (stdDev / avgInterval));
        result.isRhythmic = result.regularity > 0.5 || stdDev / avgInterval < 0.5;
        result.tempo = 60 / (avgInterval / 60); // Assuming 60fps

        // Check for syncopation (irregular but present rhythm)
        result.syncopation = result.isRhythmic ? (1 - result.regularity) : 0;

        return result;
    }

    detectSequentialMovement(bodyId) {
        // Would need more sophisticated tracking of body part activation order
        // Simplified version
        return Math.random() * 0.3; // Placeholder
    }

    detectSpiralMotion(bodyId) {
        // Would need trajectory analysis
        // Simplified version
        return Math.random() * 0.4; // Placeholder
    }

    detectMeltingQuality(bodyId) {
        // Look for gradual downward movement with decreasing velocity
        if (this.recognitionBuffer.length < 30) return 0;

        const recent = this.recognitionBuffer.slice(-30);
        let downwardTrend = 0;
        let decelerationScore = 0;

        for (let i = 1; i < recent.length; i++) {
            const body = recent[i].data.bodies ? recent[i].data.bodies.find(b => b.id === bodyId) : null;
            const prevBody = recent[i-1].data.bodies ? recent[i-1].data.bodies.find(b => b.id === bodyId) : null;

            if (body && prevBody && body.joints && prevBody.joints && body.joints[0] && prevBody.joints[0]) {
                const heightChange = body.joints[0].position.y - prevBody.joints[0].position.y;
                if (heightChange < 0) downwardTrend++;

                if (body.metrics && prevBody.metrics) {
                    if (body.metrics.overallMotion < prevBody.metrics.overallMotion) {
                        decelerationScore++;
                    }
                }
            }
        }

        const meltingScore = (downwardTrend / 30) * 0.5 + (decelerationScore / 30) * 0.5;
        return meltingScore;
    }

    detectBounceQuality(metrics) {
        if (!metrics || !metrics.verticalMovement || !metrics.movementQuality) return 0;

        const verticalActivity = Math.min(metrics.verticalMovement / 2.0, 1.0);
        const lightness = metrics.movementQuality.flowing || 0.5;
        const speed = metrics.movementQuality.speed || 0.5;

        return (verticalActivity * 0.5 + lightness * 0.3 + speed * 0.2);
    }

    detectTensionQuality(bodyId) {
        // Look for stillness or very slow movement
        if (this.recognitionBuffer.length < 20) return 0;

        const recent = this.recognitionBuffer.slice(-20);
        let stillnessScore = 0;

        for (const frame of recent) {
            const body = frame.data.bodies ? frame.data.bodies.find(b => b.id === bodyId) : null;
            if (body && body.metrics) {
                if (body.metrics.overallMotion < 0.3) {
                    stillnessScore++;
                }
            }
        }

        return stillnessScore / 20;
    }

    findGestureInTaxonomy(gestureType) {
        for (const [category, gestures] of Object.entries(this.gestureTaxonomy)) {
            if (gestures.has(gestureType)) {
                return gestures.get(gestureType);
            }
        }
        return null;
    }

    updateStatistics(results, processingTime) {
        // Count total gestures detected
        let totalDetected = 0;
        for (const category of Object.keys(results)) {
            if (Array.isArray(results[category])) {
                totalDetected += results[category].length;

                // Update recent gestures memory
                for (const gesture of results[category]) {
                    this.contextualMemory.recentGestures.push(gesture);
                    this.stats.uniqueGesturesUsed.add(gesture.type);
                }
            }
        }

        // Keep recent gestures limited
        if (this.contextualMemory.recentGestures.length > 100) {
            this.contextualMemory.recentGestures = this.contextualMemory.recentGestures.slice(-100);
        }

        this.stats.totalGesturesDetected += totalDetected;
        this.stats.processingTime.push(processingTime);

        if (this.stats.processingTime.length > 60) {
            this.stats.processingTime.shift();
        }
    }

    getTotalGestureCount() {
        let total = 0;
        for (const gestures of Object.values(this.gestureTaxonomy)) {
            total += gestures.size;
        }
        return total;
    }

    getDefaultResults() {
        return {
            spatial: [],
            dynamic: [],
            temporal: [],
            relational: [],
            expressive: [],
            emotionalState: 'neutral',
            movementIntent: 'exploring',
            engagementLevel: 0.5,
            gestureSequence: { hasSequence: false, pattern: 'none' },
            narrative: 'beginning'
        };
    }

    getStatistics() {
        return {
            ...this.stats,
            avgProcessingTime: this.stats.processingTime.length > 0
                ? this.stats.processingTime.reduce((a, b) => a + b, 0) / this.stats.processingTime.length
                : 0
        };
    }
}

// Simple pattern matching helpers (placeholders for more sophisticated implementations)

class DynamicTimeWarping {
    match(pattern1, pattern2) {
        // Simplified DTW implementation
        return Math.random(); // Placeholder
    }
}

class HiddenMarkovModel {
    recognize(sequence) {
        // Simplified HMM implementation
        return { confidence: Math.random(), state: 'unknown' }; // Placeholder
    }
}

class SimpleNeuralMatcher {
    predict(features) {
        // Simplified neural network matcher
        return { confidence: Math.random(), class: 'unknown' }; // Placeholder
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedGestureRecognition;
}
