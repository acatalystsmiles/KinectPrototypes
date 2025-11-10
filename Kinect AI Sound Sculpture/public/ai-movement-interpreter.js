class AIMovementInterpreter {
    constructor() {
        // Core AI components
        this.gestureRecognizer = new GestureRecognizer();
        this.musicalIntelligence = new MusicalIntelligence();
        this.adaptiveLearning = new AdaptiveLearning();
        this.movementMemory = new MovementMemory();

        // System state
        this.isEnabled = true;
        this.processingMode = 'enhanced'; // 'basic', 'enhanced', 'adaptive'
        this.learningEnabled = true;

        // Data flow management
        this.rawMovementData = null;
        this.interpretedMovementData = null;
        this.musicalInterpretation = null;
        this.enhancedMetrics = null;

        // Performance monitoring
        this.processedFrames = 0;
        this.avgProcessingTime = 0;
        this.lastProcessTime = 0;

        // Integration hooks (non-breaking)
        this.onInterpretationUpdate = null;
        this.onGestureDetected = null;
        this.onMusicalPhrase = null;
        this.onLearningUpdate = null;

        console.log('🧠 AI Movement Interpreter initialized');
    }

    // Main processing pipeline - stable interface
    processMovementData(rawData) {
        if (!this.isEnabled || !rawData) {
            return this.createPassthroughData(rawData);
        }

        const startTime = performance.now();

        try {
            // Stage 1: Store raw data and maintain backward compatibility
            this.rawMovementData = rawData;

            // Stage 2: Gesture recognition (enhance, don't replace)
            const gestureData = this.gestureRecognizer.analyzeGestures(rawData);

            // Stage 3: Musical interpretation (additive)
            const musicalData = this.musicalIntelligence.interpretMovement(rawData, gestureData);

            // Stage 4: Adaptive learning (background process)
            if (this.learningEnabled) {
                this.adaptiveLearning.learnFromMovement(rawData, gestureData, musicalData);
            }

            // Stage 5: Movement memory and pattern recognition
            const memoryData = this.movementMemory.processMovement(rawData, gestureData);

            // Stage 6: Create enhanced interpretation (extends original data)
            this.interpretedMovementData = this.createEnhancedMovementData(
                rawData, gestureData, musicalData, memoryData
            );

            // Performance tracking
            this.updatePerformanceMetrics(startTime);

            // Trigger integration hooks (non-blocking)
            this.triggerIntegrationHooks();

            return this.interpretedMovementData;

        } catch (error) {
            console.error('AI Movement Interpreter error:', error);
            // Graceful degradation - return original data
            return this.createPassthroughData(rawData);
        }
    }

    // Creates enhanced data that extends original format (backward compatible)
    createEnhancedMovementData(rawData, gestureData, musicalData, memoryData) {
        // Start with original data structure
        const enhanced = JSON.parse(JSON.stringify(rawData));

        // Add AI interpretations as extensions (non-breaking)
        enhanced.ai = {
            enabled: this.isEnabled,
            processingMode: this.processingMode,

            // Gesture recognition results
            gestures: gestureData.detectedGestures || [],
            gestureSequences: gestureData.sequences || [],
            gestureConfidence: gestureData.confidence || 0,

            // Musical interpretation
            musicalPhrases: musicalData.phrases || [],
            musicalTension: musicalData.tension || 0,
            harmonicSuggestions: musicalData.harmonicSuggestions || [],
            rhythmicPatterns: musicalData.rhythmicPatterns || [],

            // Memory and learning
            movementSignature: memoryData.signature || null,
            recognizedPatterns: memoryData.patterns || [],
            visitorProfile: this.adaptiveLearning.getCurrentProfile(),

            // Enhanced metrics (extends existing metrics)
            enhancedMetrics: {
                intentionality: this.calculateIntentionality(gestureData),
                musicality: this.calculateMusicality(musicalData),
                expressiveness: this.calculateExpressiveness(gestureData, musicalData),
                complexity: this.calculateComplexity(gestureData, memoryData),
                creativity: this.calculateCreativity(memoryData)
            },

            // Processing metadata
            processingTime: this.lastProcessTime,
            confidence: this.calculateOverallConfidence(gestureData, musicalData, memoryData)
        };

        return enhanced;
    }

    // Fallback for graceful degradation
    createPassthroughData(rawData) {
        if (!rawData) return null;

        const passthrough = JSON.parse(JSON.stringify(rawData));
        passthrough.ai = {
            enabled: false,
            processingMode: 'passthrough',
            message: 'AI interpretation disabled or error occurred'
        };

        return passthrough;
    }

    // Enhanced metric calculations
    calculateIntentionality(gestureData) {
        // How deliberate vs accidental the movement appears
        const gestureCount = gestureData.detectedGestures?.length || 0;
        const avgConfidence = gestureData.confidence || 0;
        return Math.min(1, (gestureCount * 0.1 + avgConfidence) / 2);
    }

    calculateMusicality(musicalData) {
        // How musical the movement patterns are
        const phraseCount = musicalData.phrases?.length || 0;
        const rhythmicStrength = musicalData.rhythmicPatterns?.length || 0;
        return Math.min(1, (phraseCount * 0.2 + rhythmicStrength * 0.1) / 2);
    }

    calculateExpressiveness(gestureData, musicalData) {
        // How expressive and varied the movement is
        const gestureVariety = new Set(gestureData.detectedGestures?.map(g => g.type) || []).size;
        const musicalVariety = musicalData.phrases?.length || 0;
        return Math.min(1, (gestureVariety * 0.15 + musicalVariety * 0.1) / 2);
    }

    calculateComplexity(gestureData, memoryData) {
        // How complex the movement patterns are
        const sequenceLength = gestureData.sequences?.reduce((sum, seq) => sum + seq.length, 0) || 0;
        const patternCount = memoryData.patterns?.length || 0;
        return Math.min(1, (sequenceLength * 0.05 + patternCount * 0.1) / 2);
    }

    calculateCreativity(memoryData) {
        // How novel/creative the movement is compared to past patterns
        const novelPatterns = memoryData.patterns?.filter(p => p.novelty > 0.7).length || 0;
        const totalPatterns = memoryData.patterns?.length || 1;
        return Math.min(1, novelPatterns / totalPatterns);
    }

    calculateOverallConfidence(gestureData, musicalData, memoryData) {
        const gestureConf = gestureData.confidence || 0;
        const musicalConf = musicalData.confidence || 0.5;
        const memoryConf = memoryData.confidence || 0.5;
        return (gestureConf + musicalConf + memoryConf) / 3;
    }

    // Integration hooks (stable interface for other systems)
    triggerIntegrationHooks() {
        try {
            if (this.onInterpretationUpdate) {
                this.onInterpretationUpdate(this.interpretedMovementData);
            }

            if (this.onGestureDetected && this.interpretedMovementData.ai.gestures.length > 0) {
                this.onGestureDetected(this.interpretedMovementData.ai.gestures);
            }

            if (this.onMusicalPhrase && this.interpretedMovementData.ai.musicalPhrases.length > 0) {
                this.onMusicalPhrase(this.interpretedMovementData.ai.musicalPhrases);
            }

            if (this.onLearningUpdate && this.learningEnabled) {
                this.onLearningUpdate(this.interpretedMovementData.ai.visitorProfile);
            }
        } catch (error) {
            console.warn('Integration hook error (non-blocking):', error);
        }
    }

    updatePerformanceMetrics(startTime) {
        this.lastProcessTime = performance.now() - startTime;
        this.processedFrames++;
        this.avgProcessingTime = (this.avgProcessingTime * (this.processedFrames - 1) + this.lastProcessTime) / this.processedFrames;
    }

    // Public API for integration (stable interface)
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`🧠 AI Movement Interpreter ${enabled ? 'enabled' : 'disabled'}`);
    }

    setProcessingMode(mode) {
        if (['basic', 'enhanced', 'adaptive'].includes(mode)) {
            this.processingMode = mode;
            console.log(`🧠 AI processing mode set to: ${mode}`);
        }
    }

    setLearningEnabled(enabled) {
        this.learningEnabled = enabled;
        if (!enabled) {
            this.adaptiveLearning.reset();
        }
    }

    // Integration hook setters (stable interface)
    onInterpretationUpdated(callback) {
        this.onInterpretationUpdate = callback;
    }

    onGestureDetected(callback) {
        this.onGestureDetected = callback;
    }

    onMusicalPhraseDetected(callback) {
        this.onMusicalPhrase = callback;
    }

    onLearningUpdated(callback) {
        this.onLearningUpdate = callback;
    }

    // Status and debugging
    getStatus() {
        return {
            enabled: this.isEnabled,
            processingMode: this.processingMode,
            learningEnabled: this.learningEnabled,
            processedFrames: this.processedFrames,
            avgProcessingTime: Math.round(this.avgProcessingTime * 100) / 100,
            gestureLibrarySize: this.gestureRecognizer.getLibrarySize(),
            memorySize: this.movementMemory.getMemorySize(),
            visitorProfile: this.adaptiveLearning.getCurrentProfile()
        };
    }

    getDetectedGestures() {
        return this.interpretedMovementData?.ai?.gestures || [];
    }

    getMusicalInterpretation() {
        return this.interpretedMovementData?.ai?.musicalPhrases || [];
    }

    getEnhancedMetrics() {
        return this.interpretedMovementData?.ai?.enhancedMetrics || {};
    }

    // Cleanup and reset
    reset() {
        this.gestureRecognizer.reset();
        this.musicalIntelligence.reset();
        this.adaptiveLearning.reset();
        this.movementMemory.reset();

        this.processedFrames = 0;
        this.avgProcessingTime = 0;

        console.log('🧠 AI Movement Interpreter reset');
    }

    dispose() {
        this.reset();
        this.isEnabled = false;

        // Clear integration hooks
        this.onInterpretationUpdate = null;
        this.onGestureDetected = null;
        this.onMusicalPhrase = null;
        this.onLearningUpdate = null;

        console.log('🧠 AI Movement Interpreter disposed');
    }
}

// Export for use in main application
window.AIMovementInterpreter = AIMovementInterpreter;