/**
 * Enhanced Features Module
 *
 * Combines:
 * - ML-based pattern recognition
 * - Accessibility features
 * - Session recording and playback
 * - Enhanced multi-person choreography detection
 */

// ==================== ML-BASED PATTERN RECOGNITION ====================

class MLPatternRecognition {
    constructor() {
        this.patterns = new Map();
        this.trainingData = [];
        this.model = null;
        this.modelTrained = false;

        // Simple neural network for pattern recognition
        this.network = {
            inputSize: 20,
            hiddenSize: 15,
            outputSize: 10,
            weights: null
        };

        this.initializeNetwork();
        console.log('🧠 ML Pattern Recognition initialized');
    }

    initializeNetwork() {
        // Initialize with random weights
        this.network.weights = {
            inputToHidden: this.randomMatrix(this.network.inputSize, this.network.hiddenSize),
            hiddenToOutput: this.randomMatrix(this.network.hiddenSize, this.network.outputSize)
        };
    }

    /**
     * Learn from movement pattern
     */
    learnPattern(movementSequence, label) {
        const features = this.extractFeatures(movementSequence);

        this.trainingData.push({
            features: features,
            label: label,
            timestamp: Date.now()
        });

        // Train if we have enough data
        if (this.trainingData.length >= 10) {
            this.train();
        }
    }

    /**
     * Recognize pattern in current movement
     */
    recognizePattern(movementSequence) {
        if (!this.modelTrained) {
            return { recognized: false, confidence: 0, pattern: 'unknown' };
        }

        const features = this.extractFeatures(movementSequence);
        const output = this.forward(features);

        const maxIdx = output.indexOf(Math.max(...output));
        const confidence = output[maxIdx];

        return {
            recognized: confidence > 0.7,
            confidence: confidence,
            pattern: this.getPatternName(maxIdx),
            allScores: output
        };
    }

    /**
     * Extract features from movement sequence
     */
    extractFeatures(sequence) {
        const features = [];

        if (sequence.length === 0) {
            return new Array(this.network.inputSize).fill(0);
        }

        // Feature 1-4: Average velocity components
        let avgVelX = 0, avgVelY = 0, avgVelZ = 0, avgMagnitude = 0;
        for (const frame of sequence) {
            if (frame.metrics) {
                avgVelX += frame.metrics.handVelocities?.left || 0;
                avgVelY += frame.metrics.verticalMovement || 0;
                avgVelZ += frame.metrics.centerOfMassShift || 0;
                avgMagnitude += frame.metrics.overallMotion || 0;
            }
        }
        features.push(avgVelX / sequence.length);
        features.push(avgVelY / sequence.length);
        features.push(avgVelZ / sequence.length);
        features.push(avgMagnitude / sequence.length);

        // Feature 5-8: Movement quality statistics
        const qualities = sequence.filter(f => f.metrics && f.metrics.movementQuality);
        if (qualities.length > 0) {
            const avgQuality = {
                flowing: qualities.reduce((sum, f) => sum + (f.metrics.movementQuality.flowing || 0), 0) / qualities.length,
                smooth: qualities.reduce((sum, f) => sum + (f.metrics.movementQuality.smooth || 0), 0) / qualities.length,
                speed: qualities.reduce((sum, f) => sum + (f.metrics.movementQuality.speed || 0), 0) / qualities.length,
                rhythmic: qualities.reduce((sum, f) => sum + (f.metrics.movementQuality.rhythmic || 0), 0) / qualities.length
            };
            features.push(avgQuality.flowing, avgQuality.smooth, avgQuality.speed, avgQuality.rhythmic);
        } else {
            features.push(0, 0, 0, 0);
        }

        // Feature 9-12: Trajectory characteristics
        const trajectory = this.analyzeTrajectory(sequence);
        features.push(trajectory.linearity, trajectory.curvature, trajectory.spirality, trajectory.complexity);

        // Feature 13-16: Timing features
        const timing = this.analyzeTiming(sequence);
        features.push(timing.duration, timing.tempo, timing.acceleration, timing.deceleration);

        // Feature 17-20: Spatial features
        const spatial = this.analyzeSpatial(sequence);
        features.push(spatial.expansiveness, spatial.verticalRange, spatial.lateralRange, spatial.depthRange);

        // Normalize to 0-1 range
        return features.map(f => Math.max(0, Math.min(1, f)));
    }

    analyzeTrajectory(sequence) {
        // Simplified trajectory analysis
        return {
            linearity: Math.random(), // Placeholder
            curvature: Math.random(),
            spirality: Math.random(),
            complexity: Math.random()
        };
    }

    analyzeTiming(sequence) {
        const duration = sequence.length / 60; // Assuming 60fps
        return {
            duration: Math.min(1, duration / 5),
            tempo: 0.5,
            acceleration: 0.5,
            deceleration: 0.5
        };
    }

    analyzeSpatial(sequence) {
        return {
            expansiveness: 0.5,
            verticalRange: 0.5,
            lateralRange: 0.5,
            depthRange: 0.5
        };
    }

    /**
     * Train the network (simplified)
     */
    train() {
        // Simplified training - in production would use proper backpropagation
        console.log(`Training network with ${this.trainingData.length} samples...`);
        this.modelTrained = true;
    }

    /**
     * Forward pass through network
     */
    forward(input) {
        // Hidden layer
        const hidden = this.matrixMultiply(input, this.network.weights.inputToHidden);
        const hiddenActivated = hidden.map(x => this.sigmoid(x));

        // Output layer
        const output = this.matrixMultiply(hiddenActivated, this.network.weights.hiddenToOutput);
        const outputActivated = this.softmax(output);

        return outputActivated;
    }

    // Helper methods
    randomMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = (Math.random() * 2 - 1) * 0.5;
            }
        }
        return matrix;
    }

    matrixMultiply(vector, matrix) {
        const result = new Array(matrix[0].length).fill(0);
        for (let j = 0; j < matrix[0].length; j++) {
            for (let i = 0; i < vector.length; i++) {
                result[j] += vector[i] * matrix[i][j];
            }
        }
        return result;
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    softmax(values) {
        const maxVal = Math.max(...values);
        const exps = values.map(v => Math.exp(v - maxVal));
        const sum = exps.reduce((a, b) => a + b, 0);
        return exps.map(e => e / sum);
    }

    getPatternName(index) {
        const patterns = ['wave', 'circle', 'spiral', 'jump', 'reach', 'crouch', 'dance', 'flow', 'pulse', 'unknown'];
        return patterns[index] || 'unknown';
    }
}

// ==================== ACCESSIBILITY FEATURES ====================

class AccessibilityManager {
    constructor() {
        this.features = {
            visualAssist: true,
            audioDescriptions: true,
            hapticFeedback: false,
            simplifiedMode: false,
            highContrast: false,
            largeText: false,
            motionSensitivity: 'normal' // low, normal, high
        };

        this.adaptiveSettings = {
            detectedLimitations: [],
            suggestedAdjustments: []
        };

        console.log('♿ Accessibility Manager initialized');
    }

    /**
     * Detect user needs and adapt
     */
    detectAndAdapt(movementData) {
        if (!movementData || !movementData.bodies || movementData.bodies.length === 0) {
            return;
        }

        const body = movementData.bodies[0];

        // Detect limited mobility
        if (body.metrics && body.metrics.overallMotion < 0.5) {
            this.adaptForLimitedMobility();
        }

        // Detect wheelchair users
        if (this.detectWheelchairUse(body)) {
            this.adaptForWheelchair();
        }

        // Detect fine motor difficulties
        if (body.metrics && body.metrics.movementQuality) {
            if (body.metrics.movementQuality.smooth < 0.3) {
                this.adaptForFineMotorChallenges();
            }
        }
    }

    adaptForLimitedMobility() {
        if (this.adaptiveSettings.detectedLimitations.includes('limited_mobility')) {
            return;
        }

        this.adaptiveSettings.detectedLimitations.push('limited_mobility');
        this.adaptiveSettings.suggestedAdjustments.push({
            type: 'sensitivity',
            message: 'Increasing motion sensitivity for better response',
            action: 'increase_sensitivity'
        });

        this.features.motionSensitivity = 'high';
        console.log('Adapted for limited mobility');
    }

    adaptForWheelchair() {
        if (this.adaptiveSettings.detectedLimitations.includes('wheelchair')) {
            return;
        }

        this.adaptiveSettings.detectedLimitations.push('wheelchair');
        this.adaptiveSettings.suggestedAdjustments.push({
            type: 'interaction_zone',
            message: 'Adjusting interaction zones for seated position',
            action: 'adjust_zones_seated'
        });

        console.log('Adapted for wheelchair user');
    }

    adaptForFineMotorChallenges() {
        if (this.adaptiveSettings.detectedLimitations.includes('fine_motor')) {
            return;
        }

        this.adaptiveSettings.detectedLimitations.push('fine_motor');
        this.features.simplifiedMode = true;

        console.log('Adapted for fine motor challenges');
    }

    detectWheelchairUse(body) {
        // Simplified detection - look for consistent lower body position
        if (!body.joints || !body.joints[0]) return false;

        const pelvisHeight = body.joints[0].position.y;
        return pelvisHeight < 0.8; // Below typical standing height
    }

    /**
     * Provide audio descriptions of interactions
     */
    describeInteraction(interaction) {
        if (!this.features.audioDescriptions) return '';

        const descriptions = {
            gesture_detected: 'Gesture recognized',
            environment_changed: 'Sonic environment has transformed',
            pattern_learned: 'Your movement pattern has been learned',
            achievement_unlocked: 'New interaction unlocked'
        };

        return descriptions[interaction] || 'Interaction occurred';
    }

    /**
     * Provide visual assist cues
     */
    getVisualCues(currentState) {
        if (!this.features.visualAssist) return [];

        const cues = [];

        if (currentState.energyLevel < 0.3) {
            cues.push({
                type: 'hint',
                message: 'Try moving more to explore new sounds',
                position: 'center',
                priority: 'low'
            });
        }

        if (currentState.newGestureAvailable) {
            cues.push({
                type: 'tutorial',
                message: 'Try reaching upward to discover higher tones',
                position: 'top',
                priority: 'medium'
            });
        }

        return cues;
    }

    /**
     * Apply high contrast mode to visuals
     */
    applyHighContrast(visualSettings) {
        if (!this.features.highContrast) return visualSettings;

        return {
            ...visualSettings,
            colorPalette: ['#ffffff', '#ffff00', '#00ffff', '#ff00ff'],
            backgroundColor: '#000000',
            contrast: 2.0
        };
    }
}

// ==================== SESSION RECORDING & PLAYBACK ====================

class SessionRecorder {
    constructor() {
        this.isRecording = false;
        this.isPlaying = false;
        this.recordedData = [];
        this.recordings = new Map();
        this.recordingId = 0;
        this.playbackIndex = 0;
        this.playbackSpeed = 1.0;

        this.recordingMetadata = {
            startTime: null,
            endTime: null,
            duration: 0,
            totalFrames: 0,
            highlights: []
        };

        console.log('📹 Session Recorder initialized');
    }

    /**
     * Start recording session
     */
    startRecording() {
        if (this.isRecording) return;

        this.isRecording = true;
        this.recordedData = [];
        this.recordingMetadata.startTime = Date.now();

        console.log('Recording started');
    }

    /**
     * Stop recording
     */
    stopRecording() {
        if (!this.isRecording) return;

        this.isRecording = false;
        this.recordingMetadata.endTime = Date.now();
        this.recordingMetadata.duration = this.recordingMetadata.endTime - this.recordingMetadata.startTime;
        this.recordingMetadata.totalFrames = this.recordedData.length;

        // Save recording
        const id = this.recordingId++;
        this.recordings.set(id, {
            data: this.recordedData,
            metadata: { ...this.recordingMetadata }
        });

        console.log(`Recording stopped. Duration: ${this.recordingMetadata.duration}ms, Frames: ${this.recordingMetadata.totalFrames}`);

        return id;
    }

    /**
     * Record frame
     */
    recordFrame(movementData, gestureData, audioData, visualState) {
        if (!this.isRecording) return;

        const frame = {
            timestamp: Date.now(),
            movement: this.serializeMovement(movementData),
            gestures: gestureData,
            audio: {
                chord: audioData?.chord,
                melody: audioData?.melody,
                dynamics: audioData?.dynamics
            },
            visual: {
                particles: visualState?.particleCount,
                colorPalette: visualState?.colorPalette
            }
        };

        this.recordedData.push(frame);

        // Auto-detect highlights (moments of high activity)
        if (movementData && movementData.metrics && movementData.metrics.energyLevel > 0.8) {
            this.recordingMetadata.highlights.push({
                frame: this.recordedData.length - 1,
                type: 'high_energy',
                timestamp: frame.timestamp
            });
        }
    }

    /**
     * Play back recording
     */
    startPlayback(recordingId, speed = 1.0) {
        const recording = this.recordings.get(recordingId);
        if (!recording) {
            console.error('Recording not found');
            return false;
        }

        this.isPlaying = true;
        this.playbackIndex = 0;
        this.playbackSpeed = speed;
        this.currentPlayback = recording;

        this.playbackLoop();
        console.log('Playback started');

        return true;
    }

    /**
     * Playback loop
     */
    playbackLoop() {
        if (!this.isPlaying || !this.currentPlayback) return;

        const frame = this.currentPlayback.data[this.playbackIndex];

        // Emit frame to be re-rendered
        this.onPlaybackFrame && this.onPlaybackFrame(frame);

        this.playbackIndex++;

        if (this.playbackIndex >= this.currentPlayback.data.length) {
            this.stopPlayback();
            return;
        }

        // Schedule next frame
        const nextFrameDelay = (16 / this.playbackSpeed); // 60fps base
        setTimeout(() => this.playbackLoop(), nextFrameDelay);
    }

    /**
     * Stop playback
     */
    stopPlayback() {
        this.isPlaying = false;
        this.playbackIndex = 0;
        this.currentPlayback = null;
        console.log('Playback stopped');
    }

    /**
     * Export recording to JSON
     */
    exportRecording(recordingId) {
        const recording = this.recordings.get(recordingId);
        if (!recording) return null;

        return JSON.stringify({
            version: '1.0',
            metadata: recording.metadata,
            data: recording.data
        });
    }

    /**
     * Import recording from JSON
     */
    importRecording(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            const id = this.recordingId++;

            this.recordings.set(id, {
                data: imported.data,
                metadata: imported.metadata
            });

            console.log('Recording imported successfully');
            return id;
        } catch (error) {
            console.error('Failed to import recording:', error);
            return null;
        }
    }

    /**
     * Get recording metadata
     */
    getRecordingMetadata(recordingId) {
        const recording = this.recordings.get(recordingId);
        return recording ? recording.metadata : null;
    }

    /**
     * List all recordings
     */
    listRecordings() {
        return Array.from(this.recordings.entries()).map(([id, recording]) => ({
            id: id,
            duration: recording.metadata.duration,
            frames: recording.metadata.totalFrames,
            highlights: recording.metadata.highlights.length,
            startTime: recording.metadata.startTime
        }));
    }

    /**
     * Serialize movement data for recording
     */
    serializeMovement(movementData) {
        if (!movementData) return null;

        return {
            bodies: movementData.bodies ? movementData.bodies.map(body => ({
                id: body.id,
                metrics: body.metrics,
                jointPositions: this.serializeJoints(body.joints)
            })) : [],
            metrics: movementData.metrics
        };
    }

    serializeJoints(joints) {
        if (!joints) return {};

        const serialized = {};
        for (const [key, joint] of Object.entries(joints)) {
            serialized[key] = {
                x: joint.position.x,
                y: joint.position.y,
                z: joint.position.z
            };
        }
        return serialized;
    }
}

// ==================== ENHANCED CHOREOGRAPHY DETECTION ====================

class ChoreographyDetector {
    constructor() {
        this.formations = new Map();
        this.dancePatterns = new Map();
        this.groupDynamics = {
            cohesion: 0,
            synchronization: 0,
            leadership: null,
            interaction: 'independent'
        };

        this.initializeFormations();
        console.log('💃 Choreography Detector initialized');
    }

    initializeFormations() {
        this.formations.set('circle', { minPeople: 3, pattern: 'circular' });
        this.formations.set('line', { minPeople: 2, pattern: 'linear' });
        this.formations.set('cluster', { minPeople: 2, pattern: 'grouped' });
        this.formations.set('scatter', { minPeople: 2, pattern: 'dispersed' });
    }

    /**
     * Detect choreographic patterns in group movement
     */
    detectChoreography(bodies) {
        if (bodies.length < 2) {
            return { hasChoreography: false };
        }

        // Detect formation
        const formation = this.detectFormation(bodies);

        // Detect synchronization
        const sync = this.detectSynchronization(bodies);

        // Detect call-and-response
        const callResponse = this.detectCallAndResponse(bodies);

        // Detect mirroring
        const mirroring = this.detectMirroring(bodies);

        return {
            hasChoreography: sync.isSynchronized || callResponse.detected || mirroring.detected,
            formation: formation,
            synchronization: sync,
            callResponse: callResponse,
            mirroring: mirroring,
            complexity: this.calculateChoreographyComplexity(sync, callResponse, mirroring)
        };
    }

    detectFormation(bodies) {
        const positions = bodies.map(b => b.metrics?.centerOfMass || { x: 0, y: 0, z: 0 });

        // Check for circle formation
        const center = this.calculateCentroid(positions);
        const distances = positions.map(p => this.distance2D(p, center));
        const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
        const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;

        if (variance < 0.5 && bodies.length >= 3) {
            return { type: 'circle', confidence: 0.8 };
        }

        // Check for line formation
        const linearity = this.calculateLinearity(positions);
        if (linearity > 0.7) {
            return { type: 'line', confidence: linearity };
        }

        return { type: 'scatter', confidence: 0.5 };
    }

    detectSynchronization(bodies) {
        if (bodies.length < 2) return { isSynchronized: false, score: 0 };

        // Compare movement velocities
        const velocities = bodies.map(b => b.metrics?.overallMotion || 0);
        const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
        const velocityVariance = velocities.reduce((sum, v) => sum + Math.pow(v - avgVelocity, 2), 0) / velocities.length;

        const syncScore = Math.max(0, 1 - velocityVariance);

        return {
            isSynchronized: syncScore > 0.7,
            score: syncScore,
            type: syncScore > 0.8 ? 'tight' : syncScore > 0.6 ? 'loose' : 'none'
        };
    }

    detectCallAndResponse(bodies) {
        // Simplified: look for alternating high energy between bodies
        if (bodies.length !== 2) return { detected: false };

        const body1Energy = bodies[0].metrics?.overallMotion || 0;
        const body2Energy = bodies[1].metrics?.overallMotion || 0;

        const energyDifference = Math.abs(body1Energy - body2Energy);

        return {
            detected: energyDifference > 1.0,
            leader: body1Energy > body2Energy ? bodies[0].id : bodies[1].id,
            follower: body1Energy > body2Energy ? bodies[1].id : bodies[0].id,
            confidence: Math.min(energyDifference / 2.0, 1.0)
        };
    }

    detectMirroring(bodies) {
        if (bodies.length !== 2) return { detected: false };

        // Check if bodies are moving in opposite directions (mirroring)
        const body1 = bodies[0];
        const body2 = bodies[1];

        if (!body1.metrics || !body2.metrics) return { detected: false };

        // Simplified: compare symmetry scores
        const symmetryDiff = Math.abs((body1.metrics.symmetry || 0) - (body2.metrics.symmetry || 0));

        return {
            detected: symmetryDiff < 0.2 && body1.metrics.symmetry > 0.6,
            confidence: symmetryDiff < 0.2 ? (1 - symmetryDiff) : 0
        };
    }

    calculateChoreographyComplexity(sync, callResponse, mirroring) {
        let complexity = 0;

        if (sync.isSynchronized) complexity += 0.4;
        if (callResponse.detected) complexity += 0.3;
        if (mirroring.detected) complexity += 0.3;

        return Math.min(1.0, complexity);
    }

    calculateCentroid(positions) {
        const sum = positions.reduce((acc, p) => ({
            x: acc.x + p.x,
            y: acc.y + p.y,
            z: acc.z + p.z
        }), { x: 0, y: 0, z: 0 });

        return {
            x: sum.x / positions.length,
            y: sum.y / positions.length,
            z: sum.z / positions.length
        };
    }

    distance2D(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.z - p2.z, 2));
    }

    calculateLinearity(positions) {
        if (positions.length < 3) return 0;

        // Fit line and calculate R²
        // Simplified version
        return Math.random() * 0.5; // Placeholder
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MLPatternRecognition,
        AccessibilityManager,
        SessionRecorder,
        ChoreographyDetector
    };
}
