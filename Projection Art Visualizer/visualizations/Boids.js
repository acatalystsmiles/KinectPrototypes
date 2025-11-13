/**
 * Boids/Flocking Visualization
 * Autonomous agents that exhibit flocking behavior
 * They flee from, orbit, or are attracted to body positions
 */
class BoidsSimulation extends BaseVisualization {
    constructor(canvas, ctx) {
        super(canvas, ctx);

        this.boids = [];

        this.params = {
            boidCount: 300,
            alignmentStrength: 1.0,
            cohesionStrength: 1.0,
            separationStrength: 1.5,
            bodyAvoidanceStrength: 2.0,
            perceptionRadius: 50,
            maxSpeed: 4,
            maxForce: 0.2,
            trailLength: 0.95,
            colorMode: 'velocity'
        };
    }

    init() {
        this.boids = [];

        for (let i = 0; i < this.params.boidCount; i++) {
            this.boids.push(new Boid(this.width, this.height));
        }
    }

    update(deltaTime) {
        for (let boid of this.boids) {
            // Flocking behavior
            this.applyFlockingBehavior(boid);

            // Body interaction
            this.applyBodyInteraction(boid);

            // Update boid
            boid.update();
            boid.wrap(this.width, this.height);
        }
    }

    applyFlockingBehavior(boid) {
        const perception = this.params.perceptionRadius;
        let alignment = { x: 0, y: 0 };
        let cohesion = { x: 0, y: 0 };
        let separation = { x: 0, y: 0 };
        let total = 0;

        for (let other of this.boids) {
            if (other === boid) continue;

            const dx = other.pos.x - boid.pos.x;
            const dy = other.pos.y - boid.pos.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);

            if (dist < perception && dist > 0) {
                // Alignment: steer towards average heading
                alignment.x += other.vel.x;
                alignment.y += other.vel.y;

                // Cohesion: steer towards average position
                cohesion.x += other.pos.x;
                cohesion.y += other.pos.y;

                // Separation: steer away from neighbors
                const diff = {
                    x: (boid.pos.x - other.pos.x) / dist,
                    y: (boid.pos.y - other.pos.y) / dist
                };
                separation.x += diff.x;
                separation.y += diff.y;

                total++;
            }
        }

        if (total > 0) {
            // Alignment
            alignment.x /= total;
            alignment.y /= total;
            const alignForce = this.calculateSteeringForce(boid, alignment, this.params.maxSpeed);
            boid.applyForce(
                alignForce.x * this.params.alignmentStrength,
                alignForce.y * this.params.alignmentStrength
            );

            // Cohesion
            cohesion.x /= total;
            cohesion.y /= total;
            const cohesionDir = {
                x: cohesion.x - boid.pos.x,
                y: cohesion.y - boid.pos.y
            };
            const cohesionForce = this.calculateSteeringForce(boid, cohesionDir, this.params.maxSpeed);
            boid.applyForce(
                cohesionForce.x * this.params.cohesionStrength,
                cohesionForce.y * this.params.cohesionStrength
            );

            // Separation
            separation.x /= total;
            separation.y /= total;
            const sepForce = this.calculateSteeringForce(boid, separation, this.params.maxSpeed);
            boid.applyForce(
                sepForce.x * this.params.separationStrength,
                sepForce.y * this.params.separationStrength
            );
        }
    }

    applyBodyInteraction(boid) {
        for (let body of this.bodyData) {
            if (!body.joints) continue;

            const keyJoints = ['handLeft', 'handRight', 'head', 'pelvis'];

            for (let jointName of keyJoints) {
                const joint = body.joints[jointName];
                if (!joint) continue;

                const jointX = joint.x * this.width;
                const jointY = joint.y * this.height;

                const dx = jointX - boid.pos.x;
                const dy = jointY - boid.pos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 200 && dist > 0) {
                    const falloff = 1 - (dist / 200);

                    // Flee from body
                    const fleeDir = {
                        x: boid.pos.x - jointX,
                        y: boid.pos.y - jointY
                    };
                    const fleeForce = this.calculateSteeringForce(boid, fleeDir, this.params.maxSpeed * 1.5);
                    boid.applyForce(
                        fleeForce.x * this.params.bodyAvoidanceStrength * falloff,
                        fleeForce.y * this.params.bodyAvoidanceStrength * falloff
                    );
                }
            }
        }
    }

    calculateSteeringForce(boid, desired, maxSpeed) {
        // Normalize and scale desired velocity
        const mag = Math.sqrt(desired.x * desired.x + desired.y * desired.y);
        if (mag === 0) return { x: 0, y: 0 };

        const steer = {
            x: (desired.x / mag) * maxSpeed - boid.vel.x,
            y: (desired.y / mag) * maxSpeed - boid.vel.y
        };

        // Limit steering force
        const steerMag = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
        if (steerMag > this.params.maxForce) {
            steer.x = (steer.x / steerMag) * this.params.maxForce;
            steer.y = (steer.y / steerMag) * this.params.maxForce;
        }

        return steer;
    }

    render() {
        // Apply trail effect
        this.ctx.fillStyle = `rgba(0, 0, 0, ${1 - this.params.trailLength})`;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw boids
        for (let boid of this.boids) {
            const color = this.getBoidColor(boid);
            this.ctx.fillStyle = color;

            // Draw boid as a triangle pointing in direction of motion
            this.ctx.save();
            this.ctx.translate(boid.pos.x, boid.pos.y);

            const angle = Math.atan2(boid.vel.y, boid.vel.x);
            this.ctx.rotate(angle);

            this.ctx.beginPath();
            this.ctx.moveTo(8, 0);
            this.ctx.lineTo(-4, 4);
            this.ctx.lineTo(-4, -4);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.restore();
        }
    }

    getBoidColor(boid) {
        switch (this.params.colorMode) {
            case 'velocity': {
                const speed = Math.sqrt(boid.vel.x * boid.vel.x + boid.vel.y * boid.vel.y);
                const hue = (speed * 20) % 360;
                return `hsla(${hue}, 70%, 60%, 0.9)`;
            }

            case 'heatmap': {
                const speed = Math.sqrt(boid.vel.x * boid.vel.x + boid.vel.y * boid.vel.y);
                const normalized = speed / this.params.maxSpeed;

                if (normalized < 0.33) {
                    return `rgba(0, ${Math.floor(normalized * 3 * 255)}, 255, 0.9)`;
                } else if (normalized < 0.66) {
                    const t = (normalized - 0.33) * 3;
                    return `rgba(${Math.floor(t * 255)}, 255, ${Math.floor((1 - t) * 255)}, 0.9)`;
                } else {
                    const t = (normalized - 0.66) * 3;
                    return `rgba(255, ${Math.floor((1 - t) * 255)}, 0, 0.9)`;
                }
            }

            case 'white':
                return 'rgba(255, 255, 255, 0.9)';

            default:
                return 'rgba(150, 200, 255, 0.9)';
        }
    }

    updateParams(params) {
        super.updateParams(params);

        if (params.boidCount !== undefined) {
            const diff = params.boidCount - this.boids.length;

            if (diff > 0) {
                for (let i = 0; i < diff; i++) {
                    this.boids.push(new Boid(this.width, this.height));
                }
            } else if (diff < 0) {
                this.boids = this.boids.slice(0, params.boidCount);
            }
        }
    }

    resize(width, height) {
        super.resize(width, height);
    }
}

/**
 * Individual boid (bird-oid object)
 */
class Boid {
    constructor(maxX, maxY) {
        this.pos = {
            x: Math.random() * maxX,
            y: Math.random() * maxY
        };

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        this.vel = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };

        this.acc = { x: 0, y: 0 };
    }

    applyForce(x, y) {
        this.acc.x += x;
        this.acc.y += y;
    }

    update() {
        // Update velocity
        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;

        // Limit speed (will be set by params)
        const speed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
        const maxSpeed = 4;
        if (speed > maxSpeed) {
            this.vel.x = (this.vel.x / speed) * maxSpeed;
            this.vel.y = (this.vel.y / speed) * maxSpeed;
        }

        // Update position
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        // Reset acceleration
        this.acc.x = 0;
        this.acc.y = 0;
    }

    wrap(maxX, maxY) {
        if (this.pos.x < 0) this.pos.x = maxX;
        if (this.pos.x > maxX) this.pos.x = 0;
        if (this.pos.y < 0) this.pos.y = maxY;
        if (this.pos.y > maxY) this.pos.y = 0;
    }
}
