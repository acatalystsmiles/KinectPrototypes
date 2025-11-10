class ParticleSystem {
    constructor({ config, dependencies, eventBus, globalEventBus, moduleManager } = {}) {
        // Support both old and new constructor patterns
        if (arguments.length === 2 && !config) {
            // Old pattern: ParticleSystem(canvas, ctx)
            this.canvas = arguments[0];
            this.ctx = arguments[1];
            this.config = {};
            this.dependencies = {};
            this.eventBus = null;
            this.globalEventBus = null;
            this.moduleManager = null;
        } else {
            // New modular pattern
            this.config = config || {};
            this.dependencies = dependencies || {};
            this.eventBus = eventBus;
            this.globalEventBus = globalEventBus;
            this.moduleManager = moduleManager;
            this.canvas = null;
            this.ctx = null;
        }

        this.isInitialized = false;
        this.particles = [];
        this.maxParticles = 500;
        this.isEnabled = true;

        // Performance optimization
        this.particlePool = [];
        this.activeParticles = 0;

        // Visual parameters
        this.globalAlpha = 1.0;
        this.colorPalette = {
            warm: ['#ff6b6b', '#ffa500', '#ffed4e', '#ff9ff3'],
            cool: ['#00d4ff', '#00ff88', '#7209b7', '#a8e6cf'],
            neutral: ['#ffffff', '#cccccc', '#888888', '#444444']
        };
        this.currentPalette = 'neutral';

        // Audio synchronization
        this.audioAnalyser = null;
        this.frequencyData = null;
        this.audioReactivity = 0.3;

        // Movement tracking
        this.lastMovementData = null;
        this.energyLevel = 0;
        this.movementQuality = {
            flowing: 0,
            expansive: 0,
            rhythmic: 0,
            speed: 0
        };

        this.initializeParticlePool();
    }

    initializeParticlePool() {
        // Pre-create particles for better performance
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlePool.push(new Particle(0, 0));
        }
    }

    setAudioAnalyser(analyser) {
        this.audioAnalyser = analyser;
        if (analyser) {
            this.frequencyData = new Float32Array(analyser.fftSize / 2);
        }
    }

    processMovementData(data) {
        if (!data || !this.isEnabled) return;

        this.lastMovementData = data;

        // Extract energy and movement quality
        if (data.metrics) {
            this.energyLevel = data.metrics.energyLevel || 0;
            this.movementQuality = data.metrics.movementQuality || this.movementQuality;
        }

        // Update color palette based on movement quality
        this.updateColorPalette();

        // Generate particles from movement
        this.generateMovementParticles(data);
    }

    updateColorPalette() {
        const { flowing, expansive, speed } = this.movementQuality;

        if (speed > 0.7 || expansive > 0.8) {
            this.currentPalette = 'warm';
        } else if (flowing > 0.7) {
            this.currentPalette = 'cool';
        } else {
            this.currentPalette = 'neutral';
        }
    }

    generateMovementParticles(data) {
        if (!data.bodies || data.bodies.length === 0) return;

        for (let bodyIndex = 0; bodyIndex < data.bodies.length; bodyIndex++) {
            const body = data.bodies[bodyIndex];
            const bodyColor = this.getBodyColor(bodyIndex);

            this.generateHandParticles(body, bodyColor);
            this.generateCenterOfMassParticles(body, bodyColor);
            this.generateExpansionParticles(body, bodyColor);
        }
    }

    generateHandParticles(body, baseColor) {
        if (!body.metrics?.handVelocities) return;

        const { left, right } = body.metrics.handVelocities;
        const handJoints = [8, 15]; // Left hand, right hand

        // Left hand particles
        if (left > 0.5 && body.joints[8]) {
            this.emitParticles(
                body.joints[8].position,
                Math.min(left * 5, 10),
                baseColor,
                {
                    velocity: left * 2,
                    life: 2.0,
                    size: 3 + left,
                    type: 'melodic'
                }
            );
        }

        // Right hand particles
        if (right > 0.5 && body.joints[15]) {
            this.emitParticles(
                body.joints[15].position,
                Math.min(right * 5, 10),
                baseColor,
                {
                    velocity: right * 2,
                    life: 2.0,
                    size: 3 + right,
                    type: 'melodic'
                }
            );
        }
    }

    generateCenterOfMassParticles(body, baseColor) {
        if (!body.metrics?.centerOfMass) return;

        const comShift = body.metrics.centerOfMassShift || 0;

        if (comShift > 0.1) {
            this.emitParticles(
                body.metrics.centerOfMass,
                Math.min(comShift * 8, 6),
                this.modulateColor(baseColor, 0.7),
                {
                    velocity: comShift,
                    life: 1.5,
                    size: 2,
                    type: 'flow'
                }
            );
        }
    }

    generateExpansionParticles(body, baseColor) {
        if (!body.metrics?.bodyExpansion) return;

        const expansion = body.metrics.bodyExpansion;
        const center = body.metrics.centerOfMass;

        if (expansion > 1.0 && center) {
            // Create expanding ring of particles
            const particleCount = Math.min(expansion * 3, 12);

            for (let i = 0; i < particleCount; i++) {
                const angle = (i / particleCount) * Math.PI * 2;
                const distance = expansion * 0.3;

                const position = {
                    x: center.x + Math.cos(angle) * distance,
                    y: center.y + Math.sin(angle) * distance,
                    z: center.z
                };

                this.emitParticles(
                    position,
                    1,
                    this.modulateColor(baseColor, 0.5),
                    {
                        velocity: 0.5,
                        life: 3.0,
                        size: 4,
                        type: 'expansion'
                    }
                );
            }
        }
    }

    emitParticles(worldPosition, count, color, options = {}) {
        if (this.activeParticles >= this.maxParticles) return;

        const screenPos = this.worldToScreen(worldPosition);

        for (let i = 0; i < count && this.activeParticles < this.maxParticles; i++) {
            const particle = this.getParticleFromPool();
            if (particle) {
                particle.reset(screenPos.x, screenPos.y, color, options);
                this.particles.push(particle);
                this.activeParticles++;
            }
        }
    }

    getParticleFromPool() {
        return this.particlePool.find(p => !p.active) || null;
    }

    getBodyColor(bodyIndex) {
        const colors = this.colorPalette[this.currentPalette];
        return colors[bodyIndex % colors.length];
    }

    modulateColor(color, alpha) {
        // Add alpha to hex color
        const alphaHex = Math.floor(alpha * 255).toString(16).padStart(2, '0');
        return color + alphaHex;
    }

    update(deltaTime) {
        if (!this.isEnabled) return;

        // Update audio reactivity
        this.updateAudioReactivity();

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime, this.energyLevel, this.getAudioInfluence());

            if (!particle.active) {
                this.particles.splice(i, 1);
                this.activeParticles--;
            }
        }

        // Generate ambient particles based on energy
        this.generateAmbientParticles();
    }

    updateAudioReactivity() {
        if (!this.audioAnalyser || !this.frequencyData) return;

        this.audioAnalyser.getFloatFrequencyData(this.frequencyData);

        // Calculate audio intensity
        let totalEnergy = 0;
        for (let i = 0; i < this.frequencyData.length; i++) {
            totalEnergy += Math.max(0, (this.frequencyData[i] + 140) / 140);
        }

        this.audioReactivity = Math.min(1, totalEnergy / this.frequencyData.length);
    }

    getAudioInfluence() {
        return {
            intensity: this.audioReactivity,
            bassEnergy: this.getBassEnergy(),
            trebleEnergy: this.getTrebleEnergy()
        };
    }

    getBassEnergy() {
        if (!this.frequencyData) return 0;

        let bassSum = 0;
        const bassRange = Math.floor(this.frequencyData.length * 0.1); // Low 10%

        for (let i = 0; i < bassRange; i++) {
            bassSum += Math.max(0, (this.frequencyData[i] + 140) / 140);
        }

        return bassSum / bassRange;
    }

    getTrebleEnergy() {
        if (!this.frequencyData) return 0;

        let trebleSum = 0;
        const trebleStart = Math.floor(this.frequencyData.length * 0.7); // High 30%

        for (let i = trebleStart; i < this.frequencyData.length; i++) {
            trebleSum += Math.max(0, (this.frequencyData[i] + 140) / 140);
        }

        return trebleSum / (this.frequencyData.length - trebleStart);
    }

    generateAmbientParticles() {
        if (this.energyLevel > 0.3 && this.activeParticles < this.maxParticles * 0.8) {
            // Generate subtle ambient particles
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;

            this.emitParticles(
                { x: 0, y: 0, z: 2 }, // World center
                1,
                this.colorPalette[this.currentPalette][0],
                {
                    velocity: 0.2,
                    life: 5.0,
                    size: 1,
                    type: 'ambient'
                }
            );
        }
    }

    render() {
        if (!this.isEnabled) return;

        this.ctx.save();

        // Apply global effects
        this.ctx.globalAlpha = this.globalAlpha;

        // Render particles by type for optimal blending
        this.renderParticlesByType('ambient');
        this.renderParticlesByType('flow');
        this.renderParticlesByType('expansion');
        this.renderParticlesByType('melodic');

        this.ctx.restore();
    }

    renderParticlesByType(type) {
        const typeParticles = this.particles.filter(p => p.type === type);

        if (typeParticles.length === 0) return;

        // Set blend mode based on particle type
        switch (type) {
            case 'melodic':
                this.ctx.globalCompositeOperation = 'screen';
                break;
            case 'flow':
                this.ctx.globalCompositeOperation = 'overlay';
                break;
            case 'expansion':
                this.ctx.globalCompositeOperation = 'lighten';
                break;
            default:
                this.ctx.globalCompositeOperation = 'normal';
        }

        // Render all particles of this type
        for (const particle of typeParticles) {
            particle.render(this.ctx);
        }

        // Reset blend mode
        this.ctx.globalCompositeOperation = 'source-over';
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

    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.clearAllParticles();
        }
    }

    clearAllParticles() {
        this.particles.forEach(p => p.active = false);
        this.particles = [];
        this.activeParticles = 0;
    }

    getStats() {
        return {
            activeParticles: this.activeParticles,
            maxParticles: this.maxParticles,
            poolSize: this.particlePool.length,
            currentPalette: this.currentPalette,
            energyLevel: this.energyLevel.toFixed(2),
            audioReactivity: this.audioReactivity.toFixed(2)
        };
    }

    // Modular interface methods
    async initialize() {
        console.log('✨ Initializing Particle System...');

        if (!this.canvas) {
            // Get canvas from visual renderer dependency
            const visualRenderer = this.dependencies.visualRenderer;
            if (visualRenderer) {
                this.canvas = visualRenderer.canvas;
                this.ctx = visualRenderer.ctx;
            }
        }

        if (!this.canvas) {
            this.canvas = document.getElementById('skeletonCanvas');
            this.ctx = this.canvas?.getContext('2d');
        }

        this.isInitialized = true;
        console.log('✅ Particle System initialized');
    }

    async cleanup() {
        this.clearAllParticles();
        this.isInitialized = false;
    }

    getStatus() {
        return {
            initialized: this.isInitialized,
            ...this.getStats()
        };
    }

    updateSettings(newSettings) {
        Object.assign(this.config, newSettings);
        if (newSettings.maxParticles) {
            this.maxParticles = newSettings.maxParticles;
        }
        if (newSettings.enabled !== undefined) {
            this.setEnabled(newSettings.enabled);
        }
    }
}

class Particle {
    constructor(x, y) {
        this.reset(x, y, '#ffffff', {});
    }

    reset(x, y, color, options = {}) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;

        // Physics
        this.vx = (Math.random() - 0.5) * (options.velocity || 1);
        this.vy = (Math.random() - 0.5) * (options.velocity || 1);
        this.gravity = options.gravity || 0.05;
        this.friction = options.friction || 0.99;

        // Visual properties
        this.color = color;
        this.size = options.size || 2;
        this.maxSize = this.size;
        this.alpha = 1.0;

        // Lifecycle
        this.life = options.life || 1.0;
        this.maxLife = this.life;
        this.age = 0;
        this.active = true;

        // Type and behavior
        this.type = options.type || 'default';
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;

        // Audio reactivity
        this.audioSensitive = options.audioSensitive !== false;
    }

    update(deltaTime, energyLevel, audioInfluence) {
        if (!this.active) return;

        this.age += deltaTime;

        // Update physics
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity * deltaTime;

        this.x += this.vx * deltaTime * 60; // 60 FPS normalization
        this.y += this.vy * deltaTime * 60;

        // Update rotation
        this.rotation += this.rotationSpeed * deltaTime * 60;

        // Update lifecycle
        this.life -= deltaTime;
        const lifeRatio = this.life / this.maxLife;

        // Update visual properties based on lifecycle
        this.alpha = Math.max(0, lifeRatio);
        this.size = this.maxSize * (0.5 + lifeRatio * 0.5);

        // Audio reactivity
        if (this.audioSensitive && audioInfluence) {
            this.size *= (1 + audioInfluence.intensity * 0.3);

            // Bass makes particles pulse
            if (audioInfluence.bassEnergy > 0.7) {
                this.size *= 1.2;
            }

            // Treble adds sparkle
            if (audioInfluence.trebleEnergy > 0.6) {
                this.alpha *= 1.3;
            }
        }

        // Type-specific behaviors
        this.updateTypeBehavior(energyLevel, audioInfluence);

        // Check if particle should die
        if (this.life <= 0 || this.alpha <= 0) {
            this.active = false;
        }
    }

    updateTypeBehavior(energyLevel, audioInfluence) {
        switch (this.type) {
            case 'melodic':
                // Melodic particles rise and sparkle
                this.vy -= 0.5;
                if (audioInfluence?.trebleEnergy > 0.5) {
                    this.alpha *= 1.5;
                }
                break;

            case 'flow':
                // Flow particles follow smooth curves
                this.vx += Math.sin(this.age * 2) * 0.1;
                this.vy += Math.cos(this.age * 2) * 0.1;
                break;

            case 'expansion':
                // Expansion particles move outward from origin
                const dx = this.x - this.startX;
                const dy = this.y - this.startY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0) {
                    this.vx += (dx / distance) * 0.2;
                    this.vy += (dy / distance) * 0.2;
                }
                break;

            case 'ambient':
                // Ambient particles drift slowly
                this.vx += (Math.random() - 0.5) * 0.05;
                this.vy += (Math.random() - 0.5) * 0.05;
                break;
        }
    }

    render(ctx) {
        if (!this.active || this.alpha <= 0) return;

        ctx.save();

        ctx.globalAlpha = Math.min(1, this.alpha);
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Render based on type
        switch (this.type) {
            case 'melodic':
                this.renderStar(ctx);
                break;
            case 'flow':
                this.renderDot(ctx);
                break;
            case 'expansion':
                this.renderRing(ctx);
                break;
            default:
                this.renderCircle(ctx);
        }

        ctx.restore();
    }

    renderCircle(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    renderStar(ctx) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;

        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const x = Math.cos(angle) * this.size;
            const y = Math.sin(angle) * this.size;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    renderDot(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
    }

    renderRing(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = Math.max(1, this.size / 3);
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Export for use in main application
window.ParticleSystem = ParticleSystem;