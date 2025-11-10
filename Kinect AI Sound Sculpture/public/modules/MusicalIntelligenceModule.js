/**
 * Musical Intelligence Module
 * Integrates the musical intelligence system into the modular architecture
 */

class MusicalIntelligenceModule {
    constructor({ config, dependencies, eventBus, globalEventBus, moduleManager }) {
        this.config = config || {};
        this.dependencies = dependencies || {};
        this.eventBus = eventBus;
        this.globalEventBus = globalEventBus;
        this.moduleManager = moduleManager;

        // Musical intelligence system
        this.musicalIntelligence = null;
        this.isAnalyzing = false;
        this.analysisEnabled = this.config.enabled !== false;

        // Musical state management
        this.currentMusicalState = {
            key: this.config.defaultKey || 'C major',
            tempo: this.config.defaultTempo || 120,
            phrases: [],
            harmonicContext: null,
            rhythmicContext: null
        };

        // Analysis buffer for batching
        this.analysisBuffer = {
            movements: [],
            gestures: [],
            bufferSize: this.config.bufferSize || 20,
            analysisInterval: this.config.analysisInterval || 2000 // 2 seconds
        };

        // Integration with other modules
        this.connectedModules = new Set();
        this.musicalTargets = new Map();

        this.isInitialized = false;
    }

    async initialize() {
        console.log('🎼 Initializing Musical Intelligence Module...');

        try {
            // Initialize the musical intelligence system
            this.musicalIntelligence = new MusicalIntelligence();

            // Set initial musical parameters
            this.musicalIntelligence.setKey(this.currentMusicalState.key);
            this.musicalIntelligence.setTempo(this.currentMusicalState.tempo);

            // Setup event listeners
            this.setupEventListeners();

            // Setup musical targets
            this.setupMusicalTargets();

            // Setup analysis loop
            this.setupAnalysisLoop();

            this.isInitialized = true;
            console.log('✅ Musical Intelligence Module initialized');

            this.eventBus?.emit('musical:initialized', {
                key: this.currentMusicalState.key,
                tempo: this.currentMusicalState.tempo,
                enabled: this.analysisEnabled
            });

        } catch (error) {
            console.error('❌ Musical Intelligence Module initialization failed:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Listen for movement and gesture data
        this.eventBus?.on('movement:analyzed', (data) => {
            this.processMovementForMusic(data);
        });

        this.eventBus?.on('gesture:detected', (data) => {
            this.processGestureForMusic(data);
        });

        this.eventBus?.on('interaction:processed', (data) => {
            this.processInteractionForMusic(data);
        });

        // Listen for adaptive learning updates
        this.eventBus?.on('learning:updated', (data) => {
            this.adaptMusicalParameters(data);
        });

        // Listen for environment changes
        this.eventBus?.on('environment:changed', (data) => {
            this.adaptToEnvironment(data);
        });

        // Listen for musical parameter changes
        this.eventBus?.on('musical:key_change', (data) => {
            this.changeKey(data.key);
        });

        this.eventBus?.on('musical:tempo_change', (data) => {
            this.changeTempo(data.tempo);
        });

        // Listen for module connections
        this.eventBus?.on('module:registered', (data) => {
            this.registerMusicalTarget(data.moduleName, data.module);
        });
    }

    setupMusicalTargets() {
        // Define which modules can receive musical information
        this.musicalTargets.set('audioEngine', {
            capabilities: ['harmony', 'rhythm', 'melody', 'dynamics'],
            applyFunction: this.applyMusicalToAudio.bind(this)
        });

        this.musicalTargets.set('environmentManager', {
            capabilities: ['key', 'tempo', 'mood'],
            applyFunction: this.applyMusicalToEnvironment.bind(this)
        });

        this.musicalTargets.set('visualRenderer', {
            capabilities: ['rhythm', 'dynamics', 'harmony'],
            applyFunction: this.applyMusicalToVisual.bind(this)
        });

        this.musicalTargets.set('spatialAudio', {
            capabilities: ['harmony', 'spatial_movement'],
            applyFunction: this.applyMusicalToSpatial.bind(this)
        });
    }

    setupAnalysisLoop() {
        // Process musical analysis periodically
        this.analysisInterval = setInterval(() => {
            if (this.isAnalyzing && this.analysisEnabled) {
                this.performMusicalAnalysis();
            }
        }, this.analysisBuffer.analysisInterval);

        this.isAnalyzing = true;
    }

    processMovementForMusic(data) {
        if (!this.analysisEnabled) return;

        // Add movement data to analysis buffer
        this.analysisBuffer.movements.push({
            timestamp: Date.now(),
            data: data,
            skeletons: data.skeletons || [],
            metrics: data.metrics || {}
        });

        // Trim buffer if too large
        this.trimBuffer('movements');

        // Immediate musical response for high-energy movements
        if (this.shouldTriggerImmediateAnalysis(data)) {
            this.performImmediateMusicalAnalysis(data);
        }
    }

    processGestureForMusic(data) {
        if (!this.analysisEnabled) return;

        // Add gesture data to analysis buffer
        this.analysisBuffer.gestures.push({
            timestamp: Date.now(),
            data: data,
            detectedGestures: data.detectedGestures || [],
            confidence: this.calculateGestureConfidence(data)
        });

        this.trimBuffer('gestures');

        // Immediate musical response for high-confidence gestures
        if (data.detectedGestures && data.detectedGestures.some(g => g.confidence > 0.9)) {
            this.performImmediateMusicalAnalysis(null, data);
        }
    }

    processInteractionForMusic(data) {
        if (!this.analysisEnabled || !this.musicalIntelligence) return;

        // Process comprehensive interaction data
        const movementData = data.movement || data;
        const gestureData = data.gestures || { detectedGestures: [] };

        // Perform musical interpretation
        const musicalInterpretation = this.musicalIntelligence.interpretMovement(movementData, gestureData);

        // Update current musical state
        this.updateMusicalState(musicalInterpretation);

        // Apply musical interpretation to connected modules
        this.applyMusicalInterpretation(musicalInterpretation);

        // Emit musical interpretation event
        this.eventBus?.emit('musical:interpretation', {
            interpretation: musicalInterpretation,
            state: this.currentMusicalState
        });
    }

    performMusicalAnalysis() {
        if (!this.musicalIntelligence || this.analysisBuffer.movements.length === 0) return;

        // Aggregate buffered data
        const recentMovements = this.analysisBuffer.movements.slice(-10);
        const recentGestures = this.analysisBuffer.gestures.slice(-10);

        // Create aggregated data for analysis
        const aggregatedMovement = this.aggregateMovementData(recentMovements);
        const aggregatedGestures = this.aggregateGestureData(recentGestures);

        // Perform musical interpretation
        const musicalInterpretation = this.musicalIntelligence.interpretMovement(
            aggregatedMovement,
            aggregatedGestures
        );

        // Update musical state and apply to modules
        this.updateMusicalState(musicalInterpretation);
        this.applyMusicalInterpretation(musicalInterpretation);

        // Emit musical analysis event
        this.eventBus?.emit('musical:analysis_complete', {
            interpretation: musicalInterpretation,
            bufferSize: this.analysisBuffer.movements.length
        });
    }

    performImmediateMusicalAnalysis(movementData, gestureData) {
        if (!this.musicalIntelligence) return;

        const movement = movementData || { bodies: [] };
        const gesture = gestureData || { detectedGestures: [] };

        const interpretation = this.musicalIntelligence.interpretMovement(movement, gesture);
        this.applyMusicalInterpretation(interpretation);

        this.eventBus?.emit('musical:immediate_response', {
            interpretation: interpretation,
            trigger: movementData ? 'movement' : 'gesture'
        });
    }

    updateMusicalState(interpretation) {
        // Update phrases
        if (interpretation.phrases && interpretation.phrases.length > 0) {
            this.currentMusicalState.phrases.push(...interpretation.phrases);

            // Keep only recent phrases
            if (this.currentMusicalState.phrases.length > 50) {
                this.currentMusicalState.phrases = this.currentMusicalState.phrases.slice(-25);
            }
        }

        // Update harmonic and rhythmic context
        if (interpretation.musicalContext) {
            this.currentMusicalState.harmonicContext = interpretation.musicalContext.harmonic;
            this.currentMusicalState.rhythmicContext = interpretation.musicalContext.rhythmic;
        }

        // Update key and tempo if suggested by interpretation
        if (interpretation.suggestedKey && interpretation.suggestedKey !== this.currentMusicalState.key) {
            this.changeKey(interpretation.suggestedKey);
        }

        if (interpretation.suggestedTempo && Math.abs(interpretation.suggestedTempo - this.currentMusicalState.tempo) > 10) {
            this.changeTempo(interpretation.suggestedTempo);
        }
    }

    applyMusicalInterpretation(interpretation) {
        // Apply musical interpretation to all connected modules
        for (const [moduleName, target] of this.musicalTargets.entries()) {
            const module = this.getModule(moduleName);
            if (module && this.connectedModules.has(moduleName)) {
                try {
                    target.applyFunction(module, interpretation, this.currentMusicalState);
                } catch (error) {
                    console.warn(`Failed to apply musical interpretation to ${moduleName}:`, error);
                }
            }
        }
    }

    // Application functions for specific modules
    applyMusicalToAudio(module, interpretation, musicalState) {
        if (!module.updateMusicalParameters) return;

        const audioParams = {};

        // Apply phrases to audio generation
        if (interpretation.phrases && interpretation.phrases.length > 0) {
            const latestPhrase = interpretation.phrases[interpretation.phrases.length - 1];

            if (latestPhrase.suggested) {
                audioParams.melody = latestPhrase.suggested.melody;
                audioParams.harmony = latestPhrase.suggested.harmony;
                audioParams.rhythm = latestPhrase.suggested.rhythm;
                audioParams.dynamics = latestPhrase.suggested.dynamics;
            }
        }

        // Apply tension to audio parameters
        if (interpretation.tension) {
            audioParams.tension = interpretation.tension.current;
            audioParams.tensionTrend = interpretation.tension.trend;

            // Map tension to audio properties
            if (interpretation.tension.current > 0.7) {
                audioParams.dissonance = 0.3;
                audioParams.rhythmicComplexity = 1.2;
            } else if (interpretation.tension.current < 0.3) {
                audioParams.consonance = 0.8;
                audioParams.rhythmicSimplicity = 1.2;
            }
        }

        // Apply harmonic suggestions
        if (interpretation.harmonicSuggestions && interpretation.harmonicSuggestions.length > 0) {
            audioParams.harmonicSuggestions = interpretation.harmonicSuggestions;
        }

        // Apply key and tempo
        audioParams.key = musicalState.key;
        audioParams.tempo = musicalState.tempo;

        module.updateMusicalParameters(audioParams);
    }

    applyMusicalToEnvironment(module, interpretation, musicalState) {
        if (!module.updateMusicalContext) return;

        const envParams = {
            key: musicalState.key,
            tempo: musicalState.tempo,
            mood: this.interpretMoodFromMusic(interpretation),
            tension: interpretation.tension?.current || 0.5
        };

        // Map musical phrases to environment changes
        if (interpretation.phrases && interpretation.phrases.length > 0) {
            const dominantShape = this.findDominantPhraseShape(interpretation.phrases);
            envParams.environmentSuggestion = this.mapShapeToEnvironment(dominantShape);
        }

        module.updateMusicalContext(envParams);
    }

    applyMusicalToVisual(module, interpretation, musicalState) {
        if (!module.updateMusicalVisualization) return;

        const visualParams = {};

        // Map rhythm to visual pulsing
        if (interpretation.rhythmicPatterns && interpretation.rhythmicPatterns.length > 0) {
            const primaryRhythm = interpretation.rhythmicPatterns[0];
            visualParams.rhythmicPulse = {
                pattern: primaryRhythm.pattern,
                tempo: primaryRhythm.tempo || musicalState.tempo,
                intensity: primaryRhythm.confidence || 0.7
            };
        }

        // Map harmony to color schemes
        if (interpretation.phrases && interpretation.phrases.length > 0) {
            const harmonicColors = this.mapHarmonyToColors(interpretation.phrases);
            visualParams.colorHarmony = harmonicColors;
        }

        // Map dynamics to visual intensity
        if (interpretation.tension) {
            visualParams.dynamicIntensity = interpretation.tension.current;
        }

        module.updateMusicalVisualization(visualParams);
    }

    applyMusicalToSpatial(module, interpretation, musicalState) {
        if (!module.updateSpatialMusic) return;

        const spatialParams = {};

        // Map harmonic progression to spatial movement
        if (interpretation.harmonicSuggestions && interpretation.harmonicSuggestions.length > 0) {
            spatialParams.harmonicMovement = interpretation.harmonicSuggestions.map(suggestion => ({
                type: suggestion.type,
                direction: this.mapProgressionToSpatialDirection(suggestion.type),
                intensity: suggestion.confidence
            }));
        }

        // Map phrases to spatial positioning
        if (interpretation.phrases && interpretation.phrases.length > 0) {
            spatialParams.phrasePositioning = interpretation.phrases.map(phrase => ({
                id: phrase.id,
                startPosition: this.mapPhraseToPosition(phrase.shape, 'start'),
                endPosition: this.mapPhraseToPosition(phrase.shape, 'end'),
                duration: phrase.duration
            }));
        }

        module.updateSpatialMusic(spatialParams);
    }

    // Adaptation and utility functions
    adaptMusicalParameters(learningData) {
        if (!learningData.profile) return;

        const profile = learningData.profile;

        // Adapt musical complexity based on user preferences
        if (profile.preferences.complexity > 0.7) {
            // Increase harmonic and rhythmic complexity
            this.musicalIntelligence.musicalRules.complexity_multiplier = 1.3;
        } else if (profile.preferences.complexity < 0.3) {
            // Simplify musical output
            this.musicalIntelligence.musicalRules.complexity_multiplier = 0.7;
        }

        // Adapt tempo based on movement style
        if (profile.movementStyle === 'energetic') {
            const newTempo = Math.min(180, this.currentMusicalState.tempo * 1.1);
            this.changeTempo(newTempo);
        } else if (profile.movementStyle === 'contemplative') {
            const newTempo = Math.max(80, this.currentMusicalState.tempo * 0.9);
            this.changeTempo(newTempo);
        }

        // Adapt musical key based on engagement
        if (profile.sessionData.engagementLevel > 0.8) {
            // High engagement - try more adventurous keys
            const adventurousKeys = ['G major', 'D major', 'A major'];
            if (!adventurousKeys.includes(this.currentMusicalState.key)) {
                this.changeKey(adventurousKeys[Math.floor(Math.random() * adventurousKeys.length)]);
            }
        }
    }

    adaptToEnvironment(environmentData) {
        const environmentMusicalMappings = {
            'forest': { key: 'G major', mood: 'organic', complexity: 0.6 },
            'space': { key: 'A minor', mood: 'ethereal', complexity: 0.8 },
            'ocean': { key: 'E minor', mood: 'flowing', complexity: 0.7 },
            'urban': { key: 'C major', mood: 'rhythmic', complexity: 0.9 },
            'classical': { key: 'D major', mood: 'harmonic', complexity: 1.0 }
        };

        const mapping = environmentMusicalMappings[environmentData.environment];
        if (mapping) {
            this.changeKey(mapping.key);

            // Emit environment-adapted musical parameters
            this.eventBus?.emit('musical:environment_adapted', {
                environment: environmentData.environment,
                musicalMapping: mapping
            });
        }
    }

    // Utility and helper functions
    aggregateMovementData(movements) {
        return {
            bodies: movements.map(m => m.data.skeletons || []).flat(),
            averageEnergy: movements.reduce((sum, m) => {
                return sum + (m.data.metrics?.averageMotion || 0);
            }, 0) / movements.length,
            timestamp: Date.now()
        };
    }

    aggregateGestureData(gestures) {
        return {
            detectedGestures: gestures.map(g => g.data.detectedGestures || []).flat(),
            averageConfidence: gestures.reduce((sum, g) => sum + g.confidence, 0) / gestures.length
        };
    }

    shouldTriggerImmediateAnalysis(data) {
        // Trigger immediate analysis for high-energy or significant movements
        if (data.metrics && data.metrics.averageMotion > 0.8) return true;
        if (data.skeletons && data.skeletons.length > 3) return true; // Many participants
        return false;
    }

    calculateGestureConfidence(data) {
        if (!data.detectedGestures) return 0;
        const totalConfidence = data.detectedGestures.reduce((sum, g) => sum + g.confidence, 0);
        return totalConfidence / data.detectedGestures.length;
    }

    interpretMoodFromMusic(interpretation) {
        if (interpretation.tension) {
            if (interpretation.tension.current > 0.7) return 'intense';
            if (interpretation.tension.current < 0.3) return 'calm';
        }
        return 'balanced';
    }

    findDominantPhraseShape(phrases) {
        const shapes = phrases.map(p => p.shape);
        const shapeCount = {};
        shapes.forEach(shape => {
            shapeCount[shape] = (shapeCount[shape] || 0) + 1;
        });
        return Object.keys(shapeCount).reduce((a, b) => shapeCount[a] > shapeCount[b] ? a : b);
    }

    mapShapeToEnvironment(shape) {
        const shapeEnvironmentMap = {
            'ascending': 'space',
            'descending': 'ocean',
            'arch': 'classical',
            'wave': 'forest',
            'stable': 'urban'
        };
        return shapeEnvironmentMap[shape] || 'neutral';
    }

    mapHarmonyToColors(phrases) {
        // Simple mapping of harmonic content to colors
        const colors = [];
        phrases.forEach(phrase => {
            if (phrase.suggested && phrase.suggested.harmony) {
                const progression = phrase.suggested.harmony.progression;
                if (progression.includes('I')) colors.push('#4A90E2'); // Blue for tonic
                if (progression.includes('V')) colors.push('#E24A4A'); // Red for dominant
                if (progression.includes('vi')) colors.push('#9B59B6'); // Purple for relative minor
                if (progression.includes('IV')) colors.push('#F39C12'); // Orange for subdominant
            }
        });
        return colors.length > 0 ? colors : ['#FFFFFF'];
    }

    mapProgressionToSpatialDirection(progressionType) {
        const directionMap = {
            'ascending': 'up',
            'descending': 'down',
            'resolution': 'center',
            'oscillating': 'circular'
        };
        return directionMap[progressionType] || 'forward';
    }

    mapPhraseToPosition(shape, position) {
        const positionMaps = {
            'ascending': { start: { x: -1, y: -1, z: 0 }, end: { x: 1, y: 1, z: 0 } },
            'descending': { start: { x: 1, y: 1, z: 0 }, end: { x: -1, y: -1, z: 0 } },
            'arch': { start: { x: -1, y: 0, z: 0 }, end: { x: 1, y: 0, z: 0 } },
            'wave': { start: { x: 0, y: -1, z: 0 }, end: { x: 0, y: 1, z: 0 } },
            'stable': { start: { x: 0, y: 0, z: 0 }, end: { x: 0, y: 0, z: 0 } }
        };

        const map = positionMaps[shape] || positionMaps['stable'];
        return map[position];
    }

    trimBuffer(bufferType) {
        if (this.analysisBuffer[bufferType].length > this.analysisBuffer.bufferSize) {
            this.analysisBuffer[bufferType].shift();
        }
    }

    registerMusicalTarget(moduleName, module) {
        if (this.musicalTargets.has(moduleName)) {
            this.connectedModules.add(moduleName);
            console.log(`🎼 Musical Intelligence connected to ${moduleName}`);
        }
    }

    getModule(moduleName) {
        return this.moduleManager?.getModule(moduleName);
    }

    changeKey(newKey) {
        if (this.musicalIntelligence && this.musicalIntelligence.scales[newKey]) {
            this.currentMusicalState.key = newKey;
            this.musicalIntelligence.setKey(newKey);

            this.eventBus?.emit('musical:key_changed', {
                oldKey: this.currentMusicalState.key,
                newKey: newKey
            });
        }
    }

    changeTempo(newTempo) {
        if (newTempo >= 60 && newTempo <= 200) {
            this.currentMusicalState.tempo = newTempo;
            this.musicalIntelligence.setTempo(newTempo);

            this.eventBus?.emit('musical:tempo_changed', {
                oldTempo: this.currentMusicalState.tempo,
                newTempo: newTempo
            });
        }
    }

    // Public API
    getCurrentMusicalState() {
        return { ...this.currentMusicalState };
    }

    getMusicalMemory() {
        return this.musicalIntelligence?.getMusicalMemory() || null;
    }

    getStatus() {
        return {
            isAnalyzing: this.isAnalyzing,
            analysisEnabled: this.analysisEnabled,
            currentKey: this.currentMusicalState.key,
            currentTempo: this.currentMusicalState.tempo,
            connectedModules: Array.from(this.connectedModules),
            bufferStatus: {
                movements: this.analysisBuffer.movements.length,
                gestures: this.analysisBuffer.gestures.length
            },
            recentPhrases: this.currentMusicalState.phrases.slice(-5)
        };
    }

    async cleanup() {
        this.isAnalyzing = false;

        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
            this.analysisInterval = null;
        }

        if (this.musicalIntelligence) {
            this.musicalIntelligence.reset();
        }

        this.connectedModules.clear();
        this.musicalTargets.clear();

        this.isInitialized = false;
    }
}

// Export for both CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MusicalIntelligenceModule;
} else if (typeof window !== 'undefined') {
    window.MusicalIntelligenceModule = MusicalIntelligenceModule;
}