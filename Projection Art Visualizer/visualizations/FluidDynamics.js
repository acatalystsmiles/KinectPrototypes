/**
 * Fluid Dynamics Visualization
 * Real-time 2D fluid simulation with velocity and density fields
 * Bodies create currents and inject dye into the fluid
 */
class FluidDynamics extends BaseVisualization {
    constructor(canvas, ctx) {
        super(canvas, ctx);

        // Fluid simulation grid
        this.gridSize = 128; // Resolution of simulation grid
        this.dt = 0.1; // Time step
        this.diffusion = 0.0001; // Diffusion rate
        this.viscosity = 0.0001; // Viscosity
        this.iterations = 4; // Solver iterations

        // Fluid state arrays
        this.vx = []; // X velocity
        this.vy = []; // Y velocity
        this.vx0 = []; // Previous X velocity
        this.vy0 = []; // Previous Y velocity
        this.density = []; // Dye density
        this.density0 = []; // Previous density

        // Track previous joint positions
        this.previousJoints = new Map();

        this.params = {
            viscosity: 0.0001,
            diffusion: 0.00005,
            fadeRate: 0.995,
            forceStrength: 100,
            dyeIntensity: 5.0
        };
    }

    init() {
        const size = this.gridSize * this.gridSize;

        // Initialize all fluid arrays
        this.vx = new Array(size).fill(0);
        this.vy = new Array(size).fill(0);
        this.vx0 = new Array(size).fill(0);
        this.vy0 = new Array(size).fill(0);
        this.density = new Array(size).fill(0);
        this.density0 = new Array(size).fill(0);

        // Clear previous joint tracking when resetting
        this.previousJoints.clear();

        // Add some initial seed dye to make visualization immediately visible
        // This creates a subtle background that helps visibility on first load
        for (let i = 0; i < size; i++) {
            // Small random initial density across the field
            if (Math.random() < 0.02) {
                this.density[i] = Math.random() * 0.5;
            }
        }
    }

    update(deltaTime) {
        // Add forces from body movements
        this.addBodyForces();

        // Velocity step
        this.velocityStep(this.vx, this.vy, this.vx0, this.vy0, this.params.viscosity, deltaTime);

        // Density step
        this.densityStep(this.density, this.density0, this.vx, this.vy, this.params.diffusion, deltaTime);

        // Fade density over time
        for (let i = 0; i < this.density.length; i++) {
            this.density[i] *= this.params.fadeRate;
        }
    }

    addBodyForces() {
        for (let body of this.bodyData) {
            if (!body.joints) continue;

            const keyJoints = ['handLeft', 'handRight', 'head', 'pelvis'];

            for (let jointName of keyJoints) {
                const joint = body.joints[jointName];
                if (!joint) continue;

                // Grid coordinates
                const gx = Math.floor(joint.x * this.gridSize);
                const gy = Math.floor(joint.y * this.gridSize);

                // Calculate velocity
                const jointKey = `${body.id}_${jointName}`;
                const prevJoint = this.previousJoints.get(jointKey);
                let vx = 0, vy = 0;

                if (prevJoint) {
                    vx = (joint.x - prevJoint.x) * this.gridSize * 50;
                    vy = (joint.y - prevJoint.y) * this.gridSize * 50;
                }

                // Add velocity and density in a radius around the joint
                const radius = 5;
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const x = gx + dx;
                        const y = gy + dy;

                        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
                            const idx = x + y * this.gridSize;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            const falloff = Math.max(0, 1 - dist / radius);

                            // Add velocity
                            this.vx0[idx] += vx * falloff * this.params.forceStrength;
                            this.vy0[idx] += vy * falloff * this.params.forceStrength;

                            // ALWAYS add dye at joint positions (not just when moving)
                            const speed = Math.sqrt(vx * vx + vy * vy);
                            const baseDye = 0.5 * this.params.dyeIntensity; // Continuous dye (increased for immediate visibility)
                            const speedDye = speed * 0.8 * this.params.dyeIntensity; // Extra dye when moving
                            this.density0[idx] += (baseDye + speedDye) * falloff;
                        }
                    }
                }

                this.previousJoints.set(jointKey, { x: joint.x, y: joint.y });
            }
        }
    }

    velocityStep(vx, vy, vx0, vy0, visc, dt) {
        this.diffuse(1, vx0, vx, visc, dt);
        this.diffuse(2, vy0, vy, visc, dt);

        this.project(vx0, vy0, vx, vy);

        this.advect(1, vx, vx0, vx0, vy0, dt);
        this.advect(2, vy, vy0, vx0, vy0, dt);

        this.project(vx, vy, vx0, vy0);
    }

    densityStep(x, x0, vx, vy, diff, dt) {
        this.diffuse(0, x0, x, diff, dt);
        this.advect(0, x, x0, vx, vy, dt);
    }

    diffuse(b, x, x0, diff, dt) {
        const a = dt * diff * (this.gridSize - 2) * (this.gridSize - 2);
        this.linearSolve(b, x, x0, a, 1 + 4 * a);
    }

    advect(b, d, d0, vx, vy, dt) {
        const N = this.gridSize;
        const dt0 = dt * (N - 2);

        for (let j = 1; j < N - 1; j++) {
            for (let i = 1; i < N - 1; i++) {
                let x = i - dt0 * vx[i + j * N];
                let y = j - dt0 * vy[i + j * N];

                x = Math.max(0.5, Math.min(N - 1.5, x));
                y = Math.max(0.5, Math.min(N - 1.5, y));

                const i0 = Math.floor(x);
                const i1 = i0 + 1;
                const j0 = Math.floor(y);
                const j1 = j0 + 1;

                const s1 = x - i0;
                const s0 = 1 - s1;
                const t1 = y - j0;
                const t0 = 1 - t1;

                d[i + j * N] =
                    s0 * (t0 * d0[i0 + j0 * N] + t1 * d0[i0 + j1 * N]) +
                    s1 * (t0 * d0[i1 + j0 * N] + t1 * d0[i1 + j1 * N]);
            }
        }
        this.setBoundary(b, d);
    }

    project(vx, vy, p, div) {
        const N = this.gridSize;

        for (let j = 1; j < N - 1; j++) {
            for (let i = 1; i < N - 1; i++) {
                div[i + j * N] = -0.5 * (
                    vx[i + 1 + j * N] -
                    vx[i - 1 + j * N] +
                    vy[i + (j + 1) * N] -
                    vy[i + (j - 1) * N]
                ) / N;
                p[i + j * N] = 0;
            }
        }

        this.setBoundary(0, div);
        this.setBoundary(0, p);
        this.linearSolve(0, p, div, 1, 4);

        for (let j = 1; j < N - 1; j++) {
            for (let i = 1; i < N - 1; i++) {
                vx[i + j * N] -= 0.5 * (p[i + 1 + j * N] - p[i - 1 + j * N]) * N;
                vy[i + j * N] -= 0.5 * (p[i + (j + 1) * N] - p[i + (j - 1) * N]) * N;
            }
        }

        this.setBoundary(1, vx);
        this.setBoundary(2, vy);
    }

    linearSolve(b, x, x0, a, c) {
        const N = this.gridSize;
        const cRecip = 1.0 / c;

        for (let k = 0; k < this.iterations; k++) {
            for (let j = 1; j < N - 1; j++) {
                for (let i = 1; i < N - 1; i++) {
                    x[i + j * N] = (
                        x0[i + j * N] +
                        a * (
                            x[i + 1 + j * N] +
                            x[i - 1 + j * N] +
                            x[i + (j + 1) * N] +
                            x[i + (j - 1) * N]
                        )
                    ) * cRecip;
                }
            }
            this.setBoundary(b, x);
        }
    }

    setBoundary(b, x) {
        const N = this.gridSize;

        for (let i = 1; i < N - 1; i++) {
            x[i] = b === 2 ? -x[i + N] : x[i + N];
            x[i + (N - 1) * N] = b === 2 ? -x[i + (N - 2) * N] : x[i + (N - 2) * N];
        }

        for (let j = 1; j < N - 1; j++) {
            x[j * N] = b === 1 ? -x[1 + j * N] : x[1 + j * N];
            x[N - 1 + j * N] = b === 1 ? -x[N - 2 + j * N] : x[N - 2 + j * N];
        }

        x[0] = 0.5 * (x[1] + x[N]);
        x[N - 1] = 0.5 * (x[N - 2] + x[N - 1 + N]);
        x[(N - 1) * N] = 0.5 * (x[1 + (N - 1) * N] + x[(N - 2) * N]);
        x[N - 1 + (N - 1) * N] = 0.5 * (x[N - 2 + (N - 1) * N] + x[N - 1 + (N - 2) * N]);
    }

    render() {
        const cellWidth = this.width / this.gridSize;
        const cellHeight = this.height / this.gridSize;

        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Render density field as colored cells
        for (let j = 0; j < this.gridSize; j++) {
            for (let i = 0; i < this.gridSize; i++) {
                const idx = i + j * this.gridSize;
                const d = this.density[idx];

                if (d > 0.0001) {
                    const x = i * cellWidth;
                    const y = j * cellHeight;

                    // Color based on density - using vibrant colors
                    const normalized = Math.min(d / 2, 1);
                    const hue = (i / this.gridSize * 180 + j / this.gridSize * 180) % 360;

                    // Ensure minimum visibility for faint dye
                    const alpha = Math.max(normalized, 0.15);
                    this.ctx.fillStyle = `hsla(${hue}, 90%, 60%, ${alpha})`;
                    this.ctx.fillRect(x, y, cellWidth + 1, cellHeight + 1);
                }
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
