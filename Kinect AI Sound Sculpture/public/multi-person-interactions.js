/**
 * Multi-Person Interaction System
 * Detects coordination, enables duet modes, and learns patterns through repetition
 */

class MultiPersonInteractionManager {
    constructor() {
        this.bodies = new Map(); // Track individual bodies over time
        this.coordinationHistory = [];
        this.duetModes = new Map();
        this.groupChoreographies = [];
        this.learnedPatterns = new Map();
        this.interactionCallbacks = new Map();

        // Coordination detection parameters
        this.coordinationThreshold = 0.7;
        this.syncWindowMs = 1000;
        this.minSyncDuration = 2000;

        // Pattern learning parameters
        this.patternMinOccurrences = 3;
        this.patternSimilarityThreshold = 0.8;
        this.maxPatternHistory = 100;

        // Visual feedback state
        this.visualEffects = new Map();
        this.activeConnections = new Set();

        this.initializeDuetModes();
        this.initializeChoreographyTemplates();
    }

    initializeDuetModes() {
        // Define complementary duet modes
        this.duetModes.set('harmony', {
            name: 'Harmonic Duet',
            description: 'One person leads melody, other provides harmony',
            roles: ['melody', 'harmony'],
            audioProfile: {
                melody: {
                    gain: 0.8,
                    reverb: 0.3,
                    frequencies: [440, 523, 659], // A4, C5, E5
                    timbre: 'sine'
                },
                harmony: {
                    gain: 0.6,
                    reverb: 0.5,
                    frequencies: [220, 277, 330], // A3, C#4, E4
                    timbre: 'sawtooth'
                }
            },
            coordinationRequirements: {
                simultaneousMovement: 0.8,
                complementaryGestures: true,
                minDuration: 3000
            }
        });

        this.duetModes.set('rhythmic', {
            name: 'Rhythmic Dialogue',
            description: 'Alternating rhythmic patterns creating conversation',
            roles: ['beat', 'counter'],
            audioProfile: {
                beat: {
                    gain: 0.9,
                    attack: 0.01,
                    frequencies: [80, 160, 320],
                    timbre: 'square'
                },
                counter: {
                    gain: 0.7,
                    attack: 0.05,
                    frequencies: [100, 200, 400],
                    timbre: 'triangle'
                }
            },
            coordinationRequirements: {
                alternatingPulses: true,
                rhythmicAlignment: 0.9,
                minDuration: 4000
            }
        });

        this.duetModes.set('mirror', {
            name: 'Mirror Dance',
            description: 'Synchronized mirrored movements with layered sounds',
            roles: ['lead', 'mirror'],
            audioProfile: {
                lead: {
                    gain: 0.8,
                    delay: 0,
                    frequencies: [523, 659, 784],
                    timbre: 'sine'
                },
                mirror: {
                    gain: 0.8,
                    delay: 0.1,
                    frequencies: [523, 659, 784],
                    timbre: 'sine'
                }
            },
            coordinationRequirements: {
                mirroredMovement: 0.85,
                synchronization: 0.9,
                minDuration: 5000
            }
        });

        this.duetModes.set('chase', {
            name: 'Follow the Leader',
            description: 'One leads, other follows with cascading audio effects',
            roles: ['leader', 'follower'],
            audioProfile: {
                leader: {
                    gain: 0.9,
                    delay: 0,
                    frequencies: [440, 554, 659],
                    timbre: 'sine'
                },
                follower: {
                    gain: 0.7,
                    delay: 0.3,
                    frequencies: [440, 554, 659],
                    timbre: 'sine'
                }
            },
            coordinationRequirements: {
                followingPattern: 0.8,
                delayedMirroring: true,
                minDuration: 4000
            }
        });
    }

    initializeChoreographyTemplates() {
        // Pre-defined group choreography patterns
        this.groupChoreographies = [
            {
                id: 'circle_dance',
                name: 'Circle of Unity',
                description: 'Group moves in circular formation',
                minParticipants: 3,
                pattern: {
                    formation: 'circle',
                    movement: 'synchronized_rotation',
                    audioEffect: 'circular_harmony'
                },
                requirements: {
                    spatialArrangement: 'circular',
                    movementSync: 0.75,
                    duration: 8000
                }
            },
            {
                id: 'wave_motion',
                name: 'Human Wave',
                description: 'Sequential wave-like movement across participants',
                minParticipants: 3,
                pattern: {
                    formation: 'line',
                    movement: 'sequential_wave',
                    audioEffect: 'cascading_tones'
                },
                requirements: {
                    sequentialTiming: 0.8,
                    waveAmplitude: 0.6,
                    duration: 6000
                }
            },
            {
                id: 'convergence',
                name: 'Convergent Energy',
                description: 'All participants move toward center simultaneously',
                minParticipants: 2,
                pattern: {
                    formation: 'dispersed',
                    movement: 'convergent',
                    audioEffect: 'building_crescendo'
                },
                requirements: {
                    convergentMotion: 0.7,
                    simultaneousApproach: 0.8,
                    duration: 5000
                }
            }
        ];
    }

    processMultiPersonData(data) {
        if (!data.skeletons || data.skeletons.length < 2) {
            this.resetMultiPersonState();
            return data; // Return original data if less than 2 people
        }

        // Update body tracking
        this.updateBodyTracking(data.skeletons);

        // Detect coordination patterns
        const coordinationData = this.detectCoordination(data.skeletons);

        // Check for duet mode triggers
        const duetData = this.processDuetModes(data.skeletons, coordinationData);

        // Detect group choreography
        const choreographyData = this.detectGroupChoreography(data.skeletons);

        // Learn new patterns from repetition
        this.learnFromRepetition(data.skeletons, coordinationData);

        // Generate enhanced data with multi-person insights
        return this.enhanceDataWithInteractions(data, {
            coordination: coordinationData,
            duet: duetData,
            choreography: choreographyData,
            multiPersonMetrics: this.calculateMultiPersonMetrics(data.skeletons)
        });
    }

    updateBodyTracking(skeletons) {
        const currentTime = Date.now();

        skeletons.forEach((body, index) => {
            const bodyId = body.id || index;

            if (!this.bodies.has(bodyId)) {
                this.bodies.set(bodyId, {
                    id: bodyId,
                    history: [],
                    patterns: [],
                    lastSeen: currentTime,
                    totalInteractionTime: 0
                });
            }

            const bodyData = this.bodies.get(bodyId);
            bodyData.history.push({
                joints: body.joints,
                timestamp: currentTime,
                metrics: body.metrics || {}
            });

            // Keep only recent history (last 30 seconds)
            const cutoffTime = currentTime - 30000;
            bodyData.history = bodyData.history.filter(h => h.timestamp > cutoffTime);
            bodyData.lastSeen = currentTime;
        });

        // Clean up bodies not seen recently
        const staleTime = currentTime - 5000;
        for (const [bodyId, bodyData] of this.bodies.entries()) {
            if (bodyData.lastSeen < staleTime) {
                this.bodies.delete(bodyId);
            }
        }
    }

    detectCoordination(skeletons) {
        if (skeletons.length < 2) return null;

        const coordination = {
            timestamp: Date.now(),
            pairs: [],
            groupSync: 0,
            dominantPattern: null
        };

        // Analyze all pairs of people
        for (let i = 0; i < skeletons.length; i++) {
            for (let j = i + 1; j < skeletons.length; j++) {
                const pairCoordination = this.analyzePairCoordination(skeletons[i], skeletons[j]);
                if (pairCoordination.score > this.coordinationThreshold) {
                    coordination.pairs.push({
                        bodies: [skeletons[i].id || i, skeletons[j].id || j],
                        ...pairCoordination
                    });
                }
            }
        }

        // Calculate overall group synchronization
        coordination.groupSync = this.calculateGroupSynchronization(skeletons);

        // Store coordination history
        this.coordinationHistory.push(coordination);
        if (this.coordinationHistory.length > 50) {
            this.coordinationHistory.shift();
        }

        return coordination;
    }

    analyzePairCoordination(body1, body2) {
        const joints1 = body1.joints;
        const joints2 = body2.joints;

        // Key joints for coordination analysis
        const keyJoints = ['HAND_LEFT', 'HAND_RIGHT', 'HEAD', 'SPINE_CHEST'];

        let totalScore = 0;
        let validComparisons = 0;

        keyJoints.forEach(jointKey => {
            const joint1 = joints1[jointKey];
            const joint2 = joints2[jointKey];

            if (joint1 && joint2 && joint1.confidence > 0.5 && joint2.confidence > 0.5) {
                // Calculate movement velocity similarity
                const velocity1 = this.calculateJointVelocity(body1.id || 0, jointKey);
                const velocity2 = this.calculateJointVelocity(body2.id || 1, jointKey);

                if (velocity1 && velocity2) {
                    const velocityCorrelation = this.calculateVectorCorrelation(velocity1, velocity2);
                    totalScore += velocityCorrelation;
                    validComparisons++;
                }
            }
        });

        const coordinationScore = validComparisons > 0 ? totalScore / validComparisons : 0;

        return {
            score: coordinationScore,
            type: this.classifyCoordinationType(coordinationScore),
            synchronization: this.calculateSynchronization(body1, body2),
            mirroring: this.calculateMirroring(body1, body2)
        };
    }

    calculateJointVelocity(bodyId, jointKey) {
        const bodyData = this.bodies.get(bodyId);
        if (!bodyData || bodyData.history.length < 2) return null;

        const recent = bodyData.history.slice(-2);
        const joint1 = recent[0].joints[jointKey];
        const joint2 = recent[1].joints[jointKey];

        if (!joint1 || !joint2) return null;

        const dt = (recent[1].timestamp - recent[0].timestamp) / 1000; // Convert to seconds
        if (dt === 0) return null;

        return {
            x: (joint2.position.x - joint1.position.x) / dt,
            y: (joint2.position.y - joint1.position.y) / dt,
            z: (joint2.position.z - joint1.position.z) / dt
        };
    }

    calculateVectorCorrelation(v1, v2) {
        const magnitude1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
        const magnitude2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

        if (magnitude1 === 0 || magnitude2 === 0) return 0;

        const dotProduct = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
        return dotProduct / (magnitude1 * magnitude2);
    }

    classifyCoordinationType(score) {
        if (score > 0.8) return 'synchronized';
        if (score > 0.6) return 'coordinated';
        if (score > 0.4) return 'loosely_aligned';
        return 'independent';
    }

    calculateSynchronization(body1, body2) {
        // Measure how well the timing of movements align
        const movements1 = this.extractMovementPulses(body1);
        const movements2 = this.extractMovementPulses(body2);

        if (!movements1.length || !movements2.length) return 0;

        // Calculate cross-correlation of movement pulses
        return this.calculateCrossCorrelation(movements1, movements2);
    }

    calculateMirroring(body1, body2) {
        // Check if movements are mirrored (left-right symmetry)
        const leftHand1 = body1.joints.HAND_LEFT;
        const rightHand1 = body1.joints.HAND_RIGHT;
        const leftHand2 = body2.joints.HAND_LEFT;
        const rightHand2 = body2.joints.HAND_RIGHT;

        if (!leftHand1 || !rightHand1 || !leftHand2 || !rightHand2) return 0;

        // Calculate if person 1's left hand mirrors person 2's right hand, etc.
        const leftRightCorrelation = this.calculatePositionCorrelation(leftHand1, rightHand2);
        const rightLeftCorrelation = this.calculatePositionCorrelation(rightHand1, leftHand2);

        return (leftRightCorrelation + rightLeftCorrelation) / 2;
    }

    calculateGroupSynchronization(skeletons) {
        if (skeletons.length < 3) return 0;

        // Calculate how synchronized the entire group is
        let totalSync = 0;
        let comparisons = 0;

        for (let i = 0; i < skeletons.length; i++) {
            for (let j = i + 1; j < skeletons.length; j++) {
                const pairSync = this.calculateSynchronization(skeletons[i], skeletons[j]);
                totalSync += pairSync;
                comparisons++;
            }
        }

        return comparisons > 0 ? totalSync / comparisons : 0;
    }

    processDuetModes(skeletons, coordinationData) {
        if (!coordinationData || coordinationData.pairs.length === 0) return null;

        const duetResults = [];

        coordinationData.pairs.forEach(pair => {
            this.duetModes.forEach((mode, modeId) => {
                const compatibility = this.checkDuetCompatibility(pair, mode);
                if (compatibility.score > 0.7) {
                    duetResults.push({
                        modeId,
                        mode,
                        participants: pair.bodies,
                        compatibility,
                        roles: this.assignDuetRoles(pair, mode)
                    });
                }
            });
        });

        return duetResults.length > 0 ? duetResults : null;
    }

    checkDuetCompatibility(pair, mode) {
        const requirements = mode.coordinationRequirements;
        let score = 0;
        let factors = 0;

        if (requirements.simultaneousMovement) {
            score += pair.synchronization * requirements.simultaneousMovement;
            factors++;
        }

        if (requirements.mirroredMovement) {
            score += pair.mirroring * requirements.mirroredMovement;
            factors++;
        }

        if (requirements.complementaryGestures) {
            // Check for complementary rather than identical movements
            const complementarity = 1 - pair.score; // Lower correlation = more complementary
            score += complementarity * 0.8;
            factors++;
        }

        return {
            score: factors > 0 ? score / factors : 0,
            details: {
                synchronization: pair.synchronization,
                mirroring: pair.mirroring,
                coordination: pair.score
            }
        };
    }

    assignDuetRoles(pair, mode) {
        const roles = mode.roles;
        // Simple role assignment - could be enhanced with more sophisticated logic
        return {
            [pair.bodies[0]]: roles[0],
            [pair.bodies[1]]: roles[1]
        };
    }

    detectGroupChoreography(skeletons) {
        if (skeletons.length < 2) return null;

        const detectedChoreographies = [];

        this.groupChoreographies.forEach(choreography => {
            if (skeletons.length >= choreography.minParticipants) {
                const match = this.checkChoreographyMatch(skeletons, choreography);
                if (match.score > 0.7) {
                    detectedChoreographies.push({
                        ...choreography,
                        match,
                        participants: skeletons.map(s => s.id || 0)
                    });
                }
            }
        });

        return detectedChoreographies.length > 0 ? detectedChoreographies : null;
    }

    checkChoreographyMatch(skeletons, choreography) {
        const requirements = choreography.requirements;
        let score = 0;
        let factors = 0;

        // Check spatial arrangement
        if (requirements.spatialArrangement === 'circular') {
            const circularityScore = this.calculateCircularArrangement(skeletons);
            score += circularityScore;
            factors++;
        }

        // Check movement synchronization
        if (requirements.movementSync) {
            const groupSync = this.calculateGroupSynchronization(skeletons);
            score += groupSync * requirements.movementSync;
            factors++;
        }

        // Check sequential timing for wave patterns
        if (requirements.sequentialTiming) {
            const sequentialScore = this.calculateSequentialTiming(skeletons);
            score += sequentialScore * requirements.sequentialTiming;
            factors++;
        }

        return {
            score: factors > 0 ? score / factors : 0,
            timestamp: Date.now()
        };
    }

    calculateCircularArrangement(skeletons) {
        if (skeletons.length < 3) return 0;

        // Calculate center point
        const center = this.calculateCenterPoint(skeletons);

        // Check if bodies are roughly equidistant from center
        const distances = skeletons.map(skeleton => {
            const pos = skeleton.joints.SPINE_CHEST?.position;
            if (!pos) return 0;

            return Math.sqrt(
                Math.pow(pos.x - center.x, 2) +
                Math.pow(pos.z - center.z, 2)
            );
        });

        const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
        const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;
        const standardDeviation = Math.sqrt(variance);

        // Lower variance indicates more circular arrangement
        return Math.max(0, 1 - (standardDeviation / avgDistance));
    }

    calculateCenterPoint(skeletons) {
        let totalX = 0, totalZ = 0, validBodies = 0;

        skeletons.forEach(skeleton => {
            const pos = skeleton.joints.SPINE_CHEST?.position;
            if (pos) {
                totalX += pos.x;
                totalZ += pos.z;
                validBodies++;
            }
        });

        return validBodies > 0 ? {
            x: totalX / validBodies,
            z: totalZ / validBodies
        } : { x: 0, z: 0 };
    }

    learnFromRepetition(skeletons, coordinationData) {
        if (!coordinationData || coordinationData.pairs.length === 0) return;

        coordinationData.pairs.forEach(pair => {
            const patternKey = `${pair.bodies[0]}_${pair.bodies[1]}`;

            if (!this.learnedPatterns.has(patternKey)) {
                this.learnedPatterns.set(patternKey, {
                    occurrences: [],
                    pattern: null,
                    confidence: 0
                });
            }

            const patternData = this.learnedPatterns.get(patternKey);
            patternData.occurrences.push({
                timestamp: Date.now(),
                coordination: pair,
                type: pair.type
            });

            // Keep only recent occurrences
            const cutoffTime = Date.now() - 300000; // 5 minutes
            patternData.occurrences = patternData.occurrences.filter(o => o.timestamp > cutoffTime);

            // Check if pattern is established
            if (patternData.occurrences.length >= this.patternMinOccurrences) {
                this.establishLearnedPattern(patternKey, patternData);
            }
        });
    }

    establishLearnedPattern(patternKey, patternData) {
        const recentOccurrences = patternData.occurrences.slice(-this.patternMinOccurrences);

        // Calculate pattern consistency
        const typeConsistency = this.calculateTypeConsistency(recentOccurrences);
        const scoreConsistency = this.calculateScoreConsistency(recentOccurrences);

        if (typeConsistency > this.patternSimilarityThreshold &&
            scoreConsistency > this.patternSimilarityThreshold) {

            patternData.pattern = {
                type: recentOccurrences[0].coordination.type,
                averageScore: recentOccurrences.reduce((sum, o) => sum + o.coordination.score, 0) / recentOccurrences.length,
                established: Date.now()
            };

            patternData.confidence = Math.min(typeConsistency, scoreConsistency);

            // Trigger callback for learned pattern
            this.triggerLearnedPatternCallback(patternKey, patternData.pattern);
        }
    }

    calculateTypeConsistency(occurrences) {
        const types = occurrences.map(o => o.coordination.type);
        const primaryType = types[0];
        const matches = types.filter(t => t === primaryType).length;
        return matches / types.length;
    }

    calculateScoreConsistency(occurrences) {
        const scores = occurrences.map(o => o.coordination.score);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length;
        const standardDeviation = Math.sqrt(variance);

        // Lower variance indicates higher consistency
        return Math.max(0, 1 - (standardDeviation / avgScore));
    }

    enhanceDataWithInteractions(originalData, interactionData) {
        return {
            ...originalData,
            multiPersonInteractions: {
                coordination: interactionData.coordination,
                duetModes: interactionData.duet,
                groupChoreography: interactionData.choreography,
                learnedPatterns: Array.from(this.learnedPatterns.entries()).map(([key, data]) => ({
                    pairKey: key,
                    pattern: data.pattern,
                    confidence: data.confidence
                })),
                visualEffects: this.generateVisualEffects(interactionData),
                audioEnhancements: this.generateAudioEnhancements(interactionData)
            },
            multiPersonMetrics: interactionData.multiPersonMetrics
        };
    }

    calculateMultiPersonMetrics(skeletons) {
        return {
            totalParticipants: skeletons.length,
            groupCohesion: this.calculateGroupSynchronization(skeletons),
            interactionIntensity: this.calculateInteractionIntensity(),
            learnedPatternsCount: Array.from(this.learnedPatterns.values()).filter(p => p.pattern).length,
            activeDuets: this.getActiveDuetCount(),
            groupFormation: this.classifyGroupFormation(skeletons)
        };
    }

    calculateInteractionIntensity() {
        const recentCoordination = this.coordinationHistory.slice(-10);
        if (recentCoordination.length === 0) return 0;

        const avgPairs = recentCoordination.reduce((sum, c) => sum + c.pairs.length, 0) / recentCoordination.length;
        const avgGroupSync = recentCoordination.reduce((sum, c) => sum + c.groupSync, 0) / recentCoordination.length;

        return (avgPairs * 0.4 + avgGroupSync * 0.6);
    }

    getActiveDuetCount() {
        // Count currently active duet modes
        return this.coordinationHistory.length > 0 ?
            this.coordinationHistory[this.coordinationHistory.length - 1].pairs.filter(p => p.score > 0.7).length : 0;
    }

    classifyGroupFormation(skeletons) {
        if (skeletons.length < 2) return 'solo';
        if (skeletons.length === 2) return 'pair';

        const circularScore = this.calculateCircularArrangement(skeletons);
        const lineScore = this.calculateLinearArrangement(skeletons);

        if (circularScore > 0.7) return 'circle';
        if (lineScore > 0.7) return 'line';
        return 'cluster';
    }

    calculateLinearArrangement(skeletons) {
        if (skeletons.length < 3) return 0;

        // Simple linear arrangement check - could be enhanced
        const positions = skeletons.map(s => s.joints.SPINE_CHEST?.position).filter(p => p);
        if (positions.length < 3) return 0;

        // Check if points roughly form a line
        // This is a simplified implementation
        return 0.5; // Placeholder
    }

    generateVisualEffects(interactionData) {
        const effects = [];

        // Add connection lines for coordinated pairs
        if (interactionData.coordination && interactionData.coordination.pairs.length > 0) {
            interactionData.coordination.pairs.forEach(pair => {
                if (pair.score > this.coordinationThreshold) {
                    effects.push({
                        type: 'connection_line',
                        bodies: pair.bodies,
                        strength: pair.score,
                        color: this.getCoordinationColor(pair.type)
                    });
                }
            });
        }

        // Add duet mode indicators
        if (interactionData.duet) {
            interactionData.duet.forEach(duet => {
                effects.push({
                    type: 'duet_aura',
                    bodies: duet.participants,
                    mode: duet.modeId,
                    intensity: duet.compatibility.score
                });
            });
        }

        return effects;
    }

    getCoordinationColor(type) {
        const colors = {
            'synchronized': '#00ff00',
            'coordinated': '#ffff00',
            'loosely_aligned': '#ff8800',
            'independent': '#888888'
        };
        return colors[type] || '#ffffff';
    }

    generateAudioEnhancements(interactionData) {
        const enhancements = [];

        // Apply duet mode audio profiles
        if (interactionData.duet) {
            interactionData.duet.forEach(duet => {
                duet.participants.forEach((bodyId, index) => {
                    const role = duet.roles[bodyId];
                    const audioProfile = duet.mode.audioProfile[role];

                    enhancements.push({
                        bodyId,
                        role,
                        audioProfile,
                        duetMode: duet.modeId
                    });
                });
            });
        }

        return enhancements;
    }

    // Utility methods for missing calculations
    extractMovementPulses(body) {
        // Extract rhythm/pulse information from movement
        // Simplified implementation
        return [];
    }

    calculateCrossCorrelation(movements1, movements2) {
        // Calculate cross-correlation between movement sequences
        // Simplified implementation
        return 0.5;
    }

    calculatePositionCorrelation(joint1, joint2) {
        // Calculate correlation between joint positions
        // Simplified implementation
        return 0.5;
    }

    calculateSequentialTiming(skeletons) {
        // Calculate how well movements follow a sequential pattern
        // Simplified implementation
        return 0.5;
    }

    triggerLearnedPatternCallback(patternKey, pattern) {
        console.log(`Learned new pattern: ${patternKey}`, pattern);
        // Emit event or trigger callback for UI updates
    }

    resetMultiPersonState() {
        this.coordinationHistory = [];
        this.visualEffects.clear();
        this.activeConnections.clear();
    }

    // Public API methods
    onInteraction(eventType, callback) {
        if (!this.interactionCallbacks.has(eventType)) {
            this.interactionCallbacks.set(eventType, []);
        }
        this.interactionCallbacks.get(eventType).push(callback);
    }

    getCoordinationStats() {
        return {
            totalCoordinationEvents: this.coordinationHistory.length,
            learnedPatterns: this.learnedPatterns.size,
            activeBodies: this.bodies.size
        };
    }

    getDuetModes() {
        return Array.from(this.duetModes.entries()).map(([id, mode]) => ({
            id,
            ...mode
        }));
    }

    getGroupChoreographies() {
        return this.groupChoreographies;
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiPersonInteractionManager;
} else if (typeof window !== 'undefined') {
    window.MultiPersonInteractionManager = MultiPersonInteractionManager;
}