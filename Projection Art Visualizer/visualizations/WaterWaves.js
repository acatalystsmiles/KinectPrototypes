/**
 * Water Waves Visualization
 * Demonstrates wave physics - propagation, reflection, interference
 * Body movements create waves like dropping stones in water
 */
class WaterWaves extends BaseVisualization {
    constructor(canvas, ctx) {
        super(canvas, ctx);

        this.gridSize = 150; // Resolution of wave grid
        this.current = []; // Current wave heights
        this.previous = []; // Previous wave heights
        this.dampening = [];

        this.params = {
            waveSpeed: 0.5,
            damping: 0.99,
            disturbanceStrength: 100,
            colorMode: 'height',
            showNormals: false,
            amplitude: 50
        };
    }

    init() {
        const size = this.gridSize * this.gridSize;

        // Initialize wave arrays
        this.current = new Array(size).fill(0);
        this.previous = new Array(size).fill(0);
        this.dampening = new Array(size).fill(this.params.damping);
    }

    update(deltaTime) {
        // Apply body disturbances
        this.applyBodyDisturbances();

        // Wave equation: ∂²u/∂t² = c²∇²u
        // Using finite difference method
        this.propagateWaves();
    }

    applyBodyDisturbances() {
        for (let body of this.bodyData) {
            if (!body.joints) continue;

            const keyJoints = ['handLeft', 'handRight', 'head'];

            for (let jointName of keyJoints) {
                const joint = body.joints[jointName];
                if (!joint) continue;

                // Convert to grid coordinates
                const gx = Math.floor(joint.x * this.gridSize);
                const gy = Math.floor(joint.y * this.gridSize);

                // Create wave disturbance at joint position
                const radius = 3;
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const x = gx + dx;
                        const y = gy + dy;

                        if (x >= 1 && x < this.gridSize - 1 && y >= 1 && y < this.gridSize - 1) {
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist <= radius) {
                                const idx = x + y * this.gridSize;
                                const falloff = 1 - (dist / radius);

                                // Add wave displacement
                                this.current[idx] += this.params.disturbanceStrength * falloff;
                            }
                        }
                    }
                }
            }
        }
    }

    propagateWaves() {
        const newWave = new Array(this.gridSize * this.gridSize);

        // Apply wave equation at each point
        for (let y = 1; y < this.gridSize - 1; y++) {
            for (let x = 1; x < this.gridSize - 1; x++) {
                const idx = x + y * this.gridSize;

                // Laplacian (second spatial derivative)
                const left = this.current[idx - 1];
                const right = this.current[idx + 1];
                const up = this.current[idx - this.gridSize];
                const down = this.current[idx + this.gridSize];
                const center = this.current[idx];

                const laplacian = (left + right + up + down - 4 * center);

                // Wave equation: new = 2*current - previous + c²*laplacian
                newWave[idx] = (
                    2 * this.current[idx] -
                    this.previous[idx] +
                    this.params.waveSpeed * laplacian
                ) * this.dampening[idx];
            }
        }

        // Update arrays
        this.previous = this.current;
        this.current = newWave;

        // Boundary conditions (reflective or absorbing)
        this.applyBoundaryConditions();
    }

    applyBoundaryConditions() {
        // Absorbing boundaries (waves don't reflect)
        for (let x = 0; x < this.gridSize; x++) {
            this.current[x] = 0; // Top
            this.current[x + (this.gridSize - 1) * this.gridSize] = 0; // Bottom
        }

        for (let y = 0; y < this.gridSize; y++) {
            this.current[y * this.gridSize] = 0; // Left
            this.current[this.gridSize - 1 + y * this.gridSize] = 0; // Right
        }
    }

    render() {
        const cellWidth = this.width / this.gridSize;
        const cellHeight = this.height / this.gridSize;

        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 20, 1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Render wave field
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const idx = x + y * this.gridSize;
                const height = this.current[idx];

                if (Math.abs(height) > 0.1) {
                    const px = x * cellWidth;
                    const py = y * cellHeight;

                    const color = this.getWaveColor(height, x, y);
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(px, py, cellWidth + 1, cellHeight + 1);
                }
            }
        }

        // Optionally draw normals (show wave direction)
        if (this.params.showNormals) {
            this.drawNormals(cellWidth, cellHeight);
        }
    }

    getWaveColor(height, x, y) {
        switch (this.params.colorMode) {
            case 'height': {
                // Blue gradient based on height
                const normalized = Math.max(-1, Math.min(1, height / this.params.amplitude));

                if (normalized > 0) {
                    // Peak: light blue to white
                    const intensity = Math.floor(100 + normalized * 155);
                    return `rgb(${intensity}, ${intensity + 20}, 255)`;
                } else {
                    // Trough: dark blue
                    const intensity = Math.floor(50 + (1 + normalized) * 100);
                    return `rgb(0, ${intensity}, ${intensity + 50})`;
                }
            }

            case 'spectrum': {
                // Rainbow colors
                const normalized = (height / this.params.amplitude + 1) / 2;
                const hue = Math.floor(normalized * 240); // Blue to red spectrum
                return `hsl(${hue}, 80%, 60%)`;
            }

            case 'ocean': {
                // Realistic ocean colors
                const normalized = Math.max(-1, Math.min(1, height / this.params.amplitude));

                if (normalized > 0.5) {
                    // Wave crest: white foam
                    const foam = (normalized - 0.5) * 2;
                    return `rgba(255, 255, 255, ${foam})`;
                } else if (normalized > 0) {
                    // Rising wave: lighter blue
                    const lightness = 40 + normalized * 30;
                    return `hsl(200, 70%, ${lightness}%)`;
                } else {
                    // Trough: darker blue
                    const lightness = 30 + (1 + normalized) * 20;
                    return `hsl(210, 80%, ${lightness}%)`;
                }
            }

            case 'thermal': {
                // Heat map
                const normalized = (height / this.params.amplitude + 1) / 2;

                if (normalized < 0.25) {
                    const t = normalized / 0.25;
                    return `rgb(0, 0, ${Math.floor(100 + t * 155)})`;
                } else if (normalized < 0.5) {
                    const t = (normalized - 0.25) / 0.25;
                    return `rgb(0, ${Math.floor(t * 255)}, 255)`;
                } else if (normalized < 0.75) {
                    const t = (normalized - 0.5) / 0.25;
                    return `rgb(${Math.floor(t * 255)}, 255, ${Math.floor(255 - t * 255)})`;
                } else {
                    const t = (normalized - 0.75) / 0.25;
                    return `rgb(255, ${Math.floor(255 - t * 155)}, 0)`;
                }
            }

            default:
                return 'rgba(100, 150, 255, 0.8)';
        }
    }

    drawNormals(cellWidth, cellHeight) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;

        const step = 10; // Draw normals every 10 cells
        for (let y = step; y < this.gridSize - step; y += step) {
            for (let x = step; x < this.gridSize - step; x += step) {
                const idx = x + y * this.gridSize;

                // Calculate gradient (normal direction)
                const dx = this.current[idx + 1] - this.current[idx - 1];
                const dy = this.current[idx + this.gridSize] - this.current[idx - this.gridSize];

                const px = x * cellWidth;
                const py = y * cellHeight;

                // Draw normal vector
                this.ctx.beginPath();
                this.ctx.moveTo(px, py);
                this.ctx.lineTo(px - dx * 0.5, py - dy * 0.5);
                this.ctx.stroke();
            }
        }
    }

    updateParams(params) {
        super.updateParams(params);
    }

    resize(width, height) {
        super.resize(width, height);
    }
}
