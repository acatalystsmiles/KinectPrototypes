class GestureRecognizer {
    constructor() {
        // Gesture library with common movement patterns
        this.gestureLibrary = new Map();
        this.initializeGestureLibrary();

        // Recognition parameters
        this.minGestureLength = 10; // frames
        this.maxGestureLength = 120; // frames (2 seconds at 60fps)
        this.recognitionThreshold = 0.7; // confidence threshold
        this.sequenceMemoryLength = 200; // frames of history

        // Tracking state
        this.frameBuffer = [];
        this.activeGestures = new Map(); // per body
        this.detectedGestures = [];
        this.gestureSequences = [];

        // Performance optimization
        this.frameSkip = 0;
        this.processEveryNthFrame = 2; // Process every 2nd frame for performance

        console.log('👋 Gesture Recognition initialized with library');
    }

    initializeGestureLibrary() {
        // Wave gestures
        this.addGesturePattern('wave_right', {
            description: 'Right hand wave',
            keyJoints: [15], // Right hand
            pattern: this.createWavePattern('horizontal'),
            musicalResponse: { type: 'melodic', intensity: 0.7 }
        });

        this.addGesturePattern('wave_left', {
            description: 'Left hand wave',
            keyJoints: [8], // Left hand
            pattern: this.createWavePattern('horizontal'),
            musicalResponse: { type: 'melodic', intensity: 0.7 }
        });

        // Reach gestures
        this.addGesturePattern('reach_up', {
            description: 'Reach upward',
            keyJoints: [8, 15], // Both hands
            pattern: this.createReachPattern('up'),
            musicalResponse: { type: 'ascending', intensity: 0.8 }
        });

        this.addGesturePattern('reach_out', {
            description: 'Reach outward',
            keyJoints: [8, 15],
            pattern: this.createReachPattern('out'),
            musicalResponse: { type: 'expansion', intensity: 0.6 }
        });

        // Movement quality gestures
        this.addGesturePattern('flowing_arms', {
            description: 'Smooth flowing arm movement',
            keyJoints: [5, 6, 7, 8, 12, 13, 14, 15], // Full arms
            pattern: this.createFlowingPattern(),
            musicalResponse: { type: 'legato', intensity: 0.5 }
        });

        this.addGesturePattern('sharp_movement', {
            description: 'Sharp, staccato movement',
            keyJoints: [8, 15],
            pattern: this.createSharpPattern(),
            musicalResponse: { type: 'staccato', intensity: 0.9 }
        });

        // Body gestures
        this.addGesturePattern('crouch', {
            description: 'Crouching down',
            keyJoints: [0, 1, 2, 18, 19, 22, 23], // Pelvis, spine, hips, knees
            pattern: this.createCrouchPattern(),
            musicalResponse: { type: 'descending', intensity: 0.4 }
        });

        this.addGesturePattern('jump', {
            description: 'Jumping motion',
            keyJoints: [0, 1, 2, 26], // Core body
            pattern: this.createJumpPattern(),
            musicalResponse: { type: 'accent', intensity: 1.0 }
        });

        // Expressive gestures
        this.addGesturePattern('embrace', {
            description: 'Embracing motion',
            keyJoints: [5, 8, 12, 15], // Shoulders and hands
            pattern: this.createEmbracePattern(),
            musicalResponse: { type: 'harmonic', intensity: 0.6 }
        });

        this.addGesturePattern('spiral', {
            description: 'Spiral movement',
            keyJoints: [8, 15], // Hands
            pattern: this.createSpiralPattern(),
            musicalResponse: { type: 'glissando', intensity: 0.8 }
        });

        console.log(`📚 Gesture library initialized with ${this.gestureLibrary.size} patterns`);
    }

    addGesturePattern(name, gestureData) {
        this.gestureLibrary.set(name, {
            ...gestureData,
            id: name,
            timesDetected: 0,
            lastDetected: null,
            avgConfidence: 0
        });
    }

    // Create specific gesture patterns
    createWavePattern(direction) {
        return {
            type: 'oscillation',
            direction: direction,
            frequency: { min: 0.5, max: 3.0 }, // Hz
            amplitude: { min: 0.2, max: 1.0 }, // meters
            duration: { min: 1.0, max: 4.0 } // seconds
        };
    }

    createReachPattern(direction) {
        return {
            type: 'linear',
            direction: direction,
            displacement: { min: 0.3, max: 1.2 }, // meters
            speed: { min: 0.2, max: 2.0 }, // m/s
            smoothness: { min: 0.6, max: 1.0 }
        };
    }

    createFlowingPattern() {
        return {
            type: 'smooth',
            jerkThreshold: 0.3, // Low jerk for smooth movement
            continuity: { min: 0.7, max: 1.0 },
            acceleration: { min: -2.0, max: 2.0 } // m/s²
        };
    }

    createSharpPattern() {
        return {
            type: 'sharp',
            jerkThreshold: 2.0, // High jerk for sharp movement
            peakAcceleration: { min: 3.0, max: 10.0 },
            stopDuration: { min: 0.1, max: 0.5 } // Quick stops
        };
    }

    createCrouchPattern() {
        return {
            type: 'vertical',
            direction: 'down',
            displacement: { min: 0.2, max: 0.8 }, // meters
            bodyAlignment: 'compressed'
        };
    }

    createJumpPattern() {
        return {
            type: 'vertical',
            direction: 'up',
            velocity: { min: 1.0, max: 4.0 }, // m/s
            airTime: { min: 0.2, max: 1.0 } // seconds
        };
    }

    createEmbracePattern() {
        return {
            type: 'convergent',
            arms: 'inward',
            symmetry: { min: 0.6, max: 1.0 },
            closingSpeed: { min: 0.2, max: 1.0 }
        };
    }

    createSpiralPattern() {
        return {
            type: 'circular',
            handCoordination: 'circular',
            radius: { min: 0.2, max: 0.8 },
            rotationSpeed: { min: 0.5, max: 2.0 } // rad/s
        };
    }

    // Main analysis method
    analyzeGestures(movementData) {
        if (!movementData || !movementData.bodies) {
            return this.createEmptyResult();
        }

        // Performance optimization - skip frames
        this.frameSkip++;
        if (this.frameSkip % this.processEveryNthFrame !== 0) {
            return this.getLastResult();
        }

        try {
            // Add current frame to buffer
            this.addFrameToBuffer(movementData);

            // Clear previous results
            this.detectedGestures = [];

            // Analyze each body
            for (const body of movementData.bodies) {
                this.analyzeBodyGestures(body);
            }

            // Update gesture sequences
            this.updateGestureSequences();

            return this.createResult();

        } catch (error) {
            console.error('Gesture recognition error:', error);
            return this.createEmptyResult();
        }
    }

    addFrameToBuffer(movementData) {
        // Store frame with timestamp
        const frame = {
            timestamp: Date.now(),
            bodies: movementData.bodies,
            frameIndex: this.frameBuffer.length
        };

        this.frameBuffer.push(frame);

        // Maintain buffer size
        if (this.frameBuffer.length > this.sequenceMemoryLength) {
            this.frameBuffer.shift();
        }
    }

    analyzeBodyGestures(body) {
        if (!body.joints) return;

        const bodyId = body.id || 0;

        // Analyze each gesture pattern
        for (const [gestureName, gestureData] of this.gestureLibrary) {
            const confidence = this.recognizeGesture(body, gestureData);

            if (confidence > this.recognitionThreshold) {
                this.recordGestureDetection(gestureName, gestureData, confidence, bodyId);
            }
        }
    }

    recognizeGesture(body, gestureData) {
        if (this.frameBuffer.length < this.minGestureLength) {
            return 0;
        }

        const pattern = gestureData.pattern;
        const keyJoints = gestureData.keyJoints;

        switch (pattern.type) {
            case 'oscillation':
                return this.recognizeOscillation(body, keyJoints, pattern);
            case 'linear':
                return this.recognizeLinearMovement(body, keyJoints, pattern);
            case 'smooth':
                return this.recognizeSmoothMovement(body, keyJoints, pattern);
            case 'sharp':
                return this.recognizeSharpMovement(body, keyJoints, pattern);
            case 'vertical':
                return this.recognizeVerticalMovement(body, keyJoints, pattern);
            case 'convergent':
                return this.recognizeConvergentMovement(body, keyJoints, pattern);
            case 'circular':
                return this.recognizeCircularMovement(body, keyJoints, pattern);
            default:
                return 0;
        }
    }

    recognizeOscillation(body, keyJoints, pattern) {
        const recentFrames = this.frameBuffer.slice(-30); // Last 0.5 seconds
        if (recentFrames.length < 10) return 0;

        let totalConfidence = 0;
        let validJoints = 0;

        for (const jointId of keyJoints) {
            const positions = recentFrames.map(frame => {
                const bodyInFrame = frame.bodies.find(b => b.id === body.id);
                return bodyInFrame?.joints[jointId]?.position;
            }).filter(pos => pos);

            if (positions.length < 10) continue;

            const confidence = this.analyzeOscillation(positions, pattern);
            if (confidence > 0) {
                totalConfidence += confidence;
                validJoints++;
            }
        }

        return validJoints > 0 ? totalConfidence / validJoints : 0;
    }

    analyzeOscillation(positions, pattern) {
        // Simple oscillation detection using position variance
        const xPositions = positions.map(p => p.x);
        const yPositions = positions.map(p => p.y);

        const xVariance = this.calculateVariance(xPositions);
        const yVariance = this.calculateVariance(yPositions);

        const dominantAxis = xVariance > yVariance ? 'horizontal' : 'vertical';
        const amplitude = Math.sqrt(Math.max(xVariance, yVariance));

        // Check if amplitude is in expected range
        if (amplitude < pattern.amplitude.min || amplitude > pattern.amplitude.max) {
            return 0;
        }

        // Check if direction matches
        if (pattern.direction && pattern.direction !== dominantAxis) {
            return Math.max(0, 0.5 - Math.abs(xVariance - yVariance) * 0.1);
        }

        return Math.min(1, amplitude / pattern.amplitude.max);
    }

    recognizeLinearMovement(body, keyJoints, pattern) {
        const recentFrames = this.frameBuffer.slice(-20); // Last ~0.33 seconds
        if (recentFrames.length < 5) return 0;

        let bestConfidence = 0;

        for (const jointId of keyJoints) {
            const positions = recentFrames.map(frame => {
                const bodyInFrame = frame.bodies.find(b => b.id === body.id);
                return bodyInFrame?.joints[jointId]?.position;
            }).filter(pos => pos);

            if (positions.length < 5) continue;

            const confidence = this.analyzeLinearMovement(positions, pattern);
            bestConfidence = Math.max(bestConfidence, confidence);
        }

        return bestConfidence;
    }

    analyzeLinearMovement(positions, pattern) {
        if (positions.length < 3) return 0;

        // Calculate displacement
        const start = positions[0];
        const end = positions[positions.length - 1];
        const displacement = Math.sqrt(
            Math.pow(end.x - start.x, 2) +
            Math.pow(end.y - start.y, 2) +
            Math.pow(end.z - start.z, 2)
        );

        // Check displacement range
        if (displacement < pattern.displacement.min || displacement > pattern.displacement.max) {
            return 0;
        }

        // Check direction if specified
        if (pattern.direction) {
            const directionVector = {
                x: end.x - start.x,
                y: end.y - start.y,
                z: end.z - start.z
            };

            let directionMatch = 0;
            switch (pattern.direction) {
                case 'up':
                    directionMatch = Math.max(0, directionVector.y) / displacement;
                    break;
                case 'down':
                    directionMatch = Math.max(0, -directionVector.y) / displacement;
                    break;
                case 'out':
                    const outward = Math.sqrt(directionVector.x ** 2 + directionVector.z ** 2);
                    directionMatch = outward / displacement;
                    break;
            }

            return directionMatch;
        }

        return Math.min(1, displacement / pattern.displacement.max);
    }

    recognizeSmoothMovement(body, keyJoints, pattern) {
        const recentFrames = this.frameBuffer.slice(-15);
        if (recentFrames.length < 5) return 0;

        let totalSmoothness = 0;
        let validJoints = 0;

        for (const jointId of keyJoints) {
            const positions = recentFrames.map(frame => {
                const bodyInFrame = frame.bodies.find(b => b.id === body.id);
                return bodyInFrame?.joints[jointId]?.position;
            }).filter(pos => pos);

            if (positions.length < 5) continue;

            const smoothness = this.calculateSmoothness(positions);
            if (smoothness > pattern.continuity.min) {
                totalSmoothness += smoothness;
                validJoints++;
            }
        }

        return validJoints > 0 ? totalSmoothness / validJoints : 0;
    }

    recognizeSharpMovement(body, keyJoints, pattern) {
        const recentFrames = this.frameBuffer.slice(-10);
        if (recentFrames.length < 5) return 0;

        let maxJerk = 0;

        for (const jointId of keyJoints) {
            const positions = recentFrames.map(frame => {
                const bodyInFrame = frame.bodies.find(b => b.id === body.id);
                return bodyInFrame?.joints[jointId]?.position;
            }).filter(pos => pos);

            if (positions.length < 5) continue;

            const jerk = this.calculateJerk(positions);
            maxJerk = Math.max(maxJerk, jerk);
        }

        return maxJerk > pattern.jerkThreshold ? Math.min(1, maxJerk / 10) : 0;
    }

    recognizeVerticalMovement(body, keyJoints, pattern) {
        const recentFrames = this.frameBuffer.slice(-20);
        if (recentFrames.length < 5) return 0;

        let bestConfidence = 0;

        for (const jointId of keyJoints) {
            const positions = recentFrames.map(frame => {
                const bodyInFrame = frame.bodies.find(b => b.id === body.id);
                return bodyInFrame?.joints[jointId]?.position;
            }).filter(pos => pos);

            if (positions.length < 5) continue;

            const yPositions = positions.map(p => p.y);
            const verticalDisplacement = Math.max(...yPositions) - Math.min(...yPositions);

            if (verticalDisplacement < pattern.displacement.min) continue;

            const direction = yPositions[yPositions.length - 1] > yPositions[0] ? 'up' : 'down';
            const confidence = pattern.direction === direction ?
                Math.min(1, verticalDisplacement / pattern.displacement.max) : 0;

            bestConfidence = Math.max(bestConfidence, confidence);
        }

        return bestConfidence;
    }

    recognizeConvergentMovement(body, keyJoints, pattern) {
        if (keyJoints.length < 2) return 0;

        const recentFrames = this.frameBuffer.slice(-15);
        if (recentFrames.length < 5) return 0;

        // Calculate if joints are moving toward each other
        const firstJoint = keyJoints[0];
        const secondJoint = keyJoints[1];

        const distances = recentFrames.map(frame => {
            const bodyInFrame = frame.bodies.find(b => b.id === body.id);
            const pos1 = bodyInFrame?.joints[firstJoint]?.position;
            const pos2 = bodyInFrame?.joints[secondJoint]?.position;

            if (!pos1 || !pos2) return null;

            return Math.sqrt(
                Math.pow(pos2.x - pos1.x, 2) +
                Math.pow(pos2.y - pos1.y, 2) +
                Math.pow(pos2.z - pos1.z, 2)
            );
        }).filter(d => d !== null);

        if (distances.length < 5) return 0;

        // Check if distance is decreasing (convergent)
        const startDistance = distances[0];
        const endDistance = distances[distances.length - 1];
        const convergence = (startDistance - endDistance) / startDistance;

        return Math.max(0, Math.min(1, convergence * 2));
    }

    recognizeCircularMovement(body, keyJoints, pattern) {
        const recentFrames = this.frameBuffer.slice(-20);
        if (recentFrames.length < 10) return 0;

        let bestConfidence = 0;

        for (const jointId of keyJoints) {
            const positions = recentFrames.map(frame => {
                const bodyInFrame = frame.bodies.find(b => b.id === body.id);
                return bodyInFrame?.joints[jointId]?.position;
            }).filter(pos => pos);

            if (positions.length < 10) continue;

            const confidence = this.analyzeCircularMovement(positions, pattern);
            bestConfidence = Math.max(bestConfidence, confidence);
        }

        return bestConfidence;
    }

    analyzeCircularMovement(positions, pattern) {
        // Simple circular movement detection
        const center = this.calculateCenter(positions);
        const radii = positions.map(pos =>
            Math.sqrt(Math.pow(pos.x - center.x, 2) + Math.pow(pos.z - center.z, 2))
        );

        const avgRadius = radii.reduce((sum, r) => sum + r, 0) / radii.length;
        const radiusVariance = this.calculateVariance(radii);

        // Check if radius is consistent (circular motion)
        const radiusConsistency = 1 - Math.min(1, radiusVariance / (avgRadius * 0.1));

        // Check if radius is in expected range
        const radiusMatch = (avgRadius >= pattern.radius.min && avgRadius <= pattern.radius.max) ? 1 : 0;

        return radiusConsistency * radiusMatch;
    }

    // Utility methods
    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    }

    calculateSmoothness(positions) {
        if (positions.length < 3) return 0;

        const velocities = [];
        for (let i = 1; i < positions.length; i++) {
            const velocity = Math.sqrt(
                Math.pow(positions[i].x - positions[i-1].x, 2) +
                Math.pow(positions[i].y - positions[i-1].y, 2) +
                Math.pow(positions[i].z - positions[i-1].z, 2)
            );
            velocities.push(velocity);
        }

        const velocityVariance = this.calculateVariance(velocities);
        return Math.max(0, 1 - velocityVariance * 10);
    }

    calculateJerk(positions) {
        if (positions.length < 4) return 0;

        const accelerations = [];
        for (let i = 2; i < positions.length; i++) {
            const acc = Math.sqrt(
                Math.pow((positions[i].x - positions[i-1].x) - (positions[i-1].x - positions[i-2].x), 2) +
                Math.pow((positions[i].y - positions[i-1].y) - (positions[i-1].y - positions[i-2].y), 2) +
                Math.pow((positions[i].z - positions[i-1].z) - (positions[i-1].z - positions[i-2].z), 2)
            );
            accelerations.push(acc);
        }

        return Math.max(...accelerations);
    }

    calculateCenter(positions) {
        const sum = positions.reduce((acc, pos) => ({
            x: acc.x + pos.x,
            y: acc.y + pos.y,
            z: acc.z + pos.z
        }), { x: 0, y: 0, z: 0 });

        return {
            x: sum.x / positions.length,
            y: sum.y / positions.length,
            z: sum.z / positions.length
        };
    }

    recordGestureDetection(gestureName, gestureData, confidence, bodyId) {
        const detection = {
            name: gestureName,
            type: gestureData.pattern.type,
            confidence: confidence,
            bodyId: bodyId,
            timestamp: Date.now(),
            musicalResponse: gestureData.musicalResponse,
            description: gestureData.description
        };

        this.detectedGestures.push(detection);

        // Update gesture statistics
        const gesture = this.gestureLibrary.get(gestureName);
        gesture.timesDetected++;
        gesture.lastDetected = Date.now();
        gesture.avgConfidence = (gesture.avgConfidence * (gesture.timesDetected - 1) + confidence) / gesture.timesDetected;
    }

    updateGestureSequences() {
        // Build sequences of detected gestures
        if (this.detectedGestures.length > 0) {
            const currentSequence = {
                timestamp: Date.now(),
                gestures: [...this.detectedGestures],
                duration: 0,
                complexity: this.detectedGestures.length
            };

            this.gestureSequences.push(currentSequence);

            // Maintain sequence buffer
            if (this.gestureSequences.length > 50) {
                this.gestureSequences.shift();
            }
        }
    }

    createResult() {
        return {
            detectedGestures: [...this.detectedGestures],
            sequences: [...this.gestureSequences],
            confidence: this.calculateOverallConfidence(),
            libraryStats: this.getLibraryStats()
        };
    }

    createEmptyResult() {
        return {
            detectedGestures: [],
            sequences: [],
            confidence: 0,
            libraryStats: this.getLibraryStats()
        };
    }

    getLastResult() {
        return {
            detectedGestures: [...this.detectedGestures],
            sequences: [...this.gestureSequences],
            confidence: this.calculateOverallConfidence(),
            libraryStats: this.getLibraryStats()
        };
    }

    calculateOverallConfidence() {
        if (this.detectedGestures.length === 0) return 0;
        const totalConfidence = this.detectedGestures.reduce((sum, g) => sum + g.confidence, 0);
        return totalConfidence / this.detectedGestures.length;
    }

    getLibraryStats() {
        const stats = {};
        for (const [name, gesture] of this.gestureLibrary) {
            stats[name] = {
                timesDetected: gesture.timesDetected,
                avgConfidence: gesture.avgConfidence,
                lastDetected: gesture.lastDetected
            };
        }
        return stats;
    }

    // Public API
    getLibrarySize() {
        return this.gestureLibrary.size;
    }

    getDetectedGestureTypes() {
        return [...new Set(this.detectedGestures.map(g => g.name))];
    }

    reset() {
        this.frameBuffer = [];
        this.detectedGestures = [];
        this.gestureSequences = [];
        this.activeGestures.clear();
    }
}

// Export for use in AI system
window.GestureRecognizer = GestureRecognizer;