const WebSocket = require('ws');

class KinectDataSimulator {
    constructor() {
        this.server = null;
        this.clients = new Set();
        this.isRunning = false;
        this.frameCount = 0;

        this.azureKinectJoints = {
            PELVIS: 0,
            SPINE_NAVAL: 1,
            SPINE_CHEST: 2,
            NECK: 3,
            CLAVICLE_LEFT: 4,
            SHOULDER_LEFT: 5,
            ELBOW_LEFT: 6,
            WRIST_LEFT: 7,
            HAND_LEFT: 8,
            HANDTIP_LEFT: 9,
            THUMB_LEFT: 10,
            CLAVICLE_RIGHT: 11,
            SHOULDER_RIGHT: 12,
            ELBOW_RIGHT: 13,
            WRIST_RIGHT: 14,
            HAND_RIGHT: 15,
            HANDTIP_RIGHT: 16,
            THUMB_RIGHT: 17,
            HIP_LEFT: 18,
            KNEE_LEFT: 19,
            ANKLE_LEFT: 20,
            FOOT_LEFT: 21,
            HIP_RIGHT: 22,
            KNEE_RIGHT: 23,
            ANKLE_RIGHT: 24,
            FOOT_RIGHT: 25,
            HEAD: 26,
            NOSE: 27,
            EYE_LEFT: 28,
            EAR_LEFT: 29,
            EYE_RIGHT: 30,
            EAR_RIGHT: 31
        };
    }

    start() {
        this.server = new WebSocket.Server({ port: 8080 });

        this.server.on('connection', (ws) => {
            console.log('📱 Client connected to simulator');
            this.clients.add(ws);

            ws.on('close', () => {
                console.log('📱 Client disconnected from simulator');
                this.clients.delete(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });
        });

        this.isRunning = true;
        this.startSimulation();

        console.log('🎭 Kinect Data Simulator started on port 8080');
        console.log('📊 Simulating Azure Kinect body tracking data...');
    }

    stop() {
        this.isRunning = false;
        if (this.server) {
            this.server.close();
        }
        console.log('🛑 Simulator stopped');
    }

    startSimulation() {
        const simulate = () => {
            if (!this.isRunning) return;

            this.frameCount++;
            const data = this.generateSkeletonData();
            this.broadcast(JSON.stringify(data));

            setTimeout(simulate, 1000 / 30); // 30 FPS
        };

        simulate();
    }

    generateSkeletonData() {
        const numBodies = Math.random() < 0.7 ? 1 : 2; // Usually 1 person, sometimes 2
        const bodies = [];

        for (let bodyId = 0; bodyId < numBodies; bodyId++) {
            bodies.push(this.generateBody(bodyId));
        }

        return { bodies };
    }

    generateBody(bodyId) {
        const time = this.frameCount * 0.033; // ~30fps timing
        const phase = bodyId * Math.PI; // Different phase for each body

        // Base position with some movement
        const baseX = bodyId * 1.5; // Separate bodies horizontally
        const baseY = 0;
        const baseZ = 2 + Math.sin(time * 0.5 + phase) * 0.5; // Slight forward/back movement

        // Generate realistic skeleton with some animation
        const joints = {};

        // Core spine
        joints[this.azureKinectJoints.PELVIS] = {
            position: { x: baseX, y: baseY + 1.0, z: baseZ },
            confidence: 0.95
        };

        joints[this.azureKinectJoints.SPINE_NAVAL] = {
            position: { x: baseX, y: baseY + 1.2, z: baseZ },
            confidence: 0.95
        };

        joints[this.azureKinectJoints.SPINE_CHEST] = {
            position: { x: baseX, y: baseY + 1.4, z: baseZ },
            confidence: 0.95
        };

        joints[this.azureKinectJoints.NECK] = {
            position: { x: baseX, y: baseY + 1.55, z: baseZ },
            confidence: 0.9
        };

        joints[this.azureKinectJoints.HEAD] = {
            position: { x: baseX, y: baseY + 1.7, z: baseZ },
            confidence: 0.9
        };

        // Animated arms - wave motion
        const leftArmWave = Math.sin(time + phase) * 0.3;
        const rightArmWave = Math.cos(time + phase) * 0.3;

        // Left arm
        joints[this.azureKinectJoints.SHOULDER_LEFT] = {
            position: { x: baseX - 0.2, y: baseY + 1.4, z: baseZ },
            confidence: 0.9
        };

        joints[this.azureKinectJoints.ELBOW_LEFT] = {
            position: { x: baseX - 0.3, y: baseY + 1.2 + leftArmWave, z: baseZ - 0.1 },
            confidence: 0.85
        };

        joints[this.azureKinectJoints.WRIST_LEFT] = {
            position: { x: baseX - 0.4, y: baseY + 1.0 + leftArmWave * 1.5, z: baseZ - 0.2 },
            confidence: 0.8
        };

        joints[this.azureKinectJoints.HAND_LEFT] = {
            position: { x: baseX - 0.45, y: baseY + 0.95 + leftArmWave * 1.5, z: baseZ - 0.25 },
            confidence: 0.8
        };

        // Right arm
        joints[this.azureKinectJoints.SHOULDER_RIGHT] = {
            position: { x: baseX + 0.2, y: baseY + 1.4, z: baseZ },
            confidence: 0.9
        };

        joints[this.azureKinectJoints.ELBOW_RIGHT] = {
            position: { x: baseX + 0.3, y: baseY + 1.2 + rightArmWave, z: baseZ - 0.1 },
            confidence: 0.85
        };

        joints[this.azureKinectJoints.WRIST_RIGHT] = {
            position: { x: baseX + 0.4, y: baseY + 1.0 + rightArmWave * 1.5, z: baseZ - 0.2 },
            confidence: 0.8
        };

        joints[this.azureKinectJoints.HAND_RIGHT] = {
            position: { x: baseX + 0.45, y: baseY + 0.95 + rightArmWave * 1.5, z: baseZ - 0.25 },
            confidence: 0.8
        };

        // Legs with slight weight shift
        const weightShift = Math.sin(time * 0.3 + phase) * 0.05;

        // Left leg
        joints[this.azureKinectJoints.HIP_LEFT] = {
            position: { x: baseX - 0.1, y: baseY + 1.0, z: baseZ },
            confidence: 0.9
        };

        joints[this.azureKinectJoints.KNEE_LEFT] = {
            position: { x: baseX - 0.1 + weightShift, y: baseY + 0.5, z: baseZ },
            confidence: 0.85
        };

        joints[this.azureKinectJoints.ANKLE_LEFT] = {
            position: { x: baseX - 0.1 + weightShift, y: baseY + 0.1, z: baseZ },
            confidence: 0.8
        };

        joints[this.azureKinectJoints.FOOT_LEFT] = {
            position: { x: baseX - 0.1 + weightShift, y: baseY, z: baseZ + 0.1 },
            confidence: 0.8
        };

        // Right leg
        joints[this.azureKinectJoints.HIP_RIGHT] = {
            position: { x: baseX + 0.1, y: baseY + 1.0, z: baseZ },
            confidence: 0.9
        };

        joints[this.azureKinectJoints.KNEE_RIGHT] = {
            position: { x: baseX + 0.1 - weightShift, y: baseY + 0.5, z: baseZ },
            confidence: 0.85
        };

        joints[this.azureKinectJoints.ANKLE_RIGHT] = {
            position: { x: baseX + 0.1 - weightShift, y: baseY + 0.1, z: baseZ },
            confidence: 0.8
        };

        joints[this.azureKinectJoints.FOOT_RIGHT] = {
            position: { x: baseX + 0.1 - weightShift, y: baseY, z: baseZ + 0.1 },
            confidence: 0.8
        };

        return {
            id: bodyId,
            confidence: 0.9,
            joints: joints
        };
    }

    broadcast(data) {
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }
}

// Start simulator if run directly
if (require.main === module) {
    const simulator = new KinectDataSimulator();

    simulator.start();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down simulator...');
        simulator.stop();
        process.exit(0);
    });

    console.log('🎮 Press Ctrl+C to stop the simulator');
}

module.exports = KinectDataSimulator;