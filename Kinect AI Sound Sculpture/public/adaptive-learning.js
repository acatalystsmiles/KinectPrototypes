class AdaptiveLearning {
    constructor() {
        // Visitor profiling system
        this.currentProfile = {
            id: this.generateVisitorId(),
            startTime: Date.now(),
            movementStyle: 'unknown',
            preferences: {
                intensity: 0.5,
                complexity: 0.5,
                musicality: 0.5,
                creativity: 0.5
            },
            adaptations: {
                gestureThresholds: {},
                musicalMappings: {},
                visualPreferences: {}
            },
            sessionData: {
                totalMovements: 0,
                favoriteGestures: [],
                timeSpent: 0,
                engagementLevel: 0.5
            }
        };

        // Learning history and patterns
        this.learningHistory = [];
        this.behaviorPatterns = {
            gestureFrequency: new Map(),
            movementIntensity: [],
            timeOfDay: new Map(),
            sessionLength: []
        };

        // Adaptation parameters
        this.adaptationRate = 0.1;
        this.memoryDecay = 0.95;
        this.confidenceThreshold = 0.7;
        this.profileStability = 0.0;

        // Visitor type classifications
        this.visitorTypes = {
            'explorer': {
                description: 'Curious, tries many different movements',
                characteristics: { variety: 0.8, intensity: 0.6, consistency: 0.4 },
                adaptations: { gestureResponse: 1.2, musicalComplexity: 1.1, visualRichness: 1.3 }
            },
            'dancer': {
                description: 'Rhythmic, flowing movements with musical awareness',
                characteristics: { musicality: 0.9, fluidity: 0.8, rhythm: 0.9 },
                adaptations: { beatSensitivity: 1.4, musicalComplexity: 1.3, rhythmicResponse: 1.5 }
            },
            'contemplative': {
                description: 'Slow, deliberate movements with focus',
                characteristics: { intensity: 0.3, consistency: 0.8, complexity: 0.6 },
                adaptations: { ambientStrength: 1.3, responseDelay: 0.8, visualSubtlety: 1.2 }
            },
            'energetic': {
                description: 'High energy, dynamic movements',
                characteristics: { intensity: 0.9, speed: 0.8, variation: 0.7 },
                adaptations: { responsiveness: 1.4, visualIntensity: 1.3, audioEnergy: 1.2 }
            },
            'social': {
                description: 'Interacts well with others, group-oriented',
                characteristics: { groupAwareness: 0.8, mimicry: 0.7, coordination: 0.8 },
                adaptations: { groupEffects: 1.5, colorCoordination: 1.3, sharedResponses: 1.4 }
            },
            'minimalist': {
                description: 'Prefers simple, clean interactions',
                characteristics: { complexity: 0.2, precision: 0.8, clarity: 0.9 },
                adaptations: { visualClutter: 0.6, audioLayers: 0.7, responseClarity: 1.3 }
            }
        };

        console.log('🧠 Adaptive Learning system initialized');
    }

    // Main learning function called from AI Movement Interpreter
    learnFromMovement(rawData, gestureData, musicalData) {
        if (!rawData || !gestureData || !musicalData) return;

        try {
            // Update session data
            this.updateSessionData(rawData, gestureData, musicalData);

            // Analyze movement patterns
            this.analyzeMovementPatterns(rawData, gestureData);

            // Learn from gesture preferences
            this.learnGesturePreferences(gestureData);

            // Adapt musical responses
            this.adaptMusicalResponses(musicalData, gestureData);

            // Update visitor profile
            this.updateVisitorProfile(rawData, gestureData, musicalData);

            // Apply adaptations
            this.applyAdaptations();

            // Record learning event
            this.recordLearningEvent(rawData, gestureData, musicalData);

        } catch (error) {
            console.warn('Adaptive learning error (non-blocking):', error);
        }
    }

    updateSessionData(rawData, gestureData, musicalData) {
        this.currentProfile.sessionData.totalMovements++;
        this.currentProfile.sessionData.timeSpent = Date.now() - this.currentProfile.startTime;

        // Track favorite gestures
        if (gestureData.detectedGestures && gestureData.detectedGestures.length > 0) {
            gestureData.detectedGestures.forEach(gesture => {
                const existing = this.currentProfile.sessionData.favoriteGestures.find(g => g.type === gesture.type);
                if (existing) {
                    existing.count++;
                    existing.avgConfidence = (existing.avgConfidence + gesture.confidence) / 2;
                } else {
                    this.currentProfile.sessionData.favoriteGestures.push({
                        type: gesture.type,
                        count: 1,
                        avgConfidence: gesture.confidence
                    });
                }
            });
        }

        // Calculate engagement level
        this.calculateEngagementLevel(rawData, gestureData, musicalData);
    }

    calculateEngagementLevel(rawData, gestureData, musicalData) {
        let engagement = 0;

        // Movement activity factor
        const movementEnergy = this.calculateMovementEnergy(rawData);
        engagement += Math.min(1, movementEnergy * 0.3);

        // Gesture recognition factor
        const gestureCount = gestureData.detectedGestures?.length || 0;
        engagement += Math.min(1, gestureCount * 0.2);

        // Musical interaction factor
        const musicalEngagement = musicalData.phrases?.length || 0;
        engagement += Math.min(1, musicalEngagement * 0.25);

        // Session duration factor (up to 5 minutes = max engagement)
        const sessionMinutes = this.currentProfile.sessionData.timeSpent / (1000 * 60);
        engagement += Math.min(1, sessionMinutes / 5 * 0.25);

        // Smooth update
        this.currentProfile.sessionData.engagementLevel =
            this.currentProfile.sessionData.engagementLevel * 0.9 + engagement * 0.1;
    }

    calculateMovementEnergy(rawData) {
        if (!rawData.bodies || rawData.bodies.length === 0) return 0;

        let totalEnergy = 0;
        rawData.bodies.forEach(body => {
            if (body.joints) {
                Object.values(body.joints).forEach(joint => {
                    if (joint.velocity) {
                        totalEnergy += Math.sqrt(
                            joint.velocity.x ** 2 +
                            joint.velocity.y ** 2 +
                            joint.velocity.z ** 2
                        );
                    }
                });
            }
        });

        return Math.min(1, totalEnergy / 10); // Normalize to 0-1
    }

    analyzeMovementPatterns(rawData, gestureData) {
        // Track gesture frequency
        if (gestureData.detectedGestures) {
            gestureData.detectedGestures.forEach(gesture => {
                const count = this.behaviorPatterns.gestureFrequency.get(gesture.type) || 0;
                this.behaviorPatterns.gestureFrequency.set(gesture.type, count + 1);
            });
        }

        // Track movement intensity over time
        const intensity = this.calculateMovementEnergy(rawData);
        this.behaviorPatterns.movementIntensity.push(intensity);

        // Keep only recent history (last 100 measurements)
        if (this.behaviorPatterns.movementIntensity.length > 100) {
            this.behaviorPatterns.movementIntensity.shift();
        }

        // Track time patterns
        const hour = new Date().getHours();
        const timeCount = this.behaviorPatterns.timeOfDay.get(hour) || 0;
        this.behaviorPatterns.timeOfDay.set(hour, timeCount + 1);
    }

    learnGesturePreferences(gestureData) {
        if (!gestureData.detectedGestures) return;

        gestureData.detectedGestures.forEach(gesture => {
            const gestureType = gesture.type;

            // Learn preferred gesture thresholds
            if (!this.currentProfile.adaptations.gestureThresholds[gestureType]) {
                this.currentProfile.adaptations.gestureThresholds[gestureType] = {
                    sensitivity: 0.5,
                    responseIntensity: 1.0,
                    preferredConfidence: 0.7
                };
            }

            const threshold = this.currentProfile.adaptations.gestureThresholds[gestureType];

            // Adapt based on gesture confidence and frequency
            if (gesture.confidence > 0.8) {
                // High confidence gestures - user is comfortable with current sensitivity
                threshold.sensitivity = threshold.sensitivity * 0.95 + 0.5 * 0.05;
            } else if (gesture.confidence < 0.5) {
                // Low confidence - might need higher sensitivity
                threshold.sensitivity = threshold.sensitivity * 0.95 + 0.7 * 0.05;
            }

            // Adapt response intensity based on repetition
            const frequency = this.behaviorPatterns.gestureFrequency.get(gestureType) || 1;
            if (frequency > 10) {
                // Frequently used gesture - user likes it, enhance response
                threshold.responseIntensity = Math.min(1.5, threshold.responseIntensity * 1.02);
            }
        });
    }

    adaptMusicalResponses(musicalData, gestureData) {
        if (!musicalData.phrases) return;

        musicalData.phrases.forEach(phrase => {
            const gestureType = phrase.triggerGesture || 'unknown';

            if (!this.currentProfile.adaptations.musicalMappings[gestureType]) {
                this.currentProfile.adaptations.musicalMappings[gestureType] = {
                    preferredScale: 'major',
                    preferredTempo: 120,
                    harmonicComplexity: 0.5,
                    rhythmicVariation: 0.5
                };
            }

            const mapping = this.currentProfile.adaptations.musicalMappings[gestureType];

            // Learn from musical phrase characteristics
            if (phrase.scale) {
                mapping.preferredScale = phrase.scale;
            }

            if (phrase.tempo) {
                mapping.preferredTempo = mapping.preferredTempo * 0.9 + phrase.tempo * 0.1;
            }

            // Adapt complexity based on user engagement
            const engagement = this.currentProfile.sessionData.engagementLevel;
            if (engagement > 0.7) {
                mapping.harmonicComplexity = Math.min(1, mapping.harmonicComplexity * 1.01);
                mapping.rhythmicVariation = Math.min(1, mapping.rhythmicVariation * 1.01);
            } else if (engagement < 0.3) {
                mapping.harmonicComplexity = Math.max(0.1, mapping.harmonicComplexity * 0.99);
                mapping.rhythmicVariation = Math.max(0.1, mapping.rhythmicVariation * 0.99);
            }
        });
    }

    updateVisitorProfile(rawData, gestureData, musicalData) {
        // Analyze movement characteristics
        const characteristics = this.analyzeMovementCharacteristics(rawData, gestureData, musicalData);

        // Update preferences based on characteristics
        this.currentProfile.preferences.intensity =
            this.currentProfile.preferences.intensity * 0.9 + characteristics.intensity * 0.1;

        this.currentProfile.preferences.complexity =
            this.currentProfile.preferences.complexity * 0.9 + characteristics.complexity * 0.1;

        this.currentProfile.preferences.musicality =
            this.currentProfile.preferences.musicality * 0.9 + characteristics.musicality * 0.1;

        this.currentProfile.preferences.creativity =
            this.currentProfile.preferences.creativity * 0.9 + characteristics.creativity * 0.1;

        // Classify visitor type
        this.classifyVisitorType(characteristics);

        // Update profile stability
        this.updateProfileStability();
    }

    analyzeMovementCharacteristics(rawData, gestureData, musicalData) {
        const characteristics = {
            intensity: this.calculateMovementEnergy(rawData),
            complexity: this.calculateMovementComplexity(gestureData),
            musicality: this.calculateMusicalAlignment(musicalData),
            creativity: this.calculateCreativityScore(gestureData),
            variety: this.calculateMovementVariety(),
            consistency: this.calculateMovementConsistency(),
            rhythm: this.calculateRhythmicAlignment(musicalData),
            fluidity: this.calculateMovementFluidity(rawData)
        };

        return characteristics;
    }

    calculateMovementComplexity(gestureData) {
        if (!gestureData.sequences) return 0.5;

        const avgSequenceLength = gestureData.sequences.reduce((sum, seq) => sum + seq.length, 0) / gestureData.sequences.length;
        const gestureVariety = new Set(gestureData.detectedGestures?.map(g => g.type) || []).size;

        return Math.min(1, (avgSequenceLength * 0.1 + gestureVariety * 0.15) / 2);
    }

    calculateMusicalAlignment(musicalData) {
        if (!musicalData.phrases) return 0.5;

        const phraseCount = musicalData.phrases.length;
        const rhythmicPatterns = musicalData.rhythmicPatterns?.length || 0;

        return Math.min(1, (phraseCount * 0.2 + rhythmicPatterns * 0.1) / 2);
    }

    calculateCreativityScore(gestureData) {
        // Base creativity on gesture novelty and combination uniqueness
        if (!gestureData.detectedGestures) return 0.5;

        const gestureTypes = gestureData.detectedGestures.map(g => g.type);
        const uniqueCombinations = new Set();

        for (let i = 0; i < gestureTypes.length - 1; i++) {
            uniqueCombinations.add(`${gestureTypes[i]}-${gestureTypes[i + 1]}`);
        }

        return Math.min(1, uniqueCombinations.size * 0.2);
    }

    calculateMovementVariety() {
        const recentGestures = Array.from(this.behaviorPatterns.gestureFrequency.keys());
        return Math.min(1, recentGestures.length * 0.1);
    }

    calculateMovementConsistency() {
        if (this.behaviorPatterns.movementIntensity.length < 10) return 0.5;

        const intensities = this.behaviorPatterns.movementIntensity.slice(-20);
        const mean = intensities.reduce((sum, val) => sum + val, 0) / intensities.length;
        const variance = intensities.reduce((sum, val) => sum + (val - mean) ** 2, 0) / intensities.length;

        return Math.max(0, 1 - variance * 2); // Lower variance = higher consistency
    }

    calculateRhythmicAlignment(musicalData) {
        return (musicalData.rhythmicPatterns?.length || 0) * 0.3;
    }

    calculateMovementFluidity(rawData) {
        // Simple fluidity approximation based on velocity smoothness
        return Math.min(1, this.calculateMovementEnergy(rawData) * 0.8);
    }

    classifyVisitorType(characteristics) {
        let bestMatch = 'explorer';
        let bestScore = 0;

        Object.entries(this.visitorTypes).forEach(([type, typeData]) => {
            let score = 0;
            let matchCount = 0;

            Object.entries(typeData.characteristics).forEach(([trait, expectedValue]) => {
                if (characteristics[trait] !== undefined) {
                    const similarity = 1 - Math.abs(characteristics[trait] - expectedValue);
                    score += similarity;
                    matchCount++;
                }
            });

            if (matchCount > 0) {
                score /= matchCount;
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = type;
                }
            }
        });

        // Update movement style if confidence is high enough
        if (bestScore > this.confidenceThreshold) {
            this.currentProfile.movementStyle = bestMatch;
        }
    }

    updateProfileStability() {
        // Profile becomes more stable over time and with more data
        const timeStability = Math.min(1, this.currentProfile.sessionData.timeSpent / (1000 * 60 * 2)); // 2 minutes
        const dataStability = Math.min(1, this.currentProfile.sessionData.totalMovements / 50); // 50 movements

        this.profileStability = (timeStability + dataStability) / 2;
    }

    applyAdaptations() {
        // Apply learned adaptations to the current profile
        if (this.currentProfile.movementStyle !== 'unknown') {
            const visitorType = this.visitorTypes[this.currentProfile.movementStyle];
            if (visitorType && this.profileStability > 0.5) {
                // Blend visitor type adaptations with personal learned preferences
                const blendFactor = this.profileStability * 0.3;

                Object.entries(visitorType.adaptations).forEach(([adaptation, value]) => {
                    if (!this.currentProfile.adaptations.visualPreferences[adaptation]) {
                        this.currentProfile.adaptations.visualPreferences[adaptation] = 1.0;
                    }

                    this.currentProfile.adaptations.visualPreferences[adaptation] =
                        this.currentProfile.adaptations.visualPreferences[adaptation] * (1 - blendFactor) +
                        value * blendFactor;
                });
            }
        }
    }

    recordLearningEvent(rawData, gestureData, musicalData) {
        const event = {
            timestamp: Date.now(),
            profileStability: this.profileStability,
            engagementLevel: this.currentProfile.sessionData.engagementLevel,
            movementStyle: this.currentProfile.movementStyle,
            gestureCount: gestureData.detectedGestures?.length || 0,
            musicalPhrases: musicalData.phrases?.length || 0
        };

        this.learningHistory.push(event);

        // Keep only recent history (last 200 events)
        if (this.learningHistory.length > 200) {
            this.learningHistory.shift();
        }
    }

    // Public API for getting learned adaptations
    getAdaptationsForGesture(gestureType) {
        return this.currentProfile.adaptations.gestureThresholds[gestureType] || {
            sensitivity: 0.5,
            responseIntensity: 1.0,
            preferredConfidence: 0.7
        };
    }

    getMusicalAdaptations(gestureType) {
        return this.currentProfile.adaptations.musicalMappings[gestureType] || {
            preferredScale: 'major',
            preferredTempo: 120,
            harmonicComplexity: 0.5,
            rhythmicVariation: 0.5
        };
    }

    getVisualAdaptations() {
        return this.currentProfile.adaptations.visualPreferences;
    }

    getCurrentProfile() {
        return {
            ...this.currentProfile,
            profileStability: this.profileStability,
            visitorTypeDescription: this.visitorTypes[this.currentProfile.movementStyle]?.description || 'Learning visitor preferences...'
        };
    }

    // Utility functions
    generateVisitorId() {
        return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Reset and cleanup
    reset() {
        this.currentProfile = {
            id: this.generateVisitorId(),
            startTime: Date.now(),
            movementStyle: 'unknown',
            preferences: {
                intensity: 0.5,
                complexity: 0.5,
                musicality: 0.5,
                creativity: 0.5
            },
            adaptations: {
                gestureThresholds: {},
                musicalMappings: {},
                visualPreferences: {}
            },
            sessionData: {
                totalMovements: 0,
                favoriteGestures: [],
                timeSpent: 0,
                engagementLevel: 0.5
            }
        };

        this.learningHistory = [];
        this.behaviorPatterns = {
            gestureFrequency: new Map(),
            movementIntensity: [],
            timeOfDay: new Map(),
            sessionLength: []
        };

        this.profileStability = 0.0;
        console.log('🧠 Adaptive Learning system reset');
    }

    // Status and debugging
    getStatus() {
        return {
            visitorId: this.currentProfile.id,
            movementStyle: this.currentProfile.movementStyle,
            profileStability: Math.round(this.profileStability * 100) / 100,
            engagementLevel: Math.round(this.currentProfile.sessionData.engagementLevel * 100) / 100,
            sessionTime: Math.round(this.currentProfile.sessionData.timeSpent / 1000),
            totalMovements: this.currentProfile.sessionData.totalMovements,
            learnedGestures: Object.keys(this.currentProfile.adaptations.gestureThresholds).length,
            adaptationCount: Object.keys(this.currentProfile.adaptations.visualPreferences).length
        };
    }

    getLearningHistory() {
        return this.learningHistory.slice(-50); // Last 50 events
    }
}

// Export for use in AI Movement Interpreter
window.AdaptiveLearning = AdaptiveLearning;