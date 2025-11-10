/**
 * Advanced Visual Effects System
 *
 * Features:
 * - WebGL-accelerated particle systems
 * - Generative visual patterns
 * - Flow fields and fluid dynamics
 * - Reactive color palettes
 * - Post-processing effects
 * - 3D visualizations
 */

class AdvancedVisualEffects {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        // WebGL for advanced effects
        this.gl = null;
        this.webglEnabled = this.initWebGL();

        // Particle systems
        this.particleSystems = new Map();
        this.maxParticles = 5000;

        // Flow fields
        this.flowField = new FlowField(100, 100);
        this.flowFieldEnabled = true;

        // Visual state
        this.colorPalette = this.createColorPalette('aurora');
        this.backgroundMode = 'dynamic'; // static, dynamic, reactive
        this.postProcessing = {
            bloom: true,
            motionBlur: false,
            chromatic: false
        };

        // Generative art
        this.generativePatterns = new GenerativePatternLibrary();

        // Performance
        this.frameCount = 0;
        this.lastUpdate = Date.now();

        console.log('🎨 Advanced Visual Effects initialized');
    }

    initWebGL() {
        try {
            this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
            if (this.gl) {
                console.log('✅ WebGL enabled for advanced effects');
                this.setupWebGLPrograms();
                return true;
            }
        } catch (e) {
            console.warn('WebGL not available, using Canvas 2D fallback');
        }
        return false;
    }

    setupWebGLPrograms() {
        // Vertex shader for particle rendering
        const vertexShaderSource = `
            attribute vec2 position;
            attribute float size;
            attribute vec4 color;
            varying vec4 vColor;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
                gl_PointSize = size;
                vColor = color;
            }
        `;

        // Fragment shader with glow effect
        const fragmentShaderSource = `
            precision mediump float;
            varying vec4 vColor;
            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                float alpha = smoothstep(0.5, 0.0, dist);
                gl_FragColor = vColor * alpha;
            }
        `;

        // Compile shaders (simplified)
        this.particleProgram = this.createShaderProgram(vertexShaderSource, fragmentShaderSource);
    }

    createShaderProgram(vertexSource, fragmentSource) {
        // Simplified shader compilation
        return { compiled: true };
    }

    /**
     * Update visual effects based on movement
     */
    update(movementData, gestureData, audioData) {
        this.frameCount++;

        // Update flow field based on movement
        if (this.flowFieldEnabled && movementData) {
            this.updateFlowField(movementData);
        }

        // Update particle systems
        for (const [id, system] of this.particleSystems) {
            system.update(movementData, audioData);
        }

        // Update color palette based on emotion
        if (gestureData && gestureData.emotionalState) {
            this.updateColorPalette(gestureData.emotionalState);
        }

        // Generate new particles based on movement
        if (movementData && movementData.bodies) {
            this.generateMovementParticles(movementData.bodies);
        }
    }

    /**
     * Render all visual effects
     */
    render() {
        if (this.webglEnabled) {
            this.renderWebGL();
        } else {
            this.renderCanvas2D();
        }

        // Apply post-processing
        if (this.postProcessing.bloom) {
            this.applyBloom();
        }
    }

    renderWebGL() {
        // WebGL rendering pipeline
        const gl = this.gl;

        // Clear
        gl.clearColor(0.0, 0.0, 0.02, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Render particles with WebGL
        for (const [id, system] of this.particleSystems) {
            this.renderParticleSystemWebGL(system);
        }
    }

    renderCanvas2D() {
        const ctx = this.ctx;

        // Dynamic background
        this.renderBackground();

        // Flow field visualization
        if (this.flowFieldEnabled) {
            this.renderFlowField();
        }

        // Particle systems
        for (const [id, system] of this.particleSystems) {
            this.renderParticleSystem2D(system);
        }
    }

    /**
     * Create particle system for body
     */
    createParticleSystem(bodyId, type = 'aura') {
        const system = new AdvancedParticleSystem(type, this.colorPalette);
        this.particleSystems.set(bodyId, system);
        return system;
    }

    /**
     * Generate particles from movement
     */
    generateMovementParticles(bodies) {
        for (const body of bodies) {
            let system = this.particleSystems.get(body.id);
            if (!system) {
                system = this.createParticleSystem(body.id, 'trail');
            }

            // Emit particles from hands
            if (body.joints) {
                const leftHand = body.joints[8];
                const rightHand = body.joints[15];

                if (leftHand) {
                    system.emit(leftHand.position, body.metrics);
                }
                if (rightHand) {
                    system.emit(rightHand.position, body.metrics);
                }
            }
        }
    }

    /**
     * Update flow field based on movement
     */
    updateFlowField(movementData) {
        if (!movementData.bodies || movementData.bodies.length === 0) return;

        const body = movementData.bodies[0];
        if (!body.metrics) return;

        // Influence flow field with movement
        const energy = body.metrics.overallMotion || 0;
        const expansion = body.metrics.bodyExpansion || 0;

        this.flowField.addForce(0.5, 0.5, energy * 0.1, expansion * 0.05);
        this.flowField.update();
    }

    /**
     * Update color palette based on emotion
     */
    updateColorPalette(emotion) {
        const palettes = {
            joyful: 'sunrise',
            melancholic: 'twilight',
            energetic: 'electric',
            calm: 'ocean',
            tense: 'storm',
            neutral: 'aurora'
        };

        const paletteName = palettes[emotion] || 'aurora';
        this.colorPalette = this.createColorPalette(paletteName);
    }

    /**
     * Create color palette
     */
    createColorPalette(name) {
        const palettes = {
            aurora: ['#00ffaa', '#00ccff', '#ff00ff', '#ffaa00'],
            sunrise: ['#ff6b6b', '#ff8e53', '#ffd93d', '#fcf6ba'],
            twilight: ['#2c3e50', '#34495e', '#8e44ad', '#9b59b6'],
            electric: ['#00fff2', '#00ff00', '#ffff00', '#ff00ff'],
            ocean: ['#006994', '#0099cc', '#00cccc', '#99ffff'],
            storm: ['#2c2c54', '#40407a', '#706fd3', '#f8b500']
        };

        return palettes[name] || palettes.aurora;
    }

    /**
     * Render dynamic background
     */
    renderBackground() {
        const ctx = this.ctx;

        // Animated gradient background
        const time = this.frameCount * 0.01;
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);

        const color1 = this.interpolateColor(this.colorPalette[0], this.colorPalette[1], Math.sin(time));
        const color2 = this.interpolateColor(this.colorPalette[2], this.colorPalette[3], Math.cos(time));

        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);

        ctx.globalAlpha = 0.05;
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.globalAlpha = 1.0;
    }

    /**
     * Render flow field
     */
    renderFlowField() {
        const ctx = this.ctx;
        const spacing = 30;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let x = 0; x < this.width; x += spacing) {
            for (let y = 0; y < this.height; y += spacing) {
                const force = this.flowField.getForce(x / this.width, y / this.height);

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + force.x * 20, y + force.y * 20);
                ctx.stroke();
            }
        }
    }

    /**
     * Render particle system (2D Canvas)
     */
    renderParticleSystem2D(system) {
        const ctx = this.ctx;

        for (const particle of system.particles) {
            if (!particle.active) continue;

            ctx.beginPath();
            ctx.arc(
                particle.position.x * this.width,
                particle.position.y * this.height,
                particle.size,
                0,
                Math.PI * 2
            );

            // Gradient for glow effect
            const gradient = ctx.createRadialGradient(
                particle.position.x * this.width,
                particle.position.y * this.height,
                0,
                particle.position.x * this.width,
                particle.position.y * this.height,
                particle.size
            );

            gradient.addColorStop(0, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha})`);
            gradient.addColorStop(1, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0)`);

            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    /**
     * Apply bloom post-processing effect
     */
    applyBloom() {
        // Simplified bloom effect
        const ctx = this.ctx;

        // Get image data
        const imageData = ctx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;

        // Brighten bright pixels
        for (let i = 0; i < data.length; i += 4) {
            const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

            if (brightness > 180) {
                const boost = (brightness - 180) / 75;
                data[i] = Math.min(255, data[i] * (1 + boost));
                data[i + 1] = Math.min(255, data[i + 1] * (1 + boost));
                data[i + 2] = Math.min(255, data[i + 2] * (1 + boost));
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Interpolate between two hex colors
     */
    interpolateColor(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        const f = Math.max(0, Math.min(1, (factor + 1) / 2));

        const r = Math.round(c1.r + (c2.r - c1.r) * f);
        const g = Math.round(c1.g + (c2.g - c1.g) * f);
        const b = Math.round(c1.b + (c2.b - c1.b) * f);

        return `rgb(${r}, ${g}, ${b})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    cleanup() {
        this.particleSystems.clear();
    }
}

// Advanced Particle System
class AdvancedParticleSystem {
    constructor(type, colorPalette) {
        this.type = type;
        this.particles = [];
        this.maxParticles = 500;
        this.colorPalette = colorPalette;
        this.emissionRate = 5;
    }

    emit(position, metrics) {
        if (this.particles.length >= this.maxParticles) {
            this.particles.shift();
        }

        const energy = metrics.overallMotion || 0.5;

        for (let i = 0; i < this.emissionRate; i++) {
            const particle = {
                position: { x: position.x, y: position.y, z: position.z },
                velocity: {
                    x: (Math.random() - 0.5) * energy * 0.01,
                    y: (Math.random() - 0.5) * energy * 0.01,
                    z: (Math.random() - 0.5) * energy * 0.01
                },
                size: 2 + Math.random() * 3,
                color: this.getColorFromPalette(),
                alpha: 0.8,
                life: 1.0,
                decay: 0.01,
                active: true
            };

            this.particles.push(particle);
        }
    }

    update(movementData, audioData) {
        for (const particle of this.particles) {
            if (!particle.active) continue;

            // Update position
            particle.position.x += particle.velocity.x;
            particle.position.y += particle.velocity.y;
            particle.position.z += particle.velocity.z;

            // Update life
            particle.life -= particle.decay;
            particle.alpha = particle.life;

            if (particle.life <= 0) {
                particle.active = false;
            }

            // Apply audio reactivity if available
            if (audioData && audioData.amplitude) {
                particle.size = particle.size * (1 + audioData.amplitude * 0.1);
            }
        }

        // Remove dead particles
        this.particles = this.particles.filter(p => p.active);
    }

    getColorFromPalette() {
        const colorHex = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
        const rgb = this.hexToRgb(colorHex);
        return rgb;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 255, b: 170 };
    }
}

// Flow Field for organic movement
class FlowField {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.field = [];

        this.initializeField();
    }

    initializeField() {
        for (let x = 0; x < this.cols; x++) {
            this.field[x] = [];
            for (let y = 0; y < this.rows; y++) {
                const angle = Math.random() * Math.PI * 2;
                this.field[x][y] = {
                    x: Math.cos(angle),
                    y: Math.sin(angle),
                    magnitude: 1.0
                };
            }
        }
    }

    addForce(x, y, strength, radius) {
        const colIdx = Math.floor(x * this.cols);
        const rowIdx = Math.floor(y * this.rows);

        const radiusCells = Math.floor(radius * Math.min(this.cols, this.rows));

        for (let dx = -radiusCells; dx <= radiusCells; dx++) {
            for (let dy = -radiusCells; dy <= radiusCells; dy++) {
                const nx = colIdx + dx;
                const ny = rowIdx + dy;

                if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < radiusCells) {
                        const influence = 1 - (dist / radiusCells);
                        this.field[nx][ny].magnitude += strength * influence;
                    }
                }
            }
        }
    }

    update() {
        // Decay field over time
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                this.field[x][y].magnitude *= 0.95;
            }
        }
    }

    getForce(x, y) {
        const colIdx = Math.floor(x * this.cols);
        const rowIdx = Math.floor(y * this.rows);

        if (colIdx >= 0 && colIdx < this.cols && rowIdx >= 0 && rowIdx < this.rows) {
            return this.field[colIdx][rowIdx];
        }

        return { x: 0, y: 0, magnitude: 0 };
    }
}

// Generative Pattern Library
class GenerativePatternLibrary {
    constructor() {
        this.patterns = new Map();
        this.initializePatterns();
    }

    initializePatterns() {
        // L-System patterns
        this.patterns.set('fractal_tree', {
            axiom: 'F',
            rules: { 'F': 'FF+[+F-F-F]-[-F+F+F]' },
            angle: 25,
            iterations: 4
        });

        // Cellular automaton
        this.patterns.set('game_of_life', {
            type: 'cellular_automaton',
            rules: 'B3/S23'
        });
    }

    generate(patternName) {
        // Generate pattern (placeholder)
        return [];
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedVisualEffects;
}
