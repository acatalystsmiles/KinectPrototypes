/**
 * Verlet Cloth Visualization
 * A suspended mesh of interconnected points using Verlet integration
 * Bodies push through the mesh creating ripples and folds
 */
class VerletCloth extends BaseVisualization {
    constructor(canvas, ctx) {
        super(canvas, ctx);

        this.points = [];
        this.constraints = [];
        this.cols = 40;
        this.rows = 30;
        this.spacing = 0;

        this.params = {
            gravity: 0.3,
            damping: 0.98,
            stiffness: 0.8,
            tearDistance: 2.5,
            forceRadius: 150,
            forceStrength: 10
        };
    }

    init() {
        this.points = [];
        this.constraints = [];

        this.spacing = this.width / (this.cols - 1);

        // Create points in a grid
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const point = new ClothPoint(
                    x * this.spacing,
                    y * this.spacing - 50,
                    x === 0 || x === this.cols - 1 // Pin top corners
                );
                this.points.push(point);
            }
        }

        // Create constraints (connections between points)
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const idx = x + y * this.cols;

                // Horizontal constraint
                if (x < this.cols - 1) {
                    const neighbor = idx + 1;
                    this.constraints.push(new Constraint(this.points[idx], this.points[neighbor]));
                }

                // Vertical constraint
                if (y < this.rows - 1) {
                    const neighbor = idx + this.cols;
                    this.constraints.push(new Constraint(this.points[idx], this.points[neighbor]));
                }

                // Diagonal constraints for stability
                if (x < this.cols - 1 && y < this.rows - 1) {
                    const neighbor = idx + this.cols + 1;
                    this.constraints.push(new Constraint(this.points[idx], this.points[neighbor]));
                }

                if (x > 0 && y < this.rows - 1) {
                    const neighbor = idx + this.cols - 1;
                    this.constraints.push(new Constraint(this.points[idx], this.points[neighbor]));
                }
            }
        }
    }

    update(deltaTime) {
        // Apply forces to points
        for (let point of this.points) {
            if (point.pinned) continue;

            // Gravity
            point.applyForce(0, this.params.gravity);

            // Body interactions
            this.applyBodyForces(point);
        }

        // Update points using Verlet integration
        for (let point of this.points) {
            point.update(this.params.damping);
            point.constrain(0, this.width, 0, this.height);
        }

        // Solve constraints multiple times for stability
        for (let i = 0; i < 3; i++) {
            for (let constraint of this.constraints) {
                constraint.solve(this.params.stiffness);
            }
        }

        // Remove torn constraints
        this.constraints = this.constraints.filter(c => !c.isTorn(this.params.tearDistance));
    }

    applyBodyForces(point) {
        for (let body of this.bodyData) {
            if (!body.joints) continue;

            const keyJoints = ['handLeft', 'handRight', 'head', 'pelvis'];

            for (let jointName of keyJoints) {
                const joint = body.joints[jointName];
                if (!joint) continue;

                const jointX = joint.x * this.width;
                const jointY = joint.y * this.height;

                const dx = jointX - point.x;
                const dy = jointY - point.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.params.forceRadius && dist > 0) {
                    const falloff = 1 - (dist / this.params.forceRadius);
                    const strength = this.params.forceStrength * falloff;

                    // Push points away
                    const ndx = dx / dist;
                    const ndy = dy / dist;

                    point.applyForce(-ndx * strength, -ndy * strength);
                }
            }
        }
    }

    render() {
        // Clear with black background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw constraints as lines
        this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
        this.ctx.lineWidth = 1;

        for (let constraint of this.constraints) {
            this.ctx.beginPath();
            this.ctx.moveTo(constraint.p1.x, constraint.p1.y);
            this.ctx.lineTo(constraint.p2.x, constraint.p2.y);
            this.ctx.stroke();
        }

        // Draw points
        this.ctx.fillStyle = 'rgba(150, 220, 255, 0.8)';
        for (let point of this.points) {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.pinned ? 4 : 2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Optionally render as filled mesh (slower but prettier)
        this.renderMesh();
    }

    renderMesh() {
        this.ctx.fillStyle = 'rgba(80, 150, 200, 0.2)';

        for (let y = 0; y < this.rows - 1; y++) {
            for (let x = 0; x < this.cols - 1; x++) {
                const idx = x + y * this.cols;
                const p1 = this.points[idx];
                const p2 = this.points[idx + 1];
                const p3 = this.points[idx + this.cols];
                const p4 = this.points[idx + this.cols + 1];

                // Draw quad as two triangles
                this.ctx.beginPath();
                this.ctx.moveTo(p1.x, p1.y);
                this.ctx.lineTo(p2.x, p2.y);
                this.ctx.lineTo(p3.x, p3.y);
                this.ctx.closePath();
                this.ctx.fill();

                this.ctx.beginPath();
                this.ctx.moveTo(p2.x, p2.y);
                this.ctx.lineTo(p4.x, p4.y);
                this.ctx.lineTo(p3.x, p3.y);
                this.ctx.closePath();
                this.ctx.fill();
            }
        }
    }

    updateParams(params) {
        super.updateParams(params);
    }

    resize(width, height) {
        super.resize(width, height);
        this.init(); // Rebuild cloth for new size
    }
}

/**
 * Individual point in the cloth mesh
 */
class ClothPoint {
    constructor(x, y, pinned = false) {
        this.x = x;
        this.y = y;
        this.oldX = x;
        this.oldY = y;
        this.pinned = pinned;
        this.ax = 0; // Acceleration
        this.ay = 0;
    }

    applyForce(fx, fy) {
        this.ax += fx;
        this.ay += fy;
    }

    update(damping) {
        if (this.pinned) return;

        // Verlet integration
        const vx = (this.x - this.oldX) * damping;
        const vy = (this.y - this.oldY) * damping;

        this.oldX = this.x;
        this.oldY = this.y;

        this.x += vx + this.ax;
        this.y += vy + this.ay;

        this.ax = 0;
        this.ay = 0;
    }

    constrain(minX, maxX, minY, maxY) {
        if (this.x < minX) this.x = minX;
        if (this.x > maxX) this.x = maxX;
        if (this.y < minY) this.y = minY;
        if (this.y > maxY) this.y = maxY;
    }
}

/**
 * Constraint (connection) between two points
 */
class Constraint {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        this.restLength = Math.sqrt(dx * dx + dy * dy);
    }

    solve(stiffness) {
        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist === 0) return;

        const diff = (this.restLength - dist) / dist;
        const offsetX = dx * diff * 0.5 * stiffness;
        const offsetY = dy * diff * 0.5 * stiffness;

        if (!this.p1.pinned) {
            this.p1.x -= offsetX;
            this.p1.y -= offsetY;
        }

        if (!this.p2.pinned) {
            this.p2.x += offsetX;
            this.p2.y += offsetY;
        }
    }

    isTorn(maxDistance) {
        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist > this.restLength * maxDistance;
    }
}
