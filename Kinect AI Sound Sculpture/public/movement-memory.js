class MovementMemory {
    constructor() {
        // Movement signature storage
        this.movementSignatures = new Map();
        this.currentSignature = null;
        this.signatureBuffer = [];

        // Pattern recognition and memory
        this.recognizedPatterns = [];
        this.patternLibrary = new Map();
        this.sequenceMemory = [];

        // Temporal memory for movement sequences
        this.shortTermMemory = []; // Last 30 seconds
        this.mediumTermMemory = []; // Session patterns
        this.longTermMemory = []; // Cross-session patterns (simulated)

        // Memory parameters
        this.signatureLength = 20; // Number of frames for signature
        this.maxPatterns = 100;
        this.similarityThreshold = 0.75;
        this.noveltyThreshold = 0.3;

        // Performance tracking
        this.memorySize = 0;
        this.patternsRecognized = 0;
        this.signaturesGenerated = 0;

        console.log('🧠 Movement Memory system initialized');
    }

    // Main processing function called from AI Movement Interpreter
    processMovement(rawData, gestureData) {
        if (!rawData || !gestureData) {
            return this.createEmptyMemoryData();
        }

        try {
            // Update movement signature
            this.updateMovementSignature(rawData, gestureData);

            // Process movement sequences
            this.processMovementSequence(rawData, gestureData);

            // Recognize patterns
            const recognizedPatterns = this.recognizePatterns();

            // Update memory stores
            this.updateMemoryStores(rawData, gestureData, recognizedPatterns);

            // Generate novelty scores
            const noveltyScore = this.calculateNoveltyScore(rawData, gestureData);

            return {
                signature: this.currentSignature,
                patterns: recognizedPatterns,
                noveltyScore: noveltyScore,
                memoryStats: this.getMemoryStats(),
                confidence: this.calculateMemoryConfidence()
            };

        } catch (error) {
            console.warn('Movement Memory error (non-blocking):', error);
            return this.createEmptyMemoryData();
        }
    }

    updateMovementSignature(rawData, gestureData) {
        // Create signature frame from current movement
        const signatureFrame = this.createSignatureFrame(rawData, gestureData);

        // Add to signature buffer
        this.signatureBuffer.push(signatureFrame);

        // Maintain signature buffer size
        if (this.signatureBuffer.length > this.signatureLength) {
            this.signatureBuffer.shift();
        }

        // Generate signature when buffer is full
        if (this.signatureBuffer.length === this.signatureLength) {
            this.currentSignature = this.generateMovementSignature();
            this.signaturesGenerated++;

            // Store signature for future comparison
            this.storeMovementSignature(this.currentSignature);
        }
    }

    createSignatureFrame(rawData, gestureData) {
        const frame = {
            timestamp: Date.now(),
            bodyCount: rawData.bodies?.length || 0,
            movementEnergy: this.calculateFrameEnergy(rawData),
            gestureTypes: this.extractGestureTypes(gestureData),
            spatialDistribution: this.calculateSpatialDistribution(rawData),
            velocityPatterns: this.extractVelocityPatterns(rawData),
            bodyPosture: this.extractBodyPosture(rawData)
        };

        return frame;
    }

    calculateFrameEnergy(rawData) {
        if (!rawData.bodies || rawData.bodies.length === 0) return 0;

        let totalEnergy = 0;
        let jointCount = 0;

        rawData.bodies.forEach(body => {
            if (body.joints) {
                Object.values(body.joints).forEach(joint => {
                    if (joint.velocity) {
                        totalEnergy += Math.sqrt(
                            joint.velocity.x ** 2 +
                            joint.velocity.y ** 2 +
                            joint.velocity.z ** 2
                        );
                        jointCount++;
                    }
                });
            }
        });

        return jointCount > 0 ? totalEnergy / jointCount : 0;
    }

    extractGestureTypes(gestureData) {
        if (!gestureData.detectedGestures) return [];
        return gestureData.detectedGestures.map(g => g.type);
    }

    calculateSpatialDistribution(rawData) {
        if (!rawData.bodies || rawData.bodies.length === 0) return { width: 0, height: 0, depth: 0 };

        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        rawData.bodies.forEach(body => {
            if (body.joints) {
                Object.values(body.joints).forEach(joint => {
                    if (joint.position) {
                        minX = Math.min(minX, joint.position.x);
                        maxX = Math.max(maxX, joint.position.x);
                        minY = Math.min(minY, joint.position.y);
                        maxY = Math.max(maxY, joint.position.y);
                        minZ = Math.min(minZ, joint.position.z);
                        maxZ = Math.max(maxZ, joint.position.z);
                    }
                });
            }
        });

        return {
            width: maxX - minX,
            height: maxY - minY,
            depth: maxZ - minZ
        };
    }

    extractVelocityPatterns(rawData) {
        if (!rawData.bodies || rawData.bodies.length === 0) return { dominant: 'none', intensity: 0 };

        const velocities = { x: 0, y: 0, z: 0 };
        let jointCount = 0;

        rawData.bodies.forEach(body => {
            if (body.joints) {
                Object.values(body.joints).forEach(joint => {
                    if (joint.velocity) {
                        velocities.x += Math.abs(joint.velocity.x);
                        velocities.y += Math.abs(joint.velocity.y);
                        velocities.z += Math.abs(joint.velocity.z);
                        jointCount++;
                    }
                });
            }
        });

        if (jointCount === 0) return { dominant: 'none', intensity: 0 };

        // Normalize
        velocities.x /= jointCount;
        velocities.y /= jointCount;
        velocities.z /= jointCount;

        // Find dominant direction
        const max = Math.max(velocities.x, velocities.y, velocities.z);
        let dominant = 'none';
        if (max > 0.1) {
            if (velocities.y === max) dominant = 'vertical';
            else if (velocities.x === max) dominant = 'horizontal';
            else if (velocities.z === max) dominant = 'depth';
        }

        return { dominant, intensity: max };
    }

    extractBodyPosture(rawData) {
        if (!rawData.bodies || rawData.bodies.length === 0) return 'unknown';

        const body = rawData.bodies[0]; // Focus on first body
        if (!body.joints) return 'unknown';

        // Simple posture classification based on key joint positions
        const head = body.joints[26];
        const pelvis = body.joints[0];
        const leftHand = body.joints[8];
        const rightHand = body.joints[15];

        if (!head || !pelvis || !leftHand || !rightHand) return 'unknown';

        const torsoHeight = Math.abs(head.position.y - pelvis.position.y);
        const avgHandHeight = (leftHand.position.y + rightHand.position.y) / 2;
        const relativeHandHeight = (avgHandHeight - pelvis.position.y) / torsoHeight;

        // Classify posture
        if (relativeHandHeight > 0.8) return 'arms_raised';
        else if (relativeHandHeight > 0.4) return 'arms_extended';
        else if (relativeHandHeight > 0.1) return 'neutral';
        else return 'arms_lowered';
    }

    generateMovementSignature() {
        if (this.signatureBuffer.length === 0) return null;

        // Aggregate signature buffer into a unique movement signature
        const signature = {
            id: this.generateSignatureId(),
            timestamp: Date.now(),
            duration: this.signatureLength * 33, // Assuming ~30fps
            characteristics: {
                avgEnergy: this.signatureBuffer.reduce((sum, frame) => sum + frame.movementEnergy, 0) / this.signatureBuffer.length,
                gestureVariety: new Set(this.signatureBuffer.flatMap(frame => frame.gestureTypes)).size,
                spatialRange: this.calculateAvgSpatialRange(),
                dominantVelocity: this.calculateDominantVelocityPattern(),
                postureChanges: this.calculatePostureChanges(),
                rhythmicity: this.calculateMovementRhythm()
            },
            fingerprint: this.createMovementFingerprint()
        };

        return signature;
    }

    calculateAvgSpatialRange() {
        const avgDistribution = {
            width: this.signatureBuffer.reduce((sum, frame) => sum + frame.spatialDistribution.width, 0) / this.signatureBuffer.length,
            height: this.signatureBuffer.reduce((sum, frame) => sum + frame.spatialDistribution.height, 0) / this.signatureBuffer.length,
            depth: this.signatureBuffer.reduce((sum, frame) => sum + frame.spatialDistribution.depth, 0) / this.signatureBuffer.length
        };

        return Math.sqrt(avgDistribution.width ** 2 + avgDistribution.height ** 2 + avgDistribution.depth ** 2);
    }

    calculateDominantVelocityPattern() {
        const patterns = { vertical: 0, horizontal: 0, depth: 0, none: 0 };

        this.signatureBuffer.forEach(frame => {
            patterns[frame.velocityPatterns.dominant]++;
        });

        return Object.keys(patterns).reduce((a, b) => patterns[a] > patterns[b] ? a : b);
    }

    calculatePostureChanges() {
        const postures = this.signatureBuffer.map(frame => frame.bodyPosture);
        const uniquePostures = new Set(postures).size;
        return uniquePostures / this.signatureBuffer.length; // Normalized change rate
    }

    calculateMovementRhythm() {
        // Simple rhythm calculation based on energy peaks
        const energies = this.signatureBuffer.map(frame => frame.movementEnergy);
        const avgEnergy = energies.reduce((sum, val) => sum + val, 0) / energies.length;

        const peaks = energies.filter(energy => energy > avgEnergy * 1.5).length;
        return peaks / this.signatureBuffer.length; // Normalized rhythm score
    }

    createMovementFingerprint() {
        // Create a unique fingerprint for pattern matching
        const characteristics = this.signatureBuffer.map(frame => [
            Math.round(frame.movementEnergy * 100),
            frame.gestureTypes.length,
            Math.round(frame.spatialDistribution.width * 10),
            frame.velocityPatterns.dominant === 'vertical' ? 1 : 0,
            frame.velocityPatterns.dominant === 'horizontal' ? 1 : 0
        ]);

        // Hash the characteristics into a shorter fingerprint
        return this.hashCharacteristics(characteristics);
    }

    hashCharacteristics(characteristics) {
        const str = JSON.stringify(characteristics);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    storeMovementSignature(signature) {
        if (!signature) return;

        this.movementSignatures.set(signature.id, signature);

        // Maintain size limit
        if (this.movementSignatures.size > this.maxPatterns) {
            const oldestId = this.movementSignatures.keys().next().value;
            this.movementSignatures.delete(oldestId);
        }
    }

    processMovementSequence(rawData, gestureData) {
        // Add current movement to sequence memory
        const sequenceFrame = {
            timestamp: Date.now(),
            gestures: gestureData.detectedGestures || [],
            energy: this.calculateFrameEnergy(rawData),
            bodyCount: rawData.bodies?.length || 0
        };

        this.sequenceMemory.push(sequenceFrame);

        // Maintain sequence memory size (30 seconds at 30fps = 900 frames)
        const maxSequenceFrames = 900;
        if (this.sequenceMemory.length > maxSequenceFrames) {
            this.sequenceMemory.shift();
        }

        // Update short-term memory (last 30 seconds)
        this.updateShortTermMemory();
    }

    updateShortTermMemory() {
        const thirtySecondsAgo = Date.now() - 30000;
        this.shortTermMemory = this.sequenceMemory.filter(frame => frame.timestamp > thirtySecondsAgo);
    }

    recognizePatterns() {
        const currentPatterns = [];

        // Recognize gesture patterns
        const gesturePatterns = this.recognizeGesturePatterns();
        currentPatterns.push(...gesturePatterns);

        // Recognize rhythm patterns
        const rhythmPatterns = this.recognizeRhythmPatterns();
        currentPatterns.push(...rhythmPatterns);

        // Recognize spatial patterns
        const spatialPatterns = this.recognizeSpatialPatterns();
        currentPatterns.push(...spatialPatterns);

        // Store recognized patterns
        this.storeRecognizedPatterns(currentPatterns);

        this.patternsRecognized += currentPatterns.length;

        return currentPatterns;
    }

    recognizeGesturePatterns() {
        if (this.shortTermMemory.length < 10) return [];

        const patterns = [];
        const recentGestures = this.shortTermMemory.slice(-30); // Last 30 frames

        // Look for repeated gesture sequences
        const gestureSequences = recentGestures
            .filter(frame => frame.gestures.length > 0)
            .map(frame => frame.gestures.map(g => g.type).join(','));

        const sequenceCounts = {};
        gestureSequences.forEach(seq => {
            sequenceCounts[seq] = (sequenceCounts[seq] || 0) + 1;
        });

        // Find repeated sequences
        Object.entries(sequenceCounts).forEach(([sequence, count]) => {
            if (count >= 3 && sequence.length > 0) { // Repeated at least 3 times
                patterns.push({
                    type: 'gesture_repetition',
                    sequence: sequence,
                    frequency: count,
                    confidence: Math.min(1, count / 5),
                    novelty: this.calculatePatternNovelty('gesture_repetition', sequence)
                });
            }
        });

        return patterns;
    }

    recognizeRhythmPatterns() {
        if (this.shortTermMemory.length < 20) return [];

        const patterns = [];
        const energies = this.shortTermMemory.slice(-60).map(frame => frame.energy); // Last 2 seconds

        // Find rhythmic patterns in energy
        const avgEnergy = energies.reduce((sum, val) => sum + val, 0) / energies.length;
        const peaks = [];

        energies.forEach((energy, index) => {
            if (energy > avgEnergy * 1.3) {
                peaks.push(index);
            }
        });

        if (peaks.length >= 3) {
            // Calculate intervals between peaks
            const intervals = [];
            for (let i = 1; i < peaks.length; i++) {
                intervals.push(peaks[i] - peaks[i - 1]);
            }

            // Check for consistent intervals (rhythm)
            const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
            const intervalVariance = intervals.reduce((sum, val) => sum + (val - avgInterval) ** 2, 0) / intervals.length;

            if (intervalVariance < avgInterval * 0.3) { // Low variance = consistent rhythm
                patterns.push({
                    type: 'rhythmic_pattern',
                    tempo: 30 / avgInterval, // Convert to beats per second
                    consistency: 1 - (intervalVariance / avgInterval),
                    confidence: Math.min(1, peaks.length / 10),
                    novelty: this.calculatePatternNovelty('rhythmic_pattern', avgInterval.toString())
                });
            }
        }

        return patterns;
    }

    recognizeSpatialPatterns() {
        // Simplified spatial pattern recognition
        // In a full implementation, this would analyze movement trajectories
        return [];
    }

    calculatePatternNovelty(patternType, patternData) {
        // Check if this pattern has been seen before
        const existingPattern = Array.from(this.patternLibrary.values())
            .find(p => p.type === patternType && p.data === patternData);

        if (!existingPattern) {
            return 1.0; // Completely novel
        }

        // Pattern has been seen before - novelty decreases with frequency
        return Math.max(0, 1 - (existingPattern.frequency / 10));
    }

    storeRecognizedPatterns(patterns) {
        patterns.forEach(pattern => {
            const patternKey = `${pattern.type}_${pattern.sequence || pattern.tempo || 'default'}`;

            if (this.patternLibrary.has(patternKey)) {
                const existing = this.patternLibrary.get(patternKey);
                existing.frequency++;
                existing.lastSeen = Date.now();
                existing.confidence = (existing.confidence + pattern.confidence) / 2;
            } else {
                this.patternLibrary.set(patternKey, {
                    type: pattern.type,
                    data: pattern.sequence || pattern.tempo || 'default',
                    frequency: 1,
                    confidence: pattern.confidence,
                    novelty: pattern.novelty,
                    firstSeen: Date.now(),
                    lastSeen: Date.now()
                });
            }
        });

        // Update memory size
        this.memorySize = this.movementSignatures.size + this.patternLibrary.size;
    }

    updateMemoryStores(rawData, gestureData, recognizedPatterns) {
        // Update medium-term memory (session patterns)
        const sessionPattern = {
            timestamp: Date.now(),
            signature: this.currentSignature?.id || null,
            patterns: recognizedPatterns.map(p => p.type),
            energy: this.calculateFrameEnergy(rawData),
            gestureCount: gestureData.detectedGestures?.length || 0
        };

        this.mediumTermMemory.push(sessionPattern);

        // Keep medium-term memory manageable
        if (this.mediumTermMemory.length > 1000) {
            this.mediumTermMemory.shift();
        }

        // Long-term memory would be persisted across sessions
        // For now, it's just a simulation
        if (Math.random() < 0.1) { // 10% chance to add to long-term memory
            this.longTermMemory.push({
                signatureFingerprint: this.currentSignature?.fingerprint || null,
                patternTypes: recognizedPatterns.map(p => p.type),
                sessionDate: new Date().toDateString()
            });

            // Keep long-term memory limited
            if (this.longTermMemory.length > 50) {
                this.longTermMemory.shift();
            }
        }
    }

    calculateNoveltyScore(rawData, gestureData) {
        if (!this.currentSignature) return 0.5;

        // Compare current signature with stored signatures
        let maxSimilarity = 0;

        this.movementSignatures.forEach(signature => {
            if (signature.id !== this.currentSignature.id) {
                const similarity = this.calculateSignatureSimilarity(this.currentSignature, signature);
                maxSimilarity = Math.max(maxSimilarity, similarity);
            }
        });

        // Novelty is inverse of similarity
        return 1 - maxSimilarity;
    }

    calculateSignatureSimilarity(sig1, sig2) {
        if (!sig1 || !sig2) return 0;

        const c1 = sig1.characteristics;
        const c2 = sig2.characteristics;

        // Compare characteristics (normalized differences)
        const energySim = 1 - Math.abs(c1.avgEnergy - c2.avgEnergy) / Math.max(c1.avgEnergy, c2.avgEnergy, 1);
        const varietySim = 1 - Math.abs(c1.gestureVariety - c2.gestureVariety) / Math.max(c1.gestureVariety, c2.gestureVariety, 1);
        const spatialSim = 1 - Math.abs(c1.spatialRange - c2.spatialRange) / Math.max(c1.spatialRange, c2.spatialRange, 1);
        const rhythmSim = 1 - Math.abs(c1.rhythmicity - c2.rhythmicity) / Math.max(c1.rhythmicity, c2.rhythmicity, 1);

        // Fingerprint similarity
        const fingerprintSim = sig1.fingerprint === sig2.fingerprint ? 1 : 0;

        // Weighted average
        return (energySim * 0.25 + varietySim * 0.25 + spatialSim * 0.2 + rhythmSim * 0.2 + fingerprintSim * 0.1);
    }

    calculateMemoryConfidence() {
        // Confidence based on amount of data and pattern consistency
        const dataConfidence = Math.min(1, this.signatureBuffer.length / this.signatureLength);
        const patternConfidence = Math.min(1, this.patternLibrary.size / 10);
        const memoryConfidence = Math.min(1, this.movementSignatures.size / 20);

        return (dataConfidence + patternConfidence + memoryConfidence) / 3;
    }

    createEmptyMemoryData() {
        return {
            signature: null,
            patterns: [],
            noveltyScore: 0.5,
            memoryStats: this.getMemoryStats(),
            confidence: 0
        };
    }

    // Utility functions
    generateSignatureId() {
        return 'sig_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    // Public API
    getMovementSignature() {
        return this.currentSignature;
    }

    getRecognizedPatterns() {
        return this.recognizedPatterns.slice(-10); // Last 10 patterns
    }

    getMemoryStats() {
        return {
            signaturesStored: this.movementSignatures.size,
            patternsRecognized: this.patternsRecognized,
            memorySize: this.memorySize,
            shortTermFrames: this.shortTermMemory.length,
            mediumTermPatterns: this.mediumTermMemory.length,
            longTermMemories: this.longTermMemory.length
        };
    }

    getMemorySize() {
        return this.memorySize;
    }

    // Pattern lookup functions
    findSimilarSignatures(signature, threshold = null) {
        const useThreshold = threshold || this.similarityThreshold;
        const similar = [];

        this.movementSignatures.forEach(storedSig => {
            if (storedSig.id !== signature.id) {
                const similarity = this.calculateSignatureSimilarity(signature, storedSig);
                if (similarity > useThreshold) {
                    similar.push({ signature: storedSig, similarity });
                }
            }
        });

        return similar.sort((a, b) => b.similarity - a.similarity);
    }

    getPatternLibrary() {
        return Array.from(this.patternLibrary.values());
    }

    // Reset and cleanup
    reset() {
        this.movementSignatures.clear();
        this.currentSignature = null;
        this.signatureBuffer = [];
        this.recognizedPatterns = [];
        this.patternLibrary.clear();
        this.sequenceMemory = [];
        this.shortTermMemory = [];
        this.mediumTermMemory = [];
        this.longTermMemory = [];

        this.memorySize = 0;
        this.patternsRecognized = 0;
        this.signaturesGenerated = 0;

        console.log('🧠 Movement Memory system reset');
    }

    // Status and debugging
    getStatus() {
        return {
            signaturesStored: this.movementSignatures.size,
            patternsRecognized: this.patternsRecognized,
            currentSignatureId: this.currentSignature?.id || null,
            signatureBufferFill: `${this.signatureBuffer.length}/${this.signatureLength}`,
            memorySize: this.memorySize,
            patternLibrarySize: this.patternLibrary.size
        };
    }
}

// Export for use in AI Movement Interpreter
window.MovementMemory = MovementMemory;