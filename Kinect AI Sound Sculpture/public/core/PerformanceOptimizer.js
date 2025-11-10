/**
 * Performance Optimization System for Real-time Multi-user Operation
 * Manages frame rates, memory usage, and resource allocation
 */

class PerformanceOptimizer {
    constructor(eventBus, config = {}) {
        this.eventBus = eventBus;
        this.config = {
            targetFPS: 60,
            minFPS: 30,
            maxMemoryUsage: 100 * 1024 * 1024, // 100MB
            adaptiveQuality: true,
            autoGarbageCollection: true,
            performanceReporting: true,
            maxParticipants: 8,
            ...config
        };

        this.performanceMetrics = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0,
            cpuUsage: 0,
            activeParticipants: 0,
            renderTime: 0,
            audioLatency: 0,
            networkLatency: 0
        };

        this.performanceHistory = [];
        this.qualitySettings = this.getDefaultQualitySettings();
        this.currentQualityLevel = 'high';
        this.isOptimizing = false;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.resourcePools = new Map();

        this.initializePerformanceMonitoring();
        this.setupQualityLevels();
        this.initializeResourcePools();
    }

    /**
     * Initialize performance monitoring
     */
    initializePerformanceMonitoring() {
        // FPS monitoring
        this.fpsMonitor = {
            lastTime: performance.now(),
            frameCount: 0,
            fps: 0
        };

        // Memory monitoring
        this.memoryMonitor = {
            lastCheck: Date.now(),
            checkInterval: 5000, // 5 seconds
            history: []
        };

        // Start monitoring loops
        this.startFPSMonitoring();
        this.startMemoryMonitoring();
        this.startAdaptiveOptimization();

        console.log('PerformanceOptimizer: Monitoring initialized');
    }

    /**
     * Setup quality levels for adaptive performance
     */
    setupQualityLevels() {
        this.qualityLevels = {
            ultra: {
                particles: { count: 1000, trails: true, complexity: 1.0 },
                visual: { effects: true, shadows: true, antialiasing: true },
                audio: { spatialAudio: true, reverb: 1.0, maxVoices: 32 },
                processing: { aiProcessing: true, coordinationAnalysis: true },
                ui: { animations: true, transitions: true }
            },
            high: {
                particles: { count: 750, trails: true, complexity: 0.8 },
                visual: { effects: true, shadows: true, antialiasing: false },
                audio: { spatialAudio: true, reverb: 0.8, maxVoices: 24 },
                processing: { aiProcessing: true, coordinationAnalysis: true },
                ui: { animations: true, transitions: true }
            },
            medium: {
                particles: { count: 500, trails: true, complexity: 0.6 },
                visual: { effects: true, shadows: false, antialiasing: false },
                audio: { spatialAudio: true, reverb: 0.5, maxVoices: 16 },
                processing: { aiProcessing: true, coordinationAnalysis: false },
                ui: { animations: true, transitions: false }
            },
            low: {
                particles: { count: 250, trails: false, complexity: 0.4 },
                visual: { effects: false, shadows: false, antialiasing: false },
                audio: { spatialAudio: false, reverb: 0.3, maxVoices: 12 },
                processing: { aiProcessing: false, coordinationAnalysis: false },
                ui: { animations: false, transitions: false }
            },
            minimal: {
                particles: { count: 100, trails: false, complexity: 0.2 },
                visual: { effects: false, shadows: false, antialiasing: false },
                audio: { spatialAudio: false, reverb: 0.1, maxVoices: 8 },
                processing: { aiProcessing: false, coordinationAnalysis: false },
                ui: { animations: false, transitions: false }
            }
        };

        this.qualitySettings = this.qualityLevels[this.currentQualityLevel];
    }

    /**
     * Initialize resource pools for object reuse
     */
    initializeResourcePools() {
        // Object pools for frequently created/destroyed objects
        this.resourcePools.set('particles', {
            pool: [],
            maxSize: 1000,
            createFn: () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 1, active: false }),
            resetFn: (obj) => { obj.active = false; obj.life = 1; }
        });

        this.resourcePools.set('audioNodes', {
            pool: [],
            maxSize: 50,
            createFn: () => null, // Will be set by audio engine
            resetFn: (node) => { if (node && node.disconnect) node.disconnect(); }
        });

        this.resourcePools.set('vectors', {
            pool: [],
            maxSize: 100,
            createFn: () => ({ x: 0, y: 0, z: 0 }),
            resetFn: (vec) => { vec.x = vec.y = vec.z = 0; }
        });

        console.log('PerformanceOptimizer: Resource pools initialized');
    }

    /**
     * Start FPS monitoring
     */
    startFPSMonitoring() {
        const measureFPS = () => {
            const now = performance.now();
            this.frameCount++;

            if (now - this.fpsMonitor.lastTime >= 1000) {
                this.performanceMetrics.fps = Math.round(
                    (this.frameCount * 1000) / (now - this.fpsMonitor.lastTime)
                );
                this.frameCount = 0;
                this.fpsMonitor.lastTime = now;

                // Record frame time
                this.performanceMetrics.frameTime = 1000 / this.performanceMetrics.fps;

                this.eventBus.emit('performance:fps_update', {
                    fps: this.performanceMetrics.fps,
                    frameTime: this.performanceMetrics.frameTime
                });
            }

            requestAnimationFrame(measureFPS);
        };

        requestAnimationFrame(measureFPS);
    }

    /**
     * Start memory monitoring
     */
    startMemoryMonitoring() {
        const measureMemory = () => {
            if (performance.memory) {
                this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize;

                // Record memory usage history
                this.memoryMonitor.history.push({
                    timestamp: Date.now(),
                    usage: this.performanceMetrics.memoryUsage
                });

                // Keep only last 60 entries (5 minutes of data)
                if (this.memoryMonitor.history.length > 60) {
                    this.memoryMonitor.history.shift();
                }

                // Check for memory pressure
                if (this.performanceMetrics.memoryUsage > this.config.maxMemoryUsage) {
                    this.handleMemoryPressure();
                }

                this.eventBus.emit('performance:memory_update', {
                    usage: this.performanceMetrics.memoryUsage,
                    limit: this.config.maxMemoryUsage,
                    pressure: this.performanceMetrics.memoryUsage / this.config.maxMemoryUsage
                });
            }

            setTimeout(measureMemory, this.memoryMonitor.checkInterval);
        };

        measureMemory();
    }

    /**
     * Start adaptive optimization
     */
    startAdaptiveOptimization() {
        const optimize = () => {
            if (this.config.adaptiveQuality && !this.isOptimizing) {
                this.performAdaptiveOptimization();
            }

            // Record performance history
            this.recordPerformanceSnapshot();

            setTimeout(optimize, 2000); // Check every 2 seconds
        };

        optimize();
    }

    /**
     * Perform adaptive optimization based on current performance
     */
    performAdaptiveOptimization() {
        this.isOptimizing = true;

        try {
            const currentFPS = this.performanceMetrics.fps;
            const targetFPS = this.config.targetFPS;
            const minFPS = this.config.minFPS;

            // Determine if we need to adjust quality
            let newQualityLevel = this.currentQualityLevel;

            if (currentFPS < minFPS) {
                // Performance is poor, reduce quality
                newQualityLevel = this.getLowerQualityLevel(this.currentQualityLevel);
            } else if (currentFPS > targetFPS * 1.2) {
                // Performance is good, try higher quality
                newQualityLevel = this.getHigherQualityLevel(this.currentQualityLevel);
            }

            // Consider participant count
            const participantLoad = this.performanceMetrics.activeParticipants / this.config.maxParticipants;
            if (participantLoad > 0.8) {
                newQualityLevel = this.getLowerQualityLevel(newQualityLevel);
            }

            // Apply quality changes if needed
            if (newQualityLevel !== this.currentQualityLevel) {
                this.setQualityLevel(newQualityLevel);
            }

            // Additional optimizations
            this.optimizeResourceUsage();

        } catch (error) {
            console.error('PerformanceOptimizer: Error during adaptive optimization', error);
        } finally {
            this.isOptimizing = false;
        }
    }

    /**
     * Set quality level and apply settings
     */
    setQualityLevel(level) {
        if (!this.qualityLevels[level]) return;

        const oldLevel = this.currentQualityLevel;
        this.currentQualityLevel = level;
        this.qualitySettings = this.qualityLevels[level];

        console.log(`PerformanceOptimizer: Quality level changed from ${oldLevel} to ${level}`);

        // Apply quality settings to all systems
        this.applyQualitySettings();

        this.eventBus.emit('performance:quality_changed', {
            oldLevel,
            newLevel: level,
            settings: this.qualitySettings
        });
    }

    /**
     * Apply quality settings to all systems
     */
    applyQualitySettings() {
        // Apply particle settings
        this.eventBus.emit('visual:update_particles', this.qualitySettings.particles);

        // Apply visual settings
        this.eventBus.emit('visual:update_effects', this.qualitySettings.visual);

        // Apply audio settings
        this.eventBus.emit('audio:update_quality', this.qualitySettings.audio);

        // Apply processing settings
        this.eventBus.emit('processing:update_settings', this.qualitySettings.processing);

        // Apply UI settings
        this.eventBus.emit('ui:update_settings', this.qualitySettings.ui);
    }

    /**
     * Optimize resource usage
     */
    optimizeResourceUsage() {
        // Garbage collection hint
        if (this.config.autoGarbageCollection && window.gc) {
            window.gc();
        }

        // Clean up resource pools
        this.cleanupResourcePools();

        // Optimize audio graph
        this.eventBus.emit('audio:optimize');

        // Clean up visual resources
        this.eventBus.emit('visual:cleanup');
    }

    /**
     * Handle memory pressure
     */
    handleMemoryPressure() {
        console.warn('PerformanceOptimizer: Memory pressure detected, reducing quality');

        // Immediately reduce quality
        const lowerLevel = this.getLowerQualityLevel(this.currentQualityLevel);
        this.setQualityLevel(lowerLevel);

        // Force cleanup
        this.forceCleanup();

        this.eventBus.emit('performance:memory_pressure', {
            usage: this.performanceMetrics.memoryUsage,
            limit: this.config.maxMemoryUsage
        });
    }

    /**
     * Force aggressive cleanup
     */
    forceCleanup() {
        // Clear all resource pools
        for (const [name, pool] of this.resourcePools.entries()) {
            pool.pool.length = 0;
        }

        // Request systems to cleanup
        this.eventBus.emit('system:force_cleanup');

        // Garbage collection hint
        if (window.gc) {
            window.gc();
        }
    }

    /**
     * Resource pool management
     */
    getFromPool(poolName) {
        const pool = this.resourcePools.get(poolName);
        if (!pool) return null;

        if (pool.pool.length > 0) {
            return pool.pool.pop();
        } else {
            return pool.createFn();
        }
    }

    returnToPool(poolName, object) {
        const pool = this.resourcePools.get(poolName);
        if (!pool || pool.pool.length >= pool.maxSize) return;

        pool.resetFn(object);
        pool.pool.push(object);
    }

    cleanupResourcePools() {
        for (const [name, pool] of this.resourcePools.entries()) {
            // Keep pool size reasonable
            if (pool.pool.length > pool.maxSize * 0.5) {
                pool.pool.length = Math.floor(pool.maxSize * 0.5);
            }
        }
    }

    /**
     * Quality level navigation
     */
    getLowerQualityLevel(currentLevel) {
        const levels = ['minimal', 'low', 'medium', 'high', 'ultra'];
        const currentIndex = levels.indexOf(currentLevel);
        return currentIndex > 0 ? levels[currentIndex - 1] : currentLevel;
    }

    getHigherQualityLevel(currentLevel) {
        const levels = ['minimal', 'low', 'medium', 'high', 'ultra'];
        const currentIndex = levels.indexOf(currentLevel);
        return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : currentLevel;
    }

    /**
     * Performance metrics recording
     */
    recordPerformanceSnapshot() {
        const snapshot = {
            timestamp: Date.now(),
            fps: this.performanceMetrics.fps,
            frameTime: this.performanceMetrics.frameTime,
            memoryUsage: this.performanceMetrics.memoryUsage,
            qualityLevel: this.currentQualityLevel,
            activeParticipants: this.performanceMetrics.activeParticipants
        };

        this.performanceHistory.push(snapshot);

        // Keep only last 300 snapshots (10 minutes at 2-second intervals)
        if (this.performanceHistory.length > 300) {
            this.performanceHistory.shift();
        }

        // Report performance if enabled
        if (this.config.performanceReporting) {
            this.eventBus.emit('performance:snapshot', snapshot);
        }
    }

    /**
     * Update performance metrics from external sources
     */
    updateMetrics(metrics) {
        Object.assign(this.performanceMetrics, metrics);
    }

    /**
     * Get performance report
     */
    getPerformanceReport() {
        const recentHistory = this.performanceHistory.slice(-30); // Last minute
        const avgFPS = recentHistory.reduce((sum, s) => sum + s.fps, 0) / recentHistory.length || 0;
        const avgFrameTime = recentHistory.reduce((sum, s) => sum + s.frameTime, 0) / recentHistory.length || 0;

        return {
            current: { ...this.performanceMetrics },
            averages: {
                fps: Math.round(avgFPS),
                frameTime: avgFrameTime.toFixed(2)
            },
            quality: {
                level: this.currentQualityLevel,
                settings: this.qualitySettings
            },
            health: this.getPerformanceHealth(),
            recommendations: this.getPerformanceRecommendations()
        };
    }

    /**
     * Get performance health status
     */
    getPerformanceHealth() {
        const fps = this.performanceMetrics.fps;
        const memoryPressure = this.performanceMetrics.memoryUsage / this.config.maxMemoryUsage;

        if (fps < this.config.minFPS || memoryPressure > 0.9) {
            return 'critical';
        } else if (fps < this.config.targetFPS * 0.8 || memoryPressure > 0.7) {
            return 'poor';
        } else if (fps >= this.config.targetFPS) {
            return 'excellent';
        } else {
            return 'good';
        }
    }

    /**
     * Get performance recommendations
     */
    getPerformanceRecommendations() {
        const recommendations = [];
        const fps = this.performanceMetrics.fps;
        const memoryPressure = this.performanceMetrics.memoryUsage / this.config.maxMemoryUsage;

        if (fps < this.config.minFPS) {
            recommendations.push('Reduce visual quality or participant count');
        }

        if (memoryPressure > 0.8) {
            recommendations.push('Consider reducing particle count or clearing browser cache');
        }

        if (this.performanceMetrics.activeParticipants > this.config.maxParticipants * 0.8) {
            recommendations.push('Approaching maximum participant limit');
        }

        return recommendations;
    }

    /**
     * Manual quality control
     */
    forceQualityLevel(level) {
        if (this.qualityLevels[level]) {
            this.config.adaptiveQuality = false;
            this.setQualityLevel(level);
            console.log(`PerformanceOptimizer: Manual quality level set to ${level}`);
        }
    }

    enableAdaptiveQuality() {
        this.config.adaptiveQuality = true;
        console.log('PerformanceOptimizer: Adaptive quality enabled');
    }

    /**
     * Get default quality settings
     */
    getDefaultQualitySettings() {
        return this.qualityLevels.high;
    }

    /**
     * Cleanup and shutdown
     */
    destroy() {
        this.isOptimizing = false;
        this.performanceHistory = [];

        for (const pool of this.resourcePools.values()) {
            pool.pool.length = 0;
        }

        console.log('PerformanceOptimizer: Destroyed');
    }
}

// Export for both CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
} else if (typeof window !== 'undefined') {
    window.PerformanceOptimizer = PerformanceOptimizer;
}