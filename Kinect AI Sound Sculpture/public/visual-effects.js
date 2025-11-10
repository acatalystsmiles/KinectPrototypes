class VisualEffects {
    constructor({ config, dependencies, eventBus, globalEventBus, moduleManager } = {}) {
        // Support both old and new constructor patterns
        if (arguments.length === 2 && !config) {
            this.canvas = arguments[0];
            this.ctx = arguments[1];
            this.config = {};
            this.dependencies = {};
            this.eventBus = null;
        } else {
            this.config = config || {};
            this.dependencies = dependencies || {};
            this.eventBus = eventBus;
            this.canvas = null;
            this.ctx = null;
        }
        this.isInitialized = false;

        // Background effects
        this.backgroundGradients = {
            calm: ['#0f0f23', '#1a1a3a', '#2a2a4a'],
            energetic: ['#2d1b4e', '#4a2c6b', '#6b4c88'],
            flowing: ['#1e3a5f', '#2d5a8f', '#3d7abf'],
            warm: ['#4a2c2a', '#6b3d3d', '#8b5a5a'],
            cool: ['#2a4a4a', '#3d6b6b', '#5a8b8b']
        };

        this.currentGradient = 'calm';
        this.gradientTransition = 0;
        this.targetGradient = 'calm';

        // Color temperature system
        this.colorTemperature = {
            warmth: 0.5, // 0 = cool, 1 = warm
            saturation: 0.5,
            brightness: 0.5,
            contrast: 0.5
        };

        // Beat visualization
        this.beatIndicators = [];
        this.lastBeatTime = 0;
        this.beatDecay = 0;

        // Energy visualization
        this.energyRings = [];
        this.energyLevel = 0;

        // Audio analysis
        this.audioAnalyser = null;
        this.frequencyData = null;
        this.audioHistory = [];
        this.audioHistoryLength = 60; // 1 second at 60fps

        // Movement tracking
        this.movementHistory = [];
        this.movementQuality = {
            flowing: 0,
            expansive: 0,
            rhythmic: 0,
            smooth: 0,
            speed: 0,
            grounded: 0
        };

        // Performance optimization
        this.lastRenderTime = 0;
        this.frameSkip = 0;
        this.targetFPS = 60;
    }

    setAudioAnalyser(analyser) {
        this.audioAnalyser = analyser;
        if (analyser) {
            this.frequencyData = new Float32Array(analyser.fftSize / 2);
        }
    }

    processMovementData(data) {
        if (!data) return;

        // Update movement quality
        if (data.bodies && data.bodies.length > 0) {
            const firstBody = data.bodies[0];
            if (firstBody.metrics?.movementQuality) {
                this.movementQuality = firstBody.metrics.movementQuality;
            }
        }

        // Update energy level
        if (data.metrics) {
            this.energyLevel = data.metrics.energyLevel || 0;
        }

        // Store movement history
        this.movementHistory.push({
            timestamp: Date.now(),
            energyLevel: this.energyLevel,
            quality: { ...this.movementQuality }
        });

        if (this.movementHistory.length > 180) { // 3 seconds at 60fps
            this.movementHistory.shift();
        }

        // Update visual parameters
        this.updateColorTemperature();
        this.updateBackgroundGradient();
        this.generateEnergyEffects();
    }

    updateColorTemperature() {
        const { flowing, expansive, speed, smooth } = this.movementQuality;

        // Map movement qualities to color parameters
        this.colorTemperature.warmth = Math.min(1, 0.3 + (speed * 0.4) + (expansive * 0.3));
        this.colorTemperature.saturation = Math.min(1, 0.4 + (flowing * 0.3) + (this.energyLevel * 0.3));
        this.colorTemperature.brightness = Math.min(1, 0.4 + (this.energyLevel * 0.4) + (smooth * 0.2));
        this.colorTemperature.contrast = Math.min(1, 0.3 + (speed * 0.4) + ((1 - smooth) * 0.3));
    }

    updateBackgroundGradient() {
        const { flowing, expansive, speed } = this.movementQuality;

        let newGradient = 'calm';

        if (speed > 0.7) {
            newGradient = this.colorTemperature.warmth > 0.6 ? 'warm' : 'energetic';
        } else if (flowing > 0.7) {
            newGradient = 'flowing';
        } else if (this.colorTemperature.warmth < 0.4) {
            newGradient = 'cool';
        }

        if (newGradient !== this.targetGradient) {
            this.targetGradient = newGradient;
        }
    }

    generateEnergyEffects() {
        // Generate energy rings based on energy level
        if (this.energyLevel > 0.6 && this.energyRings.length < 5) {
            this.energyRings.push({
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                radius: 10,
                maxRadius: 200 + this.energyLevel * 100,
                alpha: 0.8,
                life: 3.0,
                color: this.getEnergyColor()
            });
        }

        // Update existing energy rings
        for (let i = this.energyRings.length - 1; i >= 0; i--) {
            const ring = this.energyRings[i];
            ring.radius += (ring.maxRadius - ring.radius) * 0.02;
            ring.alpha *= 0.995;
            ring.life -= 0.016; // ~60fps

            if (ring.alpha < 0.01 || ring.life <= 0) {
                this.energyRings.splice(i, 1);
            }
        }
    }

    getEnergyColor() {
        const { warmth, saturation } = this.colorTemperature;

        if (warmth > 0.6) {
            return `hsla(${20 + warmth * 40}, ${saturation * 80}%, 60%, 0.3)`;
        } else {
            return `hsla(${180 + warmth * 60}, ${saturation * 80}%, 60%, 0.3)`;
        }
    }

    update(deltaTime) {
        // Update audio analysis
        this.updateAudioAnalysis();

        // Update gradient transition
        this.updateGradientTransition(deltaTime);

        // Update beat indicators
        this.updateBeatIndicators(deltaTime);

        // Detect beats from audio
        this.detectBeats();
    }

    updateAudioAnalysis() {
        if (!this.audioAnalyser || !this.frequencyData) return;

        this.audioAnalyser.getFloatFrequencyData(this.frequencyData);

        // Calculate audio energy
        let totalEnergy = 0;
        for (let i = 0; i < this.frequencyData.length; i++) {
            totalEnergy += Math.max(0, (this.frequencyData[i] + 140) / 140);
        }

        const audioEnergy = totalEnergy / this.frequencyData.length;

        // Store audio history
        this.audioHistory.push(audioEnergy);
        if (this.audioHistory.length > this.audioHistoryLength) {
            this.audioHistory.shift();
        }
    }

    updateGradientTransition(deltaTime) {
        if (this.currentGradient !== this.targetGradient) {
            this.gradientTransition += deltaTime * 0.5; // 2 second transition

            if (this.gradientTransition >= 1) {
                this.currentGradient = this.targetGradient;
                this.gradientTransition = 0;
            }
        }
    }

    updateBeatIndicators(deltaTime) {
        // Update beat decay
        this.beatDecay = Math.max(0, this.beatDecay - deltaTime * 2);

        // Update beat indicators
        for (let i = this.beatIndicators.length - 1; i >= 0; i--) {
            const beat = this.beatIndicators[i];
            beat.size += beat.growthRate * deltaTime * 60;
            beat.alpha *= 0.95;
            beat.life -= deltaTime;

            if (beat.alpha < 0.01 || beat.life <= 0) {
                this.beatIndicators.splice(i, 1);
            }
        }
    }

    detectBeats() {
        if (this.audioHistory.length < 30) return;

        const recent = this.audioHistory.slice(-10);
        const average = recent.reduce((a, b) => a + b, 0) / recent.length;
        const variance = recent.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / recent.length;

        const currentEnergy = recent[recent.length - 1];
        const threshold = average + Math.sqrt(variance) * 2;

        if (currentEnergy > threshold && currentEnergy > 0.3) {
            const now = Date.now();
            if (now - this.lastBeatTime > 200) { // Minimum 200ms between beats
                this.createBeatIndicator();
                this.lastBeatTime = now;
                this.beatDecay = 1.0;
            }
        }
    }

    createBeatIndicator() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        this.beatIndicators.push({
            x: centerX + (Math.random() - 0.5) * 200,
            y: centerY + (Math.random() - 0.5) * 200,
            size: 10,
            maxSize: 50 + this.energyLevel * 30,
            growthRate: 20,
            alpha: 0.8,
            life: 1.0,
            color: this.getBeatColor()
        });
    }

    getBeatColor() {
        const { warmth, saturation } = this.colorTemperature;
        const hue = warmth > 0.5 ? 45 : 200;
        return `hsla(${hue}, ${saturation * 100}%, 70%, 0.6)`;
    }

    render() {
        const now = performance.now();
        const deltaTime = (now - this.lastRenderTime) / 1000;
        this.lastRenderTime = now;

        // Performance throttling
        this.frameSkip++;
        if (this.frameSkip % 2 === 0) {
            this.renderBackground();
        }

        this.renderEnergyRings();
        this.renderBeatIndicators();
        this.renderAudioVisualization();
    }

    renderBackground() {
        const gradient = this.createBackgroundGradient();

        this.ctx.save();
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add subtle noise texture
        this.renderNoiseTexture();

        this.ctx.restore();
    }

    createBackgroundGradient() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height / 2,
            0,
            this.canvas.width / 2,
            this.canvas.height / 2,
            Math.max(this.canvas.width, this.canvas.height) / 2
        );

        const currentColors = this.backgroundGradients[this.currentGradient];
        const targetColors = this.backgroundGradients[this.targetGradient];

        // Interpolate between current and target colors
        for (let i = 0; i < currentColors.length; i++) {
            const stop = i / (currentColors.length - 1);
            const color = this.interpolateColor(
                currentColors[i],
                targetColors[i],
                this.gradientTransition
            );

            gradient.addColorStop(stop, this.applyColorTemperature(color));
        }

        return gradient;
    }

    interpolateColor(color1, color2, factor) {
        if (!color2) color2 = color1;

        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);

        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);

        return `rgb(${r}, ${g}, ${b})`;
    }

    applyColorTemperature(color) {
        const { warmth, saturation, brightness, contrast } = this.colorTemperature;
        const rgb = this.hexToRgb(color);

        // Apply warmth (color temperature)
        let r = rgb.r + (warmth - 0.5) * 40;
        let g = rgb.g;
        let b = rgb.b - (warmth - 0.5) * 30;

        // Apply saturation
        const gray = (r + g + b) / 3;
        r = gray + (r - gray) * saturation;
        g = gray + (g - gray) * saturation;
        b = gray + (b - gray) * saturation;

        // Apply brightness
        r *= brightness + 0.5;
        g *= brightness + 0.5;
        b *= brightness + 0.5;

        // Apply contrast
        r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
        g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
        b = ((b / 255 - 0.5) * contrast + 0.5) * 255;

        // Clamp values
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    renderNoiseTexture() {
        if (this.energyLevel < 0.1) return;

        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;

        const noiseIntensity = this.energyLevel * 10;

        for (let i = 0; i < data.length; i += 4) {
            if (Math.random() < 0.02) { // Sparse noise
                const intensity = Math.random() * noiseIntensity;
                data[i] = intensity;     // Red
                data[i + 1] = intensity; // Green
                data[i + 2] = intensity; // Blue
                data[i + 3] = 20;        // Alpha
            }
        }

        this.ctx.globalAlpha = 0.1;
        this.ctx.putImageData(imageData, 0, 0);
        this.ctx.globalAlpha = 1;
    }

    renderEnergyRings() {
        this.ctx.save();

        for (const ring of this.energyRings) {
            this.ctx.globalAlpha = ring.alpha;
            this.ctx.strokeStyle = ring.color;
            this.ctx.lineWidth = 3;

            this.ctx.beginPath();
            this.ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    renderBeatIndicators() {
        this.ctx.save();

        for (const beat of this.beatIndicators) {
            this.ctx.globalAlpha = beat.alpha;
            this.ctx.fillStyle = beat.color;

            this.ctx.beginPath();
            this.ctx.arc(beat.x, beat.y, beat.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Add glow effect
            this.ctx.shadowColor = beat.color;
            this.ctx.shadowBlur = beat.size;
            this.ctx.beginPath();
            this.ctx.arc(beat.x, beat.y, beat.size / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    renderAudioVisualization() {
        if (!this.frequencyData) return;

        const barWidth = this.canvas.width / this.frequencyData.length;
        const maxBarHeight = 100;

        this.ctx.save();
        this.ctx.globalAlpha = 0.3;

        for (let i = 0; i < this.frequencyData.length; i++) {
            const value = Math.max(0, (this.frequencyData[i] + 140) / 140);
            const barHeight = value * maxBarHeight;

            const hue = (i / this.frequencyData.length) * 360;
            this.ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.5)`;

            this.ctx.fillRect(
                i * barWidth,
                this.canvas.height - barHeight,
                barWidth - 1,
                barHeight
            );
        }

        this.ctx.restore();
    }

    getStats() {
        return {
            currentGradient: this.currentGradient,
            targetGradient: this.targetGradient,
            colorTemperature: { ...this.colorTemperature },
            energyLevel: this.energyLevel.toFixed(2),
            beatIndicators: this.beatIndicators.length,
            energyRings: this.energyRings.length,
            beatDecay: this.beatDecay.toFixed(2)
        };
    }
}

// Export for use in main application
window.VisualEffects = VisualEffects;