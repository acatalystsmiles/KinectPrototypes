/**
 * Forest Environment Plugin
 * Creates organic, natural sounds with birdsong and wind effects
 */

class ForestEnvironmentPlugin extends SoundEnvironmentPlugin {
    constructor(options) {
        super({
            ...options,
            config: {
                environmentId: 'forest',
                name: 'Forest',
                description: 'Organic, natural sounds with birdsong and wind',
                ...options.config
            }
        });

        this.birdSongs = [];
        this.windLayers = [];
        this.leafRustling = null;
        this.ambientBeds = [];
    }

    /**
     * Setup audio nodes for forest environment
     */
    async setupAudioNodes() {
        try {
            // Create main output gain
            const mainGain = this.createAudioNode('gain', { gain: 0 });
            mainGain.connect(this.audioContext.destination);
            this.audioNodes.set('main', {
                gainNode: mainGain,
                baseGain: this.config.audioSettings?.volume || 0.7
            });

            // Setup bird song layers
            await this.setupBirdSongs();

            // Setup wind layers
            await this.setupWindLayers();

            // Setup leaf rustling
            await this.setupLeafRustling();

            // Setup ambient forest beds
            await this.setupAmbientBeds();

            console.log('Forest environment audio nodes setup complete');

        } catch (error) {
            this.handleError('setupAudioNodes', error);
        }
    }

    /**
     * Setup bird song audio layers
     */
    async setupBirdSongs() {
        const birdTypes = ['robin', 'sparrow', 'thrush', 'warbler'];
        const mainGain = this.audioNodes.get('main').gainNode;

        for (let i = 0; i < birdTypes.length; i++) {
            const birdGain = this.createAudioNode('gain', { gain: 0 });
            const filter = this.createAudioNode('filter', {
                type: 'bandpass',
                frequency: 2000 + i * 500,
                Q: 3
            });

            // Create oscillator for bird song synthesis
            const osc = this.createAudioNode('oscillator', {
                frequency: 1000 + i * 200,
                type: 'sine'
            });

            // Create LFO for bird song modulation
            const lfo = this.createAudioNode('oscillator', {
                frequency: 2 + i * 0.5,
                type: 'triangle'
            });

            const lfoGain = this.createAudioNode('gain', { gain: 50 });

            // Connect bird song chain
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            osc.connect(filter);
            filter.connect(birdGain);
            birdGain.connect(mainGain);

            // Start oscillators
            osc.start();
            lfo.start();

            this.birdSongs.push({
                type: birdTypes[i],
                oscillator: osc,
                lfo: lfo,
                gain: birdGain,
                filter: filter,
                baseFreq: 1000 + i * 200,
                active: false
            });

            this.audioNodes.set(`bird_${i}`, {
                gainNode: birdGain,
                baseGain: 0.3,
                param: birdGain.gain
            });
        }
    }

    /**
     * Setup wind layer audio
     */
    async setupWindLayers() {
        const mainGain = this.audioNodes.get('main').gainNode;

        // Low frequency wind (sub-bass)
        const lowWindGain = this.createAudioNode('gain', { gain: 0 });
        const lowWindFilter = this.createAudioNode('filter', {
            type: 'lowpass',
            frequency: 200,
            Q: 1
        });

        const lowWindOsc = this.createAudioNode('oscillator', {
            frequency: 60,
            type: 'sawtooth'
        });

        lowWindOsc.connect(lowWindFilter);
        lowWindFilter.connect(lowWindGain);
        lowWindGain.connect(mainGain);
        lowWindOsc.start();

        // Mid frequency wind (whooshing)
        const midWindGain = this.createAudioNode('gain', { gain: 0 });
        const midWindFilter = this.createAudioNode('filter', {
            type: 'bandpass',
            frequency: 800,
            Q: 2
        });

        const midWindOsc = this.createAudioNode('oscillator', {
            frequency: 400,
            type: 'sawtooth'
        });

        midWindOsc.connect(midWindFilter);
        midWindFilter.connect(midWindGain);
        midWindGain.connect(mainGain);
        midWindOsc.start();

        this.windLayers = [
            {
                name: 'low_wind',
                oscillator: lowWindOsc,
                gain: lowWindGain,
                filter: lowWindFilter,
                baseGain: 0.4
            },
            {
                name: 'mid_wind',
                oscillator: midWindOsc,
                gain: midWindGain,
                filter: midWindFilter,
                baseGain: 0.3
            }
        ];

        this.audioNodes.set('wind_low', {
            gainNode: lowWindGain,
            baseGain: 0.4,
            param: lowWindGain.gain
        });

        this.audioNodes.set('wind_mid', {
            gainNode: midWindGain,
            baseGain: 0.3,
            param: midWindGain.gain
        });
    }

    /**
     * Setup leaf rustling effects
     */
    async setupLeafRustling() {
        const mainGain = this.audioNodes.get('main').gainNode;

        const rustleGain = this.createAudioNode('gain', { gain: 0 });
        const rustleFilter = this.createAudioNode('filter', {
            type: 'highpass',
            frequency: 3000,
            Q: 1
        });

        // Use noise-like oscillator for rustling
        const rustleOsc = this.createAudioNode('oscillator', {
            frequency: 8000,
            type: 'sawtooth'
        });

        // LFO for random rustling intensity
        const rustleLfo = this.createAudioNode('oscillator', {
            frequency: 0.3,
            type: 'square'
        });

        const rustleLfoGain = this.createAudioNode('gain', { gain: 0.5 });

        rustleLfo.connect(rustleLfoGain);
        rustleLfoGain.connect(rustleGain.gain);
        rustleOsc.connect(rustleFilter);
        rustleFilter.connect(rustleGain);
        rustleGain.connect(mainGain);

        rustleOsc.start();
        rustleLfo.start();

        this.leafRustling = {
            oscillator: rustleOsc,
            lfo: rustleLfo,
            gain: rustleGain,
            filter: rustleFilter
        };

        this.audioNodes.set('rustle', {
            gainNode: rustleGain,
            baseGain: 0.2,
            param: rustleGain.gain
        });
    }

    /**
     * Setup ambient forest bed tones
     */
    async setupAmbientBeds() {
        const mainGain = this.audioNodes.get('main').gainNode;

        // Create warm, low-frequency ambient pads
        const frequencies = [110, 165, 220]; // A2, E3, A3

        for (let i = 0; i < frequencies.length; i++) {
            const ambientGain = this.createAudioNode('gain', { gain: 0 });
            const ambientFilter = this.createAudioNode('filter', {
                type: 'lowpass',
                frequency: 1000,
                Q: 0.5
            });

            const ambientOsc = this.createAudioNode('oscillator', {
                frequency: frequencies[i],
                type: 'triangle'
            });

            ambientOsc.connect(ambientFilter);
            ambientFilter.connect(ambientGain);
            ambientGain.connect(mainGain);
            ambientOsc.start();

            this.ambientBeds.push({
                frequency: frequencies[i],
                oscillator: ambientOsc,
                gain: ambientGain,
                filter: ambientFilter
            });

            this.audioNodes.set(`ambient_${i}`, {
                gainNode: ambientGain,
                baseGain: 0.1,
                param: ambientGain.gain
            });
        }
    }

    /**
     * Setup parameter mappings for forest environment
     */
    setupParameterMappings() {
        // Map movement energy to bird activity
        this.parameterMappings.set('energy', {
            param: 'bird_activity',
            range: [0, 1],
            curve: 'exponential'
        });

        // Map velocity to wind intensity
        this.parameterMappings.set('velocityMagnitude', {
            param: 'wind_intensity',
            range: [0, 1],
            curve: 'linear'
        });

        // Map vertical movement to bird song pitch
        this.parameterMappings.set('verticalMovement', {
            param: 'bird_pitch',
            range: [0.8, 1.2],
            curve: 'linear'
        });

        // Map hand activity to leaf rustling
        this.parameterMappings.set('handActivity', {
            param: 'rustle_intensity',
            range: [0, 1],
            curve: 'sine'
        });
    }

    /**
     * Extract movement data specific to forest environment
     */
    extractMovementData(data) {
        const baseData = super.extractMovementData(data);

        // Calculate additional forest-specific metrics
        const skeletons = data.skeletons || [];
        let totalHandActivity = 0;
        let verticalMovement = 0;
        let velocityMagnitude = 0;

        for (const skeleton of skeletons) {
            const joints = skeleton.joints || {};
            const leftHand = joints.HAND_LEFT;
            const rightHand = joints.HAND_RIGHT;
            const head = joints.HEAD;

            if (leftHand && rightHand) {
                const handDistance = Math.sqrt(
                    Math.pow(leftHand.position.x - rightHand.position.x, 2) +
                    Math.pow(leftHand.position.y - rightHand.position.y, 2)
                );
                totalHandActivity += handDistance;
            }

            if (head) {
                verticalMovement += Math.abs(head.position.y);
            }

            if (skeleton.metrics) {
                velocityMagnitude += skeleton.metrics.overallMotion || 0;
            }
        }

        return {
            ...baseData,
            handActivity: totalHandActivity / Math.max(skeletons.length, 1),
            verticalMovement: verticalMovement / Math.max(skeletons.length, 1),
            velocityMagnitude: velocityMagnitude / Math.max(skeletons.length, 1)
        };
    }

    /**
     * Apply audio parameters specific to forest environment
     */
    applyAudioParameters(parameters) {
        try {
            // Bird activity control
            if (parameters.bird_activity !== undefined) {
                this.updateBirdActivity(parameters.bird_activity);
            }

            // Wind intensity control
            if (parameters.wind_intensity !== undefined) {
                this.updateWindIntensity(parameters.wind_intensity);
            }

            // Bird pitch control
            if (parameters.bird_pitch !== undefined) {
                this.updateBirdPitch(parameters.bird_pitch);
            }

            // Rustling intensity control
            if (parameters.rustle_intensity !== undefined) {
                this.updateRustlingIntensity(parameters.rustle_intensity);
            }

        } catch (error) {
            this.handleError('applyAudioParameters', error);
        }
    }

    /**
     * Update bird song activity
     */
    updateBirdActivity(activity) {
        const currentTime = this.audioContext.currentTime;

        this.birdSongs.forEach((bird, index) => {
            const shouldBeActive = activity > (index * 0.2 + 0.1);
            const targetGain = shouldBeActive ? bird.baseGain * activity : 0;

            bird.gain.gain.setTargetAtTime(targetGain, currentTime, 0.2);
            bird.active = shouldBeActive;

            // Vary bird song timing
            if (shouldBeActive) {
                const lfoFreq = 2 + activity * 3 + index * 0.5;
                bird.lfo.frequency.setTargetAtTime(lfoFreq, currentTime, 0.1);
            }
        });
    }

    /**
     * Update wind intensity
     */
    updateWindIntensity(intensity) {
        const currentTime = this.audioContext.currentTime;

        this.windLayers.forEach(layer => {
            const targetGain = layer.baseGain * intensity;
            layer.gain.gain.setTargetAtTime(targetGain, currentTime, 0.3);

            // Vary wind frequency slightly
            const freqVariation = 1 + intensity * 0.2;
            const baseFreq = layer.name === 'low_wind' ? 60 : 400;
            layer.oscillator.frequency.setTargetAtTime(
                baseFreq * freqVariation,
                currentTime,
                0.5
            );
        });
    }

    /**
     * Update bird song pitch
     */
    updateBirdPitch(pitchMultiplier) {
        const currentTime = this.audioContext.currentTime;

        this.birdSongs.forEach(bird => {
            if (bird.active) {
                const targetFreq = bird.baseFreq * pitchMultiplier;
                bird.oscillator.frequency.setTargetAtTime(targetFreq, currentTime, 0.1);
            }
        });
    }

    /**
     * Update leaf rustling intensity
     */
    updateRustlingIntensity(intensity) {
        if (!this.leafRustling) return;

        const currentTime = this.audioContext.currentTime;
        const targetGain = 0.2 * intensity;

        this.leafRustling.gain.gain.setTargetAtTime(targetGain, currentTime, 0.1);

        // Vary rustling frequency and filter
        const filterFreq = 3000 + intensity * 2000;
        this.leafRustling.filter.frequency.setTargetAtTime(filterFreq, currentTime, 0.2);
    }

    /**
     * Called when forest environment is activated
     */
    async onActivate() {
        console.log('Forest environment activated - awakening the woodland');

        // Gradually bring in ambient beds first
        const currentTime = this.audioContext.currentTime;
        this.ambientBeds.forEach((bed, index) => {
            bed.gain.gain.setTargetAtTime(0.1, currentTime + index * 0.5, 0.5);
        });
    }

    /**
     * Called when forest environment is deactivated
     */
    async onDeactivate() {
        console.log('Forest environment deactivated - the woodland sleeps');

        // Fade out all bird songs
        this.birdSongs.forEach(bird => {
            bird.gain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.5);
        });
    }

    /**
     * Get forest-specific environment metadata
     */
    static getMetadata() {
        return {
            name: 'ForestEnvironmentPlugin',
            version: '1.0.0',
            description: 'Organic forest environment with bird songs, wind, and rustling leaves',
            author: 'Sound Sculpture System',
            category: 'environment',
            dependencies: ['audioEngine'],
            configSchema: {
                birdTypes: { type: 'array', default: ['robin', 'sparrow', 'thrush', 'warbler'] },
                windLayers: { type: 'number', default: 2, min: 1, max: 4 },
                ambientFrequencies: { type: 'array', default: [110, 165, 220] }
            }
        };
    }

    /**
     * Get default configuration for forest environment
     */
    static getDefaultConfig() {
        return {
            ...super.getDefaultConfig(),
            environmentId: 'forest',
            name: 'Forest',
            description: 'Organic, natural sounds with birdsong and wind',
            activationThreshold: 0.3,
            audioSettings: {
                volume: 0.7,
                reverb: 0.4,
                naturalness: 0.9
            },
            birdTypes: ['robin', 'sparrow', 'thrush', 'warbler'],
            windLayers: 2,
            ambientFrequencies: [110, 165, 220]
        };
    }
}

// Export for both CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ForestEnvironmentPlugin;
} else if (typeof window !== 'undefined') {
    window.ForestEnvironmentPlugin = ForestEnvironmentPlugin;
}