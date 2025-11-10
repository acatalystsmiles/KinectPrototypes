/**
 * Comprehensive Error Handling and Graceful Degradation System
 * Provides robust error handling, reporting, and system recovery
 */

class ErrorHandler {
    constructor(eventBus, config = {}) {
        this.eventBus = eventBus;
        this.config = {
            maxErrors: 50,
            errorWindow: 60000, // 1 minute
            criticalErrorThreshold: 5,
            autoRecovery: true,
            reportingEnabled: true,
            gracefulDegradation: true,
            ...config
        };

        this.errors = [];
        this.errorCounts = new Map();
        this.criticalSystems = new Set(['audioEngine', 'movementAnalysis', 'moduleManager']);
        this.degradationLevels = new Map();
        this.recoveryAttempts = new Map();
        this.isInDegradedMode = false;

        this.setupErrorCategories();
        this.setupRecoveryStrategies();
        this.initializeGlobalErrorHandling();
    }

    /**
     * Setup error categories for classification
     */
    setupErrorCategories() {
        this.errorCategories = {
            SYSTEM: {
                severity: 'critical',
                autoRecover: true,
                degradationLevel: 3
            },
            AUDIO: {
                severity: 'high',
                autoRecover: true,
                degradationLevel: 2
            },
            VISUAL: {
                severity: 'medium',
                autoRecover: true,
                degradationLevel: 1
            },
            NETWORK: {
                severity: 'medium',
                autoRecover: true,
                degradationLevel: 1
            },
            USER_INPUT: {
                severity: 'low',
                autoRecover: false,
                degradationLevel: 0
            },
            PLUGIN: {
                severity: 'medium',
                autoRecover: true,
                degradationLevel: 1
            },
            CONFIGURATION: {
                severity: 'high',
                autoRecover: true,
                degradationLevel: 2
            }
        };
    }

    /**
     * Setup recovery strategies for different error types
     */
    setupRecoveryStrategies() {
        this.recoveryStrategies = {
            AUDIO: [
                { action: 'resetAudioContext', timeout: 2000 },
                { action: 'switchToSafeMode', timeout: 5000 },
                { action: 'disableAudioFeatures', timeout: 0 }
            ],
            VISUAL: [
                { action: 'clearCanvas', timeout: 1000 },
                { action: 'resetRenderer', timeout: 3000 },
                { action: 'disableVisualEffects', timeout: 0 }
            ],
            NETWORK: [
                { action: 'reconnect', timeout: 5000 },
                { action: 'switchToOfflineMode', timeout: 10000 },
                { action: 'useLocalFallback', timeout: 0 }
            ],
            PLUGIN: [
                { action: 'restartPlugin', timeout: 3000 },
                { action: 'disablePlugin', timeout: 0 }
            ],
            SYSTEM: [
                { action: 'softRestart', timeout: 5000 },
                { action: 'emergencyFallback', timeout: 0 }
            ]
        };
    }

    /**
     * Initialize global error handling
     */
    initializeGlobalErrorHandling() {
        // Handle uncaught JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError({
                category: 'SYSTEM',
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack,
                type: 'uncaught_exception'
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                category: 'SYSTEM',
                message: event.reason?.message || 'Unhandled promise rejection',
                stack: event.reason?.stack,
                type: 'unhandled_promise_rejection'
            });
        });

        // Handle audio context errors
        if (window.AudioContext || window.webkitAudioContext) {
            const originalAudioContext = window.AudioContext || window.webkitAudioContext;
            const errorHandler = this;

            class WrappedAudioContext extends originalAudioContext {
                constructor(...args) {
                    super(...args);
                    this.addEventListener('statechange', () => {
                        if (this.state === 'interrupted' || this.state === 'suspended') {
                            errorHandler.handleError({
                                category: 'AUDIO',
                                message: `Audio context state changed to ${this.state}`,
                                type: 'audio_context_state'
                            });
                        }
                    });
                }
            }

            window.AudioContext = WrappedAudioContext;
            if (window.webkitAudioContext) {
                window.webkitAudioContext = WrappedAudioContext;
            }
        }

        console.log('ErrorHandler: Global error handling initialized');
    }

    /**
     * Handle an error with classification and recovery
     */
    handleError(errorInfo) {
        try {
            const error = this.classifyError(errorInfo);
            this.recordError(error);

            console.error('ErrorHandler: Handling error', error);

            // Check for error rate limits
            if (this.isErrorRateLimitExceeded(error)) {
                this.triggerEmergencyShutdown(error);
                return;
            }

            // Emit error event
            this.eventBus.emit('system:error', error);

            // Attempt recovery if enabled
            if (this.config.autoRecovery && this.shouldAttemptRecovery(error)) {
                this.attemptRecovery(error);
            }

            // Update degradation level
            this.updateDegradationLevel(error);

            // Report error if enabled
            if (this.config.reportingEnabled) {
                this.reportError(error);
            }

        } catch (handlingError) {
            console.error('ErrorHandler: Error while handling error', handlingError);
            this.triggerEmergencyFallback();
        }
    }

    /**
     * Classify error by category and severity
     */
    classifyError(errorInfo) {
        const timestamp = Date.now();
        const category = errorInfo.category || this.inferErrorCategory(errorInfo);
        const categoryInfo = this.errorCategories[category] || this.errorCategories.SYSTEM;

        return {
            id: this.generateErrorId(),
            timestamp,
            category,
            severity: categoryInfo.severity,
            message: errorInfo.message || 'Unknown error',
            source: errorInfo.source || 'unknown',
            stack: errorInfo.stack,
            type: errorInfo.type || 'generic',
            context: errorInfo.context || {},
            recoverable: categoryInfo.autoRecover,
            degradationLevel: categoryInfo.degradationLevel
        };
    }

    /**
     * Infer error category from error information
     */
    inferErrorCategory(errorInfo) {
        const message = (errorInfo.message || '').toLowerCase();
        const source = (errorInfo.source || '').toLowerCase();

        if (message.includes('audio') || source.includes('audio') || message.includes('webaudio')) {
            return 'AUDIO';
        } else if (message.includes('canvas') || message.includes('webgl') || source.includes('visual')) {
            return 'VISUAL';
        } else if (message.includes('network') || message.includes('fetch') || message.includes('websocket')) {
            return 'NETWORK';
        } else if (message.includes('plugin') || source.includes('plugin')) {
            return 'PLUGIN';
        } else if (message.includes('config') || source.includes('config')) {
            return 'CONFIGURATION';
        } else {
            return 'SYSTEM';
        }
    }

    /**
     * Record error for tracking and analysis
     */
    recordError(error) {
        // Add to error history
        this.errors.push(error);

        // Maintain error history size
        if (this.errors.length > this.config.maxErrors) {
            this.errors.shift();
        }

        // Update error counts
        const key = `${error.category}_${error.type}`;
        const count = this.errorCounts.get(key) || 0;
        this.errorCounts.set(key, count + 1);

        // Clean old error counts
        this.cleanOldErrorCounts();
    }

    /**
     * Check if error rate limit is exceeded
     */
    isErrorRateLimitExceeded(error) {
        const recentErrors = this.getRecentErrors(this.config.errorWindow);
        const criticalErrors = recentErrors.filter(e => e.severity === 'critical');

        return criticalErrors.length >= this.config.criticalErrorThreshold;
    }

    /**
     * Determine if recovery should be attempted
     */
    shouldAttemptRecovery(error) {
        if (!error.recoverable) return false;

        const recoveryKey = `${error.category}_${error.type}`;
        const attempts = this.recoveryAttempts.get(recoveryKey) || 0;

        // Limit recovery attempts per error type
        return attempts < 3;
    }

    /**
     * Attempt error recovery
     */
    async attemptRecovery(error) {
        const recoveryKey = `${error.category}_${error.type}`;
        const attempts = this.recoveryAttempts.get(recoveryKey) || 0;
        this.recoveryAttempts.set(recoveryKey, attempts + 1);

        const strategies = this.recoveryStrategies[error.category] || [];

        for (let i = attempts; i < strategies.length; i++) {
            const strategy = strategies[i];

            try {
                console.log(`ErrorHandler: Attempting recovery strategy '${strategy.action}' for ${error.category}`);

                const success = await this.executeRecoveryStrategy(strategy, error);

                if (success) {
                    console.log(`ErrorHandler: Recovery successful with strategy '${strategy.action}'`);
                    this.eventBus.emit('system:recovery_success', {
                        error,
                        strategy: strategy.action,
                        attempts: i + 1
                    });
                    return true;
                }

            } catch (recoveryError) {
                console.error(`ErrorHandler: Recovery strategy '${strategy.action}' failed`, recoveryError);
            }

            // Wait before trying next strategy
            if (strategy.timeout > 0 && i < strategies.length - 1) {
                await this.delay(strategy.timeout);
            }
        }

        console.error(`ErrorHandler: All recovery strategies failed for ${error.category}`);
        this.eventBus.emit('system:recovery_failed', { error, attempts: strategies.length });
        return false;
    }

    /**
     * Execute a specific recovery strategy
     */
    async executeRecoveryStrategy(strategy, error) {
        switch (strategy.action) {
            case 'resetAudioContext':
                return this.resetAudioContext();

            case 'switchToSafeMode':
                return this.switchToSafeMode();

            case 'disableAudioFeatures':
                return this.disableAudioFeatures();

            case 'clearCanvas':
                return this.clearCanvas();

            case 'resetRenderer':
                return this.resetRenderer();

            case 'disableVisualEffects':
                return this.disableVisualEffects();

            case 'reconnect':
                return this.attemptReconnection();

            case 'switchToOfflineMode':
                return this.switchToOfflineMode();

            case 'useLocalFallback':
                return this.useLocalFallback();

            case 'restartPlugin':
                return this.restartPlugin(error.context?.pluginName);

            case 'disablePlugin':
                return this.disablePlugin(error.context?.pluginName);

            case 'softRestart':
                return this.performSoftRestart();

            case 'emergencyFallback':
                return this.triggerEmergencyFallback();

            default:
                console.warn(`ErrorHandler: Unknown recovery strategy '${strategy.action}'`);
                return false;
        }
    }

    /**
     * Update system degradation level
     */
    updateDegradationLevel(error) {
        const currentLevel = this.degradationLevels.get(error.category) || 0;
        const newLevel = Math.max(currentLevel, error.degradationLevel);

        this.degradationLevels.set(error.category, newLevel);

        // Calculate overall degradation
        const maxDegradation = Math.max(...this.degradationLevels.values(), 0);
        const wasInDegradedMode = this.isInDegradedMode;
        this.isInDegradedMode = maxDegradation > 0;

        if (!wasInDegradedMode && this.isInDegradedMode) {
            console.warn('ErrorHandler: System entering degraded mode');
            this.eventBus.emit('system:degraded_mode_enter', {
                level: maxDegradation,
                categories: Array.from(this.degradationLevels.entries())
            });
        }

        this.applyGracefulDegradation(maxDegradation);
    }

    /**
     * Apply graceful degradation based on error severity
     */
    applyGracefulDegradation(level) {
        if (!this.config.gracefulDegradation) return;

        const degradationActions = {
            1: () => {
                // Level 1: Reduce visual quality
                this.eventBus.emit('system:reduce_visual_quality');
            },
            2: () => {
                // Level 2: Disable non-essential features
                this.eventBus.emit('system:disable_non_essential');
            },
            3: () => {
                // Level 3: Minimal functionality only
                this.eventBus.emit('system:minimal_mode');
            }
        };

        for (let i = 1; i <= level; i++) {
            if (degradationActions[i]) {
                degradationActions[i]();
            }
        }
    }

    /**
     * Recovery strategy implementations
     */
    async resetAudioContext() {
        try {
            this.eventBus.emit('audio:reset_context');
            await this.delay(1000);
            return true;
        } catch (error) {
            return false;
        }
    }

    async switchToSafeMode() {
        try {
            this.eventBus.emit('system:safe_mode');
            return true;
        } catch (error) {
            return false;
        }
    }

    async disableAudioFeatures() {
        this.eventBus.emit('audio:disable');
        return true;
    }

    async clearCanvas() {
        try {
            this.eventBus.emit('visual:clear_canvas');
            return true;
        } catch (error) {
            return false;
        }
    }

    async resetRenderer() {
        try {
            this.eventBus.emit('visual:reset_renderer');
            await this.delay(2000);
            return true;
        } catch (error) {
            return false;
        }
    }

    async disableVisualEffects() {
        this.eventBus.emit('visual:disable_effects');
        return true;
    }

    async attemptReconnection() {
        try {
            this.eventBus.emit('network:reconnect');
            await this.delay(3000);
            return true;
        } catch (error) {
            return false;
        }
    }

    async switchToOfflineMode() {
        this.eventBus.emit('system:offline_mode');
        return true;
    }

    async useLocalFallback() {
        this.eventBus.emit('system:local_fallback');
        return true;
    }

    async restartPlugin(pluginName) {
        if (!pluginName) return false;
        try {
            this.eventBus.emit('plugin:restart', { name: pluginName });
            await this.delay(2000);
            return true;
        } catch (error) {
            return false;
        }
    }

    async disablePlugin(pluginName) {
        if (!pluginName) return false;
        this.eventBus.emit('plugin:disable', { name: pluginName });
        return true;
    }

    async performSoftRestart() {
        try {
            this.eventBus.emit('system:soft_restart');
            await this.delay(3000);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Emergency procedures
     */
    triggerEmergencyShutdown(error) {
        console.error('ErrorHandler: Triggering emergency shutdown due to excessive errors');
        this.eventBus.emit('system:emergency_shutdown', { cause: error });
        this.isInDegradedMode = true;
    }

    triggerEmergencyFallback() {
        console.error('ErrorHandler: Triggering emergency fallback');
        this.eventBus.emit('system:emergency_fallback');
        return true;
    }

    /**
     * Error reporting
     */
    reportError(error) {
        // In a real deployment, this would send to error reporting service
        const report = {
            timestamp: error.timestamp,
            category: error.category,
            severity: error.severity,
            message: error.message,
            userAgent: navigator.userAgent,
            url: window.location.href,
            stack: error.stack,
            context: error.context
        };

        // For now, just log to console
        console.log('ErrorHandler: Error report', report);

        this.eventBus.emit('system:error_reported', report);
    }

    /**
     * Utility methods
     */
    getRecentErrors(timeWindow) {
        const cutoff = Date.now() - timeWindow;
        return this.errors.filter(error => error.timestamp > cutoff);
    }

    cleanOldErrorCounts() {
        // Clean error counts older than window
        const cutoff = Date.now() - this.config.errorWindow;
        for (const [key, count] of this.errorCounts.entries()) {
            const recentCount = this.errors.filter(e =>
                e.timestamp > cutoff &&
                `${e.category}_${e.type}` === key
            ).length;

            if (recentCount === 0) {
                this.errorCounts.delete(key);
            } else {
                this.errorCounts.set(key, recentCount);
            }
        }
    }

    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get system health report
     */
    getHealthReport() {
        const recentErrors = this.getRecentErrors(this.config.errorWindow);
        const criticalErrors = recentErrors.filter(e => e.severity === 'critical');

        return {
            overall: this.isInDegradedMode ? 'degraded' : 'healthy',
            degradationLevel: Math.max(...this.degradationLevels.values(), 0),
            totalErrors: this.errors.length,
            recentErrors: recentErrors.length,
            criticalErrors: criticalErrors.length,
            errorRate: recentErrors.length / (this.config.errorWindow / 1000),
            categories: Object.fromEntries(this.degradationLevels.entries()),
            recoveryAttempts: Object.fromEntries(this.recoveryAttempts.entries())
        };
    }

    /**
     * Reset error handler state
     */
    reset() {
        this.errors = [];
        this.errorCounts.clear();
        this.degradationLevels.clear();
        this.recoveryAttempts.clear();
        this.isInDegradedMode = false;

        console.log('ErrorHandler: State reset');
        this.eventBus.emit('system:error_handler_reset');
    }
}

// Export for both CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
} else if (typeof window !== 'undefined') {
    window.ErrorHandler = ErrorHandler;
}