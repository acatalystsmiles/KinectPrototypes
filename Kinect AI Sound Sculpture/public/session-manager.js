class SessionManager {
    constructor() {
        // Session tracking
        this.currentSession = null;
        this.sessionHistory = [];
        this.dailyStats = this.initializeDailyStats();

        // Visitor management
        this.activeVisitors = new Map();
        this.visitorQueue = [];
        this.maxSimultaneousVisitors = 6;

        // Session configuration
        this.sessionTimeout = 300000; // 5 minutes default
        this.cleanupInterval = 60000; // 1 minute cleanup cycle
        this.maxDailyVisitors = 500;

        // Analytics collection
        this.analytics = {
            totalSessions: 0,
            avgSessionLength: 0,
            peakConcurrentVisitors: 0,
            mostPopularTimeSlots: new Map(),
            visitorEngagementLevels: [],
            gesturePopularity: new Map(),
            technicalIssues: []
        };

        // Museum operation status
        this.operationStatus = {
            isOpen: true,
            openingTime: '09:00',
            closingTime: '17:00',
            maintenanceMode: false,
            emergencyStop: false,
            staffOverride: false
        };

        // Performance monitoring
        this.performanceMetrics = {
            systemUptime: Date.now(),
            memoryUsage: { current: 0, peak: 0, average: 0 },
            processingLatency: { current: 0, average: 0, max: 0 },
            errorRate: { current: 0, hourly: 0, daily: 0 },
            frameDrops: { count: 0, rate: 0 }
        };

        this.startCleanupTimer();
        this.startPerformanceMonitoring();

        console.log('🏛️ Session Manager initialized for museum operation');
    }

    // Session lifecycle management
    startSession(visitorId, initialData = {}) {
        if (this.operationStatus.maintenanceMode || this.operationStatus.emergencyStop) {
            console.warn('Session start blocked: System in maintenance/emergency mode');
            return null;
        }

        if (this.activeVisitors.size >= this.maxSimultaneousVisitors) {
            this.visitorQueue.push({ visitorId, timestamp: Date.now(), initialData });
            console.log(`👥 Visitor ${visitorId} added to queue (${this.visitorQueue.length} waiting)`);
            return null;
        }

        if (this.dailyStats.totalVisitors >= this.maxDailyVisitors) {
            console.warn('Daily visitor limit reached');
            return null;
        }

        const session = {
            id: this.generateSessionId(),
            visitorId: visitorId,
            startTime: Date.now(),
            endTime: null,
            duration: 0,

            // Visitor tracking
            visitorProfile: {
                type: 'unknown',
                engagementLevel: 0.5,
                preferredMovementStyle: 'unknown',
                favoriteGestures: [],
                sessionCount: 1 // Will be updated based on history
            },

            // Movement data
            movementData: {
                totalMovements: 0,
                gesturesDetected: [],
                musicalPhrasesGenerated: 0,
                avgEnergyLevel: 0,
                peakActivity: 0,
                movementSignatures: []
            },

            // Interaction metrics
            interactionMetrics: {
                timeToFirstMovement: null,
                mostActiveTimePeriod: null,
                collaborativeInteractions: 0,
                uniqueGestures: new Set(),
                musicalEngagement: 0
            },

            // Technical metrics
            technicalData: {
                avgProcessingTime: 0,
                errorCount: 0,
                frameDrops: 0,
                audioLatency: 0,
                systemLoad: 0
            },

            // Context data
            context: {
                timeOfDay: new Date().getHours(),
                dayOfWeek: new Date().getDay(),
                concurrentVisitors: this.activeVisitors.size,
                weatherData: null, // Could be integrated
                specialEvents: []
            },

            ...initialData
        };

        this.activeVisitors.set(visitorId, session);
        this.currentSession = session;
        this.analytics.totalSessions++;
        this.dailyStats.totalVisitors++;
        this.dailyStats.currentVisitors++;

        // Update peak concurrent visitors
        if (this.activeVisitors.size > this.analytics.peakConcurrentVisitors) {
            this.analytics.peakConcurrentVisitors = this.activeVisitors.size;
        }

        // Track time slot popularity
        const timeSlot = this.getTimeSlot(new Date());
        const currentCount = this.analytics.mostPopularTimeSlots.get(timeSlot) || 0;
        this.analytics.mostPopularTimeSlots.set(timeSlot, currentCount + 1);

        console.log(`🎭 Session started: ${session.id} (Visitor: ${visitorId})`);
        this.broadcastSessionUpdate('session_started', session);

        return session;
    }

    endSession(visitorId, endData = {}) {
        const session = this.activeVisitors.get(visitorId);
        if (!session) {
            console.warn(`Attempted to end non-existent session for visitor: ${visitorId}`);
            return null;
        }

        // Finalize session data
        session.endTime = Date.now();
        session.duration = session.endTime - session.startTime;

        // Update analytics
        this.updateSessionAnalytics(session, endData);

        // Archive session
        this.sessionHistory.push({ ...session });
        this.activeVisitors.delete(visitorId);
        this.dailyStats.currentVisitors--;

        // Process visitor queue
        this.processVisitorQueue();

        console.log(`🏁 Session ended: ${session.id} (Duration: ${Math.round(session.duration / 1000)}s)`);
        this.broadcastSessionUpdate('session_ended', session);

        return session;
    }

    updateSession(visitorId, movementData, aiData) {
        const session = this.activeVisitors.get(visitorId);
        if (!session) return;

        const currentTime = Date.now();
        const sessionDuration = currentTime - session.startTime;

        // Update movement tracking
        if (movementData) {
            session.movementData.totalMovements++;

            if (movementData.metrics) {
                session.movementData.avgEnergyLevel =
                    (session.movementData.avgEnergyLevel + movementData.metrics.energyLevel) / 2;

                if (movementData.metrics.energyLevel > session.movementData.peakActivity) {
                    session.movementData.peakActivity = movementData.metrics.energyLevel;
                }
            }

            // Track time to first movement
            if (session.interactionMetrics.timeToFirstMovement === null &&
                movementData.bodies && movementData.bodies.length > 0) {
                session.interactionMetrics.timeToFirstMovement = sessionDuration;
            }
        }

        // Update AI interpretation data
        if (aiData && aiData.ai) {
            const ai = aiData.ai;

            // Track gestures
            if (ai.gestures && ai.gestures.length > 0) {
                ai.gestures.forEach(gesture => {
                    session.movementData.gesturesDetected.push({
                        type: gesture.type,
                        confidence: gesture.confidence,
                        timestamp: currentTime
                    });
                    session.interactionMetrics.uniqueGestures.add(gesture.type);

                    // Update global gesture popularity
                    const currentCount = this.analytics.gesturePopularity.get(gesture.type) || 0;
                    this.analytics.gesturePopularity.set(gesture.type, currentCount + 1);
                });
            }

            // Track musical phrases
            if (ai.musicalPhrases && ai.musicalPhrases.length > 0) {
                session.movementData.musicalPhrasesGenerated += ai.musicalPhrases.length;
                session.interactionMetrics.musicalEngagement += ai.musicalPhrases.length * 0.1;
            }

            // Update visitor profile
            if (ai.visitorProfile) {
                session.visitorProfile.type = ai.visitorProfile.movementStyle;
                session.visitorProfile.engagementLevel = ai.visitorProfile.sessionData?.engagementLevel || 0.5;
            }

            // Track enhanced metrics
            if (ai.enhancedMetrics) {
                session.visitorProfile.preferredMovementStyle = this.analyzeMovementStyle(ai.enhancedMetrics);
            }
        }

        // Check for session timeout
        if (sessionDuration > this.sessionTimeout) {
            console.log(`⏰ Session ${session.id} timed out after ${Math.round(sessionDuration / 1000)}s`);
            this.endSession(visitorId, { reason: 'timeout' });
        }
    }

    // Queue management
    processVisitorQueue() {
        if (this.visitorQueue.length === 0 || this.activeVisitors.size >= this.maxSimultaneousVisitors) {
            return;
        }

        const nextVisitor = this.visitorQueue.shift();
        if (nextVisitor) {
            const waitTime = Date.now() - nextVisitor.timestamp;
            console.log(`👥 Processing queued visitor: ${nextVisitor.visitorId} (waited ${Math.round(waitTime / 1000)}s)`);
            this.startSession(nextVisitor.visitorId, {
                ...nextVisitor.initialData,
                queueWaitTime: waitTime
            });
        }
    }

    // Analytics and reporting
    updateSessionAnalytics(session, endData) {
        // Update average session length
        const totalDuration = this.analytics.avgSessionLength * (this.analytics.totalSessions - 1) + session.duration;
        this.analytics.avgSessionLength = totalDuration / this.analytics.totalSessions;

        // Track engagement levels
        this.analytics.visitorEngagementLevels.push({
            level: session.visitorProfile.engagementLevel,
            duration: session.duration,
            gestureCount: session.movementData.gesturesDetected.length,
            timestamp: session.startTime
        });

        // Update daily statistics
        this.dailyStats.totalSessionTime += session.duration;
        this.dailyStats.avgSessionLength = this.dailyStats.totalSessionTime / this.dailyStats.totalVisitors;

        if (session.duration > this.dailyStats.longestSession) {
            this.dailyStats.longestSession = session.duration;
        }

        if (session.movementData.gesturesDetected.length > this.dailyStats.mostGestures) {
            this.dailyStats.mostGestures = session.movementData.gesturesDetected.length;
        }
    }

    getDailyAnalytics() {
        return {
            ...this.dailyStats,
            currentTime: new Date().toISOString(),
            activeVisitors: this.activeVisitors.size,
            queuedVisitors: this.visitorQueue.length,
            systemUptime: Date.now() - this.performanceMetrics.systemUptime,
            avgEngagement: this.calculateAverageEngagement(),
            topGestures: this.getTopGestures(5),
            timeSlotPopularity: Object.fromEntries(this.analytics.mostPopularTimeSlots)
        };
    }

    getSessionAnalytics(sessionId) {
        // Find session in active or history
        let session = Array.from(this.activeVisitors.values()).find(s => s.id === sessionId);
        if (!session) {
            session = this.sessionHistory.find(s => s.id === sessionId);
        }

        if (!session) return null;

        return {
            ...session,
            isActive: this.activeVisitors.has(session.visitorId),
            analytics: {
                engagementScore: this.calculateEngagementScore(session),
                movementComplexity: this.calculateMovementComplexity(session),
                musicalEngagement: session.interactionMetrics.musicalEngagement,
                socialInteraction: session.interactionMetrics.collaborativeInteractions > 0
            }
        };
    }

    // Museum operation controls
    setOperationHours(openTime, closeTime) {
        this.operationStatus.openingTime = openTime;
        this.operationStatus.closingTime = closeTime;
        console.log(`🕒 Operation hours updated: ${openTime} - ${closeTime}`);
    }

    setMaintenanceMode(enabled, reason = '') {
        this.operationStatus.maintenanceMode = enabled;
        if (enabled) {
            console.log(`🔧 Entering maintenance mode: ${reason}`);
            this.endAllSessions('maintenance');
        } else {
            console.log('✅ Exiting maintenance mode');
        }
        this.broadcastSystemUpdate('maintenance_mode', { enabled, reason });
    }

    emergencyStop(reason = 'Emergency stop activated') {
        this.operationStatus.emergencyStop = true;
        console.error(`🚨 EMERGENCY STOP: ${reason}`);
        this.endAllSessions('emergency');
        this.broadcastSystemUpdate('emergency_stop', { reason });
    }

    resumeOperation() {
        this.operationStatus.emergencyStop = false;
        this.operationStatus.maintenanceMode = false;
        console.log('✅ Normal operation resumed');
        this.broadcastSystemUpdate('operation_resumed', {});
    }

    endAllSessions(reason = 'system_shutdown') {
        const activeSessions = Array.from(this.activeVisitors.keys());
        activeSessions.forEach(visitorId => {
            this.endSession(visitorId, { reason });
        });
        this.visitorQueue = [];
    }

    // Performance monitoring
    startPerformanceMonitoring() {
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 5000); // Update every 5 seconds
    }

    updatePerformanceMetrics() {
        // Memory usage (simulated - in real implementation would use process.memoryUsage())
        const memoryUsage = Math.random() * 100; // Simulated MB
        this.performanceMetrics.memoryUsage.current = memoryUsage;

        if (memoryUsage > this.performanceMetrics.memoryUsage.peak) {
            this.performanceMetrics.memoryUsage.peak = memoryUsage;
        }

        // Calculate average memory usage
        this.performanceMetrics.memoryUsage.average =
            (this.performanceMetrics.memoryUsage.average * 0.9) + (memoryUsage * 0.1);

        // Check for performance issues
        if (memoryUsage > 150) { // Threshold for concern
            this.analytics.technicalIssues.push({
                type: 'high_memory_usage',
                value: memoryUsage,
                timestamp: Date.now()
            });
        }
    }

    // Utility functions
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    getTimeSlot(date) {
        const hour = date.getHours();
        if (hour < 10) return 'morning_early';
        if (hour < 12) return 'morning_late';
        if (hour < 14) return 'afternoon_early';
        if (hour < 16) return 'afternoon_late';
        return 'evening';
    }

    initializeDailyStats() {
        return {
            date: new Date().toDateString(),
            totalVisitors: 0,
            currentVisitors: 0,
            totalSessionTime: 0,
            avgSessionLength: 0,
            longestSession: 0,
            mostGestures: 0,
            systemUptime: 0,
            errorCount: 0
        };
    }

    analyzeMovementStyle(enhancedMetrics) {
        const { intentionality, musicality, expressiveness, complexity, creativity } = enhancedMetrics;

        if (musicality > 0.7) return 'musical';
        if (expressiveness > 0.8) return 'expressive';
        if (complexity > 0.6) return 'complex';
        if (creativity > 0.7) return 'creative';
        if (intentionality > 0.6) return 'deliberate';
        return 'exploratory';
    }

    calculateEngagementScore(session) {
        const durationScore = Math.min(1, session.duration / 180000); // 3 minutes = max
        const gestureScore = Math.min(1, session.movementData.gesturesDetected.length / 20);
        const musicalScore = Math.min(1, session.movementData.musicalPhrasesGenerated / 10);

        return (durationScore + gestureScore + musicalScore) / 3;
    }

    calculateMovementComplexity(session) {
        const uniqueGestures = session.interactionMetrics.uniqueGestures.size;
        const gestureVariety = uniqueGestures / Math.max(1, session.movementData.gesturesDetected.length);
        const energyVariation = session.movementData.peakActivity - session.movementData.avgEnergyLevel;

        return Math.min(1, (gestureVariety + energyVariation) / 2);
    }

    calculateAverageEngagement() {
        if (this.analytics.visitorEngagementLevels.length === 0) return 0;

        const total = this.analytics.visitorEngagementLevels.reduce((sum, entry) => sum + entry.level, 0);
        return total / this.analytics.visitorEngagementLevels.length;
    }

    getTopGestures(count = 5) {
        return Array.from(this.analytics.gesturePopularity.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, count)
            .map(([gesture, frequency]) => ({ gesture, frequency }));
    }

    startCleanupTimer() {
        setInterval(() => {
            this.performCleanup();
        }, this.cleanupInterval);
    }

    performCleanup() {
        // Clean up old session history (keep last 100)
        if (this.sessionHistory.length > 100) {
            this.sessionHistory = this.sessionHistory.slice(-100);
        }

        // Clean up old technical issues (keep last 50)
        if (this.analytics.technicalIssues.length > 50) {
            this.analytics.technicalIssues = this.analytics.technicalIssues.slice(-50);
        }

        // Clean up old engagement data (keep last 200)
        if (this.analytics.visitorEngagementLevels.length > 200) {
            this.analytics.visitorEngagementLevels = this.analytics.visitorEngagementLevels.slice(-200);
        }

        // Reset daily stats at midnight
        const currentDate = new Date().toDateString();
        if (this.dailyStats.date !== currentDate) {
            console.log('📊 Resetting daily statistics');
            this.dailyStats = this.initializeDailyStats();
        }
    }

    // Broadcasting for real-time updates
    broadcastSessionUpdate(eventType, sessionData) {
        // This would integrate with Socket.io in a real implementation
        console.log(`📡 Broadcasting: ${eventType}`, {
            type: eventType,
            sessionId: sessionData.id,
            visitorCount: this.activeVisitors.size
        });
    }

    broadcastSystemUpdate(eventType, data) {
        console.log(`📡 System update: ${eventType}`, data);
    }

    // Public API for integration
    getStatus() {
        return {
            operationStatus: this.operationStatus,
            activeVisitors: this.activeVisitors.size,
            queuedVisitors: this.visitorQueue.length,
            todayStats: this.dailyStats,
            performance: this.performanceMetrics,
            analytics: {
                totalSessions: this.analytics.totalSessions,
                avgSessionLength: Math.round(this.analytics.avgSessionLength / 1000),
                peakConcurrentVisitors: this.analytics.peakConcurrentVisitors,
                avgEngagement: Math.round(this.calculateAverageEngagement() * 100)
            }
        };
    }

    // Export data for analysis
    exportSessionData(startDate, endDate) {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        return this.sessionHistory.filter(session =>
            session.startTime >= start && session.startTime <= end
        );
    }

    exportAnalytics() {
        return {
            analytics: this.analytics,
            dailyStats: this.dailyStats,
            performanceMetrics: this.performanceMetrics,
            exportTimestamp: new Date().toISOString()
        };
    }
}

// Export for use in main application
window.SessionManager = SessionManager;