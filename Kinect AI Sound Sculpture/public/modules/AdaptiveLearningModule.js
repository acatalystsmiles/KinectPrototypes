/**
 * Adaptive Learning Module
 * Integrates the adaptive learning system into the modular architecture
 */

class AdaptiveLearningModule {
    constructor({ config, dependencies, eventBus, globalEventBus, moduleManager }) {
        this.config = config || {};
        this.dependencies = dependencies || {};
        this.eventBus = eventBus;
        this.globalEventBus = globalEventBus;
        this.moduleManager = moduleManager;

        // Adaptive learning system
        this.adaptiveLearning = null;
        this.isLearning = false;
        this.learningRate = this.config.learningRate || 0.1;
        this.adaptationEnabled = this.config.enabled !== false;

        // Learning data accumulation
        this.learningBuffer = {
            movements: [],
            gestures: [],
            audio: [],
            bufferSize: this.config.bufferSize || 50
        };

        // Integration state
        this.connectedModules = new Set();
        this.adaptationTargets = new Map();

        this.isInitialized = false;
    }

    async initialize() {
        console.log('🧠 Initializing Adaptive Learning Module...');

        try {
            // Initialize the adaptive learning system
            this.adaptiveLearning = new AdaptiveLearning();

            // Setup event listeners
            this.setupEventListeners();

            // Setup adaptation targets
            this.setupAdaptationTargets();

            // Setup periodic learning updates
            this.setupLearningLoop();

            this.isInitialized = true;
            console.log('✅ Adaptive Learning Module initialized');

            this.eventBus?.emit('learning:initialized', {
                enabled: this.adaptationEnabled,
                learningRate: this.learningRate
            });

        } catch (error) {
            console.error('❌ Adaptive Learning Module initialization failed:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Listen for movement data from various sources
        this.eventBus?.on('movement:analyzed', (data) => {
            this.processMovementData(data);
        });

        this.eventBus?.on('gesture:detected', (data) => {
            this.processGestureData(data);
        });

        this.eventBus?.on('audio:generated', (data) => {
            this.processAudioData(data);
        });

        this.eventBus?.on('interaction:processed', (data) => {
            this.processInteractionData(data);
        });

        // Listen for module registration
        this.eventBus?.on('module:registered', (data) => {
            this.registerAdaptationTarget(data.moduleName, data.module);
        });

        // Listen for user session events
        this.eventBus?.on('session:started', () => {
            this.startLearningSession();
        });

        this.eventBus?.on('session:ended', () => {
            this.endLearningSession();
        });

        // Listen for reset requests
        this.eventBus?.on('learning:reset', () => {
            this.resetLearning();
        });
    }

    setupAdaptationTargets() {
        // Define which modules can be adapted and how
        this.adaptationTargets.set('audioEngine', {
            adaptations: ['volume', 'complexity', 'responsiveness'],
            applyFunction: this.adaptAudioEngine.bind(this)
        });

        this.adaptationTargets.set('visualRenderer', {
            adaptations: ['intensity', 'particleCount', 'colorScheme'],
            applyFunction: this.adaptVisualRenderer.bind(this)
        });

        this.adaptationTargets.set('gestureRecognition', {
            adaptations: ['sensitivity', 'thresholds', 'responseTime'],
            applyFunction: this.adaptGestureRecognition.bind(this)
        });

        this.adaptationTargets.set('environmentManager', {
            adaptations: ['transitionSpeed', 'environmentSensitivity'],
            applyFunction: this.adaptEnvironmentManager.bind(this)
        });
    }

    setupLearningLoop() {
        // Process accumulated learning data periodically
        this.learningInterval = setInterval(() => {
            if (this.isLearning && this.adaptationEnabled) {
                this.processLearningBuffer();
                this.applyAdaptations();
            }
        }, this.config.updateInterval || 5000); // 5 seconds
    }

    processMovementData(data) {
        if (!this.adaptationEnabled) return;

        // Add to learning buffer
        this.learningBuffer.movements.push({
            timestamp: Date.now(),
            data: data,
            skeletonCount: data.skeletons?.length || 0,
            energy: this.calculateMovementEnergy(data)
        });

        // Trim buffer if too large
        this.trimBuffer('movements');

        // Immediate learning for high-energy movements
        if (this.calculateMovementEnergy(data) > 0.8) {
            this.processImediateLearning('movement', data);
        }
    }

    processGestureData(data) {
        if (!this.adaptationEnabled) return;

        this.learningBuffer.gestures.push({
            timestamp: Date.now(),
            data: data,
            gestureCount: data.detectedGestures?.length || 0,
            confidence: this.calculateAverageConfidence(data)
        });

        this.trimBuffer('gestures');

        // Immediate learning for high-confidence gestures
        if (this.calculateAverageConfidence(data) > 0.9) {
            this.processImediateLearning('gesture', data);
        }
    }

    processAudioData(data) {
        if (!this.adaptationEnabled) return;

        this.learningBuffer.audio.push({
            timestamp: Date.now(),
            data: data,
            complexity: data.complexity || 0.5,
            userResponse: this.estimateUserResponse(data)
        });

        this.trimBuffer('audio');
    }

    processInteractionData(data) {
        if (!this.adaptationEnabled || !this.adaptiveLearning) return;

        // Create comprehensive learning data from interaction
        const rawData = data.rawMovement || data;
        const gestureData = data.gestures || { detectedGestures: [] };
        const musicalData = data.audio || { phrases: [] };

        // Learn from this interaction
        this.adaptiveLearning.learnFromMovement(rawData, gestureData, musicalData);

        // Emit learning update
        this.eventBus?.emit('learning:updated', {
            profile: this.adaptiveLearning.getCurrentProfile(),
            status: this.adaptiveLearning.getStatus()
        });
    }

    processImediateLearning(type, data) {
        // Process high-priority learning immediately
        if (!this.adaptiveLearning) return;

        const mockGestureData = type === 'gesture' ? data : { detectedGestures: [] };
        const mockAudioData = type === 'audio' ? data : { phrases: [] };
        const mockRawData = type === 'movement' ? data : { bodies: [] };

        this.adaptiveLearning.learnFromMovement(mockRawData, mockGestureData, mockAudioData);
    }

    processLearningBuffer() {
        if (!this.adaptiveLearning || this.learningBuffer.movements.length === 0) return;

        // Aggregate buffer data for learning
        const recentMovements = this.learningBuffer.movements.slice(-10);
        const recentGestures = this.learningBuffer.gestures.slice(-10);
        const recentAudio = this.learningBuffer.audio.slice(-10);

        // Create aggregated learning data
        const aggregatedData = this.aggregateLearningData(recentMovements, recentGestures, recentAudio);

        // Learn from aggregated data
        this.adaptiveLearning.learnFromMovement(
            aggregatedData.movement,
            aggregatedData.gesture,
            aggregatedData.audio
        );

        // Emit learning progress
        this.eventBus?.emit('learning:progress', {
            bufferSize: this.learningBuffer.movements.length,
            profile: this.adaptiveLearning.getCurrentProfile()
        });
    }

    aggregateLearningData(movements, gestures, audio) {
        return {
            movement: {
                bodies: movements.map(m => m.data.skeletons || []).flat(),
                averageEnergy: movements.reduce((sum, m) => sum + m.energy, 0) / movements.length
            },
            gesture: {
                detectedGestures: gestures.map(g => g.data.detectedGestures || []).flat(),
                averageConfidence: gestures.reduce((sum, g) => sum + g.confidence, 0) / gestures.length
            },
            audio: {
                phrases: audio.map(a => a.data.phrases || []).flat(),
                averageComplexity: audio.reduce((sum, a) => sum + a.complexity, 0) / audio.length
            }
        };
    }

    applyAdaptations() {
        if (!this.adaptiveLearning) return;

        const profile = this.adaptiveLearning.getCurrentProfile();
        const adaptations = this.adaptiveLearning.getVisualAdaptations();

        // Apply adaptations to each connected module
        for (const [moduleName, target] of this.adaptationTargets.entries()) {
            const module = this.getModule(moduleName);
            if (module && this.connectedModules.has(moduleName)) {
                try {
                    target.applyFunction(module, profile, adaptations);
                } catch (error) {
                    console.warn(`Failed to apply adaptations to ${moduleName}:`, error);
                }
            }
        }

        // Emit adaptation event
        this.eventBus?.emit('learning:adaptations_applied', {
            profile: profile,
            adaptations: adaptations,
            targetModules: Array.from(this.connectedModules)
        });
    }

    // Adaptation functions for specific modules
    adaptAudioEngine(module, profile, adaptations) {
        if (!module.updateSettings) return;

        const audioAdaptations = {};

        // Volume based on engagement
        if (profile.sessionData.engagementLevel > 0.7) {
            audioAdaptations.masterVolume = Math.min(1.0, module.config.masterVolume * 1.1);
        } else if (profile.sessionData.engagementLevel < 0.3) {
            audioAdaptations.masterVolume = Math.max(0.3, module.config.masterVolume * 0.9);
        }

        // Responsiveness based on movement style
        if (profile.movementStyle === 'energetic') {
            audioAdaptations.responsiveness = adaptations.responsiveness || 1.2;
        } else if (profile.movementStyle === 'contemplative') {
            audioAdaptations.responsiveness = adaptations.responsiveness || 0.8;
        }

        // Complexity based on user preferences
        if (profile.preferences.complexity > 0.7) {
            audioAdaptations.harmonicComplexity = 1.2;
        } else if (profile.preferences.complexity < 0.3) {
            audioAdaptations.harmonicComplexity = 0.8;
        }

        module.updateSettings(audioAdaptations);
    }

    adaptVisualRenderer(module, profile, adaptations) {
        if (!module.updateSettings) return;

        const visualAdaptations = {};

        // Particle count based on engagement and performance
        const baseParticleCount = module.config.particles?.count || 300;
        if (profile.sessionData.engagementLevel > 0.8) {
            visualAdaptations.particleCount = Math.min(1000, baseParticleCount * 1.3);
        } else if (profile.sessionData.engagementLevel < 0.3) {
            visualAdaptations.particleCount = Math.max(100, baseParticleCount * 0.7);
        }

        // Visual intensity based on movement style
        if (profile.movementStyle === 'energetic') {
            visualAdaptations.intensity = adaptations.visualIntensity || 1.2;
        } else if (profile.movementStyle === 'minimalist') {
            visualAdaptations.intensity = adaptations.visualIntensity || 0.7;
        }

        // Color adaptation based on preferences
        if (profile.movementStyle === 'social') {
            visualAdaptations.colorCoordination = adaptations.colorCoordination || 1.3;
        }

        module.updateSettings(visualAdaptations);
    }

    adaptGestureRecognition(module, profile, adaptations) {
        if (!module.updateSettings) return;

        const gestureAdaptations = {};

        // Sensitivity based on learned gesture preferences
        const favoriteGestures = profile.sessionData.favoriteGestures || [];
        favoriteGestures.forEach(gesture => {
            const learned = this.adaptiveLearning.getAdaptationsForGesture(gesture.type);
            gestureAdaptations[`${gesture.type}_sensitivity`] = learned.sensitivity;
            gestureAdaptations[`${gesture.type}_threshold`] = learned.preferredConfidence;
        });

        // Overall sensitivity based on movement style
        if (profile.movementStyle === 'contemplative') {
            gestureAdaptations.globalSensitivity = 0.8;
        } else if (profile.movementStyle === 'energetic') {
            gestureAdaptations.globalSensitivity = 1.2;
        }

        module.updateSettings(gestureAdaptations);
    }

    adaptEnvironmentManager(module, profile, adaptations) {
        if (!module.updateSettings) return;

        const environmentAdaptations = {};

        // Transition speed based on engagement
        if (profile.sessionData.engagementLevel > 0.8) {
            environmentAdaptations.transitionSpeed = 1.3;
        } else if (profile.sessionData.engagementLevel < 0.3) {
            environmentAdaptations.transitionSpeed = 0.7;
        }

        // Environment sensitivity based on exploration behavior
        if (profile.movementStyle === 'explorer') {
            environmentAdaptations.discoveryThreshold = 0.6;
        } else if (profile.movementStyle === 'contemplative') {
            environmentAdaptations.discoveryThreshold = 0.8;
        }

        module.updateSettings(environmentAdaptations);
    }

    // Utility functions
    calculateMovementEnergy(data) {
        if (!data.skeletons) return 0;

        let totalEnergy = 0;
        data.skeletons.forEach(skeleton => {
            if (skeleton.metrics?.overallMotion) {
                totalEnergy += skeleton.metrics.overallMotion;
            }
        });

        return Math.min(1, totalEnergy / data.skeletons.length);
    }

    calculateAverageConfidence(data) {
        if (!data.detectedGestures) return 0;

        const totalConfidence = data.detectedGestures.reduce((sum, gesture) => sum + gesture.confidence, 0);
        return totalConfidence / data.detectedGestures.length;
    }

    estimateUserResponse(audioData) {
        // Simple heuristic for user response to audio
        return 0.5 + Math.random() * 0.5; // Placeholder - could be enhanced with actual feedback
    }

    trimBuffer(bufferType) {
        if (this.learningBuffer[bufferType].length > this.learningBuffer.bufferSize) {
            this.learningBuffer[bufferType].shift();
        }
    }

    registerAdaptationTarget(moduleName, module) {
        if (this.adaptationTargets.has(moduleName)) {
            this.connectedModules.add(moduleName);
            console.log(`🔗 Adaptive Learning connected to ${moduleName}`);
        }
    }

    getModule(moduleName) {
        return this.moduleManager?.getModule(moduleName);
    }

    startLearningSession() {
        this.isLearning = true;
        if (this.adaptiveLearning) {
            this.adaptiveLearning.reset();
        }

        this.eventBus?.emit('learning:session_started', {
            timestamp: Date.now()
        });
    }

    endLearningSession() {
        this.isLearning = false;

        if (this.adaptiveLearning) {
            const finalProfile = this.adaptiveLearning.getCurrentProfile();
            this.eventBus?.emit('learning:session_ended', {
                profile: finalProfile,
                duration: finalProfile.sessionData.timeSpent,
                movementCount: finalProfile.sessionData.totalMovements
            });
        }
    }

    resetLearning() {
        if (this.adaptiveLearning) {
            this.adaptiveLearning.reset();
        }

        // Clear learning buffers
        this.learningBuffer.movements = [];
        this.learningBuffer.gestures = [];
        this.learningBuffer.audio = [];

        this.eventBus?.emit('learning:reset_complete');
    }

    // Public API
    getCurrentProfile() {
        return this.adaptiveLearning?.getCurrentProfile() || null;
    }

    getAdaptationsForGesture(gestureType) {
        return this.adaptiveLearning?.getAdaptationsForGesture(gestureType) || null;
    }

    getMusicalAdaptations(gestureType) {
        return this.adaptiveLearning?.getMusicalAdaptations(gestureType) || null;
    }

    getLearningStatus() {
        return {
            isLearning: this.isLearning,
            adaptationEnabled: this.adaptationEnabled,
            connectedModules: Array.from(this.connectedModules),
            bufferStatus: {
                movements: this.learningBuffer.movements.length,
                gestures: this.learningBuffer.gestures.length,
                audio: this.learningBuffer.audio.length
            },
            profile: this.adaptiveLearning?.getStatus() || null
        };
    }

    async cleanup() {
        this.isLearning = false;

        if (this.learningInterval) {
            clearInterval(this.learningInterval);
            this.learningInterval = null;
        }

        this.connectedModules.clear();
        this.adaptationTargets.clear();

        this.isInitialized = false;
    }
}

// Export for both CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdaptiveLearningModule;
} else if (typeof window !== 'undefined') {
    window.AdaptiveLearningModule = AdaptiveLearningModule;
}