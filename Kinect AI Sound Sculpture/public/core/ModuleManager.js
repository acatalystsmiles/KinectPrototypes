/**
 * Module Manager for handling plugin architecture and lifecycle
 * Provides dependency injection and graceful error handling
 */

class ModuleManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.modules = new Map();
        this.dependencies = new Map();
        this.initializationOrder = [];
        this.isInitialized = false;
        this.errorHandler = null;
        this.performanceMonitor = new Map();
    }

    /**
     * Register a module class
     * @param {string} name - Module name
     * @param {class} ModuleClass - Module class constructor
     * @param {Object} config - Module configuration
     * @param {Array} dependencies - Array of dependency module names
     */
    registerModule(name, ModuleClass, config = {}, dependencies = []) {
        try {
            if (this.modules.has(name)) {
                throw new Error(`Module '${name}' is already registered`);
            }

            const moduleDefinition = {
                name,
                ModuleClass,
                config: { ...config },
                dependencies: [...dependencies],
                instance: null,
                status: 'registered',
                errors: [],
                lastError: null,
                initTime: null,
                enabled: config.enabled !== false
            };

            this.modules.set(name, moduleDefinition);
            this.dependencies.set(name, dependencies);

            console.log(`ModuleManager: Registered module '${name}'`, {
                dependencies,
                enabled: moduleDefinition.enabled
            });

            this.eventBus.emit('module:registered', { name, config, dependencies });

        } catch (error) {
            this.handleError('registerModule', error, { name, config, dependencies });
        }
    }

    /**
     * Initialize all modules in dependency order
     */
    async initializeModules() {
        try {
            if (this.isInitialized) {
                console.warn('ModuleManager: Already initialized');
                return;
            }

            console.log('ModuleManager: Starting module initialization...');

            // Calculate initialization order
            this.initializationOrder = this.calculateInitializationOrder();
            console.log('ModuleManager: Initialization order:', this.initializationOrder);

            const results = {};

            // Initialize modules in order
            for (const moduleName of this.initializationOrder) {
                const moduleDefinition = this.modules.get(moduleName);

                if (!moduleDefinition.enabled) {
                    console.log(`ModuleManager: Skipping disabled module '${moduleName}'`);
                    continue;
                }

                try {
                    const startTime = performance.now();
                    const instance = await this.initializeModule(moduleName);
                    const endTime = performance.now();

                    moduleDefinition.initTime = endTime - startTime;
                    this.performanceMonitor.set(moduleName, {
                        initTime: moduleDefinition.initTime,
                        lastUpdate: Date.now()
                    });

                    results[moduleName] = { success: true, instance };

                    console.log(`ModuleManager: Initialized '${moduleName}' in ${moduleDefinition.initTime.toFixed(2)}ms`);

                } catch (error) {
                    moduleDefinition.status = 'error';
                    moduleDefinition.lastError = error;
                    moduleDefinition.errors.push({
                        error: error.message,
                        timestamp: Date.now()
                    });

                    results[moduleName] = { success: false, error: error.message };

                    this.handleError('initializeModule', error, { moduleName });

                    // Continue with other modules unless this is a critical dependency
                    if (!this.isCriticalModule(moduleName)) {
                        console.warn(`ModuleManager: Non-critical module '${moduleName}' failed, continuing...`);
                        continue;
                    } else {
                        throw new Error(`Critical module '${moduleName}' failed to initialize: ${error.message}`);
                    }
                }
            }

            this.isInitialized = true;
            this.eventBus.emit('modules:initialized', results);

            console.log('ModuleManager: All modules initialized successfully');
            return results;

        } catch (error) {
            this.handleError('initializeModules', error);
            throw error;
        }
    }

    /**
     * Initialize a single module
     */
    async initializeModule(name) {
        const moduleDefinition = this.modules.get(name);

        if (!moduleDefinition) {
            throw new Error(`Module '${name}' not found`);
        }

        if (moduleDefinition.instance) {
            return moduleDefinition.instance;
        }

        // Check dependencies are initialized
        for (const depName of moduleDefinition.dependencies) {
            const dep = this.modules.get(depName);
            if (!dep || !dep.instance) {
                throw new Error(`Dependency '${depName}' not initialized for module '${name}'`);
            }
        }

        try {
            moduleDefinition.status = 'initializing';

            // Gather dependency instances
            const dependencies = {};
            for (const depName of moduleDefinition.dependencies) {
                dependencies[depName] = this.modules.get(depName).instance;
            }

            // Create module instance
            const { ModuleClass, config } = moduleDefinition;
            const instance = new ModuleClass({
                config,
                dependencies,
                eventBus: this.eventBus.namespace(name),
                globalEventBus: this.eventBus,
                moduleManager: this
            });

            // Initialize the module
            if (typeof instance.initialize === 'function') {
                await instance.initialize();
            }

            moduleDefinition.instance = instance;
            moduleDefinition.status = 'initialized';

            this.eventBus.emit('module:initialized', { name, instance });

            return instance;

        } catch (error) {
            moduleDefinition.status = 'error';
            throw error;
        }
    }

    /**
     * Get a module instance
     */
    getModule(name) {
        const moduleDefinition = this.modules.get(name);
        return moduleDefinition ? moduleDefinition.instance : null;
    }

    /**
     * Check if a module is available and initialized
     */
    isModuleAvailable(name) {
        const moduleDefinition = this.modules.get(name);
        return moduleDefinition && moduleDefinition.status === 'initialized' && moduleDefinition.instance;
    }

    /**
     * Enable/disable a module
     */
    setModuleEnabled(name, enabled) {
        const moduleDefinition = this.modules.get(name);
        if (moduleDefinition) {
            moduleDefinition.enabled = enabled;
            this.eventBus.emit('module:enabledChanged', { name, enabled });
        }
    }

    /**
     * Restart a module
     */
    async restartModule(name) {
        try {
            const moduleDefinition = this.modules.get(name);
            if (!moduleDefinition) {
                throw new Error(`Module '${name}' not found`);
            }

            // Cleanup existing instance
            if (moduleDefinition.instance) {
                if (typeof moduleDefinition.instance.destroy === 'function') {
                    await moduleDefinition.instance.destroy();
                }
                moduleDefinition.instance = null;
            }

            // Reinitialize
            return await this.initializeModule(name);

        } catch (error) {
            this.handleError('restartModule', error, { name });
            throw error;
        }
    }

    /**
     * Calculate module initialization order using topological sort
     */
    calculateInitializationOrder() {
        const visited = new Set();
        const visiting = new Set();
        const order = [];

        const visit = (moduleName) => {
            if (visited.has(moduleName)) return;
            if (visiting.has(moduleName)) {
                throw new Error(`Circular dependency detected involving module '${moduleName}'`);
            }

            visiting.add(moduleName);

            const dependencies = this.dependencies.get(moduleName) || [];
            for (const dep of dependencies) {
                if (!this.modules.has(dep)) {
                    throw new Error(`Dependency '${dep}' not found for module '${moduleName}'`);
                }
                visit(dep);
            }

            visiting.delete(moduleName);
            visited.add(moduleName);
            order.push(moduleName);
        };

        for (const moduleName of this.modules.keys()) {
            visit(moduleName);
        }

        return order;
    }

    /**
     * Check if a module is critical (affects system stability)
     */
    isCriticalModule(name) {
        const moduleDefinition = this.modules.get(name);
        return moduleDefinition?.config?.critical === true;
    }

    /**
     * Get system health status
     */
    getSystemHealth() {
        const health = {
            overall: 'healthy',
            modules: {},
            errors: [],
            performance: {}
        };

        let hasErrors = false;
        let hasCriticalErrors = false;

        for (const [name, moduleDefinition] of this.modules.entries()) {
            const moduleHealth = {
                status: moduleDefinition.status,
                enabled: moduleDefinition.enabled,
                errors: moduleDefinition.errors.length,
                lastError: moduleDefinition.lastError?.message,
                initTime: moduleDefinition.initTime
            };

            health.modules[name] = moduleHealth;

            if (moduleDefinition.status === 'error') {
                hasErrors = true;
                if (this.isCriticalModule(name)) {
                    hasCriticalErrors = true;
                }
                health.errors.push({
                    module: name,
                    error: moduleDefinition.lastError?.message,
                    critical: this.isCriticalModule(name)
                });
            }

            // Add performance data
            const perfData = this.performanceMonitor.get(name);
            if (perfData) {
                health.performance[name] = perfData;
            }
        }

        if (hasCriticalErrors) {
            health.overall = 'critical';
        } else if (hasErrors) {
            health.overall = 'degraded';
        }

        return health;
    }

    /**
     * Shutdown all modules gracefully
     */
    async shutdown() {
        console.log('ModuleManager: Starting graceful shutdown...');

        // Shutdown in reverse order
        const shutdownOrder = [...this.initializationOrder].reverse();

        for (const name of shutdownOrder) {
            const moduleDefinition = this.modules.get(name);
            if (moduleDefinition?.instance) {
                try {
                    if (typeof moduleDefinition.instance.destroy === 'function') {
                        await moduleDefinition.instance.destroy();
                    }
                    console.log(`ModuleManager: Shutdown module '${name}'`);
                } catch (error) {
                    console.error(`ModuleManager: Error shutting down module '${name}'`, error);
                }
            }
        }

        this.isInitialized = false;
        this.eventBus.emit('modules:shutdown');
        console.log('ModuleManager: Shutdown complete');
    }

    /**
     * Set error handler
     */
    setErrorHandler(handler) {
        this.errorHandler = handler;
    }

    /**
     * Handle errors gracefully
     */
    handleError(operation, error, context = {}) {
        const errorInfo = {
            source: 'ModuleManager',
            operation,
            error: error.message,
            stack: error.stack,
            context,
            timestamp: Date.now()
        };

        if (this.errorHandler) {
            try {
                this.errorHandler(errorInfo);
            } catch (handlerError) {
                console.error('ModuleManager: Error in error handler', handlerError);
            }
        } else {
            console.error('ModuleManager: Error in operation', errorInfo);
        }

        this.eventBus.emit('system:error', errorInfo);
    }
}

// Export for both CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleManager;
} else if (typeof window !== 'undefined') {
    window.ModuleManager = ModuleManager;
}