/**
 * Base Plugin class that all plugins must extend
 * Provides common functionality and standardized interface
 */

class BasePlugin {
    constructor({ config, dependencies, eventBus, globalEventBus, moduleManager }) {
        this.config = config || {};
        this.dependencies = dependencies || {};
        this.eventBus = eventBus;
        this.globalEventBus = globalEventBus;
        this.moduleManager = moduleManager;

        this.isInitialized = false;
        this.isEnabled = this.config.enabled !== false;
        this.errorCount = 0;
        this.maxErrors = config.maxErrors || 10;
        this.lastError = null;

        // Performance monitoring
        this.performanceMetrics = {
            initTime: 0,
            averageProcessTime: 0,
            totalCalls: 0,
            errorRate: 0
        };

        // Bind methods to preserve context
        this.safeCall = this.safeCall.bind(this);
        this.handleError = this.handleError.bind(this);
    }

    /**
     * Initialize the plugin - must be implemented by subclasses
     */
    async initialize() {
        throw new Error('initialize() method must be implemented by plugin subclasses');
    }

    /**
     * Process data - override in subclasses as needed
     */
    process(data) {
        if (!this.isEnabled || !this.isInitialized) {
            return data;
        }

        return this.safeCall(() => this.processData(data), data);
    }

    /**
     * Process data implementation - override in subclasses
     */
    processData(data) {
        return data;
    }

    /**
     * Update plugin configuration at runtime
     */
    updateConfig(newConfig) {
        try {
            const oldConfig = { ...this.config };
            this.config = { ...this.config, ...newConfig };

            // Handle enabled state change
            if (newConfig.hasOwnProperty('enabled')) {
                this.setEnabled(newConfig.enabled);
            }

            this.onConfigUpdate(oldConfig, this.config);
            this.eventBus.emit('configUpdated', { oldConfig, newConfig: this.config });

            return true;
        } catch (error) {
            this.handleError('updateConfig', error);
            return false;
        }
    }

    /**
     * Called when configuration is updated - override in subclasses
     */
    onConfigUpdate(oldConfig, newConfig) {
        // Override in subclasses
    }

    /**
     * Enable/disable the plugin
     */
    setEnabled(enabled) {
        const wasEnabled = this.isEnabled;
        this.isEnabled = enabled;

        if (wasEnabled !== enabled) {
            if (enabled) {
                this.onEnabled();
            } else {
                this.onDisabled();
            }

            this.eventBus.emit('enabledChanged', { enabled });
        }
    }

    /**
     * Called when plugin is enabled - override in subclasses
     */
    onEnabled() {
        // Override in subclasses
    }

    /**
     * Called when plugin is disabled - override in subclasses
     */
    onDisabled() {
        // Override in subclasses
    }

    /**
     * Get plugin status and health information
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isEnabled: this.isEnabled,
            errorCount: this.errorCount,
            lastError: this.lastError,
            performance: { ...this.performanceMetrics },
            health: this.getHealthStatus()
        };
    }

    /**
     * Get health status based on error rate and performance
     */
    getHealthStatus() {
        if (this.errorCount >= this.maxErrors) {
            return 'critical';
        } else if (this.performanceMetrics.errorRate > 0.1) {
            return 'degraded';
        } else if (!this.isInitialized) {
            return 'initializing';
        } else if (!this.isEnabled) {
            return 'disabled';
        } else {
            return 'healthy';
        }
    }

    /**
     * Reset error count and metrics
     */
    resetErrors() {
        this.errorCount = 0;
        this.lastError = null;
        this.performanceMetrics.errorRate = 0;
        this.eventBus.emit('errorsReset');
    }

    /**
     * Destroy the plugin - cleanup resources
     */
    async destroy() {
        try {
            this.isEnabled = false;
            await this.cleanup();
            this.eventBus.emit('destroyed');
        } catch (error) {
            this.handleError('destroy', error);
        }
    }

    /**
     * Cleanup resources - override in subclasses
     */
    async cleanup() {
        // Override in subclasses
    }

    /**
     * Safe method call with error handling and performance monitoring
     */
    safeCall(method, fallbackValue = null) {
        const startTime = performance.now();

        try {
            const result = method();
            this.updatePerformanceMetrics(startTime, true);
            return result;
        } catch (error) {
            this.updatePerformanceMetrics(startTime, false);
            this.handleError('safeCall', error);
            return fallbackValue;
        }
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(startTime, success) {
        const duration = performance.now() - startTime;
        this.performanceMetrics.totalCalls++;

        // Update average process time
        const totalTime = this.performanceMetrics.averageProcessTime * (this.performanceMetrics.totalCalls - 1) + duration;
        this.performanceMetrics.averageProcessTime = totalTime / this.performanceMetrics.totalCalls;

        // Update error rate
        if (!success) {
            this.errorCount++;
        }
        this.performanceMetrics.errorRate = this.errorCount / this.performanceMetrics.totalCalls;
    }

    /**
     * Handle errors with automatic degradation
     */
    handleError(operation, error) {
        this.errorCount++;
        this.lastError = {
            operation,
            message: error.message,
            stack: error.stack,
            timestamp: Date.now()
        };

        const errorInfo = {
            plugin: this.constructor.name,
            operation,
            error: error.message,
            errorCount: this.errorCount,
            maxErrors: this.maxErrors
        };

        // Auto-disable if too many errors
        if (this.errorCount >= this.maxErrors) {
            this.setEnabled(false);
            errorInfo.autoDisabled = true;
            console.error(`Plugin ${this.constructor.name} auto-disabled due to excessive errors`);
        }

        this.eventBus.emit('error', errorInfo);
        this.globalEventBus.emit('plugin:error', errorInfo);

        console.error(`Plugin ${this.constructor.name} error in ${operation}:`, error);
    }

    /**
     * Log debug information
     */
    debug(message, data = null) {
        if (this.config.debug) {
            console.log(`[${this.constructor.name}] ${message}`, data);
        }
        this.eventBus.emit('debug', { message, data });
    }

    /**
     * Emit events through the plugin's event bus
     */
    emit(event, data) {
        this.eventBus.emit(event, data);
    }

    /**
     * Listen to events through the plugin's event bus
     */
    on(event, callback, options) {
        return this.eventBus.on(event, callback, options);
    }

    /**
     * Get plugin metadata
     */
    static getMetadata() {
        return {
            name: 'BasePlugin',
            version: '1.0.0',
            description: 'Base class for all plugins',
            author: 'System',
            category: 'core',
            dependencies: [],
            configSchema: {}
        };
    }

    /**
     * Validate plugin configuration
     */
    static validateConfig(config) {
        // Basic validation - override in subclasses
        return {
            valid: true,
            errors: []
        };
    }

    /**
     * Get default configuration
     */
    static getDefaultConfig() {
        return {
            enabled: true,
            debug: false,
            maxErrors: 10
        };
    }
}

// Export for both CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BasePlugin;
} else if (typeof window !== 'undefined') {
    window.BasePlugin = BasePlugin;
}