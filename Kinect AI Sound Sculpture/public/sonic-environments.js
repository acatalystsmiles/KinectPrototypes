class SonicEnvironmentManager {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.environments = new Map();
        this.currentEnvironment = null;
        this.discoveryEngine = new EnvironmentDiscoveryEngine();
        this.transitionEngine = new EnvironmentTransitionEngine();

        // Environment state management
        this.environmentState = {
            current: 'neutral',
            previous: null,
            transitionProgress: 0,
            discoveryProgress: new Map(),
            unlocked: new Set(['neutral']), // Start with neutral unlocked
            visitationCount: new Map()
        };

        // Discovery tracking
        this.discoveryTracking = {
            gestureSequences: [],
            spatialPatterns: [],
            energyHistory: [],
            socialPatterns: [],
            timeInEnvironment: 0
        };

        // Visual indicators
        this.visualIndicators = {
            currentEnvironmentColor: '#4A90E2',
            transitionEffects: [],
            discoveryHints: [],
            environmentPreviews: new Map()
        };

        this.initializeEnvironments();
        console.log('🌍 Sonic Environment Manager initialized');
    }

    initializeEnvironments() {
        // Define distinct sonic worlds
        this.defineEnvironment('neutral', {
            name: 'Neutral',
            description: 'Starting ambient space for exploration',
            characteristics: {
                tone: 'ambient',
                energy: 0.3,
                complexity: 0.4,
                naturalness: 0.5,
                rhythm: 0.2
            },
            colors: { primary: '#4A90E2', secondary: '#7BB3F0', accent: '#2E5C8A' },
            discoveryTriggers: [], // Always available
            unlockRequirements: null,
            audioProfile: this.createNeutralAudioProfile()
        });

        this.defineEnvironment('forest', {
            name: 'Forest',
            description: 'Organic, natural sounds with birdsong and wind',
            characteristics: {
                tone: 'organic',
                energy: 0.4,
                complexity: 0.6,
                naturalness: 0.9,
                rhythm: 0.3
            },
            colors: { primary: '#2E7D32', secondary: '#4CAF50', accent: '#1B5E20' },
            discoveryTriggers: ['gentle_wave', 'reaching_up', 'circular_motion'],
            unlockRequirements: {
                gestureVariety: 5,
                timeSpent: 30000,
                naturalMovements: 0.7
            },
            audioProfile: this.createForestAudioProfile()
        });

        this.defineEnvironment('space', {
            name: 'Space',
            description: 'Ethereal, ambient cosmos with stellar harmonies',
            characteristics: {
                tone: 'ethereal',
                energy: 0.2,
                complexity: 0.8,
                naturalness: 0.1,
                rhythm: 0.1
            },
            colors: { primary: '#1A237E', secondary: '#3F51B5', accent: '#0D47A1' },
            discoveryTriggers: ['slow_expansion', 'floating_gesture', 'stillness'],
            unlockRequirements: {
                contemplativeTime: 60000,
                slowMovements: 0.8,
                verticalGestures: 10
            },
            audioProfile: this.createSpaceAudioProfile()
        });

        this.defineEnvironment('ocean', {
            name: 'Ocean',
            description: 'Flowing, rhythmic waves with aquatic harmonies',
            characteristics: {
                tone: 'flowing',
                energy: 0.6,
                complexity: 0.5,
                naturalness: 0.8,
                rhythm: 0.8
            },
            colors: { primary: '#006064', secondary: '#00ACC1', accent: '#004D51' },
            discoveryTriggers: ['wave_motion', 'flowing_arms', 'rhythmic_sway'],
            unlockRequirements: {
                rhythmicMovements: 20,
                flowingGestures: 15,
                groupSynchrony: 0.6
            },
            audioProfile: this.createOceanAudioProfile()
        });

        this.defineEnvironment('urban', {
            name: 'Urban',
            description: 'Rhythmic, electronic cityscape with digital harmonies',
            characteristics: {
                tone: 'electronic',
                energy: 0.8,
                complexity: 0.9,
                naturalness: 0.2,
                rhythm: 0.9
            },
            colors: { primary: '#FF6F00', secondary: '#FF8F00', accent: '#E65100' },
            discoveryTriggers: ['sharp_movements', 'staccato_gestures', 'angular_patterns'],
            unlockRequirements: {
                energeticMovements: 25,
                sharpGestures: 20,
                complexSequences: 10
            },
            audioProfile: this.createUrbanAudioProfile()
        });

        this.defineEnvironment('classical', {
            name: 'Classical',
            description: 'Orchestral harmonies with structured musical progressions',
            characteristics: {
                tone: 'orchestral',
                energy: 0.7,
                complexity: 1.0,
                naturalness: 0.4,
                rhythm: 0.6
            },
            colors: { primary: '#4A148C', secondary: '#7B1FA2', accent: '#2E0052' },
            discoveryTriggers: ['conducting_gesture', 'musical_phrase', 'harmonic_sequence'],
            unlockRequirements: {
                musicalGestures: 30,
                harmonicComplexity: 0.8,
                structuredMovement: 0.7
            },
            audioProfile: this.createClassicalAudioProfile()
        });

        // Set initial environment
        this.currentEnvironment = this.environments.get('neutral');
        this.environmentState.current = 'neutral';

        console.log(`🌍 Initialized ${this.environments.size} sonic environments`);
    }

    defineEnvironment(id, definition) {
        this.environments.set(id, {
            id: id,
            ...definition,
            isActive: false,
            discoveryScore: 0,
            lastVisited: null,
            totalTimeSpent: 0
        });

        // Initialize discovery progress
        this.environmentState.discoveryProgress.set(id, 0);
        this.environmentState.visitationCount.set(id, 0);
    }

    // Audio profile creators for each environment
    createNeutralAudioProfile() {
        return {
            ambientLayers: {
                foundation: { type: 'warm_pad', intensity: 0.6, pan: 'center' },
                texture: { type: 'subtle_noise', intensity: 0.3, pan: 'wide' }
            },
            melodicResponse: {
                scale: 'pentatonic',
                timbre: 'soft_sine',
                responseSpeed: 'medium',
                harmonicContent: 'simple'
            },
            rhythmicElements: {
                pulse: 'subtle',
                complexity: 'low',
                sync: 'loose'
            },
            effects: {
                reverb: { size: 'medium', decay: 4, wet: 0.4 },
                chorus: { rate: 0.3, depth: 0.2, wet: 0.3 },
                eq: { low: 0, mid: 0, high: 0 }
            },
            spatialMapping: {
                width: 'moderate',
                movement: 'gentle',
                positioning: 'centered'
            }
        };
    }

    createForestAudioProfile() {
        return {
            ambientLayers: {
                foundation: { type: 'forest_bed', intensity: 0.7, pan: 'surround' },
                texture: { type: 'rustling_leaves', intensity: 0.5, pan: 'random' },
                wildlife: { type: 'bird_calls', intensity: 0.4, pan: 'spatial' },
                wind: { type: 'gentle_breeze', intensity: 0.6, pan: 'movement' }
            },
            melodicResponse: {
                scale: 'natural_minor',
                timbre: 'organic_flute',
                responseSpeed: 'relaxed',
                harmonicContent: 'natural_overtones'
            },
            rhythmicElements: {
                pulse: 'natural_heartbeat',
                complexity: 'organic_variation',
                sync: 'breathing_rhythm'
            },
            effects: {
                reverb: { size: 'forest', decay: 6, wet: 0.7 },
                chorus: { rate: 0.1, depth: 0.4, wet: 0.5 },
                eq: { low: 2, mid: -1, high: 1 },
                filter: { type: 'gentle_lowpass', cutoff: 2000 }
            },
            spatialMapping: {
                width: 'immersive',
                movement: 'organic_flow',
                positioning: 'naturalistic'
            }
        };
    }

    createSpaceAudioProfile() {
        return {
            ambientLayers: {
                foundation: { type: 'cosmic_drone', intensity: 0.8, pan: 'omnidirectional' },
                texture: { type: 'stellar_dust', intensity: 0.6, pan: 'floating' },
                harmonics: { type: 'celestial_overtones', intensity: 0.7, pan: 'spherical' },
                resonance: { type: 'void_resonance', intensity: 0.5, pan: 'infinite' }
            },
            melodicResponse: {
                scale: 'whole_tone',
                timbre: 'ethereal_pad',
                responseSpeed: 'glacial',
                harmonicContent: 'complex_partials'
            },
            rhythmicElements: {
                pulse: 'cosmic_pulse',
                complexity: 'minimal',
                sync: 'universal_rhythm'
            },
            effects: {
                reverb: { size: 'infinite', decay: 12, wet: 0.9 },
                chorus: { rate: 0.05, depth: 0.8, wet: 0.7 },
                eq: { low: -2, mid: -1, high: 3 },
                shimmer: { intensity: 0.6, octave: 12 },
                granular: { grainSize: 0.2, density: 0.4 }
            },
            spatialMapping: {
                width: 'infinite',
                movement: 'weightless',
                positioning: '3d_sphere'
            }
        };
    }

    createOceanAudioProfile() {
        return {
            ambientLayers: {
                foundation: { type: 'deep_currents', intensity: 0.8, pan: 'flowing' },
                texture: { type: 'wave_foam', intensity: 0.5, pan: 'rhythmic' },
                rhythm: { type: 'tidal_pulse', intensity: 0.7, pan: 'synchronized' },
                depths: { type: 'abyssal_resonance', intensity: 0.4, pan: 'deep' }
            },
            melodicResponse: {
                scale: 'dorian',
                timbre: 'liquid_synth',
                responseSpeed: 'flowing',
                harmonicContent: 'wave_interference'
            },
            rhythmicElements: {
                pulse: 'wave_rhythm',
                complexity: 'tidal_variation',
                sync: 'group_flow'
            },
            effects: {
                reverb: { size: 'underwater', decay: 8, wet: 0.8 },
                chorus: { rate: 0.4, depth: 0.6, wet: 0.6 },
                eq: { low: 4, mid: 0, high: -2 },
                delay: { time: '8n.', feedback: 0.4, wet: 0.5 },
                filter: { type: 'swimming_filter', resonance: 0.3 }
            },
            spatialMapping: {
                width: 'flowing',
                movement: 'fluid_dynamics',
                positioning: 'current_based'
            }
        };
    }

    createUrbanAudioProfile() {
        return {
            ambientLayers: {
                foundation: { type: 'city_hum', intensity: 0.6, pan: 'stereo' },
                texture: { type: 'digital_glitch', intensity: 0.7, pan: 'random' },
                rhythm: { type: 'machine_pulse', intensity: 0.8, pan: 'precise' },
                energy: { type: 'electric_buzz', intensity: 0.5, pan: 'dynamic' }
            },
            melodicResponse: {
                scale: 'chromatic',
                timbre: 'digital_lead',
                responseSpeed: 'instant',
                harmonicContent: 'electronic_harmonics'
            },
            rhythmicElements: {
                pulse: 'electronic_beat',
                complexity: 'polyrhythmic',
                sync: 'quantized'
            },
            effects: {
                reverb: { size: 'concrete', decay: 2, wet: 0.3 },
                chorus: { rate: 2, depth: 0.3, wet: 0.4 },
                eq: { low: -1, mid: 2, high: 4 },
                distortion: { amount: 0.2, type: 'digital' },
                bitcrush: { bits: 8, frequency: 4000 },
                delay: { time: '16n', feedback: 0.3, wet: 0.4 }
            },
            spatialMapping: {
                width: 'precise',
                movement: 'geometric',
                positioning: 'grid_based'
            }
        };
    }

    createClassicalAudioProfile() {
        return {
            ambientLayers: {
                foundation: { type: 'orchestral_bed', intensity: 0.7, pan: 'ensemble' },
                texture: { type: 'string_section', intensity: 0.6, pan: 'traditional' },
                harmony: { type: 'brass_warmth', intensity: 0.5, pan: 'balanced' },
                dynamics: { type: 'conductor_breath', intensity: 0.4, pan: 'central' }
            },
            melodicResponse: {
                scale: 'major_minor_modal',
                timbre: 'orchestral_blend',
                responseSpeed: 'musical_time',
                harmonicContent: 'classical_theory'
            },
            rhythmicElements: {
                pulse: 'musical_meter',
                complexity: 'classical_variation',
                sync: 'conductor_timing'
            },
            effects: {
                reverb: { size: 'concert_hall', decay: 5, wet: 0.6 },
                chorus: { rate: 0.2, depth: 0.4, wet: 0.3 },
                eq: { low: 1, mid: 0, high: 2 },
                compressor: { threshold: -18, ratio: 3, attack: 0.1 },
                stereoWidth: 1.2
            },
            spatialMapping: {
                width: 'orchestral',
                movement: 'conducted',
                positioning: 'ensemble_based'
            }
        };
    }

    // Main processing function
    processMovementData(data) {
        if (!this.currentEnvironment) return;

        // Update discovery tracking
        this.updateDiscoveryTracking(data);

        // Check for environment discovery
        this.checkEnvironmentDiscovery(data);

        // Process environment transitions
        this.processEnvironmentTransitions();

        // Apply current environment's audio processing
        this.applyEnvironmentAudioProcessing(data);

        // Update visual indicators
        this.updateVisualIndicators();
    }

    updateDiscoveryTracking(data) {
        const currentTime = Date.now();

        // Track gesture sequences
        if (data.ai && data.ai.gestures) {
            data.ai.gestures.forEach(gesture => {
                this.discoveryTracking.gestureSequences.push({
                    type: gesture.type,
                    confidence: gesture.confidence,
                    timestamp: currentTime
                });
            });

            // Maintain sequence history (last 50 gestures)
            if (this.discoveryTracking.gestureSequences.length > 50) {
                this.discoveryTracking.gestureSequences.shift();
            }
        }

        // Track spatial patterns
        if (data.bodies && data.bodies.length > 0) {
            const spatialPattern = this.analyzeSpatialPattern(data.bodies);
            this.discoveryTracking.spatialPatterns.push({
                pattern: spatialPattern,
                timestamp: currentTime
            });

            if (this.discoveryTracking.spatialPatterns.length > 30) {
                this.discoveryTracking.spatialPatterns.shift();
            }
        }

        // Track energy history
        const energy = data.metrics?.energyLevel || 0;
        this.discoveryTracking.energyHistory.push({
            energy: energy,
            timestamp: currentTime
        });

        if (this.discoveryTracking.energyHistory.length > 100) {
            this.discoveryTracking.energyHistory.shift();
        }

        // Update time in environment
        this.discoveryTracking.timeInEnvironment += 100; // Assume 10Hz updates
    }

    analyzeSpatialPattern(bodies) {
        if (bodies.length === 0) return 'empty';

        const centerOfMass = this.calculateCenterOfMass(bodies);
        const spread = this.calculateSpatialSpread(bodies);
        const movement = this.calculateMovementPattern(bodies);

        // Classify spatial pattern
        if (spread < 0.5 && movement < 0.3) return 'concentrated_still';
        if (spread < 0.5 && movement > 0.7) return 'concentrated_active';
        if (spread > 1.5 && movement < 0.3) return 'dispersed_still';
        if (spread > 1.5 && movement > 0.7) return 'dispersed_active';
        if (movement > 0.5) return 'flowing';
        return 'balanced';
    }

    checkEnvironmentDiscovery(data) {
        // Check each locked environment for discovery
        this.environments.forEach((env, envId) => {
            if (this.environmentState.unlocked.has(envId)) return;

            const discoveryScore = this.calculateDiscoveryScore(envId, data);
            this.environmentState.discoveryProgress.set(envId, discoveryScore);

            // Check if environment should be unlocked
            if (this.shouldUnlockEnvironment(envId, discoveryScore)) {
                this.unlockEnvironment(envId);
            }
        });
    }

    calculateDiscoveryScore(envId, data) {
        const env = this.environments.get(envId);
        if (!env.unlockRequirements) return 1.0;

        let score = 0;
        let totalRequirements = 0;

        const requirements = env.unlockRequirements;

        // Check gesture variety
        if (requirements.gestureVariety) {
            const uniqueGestures = new Set(
                this.discoveryTracking.gestureSequences.map(g => g.type)
            ).size;
            score += Math.min(1, uniqueGestures / requirements.gestureVariety);
            totalRequirements++;
        }

        // Check time spent
        if (requirements.timeSpent) {
            score += Math.min(1, this.discoveryTracking.timeInEnvironment / requirements.timeSpent);
            totalRequirements++;
        }

        // Check natural movements
        if (requirements.naturalMovements) {
            const naturalScore = this.calculateNaturalMovementScore();
            score += naturalScore >= requirements.naturalMovements ? 1 : naturalScore / requirements.naturalMovements;
            totalRequirements++;
        }

        // Check contemplative time
        if (requirements.contemplativeTime) {
            const contemplativeTime = this.calculateContemplativeTime();
            score += Math.min(1, contemplativeTime / requirements.contemplativeTime);
            totalRequirements++;
        }

        // Check slow movements
        if (requirements.slowMovements) {
            const slowScore = this.calculateSlowMovementScore();
            score += slowScore >= requirements.slowMovements ? 1 : slowScore / requirements.slowMovements;
            totalRequirements++;
        }

        // Check vertical gestures
        if (requirements.verticalGestures) {
            const verticalCount = this.countVerticalGestures();
            score += Math.min(1, verticalCount / requirements.verticalGestures);
            totalRequirements++;
        }

        // Check rhythmic movements
        if (requirements.rhythmicMovements) {
            const rhythmicCount = this.countRhythmicMovements();
            score += Math.min(1, rhythmicCount / requirements.rhythmicMovements);
            totalRequirements++;
        }

        // Check flowing gestures
        if (requirements.flowingGestures) {
            const flowingCount = this.countFlowingGestures();
            score += Math.min(1, flowingCount / requirements.flowingGestures);
            totalRequirements++;
        }

        // Check group synchrony
        if (requirements.groupSynchrony) {
            const synchronyScore = this.calculateGroupSynchrony(data);
            score += synchronyScore >= requirements.groupSynchrony ? 1 : synchronyScore / requirements.groupSynchrony;
            totalRequirements++;
        }

        // Check energetic movements
        if (requirements.energeticMovements) {
            const energeticCount = this.countEnergeticMovements();
            score += Math.min(1, energeticCount / requirements.energeticMovements);
            totalRequirements++;
        }

        // Check sharp gestures
        if (requirements.sharpGestures) {
            const sharpCount = this.countSharpGestures();
            score += Math.min(1, sharpCount / requirements.sharpGestures);
            totalRequirements++;
        }

        // Check complex sequences
        if (requirements.complexSequences) {
            const complexCount = this.countComplexSequences();
            score += Math.min(1, complexCount / requirements.complexSequences);
            totalRequirements++;
        }

        // Check musical gestures
        if (requirements.musicalGestures) {
            const musicalCount = this.countMusicalGestures();
            score += Math.min(1, musicalCount / requirements.musicalGestures);
            totalRequirements++;
        }

        // Check harmonic complexity
        if (requirements.harmonicComplexity) {
            const harmonicScore = this.calculateHarmonicComplexity(data);
            score += harmonicScore >= requirements.harmonicComplexity ? 1 : harmonicScore / requirements.harmonicComplexity;
            totalRequirements++;
        }

        // Check structured movement
        if (requirements.structuredMovement) {
            const structuredScore = this.calculateStructuredMovement();
            score += structuredScore >= requirements.structuredMovement ? 1 : structuredScore / requirements.structuredMovement;
            totalRequirements++;
        }

        return totalRequirements > 0 ? score / totalRequirements : 0;
    }

    shouldUnlockEnvironment(envId, discoveryScore) {
        return discoveryScore >= 0.8; // 80% of requirements met
    }

    unlockEnvironment(envId) {
        this.environmentState.unlocked.add(envId);
        const env = this.environments.get(envId);

        console.log(`🔓 Environment unlocked: ${env.name}`);

        // Trigger visual notification
        this.triggerEnvironmentUnlock(env);

        // Automatically transition if it's a natural progression
        if (this.shouldAutoTransition(envId)) {
            this.transitionToEnvironment(envId);
        }
    }

    shouldAutoTransition(envId) {
        // Auto-transition for certain discovery patterns
        const env = this.environments.get(envId);
        const currentTime = Date.now();

        // Auto-transition if current environment has been active for a while
        if (this.discoveryTracking.timeInEnvironment > 120000) { // 2 minutes
            return true;
        }

        // Auto-transition if the discovered environment strongly matches current activity
        const activityMatch = this.calculateActivityEnvironmentMatch(envId);
        return activityMatch > 0.8;
    }

    transitionToEnvironment(envId) {
        if (!this.environmentState.unlocked.has(envId)) return;
        if (this.environmentState.current === envId) return;

        const newEnv = this.environments.get(envId);
        const oldEnv = this.currentEnvironment;

        console.log(`🌍 Transitioning: ${oldEnv?.name} → ${newEnv.name}`);

        // Update state
        this.environmentState.previous = this.environmentState.current;
        this.environmentState.current = envId;
        this.environmentState.transitionProgress = 0;

        // Update environment objects
        if (this.currentEnvironment) {
            this.currentEnvironment.isActive = false;
        }

        this.currentEnvironment = newEnv;
        this.currentEnvironment.isActive = true;
        this.currentEnvironment.lastVisited = Date.now();

        // Increment visitation count
        const count = this.environmentState.visitationCount.get(envId) || 0;
        this.environmentState.visitationCount.set(envId, count + 1);

        // Reset discovery tracking for new environment
        this.discoveryTracking.timeInEnvironment = 0;

        // Start transition
        this.transitionEngine.startTransition(oldEnv, newEnv);

        // Update visual indicators
        this.updateEnvironmentVisuals(newEnv);
    }

    applyEnvironmentAudioProcessing(data) {
        if (!this.currentEnvironment || !this.audioEngine) return;

        const profile = this.currentEnvironment.audioProfile;

        // Apply environment-specific audio characteristics
        this.applyAmbientLayers(profile.ambientLayers, data);
        this.applyMelodicResponse(profile.melodicResponse, data);
        this.applyRhythmicElements(profile.rhythmicElements, data);
        this.applyEffects(profile.effects, data);
        this.applySpatialMapping(profile.spatialMapping, data);
    }

    // Helper functions for movement analysis
    calculateNaturalMovementScore() {
        // Analyze recent gestures for naturalness
        const recentGestures = this.discoveryTracking.gestureSequences.slice(-20);
        const naturalGestures = ['wave', 'reach', 'gentle_sway', 'breathing'];

        const naturalCount = recentGestures.filter(g =>
            naturalGestures.includes(g.type)
        ).length;

        return recentGestures.length > 0 ? naturalCount / recentGestures.length : 0;
    }

    calculateContemplativeTime() {
        // Calculate time spent in low-energy, high-intentionality movement
        const recentEnergy = this.discoveryTracking.energyHistory.slice(-60); // Last minute
        const contemplativeFrames = recentEnergy.filter(e => e.energy < 0.3).length;

        return contemplativeFrames * 100; // Convert to milliseconds
    }

    calculateSlowMovementScore() {
        const recentEnergy = this.discoveryTracking.energyHistory.slice(-30);
        const slowFrames = recentEnergy.filter(e => e.energy < 0.4).length;

        return recentEnergy.length > 0 ? slowFrames / recentEnergy.length : 0;
    }

    countVerticalGestures() {
        const verticalGestures = ['reach_up', 'raising_arms', 'jump', 'stretch'];
        return this.discoveryTracking.gestureSequences.filter(g =>
            verticalGestures.includes(g.type)
        ).length;
    }

    countRhythmicMovements() {
        const rhythmicGestures = ['clap', 'bounce', 'sway', 'dance'];
        return this.discoveryTracking.gestureSequences.filter(g =>
            rhythmicGestures.includes(g.type)
        ).length;
    }

    countFlowingGestures() {
        const flowingGestures = ['wave', 'circle', 'flowing_arms', 'spiral'];
        return this.discoveryTracking.gestureSequences.filter(g =>
            flowingGestures.includes(g.type)
        ).length;
    }

    calculateGroupSynchrony(data) {
        if (!data.bodies || data.bodies.length < 2) return 0;

        // Simplified synchrony calculation
        // In practice, would analyze movement correlation between bodies
        return Math.random() * 0.3 + 0.4; // Placeholder
    }

    countEnergeticMovements() {
        const energeticFrames = this.discoveryTracking.energyHistory.filter(e => e.energy > 0.7).length;
        return energeticFrames;
    }

    countSharpGestures() {
        const sharpGestures = ['sharp_point', 'cut', 'strike', 'angular'];
        return this.discoveryTracking.gestureSequences.filter(g =>
            sharpGestures.includes(g.type)
        ).length;
    }

    countComplexSequences() {
        // Count gesture sequences longer than 3 gestures
        let complexCount = 0;
        let currentSequence = [];

        this.discoveryTracking.gestureSequences.forEach(gesture => {
            if (currentSequence.length === 0 ||
                gesture.timestamp - currentSequence[currentSequence.length - 1].timestamp < 2000) {
                currentSequence.push(gesture);
            } else {
                if (currentSequence.length >= 3) complexCount++;
                currentSequence = [gesture];
            }
        });

        return complexCount;
    }

    countMusicalGestures() {
        const musicalGestures = ['conducting', 'playing', 'rhythm', 'melody'];
        return this.discoveryTracking.gestureSequences.filter(g =>
            musicalGestures.includes(g.type)
        ).length;
    }

    calculateHarmonicComplexity(data) {
        // Analyze harmonic complexity from AI data
        if (data.ai && data.ai.musicalPhrases) {
            const phrases = data.ai.musicalPhrases;
            return phrases.length > 0 ? Math.min(1, phrases.length * 0.2) : 0;
        }
        return 0;
    }

    calculateStructuredMovement() {
        // Analyze movement for structure and intentionality
        const recentGestures = this.discoveryTracking.gestureSequences.slice(-30);
        const structuredGestures = ['conducting', 'precise', 'deliberate', 'measured'];

        const structuredCount = recentGestures.filter(g =>
            structuredGestures.includes(g.type) || g.confidence > 0.8
        ).length;

        return recentGestures.length > 0 ? structuredCount / recentGestures.length : 0;
    }

    // Audio processing application methods
    applyAmbientLayers(layers, data) {
        // Apply environment-specific ambient characteristics
        Object.entries(layers).forEach(([layerName, config]) => {
            if (this.audioEngine.layers.has('ambientEvolution')) {
                const ambientLayer = this.audioEngine.layers.get('ambientEvolution');
                // Configure ambient layer based on environment
                this.configureAmbientLayer(ambientLayer, config, data);
            }
        });
    }

    applyMelodicResponse(melodic, data) {
        if (this.audioEngine.layers.has('melodicSwarms')) {
            const melodicLayer = this.audioEngine.layers.get('melodicSwarms');
            // Configure melodic response based on environment
            this.configureMelodicLayer(melodicLayer, melodic, data);
        }
    }

    applyRhythmicElements(rhythmic, data) {
        if (this.audioEngine.layers.has('rhythmicPulse')) {
            const rhythmicLayer = this.audioEngine.layers.get('rhythmicPulse');
            // Configure rhythmic elements based on environment
            this.configureRhythmicLayer(rhythmicLayer, rhythmic, data);
        }
    }

    applyEffects(effects, data) {
        // Apply environment-specific effects to processors
        Object.entries(effects).forEach(([effectName, config]) => {
            if (this.audioEngine.processors[effectName]) {
                this.configureEffect(this.audioEngine.processors[effectName], config);
            }
        });
    }

    applySpatialMapping(spatial, data) {
        // Apply environment-specific spatial characteristics
        if (this.audioEngine.spatialAudio) {
            this.configureSpatialAudio(this.audioEngine.spatialAudio, spatial, data);
        }
    }

    // Configuration helper methods (simplified)
    configureAmbientLayer(layer, config, data) {
        // Configure ambient layer parameters based on environment config
        // This would modify the layer's audio characteristics
    }

    configureMelodicLayer(layer, config, data) {
        // Configure melodic layer parameters based on environment config
    }

    configureRhythmicLayer(layer, config, data) {
        // Configure rhythmic layer parameters based on environment config
    }

    configureEffect(effect, config) {
        // Configure audio effect parameters
        if (effect.wet && config.wet !== undefined) {
            effect.wet.rampTo(config.wet, 1);
        }
    }

    configureSpatialAudio(spatial, config, data) {
        // Configure spatial audio characteristics
    }

    // Visual indicator methods
    updateVisualIndicators() {
        this.updateEnvironmentVisuals(this.currentEnvironment);
        this.updateDiscoveryHints();
        this.updateTransitionEffects();
    }

    updateEnvironmentVisuals(environment) {
        if (!environment) return;

        this.visualIndicators.currentEnvironmentColor = environment.colors.primary;

        // Broadcast environment change to visual systems
        if (typeof window !== 'undefined' && window.kinectVisualizer) {
            window.kinectVisualizer.setEnvironmentColor(environment.colors);
            window.kinectVisualizer.setEnvironmentName(environment.name);
        }
    }

    updateDiscoveryHints() {
        // Update visual hints for discoverable environments
        this.environments.forEach((env, envId) => {
            if (!this.environmentState.unlocked.has(envId)) {
                const progress = this.environmentState.discoveryProgress.get(envId) || 0;
                if (progress > 0.5) {
                    // Show discovery hint
                    this.showDiscoveryHint(env, progress);
                }
            }
        });
    }

    showDiscoveryHint(environment, progress) {
        // Visual hint that environment is close to being discovered
        const hintIntensity = (progress - 0.5) * 2; // 0-1 range when progress > 0.5

        if (typeof window !== 'undefined' && window.kinectVisualizer) {
            window.kinectVisualizer.showEnvironmentHint(environment.name, hintIntensity);
        }
    }

    updateTransitionEffects() {
        if (this.environmentState.transitionProgress > 0 && this.environmentState.transitionProgress < 1) {
            const progress = this.environmentState.transitionProgress;

            if (typeof window !== 'undefined' && window.kinectVisualizer) {
                window.kinectVisualizer.updateTransitionEffect(progress);
            }
        }
    }

    // Utility methods
    calculateCenterOfMass(bodies) {
        let totalX = 0, totalY = 0, totalZ = 0, count = 0;

        bodies.forEach(body => {
            if (body.joints && body.joints[0]) { // Pelvis
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
        } : { x: 0, y: 0, z: 0 };
    }

    calculateSpatialSpread(bodies) {
        if (bodies.length < 2) return 0;

        const positions = bodies.map(body =>
            body.joints && body.joints[0] ? body.joints[0].position : { x: 0, y: 0, z: 0 }
        );

        let maxDistance = 0;
        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                const distance = Math.sqrt(
                    (positions[i].x - positions[j].x) ** 2 +
                    (positions[i].z - positions[j].z) ** 2
                );
                maxDistance = Math.max(maxDistance, distance);
            }
        }

        return maxDistance;
    }

    calculateMovementPattern(bodies) {
        // Simplified movement calculation
        let totalMovement = 0;
        let count = 0;

        bodies.forEach(body => {
            if (body.joints) {
                Object.values(body.joints).forEach(joint => {
                    if (joint.velocity) {
                        totalMovement += Math.sqrt(
                            joint.velocity.x ** 2 +
                            joint.velocity.y ** 2 +
                            joint.velocity.z ** 2
                        );
                        count++;
                    }
                });
            }
        });

        return count > 0 ? totalMovement / count : 0;
    }

    calculateActivityEnvironmentMatch(envId) {
        const env = this.environments.get(envId);
        if (!env) return 0;

        // Calculate how well current activity matches environment characteristics
        const recentEnergy = this.discoveryTracking.energyHistory.slice(-10);
        const avgEnergy = recentEnergy.reduce((sum, e) => sum + e.energy, 0) / recentEnergy.length;

        const energyMatch = 1 - Math.abs(avgEnergy - env.characteristics.energy);

        // Add other characteristic matches here

        return energyMatch;
    }

    triggerEnvironmentUnlock(environment) {
        // Visual and audio feedback for environment unlock
        console.log(`🎉 ${environment.name} environment discovered!`);

        if (typeof window !== 'undefined' && window.kinectVisualizer) {
            window.kinectVisualizer.triggerEnvironmentUnlock(environment);
        }
    }

    // Public API
    getCurrentEnvironment() {
        return {
            id: this.environmentState.current,
            name: this.currentEnvironment?.name || 'None',
            description: this.currentEnvironment?.description || '',
            characteristics: this.currentEnvironment?.characteristics || {},
            colors: this.currentEnvironment?.colors || {},
            isTransitioning: this.environmentState.transitionProgress > 0 && this.environmentState.transitionProgress < 1
        };
    }

    getUnlockedEnvironments() {
        return Array.from(this.environmentState.unlocked).map(envId => {
            const env = this.environments.get(envId);
            return {
                id: envId,
                name: env.name,
                description: env.description,
                visitCount: this.environmentState.visitationCount.get(envId) || 0
            };
        });
    }

    getDiscoveryProgress() {
        const progress = {};
        this.environments.forEach((env, envId) => {
            if (!this.environmentState.unlocked.has(envId)) {
                progress[envId] = {
                    name: env.name,
                    progress: this.environmentState.discoveryProgress.get(envId) || 0,
                    requirements: env.unlockRequirements
                };
            }
        });
        return progress;
    }

    manualTransition(envId) {
        if (this.environmentState.unlocked.has(envId)) {
            this.transitionToEnvironment(envId);
            return true;
        }
        return false;
    }

    getStatus() {
        return {
            currentEnvironment: this.getCurrentEnvironment(),
            unlockedCount: this.environmentState.unlocked.size,
            totalEnvironments: this.environments.size,
            discoveryProgress: this.getDiscoveryProgress(),
            timeInCurrentEnvironment: this.discoveryTracking.timeInEnvironment
        };
    }
}

class EnvironmentDiscoveryEngine {
    // Handles the logic for discovering new environments
    constructor() {
        console.log('🔍 Environment Discovery Engine initialized');
    }
}

class EnvironmentTransitionEngine {
    // Handles smooth transitions between environments
    constructor() {
        this.transitionDuration = 5000; // 5 seconds
        this.currentTransition = null;
        console.log('🌊 Environment Transition Engine initialized');
    }

    startTransition(fromEnv, toEnv) {
        this.currentTransition = {
            from: fromEnv,
            to: toEnv,
            startTime: Date.now(),
            progress: 0
        };

        console.log(`🌊 Starting transition: ${fromEnv?.name || 'None'} → ${toEnv.name}`);

        // Animate transition
        this.animateTransition();
    }

    animateTransition() {
        if (!this.currentTransition) return;

        const elapsed = Date.now() - this.currentTransition.startTime;
        const progress = Math.min(1, elapsed / this.transitionDuration);

        this.currentTransition.progress = progress;

        // Apply transition effects
        this.applyTransitionEffects(progress);

        if (progress < 1) {
            requestAnimationFrame(() => this.animateTransition());
        } else {
            this.completeTransition();
        }
    }

    applyTransitionEffects(progress) {
        // Apply audio crossfading and visual transition effects
        // This would smoothly blend between environment characteristics
    }

    completeTransition() {
        console.log(`🌊 Transition complete: ${this.currentTransition.to.name}`);
        this.currentTransition = null;
    }
}

// Create alias for module registration
const SoundEnvironmentManager = SonicEnvironmentManager;

// Export for integration
window.SonicEnvironmentManager = SonicEnvironmentManager;
window.SoundEnvironmentManager = SoundEnvironmentManager;