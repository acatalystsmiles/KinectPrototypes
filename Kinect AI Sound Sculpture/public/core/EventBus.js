/**
 * Central Event Bus for decoupled communication between modules
 * Implements publisher-subscriber pattern for loose coupling
 */

class EventBus {
    constructor() {
        this.events = new Map();
        this.debugMode = false;
        this.errorHandler = null;
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @param {Object} options - Options {once: boolean, priority: number}
     * @returns {Function} - Unsubscribe function
     */
    on(event, callback, options = {}) {
        try {
            if (typeof callback !== 'function') {
                throw new Error('Callback must be a function');
            }

            if (!this.events.has(event)) {
                this.events.set(event, []);
            }

            const listener = {
                callback,
                once: options.once || false,
                priority: options.priority || 0,
                id: Math.random().toString(36).substr(2, 9)
            };

            const listeners = this.events.get(event);
            listeners.push(listener);

            // Sort by priority (higher priority first)
            listeners.sort((a, b) => b.priority - a.priority);

            if (this.debugMode) {
                console.log(`EventBus: Registered listener for '${event}'`, listener.id);
            }

            // Return unsubscribe function
            return () => this.off(event, listener.id);

        } catch (error) {
            this.handleError('on', error, { event, callback, options });
            return () => {}; // No-op unsubscribe
        }
    }

    /**
     * Subscribe to an event only once
     */
    once(event, callback, options = {}) {
        return this.on(event, callback, { ...options, once: true });
    }

    /**
     * Unsubscribe from an event
     */
    off(event, listenerIdOrCallback) {
        try {
            if (!this.events.has(event)) return false;

            const listeners = this.events.get(event);
            const index = listeners.findIndex(listener =>
                listener.id === listenerIdOrCallback ||
                listener.callback === listenerIdOrCallback
            );

            if (index !== -1) {
                const removed = listeners.splice(index, 1)[0];
                if (this.debugMode) {
                    console.log(`EventBus: Removed listener for '${event}'`, removed.id);
                }
                return true;
            }

            return false;

        } catch (error) {
            this.handleError('off', error, { event, listenerIdOrCallback });
            return false;
        }
    }

    /**
     * Emit an event to all subscribers
     */
    emit(event, data = null) {
        try {
            if (!this.events.has(event)) {
                if (this.debugMode) {
                    console.log(`EventBus: No listeners for '${event}'`);
                }
                return;
            }

            const listeners = this.events.get(event).slice(); // Copy to avoid modification during iteration
            const results = [];

            for (const listener of listeners) {
                try {
                    const result = listener.callback(data, event);
                    results.push(result);

                    if (listener.once) {
                        this.off(event, listener.id);
                    }

                } catch (error) {
                    this.handleError('emit_callback', error, {
                        event,
                        data,
                        listenerId: listener.id
                    });
                }
            }

            if (this.debugMode) {
                console.log(`EventBus: Emitted '${event}' to ${listeners.length} listeners`);
            }

            return results;

        } catch (error) {
            this.handleError('emit', error, { event, data });
            return [];
        }
    }

    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event) {
        try {
            if (event) {
                this.events.delete(event);
                if (this.debugMode) {
                    console.log(`EventBus: Removed all listeners for '${event}'`);
                }
            } else {
                this.events.clear();
                if (this.debugMode) {
                    console.log('EventBus: Removed all listeners');
                }
            }
        } catch (error) {
            this.handleError('removeAllListeners', error, { event });
        }
    }

    /**
     * Get list of events with listener counts
     */
    getEventStats() {
        const stats = {};
        for (const [event, listeners] of this.events.entries()) {
            stats[event] = listeners.length;
        }
        return stats;
    }

    /**
     * Set error handler for internal errors
     */
    setErrorHandler(handler) {
        this.errorHandler = handler;
    }

    /**
     * Enable/disable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }

    /**
     * Handle internal errors gracefully
     */
    handleError(operation, error, context) {
        const errorInfo = {
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
                console.error('EventBus: Error in error handler', handlerError);
            }
        } else {
            console.error('EventBus: Error in operation', errorInfo);
        }

        // Emit error event for system monitoring
        if (operation !== 'emit' && this.events.has('system:error')) {
            try {
                this.emit('system:error', errorInfo);
            } catch (emitError) {
                console.error('EventBus: Failed to emit error event', emitError);
            }
        }
    }

    /**
     * Create a namespaced event bus
     */
    namespace(prefix) {
        return {
            on: (event, callback, options) => this.on(`${prefix}:${event}`, callback, options),
            once: (event, callback, options) => this.once(`${prefix}:${event}`, callback, options),
            off: (event, listener) => this.off(`${prefix}:${event}`, listener),
            emit: (event, data) => this.emit(`${prefix}:${event}`, data),
            removeAllListeners: (event) => this.removeAllListeners(event ? `${prefix}:${event}` : null)
        };
    }
}

// Create global event bus instance
const globalEventBus = new EventBus();

// Export for both CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventBus, globalEventBus };
} else if (typeof window !== 'undefined') {
    window.EventBus = EventBus;
    window.globalEventBus = globalEventBus;
}