/**
 * Visual Renderer Module
 * Handles all visual rendering for the Kinect Sound Sculpture
 */

class VisualRenderer {
    constructor({ config, dependencies, eventBus, globalEventBus, moduleManager }) {
        this.config = config || {};
        this.dependencies = dependencies || {};
        this.eventBus = eventBus;
        this.globalEventBus = globalEventBus;
        this.moduleManager = moduleManager;

        // Rendering components
        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
        this.isRendering = false;

        // Visual state
        this.skeletons = [];
        this.lastUpdateTime = 0;
        this.frameCount = 0;
        this.fps = 60;

        // Rendering settings
        this.renderSettings = {
            showSkeleton: this.config.showSkeleton !== false,
            showParticles: this.config.showParticles !== false,
            showConnections: this.config.showConnections !== false,
            showMetrics: this.config.showMetrics || false,
            backgroundColor: this.config.backgroundColor || '#000000',
            skeletonColor: this.config.skeletonColor || '#00ff00',
            connectionColor: this.config.connectionColor || '#ffffff',
            alpha: this.config.alpha || 0.8
        };

        // Performance tracking
        this.performanceMetrics = {
            frameTime: 0,
            renderTime: 0,
            lastFPSUpdate: 0,
            framesSinceLastUpdate: 0
        };

        this.isInitialized = false;
    }

    async initialize() {
        console.log('🎨 Initializing Visual Renderer...');

        try {
            // Setup canvas
            this.setupCanvas();

            // Setup event listeners
            this.setupEventListeners();

            // Setup rendering loop
            this.setupRenderingLoop();

            // Setup resize handling
            this.setupResizeHandling();

            this.isInitialized = true;
            console.log('✅ Visual Renderer initialized');

            this.eventBus?.emit('visual:initialized', {
                canvasSize: {
                    width: this.canvas.width,
                    height: this.canvas.height
                },
                settings: this.renderSettings
            });

        } catch (error) {
            console.error('❌ Visual Renderer initialization failed:', error);
            throw error;
        }
    }

    setupCanvas() {
        // Get canvas from config or find existing one
        this.canvas = this.config.canvas || document.getElementById('skeletonCanvas');

        if (!this.canvas) {
            // Create canvas if it doesn't exist
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'skeletonCanvas';
            this.canvas.width = this.config.width || 800;
            this.canvas.height = this.config.height || 600;

            // Add to DOM
            const container = document.getElementById('visualization') || document.body;
            container.appendChild(this.canvas);
        }

        this.ctx = this.canvas.getContext('2d');

        // Set canvas properties
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '1';

        // Set initial size
        this.resizeCanvas();
    }

    setupEventListeners() {
        // Listen for movement data
        this.eventBus?.on('movement:analyzed', (data) => {
            this.processMovementData(data);
        });

        this.eventBus?.on('interaction:processed', (data) => {
            this.processMovementData(data);
        });

        // Listen for configuration changes
        this.eventBus?.on('config:visual_updated', (config) => {
            this.updateSettings(config);
        });

        // Listen for quality changes
        this.eventBus?.on('performance:quality_changed', (data) => {
            this.updateRenderQuality(data.newLevel);
        });
    }

    setupRenderingLoop() {
        const render = (timestamp) => {
            if (!this.isRendering) return;

            const frameStart = performance.now();

            // Calculate FPS
            this.calculateFPS(timestamp);

            // Clear canvas
            this.clearCanvas();

            // Render all visual elements
            this.renderFrame();

            // Update performance metrics
            this.performanceMetrics.frameTime = performance.now() - frameStart;

            // Continue loop
            this.animationFrame = requestAnimationFrame(render);
        };

        this.animationFrame = requestAnimationFrame(render);
        this.isRendering = true;
    }

    setupResizeHandling() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth || 800;
            this.canvas.height = container.clientHeight || 600;
        }

        this.eventBus?.emit('visual:resized', {
            width: this.canvas.width,
            height: this.canvas.height
        });
    }

    processMovementData(data) {
        if (!data || !data.skeletons) return;

        this.skeletons = data.skeletons;
        this.lastUpdateTime = Date.now();

        // Emit visual data for other modules
        this.eventBus?.emit('visual:data_updated', {
            skeletons: this.skeletons,
            timestamp: this.lastUpdateTime
        });
    }

    calculateFPS(timestamp) {
        this.frameCount++;

        if (timestamp - this.performanceMetrics.lastFPSUpdate >= 1000) {
            this.fps = this.performanceMetrics.framesSinceLastUpdate;
            this.performanceMetrics.framesSinceLastUpdate = 0;
            this.performanceMetrics.lastFPSUpdate = timestamp;

            // Emit FPS update
            this.eventBus?.emit('visual:fps_update', { fps: this.fps });
        }

        this.performanceMetrics.framesSinceLastUpdate++;
    }

    clearCanvas() {
        // Clear with background color
        this.ctx.fillStyle = this.renderSettings.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add subtle gradient if enabled
        if (this.config.gradient) {
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, 'rgba(0, 0, 20, 0.1)');
            gradient.addColorStop(1, 'rgba(0, 0, 40, 0.1)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    renderFrame() {
        const renderStart = performance.now();

        // Render skeletons
        if (this.renderSettings.showSkeleton) {
            this.renderSkeletons();
        }

        // Render connections between people
        if (this.renderSettings.showConnections && this.skeletons.length > 1) {
            this.renderConnections();
        }

        // Render metrics overlay
        if (this.renderSettings.showMetrics) {
            this.renderMetrics();
        }

        this.performanceMetrics.renderTime = performance.now() - renderStart;
    }

    renderSkeletons() {
        this.skeletons.forEach((skeleton, index) => {
            if (!skeleton.joints) return;

            this.ctx.save();

            // Set skeleton color based on index
            const hue = (index * 60) % 360;
            this.ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${this.renderSettings.alpha})`;
            this.ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${this.renderSettings.alpha * 0.5})`;
            this.ctx.lineWidth = 2;

            // Render joints
            this.renderJoints(skeleton);

            // Render bones
            this.renderBones(skeleton);

            // Render confidence indicators
            if (this.config.showConfidence) {
                this.renderConfidence(skeleton, index);
            }

            this.ctx.restore();
        });
    }

    renderJoints(skeleton) {
        Object.entries(skeleton.joints).forEach(([jointName, joint]) => {
            if (!joint || joint.confidence < 0.3) return;

            const screenPos = this.worldToScreen(joint.position);

            // Joint circle size based on confidence
            const radius = 3 + (joint.confidence * 4);

            this.ctx.beginPath();
            this.ctx.arc(screenPos.x, screenPos.y, radius, 0, 2 * Math.PI);
            this.ctx.fill();

            // Add joint label if enabled
            if (this.config.showJointLabels) {
                this.ctx.fillText(jointName, screenPos.x + 5, screenPos.y - 5);
            }
        });
    }

    renderBones(skeleton) {
        const boneConnections = [
            // Spine
            ['PELVIS', 'SPINE_NAVAL'],
            ['SPINE_NAVAL', 'SPINE_CHEST'],
            ['SPINE_CHEST', 'NECK'],
            ['NECK', 'HEAD'],

            // Left arm
            ['SPINE_CHEST', 'SHOULDER_LEFT'],
            ['SHOULDER_LEFT', 'ELBOW_LEFT'],
            ['ELBOW_LEFT', 'WRIST_LEFT'],
            ['WRIST_LEFT', 'HAND_LEFT'],
            ['HAND_LEFT', 'HANDTIP_LEFT'],

            // Right arm
            ['SPINE_CHEST', 'SHOULDER_RIGHT'],
            ['SHOULDER_RIGHT', 'ELBOW_RIGHT'],
            ['ELBOW_RIGHT', 'WRIST_RIGHT'],
            ['WRIST_RIGHT', 'HAND_RIGHT'],
            ['HAND_RIGHT', 'HANDTIP_RIGHT'],

            // Left leg
            ['PELVIS', 'HIP_LEFT'],
            ['HIP_LEFT', 'KNEE_LEFT'],
            ['KNEE_LEFT', 'ANKLE_LEFT'],
            ['ANKLE_LEFT', 'FOOT_LEFT'],

            // Right leg
            ['PELVIS', 'HIP_RIGHT'],
            ['HIP_RIGHT', 'KNEE_RIGHT'],
            ['KNEE_RIGHT', 'ANKLE_RIGHT'],
            ['ANKLE_RIGHT', 'FOOT_RIGHT']
        ];

        boneConnections.forEach(([joint1, joint2]) => {
            const j1 = skeleton.joints[joint1];
            const j2 = skeleton.joints[joint2];

            if (!j1 || !j2 || j1.confidence < 0.3 || j2.confidence < 0.3) return;

            const pos1 = this.worldToScreen(j1.position);
            const pos2 = this.worldToScreen(j2.position);

            this.ctx.beginPath();
            this.ctx.moveTo(pos1.x, pos1.y);
            this.ctx.lineTo(pos2.x, pos2.y);
            this.ctx.stroke();
        });
    }

    renderConnections() {
        this.ctx.save();
        this.ctx.strokeStyle = this.renderSettings.connectionColor;
        this.ctx.setLineDash([5, 5]);
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this.skeletons.length; i++) {
            for (let j = i + 1; j < this.skeletons.length; j++) {
                const skeleton1 = this.skeletons[i];
                const skeleton2 = this.skeletons[j];

                if (!skeleton1.joints.SPINE_CHEST || !skeleton2.joints.SPINE_CHEST) continue;

                const pos1 = this.worldToScreen(skeleton1.joints.SPINE_CHEST.position);
                const pos2 = this.worldToScreen(skeleton2.joints.SPINE_CHEST.position);

                // Calculate distance and connection strength
                const distance = Math.sqrt(
                    Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
                );

                // Only draw connection if people are reasonably close
                if (distance < 200) {
                    const alpha = Math.max(0, 1 - (distance / 200));
                    this.ctx.globalAlpha = alpha;

                    this.ctx.beginPath();
                    this.ctx.moveTo(pos1.x, pos1.y);
                    this.ctx.lineTo(pos2.x, pos2.y);
                    this.ctx.stroke();
                }
            }
        }

        this.ctx.restore();
    }

    renderConfidence(skeleton, index) {
        if (!skeleton.joints.HEAD) return;

        const headPos = this.worldToScreen(skeleton.joints.HEAD.position);
        const confidence = skeleton.averageConfidence || 0.5;

        this.ctx.save();
        this.ctx.fillStyle = `rgba(255, 255, 255, 0.8)`;
        this.ctx.font = '12px Arial';
        this.ctx.fillText(
            `${(confidence * 100).toFixed(0)}%`,
            headPos.x - 15,
            headPos.y - 20
        );
        this.ctx.restore();
    }

    renderMetrics() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '14px monospace';

        const metrics = [
            `FPS: ${this.fps}`,
            `Participants: ${this.skeletons.length}`,
            `Frame Time: ${this.performanceMetrics.frameTime.toFixed(1)}ms`,
            `Render Time: ${this.performanceMetrics.renderTime.toFixed(1)}ms`
        ];

        metrics.forEach((metric, index) => {
            this.ctx.fillText(metric, 10, 20 + (index * 20));
        });

        this.ctx.restore();
    }

    worldToScreen(worldPos) {
        // Convert 3D world coordinates to 2D screen coordinates
        // This is a simplified projection - adjust based on your coordinate system

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Scale and offset based on typical Kinect coordinate ranges
        const scaleX = this.canvas.width / 4; // 4 meter width
        const scaleY = this.canvas.height / 3; // 3 meter height

        return {
            x: centerX + (worldPos.x * scaleX),
            y: centerY - (worldPos.y * scaleY) // Flip Y axis
        };
    }

    updateSettings(newSettings) {
        this.renderSettings = { ...this.renderSettings, ...newSettings };

        this.eventBus?.emit('visual:settings_updated', this.renderSettings);
    }

    updateRenderQuality(qualityLevel) {
        const qualitySettings = {
            minimal: {
                showSkeleton: true,
                showParticles: false,
                showConnections: false,
                showMetrics: false,
                alpha: 0.6
            },
            low: {
                showSkeleton: true,
                showParticles: false,
                showConnections: true,
                showMetrics: false,
                alpha: 0.7
            },
            medium: {
                showSkeleton: true,
                showParticles: true,
                showConnections: true,
                showMetrics: false,
                alpha: 0.8
            },
            high: {
                showSkeleton: true,
                showParticles: true,
                showConnections: true,
                showMetrics: true,
                alpha: 0.9
            }
        };

        if (qualitySettings[qualityLevel]) {
            this.updateSettings(qualitySettings[qualityLevel]);
        }
    }

    start() {
        if (!this.isRendering) {
            this.setupRenderingLoop();
        }
    }

    stop() {
        this.isRendering = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    async cleanup() {
        this.stop();

        // Remove event listeners
        window.removeEventListener('resize', this.resizeCanvas.bind(this));

        // Clear canvas
        if (this.ctx) {
            this.clearCanvas();
        }

        this.isInitialized = false;
    }

    getStatus() {
        return {
            initialized: this.isInitialized,
            rendering: this.isRendering,
            fps: this.fps,
            participantCount: this.skeletons.length,
            canvasSize: {
                width: this.canvas?.width || 0,
                height: this.canvas?.height || 0
            },
            settings: this.renderSettings,
            performance: this.performanceMetrics
        };
    }
}

// Export for both CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualRenderer;
} else if (typeof window !== 'undefined') {
    window.VisualRenderer = VisualRenderer;
}