class SystemMonitor {
    constructor() {
        // Monitoring categories
        this.monitoring = {
            system: {
                cpu: { current: 0, average: 0, peak: 0, history: [] },
                memory: { current: 0, average: 0, peak: 0, history: [] },
                temperature: { current: 0, peak: 0, threshold: 75 },
                uptime: Date.now(),
                restarts: 0
            },

            kinect: {
                connection: 'disconnected',
                frameRate: { current: 0, target: 30, drops: 0 },
                dataRate: { bytesPerSecond: 0, packetsPerSecond: 0 },
                tracking: { bodiesDetected: 0, confidence: 0 },
                errors: { count: 0, lastError: null, errorRate: 0 }
            },

            audio: {
                engine: 'stopped',
                latency: { current: 0, target: 40, max: 0 },
                bufferHealth: { underruns: 0, overruns: 0, current: 0 },
                layers: { active: 0, total: 4 },
                volume: { master: 0, peak: 0, rms: 0 },
                spatialAudio: { enabled: false, processing: 0 }
            },

            visual: {
                renderer: 'idle',
                frameRate: { current: 0, target: 60, drops: 0 },
                particleSystem: { active: 0, total: 0, performance: 1.0 },
                effects: { active: [], performance: 1.0 },
                memoryUsage: { textures: 0, buffers: 0, total: 0 }
            },

            ai: {
                interpreter: 'disabled',
                processingTime: { current: 0, average: 0, max: 0 },
                gestureRecognition: { active: true, confidence: 0 },
                learning: { enabled: true, memorySize: 0 },
                musicalIntelligence: { active: true, phrases: 0 },
                performance: { efficiency: 1.0, errors: 0 }
            },

            network: {
                websocket: 'disconnected',
                socketio: 'disconnected',
                dataTransfer: { inbound: 0, outbound: 0 },
                connections: { active: 0, total: 0 },
                latency: { current: 0, average: 0 }
            }
        };

        // Alert system
        this.alerts = {
            active: [],
            history: [],
            thresholds: {
                cpu: { warning: 70, critical: 85 },
                memory: { warning: 75, critical: 90 },
                temperature: { warning: 65, critical: 75 },
                audioLatency: { warning: 60, critical: 100 },
                frameDrops: { warning: 5, critical: 10 },
                errorRate: { warning: 0.1, critical: 0.2 }
            },
            notifications: {
                enabled: true,
                email: false,
                sound: true,
                visual: true
            }
        };

        // Logging system
        this.logging = {
            enabled: true,
            levels: ['error', 'warn', 'info', 'debug'],
            currentLevel: 'info',
            maxLogEntries: 1000,
            logs: [],
            categories: {
                system: true,
                kinect: true,
                audio: true,
                visual: true,
                ai: true,
                session: true,
                performance: true
            }
        };

        // Performance baselines
        this.baselines = {
            established: false,
            establishedAt: null,
            targets: {
                cpuUsage: 30,        // %
                memoryUsage: 60,     // %
                audioLatency: 40,    // ms
                frameRate: 30,       // fps
                aiProcessing: 8,     // ms
                networkLatency: 20   // ms
            },
            actual: {
                cpuUsage: 0,
                memoryUsage: 0,
                audioLatency: 0,
                frameRate: 0,
                aiProcessing: 0,
                networkLatency: 0
            }
        };

        // Monitoring intervals
        this.intervals = {
            system: null,
            performance: null,
            alerts: null,
            cleanup: null
        };

        this.startMonitoring();
        console.log('📊 System Monitor initialized');
    }

    startMonitoring() {
        // System monitoring (every 5 seconds)
        this.intervals.system = setInterval(() => {
            this.updateSystemMetrics();
        }, 5000);

        // Performance monitoring (every second)
        this.intervals.performance = setInterval(() => {
            this.updatePerformanceMetrics();
        }, 1000);

        // Alert checking (every 10 seconds)
        this.intervals.alerts = setInterval(() => {
            this.checkAlerts();
        }, 10000);

        // Cleanup (every 5 minutes)
        this.intervals.cleanup = setInterval(() => {
            this.performCleanup();
        }, 300000);

        this.log('info', 'system', 'System monitoring started');
    }

    stopMonitoring() {
        Object.values(this.intervals).forEach(interval => {
            if (interval) clearInterval(interval);
        });
        this.log('info', 'system', 'System monitoring stopped');
    }

    // System metrics collection
    updateSystemMetrics() {
        // Simulate system metrics (in real implementation, would use actual system APIs)
        const system = this.monitoring.system;

        // CPU usage simulation
        system.cpu.current = Math.random() * 40 + 10; // 10-50% range
        system.cpu.history.push({
            timestamp: Date.now(),
            value: system.cpu.current
        });

        if (system.cpu.history.length > 60) { // Keep last 5 minutes
            system.cpu.history.shift();
        }

        system.cpu.average = system.cpu.history.reduce((sum, entry) => sum + entry.value, 0) / system.cpu.history.length;
        system.cpu.peak = Math.max(system.cpu.peak, system.cpu.current);

        // Memory usage simulation
        system.memory.current = Math.random() * 30 + 40; // 40-70% range
        system.memory.history.push({
            timestamp: Date.now(),
            value: system.memory.current
        });

        if (system.memory.history.length > 60) {
            system.memory.history.shift();
        }

        system.memory.average = system.memory.history.reduce((sum, entry) => sum + entry.value, 0) / system.memory.history.length;
        system.memory.peak = Math.max(system.memory.peak, system.memory.current);

        // Temperature simulation
        system.temperature.current = Math.random() * 20 + 35; // 35-55°C range
        system.temperature.peak = Math.max(system.temperature.peak, system.temperature.current);

        this.log('debug', 'system', `CPU: ${system.cpu.current.toFixed(1)}%, Memory: ${system.memory.current.toFixed(1)}%, Temp: ${system.temperature.current.toFixed(1)}°C`);
    }

    updatePerformanceMetrics() {
        // Update real-time performance metrics from other systems
        this.updateKinectMetrics();
        this.updateAudioMetrics();
        this.updateVisualMetrics();
        this.updateAIMetrics();
        this.updateNetworkMetrics();
    }

    updateKinectMetrics() {
        const kinect = this.monitoring.kinect;

        // Simulate Kinect metrics based on system state
        if (window.kinectVisualizer && window.kinectVisualizer.currentData) {
            kinect.connection = 'connected';
            kinect.frameRate.current = Math.random() * 5 + 28; // ~30fps with variation
            kinect.tracking.bodiesDetected = window.kinectVisualizer.currentData.bodies?.length || 0;
            kinect.tracking.confidence = Math.random() * 0.3 + 0.7; // 70-100%
        } else {
            kinect.connection = 'disconnected';
            kinect.frameRate.current = 0;
            kinect.tracking.bodiesDetected = 0;
            kinect.tracking.confidence = 0;
        }

        // Calculate frame drops
        if (kinect.frameRate.current < kinect.frameRate.target * 0.9) {
            kinect.frameRate.drops++;
        }
    }

    updateAudioMetrics() {
        const audio = this.monitoring.audio;

        if (window.soundEngine) {
            audio.engine = window.soundEngine.isPlaying ? 'playing' : 'stopped';
            audio.latency.current = Math.random() * 20 + 30; // 30-50ms simulation
            audio.latency.max = Math.max(audio.latency.max, audio.latency.current);
            audio.volume.master = window.soundEngine.masterVolume || 0;
            audio.layers.active = Object.values(window.soundEngine.layers || {})
                .filter(layer => layer.isActive).length;
        } else {
            audio.engine = 'stopped';
            audio.latency.current = 0;
        }
    }

    updateVisualMetrics() {
        const visual = this.monitoring.visual;

        if (window.kinectVisualizer) {
            visual.renderer = 'active';
            visual.frameRate.current = window.kinectVisualizer.fps || 0;

            if (window.kinectVisualizer.particleSystem) {
                visual.particleSystem.active = window.kinectVisualizer.particleSystem.getActiveParticleCount?.() || 0;
                visual.particleSystem.performance = 1.0 - (visual.particleSystem.active / 1000); // Simulate performance impact
            }

            // Calculate frame drops
            if (visual.frameRate.current < visual.frameRate.target * 0.8) {
                visual.frameRate.drops++;
            }
        } else {
            visual.renderer = 'idle';
            visual.frameRate.current = 0;
        }
    }

    updateAIMetrics() {
        const ai = this.monitoring.ai;

        if (window.kinectVisualizer && window.kinectVisualizer.aiInterpreter) {
            const interpreter = window.kinectVisualizer.aiInterpreter;
            ai.interpreter = interpreter.isEnabled ? 'active' : 'disabled';
            ai.processingTime.current = interpreter.lastProcessTime || 0;
            ai.processingTime.max = Math.max(ai.processingTime.max, ai.processingTime.current);

            // Calculate average processing time
            ai.processingTime.average = (ai.processingTime.average * 0.9) + (ai.processingTime.current * 0.1);

            // Update component status
            ai.gestureRecognition.confidence = Math.random() * 0.3 + 0.7;
            ai.learning.memorySize = interpreter.movementMemory?.getMemorySize?.() || 0;
        } else {
            ai.interpreter = 'disabled';
            ai.processingTime.current = 0;
        }
    }

    updateNetworkMetrics() {
        const network = this.monitoring.network;

        // Simulate network metrics
        if (window.io && window.io.connected) {
            network.socketio = 'connected';
            network.latency.current = Math.random() * 20 + 10; // 10-30ms
            network.latency.average = (network.latency.average * 0.9) + (network.latency.current * 0.1);
        } else {
            network.socketio = 'disconnected';
            network.latency.current = 0;
        }
    }

    // Alert system
    checkAlerts() {
        const newAlerts = [];

        // Check CPU usage
        if (this.monitoring.system.cpu.current > this.alerts.thresholds.cpu.critical) {
            newAlerts.push(this.createAlert('critical', 'system', 'CPU usage critical', {
                current: this.monitoring.system.cpu.current,
                threshold: this.alerts.thresholds.cpu.critical
            }));
        } else if (this.monitoring.system.cpu.current > this.alerts.thresholds.cpu.warning) {
            newAlerts.push(this.createAlert('warning', 'system', 'CPU usage high', {
                current: this.monitoring.system.cpu.current,
                threshold: this.alerts.thresholds.cpu.warning
            }));
        }

        // Check memory usage
        if (this.monitoring.system.memory.current > this.alerts.thresholds.memory.critical) {
            newAlerts.push(this.createAlert('critical', 'system', 'Memory usage critical', {
                current: this.monitoring.system.memory.current,
                threshold: this.alerts.thresholds.memory.critical
            }));
        }

        // Check audio latency
        if (this.monitoring.audio.latency.current > this.alerts.thresholds.audioLatency.critical) {
            newAlerts.push(this.createAlert('critical', 'audio', 'Audio latency too high', {
                current: this.monitoring.audio.latency.current,
                threshold: this.alerts.thresholds.audioLatency.critical
            }));
        }

        // Check Kinect connection
        if (this.monitoring.kinect.connection === 'disconnected') {
            newAlerts.push(this.createAlert('warning', 'kinect', 'Kinect disconnected', {}));
        }

        // Check frame drops
        if (this.monitoring.visual.frameRate.drops > this.alerts.thresholds.frameDrops.critical) {
            newAlerts.push(this.createAlert('critical', 'visual', 'Excessive frame drops', {
                drops: this.monitoring.visual.frameRate.drops
            }));
        }

        // Process new alerts
        newAlerts.forEach(alert => {
            this.addAlert(alert);
        });

        // Auto-resolve alerts that no longer apply
        this.resolveOutdatedAlerts();
    }

    createAlert(severity, category, message, data = {}) {
        return {
            id: this.generateAlertId(),
            severity: severity,
            category: category,
            message: message,
            data: data,
            timestamp: Date.now(),
            resolved: false,
            acknowledgedBy: null,
            acknowledgedAt: null
        };
    }

    addAlert(alert) {
        // Check if similar alert already exists
        const existing = this.alerts.active.find(a =>
            a.category === alert.category &&
            a.message === alert.message &&
            !a.resolved
        );

        if (!existing) {
            this.alerts.active.push(alert);
            this.log('warn', 'alerts', `New ${alert.severity} alert: ${alert.message}`);

            if (this.alerts.notifications.enabled) {
                this.sendNotification(alert);
            }
        }
    }

    resolveAlert(alertId, resolvedBy = 'system') {
        const alert = this.alerts.active.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            alert.resolvedBy = resolvedBy;
            alert.resolvedAt = Date.now();

            // Move to history
            this.alerts.history.push(alert);
            this.alerts.active = this.alerts.active.filter(a => a.id !== alertId);

            this.log('info', 'alerts', `Alert resolved: ${alert.message}`);
        }
    }

    resolveOutdatedAlerts() {
        const now = Date.now();
        const autoResolveTime = 300000; // 5 minutes

        this.alerts.active.forEach(alert => {
            if (now - alert.timestamp > autoResolveTime) {
                // Check if the condition still exists
                const stillValid = this.isAlertStillValid(alert);
                if (!stillValid) {
                    this.resolveAlert(alert.id, 'auto-resolved');
                }
            }
        });
    }

    isAlertStillValid(alert) {
        // Check if the alert condition still exists
        switch (alert.category) {
            case 'system':
                if (alert.message.includes('CPU')) {
                    return this.monitoring.system.cpu.current > this.alerts.thresholds.cpu.warning;
                }
                if (alert.message.includes('Memory')) {
                    return this.monitoring.system.memory.current > this.alerts.thresholds.memory.warning;
                }
                break;

            case 'kinect':
                if (alert.message.includes('disconnected')) {
                    return this.monitoring.kinect.connection === 'disconnected';
                }
                break;

            case 'audio':
                if (alert.message.includes('latency')) {
                    return this.monitoring.audio.latency.current > this.alerts.thresholds.audioLatency.warning;
                }
                break;
        }

        return true; // Default to keeping the alert
    }

    sendNotification(alert) {
        if (this.alerts.notifications.visual) {
            this.showVisualNotification(alert);
        }

        if (this.alerts.notifications.sound) {
            this.playAlertSound(alert);
        }
    }

    showVisualNotification(alert) {
        // Create visual notification (would integrate with UI)
        console.log(`🚨 ${alert.severity.toUpperCase()}: ${alert.message}`);
    }

    playAlertSound(alert) {
        // Play alert sound (would integrate with audio system)
        if (alert.severity === 'critical') {
            console.log('🔊 Playing critical alert sound');
        }
    }

    // Logging system
    log(level, category, message, data = null) {
        if (!this.logging.enabled) return;
        if (!this.logging.categories[category]) return;
        if (this.logging.levels.indexOf(level) > this.logging.levels.indexOf(this.logging.currentLevel)) return;

        const logEntry = {
            timestamp: Date.now(),
            level: level,
            category: category,
            message: message,
            data: data,
            id: this.generateLogId()
        };

        this.logging.logs.push(logEntry);

        // Maintain log size
        if (this.logging.logs.length > this.logging.maxLogEntries) {
            this.logging.logs.shift();
        }

        // Console output
        const timestamp = new Date(logEntry.timestamp).toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`;

        switch (level) {
            case 'error':
                console.error(prefix, message, data);
                break;
            case 'warn':
                console.warn(prefix, message, data);
                break;
            case 'debug':
                console.debug(prefix, message, data);
                break;
            default:
                console.log(prefix, message, data);
        }
    }

    // Performance baseline establishment
    establishBaselines() {
        if (this.baselines.established) return;

        console.log('📊 Establishing performance baselines...');

        // Run for 60 seconds to establish baselines
        const baselineInterval = setInterval(() => {
            this.updatePerformanceMetrics();
        }, 1000);

        setTimeout(() => {
            clearInterval(baselineInterval);

            this.baselines.actual = {
                cpuUsage: this.monitoring.system.cpu.average,
                memoryUsage: this.monitoring.system.memory.average,
                audioLatency: this.monitoring.audio.latency.current,
                frameRate: this.monitoring.visual.frameRate.current,
                aiProcessing: this.monitoring.ai.processingTime.average,
                networkLatency: this.monitoring.network.latency.average
            };

            this.baselines.established = true;
            this.baselines.establishedAt = Date.now();

            console.log('✅ Performance baselines established', this.baselines.actual);
            this.log('info', 'performance', 'Performance baselines established', this.baselines.actual);
        }, 60000);
    }

    // Cleanup and maintenance
    performCleanup() {
        // Clean up old alert history
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        this.alerts.history = this.alerts.history.filter(alert => alert.timestamp > oneWeekAgo);

        // Clean up old logs
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.logging.logs = this.logging.logs.filter(log => log.timestamp > oneDayAgo);

        this.log('debug', 'system', 'Performed monitoring cleanup');
    }

    // Utility functions
    generateAlertId() {
        return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    generateLogId() {
        return 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    // Public API
    getSystemStatus() {
        return {
            monitoring: this.monitoring,
            alerts: {
                active: this.alerts.active.length,
                critical: this.alerts.active.filter(a => a.severity === 'critical').length,
                warnings: this.alerts.active.filter(a => a.severity === 'warning').length
            },
            baselines: this.baselines,
            uptime: Date.now() - this.monitoring.system.uptime,
            lastUpdate: Date.now()
        };
    }

    getAlerts(includePleasant = false) {
        if (includePleasant) {
            return {
                active: this.alerts.active,
                history: this.alerts.history.slice(-20)
            };
        }
        return this.alerts.active;
    }

    getLogs(category = null, level = null, limit = 100) {
        let logs = this.logging.logs;

        if (category) {
            logs = logs.filter(log => log.category === category);
        }

        if (level) {
            logs = logs.filter(log => log.level === level);
        }

        return logs.slice(-limit).reverse(); // Most recent first
    }

    exportMonitoringData(startTime, endTime) {
        return {
            monitoring: this.monitoring,
            alerts: this.alerts.history.filter(alert =>
                alert.timestamp >= startTime && alert.timestamp <= endTime
            ),
            logs: this.logging.logs.filter(log =>
                log.timestamp >= startTime && log.timestamp <= endTime
            ),
            baselines: this.baselines,
            exportTimestamp: Date.now()
        };
    }

    // Configuration
    updateThresholds(newThresholds) {
        Object.assign(this.alerts.thresholds, newThresholds);
        this.log('info', 'system', 'Alert thresholds updated', newThresholds);
    }

    setLogLevel(level) {
        if (this.logging.levels.includes(level)) {
            this.logging.currentLevel = level;
            this.log('info', 'system', `Log level set to ${level}`);
        }
    }

    toggleCategory(category, enabled) {
        this.logging.categories[category] = enabled;
        this.log('info', 'system', `${category} logging ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// Export for use in main application
window.SystemMonitor = SystemMonitor;