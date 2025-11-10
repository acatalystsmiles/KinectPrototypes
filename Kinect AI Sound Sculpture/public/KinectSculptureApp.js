/**
 * Kinect Sound Sculpture - Modular Application
 * Main application class that orchestrates all modules with clean separation of concerns
 */

class KinectSculptureApp {
    constructor() {
        this.isInitialized = false;
        this.eventBus = null;
        this.configManager = null;
        this.moduleManager = null;
        this.errorHandler = null;
        this.performanceOptimizer = null;

        this.modules = new Map();
        this.initializationState = 'not_started'; // not_started, initializing, completed, error
        this.shutdownInProgress = false;

        this.bindEvents();
    }

    /**
     * Initialize the application
     */
    async initialize() {
        if (this.isInitialized || this.initializationState === 'initializing') {
            return;
        }

        this.initializationState = 'initializing';

        try {
            console.log('🎭 Kinect Sound Sculpture - Starting Modular Application');
            console.log('========================================================');

            // 1. Initialize core systems
            await this.initializeCoreComponents();

            // 2. Load configuration
            await this.loadConfiguration();

            // 3. Setup error handling
            await this.setupErrorHandling();

            // 4. Initialize performance optimization
            await this.setupPerformanceOptimization();

            // 5. Register all modules
            await this.registerModules();

            // 6. Initialize modules
            await this.initializeModules();

            // 7. Start the application
            await this.start();

            this.isInitialized = true;
            this.initializationState = 'completed';

            console.log('✅ Kinect Sound Sculpture - Initialization Complete');
            console.log('🎵 System ready for museum deployment');

        } catch (error) {
            this.initializationState = 'error';
            console.error('❌ Kinect Sound Sculpture - Initialization Failed:', error);
            await this.handleInitializationError(error);
            throw error;
        }
    }

    /**
     * Initialize core components
     */
    async initializeCoreComponents() {
        console.log('🔧 Initializing core components...');

        // Initialize event bus
        this.eventBus = new EventBus();
        this.eventBus.setDebugMode(false); // Will be set by config

        // Initialize configuration manager
        this.configManager = new ConfigManager();
        await this.configManager.initialize();

        // Initialize module manager
        this.moduleManager = new ModuleManager(this.eventBus);

        console.log('✅ Core components initialized');
    }

    /**
     * Load and apply configuration
     */
    async loadConfiguration() {
        console.log('⚙️ Loading configuration...');

        const config = this.configManager.getConfig();

        // Apply debug settings
        this.eventBus.setDebugMode(config.system.debug);

        // Setup configuration watchers
        this.configManager.watch('system.debug', (enabled) => {
            this.eventBus.setDebugMode(enabled);
        });

        console.log('✅ Configuration loaded:', {
            environment: this.configManager.environment,
            debug: config.system.debug,
            audio: config.audio.enabled,
            visual: config.visual.enabled
        });
    }

    /**
     * Setup error handling
     */
    async setupErrorHandling() {
        console.log('🛡️ Setting up error handling...');

        const errorConfig = this.configManager.getConfig('system');
        this.errorHandler = new ErrorHandler(this.eventBus, errorConfig);

        // Set error handler for module manager
        this.moduleManager.setErrorHandler((error) => {
            this.errorHandler.handleError(error);
        });

        // Listen for system errors
        this.eventBus.on('system:error', (error) => {
            console.error('System Error:', error);
        });

        this.eventBus.on('system:degraded_mode_enter', (data) => {
            console.warn('System entering degraded mode:', data);
            this.handleDegradedMode(data);
        });

        console.log('✅ Error handling configured');
    }

    /**
     * Setup performance optimization
     */
    async setupPerformanceOptimization() {
        console.log('⚡ Setting up performance optimization...');

        const perfConfig = this.configManager.getConfig('system.performance');
        this.performanceOptimizer = new PerformanceOptimizer(this.eventBus, perfConfig);

        // Listen for performance events
        this.eventBus.on('performance:quality_changed', (data) => {
            console.log(`Performance: Quality changed to ${data.newLevel}`);
        });

        this.eventBus.on('performance:memory_pressure', (data) => {
            console.warn('Performance: Memory pressure detected');
        });

        console.log('✅ Performance optimization configured');
    }

    /**
     * Register all modules
     */
    async registerModules() {
        console.log('📦 Registering modules...');

        const config = this.configManager.getConfig();

        // Core modules
        this.registerCoreModules(config);

        // Audio modules
        this.registerAudioModules(config);

        // Visual modules
        this.registerVisualModules(config);

        // Analysis modules
        this.registerAnalysisModules(config);

        // Environment plugins
        this.registerEnvironmentPlugins(config);

        console.log('✅ All modules registered');
    }

    /**
     * Register core modules
     */
    registerCoreModules(config) {
        // Network/Socket module
        this.moduleManager.registerModule(
            'networkManager',
            NetworkManager,
            {
                ...config.network,
                serverUrl: window.location.origin,
                enabled: true,
                critical: true
            },
            []
        );

        // Data processor
        this.moduleManager.registerModule(
            'dataProcessor',
            DataProcessor,
            {
                enabled: true,
                smoothing: config.movement.smoothing,
                processingRate: 60
            },
            ['networkManager']
        );
    }

    /**
     * Register audio modules
     */
    registerAudioModules(config) {
        if (!config.audio.enabled) return;

        // Audio engine
        this.moduleManager.registerModule(
            'audioEngine',
            ImmersiveAudioEngine,
            {
                ...config.audio,
                enabled: true,
                critical: true
            },
            []
        );

        // Spatial audio layers
        this.moduleManager.registerModule(
            'spatialAudio',
            SpatialAudioLayers,
            {
                enabled: config.audio.spatialAudio,
                maxLayers: 8
            },
            ['audioEngine']
        );

        // Sound environment manager
        this.moduleManager.registerModule(
            'environmentManager',
            SoundEnvironmentManager,
            {
                ...config.audio.environments,
                enabled: true
            },
            ['audioEngine', 'spatialAudio']
        );
    }

    /**
     * Register visual modules
     */
    registerVisualModules(config) {
        if (!config.visual.enabled) return;

        // Visual renderer
        this.moduleManager.registerModule(
            'visualRenderer',
            VisualRenderer,
            {
                ...config.visual,
                canvas: document.getElementById('skeletonCanvas'),
                enabled: true
            },
            []
        );

        // Particle system
        this.moduleManager.registerModule(
            'particleSystem',
            ParticleSystem,
            {
                ...config.visual.particles,
                enabled: config.visual.particles.enabled
            },
            ['visualRenderer']
        );

        // Visual effects
        this.moduleManager.registerModule(
            'visualEffects',
            VisualEffects,
            {
                ...config.visual.effects,
                enabled: config.visual.effects.enabled
            },
            ['visualRenderer', 'particleSystem']
        );
    }

    /**
     * Register analysis modules
     */
    registerAnalysisModules(config) {
        // AI movement interpreter
        this.moduleManager.registerModule(
            'aiInterpreter',
            AIMovementInterpreter,
            {
                ...config.movement,
                enabled: true
            },
            ['dataProcessor']
        );

        // Multi-person interaction manager
        this.moduleManager.registerModule(
            'multiPersonManager',
            MultiPersonInteractionManager,
            {
                ...config.multiPerson,
                enabled: config.multiPerson.enabled
            },
            ['aiInterpreter']
        );

        // Gesture recognition
        this.moduleManager.registerModule(
            'gestureRecognition',
            GestureRecognition,
            {
                enabled: true,
                sensitivity: config.movement.sensitivity
            },
            ['aiInterpreter']
        );

        // Musical intelligence module
        this.moduleManager.registerModule(
            'musicalIntelligence',
            MusicalIntelligenceModule,
            {
                enabled: config.musical?.enabled !== false,
                learningRate: config.musical?.learningRate || 0.1,
                complexityTargets: config.musical?.complexityTargets || {}
            },
            ['aiInterpreter', 'gestureRecognition']
        );

        // Adaptive learning module
        this.moduleManager.registerModule(
            'adaptiveLearning',
            AdaptiveLearningModule,
            {
                enabled: config.learning?.enabled !== false,
                learningRate: config.learning?.learningRate || 0.1,
                bufferSize: config.learning?.bufferSize || 50,
                updateInterval: config.learning?.updateInterval || 5000
            },
            ['aiInterpreter', 'gestureRecognition', 'multiPersonManager']
        );
    }

    /**
     * Register environment plugins
     */
    registerEnvironmentPlugins(config) {
        if (!config.audio.enabled || !config.audio.environments.enabled) return;

        // Forest environment
        this.moduleManager.registerModule(
            'forestEnvironment',
            ForestEnvironmentPlugin,
            {
                ...ForestEnvironmentPlugin.getDefaultConfig(),
                enabled: true
            },
            ['audioEngine', 'environmentManager']
        );

        // Additional environments can be registered here
        // Space environment, Ocean environment, etc.
    }

    /**
     * Initialize all modules
     */
    async initializeModules() {
        console.log('🚀 Initializing modules...');

        const results = await this.moduleManager.initializeModules();

        // Store module references for easy access
        for (const [name, result] of Object.entries(results)) {
            if (result.success) {
                this.modules.set(name, result.instance);
            } else {
                console.warn(`Module ${name} failed to initialize:`, result.error);
            }
        }

        console.log('✅ Module initialization complete');
        return results;
    }

    /**
     * Start the application
     */
    async start() {
        console.log('▶️ Starting application...');

        // Setup data flow
        this.setupDataFlow();

        // Setup UI event handlers
        this.setupUIEventHandlers();

        // Setup performance monitoring
        this.setupPerformanceMonitoring();

        // Auto-start features
        const config = this.configManager.getConfig();
        if (config.installation.autoStart) {
            await this.autoStart();
        }

        // Emit application started event
        this.eventBus.emit('app:started', {
            timestamp: Date.now(),
            modules: Array.from(this.modules.keys()),
            config: config
        });

        console.log('▶️ Application started successfully');
    }

    /**
     * Setup data flow between modules
     */
    setupDataFlow() {
        // Data flow: Network → Processor → AI → MultiPerson → Audio/Visual

        this.eventBus.on('network:data', (data) => {
            const processor = this.modules.get('dataProcessor');
            if (processor) {
                processor.processRawData(data);
            }
        });

        this.eventBus.on('data:processed', (data) => {
            // Send to AI interpreter
            const ai = this.modules.get('aiInterpreter');
            if (ai) {
                const enhancedData = ai.processMovementData(data);
                this.eventBus.emit('movement:analyzed', enhancedData);
            }
        });

        this.eventBus.on('movement:analyzed', (data) => {
            // Send to multi-person manager
            const multiPerson = this.modules.get('multiPersonManager');
            if (multiPerson) {
                const interactionData = multiPerson.processMultiPersonData(data);
                this.eventBus.emit('interaction:processed', interactionData);
            } else {
                this.eventBus.emit('interaction:processed', data);
            }
        });

        this.eventBus.on('interaction:processed', (data) => {
            // Send to learning systems
            const adaptiveLearning = this.modules.get('adaptiveLearning');
            if (adaptiveLearning) {
                adaptiveLearning.processInteractionData(data);
            }

            const musicalIntelligence = this.modules.get('musicalIntelligence');
            if (musicalIntelligence) {
                musicalIntelligence.processInteractionData(data);
            }

            // Send to audio systems
            const audio = this.modules.get('audioEngine');
            if (audio) {
                audio.processMovementData(data);
            }

            const envManager = this.modules.get('environmentManager');
            if (envManager) {
                envManager.processMovementData(data);
            }

            // Send to visual systems
            const visual = this.modules.get('visualRenderer');
            if (visual) {
                visual.processMovementData(data);
            }

            const particles = this.modules.get('particleSystem');
            if (particles) {
                particles.processMovementData(data);
            }

            // Update performance metrics
            this.performanceOptimizer.updateMetrics({
                activeParticipants: data.skeletons?.length || 0
            });
        });
    }

    /**
     * Setup UI event handlers
     */
    setupUIEventHandlers() {
        // Quality level controls
        const qualitySelector = document.getElementById('qualityLevel');
        if (qualitySelector) {
            qualitySelector.addEventListener('change', (e) => {
                this.performanceOptimizer.forceQualityLevel(e.target.value);
            });
        }

        // Module enable/disable controls
        document.querySelectorAll('[data-module-toggle]').forEach(element => {
            element.addEventListener('change', (e) => {
                const moduleName = e.target.dataset.moduleToggle;
                this.moduleManager.setModuleEnabled(moduleName, e.target.checked);
            });
        });

        // Configuration controls
        document.querySelectorAll('[data-config-path]').forEach(element => {
            element.addEventListener('change', (e) => {
                const path = e.target.dataset.configPath;
                const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                this.configManager.updateConfig(path, value);
            });
        });
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Update performance display
        this.eventBus.on('performance:fps_update', (data) => {
            const fpsElement = document.getElementById('fpsCounter');
            if (fpsElement) {
                fpsElement.textContent = data.fps;
            }
        });

        // Update system health display
        setInterval(() => {
            this.updateSystemHealthDisplay();
        }, 5000);
    }

    /**
     * Auto-start functionality for museum deployment
     */
    async autoStart() {
        console.log('🎬 Auto-starting for museum deployment...');

        // Start audio if enabled
        const audio = this.modules.get('audioEngine');
        if (audio && !audio.isPlaying) {
            try {
                await audio.start();
                console.log('🎵 Audio auto-started');
            } catch (error) {
                console.log('🎵 Audio auto-start failed (user interaction required)');
            }
        }

        // Enable attract mode if configured
        const config = this.configManager.getConfig('installation.attractMode');
        if (config.enabled) {
            this.startAttractMode();
        }
    }

    /**
     * Start attract mode for museum installation
     */
    startAttractMode() {
        const config = this.configManager.getConfig('installation.attractMode');

        setInterval(() => {
            if (this.isSystemIdle()) {
                this.eventBus.emit('attract:activate', {
                    volume: config.volume,
                    duration: 10000
                });
            }
        }, config.interval);
    }

    /**
     * Check if system is idle
     */
    isSystemIdle() {
        const activeParticipants = this.performanceOptimizer.performanceMetrics.activeParticipants;
        return activeParticipants === 0;
    }

    /**
     * Handle degraded mode
     */
    handleDegradedMode(data) {
        // Show user notification
        this.showSystemNotification('System performance degraded - some features may be reduced', 'warning');

        // Update UI to reflect degraded state
        document.body.classList.add('degraded-mode');
    }

    /**
     * Update system health display
     */
    updateSystemHealthDisplay() {
        const healthReport = this.errorHandler.getHealthReport();
        const perfReport = this.performanceOptimizer.getPerformanceReport();

        // Update health indicator
        const healthElement = document.getElementById('systemHealth');
        if (healthElement) {
            healthElement.className = `health-indicator ${healthReport.overall}`;
            healthElement.textContent = healthReport.overall;
        }

        // Update performance indicator
        const perfElement = document.getElementById('performanceHealth');
        if (perfElement) {
            perfElement.className = `performance-indicator ${perfReport.health}`;
            perfElement.textContent = `${perfReport.current.fps} FPS`;
        }
    }

    /**
     * Show system notification
     */
    showSystemNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        this.eventBus.emit('ui:notification', { message, type });
    }

    /**
     * Handle initialization error
     */
    async handleInitializationError(error) {
        console.error('🚨 Initialization Error - Attempting graceful degradation');

        // Show error to user
        this.showSystemNotification('System initialization error - switching to safe mode', 'error');

        // Try to start in safe mode with minimal features
        try {
            await this.startSafeMode();
        } catch (safeError) {
            console.error('🚨 Safe mode startup failed:', safeError);
            this.showSystemNotification('System startup failed - please refresh the page', 'error');
        }
    }

    /**
     * Start in safe mode with minimal features
     */
    async startSafeMode() {
        console.log('🛡️ Starting in safe mode...');

        // Disable non-essential modules
        const essentialModules = ['networkManager', 'dataProcessor', 'visualRenderer'];

        for (const [name, module] of this.modules.entries()) {
            if (!essentialModules.includes(name)) {
                this.moduleManager.setModuleEnabled(name, false);
            }
        }

        // Force minimal quality
        this.performanceOptimizer.forceQualityLevel('minimal');

        document.body.classList.add('safe-mode');
        this.showSystemNotification('Running in safe mode', 'warning');
    }

    /**
     * Graceful shutdown
     */
    async shutdown() {
        if (this.shutdownInProgress) return;

        this.shutdownInProgress = true;
        console.log('🔄 Shutting down application...');

        try {
            // Emit shutdown event
            this.eventBus.emit('app:shutdown_start');

            // Stop all modules
            if (this.moduleManager) {
                await this.moduleManager.shutdown();
            }

            // Cleanup core systems
            if (this.performanceOptimizer) {
                this.performanceOptimizer.destroy();
            }

            // Clear event bus
            if (this.eventBus) {
                this.eventBus.removeAllListeners();
            }

            this.isInitialized = false;
            console.log('✅ Application shutdown complete');

        } catch (error) {
            console.error('Error during shutdown:', error);
        } finally {
            this.shutdownInProgress = false;
        }
    }

    /**
     * Bind window events
     */
    bindEvents() {
        // Handle page unload
        window.addEventListener('beforeunload', () => {
            this.shutdown();
        });

        // Handle visibility change (for museum deployment)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.eventBus?.emit('app:hidden');
            } else {
                this.eventBus?.emit('app:visible');
            }
        });
    }

    /**
     * Get application status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            initializationState: this.initializationState,
            moduleCount: this.modules.size,
            systemHealth: this.errorHandler?.getHealthReport(),
            performance: this.performanceOptimizer?.getPerformanceReport(),
            configuration: this.configManager?.getConfig()
        };
    }
}

// Export for both CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KinectSculptureApp;
} else if (typeof window !== 'undefined') {
    window.KinectSculptureApp = KinectSculptureApp;
}