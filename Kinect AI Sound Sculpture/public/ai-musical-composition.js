// AI-driven musical composition and narrative systems

class AudioNarrativeEngine {
    constructor() {
        this.scenes = new Map();
        this.currentScene = null;
        this.sceneHistory = [];
        this.transitionEngine = new SceneTransitionEngine();

        // Narrative state
        this.narrativeState = {
            act: 1,
            tension: 0,
            emotional_arc: 'rising',
            visitor_engagement: 0,
            time_in_scene: 0,
            total_session_time: 0
        };

        // Story arcs
        this.storyArcs = {
            discovery: {
                scenes: ['awakening', 'exploration', 'wonder', 'understanding'],
                emotional_journey: [0.2, 0.6, 0.8, 0.5],
                typical_duration: 180000 // 3 minutes
            },
            collaboration: {
                scenes: ['individual', 'awareness', 'communion', 'harmony'],
                emotional_journey: [0.3, 0.5, 0.8, 0.9],
                typical_duration: 240000 // 4 minutes
            },
            transcendence: {
                scenes: ['grounding', 'lifting', 'soaring', 'integration'],
                emotional_journey: [0.4, 0.7, 1.0, 0.6],
                typical_duration: 300000 // 5 minutes
            }
        };

        this.currentArc = null;
        this.arcProgress = 0;

        console.log('📖 Audio Narrative Engine initialized');
    }

    defineScenes(sceneDefinitions) {
        sceneDefinitions.forEach(sceneDef => {
            this.scenes.set(sceneDef.name, {
                ...sceneDef,
                entryConditions: sceneDef.triggers || [],
                exitConditions: [],
                audioCharacteristics: {
                    tension: sceneDef.characteristics.tension,
                    energy: sceneDef.characteristics.energy,
                    complexity: sceneDef.characteristics.complexity,
                    harmonic_density: sceneDef.characteristics.complexity * 0.8,
                    rhythmic_activity: sceneDef.characteristics.energy * 0.9,
                    spatial_width: 0.5 + (sceneDef.characteristics.complexity * 0.5)
                }
            });
        });

        // Set initial scene
        this.currentScene = this.scenes.get('awakening');
        this.narrativeState.time_in_scene = Date.now();

        console.log(`📖 Defined ${this.scenes.size} narrative scenes`);
    }

    updateNarrative(movementFeatures) {
        this.narrativeState.total_session_time = Date.now() - (this.narrativeState.session_start || Date.now());
        this.narrativeState.time_in_scene = Date.now() - (this.currentScene?.entry_time || Date.now());

        // Analyze movement for narrative cues
        const narrativeCues = this.analyzeNarrativeCues(movementFeatures);

        // Update emotional arc
        this.updateEmotionalArc(narrativeCues);

        // Check for scene transitions
        this.checkSceneTransitions(narrativeCues);

        // Update story arc progress
        this.updateStoryArc(narrativeCues);

        // Evolve current scene
        this.evolveCurrentScene(narrativeCues);
    }

    analyzeNarrativeCues(features) {
        return {
            visitor_count: features.bodyCount,
            movement_intensity: features.totalEnergy,
            gesture_variety: features.gestures?.length || 0,
            spatial_expansion: features.spatialDistribution?.width || 0,
            musical_engagement: features.musicalPhrases?.length || 0,
            social_interaction: this.detectSocialInteraction(features),
            creative_expression: this.detectCreativeExpression(features),
            contemplative_state: this.detectContemplativeState(features)
        };
    }

    detectSocialInteraction(features) {
        if (features.bodyCount < 2) return 0;

        // Analyze proximity and synchronized movement
        const proximity = this.calculateProximity(features);
        const synchronization = this.calculateSynchronization(features);

        return Math.min(1, (proximity + synchronization) / 2);
    }

    detectCreativeExpression(features) {
        const gestureVariety = (features.gestures?.length || 0) / 10; // Normalize
        const musicalEngagement = (features.musicalPhrases?.length || 0) / 5;
        const complexMovement = features.enhancedMetrics?.complexity || 0;

        return Math.min(1, (gestureVariety + musicalEngagement + complexMovement) / 3);
    }

    detectContemplativeState(features) {
        const lowEnergy = 1 - Math.min(1, features.totalEnergy);
        const steadyMovement = features.enhancedMetrics?.intentionality || 0;
        const sustainedPresence = Math.min(1, this.narrativeState.time_in_scene / 30000); // 30 seconds

        return Math.min(1, (lowEnergy + steadyMovement + sustainedPresence) / 3);
    }

    updateEmotionalArc(cues) {
        const currentTension = this.narrativeState.tension;
        let targetTension = currentTension;

        // Increase tension with activity and complexity
        if (cues.movement_intensity > 0.7 || cues.social_interaction > 0.8) {
            targetTension = Math.min(1, currentTension + 0.1);
        }

        // Decrease tension with contemplative states
        if (cues.contemplative_state > 0.7) {
            targetTension = Math.max(0, currentTension - 0.05);
        }

        // Smooth tension changes
        this.narrativeState.tension += (targetTension - currentTension) * 0.1;

        // Update emotional arc direction
        if (this.narrativeState.tension > 0.8) {
            this.narrativeState.emotional_arc = 'climax';
        } else if (this.narrativeState.tension > 0.6) {
            this.narrativeState.emotional_arc = 'rising';
        } else if (this.narrativeState.tension < 0.3) {
            this.narrativeState.emotional_arc = 'falling';
        } else {
            this.narrativeState.emotional_arc = 'stable';
        }
    }

    checkSceneTransitions(cues) {
        if (!this.currentScene) return;

        const timeInScene = this.narrativeState.time_in_scene;
        const minSceneTime = 15000; // Minimum 15 seconds per scene

        if (timeInScene < minSceneTime) return;

        // Check exit conditions for current scene
        let shouldTransition = false;
        let targetScene = null;

        // Time-based transitions
        if (timeInScene > this.currentScene.duration) {
            shouldTransition = true;
            targetScene = this.selectNextSceneByArc();
        }

        // Event-based transitions
        if (this.currentScene.name === 'awakening' && cues.movement_intensity > 0.5) {
            targetScene = 'exploration';
            shouldTransition = true;
        }

        if (this.currentScene.name === 'exploration' && cues.social_interaction > 0.7) {
            targetScene = 'communion';
            shouldTransition = true;
        }

        if (this.currentScene.name === 'communion' && cues.creative_expression > 0.8) {
            targetScene = 'transcendence';
            shouldTransition = true;
        }

        if (this.currentScene.name === 'transcendence' && cues.contemplative_state > 0.6) {
            targetScene = 'resolution';
            shouldTransition = true;
        }

        // Perform transition
        if (shouldTransition && targetScene) {
            this.transitionToScene(targetScene);
        }
    }

    transitionToScene(sceneName) {
        const newScene = this.scenes.get(sceneName);
        if (!newScene) return;

        console.log(`📖 Scene transition: ${this.currentScene?.name} → ${sceneName}`);

        // Record scene history
        if (this.currentScene) {
            this.sceneHistory.push({
                scene: this.currentScene.name,
                duration: this.narrativeState.time_in_scene,
                exit_reason: 'transition',
                timestamp: Date.now()
            });
        }

        // Transition to new scene
        this.currentScene = newScene;
        this.currentScene.entry_time = Date.now();
        this.narrativeState.time_in_scene = 0;

        // Trigger transition effects
        this.transitionEngine.executeTransition(this.currentScene, newScene);
    }

    selectNextSceneByArc() {
        if (!this.currentArc) {
            this.selectStoryArc();
        }

        const arc = this.storyArcs[this.currentArc];
        const currentIndex = arc.scenes.indexOf(this.currentScene?.name);
        const nextIndex = Math.min(currentIndex + 1, arc.scenes.length - 1);

        return arc.scenes[nextIndex];
    }

    selectStoryArc() {
        // Select story arc based on visitor behavior
        const sessionTime = this.narrativeState.total_session_time;
        const visitorCount = this.narrativeState.visitor_engagement;

        if (visitorCount > 3) {
            this.currentArc = 'collaboration';
        } else if (sessionTime > 240000) { // 4+ minutes
            this.currentArc = 'transcendence';
        } else {
            this.currentArc = 'discovery';
        }

        console.log(`📖 Selected story arc: ${this.currentArc}`);
    }

    evolveCurrentScene(cues) {
        if (!this.currentScene) return;

        // Evolve scene characteristics based on real-time cues
        const characteristics = this.currentScene.audioCharacteristics;

        // Adapt tension to movement
        characteristics.tension += (cues.movement_intensity - characteristics.tension) * 0.05;

        // Adapt energy to activity
        characteristics.energy += (cues.movement_intensity - characteristics.energy) * 0.1;

        // Adapt complexity to creative expression
        characteristics.complexity += (cues.creative_expression - characteristics.complexity) * 0.03;

        // Update derived characteristics
        characteristics.harmonic_density = characteristics.complexity * 0.8;
        characteristics.rhythmic_activity = characteristics.energy * 0.9;
        characteristics.spatial_width = 0.5 + (characteristics.complexity * 0.5);
    }

    begin() {
        this.narrativeState.session_start = Date.now();
        this.currentScene = this.scenes.get('awakening');
        if (this.currentScene) {
            this.currentScene.entry_time = Date.now();
        }
        console.log('📖 Narrative began');
    }

    getCurrentScene() {
        return {
            currentScene: this.currentScene?.name || 'none',
            characteristics: this.currentScene?.audioCharacteristics || {},
            narrativeState: this.narrativeState,
            storyArc: this.currentArc,
            arcProgress: this.arcProgress
        };
    }
}

class HarmonicIntelligenceEngine {
    constructor() {
        this.harmonicSystems = new Map();
        this.currentSystem = 'western_tonal';
        this.voiceLeading = new AIVoiceLeading();
        this.adaptiveTuning = new AdaptiveTuningSystem();

        // Musical knowledge base
        this.musicalKnowledge = {
            scales: new Map(),
            chordProgressions: new Map(),
            voiceLeadingRules: [],
            culturalModes: new Map(),
            microtonal_systems: new Map()
        };

        // AI composition parameters
        this.compositionAI = {
            creativity: 0.6,
            complexity: 0.7,
            smoothness: 0.8,
            cultural_sensitivity: 0.9
        };

        // Real-time harmonic state
        this.harmonicState = {
            current_key: 'C',
            current_mode: 'major',
            chord_progression: [],
            voice_positions: { soprano: 0, alto: 0, tenor: 0, bass: 0 },
            tension_curve: [],
            harmonic_rhythm: 'moderate'
        };

        this.initializeMusicalKnowledge();
        console.log('🧠 Harmonic Intelligence Engine initialized');
    }

    initializeMusicalKnowledge() {
        // Western tonal scales
        this.musicalKnowledge.scales.set('major', [0, 2, 4, 5, 7, 9, 11]);
        this.musicalKnowledge.scales.set('minor', [0, 2, 3, 5, 7, 8, 10]);
        this.musicalKnowledge.scales.set('dorian', [0, 2, 3, 5, 7, 9, 10]);
        this.musicalKnowledge.scales.set('pentatonic', [0, 2, 4, 7, 9]);
        this.musicalKnowledge.scales.set('whole_tone', [0, 2, 4, 6, 8, 10]);

        // Chord progressions
        this.musicalKnowledge.chordProgressions.set('classical', [
            [1, 4, 5, 1], // I-IV-V-I
            [1, 6, 4, 5], // I-vi-IV-V
            [1, 5, 6, 4], // I-V-vi-IV
            [6, 4, 1, 5]  // vi-IV-I-V
        ]);

        this.musicalKnowledge.chordProgressions.set('modal', [
            [1, 7, 3, 1], // Modal progression
            [1, 2, 7, 1], // Dorian feel
            [1, 6, 7, 1]  // Natural minor
        ]);

        // Cultural modes
        this.musicalKnowledge.culturalModes.set('raga_major', [0, 2, 4, 5, 7, 9, 11]);
        this.musicalKnowledge.culturalModes.set('maqam_hijaz', [0, 1, 4, 5, 7, 8, 11]);
        this.musicalKnowledge.culturalModes.set('gamelan_slendro', [0, 2.4, 4.8, 7.2, 9.6]);

        console.log('🎵 Musical knowledge base loaded');
    }

    loadHarmonicSystems(systems) {
        systems.forEach(system => {
            switch (system) {
                case 'western_tonal':
                    this.harmonicSystems.set(system, new WesternTonalSystem());
                    break;
                case 'modal_interchange':
                    this.harmonicSystems.set(system, new ModalInterchangeSystem());
                    break;
                case 'microtonal_scales':
                    this.harmonicSystems.set(system, new MicrotonalSystem());
                    break;
                case 'spectral_harmony':
                    this.harmonicSystems.set(system, new SpectralHarmonySystem());
                    break;
                case 'adaptive_tuning':
                    this.harmonicSystems.set(system, new AdaptiveTuningSystem());
                    break;
                case 'cultural_modes':
                    this.harmonicSystems.set(system, new CulturalModesSystem());
                    break;
            }
        });

        console.log(`🧠 Loaded ${systems.length} harmonic systems`);
    }

    enableAIVoiceLeading(params) {
        this.voiceLeading.configure(params);
        this.compositionAI = { ...this.compositionAI, ...params };
        console.log('🧠 AI voice leading enabled');
    }

    generateHarmony(movementFeatures, emotionalState) {
        // Select appropriate harmonic system based on context
        const harmonicSystem = this.selectHarmonicSystem(movementFeatures, emotionalState);

        // Generate chord progression
        const progression = this.generateChordProgression(movementFeatures, emotionalState);

        // Apply voice leading
        const voicing = this.voiceLeading.generateVoicing(progression, this.harmonicState);

        // Generate scale for melodic content
        const scale = this.generateScale(emotionalState);

        // Calculate harmonic tension
        const tension = this.calculateHarmonicTension(progression, this.harmonicState);

        return {
            system: harmonicSystem,
            progression: progression,
            voicing: voicing,
            scale: scale,
            tension: tension,
            complexity: this.calculateHarmonicComplexity(progression, voicing),
            timestamp: Date.now()
        };
    }

    selectHarmonicSystem(features, emotion) {
        // AI-driven system selection based on context
        if (features.enhancedMetrics?.creativity > 0.8) {
            return 'microtonal_scales';
        }

        if (features.bodyCount > 4) {
            return 'cultural_modes';
        }

        if (emotion.primary === 'contemplation') {
            return 'modal_interchange';
        }

        if (features.enhancedMetrics?.complexity > 0.7) {
            return 'spectral_harmony';
        }

        return 'western_tonal';
    }

    generateChordProgression(features, emotion) {
        const currentSystem = this.harmonicSystems.get(this.currentSystem);
        const progressionType = this.selectProgressionType(emotion);

        // Get base progression
        const baseProgression = this.musicalKnowledge.chordProgressions.get(progressionType)[0];

        // Apply AI modifications based on movement features
        const modifiedProgression = this.applyAIModifications(baseProgression, features);

        // Update harmonic state
        this.harmonicState.chord_progression = modifiedProgression;

        return modifiedProgression;
    }

    selectProgressionType(emotion) {
        const emotionMap = {
            wonder: 'modal',
            joy: 'classical',
            contemplation: 'modal',
            excitement: 'classical',
            serenity: 'modal'
        };

        return emotionMap[emotion.primary] || 'classical';
    }

    applyAIModifications(progression, features) {
        let modified = [...progression];

        // Add complexity based on creative expression
        if (features.enhancedMetrics?.creativity > 0.7) {
            modified = this.addHarmonicComplexity(modified);
        }

        // Add substitutions based on movement variety
        if (features.gestures?.length > 5) {
            modified = this.addChordSubstitutions(modified);
        }

        // Add extensions based on energy level
        if (features.totalEnergy > 0.6) {
            modified = this.addChordExtensions(modified);
        }

        return modified;
    }

    addHarmonicComplexity(progression) {
        // Add secondary dominants and chromatic harmony
        return progression.map(chord => {
            if (Math.random() < this.compositionAI.creativity * 0.3) {
                return this.addChromaticHarmony(chord);
            }
            return chord;
        });
    }

    addChordSubstitutions(progression) {
        // Tritone substitutions and other jazz harmonies
        return progression.map(chord => {
            if (Math.random() < this.compositionAI.complexity * 0.2) {
                return this.applyTritoneSubstitution(chord);
            }
            return chord;
        });
    }

    addChordExtensions(progression) {
        // Add 7ths, 9ths, 11ths, 13ths
        return progression.map(chord => {
            const extensions = [];
            if (Math.random() < 0.7) extensions.push(7);
            if (Math.random() < 0.4) extensions.push(9);
            if (Math.random() < 0.2) extensions.push(11);

            return { root: chord, extensions: extensions };
        });
    }

    generateScale(emotion) {
        const scaleMap = {
            wonder: 'major',
            joy: 'pentatonic',
            contemplation: 'dorian',
            excitement: 'whole_tone',
            serenity: 'pentatonic'
        };

        const scaleName = scaleMap[emotion.primary] || 'major';
        return this.musicalKnowledge.scales.get(scaleName);
    }

    calculateHarmonicTension(progression, state) {
        let tension = 0;

        progression.forEach((chord, index) => {
            // Distance from tonic
            const distance = Math.abs(chord - 1);
            tension += distance * 0.1;

            // Voice leading smoothness
            if (index > 0) {
                const leap = Math.abs(chord - progression[index - 1]);
                tension += leap * 0.05;
            }
        });

        return Math.min(1, tension);
    }

    calculateHarmonicComplexity(progression, voicing) {
        let complexity = 0;

        // Chord diversity
        const uniqueChords = new Set(progression).size;
        complexity += uniqueChords * 0.1;

        // Voice leading complexity
        if (voicing && voicing.movements) {
            const avgMovement = voicing.movements.reduce((sum, mov) => sum + Math.abs(mov), 0) / voicing.movements.length;
            complexity += avgMovement * 0.05;
        }

        // Harmonic rhythm
        complexity += progression.length * 0.05;

        return Math.min(1, complexity);
    }

    // Placeholder methods for harmony techniques
    addChromaticHarmony(chord) {
        // Add chromatic approach or passing harmony
        return chord + (Math.random() > 0.5 ? 0.5 : -0.5);
    }

    applyTritoneSubstitution(chord) {
        // Tritone substitution (replace V with bII)
        if (chord === 5) return 2; // V → bII
        return chord;
    }
}

// Placeholder classes for harmonic systems
class AIVoiceLeading {
    configure(params) {
        this.params = params;
    }

    generateVoicing(progression, state) {
        return {
            soprano: progression.map(chord => chord + 12),
            alto: progression.map(chord => chord + 9),
            tenor: progression.map(chord => chord + 5),
            bass: progression.map(chord => chord),
            movements: progression.map(() => Math.random() * 4 - 2)
        };
    }
}

class WesternTonalSystem {}
class ModalInterchangeSystem {}
class MicrotonalSystem {}
class SpectralHarmonySystem {}
class AdaptiveTuningSystem {}
class CulturalModesSystem {}

class SceneTransitionEngine {
    executeTransition(fromScene, toScene) {
        console.log(`🎬 Executing transition: ${fromScene?.name} → ${toScene?.name}`);
        // Would implement smooth audio transitions between scenes
    }
}

// Export for integration
window.AudioNarrativeEngine = AudioNarrativeEngine;
window.HarmonicIntelligenceEngine = HarmonicIntelligenceEngine;