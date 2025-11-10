// Psychoacoustic processors and real-time audio effects

class EmotionalAudioProcessor {
    constructor() {
        this.emotions = new Map();
        this.currentEmotion = { primary: 'neutral', intensity: 0.5, secondary: null };
        this.emotionHistory = [];
        this.transitionEngine = new EmotionalTransitionEngine();

        // Emotion analysis parameters
        this.analysis = {
            temporal_window: 10000, // 10 seconds
            confidence_threshold: 0.6,
            transition_smoothing: 0.8
        };

        // Audio processing chains for each emotion
        this.emotionalProcessors = new Map();

        console.log('💭 Emotional Audio Processor initialized');
    }

    defineEmotions(emotionDefinitions) {
        Object.entries(emotionDefinitions).forEach(([name, definition]) => {
            this.emotions.set(name, {
                ...definition,
                audioProcessor: this.createEmotionalProcessor(definition)
            });
        });

        console.log(`💭 Defined ${this.emotions.size} emotional states`);
    }

    createEmotionalProcessor(definition) {
        const processor = {
            harmonicProcessor: this.createHarmonicProcessor(definition.harmonics),
            rhythmicProcessor: this.createRhythmicProcessor(definition.rhythm),
            spatialProcessor: this.createSpatialProcessor(definition.space),
            effectsChain: this.createEffectsChain(definition.processing)
        };

        return processor;
    }

    createHarmonicProcessor(harmonicType) {
        switch (harmonicType) {
            case 'bright':
                return {
                    eq: new Tone.EQ3({ high: 6, mid: 2, low: -2 }),
                    enhancer: new Tone.Distortion(0.1),
                    shimmer: new Tone.Reverb({ decay: 3, wet: 0.3 })
                };

            case 'major':
                return {
                    eq: new Tone.EQ3({ high: 2, mid: 3, low: 1 }),
                    saturation: new Tone.Distortion(0.05),
                    chorus: new Tone.Chorus(0.5, 2.5, 0.8)
                };

            case 'suspended':
                return {
                    eq: new Tone.EQ3({ high: -2, mid: 0, low: 2 }),
                    reverb: new Tone.Reverb({ decay: 6, wet: 0.7 }),
                    delay: new Tone.FeedbackDelay('8n', 0.2)
                };

            case 'complex':
                return {
                    eq: new Tone.EQ3({ high: 4, mid: -1, low: 3 }),
                    bitcrush: new Tone.BitCrusher(6),
                    phaser: new Tone.Phaser(0.5, 3, 250)
                };

            case 'pure':
            default:
                return {
                    eq: new Tone.EQ3({ high: -3, mid: -1, low: -3 }),
                    compressor: new Tone.Compressor(-20, 2),
                    reverb: new Tone.Reverb({ decay: 4, wet: 0.4 })
                };
        }
    }

    createRhythmicProcessor(rhythmType) {
        switch (rhythmType) {
            case 'floating':
                return {
                    modulation: new Tone.LFO(0.1, 0.8, 1.2),
                    gate: new Tone.Gate(-30, 0.1),
                    tremolo: new Tone.Tremolo(0.3, 0.2)
                };

            case 'bouncy':
                return {
                    compressor: new Tone.Compressor(-15, 4),
                    gate: new Tone.Gate(-20, 0.05),
                    envelope: new Tone.AmplitudeEnvelope(0.01, 0.1, 0.8, 0.3)
                };

            case 'slow':
                return {
                    envelope: new Tone.AmplitudeEnvelope(2, 1, 0.9, 3),
                    filter: new Tone.Filter(800, 'lowpass'),
                    lfo: new Tone.LFO(0.05, 0.7, 1.0)
                };

            case 'energetic':
                return {
                    compressor: new Tone.Compressor(-12, 6),
                    exciter: new Tone.Distortion(0.3),
                    tremolo: new Tone.Tremolo(4, 0.4)
                };

            case 'gentle':
            default:
                return {
                    envelope: new Tone.AmplitudeEnvelope(0.5, 0.2, 0.9, 1),
                    filter: new Tone.Filter(1200, 'lowpass'),
                    lfo: new Tone.LFO(0.2, 0.9, 1.1)
                };
        }
    }

    createSpatialProcessor(spaceType) {
        switch (spaceType) {
            case 'expansive':
                return {
                    reverb: new Tone.Reverb({ decay: 8, wet: 0.8 }),
                    stereoWidener: new Tone.StereoWidener(0.8),
                    chorus: new Tone.Chorus(0.3, 2, 0.6)
                };

            case 'intimate':
                return {
                    reverb: new Tone.Reverb({ decay: 2, wet: 0.3 }),
                    compressor: new Tone.Compressor(-18, 3),
                    filter: new Tone.Filter(3000, 'lowpass')
                };

            case 'deep':
                return {
                    reverb: new Tone.Reverb({ decay: 12, wet: 0.9 }),
                    delay: new Tone.FeedbackDelay('4n', 0.4),
                    lowpass: new Tone.Filter(800, 'lowpass')
                };

            case 'dynamic':
                return {
                    autopan: new Tone.AutoPanner(0.5),
                    phaser: new Tone.Phaser(0.8, 4, 400),
                    reverb: new Tone.Reverb({ decay: 4, wet: 0.5 })
                };

            case 'calm':
            default:
                return {
                    reverb: new Tone.Reverb({ decay: 5, wet: 0.6 }),
                    filter: new Tone.Filter(2000, 'lowpass'),
                    compressor: new Tone.Compressor(-24, 2)
                };
        }
    }

    createEffectsChain(processingTypes) {
        const chain = [];

        processingTypes.forEach(type => {
            switch (type) {
                case 'reverb':
                    chain.push(new Tone.Reverb({ decay: 4, wet: 0.5 }));
                    break;
                case 'chorus':
                    chain.push(new Tone.Chorus(0.4, 2.5, 0.7));
                    break;
                case 'shimmer':
                    chain.push(new ShimmerEffect());
                    break;
                case 'compression':
                    chain.push(new Tone.Compressor(-20, 3));
                    break;
                case 'saturation':
                    chain.push(new Tone.Distortion(0.1));
                    break;
                case 'exciter':
                    chain.push(new HarmonicExciter());
                    break;
                case 'lowpass':
                    chain.push(new Tone.Filter(1500, 'lowpass'));
                    break;
                case 'stretch':
                    chain.push(new TimeStretchProcessor());
                    break;
                case 'granular':
                    chain.push(new GranularProcessor());
                    break;
                case 'distortion':
                    chain.push(new Tone.Distortion(0.2));
                    break;
                case 'pad':
                    chain.push(new PadProcessor());
                    break;
                case 'warmth':
                    chain.push(new WarmthProcessor());
                    break;
            }
        });

        return chain;
    }

    analyzeEmotion(movementFeatures) {
        // Multi-dimensional emotion analysis
        const emotionVector = this.calculateEmotionVector(movementFeatures);

        // Find best matching emotion
        const matches = this.findEmotionalMatches(emotionVector);

        // Apply temporal smoothing
        const smoothedEmotion = this.applyTemporalSmoothing(matches);

        // Update current emotion state
        this.updateEmotionalState(smoothedEmotion);

        return this.currentEmotion;
    }

    calculateEmotionVector(features) {
        // Extract emotional indicators from movement
        const energy = features.totalEnergy || 0;
        const complexity = features.enhancedMetrics?.complexity || 0;
        const intentionality = features.enhancedMetrics?.intentionality || 0;
        const musicality = features.enhancedMetrics?.musicality || 0;
        const expressiveness = features.enhancedMetrics?.expressiveness || 0;

        // Social context
        const socialLevel = features.bodyCount > 1 ? Math.min(1, features.bodyCount / 4) : 0;

        // Temporal context
        const sustainedActivity = this.calculateSustainedActivity(features);

        return {
            valence: (musicality + expressiveness) / 2, // Positive vs negative
            arousal: energy, // High vs low energy
            complexity: complexity,
            sociability: socialLevel,
            contemplation: intentionality * (1 - energy), // High intention, low energy
            creativity: (expressiveness + complexity) / 2,
            sustainability: sustainedActivity
        };
    }

    findEmotionalMatches(vector) {
        const matches = [];

        // Define emotion characteristics in the same vector space
        const emotionCharacteristics = {
            wonder: { valence: 0.7, arousal: 0.5, complexity: 0.8, contemplation: 0.6 },
            joy: { valence: 0.9, arousal: 0.8, complexity: 0.4, sociability: 0.7 },
            contemplation: { valence: 0.5, arousal: 0.2, complexity: 0.6, contemplation: 0.9 },
            excitement: { valence: 0.8, arousal: 0.9, complexity: 0.7, sociability: 0.8 },
            serenity: { valence: 0.6, arousal: 0.1, complexity: 0.3, contemplation: 0.8 }
        };

        // Calculate similarity scores
        Object.entries(emotionCharacteristics).forEach(([emotion, characteristics]) => {
            const similarity = this.calculateSimilarity(vector, characteristics);
            matches.push({ emotion, similarity });
        });

        // Sort by similarity
        matches.sort((a, b) => b.similarity - a.similarity);

        return matches;
    }

    calculateSimilarity(vector1, vector2) {
        let similarity = 0;
        let dimensionCount = 0;

        // Compare common dimensions
        Object.keys(vector1).forEach(dimension => {
            if (vector2[dimension] !== undefined) {
                const diff = Math.abs(vector1[dimension] - vector2[dimension]);
                similarity += 1 - diff; // Inverse distance
                dimensionCount++;
            }
        });

        return dimensionCount > 0 ? similarity / dimensionCount : 0;
    }

    applyTemporalSmoothing(matches) {
        const currentMatch = matches[0];

        if (this.emotionHistory.length === 0) {
            return currentMatch;
        }

        // Weighted average with recent history
        const recentHistory = this.emotionHistory.slice(-5); // Last 5 measurements
        let weightedEmotion = currentMatch.emotion;
        let weightedIntensity = currentMatch.similarity;

        // Apply smoothing if the emotion change is too abrupt
        const lastEmotion = this.emotionHistory[this.emotionHistory.length - 1];
        if (lastEmotion.emotion !== currentMatch.emotion) {
            const transitionSpeed = this.analysis.transition_smoothing;

            // Smooth transition between emotions
            weightedIntensity = (lastEmotion.intensity * transitionSpeed) +
                               (currentMatch.similarity * (1 - transitionSpeed));

            // Only change emotion if confidence is high enough
            if (currentMatch.similarity > this.analysis.confidence_threshold) {
                weightedEmotion = currentMatch.emotion;
            } else {
                weightedEmotion = lastEmotion.emotion;
            }
        }

        return { emotion: weightedEmotion, intensity: weightedIntensity };
    }

    updateEmotionalState(emotionMatch) {
        const newEmotion = {
            primary: emotionMatch.emotion,
            intensity: emotionMatch.intensity,
            timestamp: Date.now(),
            confidence: emotionMatch.intensity
        };

        // Update history
        this.emotionHistory.push(newEmotion);

        // Maintain history size
        if (this.emotionHistory.length > 100) {
            this.emotionHistory.shift();
        }

        // Update current state
        this.currentEmotion = newEmotion;

        // Trigger processing updates
        this.updateEmotionalProcessing();
    }

    updateEmotionalProcessing() {
        const emotionDef = this.emotions.get(this.currentEmotion.primary);
        if (!emotionDef) return;

        const processor = emotionDef.audioProcessor;
        const intensity = this.currentEmotion.intensity;

        // Update harmonic processing
        this.updateHarmonicProcessing(processor.harmonicProcessor, intensity);

        // Update rhythmic processing
        this.updateRhythmicProcessing(processor.rhythmicProcessor, intensity);

        // Update spatial processing
        this.updateSpatialProcessing(processor.spatialProcessor, intensity);

        // Update effects chain
        this.updateEffectsChain(processor.effectsChain, intensity);
    }

    updateHarmonicProcessing(processor, intensity) {
        if (processor.eq) {
            // Scale EQ adjustments by intensity
            processor.eq.high.rampTo(processor.eq.high.value * intensity, 0.5);
            processor.eq.mid.rampTo(processor.eq.mid.value * intensity, 0.5);
            processor.eq.low.rampTo(processor.eq.low.value * intensity, 0.5);
        }

        if (processor.enhancer) {
            processor.enhancer.wet.rampTo(0.2 * intensity, 0.3);
        }

        if (processor.saturation) {
            processor.saturation.wet.rampTo(0.3 * intensity, 0.3);
        }
    }

    updateRhythmicProcessing(processor, intensity) {
        if (processor.modulation) {
            processor.modulation.amplitude.rampTo(intensity, 0.5);
        }

        if (processor.tremolo) {
            processor.tremolo.depth.rampTo(intensity * 0.5, 0.3);
        }

        if (processor.gate) {
            processor.gate.threshold.rampTo(-30 + (intensity * 20), 0.5);
        }
    }

    updateSpatialProcessing(processor, intensity) {
        if (processor.reverb) {
            processor.reverb.wet.rampTo(processor.reverb.wet.value * intensity, 1);
        }

        if (processor.stereoWidener) {
            processor.stereoWidener.width.rampTo(intensity, 0.5);
        }

        if (processor.autopan) {
            processor.autopan.frequency.rampTo(intensity * 2, 0.5);
        }
    }

    updateEffectsChain(chain, intensity) {
        chain.forEach(effect => {
            if (effect.wet) {
                effect.wet.rampTo(effect.wet.value * intensity, 0.5);
            }
            if (effect.depth) {
                effect.depth.rampTo(effect.depth.value * intensity, 0.3);
            }
        });
    }

    calculateSustainedActivity(features) {
        // Calculate how long visitor has been active
        const currentTime = Date.now();
        const recentActivity = this.emotionHistory.slice(-10); // Last 10 measurements

        if (recentActivity.length < 5) return 0;

        const avgIntensity = recentActivity.reduce((sum, e) => sum + e.intensity, 0) / recentActivity.length;
        const timeSpan = currentTime - recentActivity[0].timestamp;
        const sustainabilityFactor = Math.min(1, timeSpan / 30000); // 30 seconds for full sustainability

        return avgIntensity * sustainabilityFactor;
    }
}

class BinauralBeatsProcessor {
    constructor(config = {}) {
        this.carrierFreq = config.carrierFrequency || 440;
        this.beatFreq = config.beatFrequency || 4;
        this.amplitude = config.amplitude || 0.1;

        // Create binaural beat generators
        this.leftOsc = new Tone.Oscillator(this.carrierFreq, 'sine');
        this.rightOsc = new Tone.Oscillator(this.carrierFreq + this.beatFreq, 'sine');

        // Create stereo merger
        this.merger = new Tone.Merge();
        this.gain = new Tone.Gain(this.amplitude);

        // Connect for binaural effect
        this.leftOsc.connect(this.merger, 0, 0);   // Left channel
        this.rightOsc.connect(this.merger, 0, 1);  // Right channel
        this.merger.connect(this.gain);

        console.log(`🧠 Binaural beats: ${this.carrierFreq}Hz ± ${this.beatFreq}Hz`);
    }

    updateFrequency(newBeatFreq) {
        this.beatFreq = newBeatFreq;
        this.rightOsc.frequency.rampTo(this.carrierFreq + this.beatFreq, 2);
    }

    setAmplitude(amplitude) {
        this.amplitude = amplitude;
        this.gain.gain.rampTo(amplitude, 1);
    }

    start() {
        this.leftOsc.start();
        this.rightOsc.start();
    }

    stop() {
        this.leftOsc.stop();
        this.rightOsc.stop();
    }

    connect(destination) {
        this.gain.connect(destination);
    }
}

class PhantomFundamentalProcessor {
    constructor() {
        // Generate missing fundamental using harmonic series
        this.harmonics = [];
        this.mixer = new Tone.Gain(0.3);
        this.fundamentalFreq = 55; // A1

        // Create harmonic series (2nd, 3rd, 4th, 5th harmonics)
        for (let i = 2; i <= 5; i++) {
            const harmonic = {
                oscillator: new Tone.Oscillator(this.fundamentalFreq * i, 'sine'),
                gain: new Tone.Gain(1 / (i * i)) // Natural harmonic rolloff
            };

            harmonic.oscillator.connect(harmonic.gain);
            harmonic.gain.connect(this.mixer);

            this.harmonics.push(harmonic);
        }

        console.log('👻 Phantom Fundamental Processor initialized');
    }

    updateFromMovement(features) {
        // Adjust phantom fundamental based on movement characteristics
        const energy = features.totalEnergy || 0;
        const complexity = features.enhancedMetrics?.complexity || 0;

        // Adjust fundamental frequency based on energy
        const targetFreq = this.fundamentalFreq * (1 + energy * 0.2);

        this.harmonics.forEach((harmonic, index) => {
            harmonic.oscillator.frequency.rampTo(targetFreq * (index + 2), 1);

            // Adjust harmonic amplitudes based on complexity
            const amplitude = (1 / ((index + 2) * (index + 2))) * (1 + complexity * 0.5);
            harmonic.gain.gain.rampTo(amplitude, 0.5);
        });
    }

    start() {
        this.harmonics.forEach(harmonic => {
            harmonic.oscillator.start();
        });
    }

    stop() {
        this.harmonics.forEach(harmonic => {
            harmonic.oscillator.stop();
        });
    }

    connect(destination) {
        this.mixer.connect(destination);
    }
}

// Placeholder processors for advanced effects
class GranularProcessor {
    constructor() {
        this.grainSize = 0.1; // 100ms grains
        this.overlap = 0.5;   // 50% overlap
        this.wet = new Tone.Gain(0.3);
        console.log('🌾 Granular Processor initialized');
    }

    updateParameters(emotion, harmony) {
        // Adjust granular parameters based on context
        this.grainSize = 0.05 + (emotion.intensity * 0.15);
        this.overlap = 0.3 + (harmony.complexity * 0.4);
    }

    connect(destination) {
        this.wet.connect(destination);
    }
}

class SpectralProcessor {
    constructor() {
        this.fftSize = 2048;
        this.wet = new Tone.Gain(0.4);
        console.log('🌈 Spectral Processor initialized');
    }

    updateParameters(emotion, harmony) {
        // Spectral processing based on emotional and harmonic context
        const intensity = emotion.intensity * harmony.complexity;
        this.wet.gain.rampTo(intensity * 0.5, 0.5);
    }

    connect(destination) {
        this.wet.connect(destination);
    }
}

class BinauralProcessor {
    constructor() {
        this.hrtf = true; // HRTF processing enabled
        this.wet = new Tone.Gain(0.5);
        console.log('👂 Binaural Processor initialized');
    }

    connect(destination) {
        this.wet.connect(destination);
    }
}

// Additional effect processors
class ShimmerEffect {
    constructor() {
        this.reverb = new Tone.Reverb({ decay: 8, wet: 0.6 });
        this.pitchShift = new Tone.PitchShift(12); // Octave up
        this.gain = new Tone.Gain(0.3);

        this.pitchShift.connect(this.reverb);
        this.reverb.connect(this.gain);
    }

    connect(destination) {
        this.gain.connect(destination);
    }
}

class HarmonicExciter {
    constructor() {
        this.distortion = new Tone.Distortion(0.1);
        this.highpass = new Tone.Filter(2000, 'highpass');
        this.gain = new Tone.Gain(0.2);

        this.distortion.connect(this.highpass);
        this.highpass.connect(this.gain);
    }

    connect(destination) {
        this.gain.connect(destination);
    }
}

class TimeStretchProcessor {
    constructor() {
        this.stretchRatio = 1.0;
        this.gain = new Tone.Gain(0.4);
    }

    connect(destination) {
        this.gain.connect(destination);
    }
}

class PadProcessor {
    constructor() {
        this.reverb = new Tone.Reverb({ decay: 6, wet: 0.8 });
        this.lowpass = new Tone.Filter(800, 'lowpass');
        this.gain = new Tone.Gain(0.5);

        this.lowpass.connect(this.reverb);
        this.reverb.connect(this.gain);
    }

    connect(destination) {
        this.gain.connect(destination);
    }
}

class WarmthProcessor {
    constructor() {
        this.saturation = new Tone.Distortion(0.05);
        this.eq = new Tone.EQ3({ low: 3, mid: 1, high: -2 });
        this.compressor = new Tone.Compressor(-18, 2);

        this.saturation.connect(this.eq);
        this.eq.connect(this.compressor);
    }

    connect(destination) {
        this.compressor.connect(destination);
    }
}

class EmotionalTransitionEngine {
    executeTransition(fromEmotion, toEmotion) {
        console.log(`💭 Emotional transition: ${fromEmotion} → ${toEmotion}`);
        // Would implement smooth emotional transitions
    }
}

// Export for integration
window.EmotionalAudioProcessor = EmotionalAudioProcessor;
window.BinauralBeatsProcessor = BinauralBeatsProcessor;
window.PhantomFundamentalProcessor = PhantomFundamentalProcessor;
window.GranularProcessor = GranularProcessor;
window.SpectralProcessor = SpectralProcessor;
window.BinauralProcessor = BinauralProcessor;