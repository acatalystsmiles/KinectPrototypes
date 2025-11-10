/**
 * Configuration Management System
 * Handles runtime configuration, environment-specific settings, and live updates
 */

class ConfigManager {
    constructor() {
        this.configs = new Map();
        this.watchers = new Map();
        this.environment = this.detectEnvironment();
        this.validationRules = new Map();
        this.defaultConfig = this.getDefaultConfig();
        this.isInitialized = false;
    }

    /**
     * Initialize configuration system
     */
    async initialize() {
        if (this.isInitialized) return;

        console.log('ConfigManager: Initializing...');

        // Load configuration hierarchy
        await this.loadConfigurations();

        // Setup validation rules
        this.setupValidationRules();

        // Validate all configurations
        this.validateAllConfigs();

        this.isInitialized = true;
        console.log('ConfigManager: Initialized successfully');
    }

    /**
     * Load configurations from multiple sources
     */
    async loadConfigurations() {
        // Load in priority order: defaults -> environment -> runtime -> URL params

        // 1. Default configuration
        this.setConfig('default', this.defaultConfig);

        // 2. Environment-specific configuration
        const envConfig = await this.loadEnvironmentConfig();
        if (envConfig) {
            this.setConfig('environment', envConfig);
        }

        // 3. Runtime configuration (from localStorage)
        const runtimeConfig = this.loadRuntimeConfig();
        if (runtimeConfig) {
            this.setConfig('runtime', runtimeConfig);
        }

        // 4. URL parameters
        const urlConfig = this.loadUrlConfig();
        if (urlConfig && Object.keys(urlConfig).length > 0) {
            this.setConfig('url', urlConfig);
        }

        console.log('ConfigManager: Loaded configurations for environment:', this.environment);
    }

    /**
     * Get default configuration
     */
    getDefaultConfig() {
        return {
            // System Configuration
            system: {
                debug: false,
                performance: {
                    targetFPS: 60,
                    maxParticles: 1000,
                    audioBufferSize: 1024
                },
                errorReporting: true,
                gracefulDegradation: true
            },

            // Audio Configuration
            audio: {
                enabled: true,
                masterVolume: 0.7,
                spatialAudio: true,
                latencyOptimization: true,
                context: {
                    sampleRate: 44100,
                    bufferSize: 1024
                },
                environments: {
                    discovery: true,
                    autoTransition: true,
                    crossfadeDuration: 2000
                }
            },

            // Movement Analysis Configuration
            movement: {
                enabled: true,
                smoothing: 0.8,
                sensitivity: 1.0,
                coordinationThreshold: 0.7,
                patternLearning: {
                    enabled: true,
                    minOccurrences: 3,
                    similarityThreshold: 0.8
                }
            },

            // Visual Configuration
            visual: {
                enabled: true,
                particles: {
                    enabled: true,
                    count: 500,
                    trails: true,
                    trailLength: 50
                },
                effects: {
                    coordination: true,
                    duetAuras: true,
                    environmentTransitions: true
                },
                ui: {
                    showMetrics: false,
                    showDebug: false,
                    theme: 'dark'
                }
            },

            // Multi-person Interaction Configuration
            multiPerson: {
                enabled: true,
                coordination: {
                    threshold: 0.7,
                    syncWindow: 1000,
                    minDuration: 2000
                },
                duetModes: {
                    enabled: true,
                    autoActivation: true,
                    compatibilityThreshold: 0.7
                },
                groupChoreography: {
                    enabled: true,
                    minParticipants: 3,
                    detectionSensitivity: 0.75
                }
            },

            // Museum/Installation Configuration
            installation: {
                autoStart: true,
                idleTimeout: 300000, // 5 minutes
                resetOnIdle: true,
                maxParticipants: 8,
                welcomeMessage: true,
                attractMode: {
                    enabled: true,
                    interval: 30000,
                    volume: 0.3
                }
            },

            // Network Configuration
            network: {
                reconnectInterval: 5000,
                maxReconnectAttempts: 10,
                timeout: 10000
            }
        };
    }

    /**
     * Load environment-specific configuration
     */
    async loadEnvironmentConfig() {
        try {
            const envConfigUrl = `/config/${this.environment}.json`;
            const response = await fetch(envConfigUrl);

            if (response.ok) {
                return await response.json();
            } else {
                console.log(`ConfigManager: No environment config found for ${this.environment}`);
                return null;
            }
        } catch (error) {
            console.warn('ConfigManager: Failed to load environment config:', error.message);
            return null;
        }
    }

    /**
     * Load runtime configuration from localStorage
     */
    loadRuntimeConfig() {
        try {
            const stored = localStorage.getItem('kinect-sculpture-config');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.warn('ConfigManager: Failed to load runtime config:', error.message);
            return null;
        }
    }

    /**
     * Load configuration from URL parameters
     */
    loadUrlConfig() {
        const urlParams = new URLSearchParams(window.location.search);
        const config = {};

        // Parse URL parameters into nested config object
        for (const [key, value] of urlParams.entries()) {
            this.setNestedValue(config, key, this.parseValue(value));
        }

        return config;
    }

    /**
     * Set configuration
     */
    setConfig(source, config) {
        this.configs.set(source, this.deepClone(config));
        this.notifyWatchers();
    }

    /**
     * Get merged configuration
     */
    getConfig(path = null) {
        // Merge configurations in priority order
        const merged = this.mergeConfigs([
            this.configs.get('default') || {},
            this.configs.get('environment') || {},
            this.configs.get('runtime') || {},
            this.configs.get('url') || {}
        ]);

        if (path) {
            return this.getNestedValue(merged, path);
        }

        return merged;
    }

    /**
     * Update configuration at runtime
     */
    updateConfig(path, value, persist = true) {
        try {
            const runtimeConfig = this.configs.get('runtime') || {};
            this.setNestedValue(runtimeConfig, path, value);
            this.setConfig('runtime', runtimeConfig);

            if (persist) {
                this.saveRuntimeConfig();
            }

            console.log(`ConfigManager: Updated config ${path} =`, value);
            return true;

        } catch (error) {
            console.error('ConfigManager: Failed to update config:', error.message);
            return false;
        }
    }

    /**
     * Save runtime configuration to localStorage
     */
    saveRuntimeConfig() {
        try {
            const runtimeConfig = this.configs.get('runtime');
            if (runtimeConfig) {
                localStorage.setItem('kinect-sculpture-config', JSON.stringify(runtimeConfig));
            }
        } catch (error) {
            console.error('ConfigManager: Failed to save runtime config:', error.message);
        }
    }

    /**
     * Watch for configuration changes
     */
    watch(path, callback) {
        if (!this.watchers.has(path)) {
            this.watchers.set(path, new Set());
        }

        this.watchers.get(path).add(callback);

        // Return unwatch function
        return () => {
            const pathWatchers = this.watchers.get(path);
            if (pathWatchers) {
                pathWatchers.delete(callback);
                if (pathWatchers.size === 0) {
                    this.watchers.delete(path);
                }
            }
        };
    }

    /**
     * Notify watchers of configuration changes
     */
    notifyWatchers() {
        const currentConfig = this.getConfig();

        for (const [path, callbacks] of this.watchers.entries()) {
            const value = this.getNestedValue(currentConfig, path);
            for (const callback of callbacks) {
                try {
                    callback(value, path);
                } catch (error) {
                    console.error('ConfigManager: Error in watcher callback:', error);
                }
            }
        }
    }

    /**
     * Setup validation rules
     */
    setupValidationRules() {
        this.validationRules.set('audio.masterVolume', (value) =>
            typeof value === 'number' && value >= 0 && value <= 1
        );

        this.validationRules.set('system.performance.targetFPS', (value) =>
            typeof value === 'number' && value > 0 && value <= 120
        );

        this.validationRules.set('movement.sensitivity', (value) =>
            typeof value === 'number' && value >= 0 && value <= 2
        );

        this.validationRules.set('installation.maxParticipants', (value) =>
            typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= 20
        );
    }

    /**
     * Validate configuration value
     */
    validateConfig(path, value) {
        const validator = this.validationRules.get(path);
        if (validator) {
            return validator(value);
        }
        return true; // No validation rule means it's valid
    }

    /**
     * Validate all configurations
     */
    validateAllConfigs() {
        const config = this.getConfig();
        const errors = [];

        for (const [path, validator] of this.validationRules.entries()) {
            const value = this.getNestedValue(config, path);
            if (value !== undefined && !validator(value)) {
                errors.push(`Invalid value for ${path}: ${value}`);
            }
        }

        if (errors.length > 0) {
            console.warn('ConfigManager: Configuration validation errors:', errors);
        }

        return errors;
    }

    /**
     * Detect current environment
     */
    detectEnvironment() {
        // Check URL hostname
        const hostname = window.location.hostname;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        } else if (hostname.includes('staging') || hostname.includes('test')) {
            return 'staging';
        } else {
            return 'production';
        }
    }

    /**
     * Reset to defaults
     */
    resetToDefaults() {
        this.configs.clear();
        this.configs.set('default', this.defaultConfig);
        localStorage.removeItem('kinect-sculpture-config');
        this.notifyWatchers();
        console.log('ConfigManager: Reset to defaults');
    }

    /**
     * Export current configuration
     */
    exportConfig() {
        return JSON.stringify(this.getConfig(), null, 2);
    }

    /**
     * Import configuration
     */
    importConfig(configJson) {
        try {
            const config = JSON.parse(configJson);
            this.setConfig('imported', config);
            this.saveRuntimeConfig();
            console.log('ConfigManager: Imported configuration');
            return true;
        } catch (error) {
            console.error('ConfigManager: Failed to import config:', error.message);
            return false;
        }
    }

    // Utility methods

    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    mergeConfigs(configs) {
        const result = {};
        for (const config of configs) {
            this.deepMerge(result, config);
        }
        return result;
    }

    deepMerge(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                this.deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!(key in current)) current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    parseValue(value) {
        // Try to parse as JSON first
        try {
            return JSON.parse(value);
        } catch {
            // If not JSON, return as string
            return value;
        }
    }
}

// Export for both CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
} else if (typeof window !== 'undefined') {
    window.ConfigManager = ConfigManager;
}