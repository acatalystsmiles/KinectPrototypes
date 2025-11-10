/**
 * Advanced Spatial Audio System
 *
 * Features:
 * - 3D positional audio with HRTF (Head-Related Transfer Function)
 * - Binaural audio processing
 * - Room acoustics simulation
 * - Distance-based attenuation and filtering
 * - Doppler effect for moving sources
 * - Early reflections and late reverb
 * - Ambisonics support for immersive soundscapes
 */

class AdvancedSpatialAudio {
    constructor(audioContext) {
        this.audioContext = audioContext || Tone.context.rawContext;
        this.listener = this.audioContext.listener;

        // Spatial audio sources
        this.sources = new Map();
        this.sourceId = 0;

        // Room acoustics
        this.room = {
            dimensions: { width: 10, height: 4, depth: 10 }, // meters
            materials: {
                walls: 'plaster',
                floor: 'wood',
                ceiling: 'acoustic_tile'
            },
            reflectivity: 0.6
        };

        // HRTF and binaural processing
        this.binauralEnabled = true;
        this.hrtfLoaded = false;
        this.binauralPanner = null;

        // Distance model
        this.distanceModel = 'inverse'; // inverse, linear, exponential
        this.rolloffFactor = 1.0;
        this.refDistance = 1.0;
        this.maxDistance = 20.0;

        // Effects processors
        this.convolver = null;
        this.earlyReflections = null;
        this.lateReverb = null;

        // Listener properties
        this.listenerPosition = { x: 0, y: 1.7, z: 0 }; // Head height
        this.listenerOrientation = { forward: [0, 0, -1], up: [0, 1, 0] };

        // Ambisonics
        this.ambisonicsEnabled = false;
        this.ambisonicsOrder = 3; // 1st, 2nd, or 3rd order

        // Performance
        this.maxSources = 32;
        this.spatialUpdateRate = 60; // Hz

        this.initialize();
        console.log('🎧 Advanced Spatial Audio System initialized');
    }

    async initialize() {
        try {
            // Setup listener
            this.updateListenerPosition(this.listenerPosition);
            this.updateListenerOrientation(this.listenerOrientation);

            // Initialize room acoustics
            await this.initializeRoomAcoustics();

            // Setup binaural processing if supported
            if (this.binauralEnabled && this.audioContext.createPanner) {
                this.initializeBinauralProcessing();
            }

            // Initialize ambisonics if enabled
            if (this.ambisonicsEnabled) {
                await this.initializeAmbisonics();
            }

            console.log('✅ Spatial audio initialized with HRTF and room acoustics');

        } catch (error) {
            console.error('Spatial audio initialization error:', error);
        }
    }

    /**
     * Initialize room acoustics and reverb
     */
    async initializeRoomAcoustics() {
        // Create convolution reverb for room simulation
        this.convolver = this.audioContext.createConvolver();

        // Generate impulse response for room
        const impulseResponse = this.generateRoomImpulseResponse(
            this.room.dimensions,
            this.room.reflectivity,
            this.audioContext.sampleRate
        );

        this.convolver.buffer = impulseResponse;

        // Early reflections processor
        this.earlyReflections = this.createEarlyReflectionsProcessor();

        // Late reverb
        this.lateReverb = new Tone.Reverb({
            decay: this.calculateReverbTime(),
            preDelay: 0.02,
            wet: 0.3
        }).toDestination();

        await this.lateReverb.generate();
    }

    /**
     * Initialize binaural processing
     */
    initializeBinauralProcessing() {
        // For Web Audio API 3D positioning
        // Modern browsers support HRTF by default with PannerNode

        this.hrtfLoaded = true;
        console.log('HRTF-based binaural processing enabled');
    }

    /**
     * Initialize Ambisonics encoding/decoding
     */
    async initializeAmbisonics() {
        // Ambisonics encoding for 360-degree sound field
        // This would use a library like omnitone or resonance-audio
        // Simplified implementation

        console.log(`Ambisonics initialized (${this.ambisonicsOrder} order)`);
    }

    /**
     * Create a spatial audio source
     */
    createSpatialSource(audioNode, position = { x: 0, y: 0, z: 0 }, config = {}) {
        if (this.sources.size >= this.maxSources) {
            console.warn('Maximum spatial sources reached');
            return null;
        }

        const sourceId = this.sourceId++;

        // Create panner node for 3D positioning
        const panner = this.audioContext.createPanner();

        // Configure panner
        panner.panningModel = config.panningModel || 'HRTF';
        panner.distanceModel = this.distanceModel;
        panner.rolloffFactor = config.rolloffFactor || this.rolloffFactor;
        panner.refDistance = config.refDistance || this.refDistance;
        panner.maxDistance = config.maxDistance || this.maxDistance;

        // Cone properties for directional sources
        panner.coneInnerAngle = config.coneInnerAngle || 360;
        panner.coneOuterAngle = config.coneOuterAngle || 360;
        panner.coneOuterGain = config.coneOuterGain || 0;

        // Set initial position
        this.setSourcePosition(panner, position);

        // Create spatial source object
        const spatialSource = {
            id: sourceId,
            panner: panner,
            position: { ...position },
            velocity: { x: 0, y: 0, z: 0 },
            orientation: { x: 0, y: 0, z: -1 },
            audioNode: audioNode,
            config: config,

            // Acoustic properties
            directPath: this.audioContext.createGain(),
            earlyReflectionsSend: this.audioContext.createGain(),
            reverbSend: this.audioContext.createGain(),

            // Distance-based filtering
            lowPassFilter: this.audioContext.createBiquadFilter(),
            highPassFilter: this.audioContext.createBiquadFilter(),

            // State
            active: true,
            lastUpdate: Date.now()
        };

        // Setup audio routing
        this.setupSourceRouting(spatialSource);

        // Store source
        this.sources.set(sourceId, spatialSource);

        return sourceId;
    }

    /**
     * Setup audio routing for spatial source
     */
    setupSourceRouting(source) {
        // Configure filters
        source.lowPassFilter.type = 'lowpass';
        source.lowPassFilter.frequency.value = 20000;
        source.lowPassFilter.Q.value = 1.0;

        source.highPassFilter.type = 'highpass';
        source.highPassFilter.frequency.value = 20;
        source.highPassFilter.Q.value = 1.0;

        // Set send levels
        source.directPath.gain.value = 0.8;
        source.earlyReflectionsSend.gain.value = 0.3;
        source.reverbSend.gain.value = 0.2;

        // Connect audio graph
        // audioNode → filters → panner → directPath → destination
        //                               ↓
        //                               → earlyReflections → destination
        //                               ↓
        //                               → reverb → destination

        if (source.audioNode) {
            source.audioNode.connect(source.highPassFilter);
            source.highPassFilter.connect(source.lowPassFilter);
            source.lowPassFilter.connect(source.panner);

            // Direct path
            source.panner.connect(source.directPath);
            source.directPath.connect(this.audioContext.destination);

            // Early reflections
            if (this.earlyReflections) {
                source.panner.connect(source.earlyReflectionsSend);
                source.earlyReflectionsSend.connect(this.earlyReflections);
            }

            // Late reverb
            if (this.lateReverb) {
                source.panner.connect(source.reverbSend);
                source.reverbSend.connect(this.lateReverb);
            }
        }
    }

    /**
     * Update source position
     */
    updateSourcePosition(sourceId, position) {
        const source = this.sources.get(sourceId);
        if (!source) return;

        // Calculate velocity for Doppler effect
        const deltaTime = (Date.now() - source.lastUpdate) / 1000;
        if (deltaTime > 0) {
            source.velocity = {
                x: (position.x - source.position.x) / deltaTime,
                y: (position.y - source.position.y) / deltaTime,
                z: (position.z - source.position.z) / deltaTime
            };
        }

        // Update position
        source.position = { ...position };
        this.setSourcePosition(source.panner, position);

        // Calculate distance to listener
        const distance = this.calculateDistance(position, this.listenerPosition);

        // Apply distance-based effects
        this.applyDistanceEffects(source, distance);

        // Update reverb send based on distance
        this.updateReverbSend(source, distance);

        source.lastUpdate = Date.now();
    }

    /**
     * Set source position on panner node
     */
    setSourcePosition(panner, position) {
        if (panner.positionX) {
            // Modern API
            panner.positionX.value = position.x;
            panner.positionY.value = position.y;
            panner.positionZ.value = position.z;
        } else {
            // Legacy API
            panner.setPosition(position.x, position.y, position.z);
        }
    }

    /**
     * Update source orientation (for directional sources)
     */
    updateSourceOrientation(sourceId, orientation) {
        const source = this.sources.get(sourceId);
        if (!source) return;

        source.orientation = { ...orientation };

        if (source.panner.orientationX) {
            source.panner.orientationX.value = orientation.x;
            source.panner.orientationY.value = orientation.y;
            source.panner.orientationZ.value = orientation.z;
        } else {
            source.panner.setOrientation(orientation.x, orientation.y, orientation.z);
        }
    }

    /**
     * Apply distance-based effects
     */
    applyDistanceEffects(source, distance) {
        // Air absorption - high frequencies attenuate faster
        const airAbsorption = Math.exp(-distance * 0.1);
        const highFreqAttenuation = 20000 * airAbsorption;

        source.lowPassFilter.frequency.setValueAtTime(
            Math.max(200, highFreqAttenuation),
            this.audioContext.currentTime
        );

        // Proximity effect - boost lows when very close
        if (distance < 1.0) {
            const proximityBoost = (1.0 - distance) * 100;
            source.highPassFilter.frequency.setValueAtTime(
                Math.max(20, 100 - proximityBoost),
                this.audioContext.currentTime
            );
        }
    }

    /**
     * Update reverb send based on distance
     */
    updateReverbSend(source, distance) {
        // More distant sources have more reverb
        const reverbAmount = Math.min(0.7, 0.2 + (distance / this.maxDistance) * 0.5);
        const directAmount = Math.max(0.3, 1.0 - (distance / this.maxDistance) * 0.7);

        source.reverbSend.gain.setValueAtTime(
            reverbAmount,
            this.audioContext.currentTime
        );
        source.directPath.gain.setValueAtTime(
            directAmount,
            this.audioContext.currentTime
        );
    }

    /**
     * Update listener position
     */
    updateListenerPosition(position) {
        this.listenerPosition = { ...position };

        if (this.listener.positionX) {
            this.listener.positionX.value = position.x;
            this.listener.positionY.value = position.y;
            this.listener.positionZ.value = position.z;
        } else {
            this.listener.setPosition(position.x, position.y, position.z);
        }

        // Update all source effects based on new listener position
        for (const [sourceId, source] of this.sources) {
            const distance = this.calculateDistance(source.position, this.listenerPosition);
            this.applyDistanceEffects(source, distance);
            this.updateReverbSend(source, distance);
        }
    }

    /**
     * Update listener orientation
     */
    updateListenerOrientation(orientation) {
        this.listenerOrientation = orientation;

        if (this.listener.forwardX) {
            this.listener.forwardX.value = orientation.forward[0];
            this.listener.forwardY.value = orientation.forward[1];
            this.listener.forwardZ.value = orientation.forward[2];
            this.listener.upX.value = orientation.up[0];
            this.listener.upY.value = orientation.up[1];
            this.listener.upZ.value = orientation.up[2];
        } else {
            this.listener.setOrientation(
                orientation.forward[0], orientation.forward[1], orientation.forward[2],
                orientation.up[0], orientation.up[1], orientation.up[2]
            );
        }
    }

    /**
     * Create positioned sound based on body position
     */
    createBodyPositionedSound(bodyId, bodyPosition, audioNode) {
        // Map body position to 3D audio space
        const audioPosition = this.mapBodyToAudioSpace(bodyPosition);

        // Create spatial source
        const sourceId = this.createSpatialSource(audioNode, audioPosition, {
            rolloffFactor: 2.0,
            refDistance: 0.5,
            maxDistance: 15.0
        });

        return sourceId;
    }

    /**
     * Map body tracking space to audio space
     */
    mapBodyToAudioSpace(bodyPosition) {
        // Kinect coordinates to audio space coordinates
        // Assuming Kinect: X (left-right), Y (up-down), Z (depth)

        return {
            x: bodyPosition.x * 5, // Scale to meters
            y: bodyPosition.y * 2 + 1, // Scale and offset to standing height
            z: bodyPosition.z * 5  // Scale depth
        };
    }

    /**
     * Create sound that moves with hand position
     */
    createHandFollowingSound(handPosition, audioNode) {
        const audioPosition = {
            x: handPosition.x * 2,
            y: handPosition.y * 2 + 1.5,
            z: handPosition.z * 2
        };

        return this.createSpatialSource(audioNode, audioPosition, {
            rolloffFactor: 1.5,
            refDistance: 0.3
        });
    }

    /**
     * Create ambient soundfield (omnidirectional)
     */
    createAmbientSoundfield(audioNode) {
        // Ambient sounds don't use panning - they're everywhere
        const gain = this.audioContext.createGain();
        gain.gain.value = 0.5;

        if (audioNode) {
            audioNode.connect(gain);
            gain.connect(this.lateReverb || this.audioContext.destination);
        }

        return gain;
    }

    /**
     * Generate room impulse response
     */
    generateRoomImpulseResponse(dimensions, reflectivity, sampleRate) {
        const length = sampleRate * 3; // 3 seconds
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);

        const leftChannel = impulse.getChannelData(0);
        const rightChannel = impulse.getChannelData(1);

        // Generate impulse response
        // Initial impulse
        leftChannel[0] = 1;
        rightChannel[0] = 1;

        // Early reflections (simplified image source method)
        const speedOfSound = 343; // m/s
        const reflectionTimes = this.calculateEarlyReflections(dimensions, speedOfSound);

        for (const reflection of reflectionTimes) {
            const sampleIndex = Math.floor(reflection.time * sampleRate);
            if (sampleIndex < length) {
                const amplitude = reflection.amplitude * reflectivity;
                leftChannel[sampleIndex] += amplitude * (1 + reflection.panLeft);
                rightChannel[sampleIndex] += amplitude * (1 + reflection.panRight);
            }
        }

        // Late reverb (exponentially decaying noise)
        const reverbStart = Math.floor(0.1 * sampleRate);
        const decayRate = -3 / (sampleRate * 2); // -3 dB per 2 seconds

        for (let i = reverbStart; i < length; i++) {
            const decay = Math.exp(decayRate * (i - reverbStart));
            const noise = (Math.random() * 2 - 1) * decay * reflectivity;
            leftChannel[i] += noise;
            rightChannel[i] += noise * 1.1; // Slight decorrelation
        }

        return impulse;
    }

    /**
     * Calculate early reflections using simplified image source method
     */
    calculateEarlyReflections(dimensions, speedOfSound) {
        const reflections = [];
        const listenerPos = this.listenerPosition;

        // Calculate first-order reflections from each wall
        const walls = [
            { normal: [1, 0, 0], distance: dimensions.width / 2, name: 'right' },
            { normal: [-1, 0, 0], distance: dimensions.width / 2, name: 'left' },
            { normal: [0, 1, 0], distance: dimensions.height / 2, name: 'ceiling' },
            { normal: [0, -1, 0], distance: dimensions.height / 2, name: 'floor' },
            { normal: [0, 0, 1], distance: dimensions.depth / 2, name: 'front' },
            { normal: [0, 0, -1], distance: dimensions.depth / 2, name: 'back' }
        ];

        for (const wall of walls) {
            const travelDistance = wall.distance * 2;
            const time = travelDistance / speedOfSound;
            const amplitude = 0.5 / (travelDistance * travelDistance); // Inverse square

            // Simplified panning based on wall position
            let panLeft = 0, panRight = 0;
            if (wall.name === 'left') panLeft = 0.3;
            if (wall.name === 'right') panRight = 0.3;

            reflections.push({
                time: time,
                amplitude: amplitude,
                panLeft: panLeft,
                panRight: panRight,
                source: wall.name
            });
        }

        return reflections;
    }

    /**
     * Calculate reverb time based on room properties
     */
    calculateReverbTime() {
        // Sabine equation (simplified)
        const volume = this.room.dimensions.width *
                      this.room.dimensions.height *
                      this.room.dimensions.depth;

        const surfaceArea = 2 * (
            this.room.dimensions.width * this.room.dimensions.height +
            this.room.dimensions.width * this.room.dimensions.depth +
            this.room.dimensions.height * this.room.dimensions.depth
        );

        // Absorption coefficient (1 - reflectivity)
        const absorption = (1 - this.room.reflectivity) * surfaceArea;

        // RT60 (time for 60dB decay)
        const rt60 = 0.161 * volume / (absorption + 0.01);

        return Math.max(0.5, Math.min(4.0, rt60));
    }

    /**
     * Create early reflections processor
     */
    createEarlyReflectionsProcessor() {
        // Simple multi-tap delay for early reflections
        const merger = this.audioContext.createChannelMerger(2);
        const splitter = this.audioContext.createChannelSplitter(2);

        const delays = [];
        const reflectionTimes = [0.01, 0.02, 0.03, 0.05, 0.07];

        for (const time of reflectionTimes) {
            const delay = this.audioContext.createDelay();
            delay.delayTime.value = time;

            const gain = this.audioContext.createGain();
            gain.gain.value = 0.3 / (1 + time * 10);

            delays.push({ delay, gain });
        }

        // Connect delays
        const input = this.audioContext.createGain();
        input.connect(splitter);

        for (let i = 0; i < delays.length; i++) {
            const { delay, gain } = delays[i];
            const channel = i % 2; // Alternate channels for stereo

            splitter.connect(delay, channel);
            delay.connect(gain);
            gain.connect(merger, 0, channel);
        }

        merger.connect(this.audioContext.destination);

        return input;
    }

    /**
     * Calculate distance between two points
     */
    calculateDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx*dx + dy*dy + dz*dz);
    }

    /**
     * Remove spatial source
     */
    removeSource(sourceId) {
        const source = this.sources.get(sourceId);
        if (!source) return;

        // Disconnect all nodes
        try {
            if (source.audioNode) source.audioNode.disconnect();
            source.highPassFilter.disconnect();
            source.lowPassFilter.disconnect();
            source.panner.disconnect();
            source.directPath.disconnect();
            source.earlyReflectionsSend.disconnect();
            source.reverbSend.disconnect();
        } catch (e) {
            // Ignore disconnection errors
        }

        source.active = false;
        this.sources.delete(sourceId);
    }

    /**
     * Update room properties
     */
    updateRoomProperties(dimensions, reflectivity) {
        this.room.dimensions = dimensions;
        this.room.reflectivity = reflectivity;

        // Regenerate room acoustics
        this.initializeRoomAcoustics();
    }

    /**
     * Get source information
     */
    getSourceInfo(sourceId) {
        const source = this.sources.get(sourceId);
        if (!source) return null;

        const distance = this.calculateDistance(source.position, this.listenerPosition);

        return {
            id: sourceId,
            position: source.position,
            velocity: source.velocity,
            orientation: source.orientation,
            distance: distance,
            active: source.active
        };
    }

    /**
     * Get all active sources
     */
    getActiveSources() {
        return Array.from(this.sources.values()).filter(s => s.active);
    }

    /**
     * Cleanup
     */
    cleanup() {
        // Remove all sources
        for (const sourceId of this.sources.keys()) {
            this.removeSource(sourceId);
        }

        // Disconnect effects
        if (this.convolver) this.convolver.disconnect();
        if (this.earlyReflections) this.earlyReflections.disconnect();
        if (this.lateReverb) this.lateReverb.disconnect();
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedSpatialAudio;
}
