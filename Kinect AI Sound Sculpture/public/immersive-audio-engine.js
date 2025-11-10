class ImmersiveAudioEngine {
    constructor() {
        this.isInitialized = false;
        this.isPlaying = false;
        this.masterVolume = 0.7;

        // Spatial audio system
        this.spatialAudio = {
            listener: null,
            room: null,
            sources: new Map(),
            hrtf: null,
            ambisonics: null
        };

        // Advanced synthesis layers
        this.layers = new Map();
        this.narrativeEngine = null;
        this.emotionalProcessor = null;
        this.harmonicIntelligence = null;

        // Real-time audio processing
        this.processors = {
            reverb: null,
            chorus: null,
            granular: null,
            spectral: null,
            binaural: null
        };

        // Dynamic soundscape management
        this.soundscape = {
            currentScene: 'ambient',
            sceneTransitions: new Map(),
            layerEvolution: new Map(),
            adaptiveParameters: {}
        };

        // AI-driven composition
        this.composition = {
            musicalScale: 'pentatonic',
            harmonicProgression: [],
            rhythmicPatterns: [],
            melodicMotifs: [],
            adaptiveStructure: null
        };

        // Psychoacoustic enhancements
        this.psychoacoustics = {
            binauralBeats: null,
            phantomFundamental: null,
            spectralEnhancement: null,
            dynamicRange: null
        };

        // Performance monitoring
        this.performance = {
            latency: 0,
            bufferHealth: 1.0,
            processingLoad: 0,
            adaptiveQuality: 1.0
        };

        console.log('🎭 Immersive Audio Engine initialized');
    }

    async initialize() {
        try {
            console.log('🎭 Initializing Immersive Audio Engine...');

            // Initialize Tone.js with optimal settings
            await Tone.start();

            // Configure for immersive audio
            Tone.context.lookAhead = 0.005; // Ultra-low latency
            Tone.context.latencyHint = 'interactive';

            // Create master signal chain
            await this.setupMasterChain();

            // Initialize spatial audio
            await this.initializeSpatialAudio();

            // Create immersive synthesis layers
            await this.initializeImmersiveLayers();

            // Setup real-time processors
            await this.initializeProcessors();

            // Initialize narrative and emotional systems
            await this.initializeNarrativeEngine();
            await this.initializeEmotionalProcessor();
            await this.initializeHarmonicIntelligence();

            // Setup psychoacoustic enhancements
            await this.initializePsychoacoustics();

            this.isInitialized = true;
            console.log('✅ Immersive Audio Engine ready');

        } catch (error) {
            console.error('❌ Immersive Audio Engine initialization failed:', error);
            throw error;
        }
    }

    async setupMasterChain() {
        // Master gain with dynamic range compression
        this.masterGain = new Tone.Gain(this.masterVolume);

        // Master compressor for professional sound
        this.masterCompressor = new Tone.Compressor({
            threshold: -24,
            ratio: 4,
            attack: 0.003,
            release: 0.1
        });

        // Master limiter for safety
        this.masterLimiter = new Tone.Limiter(-3);

        // Master EQ for room correction
        this.masterEQ = new Tone.EQ3({
            low: 0,
            mid: 0,
            high: 0
        });

        // Connect master chain
        this.masterGain
            .connect(this.masterCompressor)
            .connect(this.masterEQ)
            .connect(this.masterLimiter)
            .toDestination();

        // Create analyzer for visualization
        this.analyzer = new Tone.Analyser('fft', 512);
        this.masterLimiter.connect(this.analyzer);

        console.log('🔊 Master audio chain initialized');
    }

    async initializeSpatialAudio() {
        // Create spatial listener (representing visitor position)
        this.spatialAudio.listener = new Tone.Listener();

        // Position listener at center of space
        this.spatialAudio.listener.positionX.value = 0;
        this.spatialAudio.listener.positionY.value = 1.7; // Human head height
        this.spatialAudio.listener.positionZ.value = 0;

        // Setup virtual room acoustics
        this.spatialAudio.room = {
            width: 4.0,
            height: 3.0,
            depth: 4.0,
            reverbTime: 1.2,
            absorption: 0.3
        };

        // Create ambisonics encoder for 360° spatial audio
        this.spatialAudio.ambisonics = {
            encoder: new Tone.Gain(), // Simplified - would use Web Audio API AmbisonicEncoder
            decoder: new Tone.Gain()  // Simplified - would use AmbisonicDecoder
        };

        console.log('🌐 Spatial audio system initialized');
    }

    async initializeImmersiveLayers() {
        // Evolving Ambient Foundation
        this.layers.set('ambientEvolution', new EvolvingAmbientLayer(this.masterGain));

        // Spatial Melodic Swarms
        this.layers.set('melodicSwarms', new SpatialMelodicLayer(this.masterGain));

        // Harmonic Field Generator
        this.layers.set('harmonicField', new HarmonicFieldLayer(this.masterGain));

        // Rhythmic Pulse Network
        this.layers.set('rhythmicPulse', new RhythmicPulseLayer(this.masterGain));

        // Gestural Sound Objects
        this.layers.set('gesturalObjects', new GesturalSoundLayer(this.masterGain));

        // Atmospheric Texture Generator
        this.layers.set('atmosphericTexture', new AtmosphericLayer(this.masterGain));

        // Initialize all layers
        for (const [name, layer] of this.layers) {
            try {
                await layer.initialize();
                console.log(`🎨 ${name} layer initialized`);
            } catch (error) {
                console.error(`❌ Failed to initialize ${name} layer:`, error);
            }
        }
    }

    async initializeProcessors() {
        // Convolution Reverb with multiple impulse responses
        this.processors.reverb = new Tone.Convolver({
            url: './audio/impulses/hall.wav', // Would load actual impulse response
            normalize: true
        });

        // Chorus for width and movement
        this.processors.chorus = new Tone.Chorus({
            frequency: 0.5,
            delayTime: 3.5,
            depth: 0.7,
            spread: 180
        });

        // Granular synthesis processor
        this.processors.granular = new GranularProcessor();

        // Spectral processing
        this.processors.spectral = new SpectralProcessor();

        // Binaural processor for headphone users
        this.processors.binaural = new BinauralProcessor();

        console.log('🔄 Audio processors initialized');
    }

    async initializeNarrativeEngine() {
        this.narrativeEngine = new AudioNarrativeEngine();

        // Define narrative scenes
        this.narrativeEngine.defineScenes([
            {
                name: 'awakening',
                duration: 30000,
                characteristics: { energy: 0.2, complexity: 0.3, tension: 0.1 },
                triggers: ['first_movement', 'session_start']
            },
            {
                name: 'exploration',
                duration: 60000,
                characteristics: { energy: 0.6, complexity: 0.7, tension: 0.4 },
                triggers: ['multiple_gestures', 'active_movement']
            },
            {
                name: 'communion',
                duration: 45000,
                characteristics: { energy: 0.8, complexity: 0.9, tension: 0.6 },
                triggers: ['group_interaction', 'synchronized_movement']
            },
            {
                name: 'transcendence',
                duration: 40000,
                characteristics: { energy: 1.0, complexity: 1.0, tension: 0.8 },
                triggers: ['peak_activity', 'creative_gestures']
            },
            {
                name: 'resolution',
                duration: 20000,
                characteristics: { energy: 0.3, complexity: 0.4, tension: 0.2 },
                triggers: ['session_end', 'movement_cessation']
            }
        ]);

        console.log('📖 Audio Narrative Engine initialized');
    }

    async initializeEmotionalProcessor() {
        this.emotionalProcessor = new EmotionalAudioProcessor();

        // Define emotional states and their audio characteristics
        this.emotionalProcessor.defineEmotions({
            wonder: {
                harmonics: 'bright',
                rhythm: 'floating',
                space: 'expansive',
                processing: ['reverb', 'chorus', 'shimmer']
            },
            joy: {
                harmonics: 'major',
                rhythm: 'bouncy',
                space: 'intimate',
                processing: ['compression', 'saturation', 'exciter']
            },
            contemplation: {
                harmonics: 'suspended',
                rhythm: 'slow',
                space: 'deep',
                processing: ['reverb', 'lowpass', 'stretch']
            },
            excitement: {
                harmonics: 'complex',
                rhythm: 'energetic',
                space: 'dynamic',
                processing: ['chorus', 'distortion', 'granular']
            },
            serenity: {
                harmonics: 'pure',
                rhythm: 'gentle',
                space: 'calm',
                processing: ['reverb', 'pad', 'warmth']
            }
        });

        console.log('💭 Emotional Audio Processor initialized');
    }

    async initializeHarmonicIntelligence() {
        this.harmonicIntelligence = new HarmonicIntelligenceEngine();

        // Advanced harmonic systems
        this.harmonicIntelligence.loadHarmonicSystems([
            'western_tonal',
            'modal_interchange',
            'microtonal_scales',
            'spectral_harmony',
            'adaptive_tuning',
            'cultural_modes'
        ]);

        // AI-driven voice leading
        this.harmonicIntelligence.enableAIVoiceLeading({
            smoothness: 0.8,
            creativity: 0.6,
            complexity: 0.7
        });

        console.log('🧠 Harmonic Intelligence Engine initialized');
    }

    async initializePsychoacoustics() {
        // Binaural beats for altered states
        this.psychoacoustics.binauralBeats = new BinauralBeatsProcessor({
            carrierFrequency: 440,
            beatFrequency: 4, // Theta waves for creativity
            amplitude: 0.1
        });

        // Phantom fundamental enhancement
        this.psychoacoustics.phantomFundamental = new PhantomFundamentalProcessor();

        // Spectral enhancement for perceived clarity
        this.psychoacoustics.spectralEnhancement = new SpectralEnhancementProcessor();

        // Dynamic range optimization
        this.psychoacoustics.dynamicRange = new DynamicRangeProcessor();

        console.log('🧠 Psychoacoustic enhancements initialized');
    }

    // Main processing function - enhanced for immersive experience
    processMovementData(data) {
        if (!this.isInitialized || !this.isPlaying) return;

        const processStart = performance.now();

        try {
            // Extract enhanced movement features
            const movementFeatures = this.extractMovementFeatures(data);

            // Update narrative state
            this.narrativeEngine.updateNarrative(movementFeatures);

            // Process emotional state
            const emotionalState = this.emotionalProcessor.analyzeEmotion(movementFeatures);

            // Generate harmonic content
            const harmonicContext = this.harmonicIntelligence.generateHarmony(movementFeatures, emotionalState);

            // Update spatial positioning
            this.updateSpatialAudio(data);

            // Process each layer with enhanced context
            for (const [name, layer] of this.layers) {
                if (layer.isActive) {
                    layer.processMovement(movementFeatures, {
                        narrative: this.narrativeEngine.getCurrentScene(),
                        emotion: emotionalState,
                        harmony: harmonicContext,
                        spatial: this.spatialAudio
                    });
                }
            }

            // Apply real-time effects based on context
            this.applyContextualEffects(emotionalState, harmonicContext);

            // Update psychoacoustic processing
            this.updatePsychoacoustics(movementFeatures, emotionalState);

            // Performance monitoring
            this.performance.latency = performance.now() - processStart;
            this.updatePerformanceMetrics();

        } catch (error) {
            console.error('🚨 Audio processing error:', error);
        }
    }

    extractMovementFeatures(data) {
        if (!data.ai) return this.extractBasicFeatures(data);

        const ai = data.ai;

        return {
            // Basic movement metrics
            bodyCount: data.bodies?.length || 0,
            totalEnergy: data.metrics?.energyLevel || 0,
            handActivity: data.metrics?.totalHandActivity || 0,

            // AI-enhanced features
            gestures: ai.gestures || [],
            musicalPhrases: ai.musicalPhrases || [],
            enhancedMetrics: ai.enhancedMetrics || {},
            visitorProfile: ai.visitorProfile || {},

            // Spatial features
            spatialDistribution: this.calculateSpatialDistribution(data),
            movementVectors: this.calculateMovementVectors(data),
            groupDynamics: this.analyzeGroupDynamics(data),

            // Temporal features
            timestamp: Date.now(),
            sessionDuration: this.getSessionDuration(),
            movementContinuity: this.calculateContinuity(data)
        };
    }

    extractBasicFeatures(data) {
        return {
            bodyCount: data.bodies?.length || 0,
            totalEnergy: data.metrics?.energyLevel || 0,
            handActivity: data.metrics?.totalHandActivity || 0,
            gestures: [],
            musicalPhrases: [],
            enhancedMetrics: { intentionality: 0.5, musicality: 0.5, expressiveness: 0.5 },
            spatialDistribution: this.calculateSpatialDistribution(data),
            timestamp: Date.now()
        };
    }

    updateSpatialAudio(data) {
        if (!data.bodies || data.bodies.length === 0) return;

        // Update listener position based on center of mass
        const centerOfMass = this.calculateCenterOfMass(data.bodies);

        // Smooth listener movement
        const smoothingFactor = 0.1;
        this.spatialAudio.listener.positionX.rampTo(centerOfMass.x * smoothingFactor, 0.1);
        this.spatialAudio.listener.positionZ.rampTo(centerOfMass.z * smoothingFactor, 0.1);

        // Update spatial sources based on active gestures
        this.updateSpatialSources(data);
    }

    updateSpatialSources(data) {
        // Create spatial audio sources for hands and major joints
        data.bodies?.forEach((body, bodyIndex) => {
            if (body.joints) {
                // Left hand source
                if (body.joints[8]) {
                    this.updateSpatialSource(`leftHand_${bodyIndex}`, body.joints[8].position);
                }

                // Right hand source
                if (body.joints[15]) {
                    this.updateSpatialSource(`rightHand_${bodyIndex}`, body.joints[15].position);
                }

                // Head source for ambient positioning
                if (body.joints[26]) {
                    this.updateSpatialSource(`head_${bodyIndex}`, body.joints[26].position);
                }
            }
        });
    }

    updateSpatialSource(id, position) {
        let source = this.spatialAudio.sources.get(id);

        if (!source) {
            // Create new spatial source
            source = {
                panner: new Tone.Panner3D({
                    panningModel: 'HRTF',
                    distanceModel: 'inverse',
                    refDistance: 1,
                    maxDistance: 10,
                    rolloffFactor: 1,
                    coneInnerAngle: 360,
                    coneOuterAngle: 0,
                    coneOuterGain: 0
                }),
                gain: new Tone.Gain(0.5),
                position: { x: 0, y: 0, z: 0 }
            };

            source.gain.connect(source.panner);
            source.panner.connect(this.masterGain);

            this.spatialAudio.sources.set(id, source);
        }

        // Update position with smoothing
        const smoothing = 0.2;
        source.panner.positionX.rampTo(position.x * smoothing, 0.05);
        source.panner.positionY.rampTo(position.y * smoothing, 0.05);
        source.panner.positionZ.rampTo(position.z * smoothing, 0.05);

        source.position = position;
    }

    applyContextualEffects(emotionalState, harmonicContext) {
        // Apply reverb based on emotional space
        if (this.processors.reverb) {
            const reverbLevel = this.mapEmotionToReverb(emotionalState);
            this.processors.reverb.wet.rampTo(reverbLevel, 0.5);
        }

        // Apply chorus based on harmonic complexity
        if (this.processors.chorus) {
            const chorusDepth = harmonicContext.complexity * 0.8;
            this.processors.chorus.depth.rampTo(chorusDepth, 0.3);
        }

        // Apply spectral processing based on movement quality
        if (this.processors.spectral) {
            this.processors.spectral.updateParameters(emotionalState, harmonicContext);
        }
    }

    updatePsychoacoustics(movementFeatures, emotionalState) {
        // Update binaural beats based on session state
        if (this.psychoacoustics.binauralBeats) {
            const targetFrequency = this.mapEmotionToBinauralFreq(emotionalState);
            this.psychoacoustics.binauralBeats.updateFrequency(targetFrequency);
        }

        // Update phantom fundamentals based on harmonic content
        if (this.psychoacoustics.phantomFundamental) {
            this.psychoacoustics.phantomFundamental.updateFromMovement(movementFeatures);
        }
    }

    // Utility methods for spatial and contextual processing
    calculateCenterOfMass(bodies) {
        if (bodies.length === 0) return { x: 0, y: 1.7, z: 0 };

        let totalX = 0, totalY = 0, totalZ = 0, count = 0;

        bodies.forEach(body => {
            if (body.joints && body.joints[0]) { // Pelvis as center
                totalX += body.joints[0].position.x;
                totalY += body.joints[0].position.y;
                totalZ += body.joints[0].position.z;
                count++;
            }
        });

        return count > 0 ? {
            x: totalX / count,
            y: totalY / count,
            z: totalZ / count
        } : { x: 0, y: 1.7, z: 0 };
    }

    calculateSpatialDistribution(data) {
        if (!data.bodies || data.bodies.length === 0) {
            return { width: 0, height: 0, depth: 0, density: 0 };
        }

        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let minZ = Infinity, maxZ = -Infinity;

        data.bodies.forEach(body => {
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

        const width = maxX - minX;
        const height = maxY - minY;
        const depth = maxZ - minZ;
        const volume = width * height * depth;
        const density = data.bodies.length / Math.max(volume, 1);

        return { width, height, depth, density };
    }

    mapEmotionToReverb(emotionalState) {
        const emotionMap = {
            wonder: 0.8,
            joy: 0.4,
            contemplation: 0.9,
            excitement: 0.3,
            serenity: 0.7
        };
        return emotionMap[emotionalState.primary] || 0.5;
    }

    mapEmotionToBinauralFreq(emotionalState) {
        const freqMap = {
            wonder: 8,        // Alpha waves
            joy: 15,          // Beta waves
            contemplation: 4, // Theta waves
            excitement: 25,   // High beta
            serenity: 6       // Low alpha
        };
        return freqMap[emotionalState.primary] || 8;
    }

    updatePerformanceMetrics() {
        // Monitor audio performance
        this.performance.bufferHealth = Tone.context.rawContext.baseLatency;
        this.performance.processingLoad = this.calculateProcessingLoad();

        // Adaptive quality adjustment
        if (this.performance.latency > 20) {
            this.adaptiveQualityReduction();
        }
    }

    // Public API
    async toggleAudio() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (this.isPlaying) {
            this.stopAudio();
        } else {
            this.startAudio();
        }
    }

    startAudio() {
        this.isPlaying = true;

        // Start all active layers
        for (const layer of this.layers.values()) {
            if (layer.isActive) {
                layer.start();
            }
        }

        // Begin narrative
        if (this.narrativeEngine) {
            this.narrativeEngine.begin();
        }

        console.log('🎭 Immersive audio experience started');
    }

    stopAudio() {
        this.isPlaying = false;

        // Stop all layers gracefully
        for (const layer of this.layers.values()) {
            layer.stop();
        }

        console.log('🎭 Immersive audio experience stopped');
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.rampTo(this.masterVolume, 0.1);
        }
    }

    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isPlaying: this.isPlaying,
            masterVolume: this.masterVolume,
            activeLayers: Array.from(this.layers.values()).filter(l => l.isActive).length,
            performance: this.performance,
            narrative: this.narrativeEngine?.getCurrentScene() || null,
            spatialSources: this.spatialAudio.sources.size
        };
    }
}

// Export for integration
window.ImmersiveAudioEngine = ImmersiveAudioEngine;