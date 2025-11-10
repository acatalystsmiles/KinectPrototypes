/**
 * Base Sound Environment Plugin
 * Abstract class for implementing different sonic environments
 */

class SoundEnvironmentPlugin extends BasePlugin {
    constructor(options) {
        super(options);

        this.environmentId = this.config.environmentId || 'default';
        this.isActive = false;
        this.activationProgress = 0;
        this.audioContext = null;
        this.audioNodes = new Map();
        this.parameterMappings = new Map();

        // Transition state
        this.transitionState = {
            isTransitioning: false,
            fromEnvironment: null,
            toEnvironment: null,
            progress: 0
        };
    }

    /**
     * Initialize the sound environment
     */
    async initialize() {
        try {
            console.log(`Initializing sound environment: ${this.environmentId}`);

            // Get audio context from dependencies
            this.audioContext = this.dependencies.audioEngine?.getAudioContext();
            if (!this.audioContext) {
                throw new Error('Audio context not available from audio engine dependency');
            }

            // Setup audio nodes
            await this.setupAudioNodes();

            // Setup parameter mappings
            this.setupParameterMappings();

            // Initialize environment-specific setup
            await this.initializeEnvironment();

            this.isInitialized = true;
            console.log(`Sound environment ${this.environmentId} initialized successfully`);

        } catch (error) {
            this.handleError('initialize', error);
            throw error;
        }
    }

    /**
     * Setup audio nodes - must be implemented by subclasses
     */
    async setupAudioNodes() {
        throw new Error('setupAudioNodes() must be implemented by environment subclasses');
    }

    /**
     * Setup parameter mappings - override in subclasses
     */
    setupParameterMappings() {
        // Default mappings - override in subclasses
        this.parameterMappings.set('volume', {
            param: 'gain',
            range: [0, 1],
            curve: 'linear'
        });

        this.parameterMappings.set('energy', {
            param: 'frequency',
            range: [200, 2000],
            curve: 'exponential'
        });
    }

    /**
     * Initialize environment-specific setup - override in subclasses
     */
    async initializeEnvironment() {
        // Override in subclasses
    }

    /**
     * Process movement data for this environment
     */
    processData(data) {
        if (!this.isActive || !this.isInitialized) {
            return data;
        }

        try {
            // Extract relevant movement data
            const movementData = this.extractMovementData(data);

            // Map movement to audio parameters
            const audioParameters = this.mapMovementToAudio(movementData);

            // Apply parameters to audio nodes
            this.applyAudioParameters(audioParameters);

            // Update environment state
            this.updateEnvironmentState(movementData);

            return data;

        } catch (error) {
            this.handleError('processData', error);
            return data;
        }
    }

    /**
     * Extract relevant movement data - override in subclasses
     */
    extractMovementData(data) {
        return {
            energy: data.energy || 0,
            velocity: data.velocity || { x: 0, y: 0, z: 0 },
            position: data.position || { x: 0, y: 0, z: 0 },
            bodyCount: data.skeletons?.length || 0,
            coordination: data.multiPersonInteractions?.coordination || null
        };
    }

    /**
     * Map movement data to audio parameters - override in subclasses
     */
    mapMovementToAudio(movementData) {
        const parameters = {};

        // Apply parameter mappings
        for (const [movementParam, mapping] of this.parameterMappings.entries()) {
            const value = movementData[movementParam];
            if (value !== undefined) {
                parameters[mapping.param] = this.applyParameterMapping(value, mapping);
            }
        }

        return parameters;
    }

    /**
     * Apply parameter mapping with curve and range
     */
    applyParameterMapping(value, mapping) {
        const { range, curve } = mapping;
        let normalizedValue = Math.max(0, Math.min(1, value));

        // Apply curve
        switch (curve) {
            case 'exponential':
                normalizedValue = normalizedValue * normalizedValue;
                break;
            case 'logarithmic':
                normalizedValue = Math.sqrt(normalizedValue);
                break;
            case 'sine':
                normalizedValue = Math.sin(normalizedValue * Math.PI / 2);
                break;
            // 'linear' is default
        }

        // Map to range
        return range[0] + normalizedValue * (range[1] - range[0]);
    }

    /**
     * Apply audio parameters to nodes - override in subclasses
     */
    applyAudioParameters(parameters) {
        // Default implementation - override in subclasses
        for (const [param, value] of Object.entries(parameters)) {
            this.setAudioParameter(param, value);
        }
    }

    /**
     * Set audio parameter with smooth transitions
     */
    setAudioParameter(param, value, transitionTime = 0.1) {
        const node = this.audioNodes.get(param);
        if (node && node.param) {
            try {
                const currentTime = this.audioContext.currentTime;
                node.param.setTargetAtTime(value, currentTime, transitionTime);
            } catch (error) {
                this.handleError('setAudioParameter', error);
            }
        }
    }

    /**
     * Update environment state - override in subclasses
     */
    updateEnvironmentState(movementData) {
        // Override in subclasses
    }

    /**
     * Activate the environment
     */
    async activate(transitionDuration = 2000) {
        if (this.isActive) return;

        try {
            this.isActive = true;
            this.activationProgress = 0;

            await this.onActivate();

            // Smooth transition in
            const startTime = Date.now();
            const fadeIn = () => {
                const elapsed = Date.now() - startTime;
                this.activationProgress = Math.min(elapsed / transitionDuration, 1);

                this.updateActivationLevel(this.activationProgress);

                if (this.activationProgress < 1) {
                    requestAnimationFrame(fadeIn);
                } else {
                    this.onActivationComplete();
                }
            };

            fadeIn();

            this.emit('activated', { environmentId: this.environmentId });

        } catch (error) {
            this.handleError('activate', error);
        }
    }

    /**
     * Deactivate the environment
     */
    async deactivate(transitionDuration = 2000) {
        if (!this.isActive) return;

        try {
            await this.onDeactivate();

            // Smooth transition out
            const startTime = Date.now();
            const startProgress = this.activationProgress;
            const fadeOut = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / transitionDuration, 1);
                this.activationProgress = startProgress * (1 - progress);

                this.updateActivationLevel(this.activationProgress);

                if (progress < 1) {
                    requestAnimationFrame(fadeOut);
                } else {
                    this.isActive = false;
                    this.activationProgress = 0;
                    this.onDeactivationComplete();
                }
            };

            fadeOut();

            this.emit('deactivated', { environmentId: this.environmentId });

        } catch (error) {
            this.handleError('deactivate', error);
        }
    }

    /**
     * Update activation level of audio nodes
     */
    updateActivationLevel(level) {
        for (const [name, node] of this.audioNodes.entries()) {
            if (node.gainNode) {
                try {
                    const targetGain = (node.baseGain || 1) * level;
                    node.gainNode.gain.setTargetAtTime(targetGain, this.audioContext.currentTime, 0.1);
                } catch (error) {
                    this.handleError('updateActivationLevel', error);
                }
            }
        }
    }

    /**
     * Called when environment is activated - override in subclasses
     */
    async onActivate() {
        // Override in subclasses
    }

    /**
     * Called when activation is complete - override in subclasses
     */
    onActivationComplete() {
        // Override in subclasses
    }

    /**
     * Called when environment is deactivated - override in subclasses
     */
    async onDeactivate() {
        // Override in subclasses
    }

    /**
     * Called when deactivation is complete - override in subclasses
     */
    onDeactivationComplete() {
        // Override in subclasses
    }

    /**
     * Transition between environments
     */
    async transitionTo(targetEnvironment, duration = 2000) {
        this.transitionState = {
            isTransitioning: true,
            fromEnvironment: this.environmentId,
            toEnvironment: targetEnvironment.environmentId,
            progress: 0
        };

        const startTime = Date.now();
        const transition = () => {
            const elapsed = Date.now() - startTime;
            this.transitionState.progress = Math.min(elapsed / duration, 1);

            // Cross-fade between environments
            this.updateActivationLevel(1 - this.transitionState.progress);
            targetEnvironment.updateActivationLevel(this.transitionState.progress);

            if (this.transitionState.progress < 1) {
                requestAnimationFrame(transition);
            } else {
                this.transitionState.isTransitioning = false;
                this.deactivate(0);
                targetEnvironment.activate(0);
                this.emit('transitionComplete', this.transitionState);
            }
        };

        targetEnvironment.activate(0);
        transition();
    }

    /**
     * Get environment metadata
     */
    getEnvironmentInfo() {
        return {
            id: this.environmentId,
            name: this.config.name || this.environmentId,
            description: this.config.description || '',
            isActive: this.isActive,
            activationProgress: this.activationProgress,
            transitionState: { ...this.transitionState },
            audioNodes: Array.from(this.audioNodes.keys()),
            parameterMappings: Array.from(this.parameterMappings.keys())
        };
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        try {
            await this.deactivate(0);

            // Disconnect audio nodes
            for (const [name, node] of this.audioNodes.entries()) {
                if (node.disconnect) {
                    node.disconnect();
                }
            }

            this.audioNodes.clear();
            this.parameterMappings.clear();

        } catch (error) {
            this.handleError('cleanup', error);
        }
    }

    /**
     * Get default configuration for sound environments
     */
    static getDefaultConfig() {
        return {
            ...super.getDefaultConfig(),
            environmentId: 'default',
            name: 'Default Environment',
            description: 'Basic sound environment',
            activationThreshold: 0.5,
            transitionDuration: 2000,
            audioSettings: {
                volume: 0.7,
                reverb: 0.3,
                delay: 0.2
            }
        };
    }

    /**
     * Create audio node helper
     */
    createAudioNode(type, options = {}) {
        try {
            let node;

            switch (type) {
                case 'oscillator':
                    node = this.audioContext.createOscillator();
                    if (options.frequency) node.frequency.value = options.frequency;
                    if (options.type) node.type = options.type;
                    break;

                case 'gain':
                    node = this.audioContext.createGain();
                    if (options.gain !== undefined) node.gain.value = options.gain;
                    break;

                case 'filter':
                    node = this.audioContext.createBiquadFilter();
                    if (options.type) node.type = options.type;
                    if (options.frequency) node.frequency.value = options.frequency;
                    if (options.Q) node.Q.value = options.Q;
                    break;

                case 'delay':
                    node = this.audioContext.createDelay(options.maxDelay || 1);
                    if (options.delay !== undefined) node.delayTime.value = options.delay;
                    break;

                case 'convolver':
                    node = this.audioContext.createConvolver();
                    if (options.buffer) node.buffer = options.buffer;
                    break;

                default:
                    throw new Error(`Unknown audio node type: ${type}`);
            }

            return node;

        } catch (error) {
            this.handleError('createAudioNode', error);
            return null;
        }
    }
}

// Export for both CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundEnvironmentPlugin;
} else if (typeof window !== 'undefined') {
    window.SoundEnvironmentPlugin = SoundEnvironmentPlugin;
}