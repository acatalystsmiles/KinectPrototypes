// Advanced spatial audio layer implementations

class SpatialAudioLayers {
    constructor({ config, dependencies, eventBus, globalEventBus, moduleManager }) {
        this.config = config || {};
        this.dependencies = dependencies || {};
        this.eventBus = eventBus;
        this.globalEventBus = globalEventBus;
        this.moduleManager = moduleManager;

        this.maxLayers = config.maxLayers || 8;
        this.layers = new Map();
        this.isInitialized = false;
    }

    async initialize() {
        console.log('🔊 Initializing Spatial Audio Layers...');
        this.isInitialized = true;
        console.log('✅ Spatial Audio Layers initialized');
    }

    processMovementData(data) {
        // Process movement data for spatial audio
    }

    async cleanup() {
        this.layers.clear();
        this.isInitialized = false;
    }

    getStatus() {
        return {
            initialized: this.isInitialized,
            layerCount: this.layers.size,
            maxLayers: this.maxLayers
        };
    }
}

class EvolvingAmbientLayer {
    constructor(destination) {
        this.destination = destination;
        this.isActive = true;
        this.isInitialized = false;

        // Ambient evolution parameters
        this.evolution = {
            phase: 0,
            rate: 0.0001, // Very slow evolution
            complexity: 0.3,
            density: 0.5,
            warmth: 0.7
        };

        // Multiple ambient sources for richness
        this.sources = {
            drones: [],
            textures: [],
            harmonics: [],
            naturalistic: []
        };

        // Spatial positioning for ambient sources
        this.spatialPositions = [];

        // Environmental adaptation
        this.environment = {
            timeOfDay: 'day',
            visitorDensity: 0,
            energyLevel: 0,
            seasonalInfluence: 0
        };
    }

    async initialize() {
        try {
            // Create multiple drone sources with different characteristics
            this.createDroneSources();

            // Create evolving texture generators
            this.createTextureGenerators();

            // Create harmonic field generators
            this.createHarmonicGenerators();

            // Create naturalistic ambient sources
            this.createNaturalisticSources();

            // Setup evolution automation
            this.setupEvolutionSystem();

            this.isInitialized = true;
            console.log('🌊 Evolving Ambient Layer initialized');

        } catch (error) {
            console.error('❌ Failed to initialize Evolving Ambient Layer:', error);
            throw error;
        }
    }

    createDroneSources() {
        // Deep fundamental drone
        const fundamentalDrone = {
            oscillator: new Tone.Oscillator({
                frequency: 55, // A1
                type: 'sine'
            }),
            filter: new Tone.Filter({
                frequency: 200,
                type: 'lowpass',
                rolloff: -24
            }),
            gain: new Tone.Gain(0.3),
            lfo: new Tone.LFO({
                frequency: 0.01,
                type: 'sine'
            })
        };

        // Connect fundamental drone
        fundamentalDrone.oscillator
            .connect(fundamentalDrone.filter)
            .connect(fundamentalDrone.gain);

        fundamentalDrone.lfo.connect(fundamentalDrone.oscillator.frequency);

        this.sources.drones.push(fundamentalDrone);

        // Harmonic drone layer
        const harmonicDrone = {
            oscillators: [
                new Tone.Oscillator({ frequency: 110, type: 'sine' }), // A2
                new Tone.Oscillator({ frequency: 165, type: 'sine' }), // E3
                new Tone.Oscillator({ frequency: 220, type: 'sine' })  // A3
            ],
            mixer: new Tone.Gain(0.2),
            filter: new Tone.Filter({
                frequency: 800,
                type: 'lowpass'
            }),
            reverb: new Tone.Reverb({
                decay: 8,
                room: 0.8
            })
        };

        // Connect harmonic drones
        harmonicDrone.oscillators.forEach(osc => {
            osc.connect(harmonicDrone.mixer);
        });

        harmonicDrone.mixer
            .connect(harmonicDrone.filter)
            .connect(harmonicDrone.reverb);

        this.sources.drones.push(harmonicDrone);
    }

    createTextureGenerators() {
        // Granular texture generator
        const granularTexture = {
            player: new Tone.Player('./audio/textures/ambient_grain.wav'), // Would load actual texture
            granular: new Tone.GrainPlayer('./audio/textures/ambient_grain.wav'),
            filter: new Tone.Filter({
                frequency: 1000,
                type: 'bandpass',
                Q: 0.5
            }),
            delay: new Tone.FeedbackDelay({
                delayTime: '8n.',
                feedback: 0.3
            }),
            gain: new Tone.Gain(0.4)
        };

        // Connect granular texture
        granularTexture.granular
            .connect(granularTexture.filter)
            .connect(granularTexture.delay)
            .connect(granularTexture.gain);

        this.sources.textures.push(granularTexture);

        // Spectral texture generator
        const spectralTexture = {
            noise: new Tone.Noise('pink'),
            filters: [
                new Tone.Filter({ frequency: 200, type: 'bandpass', Q: 10 }),
                new Tone.Filter({ frequency: 400, type: 'bandpass', Q: 8 }),
                new Tone.Filter({ frequency: 800, type: 'bandpass', Q: 6 }),
                new Tone.Filter({ frequency: 1600, type: 'bandpass', Q: 4 })
            ],
            lfos: [],
            mixer: new Tone.Gain(0.3)
        };

        // Create LFOs for each filter
        spectralTexture.filters.forEach((filter, index) => {
            const lfo = new Tone.LFO({
                frequency: 0.05 + (index * 0.01),
                type: 'sine'
            });
            lfo.connect(filter.frequency);
            spectralTexture.lfos.push(lfo);

            spectralTexture.noise.connect(filter);
            filter.connect(spectralTexture.mixer);
        });

        this.sources.textures.push(spectralTexture);
    }

    createHarmonicGenerators() {
        // Harmonic series generator
        const harmonicSeries = {
            fundamental: 110, // A2
            partials: [],
            mixer: new Tone.Gain(0.25),
            modulation: {
                amplitude: new Tone.LFO(0.03, 0, 1),
                frequency: new Tone.LFO(0.02, 0.95, 1.05)
            }
        };

        // Generate harmonic partials
        for (let i = 1; i <= 8; i++) {
            const partial = {
                oscillator: new Tone.Oscillator({
                    frequency: harmonicSeries.fundamental * i,
                    type: 'sine'
                }),
                gain: new Tone.Gain(1 / (i * i)), // Natural harmonic rolloff
                pan: new Tone.Panner((Math.random() - 0.5) * 0.5) // Slight stereo spread
            };

            // Connect modulation
            harmonicSeries.modulation.amplitude.connect(partial.gain.gain);
            harmonicSeries.modulation.frequency.connect(partial.oscillator.frequency);

            partial.oscillator
                .connect(partial.gain)
                .connect(partial.pan)
                .connect(harmonicSeries.mixer);

            harmonicSeries.partials.push(partial);
        }

        this.sources.harmonics.push(harmonicSeries);
    }

    createNaturalisticSources() {
        // Breathing-like ambient source
        const breathingSource = {
            oscillator: new Tone.Oscillator({
                frequency: 80,
                type: 'triangle'
            }),
            envelope: new Tone.AmplitudeEnvelope({
                attack: 4,
                decay: 0,
                sustain: 1,
                release: 4
            }),
            lfo: new Tone.LFO({
                frequency: 0.05, // ~3 breaths per minute
                type: 'sine'
            }),
            filter: new Tone.Filter({
                frequency: 300,
                type: 'lowpass'
            }),
            gain: new Tone.Gain(0.2)
        };

        // Connect breathing source
        breathingSource.oscillator
            .connect(breathingSource.envelope)
            .connect(breathingSource.filter)
            .connect(breathingSource.gain);

        breathingSource.lfo.connect(breathingSource.envelope.gate);

        this.sources.naturalistic.push(breathingSource);

        // Heartbeat-like pulse
        const heartbeatSource = {
            oscillator: new Tone.Oscillator({
                frequency: 60,
                type: 'sine'
            }),
            pulse: new Tone.LFO({
                frequency: 1.2, // 72 BPM
                type: 'square'
            }),
            gain: new Tone.Gain(0.15),
            filter: new Tone.Filter({
                frequency: 120,
                type: 'lowpass'
            })
        };

        heartbeatSource.oscillator
            .connect(heartbeatSource.filter)
            .connect(heartbeatSource.gain);

        heartbeatSource.pulse.connect(heartbeatSource.gain.gain);

        this.sources.naturalistic.push(heartbeatSource);
    }

    setupEvolutionSystem() {
        // Main evolution loop
        this.evolutionLoop = () => {
            if (!this.isActive) return;

            this.evolution.phase += this.evolution.rate;

            // Update ambient characteristics based on evolution phase
            this.updateAmbientCharacteristics();

            // Update spatial positioning
            this.updateSpatialDistribution();

            // Schedule next evolution step
            setTimeout(this.evolutionLoop, 100); // 10Hz evolution rate
        };

        // Start evolution
        this.evolutionLoop();
    }

    updateAmbientCharacteristics() {
        const phase = this.evolution.phase;

        // Calculate evolving parameters
        const complexity = 0.3 + (Math.sin(phase * 2) * 0.2);
        const density = 0.5 + (Math.sin(phase * 1.5) * 0.3);
        const warmth = 0.7 + (Math.sin(phase * 0.8) * 0.2);

        // Update drone characteristics
        this.sources.drones.forEach((drone, index) => {
            if (drone.oscillator) {
                const freqModulation = 1 + (Math.sin(phase * (1 + index * 0.1)) * 0.02);
                drone.oscillator.frequency.rampTo(
                    drone.oscillator.frequency.value * freqModulation,
                    2
                );
            }
        });

        // Update texture characteristics
        this.sources.textures.forEach(texture => {
            if (texture.filter) {
                const cutoffModulation = 1 + (Math.sin(phase * 3) * 0.3);
                texture.filter.frequency.rampTo(
                    texture.filter.frequency.value * cutoffModulation,
                    1
                );
            }
        });

        // Store evolution state
        this.evolution.complexity = complexity;
        this.evolution.density = density;
        this.evolution.warmth = warmth;
    }

    updateSpatialDistribution() {
        // Update spatial positions of ambient sources (would integrate with spatial audio)
        this.spatialPositions.forEach((position, index) => {
            const phase = this.evolution.phase + (index * Math.PI / 4);
            position.x = Math.sin(phase * 0.5) * 2;
            position.z = Math.cos(phase * 0.3) * 2;
            position.y = 1.5 + (Math.sin(phase * 1.2) * 0.5);
        });
    }

    processMovement(features, context) {
        if (!this.isActive || !this.isInitialized) return;

        // Adapt to visitor presence and energy
        this.adaptToMovement(features);

        // Respond to narrative context
        this.adaptToNarrative(context.narrative);

        // Respond to emotional context
        this.adaptToEmotion(context.emotion);
    }

    adaptToMovement(features) {
        const energyLevel = features.totalEnergy || 0;
        const bodyCount = features.bodyCount || 0;

        // Increase ambient complexity with more visitors
        this.environment.visitorDensity = bodyCount / 6; // Normalize to max 6 visitors

        // Increase ambient activity with movement energy
        this.environment.energyLevel = Math.min(energyLevel, 1);

        // Adapt evolution rate based on activity
        this.evolution.rate = 0.0001 + (energyLevel * 0.0002);

        // Adapt ambient volume based on activity
        const targetVolume = 0.3 + (energyLevel * 0.4);
        this.sources.drones.forEach(drone => {
            if (drone.gain) {
                drone.gain.gain.rampTo(targetVolume, 2);
            }
        });
    }

    adaptToNarrative(narrative) {
        if (!narrative) return;

        const scene = narrative.currentScene;
        const characteristics = narrative.characteristics || {};

        // Adapt ambient to narrative scene
        switch (scene) {
            case 'awakening':
                this.setAmbientMood('gentle', 0.2);
                break;
            case 'exploration':
                this.setAmbientMood('curious', 0.5);
                break;
            case 'communion':
                this.setAmbientMood('rich', 0.7);
                break;
            case 'transcendence':
                this.setAmbientMood('expansive', 0.9);
                break;
            case 'resolution':
                this.setAmbientMood('peaceful', 0.3);
                break;
        }
    }

    adaptToEmotion(emotion) {
        if (!emotion) return;

        const primary = emotion.primary;

        // Emotional ambient adaptation
        switch (primary) {
            case 'wonder':
                this.adjustAmbientColor('bright', 0.8);
                break;
            case 'joy':
                this.adjustAmbientColor('warm', 0.7);
                break;
            case 'contemplation':
                this.adjustAmbientColor('deep', 0.9);
                break;
            case 'excitement':
                this.adjustAmbientColor('energetic', 0.6);
                break;
            case 'serenity':
                this.adjustAmbientColor('pure', 0.8);
                break;
        }
    }

    setAmbientMood(mood, intensity) {
        const moodSettings = {
            gentle: { complexity: 0.2, density: 0.3, warmth: 0.8 },
            curious: { complexity: 0.5, density: 0.6, warmth: 0.6 },
            rich: { complexity: 0.8, density: 0.8, warmth: 0.7 },
            expansive: { complexity: 0.9, density: 0.9, warmth: 0.8 },
            peaceful: { complexity: 0.3, density: 0.4, warmth: 0.9 }
        };

        const settings = moodSettings[mood] || moodSettings.gentle;

        // Apply mood to evolution parameters
        this.evolution.complexity = settings.complexity * intensity;
        this.evolution.density = settings.density * intensity;
        this.evolution.warmth = settings.warmth;
    }

    adjustAmbientColor(color, intensity) {
        // Adjust harmonic content based on emotional color
        this.sources.harmonics.forEach(harmonic => {
            harmonic.partials.forEach((partial, index) => {
                let gainMultiplier = 1;

                switch (color) {
                    case 'bright':
                        gainMultiplier = index > 4 ? 1.5 : 0.8; // Emphasize higher harmonics
                        break;
                    case 'warm':
                        gainMultiplier = index < 3 ? 1.3 : 0.7; // Emphasize lower harmonics
                        break;
                    case 'deep':
                        gainMultiplier = index < 2 ? 2.0 : 0.5; // Strong fundamentals
                        break;
                    case 'energetic':
                        gainMultiplier = 1 + (Math.random() * 0.5); // Random variation
                        break;
                    case 'pure':
                        gainMultiplier = index === 0 ? 1.5 : 0.3; // Pure fundamental
                        break;
                }

                partial.gain.gain.rampTo(
                    (1 / ((index + 1) * (index + 1))) * gainMultiplier * intensity,
                    3
                );
            });
        });
    }

    start() {
        if (!this.isInitialized) return;

        // Start all drone sources
        this.sources.drones.forEach(drone => {
            if (drone.oscillator && drone.oscillator.state === 'stopped') {
                drone.oscillator.start();
            }
            if (drone.oscillators) {
                drone.oscillators.forEach(osc => {
                    if (osc.state === 'stopped') osc.start();
                });
            }
        });

        // Start all texture sources
        this.sources.textures.forEach(texture => {
            if (texture.noise && texture.noise.state === 'stopped') {
                texture.noise.start();
            }
            if (texture.lfos) {
                texture.lfos.forEach(lfo => {
                    if (lfo.state === 'stopped') lfo.start();
                });
            }
        });

        // Start harmonic sources
        this.sources.harmonics.forEach(harmonic => {
            harmonic.partials.forEach(partial => {
                if (partial.oscillator.state === 'stopped') {
                    partial.oscillator.start();
                }
            });
            if (harmonic.modulation) {
                harmonic.modulation.amplitude.start();
                harmonic.modulation.frequency.start();
            }
        });

        // Start naturalistic sources
        this.sources.naturalistic.forEach(source => {
            if (source.oscillator && source.oscillator.state === 'stopped') {
                source.oscillator.start();
            }
            if (source.lfo && source.lfo.state === 'stopped') {
                source.lfo.start();
            }
            if (source.pulse && source.pulse.state === 'stopped') {
                source.pulse.start();
            }
        });

        // Connect all sources to destination
        this.connectToDestination();

        console.log('🌊 Evolving Ambient Layer started');
    }

    stop() {
        // Stop all sources gracefully
        this.sources.drones.forEach(drone => {
            if (drone.oscillator) drone.oscillator.stop();
            if (drone.oscillators) {
                drone.oscillators.forEach(osc => osc.stop());
            }
        });

        this.sources.textures.forEach(texture => {
            if (texture.noise) texture.noise.stop();
            if (texture.lfos) {
                texture.lfos.forEach(lfo => lfo.stop());
            }
        });

        this.sources.harmonics.forEach(harmonic => {
            harmonic.partials.forEach(partial => {
                partial.oscillator.stop();
            });
        });

        this.sources.naturalistic.forEach(source => {
            if (source.oscillator) source.oscillator.stop();
            if (source.lfo) source.lfo.stop();
            if (source.pulse) source.pulse.stop();
        });

        console.log('🌊 Evolving Ambient Layer stopped');
    }

    connectToDestination() {
        // Connect all source categories to destination with proper mixing
        const ambientMixer = new Tone.Gain(0.8);
        ambientMixer.connect(this.destination);

        // Connect drones
        this.sources.drones.forEach(drone => {
            if (drone.gain) {
                drone.gain.connect(ambientMixer);
            } else if (drone.mixer) {
                drone.mixer.connect(ambientMixer);
            }
        });

        // Connect textures
        this.sources.textures.forEach(texture => {
            if (texture.gain) {
                texture.gain.connect(ambientMixer);
            } else if (texture.mixer) {
                texture.mixer.connect(ambientMixer);
            }
        });

        // Connect harmonics
        this.sources.harmonics.forEach(harmonic => {
            harmonic.mixer.connect(ambientMixer);
        });

        // Connect naturalistic sources
        this.sources.naturalistic.forEach(source => {
            source.gain.connect(ambientMixer);
        });
    }

    getStatus() {
        return {
            isActive: this.isActive,
            isInitialized: this.isInitialized,
            evolution: this.evolution,
            environment: this.environment,
            sourceCount: {
                drones: this.sources.drones.length,
                textures: this.sources.textures.length,
                harmonics: this.sources.harmonics.length,
                naturalistic: this.sources.naturalistic.length
            }
        };
    }
}

// Export the spatial audio layers
window.EvolvingAmbientLayer = EvolvingAmbientLayer;