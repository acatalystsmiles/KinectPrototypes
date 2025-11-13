/**
 * Wave Interference Visualization
 * Concentric ripples emanate from body joints
 * Where waves meet, they interfere creating beautiful patterns
 */
class WaveInterference extends BaseVisualization {
    constructor(canvas, ctx) {
        super(canvas, ctx);

        this.waves = [];
        this.resolution = 3; // Pixel size for wave calculation
        this.waveField = [];
        this.cols = 0;
        this.rows = 0;

        this.params = {
            waveSpeed: 2,
            waveFrequency: 0.1,
            waveDamping: 0.98,
            amplitude: 50,
            colorMode: 'interference',
            emitContinuously: true
        };

        this.time = 0;
    }

    init() {
        this.cols = Math.ceil(this.width / this.resolution);
        this.rows = Math.ceil(this.height / this.resolution);
        this.waveField = new Array(this.cols * this.rows).fill(0);
        this.waves = [];
    }

    update(deltaTime) {
        this.time += deltaTime;

        // Emit waves from body joints
        if (this.params.emitContinuously) {
            this.emitWaves();
        }

        // Update existing waves
        for (let wave of this.waves) {
            wave.radius += this.params.waveSpeed;
            wave.age += deltaTime;
        }

        // Remove old waves
        const maxRadius = Math.max(this.width, this.height);
        this.waves = this.waves.filter(w => w.radius < maxRadius);

        // Calculate wave field
        this.calculateWaveField();
    }

    emitWaves() {
        for (let body of this.bodyData) {
            if (!body.joints) continue;

            const keyJoints = ['handLeft', 'handRight', 'head', 'pelvis'];

            for (let jointName of keyJoints) {
                const joint = body.joints[jointName];
                if (!joint) continue;

                // Emit wave at regular intervals
                if (Math.random() < this.params.waveFrequency) {
                    this.waves.push({
                        x: joint.x * this.width,
                        y: joint.y * this.height,
                        radius: 0,
                        age: 0,
                        source: jointName,
                        frequency: 0.1 + Math.random() * 0.1
                    });
                }
            }
        }
    }

    calculateWaveField() {
        // Reset field
        this.waveField.fill(0);

        // Calculate interference at each point
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const px = x * this.resolution;
                const py = y * this.resolution;
                let totalAmplitude = 0;

                // Sum contributions from all waves
                for (let wave of this.waves) {
                    const dx = px - wave.x;
                    const dy = py - wave.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Check if this point is on the wave
                    const distFromWave = Math.abs(dist - wave.radius);

                    if (distFromWave < 20) {
                        // Calculate wave amplitude at this point
                        const falloff = Math.exp(-wave.age * 0.5); // Waves fade over time
                        const wavePulse = Math.cos((dist - wave.radius * 2) * wave.frequency * Math.PI * 2);
                        const amplitude = wavePulse * falloff * this.params.amplitude * (1 - distFromWave / 20);

                        totalAmplitude += amplitude;
                    }
                }

                this.waveField[x + y * this.cols] = totalAmplitude;
            }
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Render wave field
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const amplitude = this.waveField[x + y * this.cols];

                if (Math.abs(amplitude) > 0.5) {
                    const color = this.getWaveColor(amplitude);
                    this.ctx.fillStyle = color;

                    this.ctx.fillRect(
                        x * this.resolution,
                        y * this.resolution,
                        this.resolution,
                        this.resolution
                    );
                }
            }
        }

        // Optionally render wave circles for debugging
        if (false) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.lineWidth = 2;

            for (let wave of this.waves) {
                const alpha = Math.exp(-wave.age * 0.5);
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;

                this.ctx.beginPath();
                this.ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
    }

    getWaveColor(amplitude) {
        switch (this.params.colorMode) {
            case 'interference': {
                // Positive interference = warm, negative = cool
                const normalized = Math.max(-1, Math.min(1, amplitude / this.params.amplitude));

                if (normalized > 0) {
                    // Positive: Blue to White to Yellow
                    const r = Math.floor(100 + normalized * 155);
                    const g = Math.floor(150 + normalized * 105);
                    const b = Math.floor(255 - normalized * 100);
                    return `rgba(${r}, ${g}, ${b}, ${Math.abs(normalized)})`;
                } else {
                    // Negative: Blue to Purple
                    const abs = Math.abs(normalized);
                    const r = Math.floor(abs * 150);
                    const g = 0;
                    const b = Math.floor(200 + abs * 55);
                    return `rgba(${r}, ${g}, ${b}, ${abs})`;
                }
            }

            case 'monochrome': {
                const intensity = Math.abs(amplitude) / this.params.amplitude;
                const brightness = Math.floor(intensity * 255);
                return `rgba(${brightness}, ${brightness}, ${brightness}, 1)`;
            }

            case 'rainbow': {
                const normalized = (amplitude / this.params.amplitude + 1) / 2; // 0 to 1
                const hue = Math.floor(normalized * 360);
                return `hsla(${hue}, 80%, 60%, ${Math.abs(amplitude) / this.params.amplitude})`;
            }

            default:
                return 'rgba(255, 255, 255, 0.8)';
        }
    }

    updateParams(params) {
        super.updateParams(params);
    }

    resize(width, height) {
        super.resize(width, height);
        this.cols = Math.ceil(this.width / this.resolution);
        this.rows = Math.ceil(this.height / this.resolution);
        this.waveField = new Array(this.cols * this.rows).fill(0);
    }
}
