/**
 * Rain Visualization
 * Beautiful falling rain with splashes, wind effects, and body interaction
 * Body acts as an umbrella, blocking raindrops
 */
class Rain extends BaseVisualization {
    constructor(canvas, ctx) {
        super(canvas, ctx);

        this.raindrops = [];
        this.splashes = [];

        this.params = {
            rainIntensity: 300,      // Number of raindrops
            dropSpeed: 8,            // Fall speed
            dropSize: 3,             // Size of raindrops
            windStrength: 0.5,       // Horizontal wind force
            splashIntensity: 1.0,    // Size/number of splash particles
            trailLength: 0.85,       // Motion blur effect
            colorMode: 'blue'        // Color scheme
        };
    }

    init() {
        this.raindrops = [];
        this.splashes = [];

        // Create initial raindrops
        for (let i = 0; i < this.params.rainIntensity; i++) {
            this.raindrops.push(new Raindrop(this.width, this.height, this.params));
        }
    }

    update(deltaTime) {
        // Update raindrops
        for (let drop of this.raindrops) {
            // Apply gravity
            drop.vy += this.params.dropSpeed * 0.5 * deltaTime;

            // Apply wind
            drop.vx = this.params.windStrength * 2;

            // Update position
            drop.x += drop.vx;
            drop.y += drop.vy;

            // Check body collisions (umbrella effect)
            this.checkBodyCollision(drop);

            // Check if hit ground
            if (drop.y >= this.height) {
                this.createSplash(drop.x, this.height);
                this.respawnDrop(drop);
            }

            // Wrap horizontally
            if (drop.x < 0) drop.x = this.width;
            if (drop.x > this.width) drop.x = 0;

            // Respawn if too far off top (from wind)
            if (drop.y < -50) {
                this.respawnDrop(drop);
            }
        }

        // Update splashes
        for (let i = this.splashes.length - 1; i >= 0; i--) {
            const splash = this.splashes[i];
            splash.update(deltaTime);

            // Remove dead splashes
            if (splash.life <= 0) {
                this.splashes.splice(i, 1);
            }
        }
    }

    checkBodyCollision(drop) {
        for (let body of this.bodyData) {
            if (!body.joints) continue;

            // Check collision with body segments
            const segments = [
                ['head', 'neck'],
                ['neck', 'shoulderLeft'],
                ['neck', 'shoulderRight'],
                ['shoulderLeft', 'elbowLeft'],
                ['shoulderRight', 'elbowRight'],
                ['elbowLeft', 'handLeft'],
                ['elbowRight', 'handRight'],
                ['neck', 'spineChest'],
                ['spineChest', 'pelvis']
            ];

            for (let [joint1Name, joint2Name] of segments) {
                const joint1 = body.joints[joint1Name];
                const joint2 = body.joints[joint2Name];

                if (!joint1 || !joint2) continue;

                const x1 = joint1.x * this.width;
                const y1 = joint1.y * this.height;
                const x2 = joint2.x * this.width;
                const y2 = joint2.y * this.height;

                // Check if raindrop is near this body segment
                const distance = this.pointToSegmentDistance(
                    drop.x, drop.y,
                    x1, y1, x2, y2
                );

                if (distance < 30) {
                    // Raindrop hit body - create splash and respawn
                    this.createSplash(drop.x, drop.y, 0.5);
                    this.respawnDrop(drop);
                    return;
                }
            }
        }
    }

    pointToSegmentDistance(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lengthSq = dx * dx + dy * dy;

        if (lengthSq === 0) {
            // Segment is a point
            const distX = px - x1;
            const distY = py - y1;
            return Math.sqrt(distX * distX + distY * distY);
        }

        // Calculate projection
        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;

        const distX = px - projX;
        const distY = py - projY;
        return Math.sqrt(distX * distX + distY * distY);
    }

    createSplash(x, y, intensity = 1.0) {
        const particleCount = Math.floor(5 * this.params.splashIntensity * intensity);

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI - Math.PI / 2; // Upward spray
            const speed = (Math.random() * 3 + 2) * this.params.splashIntensity;

            this.splashes.push(new SplashParticle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            ));
        }
    }

    respawnDrop(drop) {
        drop.x = Math.random() * this.width;
        drop.y = -Math.random() * this.height * 0.5; // Stagger spawning
        drop.vx = this.params.windStrength * 2;
        drop.vy = Math.random() * 2;
    }

    render() {
        // Apply trail effect
        this.ctx.fillStyle = `rgba(0, 0, 0, ${1 - this.params.trailLength})`;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw raindrops
        for (let drop of this.raindrops) {
            const color = this.getDropColor(drop);
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = this.params.dropSize;
            this.ctx.lineCap = 'round';

            // Draw raindrop as a line
            this.ctx.beginPath();
            this.ctx.moveTo(drop.x, drop.y);
            this.ctx.lineTo(drop.x - drop.vx * 2, drop.y - drop.vy * 0.3);
            this.ctx.stroke();
        }

        // Draw splashes
        for (let splash of this.splashes) {
            const alpha = splash.life / splash.maxLife;
            const color = this.getSplashColor(splash, alpha);
            this.ctx.fillStyle = color;

            this.ctx.beginPath();
            this.ctx.arc(splash.x, splash.y, splash.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    getDropColor(drop) {
        switch (this.params.colorMode) {
            case 'blue':
                return 'rgba(150, 200, 255, 0.7)';

            case 'white':
                return 'rgba(255, 255, 255, 0.8)';

            case 'rainbow': {
                const hue = (drop.x / this.width * 360) % 360;
                return `hsla(${hue}, 80%, 70%, 0.7)`;
            }

            case 'neon': {
                const hue = (drop.y / this.height * 120 + 180) % 360;
                return `hsla(${hue}, 100%, 60%, 0.8)`;
            }

            default:
                return 'rgba(150, 200, 255, 0.7)';
        }
    }

    getSplashColor(splash, alpha) {
        switch (this.params.colorMode) {
            case 'blue':
                return `rgba(150, 200, 255, ${alpha * 0.6})`;

            case 'white':
                return `rgba(255, 255, 255, ${alpha * 0.7})`;

            case 'rainbow': {
                const hue = (splash.x / this.width * 360) % 360;
                return `hsla(${hue}, 80%, 70%, ${alpha * 0.6})`;
            }

            case 'neon': {
                const hue = (splash.y / this.height * 120 + 180) % 360;
                return `hsla(${hue}, 100%, 60%, ${alpha * 0.7})`;
            }

            default:
                return `rgba(150, 200, 255, ${alpha * 0.6})`;
        }
    }

    updateParams(params) {
        super.updateParams(params);

        // Handle rain intensity changes
        if (params.rainIntensity !== undefined) {
            const diff = params.rainIntensity - this.raindrops.length;

            if (diff > 0) {
                // Add raindrops
                for (let i = 0; i < diff; i++) {
                    this.raindrops.push(new Raindrop(this.width, this.height, this.params));
                }
            } else if (diff < 0) {
                // Remove raindrops
                this.raindrops = this.raindrops.slice(0, params.rainIntensity);
            }
        }
    }

    resize(width, height) {
        super.resize(width, height);
    }
}

/**
 * Individual raindrop
 */
class Raindrop {
    constructor(maxX, maxY, params) {
        this.x = Math.random() * maxX;
        this.y = -Math.random() * maxY; // Start above screen
        this.vx = params.windStrength * 2;
        this.vy = Math.random() * 2;
    }
}

/**
 * Splash particle created when raindrop hits surface
 */
class SplashParticle {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = 1.0;
        this.maxLife = 1.0;
        this.size = Math.random() * 2 + 1;
    }

    update(deltaTime) {
        // Apply gravity
        this.vy += 15 * deltaTime;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Fade out
        this.life -= deltaTime * 2;

        // Shrink
        this.size *= 0.95;
    }
}
