/**
 * Gesture Recognition Module
 * Wrapper for the existing gesture recognition system
 */

class GestureRecognition {
    constructor({ config, dependencies, eventBus, globalEventBus, moduleManager }) {
        this.config = config || {};
        this.dependencies = dependencies || {};
        this.eventBus = eventBus;
        this.globalEventBus = globalEventBus;
        this.moduleManager = moduleManager;

        this.isInitialized = false;
        this.sensitivity = config.sensitivity || 0.7;
    }

    async initialize() {
        console.log('👋 Initializing Gesture Recognition...');
        this.isInitialized = true;
        console.log('✅ Gesture Recognition initialized');
    }

    processMovementData(data) {
        // Process gesture detection
        const gestures = this.detectGestures(data);
        this.eventBus?.emit('gesture:detected', { gestures, data });
        return data;
    }

    detectGestures(data) {
        // Simple gesture detection placeholder
        return [];
    }

    updateSettings(settings) {
        if (settings.sensitivity !== undefined) {
            this.sensitivity = settings.sensitivity;
        }
    }

    async cleanup() {
        this.isInitialized = false;
    }

    getStatus() {
        return {
            initialized: this.isInitialized,
            sensitivity: this.sensitivity
        };
    }
}

// Export for both CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GestureRecognition;
} else if (typeof window !== 'undefined') {
    window.GestureRecognition = GestureRecognition;
}