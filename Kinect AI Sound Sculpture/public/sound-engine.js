class SoundEngine {
    constructor() {
        this.isInitialized = false;
        this.isPlaying = false;
        this.isMuted = false;
        this.masterVolume = 0.7;

        // Performance monitoring
        this.latencyMonitor = {
            dataReceiveTime: 0,
            audioTriggerTime: 0,
            currentLatency: 0
        };

        // Synthesis layers
        this.layers = new Map();
        this.activeLayerCount = 0;

        // Audio analysis for visualization
        this.analyser = null;
        this.analyserData = null;
        this.vizCanvas = null;
        this.vizCtx = null;

        // Movement data buffers for smoothing
        this.movementBuffer = {
            size: 10,
            data: []
        };

        // Initialize Web Audio API optimizations
        this.audioWorkletLoaded = false;

        this.setupEventListeners();
    }

    async initialize() {
        try {
            console.log('🎵 Initializing SoundEngine...');

            // Configure Tone.js for low latency
            await Tone.start();

            // Set audio context for optimal performance
            Tone.context.lookAhead = 0.01; // 10ms lookahead
            Tone.context.latencyHint = 'interactive'; // Prioritize low latency

            // Set sample rate and buffer size for best performance
            if (Tone.context.rawContext.sampleRate) {
                console.log(`📊 Audio Context: ${Tone.context.rawContext.sampleRate}Hz, Buffer: ${Tone.context.rawContext.baseLatency * 1000}ms`);
            }

            // Create master output chain
            this.masterGain = new Tone.Gain(this.masterVolume).toDestination();

            // Create analyser for visualization
            this.analyser = new Tone.Analyser('fft', 256);
            this.analyserData = new Float32Array(256);
            this.masterGain.connect(this.analyser);

            // Initialize synthesis layers
            await this.initializeLayers();

            // Setup visualization
            this.setupVisualization();

            this.isInitialized = true;
            this.updateAudioStatus('Initialized', 'active');

            console.log('✅ SoundEngine initialized successfully');

        } catch (error) {
            console.error('❌ SoundEngine initialization failed:', error);
            this.updateAudioStatus('Initialization Failed', 'error');
            throw error;
        }
    }

    async initializeLayers() {
        // Ambient Foundation Layer
        this.layers.set('foundation', new AmbientFoundationLayer(this.masterGain));

        // Melodic Response Layer
        this.layers.set('melodic', new MelodicLayer(this.masterGain));

        // Harmonic Layer
        this.layers.set('harmonic', new HarmonicLayer(this.masterGain));

        // Rhythmic Layer
        this.layers.set('rhythmic', new RhythmicLayer(this.masterGain));

        // Initialize all layers
        for (const [name, layer] of this.layers) {
            try {
                await layer.initialize();
                console.log(`🎶 ${name} layer initialized`);
            } catch (error) {
                console.error(`❌ Failed to initialize ${name} layer:`, error);
            }
        }

        this.updateActiveLayerCount();
    }

    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            // Audio toggle button
            const audioToggle = document.getElementById('audioToggle');
            audioToggle?.addEventListener('click', () => this.toggleAudio());

            // Mute button
            const muteToggle = document.getElementById('muteToggle');
            muteToggle?.addEventListener('click', () => this.toggleMute());

            // Volume slider
            const volumeSlider = document.getElementById('masterVolume');
            volumeSlider?.addEventListener('input', (e) => this.setVolume(e.target.value / 100));

            // Visualization canvas
            this.vizCanvas = document.getElementById('audioVizCanvas');
            if (this.vizCanvas) {
                this.vizCtx = this.vizCanvas.getContext('2d');
            }
        });
    }

    setupVisualization() {
        if (!this.vizCanvas || !this.vizCtx) return;

        const drawVisualization = () => {
            if (!this.isPlaying || !this.analyser) {
                requestAnimationFrame(drawVisualization);
                return;
            }

            // Get frequency data
            const freqData = this.analyser.getValue();

            // Clear canvas
            this.vizCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.vizCtx.fillRect(0, 0, this.vizCanvas.width, this.vizCanvas.height);

            // Draw frequency bars
            const barWidth = this.vizCanvas.width / freqData.length;
            const barMaxHeight = this.vizCanvas.height - 20;

            this.vizCtx.fillStyle = '#00ff88';

            for (let i = 0; i < freqData.length; i++) {
                const value = Math.max(0, (freqData[i] + 140) / 140); // Normalize dB to 0-1
                const barHeight = value * barMaxHeight;

                this.vizCtx.fillRect(
                    i * barWidth,
                    this.vizCanvas.height - barHeight,
                    barWidth - 1,
                    barHeight
                );
            }

            // Draw latency indicator
            this.vizCtx.fillStyle = this.latencyMonitor.currentLatency > 50 ? '#ff4444' : '#00ff88';
            this.vizCtx.font = '10px monospace';
            this.vizCtx.fillText(`${this.latencyMonitor.currentLatency}ms`, 5, 15);

            requestAnimationFrame(drawVisualization);
        };

        drawVisualization();
    }

    async toggleAudio() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            if (this.isPlaying) {
                await this.stop();
            } else {
                await this.start();
            }
        } catch (error) {
            console.error('❌ Error toggling audio:', error);
            this.updateAudioStatus('Error', 'error');
        }
    }

    async start() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        console.log('▶️ Starting audio playback...');

        // Start all layers
        for (const [name, layer] of this.layers) {
            try {
                await layer.start();
            } catch (error) {
                console.error(`❌ Failed to start ${name} layer:`, error);
            }
        }

        this.isPlaying = true;
        this.updateAudioStatus('Playing', 'active');
        this.updateAudioToggleButton('🔇 Stop Audio');

        console.log('✅ Audio playback started');
    }

    async stop() {
        console.log('⏹️ Stopping audio playback...');

        // Stop all layers
        for (const [name, layer] of this.layers) {
            try {
                await layer.stop();
            } catch (error) {
                console.error(`❌ Failed to stop ${name} layer:`, error);
            }
        }

        this.isPlaying = false;
        this.updateAudioStatus('Stopped', '');
        this.updateAudioToggleButton('🔊 Start Audio');

        console.log('✅ Audio playback stopped');
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        const volume = this.isMuted ? 0 : this.masterVolume;

        if (this.masterGain) {
            this.masterGain.gain.rampTo(volume, 0.1);
        }

        const muteButton = document.getElementById('muteToggle');
        if (muteButton) {
            muteButton.textContent = this.isMuted ? '🔊 Unmute' : '🔇 Mute';
        }

        console.log(`🔇 Audio ${this.isMuted ? 'muted' : 'unmuted'}`);
    }

    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));

        if (this.masterGain && !this.isMuted) {
            this.masterGain.gain.rampTo(this.masterVolume, 0.1);
        }

        const volumeDisplay = document.getElementById('volumeDisplay');
        if (volumeDisplay) {
            volumeDisplay.textContent = `${Math.round(this.masterVolume * 100)}%`;
        }
    }

    processMovementData(data) {
        if (!this.isPlaying || !data) return;

        // Record latency
        this.latencyMonitor.dataReceiveTime = performance.now();

        // Smooth movement data
        this.addToMovementBuffer(data);
        const smoothedData = this.getSmoothedMovementData();

        // Process data through all active layers
        for (const [name, layer] of this.layers) {
            try {
                if (layer.isActive) {
                    layer.processMovementData(smoothedData);
                }
            } catch (error) {
                console.error(`❌ Error processing movement data in ${name} layer:`, error);
            }
        }

        // Calculate and update latency
        this.latencyMonitor.audioTriggerTime = performance.now();
        this.latencyMonitor.currentLatency = Math.round(
            this.latencyMonitor.audioTriggerTime - this.latencyMonitor.dataReceiveTime
        );

        // Update UI
        this.updateLatencyDisplay();
    }

    addToMovementBuffer(data) {
        this.movementBuffer.data.push(data);
        if (this.movementBuffer.data.length > this.movementBuffer.size) {
            this.movementBuffer.data.shift();
        }
    }

    getSmoothedMovementData() {
        if (this.movementBuffer.data.length === 0) return null;

        const latest = this.movementBuffer.data[this.movementBuffer.data.length - 1];

        if (this.movementBuffer.data.length === 1) return latest;

        // Simple exponential smoothing for metrics
        const alpha = 0.3; // Smoothing factor
        const smoothed = JSON.parse(JSON.stringify(latest)); // Deep copy

        if (this.movementBuffer.data.length > 1) {
            const previous = this.movementBuffer.data[this.movementBuffer.data.length - 2];

            if (smoothed.metrics && previous.metrics) {
                smoothed.metrics.averageMotion = alpha * smoothed.metrics.averageMotion +
                    (1 - alpha) * previous.metrics.averageMotion;

                smoothed.metrics.energyLevel = alpha * smoothed.metrics.energyLevel +
                    (1 - alpha) * previous.metrics.energyLevel;

                smoothed.metrics.totalHandActivity = alpha * smoothed.metrics.totalHandActivity +
                    (1 - alpha) * previous.metrics.totalHandActivity;
            }
        }

        return smoothed;
    }

    updateAudioStatus(status, className = '') {
        const statusElement = document.getElementById('audioStatus');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `status-text ${className}`;
        }
    }

    updateAudioToggleButton(text) {
        const button = document.getElementById('audioToggle');
        if (button) {
            button.textContent = text;
        }
    }

    updateLatencyDisplay() {
        const latencyElement = document.getElementById('audioLatency');
        if (latencyElement) {
            latencyElement.textContent = `${this.latencyMonitor.currentLatency}ms`;
            latencyElement.style.color = this.latencyMonitor.currentLatency > 50 ? '#ff4444' : '#00ff88';
        }
    }

    updateActiveLayerCount() {
        this.activeLayerCount = 0;
        for (const layer of this.layers.values()) {
            if (layer.isActive) this.activeLayerCount++;
        }

        const layersElement = document.getElementById('activeLayers');
        if (layersElement) {
            layersElement.textContent = this.activeLayerCount;
        }
    }

    // Layer management methods
    enableLayer(layerName) {
        const layer = this.layers.get(layerName);
        if (layer) {
            layer.enable();
            this.updateActiveLayerCount();
            console.log(`🎶 ${layerName} layer enabled`);
        }
    }

    disableLayer(layerName) {
        const layer = this.layers.get(layerName);
        if (layer) {
            layer.disable();
            this.updateActiveLayerCount();
            console.log(`🔇 ${layerName} layer disabled`);
        }
    }

    getLayerStatus() {
        const status = {};
        for (const [name, layer] of this.layers) {
            status[name] = {
                active: layer.isActive,
                volume: layer.volume || 0,
                lastTriggered: layer.lastTriggered || null
            };
        }
        return status;
    }

    // Cleanup method
    dispose() {
        console.log('🧹 Disposing SoundEngine...');

        for (const layer of this.layers.values()) {
            if (layer.dispose) {
                layer.dispose();
            }
        }

        if (this.masterGain) {
            this.masterGain.dispose();
        }

        if (this.analyser) {
            this.analyser.dispose();
        }

        this.layers.clear();
        this.isInitialized = false;
        this.isPlaying = false;
    }
}

// Base class for synthesis layers
class SynthesisLayer {
    constructor(masterOutput, options = {}) {
        this.masterOutput = masterOutput;
        this.isActive = false;
        this.volume = options.volume || 0.5;
        this.lastTriggered = null;

        // Create layer output gain
        this.output = new Tone.Gain(this.volume);
        this.output.connect(masterOutput);
    }

    async initialize() {
        // Override in subclasses
    }

    async start() {
        this.isActive = true;
    }

    async stop() {
        this.isActive = false;
    }

    enable() {
        this.isActive = true;
        this.output.gain.rampTo(this.volume, 0.5);
    }

    disable() {
        this.isActive = false;
        this.output.gain.rampTo(0, 0.5);
    }

    processMovementData(data) {
        // Override in subclasses
        this.lastTriggered = Date.now();
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.isActive) {
            this.output.gain.rampTo(this.volume, 0.1);
        }
    }

    dispose() {
        if (this.output) {
            this.output.dispose();
        }
    }
}

// Ambient Foundation Layer - Always present drone
class AmbientFoundationLayer extends SynthesisLayer {
    constructor(masterOutput) {
        super(masterOutput, { volume: 0.3 });
        this.drones = [];
        this.filter = null;
        this.reverb = null;
    }

    async initialize() {
        console.log('🌊 Initializing Ambient Foundation Layer...');

        // Create reverb for spatial depth
        this.reverb = new Tone.Reverb({
            decay: 8,
            wet: 0.3,
            preDelay: 0.1
        });

        // Create low-pass filter for warmth
        this.filter = new Tone.Filter({
            frequency: 800,
            type: 'lowpass',
            rolloff: -12
        });

        // Chain: filter -> reverb -> output
        this.filter.connect(this.reverb);
        this.reverb.connect(this.output);

        // Create drone oscillators in C major/pentatonic
        const frequencies = [65.4, 130.8, 196.0, 261.6]; // C2, C3, G3, C4

        for (const freq of frequencies) {
            const drone = new Tone.Oscillator({
                frequency: freq,
                type: 'sawtooth'
            });

            const gain = new Tone.Gain(0.15);
            drone.connect(gain);
            gain.connect(this.filter);

            this.drones.push({ oscillator: drone, gain });
        }

        console.log('✅ Ambient Foundation Layer initialized');
    }

    async start() {
        await super.start();

        // Start all drones with slight delays for organic feel
        for (let i = 0; i < this.drones.length; i++) {
            setTimeout(() => {
                this.drones[i].oscillator.start();
            }, i * 200);
        }
    }

    async stop() {
        await super.stop();

        for (const drone of this.drones) {
            drone.oscillator.stop();
        }
    }

    processMovementData(data) {
        super.processMovementData(data);

        if (!data?.metrics) return;

        const energyLevel = data.metrics.energyLevel || 0;
        const averageMotion = data.metrics.averageMotion || 0;

        // Adjust filter frequency based on energy (higher energy = brighter sound)
        const filterFreq = 400 + (energyLevel * 800); // 400-1200 Hz range
        this.filter.frequency.rampTo(filterFreq, 0.5);

        // Adjust reverb wet amount based on motion (more motion = more space)
        const reverbWet = 0.2 + (averageMotion * 0.3); // 0.2-0.5 range
        this.reverb.wet.rampTo(Math.min(0.5, reverbWet), 1.0);

        // Subtle volume changes based on overall activity
        const volumeMultiplier = 0.8 + (energyLevel * 0.4); // 0.8-1.2 range
        this.output.gain.rampTo(this.volume * volumeMultiplier, 2.0);
    }

    dispose() {
        for (const drone of this.drones) {
            drone.oscillator.dispose();
            drone.gain.dispose();
        }

        if (this.filter) this.filter.dispose();
        if (this.reverb) this.reverb.dispose();

        super.dispose();
    }
}

// Melodic Layer - Hand movement triggers
class MelodicLayer extends SynthesisLayer {
    constructor(masterOutput) {
        super(masterOutput, { volume: 0.4 });
        this.synth = null;
        this.scale = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3]; // C major pentatonic
        this.lastTriggerTime = { left: 0, right: 0 };
        this.minTriggerInterval = 150; // Prevent too rapid triggering
    }

    async initialize() {
        console.log('🎹 Initializing Melodic Layer...');

        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: {
                attack: 0.02,
                decay: 0.3,
                sustain: 0.3,
                release: 1.0
            }
        });

        // Add chorus for richness
        const chorus = new Tone.Chorus({
            frequency: 1.5,
            delayTime: 3.5,
            depth: 0.7,
            wet: 0.3
        });

        this.synth.connect(chorus);
        chorus.connect(this.output);

        console.log('✅ Melodic Layer initialized');
    }

    processMovementData(data) {
        super.processMovementData(data);

        if (!data?.bodies || data.bodies.length === 0) return;

        const now = Date.now();

        for (const body of data.bodies) {
            if (!body.metrics?.handVelocities) continue;

            const { left, right } = body.metrics.handVelocities;

            // Trigger notes based on hand velocity
            if (left > 1.0 && (now - this.lastTriggerTime.left) > this.minTriggerInterval) {
                this.triggerNote(left, 'left');
                this.lastTriggerTime.left = now;
            }

            if (right > 1.0 && (now - this.lastTriggerTime.right) > this.minTriggerInterval) {
                this.triggerNote(right, 'right');
                this.lastTriggerTime.right = now;
            }
        }
    }

    triggerNote(velocity, hand) {
        if (!this.synth || !this.isActive) return;

        // Map velocity to note selection and dynamics
        const noteIndex = Math.floor(Math.min(velocity * 2, this.scale.length - 1));
        const frequency = this.scale[noteIndex];

        // Add slight pitch variation for organic feel
        const pitchVariation = 1 + ((Math.random() - 0.5) * 0.02); // ±1% variation
        const finalFreq = frequency * pitchVariation;

        // Map velocity to note duration and volume
        const duration = Math.min(velocity * 0.5 + 0.3, 2.0); // 0.3-2.0 seconds
        const noteVelocity = Math.min(velocity * 0.3 + 0.4, 1.0); // 0.4-1.0

        // Trigger the note
        this.synth.triggerAttackRelease(finalFreq, duration, undefined, noteVelocity);
    }

    dispose() {
        if (this.synth) {
            this.synth.dispose();
        }
        super.dispose();
    }
}

// Harmonic Layer - Body expansion controls
class HarmonicLayer extends SynthesisLayer {
    constructor(masterOutput) {
        super(masterOutput, { volume: 0.25 });
        this.chordSynth = null;
        this.chords = {
            contracted: ['C4', 'E4', 'G4'],           // Simple triad
            neutral: ['C4', 'E4', 'G4', 'B4'],       // Major 7th
            expanded: ['C4', 'E4', 'G4', 'B4', 'D5', 'F5'] // Rich extended chord
        };
        this.currentChord = null;
    }

    async initialize() {
        console.log('🎼 Initializing Harmonic Layer...');

        this.chordSynth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sawtooth' },
            envelope: {
                attack: 1.0,
                decay: 0.3,
                sustain: 0.7,
                release: 2.0
            }
        });

        // Add gentle filtering
        const filter = new Tone.Filter({
            frequency: 1200,
            type: 'lowpass'
        });

        this.chordSynth.connect(filter);
        filter.connect(this.output);

        console.log('✅ Harmonic Layer initialized');
    }

    processMovementData(data) {
        super.processMovementData(data);

        if (!data?.bodies || data.bodies.length === 0) return;

        // Use the first body's expansion metric
        const bodyExpansion = data.bodies[0].metrics?.bodyExpansion || 0;

        // Determine chord complexity based on expansion
        let targetChord;
        if (bodyExpansion < 0.8) {
            targetChord = 'contracted';
        } else if (bodyExpansion < 1.5) {
            targetChord = 'neutral';
        } else {
            targetChord = 'expanded';
        }

        // Only change chord if it's different from current
        if (targetChord !== this.currentChord) {
            this.transitionToChord(targetChord);
            this.currentChord = targetChord;
        }
    }

    transitionToChord(chordType) {
        if (!this.chordSynth || !this.isActive) return;

        // Release current chord
        this.chordSynth.releaseAll();

        // Trigger new chord after brief pause
        setTimeout(() => {
            const chord = this.chords[chordType];
            const velocity = 0.3;

            // Trigger each note with slight timing offset for organic feel
            chord.forEach((note, index) => {
                setTimeout(() => {
                    this.chordSynth.triggerAttack(note, undefined, velocity);
                }, index * 50);
            });
        }, 100);
    }

    dispose() {
        if (this.chordSynth) {
            this.chordSynth.dispose();
        }
        super.dispose();
    }
}

// Rhythmic Layer - Movement rhythm detection
class RhythmicLayer extends SynthesisLayer {
    constructor(masterOutput) {
        super(masterOutput, { volume: 0.3 });
        this.drum = null;
        this.rhythmBuffer = [];
        this.bufferSize = 16;
        this.lastBeatTime = 0;
        this.beatThreshold = 2.0; // Minimum motion for beat trigger
    }

    async initialize() {
        console.log('🥁 Initializing Rhythmic Layer...');

        this.drum = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 10,
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.001,
                decay: 0.4,
                sustain: 0.01,
                release: 1.4
            }
        });

        this.drum.connect(this.output);

        console.log('✅ Rhythmic Layer initialized');
    }

    processMovementData(data) {
        super.processMovementData(data);

        if (!data?.metrics) return;

        const motion = data.metrics.averageMotion || 0;
        const now = Date.now();

        // Add motion to rhythm buffer
        this.rhythmBuffer.push({ motion, time: now });
        if (this.rhythmBuffer.length > this.bufferSize) {
            this.rhythmBuffer.shift();
        }

        // Detect rhythm peaks
        if (this.detectRhythmPeak(motion) && (now - this.lastBeatTime) > 200) {
            this.triggerBeat(motion);
            this.lastBeatTime = now;
        }
    }

    detectRhythmPeak(currentMotion) {
        if (this.rhythmBuffer.length < 3) return false;

        const recent = this.rhythmBuffer.slice(-3);
        const [prev2, prev1, current] = recent.map(item => item.motion);

        // Detect local maximum that exceeds threshold
        return currentMotion > this.beatThreshold &&
               currentMotion > prev1 &&
               prev1 > prev2;
    }

    triggerBeat(motion) {
        if (!this.drum || !this.isActive) return;

        // Map motion intensity to drum parameters
        const frequency = 60 + (motion * 20); // 60-100 Hz range
        const velocity = Math.min(motion * 0.4 + 0.3, 1.0);

        this.drum.triggerAttackRelease(frequency, '16n', undefined, velocity);
    }

    dispose() {
        if (this.drum) {
            this.drum.dispose();
        }
        super.dispose();
    }
}

// Global sound engine instance
window.soundEngine = new SoundEngine();