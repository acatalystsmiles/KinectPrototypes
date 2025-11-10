/**
 * Network Manager Module
 * Handles WebSocket connections and data streaming with reconnection logic
 */

class NetworkManager extends BasePlugin {
    constructor(options) {
        super(options);
        this.socket = null;
        this.connectionState = 'disconnected'; // disconnected, connecting, connected, error
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = this.config.maxReconnectAttempts || 10;
        this.reconnectInterval = this.config.reconnectInterval || 5000;
        this.serverUrl = this.config.serverUrl || window.location.origin;
        this.clientId = this.generateClientId();
    }

    async initialize() {
        console.log('NetworkManager: Initializing...');

        try {
            await this.connect();
            this.isInitialized = true;
            console.log('NetworkManager: Initialized successfully');
        } catch (error) {
            this.handleError('initialize', error);
            throw error;
        }
    }

    async connect() {
        if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
            return;
        }

        this.connectionState = 'connecting';
        this.emit('connectionStateChanged', { state: 'connecting' });

        try {
            // Initialize Socket.IO connection
            this.socket = io(this.serverUrl, {
                autoConnect: false,
                timeout: this.config.timeout || 10000,
                transports: ['websocket', 'polling']
            });

            this.setupSocketHandlers();
            this.socket.connect();

            // Wait for connection
            await this.waitForConnection();

        } catch (error) {
            this.connectionState = 'error';
            this.emit('connectionStateChanged', { state: 'error', error });
            throw error;
        }
    }

    setupSocketHandlers() {
        this.socket.on('connect', () => {
            console.log('NetworkManager: Connected to server');
            this.connectionState = 'connected';
            this.reconnectAttempts = 0;
            this.emit('connectionStateChanged', { state: 'connected' });
            this.globalEventBus.emit('network:connected', { clientId: this.clientId });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('NetworkManager: Disconnected from server:', reason);
            this.connectionState = 'disconnected';
            this.emit('connectionStateChanged', { state: 'disconnected', reason });
            this.globalEventBus.emit('network:disconnected', { reason });

            // Auto-reconnect unless manually disconnected
            if (reason !== 'io client disconnect' && this.isEnabled) {
                this.scheduleReconnect();
            }
        });

        this.socket.on('skeletonData', (data) => {
            this.globalEventBus.emit('network:data', data);
        });

        this.socket.on('connectionStatus', (status) => {
            this.emit('serverStatus', status);
        });

        this.socket.on('connect_error', (error) => {
            console.error('NetworkManager: Connection error:', error.message);
            this.handleConnectionError(error);
        });

        this.socket.on('error', (error) => {
            console.error('NetworkManager: Socket error:', error);
            this.handleError('socket_error', error);
        });
    }

    async waitForConnection() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, this.config.timeout || 10000);

            this.socket.once('connect', () => {
                clearTimeout(timeout);
                resolve();
            });

            this.socket.once('connect_error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }

    handleConnectionError(error) {
        this.connectionState = 'error';
        this.emit('connectionStateChanged', { state: 'error', error });

        if (this.isEnabled && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
        } else {
            this.globalEventBus.emit('network:max_reconnect_attempts_reached', {
                attempts: this.reconnectAttempts
            });
        }
    }

    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectInterval * this.reconnectAttempts, 30000); // Max 30s

        console.log(`NetworkManager: Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

        setTimeout(() => {
            if (this.isEnabled && this.connectionState !== 'connected') {
                this.connect().catch(error => {
                    console.error('NetworkManager: Reconnect failed:', error.message);
                });
            }
        }, delay);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
        this.connectionState = 'disconnected';
        this.emit('connectionStateChanged', { state: 'disconnected' });
    }

    sendMessage(event, data) {
        if (this.connectionState === 'connected' && this.socket) {
            this.socket.emit(event, data);
            return true;
        } else {
            console.warn('NetworkManager: Cannot send message - not connected');
            return false;
        }
    }

    requestStatus() {
        return this.sendMessage('requestStatus', { clientId: this.clientId });
    }

    getConnectionInfo() {
        return {
            state: this.connectionState,
            serverUrl: this.serverUrl,
            clientId: this.clientId,
            reconnectAttempts: this.reconnectAttempts,
            isConnected: this.connectionState === 'connected'
        };
    }

    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    onEnabled() {
        if (this.connectionState === 'disconnected') {
            this.connect().catch(error => {
                this.handleError('enable_connect', error);
            });
        }
    }

    onDisabled() {
        this.disconnect();
    }

    async cleanup() {
        this.disconnect();
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket = null;
        }
    }

    static getMetadata() {
        return {
            name: 'NetworkManager',
            version: '1.0.0',
            description: 'WebSocket connection manager with auto-reconnect',
            author: 'Kinect Sculpture System',
            category: 'core',
            dependencies: [],
            configSchema: {
                serverUrl: { type: 'string', default: '' },
                maxReconnectAttempts: { type: 'number', default: 10, min: 1 },
                reconnectInterval: { type: 'number', default: 5000, min: 1000 },
                timeout: { type: 'number', default: 10000, min: 1000 }
            }
        };
    }

    static getDefaultConfig() {
        return {
            ...super.getDefaultConfig(),
            serverUrl: '',
            maxReconnectAttempts: 10,
            reconnectInterval: 5000,
            timeout: 10000,
            critical: true
        };
    }
}

// Export for both CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetworkManager;
} else if (typeof window !== 'undefined') {
    window.NetworkManager = NetworkManager;
}