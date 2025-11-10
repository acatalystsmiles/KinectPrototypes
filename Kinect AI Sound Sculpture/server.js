const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const MovementAnalyzer = require('./movement-analyzer');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const WEB_PORT = 3000;
const KINECT_WS_PORT = 8080;

let kinectConnection = null;
let reconnectInterval = null;
let connectionStatus = 'disconnected';
let connectedClients = new Set();
let movementAnalyzer = new MovementAnalyzer();

function connectToKinectServer() {
    try {
        console.log(`Attempting to connect to Kinect WebSocket server on port ${KINECT_WS_PORT}...`);

        kinectConnection = new WebSocket(`ws://localhost:${KINECT_WS_PORT}`);

        kinectConnection.on('open', () => {
            console.log('✓ Connected to Kinect WebSocket server');
            connectionStatus = 'connected';

            if (reconnectInterval) {
                clearInterval(reconnectInterval);
                reconnectInterval = null;
            }

            broadcastConnectionStatus();
        });

        kinectConnection.on('message', (data) => {
            try {
                const skeletonData = JSON.parse(data);
                console.log('📊 Received data structure:', JSON.stringify(skeletonData, null, 2));
                processSkeletonData(skeletonData);
            } catch (error) {
                console.error('Error parsing skeleton data:', error);
                console.error('Raw data received:', data.toString());
            }
        });

        kinectConnection.on('close', (code, reason) => {
            console.log(`⚠ Kinect WebSocket connection closed. Code: ${code}, Reason: ${reason}`);
            connectionStatus = 'disconnected';
            kinectConnection = null;
            broadcastConnectionStatus();
            scheduleReconnect();
        });

        kinectConnection.on('error', (error) => {
            console.error('Kinect WebSocket error:', error.message);
            connectionStatus = 'error';
            broadcastConnectionStatus();
        });

    } catch (error) {
        console.error('Failed to create Kinect WebSocket connection:', error);
        connectionStatus = 'error';
        scheduleReconnect();
    }
}

function scheduleReconnect() {
    if (reconnectInterval) return;

    console.log('Scheduling reconnection attempt in 5 seconds...');
    reconnectInterval = setInterval(() => {
        if (!kinectConnection || kinectConnection.readyState === WebSocket.CLOSED) {
            connectToKinectServer();
        }
    }, 5000);
}

function processSkeletonData(skeletonData) {
    try {
        const processedData = movementAnalyzer.analyze(skeletonData);

        const dataToSend = {
            timestamp: Date.now(),
            skeletons: skeletonData.bodies || skeletonData.skeletons || [],
            metrics: processedData.metrics,
            connectionStatus: connectionStatus
        };

        connectedClients.forEach(client => {
            client.emit('skeletonData', dataToSend);
        });

    } catch (error) {
        console.error('Error processing skeleton data:', error);
    }
}

function broadcastConnectionStatus() {
    const statusData = {
        status: connectionStatus,
        timestamp: Date.now(),
        clientCount: connectedClients.size
    };

    connectedClients.forEach(client => {
        client.emit('connectionStatus', statusData);
    });
}

io.on('connection', (socket) => {
    console.log(`📱 Client connected: ${socket.id}`);
    connectedClients.add(socket);

    socket.emit('connectionStatus', {
        status: connectionStatus,
        timestamp: Date.now(),
        clientCount: connectedClients.size
    });

    socket.on('disconnect', () => {
        console.log(`📱 Client disconnected: ${socket.id}`);
        connectedClients.delete(socket);
    });

    socket.on('requestStatus', () => {
        socket.emit('connectionStatus', {
            status: connectionStatus,
            timestamp: Date.now(),
            clientCount: connectedClients.size
        });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        kinectConnection: connectionStatus,
        connectedClients: connectedClients.size,
        timestamp: Date.now()
    });
});

server.listen(WEB_PORT, () => {
    console.log(`🌐 Web server running on http://localhost:${WEB_PORT}`);
    console.log(`📊 Health check available at http://localhost:${WEB_PORT}/health`);

    connectToKinectServer();
});

process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');

    if (reconnectInterval) {
        clearInterval(reconnectInterval);
    }

    if (kinectConnection) {
        kinectConnection.close();
    }

    server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
    });
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});