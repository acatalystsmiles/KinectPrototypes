class KinectVisualizer {
    constructor() {
        this.canvas = document.getElementById('skeletonCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.socket = io();

        this.trails = new Map();
        this.maxTrailLength = 50;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;

        this.currentData = null;
        this.showJoints = true;
        this.showBones = true;
        this.showTrails = true;
        this.showMetrics = false;
        this.showParticles = true;
        this.showVisualEffects = true;
        this.showBeatIndicators = true;

        // AI Movement Interpreter initialization
        this.aiInterpreter = new AIMovementInterpreter();
        this.aiEnabled = true;
        this.showAIDebug = false;

        // Sonic Environment Manager initialization
        this.sonicEnvironmentManager = null;
        this.environmentsEnabled = true;
        this.showEnvironmentInfo = true;

        // Multi-Person Interaction Manager initialization
        this.multiPersonManager = null;
        this.multiPersonEnabled = true;
        this.showInteractionInfo = true;

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

        this.boneConnections = [
            [this.azureKinectJoints.PELVIS, this.azureKinectJoints.SPINE_NAVAL],
            [this.azureKinectJoints.SPINE_NAVAL, this.azureKinectJoints.SPINE_CHEST],
            [this.azureKinectJoints.SPINE_CHEST, this.azureKinectJoints.NECK],
            [this.azureKinectJoints.NECK, this.azureKinectJoints.HEAD],

            [this.azureKinectJoints.SPINE_CHEST, this.azureKinectJoints.CLAVICLE_LEFT],
            [this.azureKinectJoints.CLAVICLE_LEFT, this.azureKinectJoints.SHOULDER_LEFT],
            [this.azureKinectJoints.SHOULDER_LEFT, this.azureKinectJoints.ELBOW_LEFT],
            [this.azureKinectJoints.ELBOW_LEFT, this.azureKinectJoints.WRIST_LEFT],
            [this.azureKinectJoints.WRIST_LEFT, this.azureKinectJoints.HAND_LEFT],
            [this.azureKinectJoints.HAND_LEFT, this.azureKinectJoints.HANDTIP_LEFT],
            [this.azureKinectJoints.WRIST_LEFT, this.azureKinectJoints.THUMB_LEFT],

            [this.azureKinectJoints.SPINE_CHEST, this.azureKinectJoints.CLAVICLE_RIGHT],
            [this.azureKinectJoints.CLAVICLE_RIGHT, this.azureKinectJoints.SHOULDER_RIGHT],
            [this.azureKinectJoints.SHOULDER_RIGHT, this.azureKinectJoints.ELBOW_RIGHT],
            [this.azureKinectJoints.ELBOW_RIGHT, this.azureKinectJoints.WRIST_RIGHT],
            [this.azureKinectJoints.WRIST_RIGHT, this.azureKinectJoints.HAND_RIGHT],
            [this.azureKinectJoints.HAND_RIGHT, this.azureKinectJoints.HANDTIP_RIGHT],
            [this.azureKinectJoints.WRIST_RIGHT, this.azureKinectJoints.THUMB_RIGHT],

            [this.azureKinectJoints.PELVIS, this.azureKinectJoints.HIP_LEFT],
            [this.azureKinectJoints.HIP_LEFT, this.azureKinectJoints.KNEE_LEFT],
            [this.azureKinectJoints.KNEE_LEFT, this.azureKinectJoints.ANKLE_LEFT],
            [this.azureKinectJoints.ANKLE_LEFT, this.azureKinectJoints.FOOT_LEFT],

            [this.azureKinectJoints.PELVIS, this.azureKinectJoints.HIP_RIGHT],
            [this.azureKinectJoints.HIP_RIGHT, this.azureKinectJoints.KNEE_RIGHT],
            [this.azureKinectJoints.KNEE_RIGHT, this.azureKinectJoints.ANKLE_RIGHT],
            [this.azureKinectJoints.ANKLE_RIGHT, this.azureKinectJoints.FOOT_RIGHT],

            [this.azureKinectJoints.HEAD, this.azureKinectJoints.NOSE],
            [this.azureKinectJoints.NOSE, this.azureKinectJoints.EYE_LEFT],
            [this.azureKinectJoints.NOSE, this.azureKinectJoints.EYE_RIGHT],
            [this.azureKinectJoints.EYE_LEFT, this.azureKinectJoints.EAR_LEFT],
            [this.azureKinectJoints.EYE_RIGHT, this.azureKinectJoints.EAR_RIGHT]
        ];

        this.bodyColors = [
            '#00ff88', '#00ccff', '#ff6b9d', '#ffd93d', '#6bcf7f',
            '#ff8c42', '#a8e6cf', '#b4a7d6', '#ffaaa5', '#88d8b0'
        ];

        // Initialize visual effects systems
        this.particleSystem = null;
        this.visualEffects = null;

        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupSocketEvents();
        this.initializeVisualSystems();
        this.startRenderLoop();

        this.showError('Connecting to server...', 'info');
    }

    initializeVisualSystems() {
        // Initialize particle system
        this.particleSystem = new ParticleSystem(this.canvas, this.ctx);

        // Initialize visual effects
        this.visualEffects = new VisualEffects(this.canvas, this.ctx);

        // Connect to audio system when available
        this.connectToAudioSystem();

        console.log('🎨 Visual systems initialized');
    }

    connectToAudioSystem() {
        // Wait for sound engine to be available and connect visual systems
        const connectVisualAudio = () => {
            if (window.soundEngine && window.soundEngine.analyser) {
                this.particleSystem.setAudioAnalyser(window.soundEngine.analyser);
                this.visualEffects.setAudioAnalyser(window.soundEngine.analyser);
                console.log('🔗 Visual systems connected to audio analysis');
            } else {
                setTimeout(connectVisualAudio, 500);
            }
        };

        connectVisualAudio();
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    setupEventListeners() {
        document.getElementById('showJoints').addEventListener('change', (e) => {
            this.showJoints = e.target.checked;
        });

        document.getElementById('showBones').addEventListener('change', (e) => {
            this.showBones = e.target.checked;
        });

        document.getElementById('showTrails').addEventListener('change', (e) => {
            this.showTrails = e.target.checked;
        });

        document.getElementById('showMetrics').addEventListener('change', (e) => {
            this.showMetrics = e.target.checked;
        });

        document.getElementById('showParticles').addEventListener('change', (e) => {
            this.showParticles = e.target.checked;
            if (this.particleSystem) {
                this.particleSystem.setEnabled(e.target.checked);
            }
        });

        document.getElementById('showVisualEffects').addEventListener('change', (e) => {
            this.showVisualEffects = e.target.checked;
        });

        document.getElementById('showBeatIndicators').addEventListener('change', (e) => {
            this.showBeatIndicators = e.target.checked;
        });

        // AI control event listeners
        document.getElementById('enableAI').addEventListener('change', (e) => {
            this.aiEnabled = e.target.checked;
            if (this.aiInterpreter) {
                this.aiInterpreter.setEnabled(this.aiEnabled);
            }
            console.log(`🧠 AI Movement Interpretation ${this.aiEnabled ? 'enabled' : 'disabled'}`);
        });

        document.getElementById('showAIDebug').addEventListener('change', (e) => {
            this.showAIDebug = e.target.checked;
            if (!this.showAIDebug) {
                const aiDebugPanel = document.getElementById('aiDebugPanel');
                if (aiDebugPanel) {
                    aiDebugPanel.innerHTML = '';
                }
            }
        });

        // Environment control event listeners
        document.getElementById('enableEnvironments').addEventListener('change', (e) => {
            this.environmentsEnabled = e.target.checked;
            console.log(`🌍 Environment discovery ${this.environmentsEnabled ? 'enabled' : 'disabled'}`);
        });

        document.getElementById('showEnvironmentInfo').addEventListener('change', (e) => {
            this.showEnvironmentInfo = e.target.checked;
            if (!this.showEnvironmentInfo) {
                // Hide environment visual indicators
                document.getElementById('environmentHint').style.display = 'none';
                document.getElementById('transitionEffect').style.display = 'none';
            }
        });

        window.clearTrails = () => {
            this.trails.clear();
            if (this.particleSystem) {
                this.particleSystem.clearAllParticles();
            }
        };

        window.resetView = () => {
            this.trails.clear();
            this.currentData = null;
            if (this.particleSystem) {
                this.particleSystem.clearAllParticles();
            }
        };
    }

    setupSocketEvents() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.clearError();
            this.updateConnectionStatus('connected', 'Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.showError('Disconnected from server', 'error');
            this.updateConnectionStatus('disconnected', 'Disconnected from server');
        });

        this.socket.on('connectionStatus', (data) => {
            this.updateConnectionStatus(data.status, this.getStatusText(data.status));
            document.getElementById('clientCount').textContent = data.clientCount || 0;
        });

        this.socket.on('skeletonData', (data) => {
            this.currentData = data;

            // Process movement data through AI interpreter first
            let processedData = data;
            if (this.aiEnabled && this.aiInterpreter) {
                processedData = this.aiInterpreter.processMovementData(data);
                this.updateAIUI(processedData);
            }

            this.updateUI(processedData);
            this.updateTrails(processedData.skeletons);

            // Send AI-enhanced movement data to sound engine
            if (window.soundEngine) {
                window.soundEngine.processMovementData(processedData);
            }

            // Process through multi-person interaction manager
            if (this.multiPersonManager && this.multiPersonEnabled) {
                processedData = this.multiPersonManager.processMultiPersonData(processedData);
                this.updateMultiPersonUI(processedData);
            }

            // Process through sonic environment manager
            if (this.sonicEnvironmentManager && this.environmentsEnabled) {
                this.sonicEnvironmentManager.processMovementData(processedData);
                this.updateEnvironmentUI();
            }

            // Send AI-enhanced movement data to visual systems
            if (this.particleSystem) {
                this.particleSystem.processMovementData(processedData);
            }
            if (this.visualEffects) {
                this.visualEffects.processMovementData(processedData);
            }

            // Update visual effects status
            this.updateVisualEffectsUI();

            document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.showError('Failed to connect to server: ' + error.message, 'error');
        });

        setTimeout(() => {
            this.socket.emit('requestStatus');
        }, 1000);
    }

    updateConnectionStatus(status, text) {
        const indicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');

        indicator.className = `status-indicator ${status}`;
        statusText.textContent = text;

        if (status === 'connected') {
            this.clearError();
        }
    }

    getStatusText(status) {
        switch(status) {
            case 'connected': return 'Connected to Kinect';
            case 'disconnected': return 'Kinect Disconnected';
            case 'error': return 'Connection Error';
            default: return 'Unknown Status';
        }
    }

    showError(message, type = 'error') {
        const container = document.getElementById('errorContainer');
        container.innerHTML = `
            <div class="error-message">
                ${message}
            </div>
        `;
    }

    clearError() {
        document.getElementById('errorContainer').innerHTML = '';
    }

    updateUI(data) {
        if (data.metrics) {
            this.updateMetrics(data.metrics);
        }

        if (data.skeletons) {
            this.updateBodyList(data.skeletons);
        }
    }

    updateMetrics(metrics) {
        const elements = {
            totalBodies: metrics.totalBodies || 0,
            averageMotion: (metrics.averageMotion || 0).toFixed(2),
            handActivity: (metrics.totalHandActivity || 0).toFixed(2),
            groupCohesion: (metrics.groupCohesion || 0).toFixed(2),
            energyLevel: (metrics.energyLevel || 0).toFixed(2)
        };

        Object.keys(elements).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = elements[key];
            }
        });

        this.updateProgressBar('averageMotionBar', metrics.averageMotion, 10);
        this.updateProgressBar('handActivityBar', metrics.totalHandActivity, 20);
        this.updateProgressBar('groupCohesionBar', metrics.groupCohesion, 1);
        this.updateProgressBar('energyLevelBar', metrics.energyLevel, 1);
    }

    updateProgressBar(barId, value, maxValue) {
        const bar = document.getElementById(barId);
        if (bar) {
            const percentage = Math.min(100, (value / maxValue) * 100);
            bar.style.width = percentage + '%';
        }
    }

    updateBodyList(skeletons) {
        const bodyList = document.getElementById('bodyList');

        if (!skeletons || skeletons.length === 0) {
            bodyList.innerHTML = '<div style="color: #888; font-size: 11px; text-align: center;">No bodies detected</div>';
            return;
        }

        const bodyItems = skeletons.map((body, index) => {
            const metrics = body.metrics || {};
            const color = this.bodyColors[index % this.bodyColors.length];

            return `
                <div class="body-item">
                    <div class="body-id" style="color: ${color}">Body ${body.id || index}</div>
                    <div>Motion: ${(metrics.overallMotion || 0).toFixed(2)}</div>
                    <div>Expansion: ${(metrics.bodyExpansion || 0).toFixed(2)}</div>
                    <div>Confidence: ${(body.confidence || 0).toFixed(2)}</div>
                </div>
            `;
        }).join('');

        bodyList.innerHTML = bodyItems;
    }

    updateVisualEffectsUI() {
        if (this.particleSystem) {
            const particleStats = this.particleSystem.getStats();
            document.getElementById('activeParticles').textContent = particleStats.activeParticles;
            document.getElementById('colorTemp').textContent = particleStats.currentPalette;
        }

        if (this.visualEffects) {
            const effectsStats = this.visualEffects.getStats();
            document.getElementById('backgroundMode').textContent = effectsStats.currentGradient;
            document.getElementById('beatCount').textContent = effectsStats.beatIndicators;
        }
    }

    updateTrails(skeletons) {
        if (!this.showTrails || !skeletons) return;

        skeletons.forEach((body, bodyIndex) => {
            const bodyId = body.id || bodyIndex;
            const joints = body.joints || {};

            if (!this.trails.has(bodyId)) {
                this.trails.set(bodyId, new Map());
            }

            const bodyTrails = this.trails.get(bodyId);

            [this.azureKinectJoints.HAND_LEFT, this.azureKinectJoints.HAND_RIGHT, this.azureKinectJoints.HEAD].forEach(jointKey => {
                if (joints[jointKey] && joints[jointKey].confidence > 0.5) {
                    if (!bodyTrails.has(jointKey)) {
                        bodyTrails.set(jointKey, []);
                    }

                    const trail = bodyTrails.get(jointKey);
                    const pos = joints[jointKey].position;

                    trail.push({
                        x: pos.x,
                        y: pos.y,
                        z: pos.z,
                        timestamp: Date.now()
                    });

                    if (trail.length > this.maxTrailLength) {
                        trail.shift();
                    }
                }
            });
        });

        this.cleanupOldTrails();
    }

    cleanupOldTrails() {
        const maxAge = 10000; // 10 seconds
        const now = Date.now();

        this.trails.forEach((bodyTrails, bodyId) => {
            bodyTrails.forEach((trail, jointKey) => {
                const validPoints = trail.filter(point => now - point.timestamp < maxAge);
                if (validPoints.length === 0) {
                    bodyTrails.delete(jointKey);
                } else {
                    bodyTrails.set(jointKey, validPoints);
                }
            });

            if (bodyTrails.size === 0) {
                this.trails.delete(bodyId);
            }
        });
    }

    startRenderLoop() {
        const render = (timestamp) => {
            this.calculateFPS(timestamp);
            this.render();
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }

    calculateFPS(timestamp) {
        if (this.lastFrameTime) {
            const delta = timestamp - this.lastFrameTime;
            this.fps = Math.round(1000 / delta);
            this.frameCount++;

            if (this.frameCount % 10 === 0) {
                document.getElementById('fpsCounter').textContent = this.fps;
            }
        }
        this.lastFrameTime = timestamp;
    }

    render() {
        const now = performance.now();
        const deltaTime = this.lastFrameTime > 0 ? (now - this.lastFrameTime) / 1000 : 0;

        // Update visual systems
        if (this.particleSystem) {
            this.particleSystem.update(deltaTime);
        }
        if (this.visualEffects) {
            this.visualEffects.update(deltaTime);
        }

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width / window.devicePixelRatio, this.canvas.height / window.devicePixelRatio);

        // Render visual effects background (if enabled)
        if (this.showVisualEffects && this.visualEffects) {
            this.visualEffects.render();
        }

        // Render particles (if enabled)
        if (this.showParticles && this.particleSystem) {
            this.particleSystem.render();
        }

        // Render movement trails
        if (this.showTrails) {
            this.renderTrails();
        }

        // Render skeleton data
        if (this.currentData && this.currentData.skeletons) {
            this.currentData.skeletons.forEach((body, index) => {
                this.renderSkeleton(body, index);
            });
        }

        // Render multi-person interaction visual effects
        if (this.currentData && this.currentData.multiPersonInteractions) {
            this.renderInteractionEffects(this.currentData.multiPersonInteractions);
        }

        // Render metrics overlay
        if (this.showMetrics && this.currentData) {
            this.renderMetricsOverlay();
        }
    }

    renderTrails() {
        this.trails.forEach((bodyTrails, bodyId) => {
            const colorIndex = parseInt(bodyId) || 0;
            const baseColor = this.bodyColors[colorIndex % this.bodyColors.length];

            bodyTrails.forEach((trail, jointKey) => {
                if (trail.length < 2) return;

                this.ctx.strokeStyle = baseColor + '40';
                this.ctx.lineWidth = 2;
                this.ctx.lineCap = 'round';
                this.ctx.beginPath();

                for (let i = 0; i < trail.length; i++) {
                    const point = trail[i];
                    const screenPos = this.worldToScreen(point);

                    const alpha = i / trail.length;
                    this.ctx.globalAlpha = alpha * 0.5;

                    if (i === 0) {
                        this.ctx.moveTo(screenPos.x, screenPos.y);
                    } else {
                        this.ctx.lineTo(screenPos.x, screenPos.y);
                    }
                }

                this.ctx.stroke();
                this.ctx.globalAlpha = 1;
            });
        });
    }

    renderSkeleton(body, bodyIndex) {
        const joints = body.joints || {};
        const color = this.bodyColors[bodyIndex % this.bodyColors.length];

        if (this.showBones) {
            this.renderBones(joints, color);
        }

        if (this.showJoints) {
            this.renderJoints(joints, color);
        }
    }

    renderBones(joints, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';

        this.boneConnections.forEach(([startJoint, endJoint]) => {
            if (joints[startJoint] && joints[endJoint] &&
                joints[startJoint].confidence > 0.5 && joints[endJoint].confidence > 0.5) {

                const start = this.worldToScreen(joints[startJoint].position);
                const end = this.worldToScreen(joints[endJoint].position);

                this.ctx.globalAlpha = Math.min(joints[startJoint].confidence, joints[endJoint].confidence);
                this.ctx.beginPath();
                this.ctx.moveTo(start.x, start.y);
                this.ctx.lineTo(end.x, end.y);
                this.ctx.stroke();
            }
        });

        this.ctx.globalAlpha = 1;
    }

    renderJoints(joints, color) {
        Object.keys(joints).forEach(jointKey => {
            const joint = joints[jointKey];
            if (joint.confidence > 0.3) {
                const screenPos = this.worldToScreen(joint.position);

                this.ctx.globalAlpha = joint.confidence;
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.arc(screenPos.x, screenPos.y, 4, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        });

        this.ctx.globalAlpha = 1;
    }

    renderMetricsOverlay() {
        if (!this.currentData.metrics) return;

        const metrics = this.currentData.metrics;
        const padding = 20;
        const lineHeight = 20;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(padding, padding, 300, 150);

        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = '14px monospace';
        this.ctx.fillText('Movement Metrics', padding + 10, padding + 20);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px monospace';

        const metricsText = [
            `Bodies: ${metrics.totalBodies}`,
            `Avg Motion: ${(metrics.averageMotion || 0).toFixed(2)}`,
            `Hand Activity: ${(metrics.totalHandActivity || 0).toFixed(2)}`,
            `Cohesion: ${(metrics.groupCohesion || 0).toFixed(2)}`,
            `Energy: ${(metrics.energyLevel || 0).toFixed(2)}`
        ];

        metricsText.forEach((text, index) => {
            this.ctx.fillText(text, padding + 10, padding + 45 + index * lineHeight);
        });
    }

    renderInteractionEffects(interactions) {
        if (!interactions) return;

        // Render coordination connection lines
        if (interactions.coordination && interactions.coordination.pairs) {
            this.renderCoordinationLines(interactions.coordination.pairs);
        }

        // Render duet mode auras
        if (interactions.duetModes) {
            this.renderDuetModeAuras(interactions.duetModes);
        }

        // Render group choreography indicators
        if (interactions.groupChoreography) {
            this.renderGroupChoreographyIndicators(interactions.groupChoreography);
        }

        // Render visual effects
        if (interactions.visualEffects) {
            interactions.visualEffects.forEach(effect => {
                this.renderVisualEffect(effect);
            });
        }
    }

    renderCoordinationLines(coordinationPairs) {
        coordinationPairs.forEach(pair => {
            if (pair.score < 0.6) return; // Only show strong coordination

            const body1 = this.currentData.skeletons.find(s => (s.id || 0) == pair.bodies[0]);
            const body2 = this.currentData.skeletons.find(s => (s.id || 0) == pair.bodies[1]);

            if (!body1 || !body2) return;

            const center1 = body1.joints.SPINE_CHEST?.position;
            const center2 = body2.joints.SPINE_CHEST?.position;

            if (!center1 || !center2) return;

            const screen1 = this.worldToScreen(center1);
            const screen2 = this.worldToScreen(center2);

            // Draw connection line with dynamic properties based on coordination type
            this.ctx.save();

            const alpha = Math.min(pair.score, 0.8);
            const lineWidth = 2 + (pair.score * 4);

            // Color based on coordination type
            const colors = {
                'synchronized': `rgba(0, 255, 0, ${alpha})`,
                'coordinated': `rgba(255, 255, 0, ${alpha})`,
                'loosely_aligned': `rgba(255, 136, 0, ${alpha})`,
                'independent': `rgba(136, 136, 136, ${alpha})`
            };

            this.ctx.strokeStyle = colors[pair.type] || colors.independent;
            this.ctx.lineWidth = lineWidth;
            this.ctx.lineCap = 'round';

            // Animated dash pattern for sync
            if (pair.type === 'synchronized') {
                const dashOffset = (Date.now() * 0.1) % 20;
                this.ctx.setLineDash([10, 10]);
                this.ctx.lineDashOffset = dashOffset;
            }

            this.ctx.beginPath();
            this.ctx.moveTo(screen1.x, screen1.y);
            this.ctx.lineTo(screen2.x, screen2.y);
            this.ctx.stroke();

            // Add coordination type label
            const midX = (screen1.x + screen2.x) / 2;
            const midY = (screen1.y + screen2.y) / 2;

            this.ctx.fillStyle = colors[pair.type] || colors.independent;
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(pair.type.replace('_', ' '), midX, midY - 10);

            this.ctx.restore();
        });
    }

    renderDuetModeAuras(duetModes) {
        duetModes.forEach(duet => {
            duet.participants.forEach((bodyId, index) => {
                const body = this.currentData.skeletons.find(s => (s.id || 0) == bodyId);
                if (!body) return;

                const center = body.joints.SPINE_CHEST?.position;
                if (!center) return;

                const screenPos = this.worldToScreen(center);
                const role = duet.roles[bodyId];

                // Draw aura around participant based on their role
                this.ctx.save();

                const radius = 60 + (duet.compatibility.score * 40);
                const alpha = 0.3 * duet.compatibility.score;

                // Color based on duet mode
                const modeColors = {
                    'harmony': role === 'melody' ? `rgba(100, 200, 255, ${alpha})` : `rgba(255, 150, 100, ${alpha})`,
                    'rhythmic': role === 'beat' ? `rgba(255, 100, 100, ${alpha})` : `rgba(100, 255, 100, ${alpha})`,
                    'mirror': `rgba(200, 100, 255, ${alpha})`,
                    'chase': role === 'leader' ? `rgba(255, 200, 0, ${alpha})` : `rgba(0, 200, 255, ${alpha})`
                };

                const gradient = this.ctx.createRadialGradient(
                    screenPos.x, screenPos.y, 0,
                    screenPos.x, screenPos.y, radius
                );
                gradient.addColorStop(0, modeColors[duet.modeId] || `rgba(255, 255, 255, ${alpha})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(screenPos.x, screenPos.y, radius, 0, 2 * Math.PI);
                this.ctx.fill();

                // Add role label
                this.ctx.fillStyle = modeColors[duet.modeId] || 'rgba(255, 255, 255, 0.8)';
                this.ctx.font = 'bold 14px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(role.toUpperCase(), screenPos.x, screenPos.y + radius + 20);

                this.ctx.restore();
            });
        });
    }

    renderGroupChoreographyIndicators(choreographies) {
        choreographies.forEach(choreography => {
            // Draw formation outline based on choreography type
            const participants = choreography.participants.map(id =>
                this.currentData.skeletons.find(s => (s.id || 0) == id)
            ).filter(s => s && s.joints.SPINE_CHEST?.position);

            if (participants.length < 2) return;

            const positions = participants.map(s =>
                this.worldToScreen(s.joints.SPINE_CHEST.position)
            );

            this.ctx.save();
            this.ctx.strokeStyle = `rgba(255, 0, 255, ${choreography.match.score * 0.8})`;
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';

            if (choreography.pattern.formation === 'circle') {
                // Draw circle formation indicator
                const center = positions.reduce((acc, pos) => ({
                    x: acc.x + pos.x / positions.length,
                    y: acc.y + pos.y / positions.length
                }), { x: 0, y: 0 });

                const avgRadius = positions.reduce((sum, pos) =>
                    sum + Math.sqrt(Math.pow(pos.x - center.x, 2) + Math.pow(pos.y - center.y, 2))
                , 0) / positions.length;

                this.ctx.setLineDash([5, 5]);
                this.ctx.beginPath();
                this.ctx.arc(center.x, center.y, avgRadius, 0, 2 * Math.PI);
                this.ctx.stroke();

            } else if (choreography.pattern.formation === 'line') {
                // Draw line formation indicator
                this.ctx.setLineDash([10, 5]);
                this.ctx.beginPath();
                this.ctx.moveTo(positions[0].x, positions[0].y);
                for (let i = 1; i < positions.length; i++) {
                    this.ctx.lineTo(positions[i].x, positions[i].y);
                }
                this.ctx.stroke();
            }

            // Add choreography name
            const centerX = positions.reduce((sum, pos) => sum + pos.x, 0) / positions.length;
            const centerY = positions.reduce((sum, pos) => sum + pos.y, 0) / positions.length;

            this.ctx.fillStyle = `rgba(255, 0, 255, ${choreography.match.score})`;
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(choreography.name, centerX, centerY - 30);

            this.ctx.restore();
        });
    }

    renderVisualEffect(effect) {
        switch (effect.type) {
            case 'connection_line':
                // Already handled in renderCoordinationLines
                break;
            case 'duet_aura':
                // Already handled in renderDuetModeAuras
                break;
            default:
                console.log('Unknown visual effect type:', effect.type);
        }
    }

    worldToScreen(worldPos) {
        const canvasWidth = this.canvas.width / window.devicePixelRatio;
        const canvasHeight = this.canvas.height / window.devicePixelRatio;

        const scale = 200;
        const offsetX = canvasWidth / 2;
        const offsetY = canvasHeight / 2;

        return {
            x: offsetX + (worldPos.x * scale),
            y: offsetY - (worldPos.y * scale)
        };
    }

    // Initialize sonic environment manager when sound engine is ready
    initializeSonicEnvironments() {
        if (window.soundEngine && window.SonicEnvironmentManager && !this.sonicEnvironmentManager) {
            this.sonicEnvironmentManager = new SonicEnvironmentManager(window.soundEngine);
            console.log('🌍 Sonic Environment Manager initialized');
        }
    }

    // Initialize multi-person interaction manager
    initializeMultiPersonInteractions() {
        if (window.MultiPersonInteractionManager && !this.multiPersonManager) {
            this.multiPersonManager = new MultiPersonInteractionManager();
            console.log('👥 Multi-Person Interaction Manager initialized');
        }
    }

    // Multi-Person Interaction UI update function
    updateMultiPersonUI(data) {
        if (!this.multiPersonManager || !this.showInteractionInfo || !data.multiPersonInteractions) return;

        const interactions = data.multiPersonInteractions;
        this.updateCoordinationDisplay(interactions.coordination);
        this.updateDuetModeDisplay(interactions.duetModes);
        this.updateGroupChoreographyDisplay(interactions.groupChoreography);
        this.updateLearnedPatternsDisplay(interactions.learnedPatterns);
        this.updateMultiPersonMetrics(data.multiPersonMetrics);
    }

    updateCoordinationDisplay(coordination) {
        const coordinationElement = document.getElementById('coordinationStatus');
        if (!coordinationElement || !coordination) return;

        if (coordination.pairs.length > 0) {
            const highestPair = coordination.pairs.reduce((max, pair) =>
                pair.score > max.score ? pair : max
            );

            coordinationElement.innerHTML = `
                <div class="coordination-active">
                    <strong>Coordination Detected!</strong><br>
                    Bodies ${highestPair.bodies.join(' & ')}: ${highestPair.type}<br>
                    Score: ${(highestPair.score * 100).toFixed(0)}%
                </div>
            `;
        } else {
            coordinationElement.innerHTML = '<div class="coordination-inactive">Moving independently</div>';
        }
    }

    updateDuetModeDisplay(duetModes) {
        const duetElement = document.getElementById('duetModeStatus');
        if (!duetElement) return;

        if (duetModes && duetModes.length > 0) {
            const activeDuet = duetModes[0]; // Show first active duet
            duetElement.innerHTML = `
                <div class="duet-active">
                    <strong>${activeDuet.mode.name}</strong><br>
                    ${activeDuet.mode.description}<br>
                    <small>Participants: ${activeDuet.participants.join(', ')}</small>
                </div>
            `;
        } else {
            duetElement.innerHTML = '<div class="duet-inactive">No active duet modes</div>';
        }
    }

    updateGroupChoreographyDisplay(choreography) {
        const choreographyElement = document.getElementById('choreographyStatus');
        if (!choreographyElement) return;

        if (choreography && choreography.length > 0) {
            const activeChoreography = choreography[0];
            choreographyElement.innerHTML = `
                <div class="choreography-active">
                    <strong>${activeChoreography.name}</strong><br>
                    ${activeChoreography.description}<br>
                    <small>Match: ${(activeChoreography.match.score * 100).toFixed(0)}%</small>
                </div>
            `;
        } else {
            choreographyElement.innerHTML = '<div class="choreography-inactive">No group patterns detected</div>';
        }
    }

    updateLearnedPatternsDisplay(learnedPatterns) {
        const patternsElement = document.getElementById('learnedPatterns');
        if (!patternsElement) return;

        if (learnedPatterns && learnedPatterns.length > 0) {
            const patternsList = learnedPatterns
                .filter(p => p.pattern)
                .map(p => `
                    <div class="learned-pattern">
                        <strong>Pattern ${p.pairKey}</strong><br>
                        Type: ${p.pattern.type}<br>
                        Confidence: ${(p.confidence * 100).toFixed(0)}%
                    </div>
                `).join('');

            patternsElement.innerHTML = patternsList || '<div class="patterns-learning">Learning patterns...</div>';
        } else {
            patternsElement.innerHTML = '<div class="patterns-none">No patterns learned yet</div>';
        }
    }

    updateMultiPersonMetrics(metrics) {
        if (!metrics) return;

        const elements = {
            totalParticipants: metrics.totalParticipants || 0,
            groupCohesion: (metrics.groupCohesion * 100).toFixed(0) + '%',
            interactionIntensity: (metrics.interactionIntensity * 100).toFixed(0) + '%',
            learnedPatternsCount: metrics.learnedPatternsCount || 0,
            activeDuets: metrics.activeDuets || 0,
            groupFormation: metrics.groupFormation || 'unknown'
        };

        Object.keys(elements).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = elements[key];
            }
        });
    }

    // Environment UI update function
    updateEnvironmentUI() {
        if (!this.sonicEnvironmentManager || !this.showEnvironmentInfo) return;

        const currentEnv = this.sonicEnvironmentManager.getCurrentEnvironment();
        const status = this.sonicEnvironmentManager.getStatus();

        // Update current environment display
        const envNameElement = document.getElementById('currentEnvironment');
        if (envNameElement) {
            envNameElement.textContent = currentEnv.name;
            envNameElement.style.color = currentEnv.colors?.primary || '#4A90E2';
        }

        // Update environment description
        const envDescElement = document.getElementById('environmentDescription');
        if (envDescElement) {
            envDescElement.textContent = currentEnv.description || '';
        }

        // Update unlocked environments count
        const unlockedElement = document.getElementById('unlockedEnvironments');
        if (unlockedElement) {
            unlockedElement.textContent = `${status.unlockedCount}/${status.totalEnvironments}`;
        }

        // Update discovery progress
        this.updateDiscoveryProgress(status.discoveryProgress);

        // Update canvas background color based on environment
        if (currentEnv.colors?.primary) {
            this.setCanvasEnvironmentColor(currentEnv.colors.primary);
        }
    }

    updateDiscoveryProgress(discoveryProgress) {
        const progressContainer = document.getElementById('discoveryProgress');
        if (!progressContainer) return;

        progressContainer.innerHTML = '';

        Object.entries(discoveryProgress).forEach(([envId, data]) => {
            const progressElement = document.createElement('div');
            progressElement.className = 'discovery-item';
            progressElement.innerHTML = `
                <div class="discovery-name">${data.name}</div>
                <div class="discovery-bar">
                    <div class="discovery-fill" style="width: ${Math.round(data.progress * 100)}%"></div>
                </div>
                <div class="discovery-percent">${Math.round(data.progress * 100)}%</div>
            `;

            progressContainer.appendChild(progressElement);
        });
    }

    setCanvasEnvironmentColor(color) {
        // Set a subtle environment-colored background
        if (this.canvas) {
            this.canvas.style.backgroundColor = `${color}10`; // 10% opacity
        }
    }

    setEnvironmentColor(colors) {
        // Method called by sonic environment manager
        this.visualIndicators = { ...this.visualIndicators, ...colors };
    }

    setEnvironmentName(name) {
        // Method called by sonic environment manager
        this.currentEnvironmentName = name;
    }

    showEnvironmentHint(envName, intensity) {
        // Show discovery hint with pulsing effect
        const hintElement = document.getElementById('environmentHint');
        if (hintElement) {
            hintElement.textContent = `${envName} environment nearby...`;
            hintElement.style.opacity = intensity;
            hintElement.style.display = 'block';
        }
    }

    updateTransitionEffect(progress) {
        // Show transition effect
        const transitionElement = document.getElementById('transitionEffect');
        if (transitionElement) {
            transitionElement.style.opacity = 1 - Math.abs(progress - 0.5) * 2;
            transitionElement.style.display = progress > 0 && progress < 1 ? 'block' : 'none';
        }
    }

    triggerEnvironmentUnlock(environment) {
        // Visual celebration for environment unlock
        console.log(`🎉 Environment unlocked: ${environment.name}`);

        // Show unlock notification
        const unlockElement = document.getElementById('unlockNotification');
        if (unlockElement) {
            unlockElement.textContent = `🌍 ${environment.name} Discovered!`;
            unlockElement.style.color = environment.colors.primary;
            unlockElement.style.display = 'block';
            unlockElement.classList.add('unlock-animation');

            // Hide after 3 seconds
            setTimeout(() => {
                unlockElement.style.display = 'none';
                unlockElement.classList.remove('unlock-animation');
            }, 3000);
        }

        // Trigger particle burst effect
        if (this.particleSystem) {
            this.particleSystem.triggerEnvironmentUnlock(environment.colors.primary);
        }
    }

    // AI UI update function
    updateAIUI(processedData) {
        if (!processedData.ai) return;

        const aiData = processedData.ai;

        // Update basic AI metrics always visible
        document.getElementById('aiProcessingMode').textContent = aiData.processingMode || 'Enhanced';
        document.getElementById('visitorType').textContent = aiData.visitorProfile?.movementStyle || 'Learning...';
        document.getElementById('gesturesDetected').textContent = aiData.gestures?.length || 0;
        document.getElementById('musicalPhrases').textContent = aiData.musicalPhrases?.length || 0;

        // Update AI debug panel if debug mode is enabled
        if (this.showAIDebug) {
            const aiDebugPanel = document.getElementById('aiDebugPanel');
            if (aiDebugPanel) {
                const gestureCount = aiData.gestures?.length || 0;
                const musicalPhrases = aiData.musicalPhrases?.length || 0;
                const confidence = Math.round((aiData.confidence || 0) * 100);
                const processingTime = Math.round(aiData.processingTime || 0);
                const enhancedMetrics = aiData.enhancedMetrics || {};

                aiDebugPanel.innerHTML = `
                    <div style="background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 5px; font-size: 11px;">
                        <div><strong>🧠 AI Debug Information</strong></div>
                        <div>Mode: ${aiData.processingMode}</div>
                        <div>Confidence: ${confidence}%</div>
                        <div>Processing: ${processingTime}ms</div>
                        <div>Visitor: ${aiData.visitorProfile?.movementStyle || 'unknown'}</div>
                        <hr style="margin: 5px 0; border: 1px solid #333;">
                        <div><strong>Enhanced Metrics:</strong></div>
                        <div>Intentionality: ${Math.round((enhancedMetrics.intentionality || 0) * 100)}%</div>
                        <div>Musicality: ${Math.round((enhancedMetrics.musicality || 0) * 100)}%</div>
                        <div>Expressiveness: ${Math.round((enhancedMetrics.expressiveness || 0) * 100)}%</div>
                        <div>Complexity: ${Math.round((enhancedMetrics.complexity || 0) * 100)}%</div>
                        <div>Creativity: ${Math.round((enhancedMetrics.creativity || 0) * 100)}%</div>
                        <hr style="margin: 5px 0; border: 1px solid #333;">
                        <div><strong>Recent Gestures:</strong></div>
                        <div>${aiData.gestures?.map(g => `${g.type} (${Math.round(g.confidence * 100)}%)`).join(', ') || 'None'}</div>
                    </div>
                `;
            }
        }
    }

    // Toggle AI functionality
    toggleAI() {
        this.aiEnabled = !this.aiEnabled;
        if (this.aiInterpreter) {
            this.aiInterpreter.setEnabled(this.aiEnabled);
        }
        console.log(`🧠 AI Movement Interpretation ${this.aiEnabled ? 'enabled' : 'disabled'}`);
    }

    // Toggle AI debug display
    toggleAIDebug() {
        this.showAIDebug = !this.showAIDebug;
        if (!this.showAIDebug) {
            const aiDebugPanel = document.getElementById('aiDebugPanel');
            if (aiDebugPanel) {
                aiDebugPanel.innerHTML = '';
            }
        }
    }

    // Get AI status
    getAIStatus() {
        if (!this.aiInterpreter) return null;
        return this.aiInterpreter.getStatus();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the kinect visualizer
    const visualizer = new KinectVisualizer();

    // Initialize sound engine
    console.log('🎵 Sound Engine ready for initialization');

    // Initialize sonic environments when everything is ready
    setTimeout(() => {
        visualizer.initializeSonicEnvironments();
        visualizer.initializeMultiPersonInteractions();
    }, 2000);

    // Auto-start audio when first movement is detected
    let audioAutoStarted = false;

    const originalProcessMovementData = window.soundEngine.processMovementData.bind(window.soundEngine);
    window.soundEngine.processMovementData = function(data) {
        // Auto-start audio on first movement detection
        if (!audioAutoStarted && data?.bodies?.length > 0 && !this.isPlaying) {
            console.log('🎵 Auto-starting audio on movement detection...');
            this.toggleAudio().catch(err => console.error('Auto-start failed:', err));
            audioAutoStarted = true;
        }

        // Process normally
        originalProcessMovementData(data);
    };
});