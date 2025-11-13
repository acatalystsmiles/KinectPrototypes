/**
 * Gravity & Orbital Mechanics Visualization
 * Demonstrates Newton's law of universal gravitation and orbital dynamics
 * Body joints act as massive celestial bodies attracting particles
 */
class Gravity extends BaseVisualization {
    constructor(canvas, ctx) {
        super(canvas, ctx);

        this.particles = [];
        this.gravityWells = []; // Positions from body joints

        this.params = {
            particleCount: 500,
            gravitationalConstant: 100,
            jointMass: 1000,
            drag: 0.999,
            particleSize: 3,
            trailLength: 0.95,
            colorMode: 'velocity',
            showFieldLines: false,
            initialSpeed: 2
        };
    }

    init() {
        this.particles = [];

        // Create particles with random positions and velocities
        for (let i = 0; i < this.params.particleCount; i++) {
            this.particles.push(new GravityParticle(
                this.width,
                this.height,
                this.params.initialSpeed
            ));
        }
    }

    update(deltaTime) {
        // Update gravity well positions from body joints
        this.updateGravityWells();

        // Update each particle
        for (let particle of this.particles) {
            // Apply gravitational forces from all wells
            for (let well of this.gravityWells) {
                this.applyGravity(particle, well);
            }

            // Update particle physics
            particle.update(deltaTime, this.params.drag);

            // Wrap around screen edges
            particle.wrap(this.width, this.height);

            // Calculate energy for coloring
            const kineticEnergy = 0.5 * (particle.vx * particle.vx + particle.vy * particle.vy);
            particle.energy = kineticEnergy;
        }
    }

    updateGravityWells() {
        this.gravityWells = [];

        for (let body of this.bodyData) {
            if (!body.joints) continue;

            // Use key joints as gravity sources
            const keyJoints = ['handLeft', 'handRight', 'head', 'pelvis'];

            for (let jointName of keyJoints) {
                const joint = body.joints[jointName];
                if (!joint) continue;

                this.gravityWells.push({
                    x: joint.x * this.width,
                    y: joint.y * this.height,
                    mass: this.params.jointMass
                });
            }
        }
    }

    applyGravity(particle, well) {
        // Calculate distance
        const dx = well.x - particle.x;
        const dy = well.y - particle.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        // Prevent division by zero and extreme forces
        if (dist < 5) return;

        // Newton's law of universal gravitation: F = G * m1 * m2 / r^2
        // Force magnitude
        const forceMagnitude = (this.params.gravitationalConstant * well.mass) / distSq;

        // Force direction (unit vector)
        const fx = (dx / dist) * forceMagnitude;
        const fy = (dy / dist) * forceMagnitude;

        // Apply force to particle (F = ma, so a = F/m, assuming particle mass = 1)
        particle.ax += fx;
        particle.ay += fy;
    }

    render() {
        // Apply trail effect
        this.ctx.fillStyle = `rgba(0, 0, 0, ${1 - this.params.trailLength})`;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw gravitational field lines if enabled
        if (this.params.showFieldLines) {
            this.drawFieldLines();
        }

        // Draw gravity wells
        for (let well of this.gravityWells) {
            // Draw well as glowing circle
            const gradient = this.ctx.createRadialGradient(
                well.x, well.y, 0,
                well.x, well.y, 40
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.4)');
            gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(well.x, well.y, 40, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw core
            this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
            this.ctx.beginPath();
            this.ctx.arc(well.x, well.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw particles
        for (let particle of this.particles) {
            const color = this.getParticleColor(particle);
            this.ctx.fillStyle = color;

            this.ctx.beginPath();
            this.ctx.arc(
                particle.x,
                particle.y,
                this.params.particleSize,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }
    }

    drawFieldLines() {
        this.ctx.strokeStyle = 'rgba(100, 150, 200, 0.1)';
        this.ctx.lineWidth = 1;

        const step = 50;
        for (let well of this.gravityWells) {
            // Draw radial field lines
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
                this.ctx.beginPath();
                this.ctx.moveTo(well.x, well.y);
                this.ctx.lineTo(
                    well.x + Math.cos(angle) * 200,
                    well.y + Math.sin(angle) * 200
                );
                this.ctx.stroke();
            }

            // Draw equipotential circles
            for (let r = 30; r < 200; r += 30) {
                this.ctx.beginPath();
                this.ctx.arc(well.x, well.y, r, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
    }

    getParticleColor(particle) {
        switch (this.params.colorMode) {
            case 'velocity': {
                const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                const hue = Math.min(speed * 15, 360);
                return `hsla(${hue}, 80%, 60%, 0.9)`;
            }

            case 'energy': {
                // Color by kinetic energy (blue = low, red = high)
                const normalized = Math.min(particle.energy / 20, 1);

                if (normalized < 0.33) {
                    // Low energy: blue to cyan
                    const t = normalized / 0.33;
                    return `rgba(${Math.floor(t * 100)}, ${Math.floor(100 + t * 155)}, 255, 0.9)`;
                } else if (normalized < 0.66) {
                    // Medium energy: cyan to yellow
                    const t = (normalized - 0.33) / 0.33;
                    return `rgba(${Math.floor(100 + t * 155)}, 255, ${Math.floor(255 - t * 255)}, 0.9)`;
                } else {
                    // High energy: yellow to red
                    const t = (normalized - 0.66) / 0.34;
                    return `rgba(255, ${Math.floor(255 - t * 155)}, 0, 0.9)`;
                }
            }

            case 'white':
                return 'rgba(255, 255, 255, 0.8)';

            case 'orbit': {
                // Color by orbital characteristics
                const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                if (speed < 2) {
                    return 'rgba(100, 100, 255, 0.9)'; // Slow = blue (bound)
                } else if (speed < 5) {
                    return 'rgba(100, 255, 100, 0.9)'; // Medium = green (circular orbit)
                } else {
                    return 'rgba(255, 100, 100, 0.9)'; // Fast = red (escape velocity)
                }
            }

            default:
                return 'rgba(255, 255, 255, 0.8)';
        }
    }

    updateParams(params) {
        super.updateParams(params);

        // Handle particle count changes
        if (params.particleCount !== undefined) {
            const diff = params.particleCount - this.particles.length;

            if (diff > 0) {
                for (let i = 0; i < diff; i++) {
                    this.particles.push(new GravityParticle(
                        this.width,
                        this.height,
                        this.params.initialSpeed
                    ));
                }
            } else if (diff < 0) {
                this.particles = this.particles.slice(0, params.particleCount);
            }
        }
    }

    resize(width, height) {
        super.resize(width, height);
    }
}

/**
 * Particle affected by gravity
 */
class GravityParticle {
    constructor(maxX, maxY, initialSpeed) {
        this.x = Math.random() * maxX;
        this.y = Math.random() * maxY;

        // Give particles some initial velocity for orbital motion
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * initialSpeed;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.ax = 0;
        this.ay = 0;
        this.energy = 0;
    }

    update(deltaTime, drag) {
        // Update velocity from acceleration
        this.vx += this.ax * deltaTime * 60; // Scale for 60fps baseline
        this.vy += this.ay * deltaTime * 60;

        // Apply drag
        this.vx *= drag;
        this.vy *= drag;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Reset acceleration
        this.ax = 0;
        this.ay = 0;
    }

    wrap(maxX, maxY) {
        if (this.x < 0) this.x = maxX;
        if (this.x > maxX) this.x = 0;
        if (this.y < 0) this.y = maxY;
        if (this.y > maxY) this.y = 0;
    }
}
