/**
 * Falling Sand Visualization
 * Cellular automata simulation where sand particles fall and accumulate
 * Body interaction spawns sand from joints or blocks falling sand
 */
class FallingSand extends BaseVisualization {
    constructor(canvas, ctx) {
        super(canvas, ctx);

        this.cellSize = 4; // Size of each sand grain in pixels
        this.cols = 0;
        this.rows = 0;
        this.grid = []; // 2D grid of sand particles

        this.params = {
            spawnRate: 10,           // Particles spawned per frame
            colorMode: 'golden',     // Color scheme
            bodyMode: 'spawn',       // 'spawn' or 'block'
            gravity: 1.0,            // Gravity strength
            spread: 2,               // Horizontal spread when falling
            autoSpawn: true,         // Continuously spawn from top
            spawnWidth: 0.5          // Width of spawn area (0-1)
        };
    }

    init() {
        // Calculate grid dimensions
        this.cols = Math.ceil(this.width / this.cellSize);
        this.rows = Math.ceil(this.height / this.cellSize);

        // Initialize empty grid
        this.grid = [];
        for (let y = 0; y < this.rows; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.cols; x++) {
                this.grid[y][x] = null;
            }
        }
    }

    update(deltaTime) {
        // Auto-spawn sand from top
        if (this.params.autoSpawn) {
            this.spawnSandFromTop();
        }

        // Spawn sand from body joints if in spawn mode
        if (this.params.bodyMode === 'spawn' && this.bodyData && this.bodyData.length > 0) {
            this.spawnSandFromBodies();
        }

        // Update sand particles using cellular automata rules
        this.updateSandPhysics();
    }

    spawnSandFromTop() {
        const centerX = this.cols / 2;
        const spawnWidth = Math.floor(this.cols * this.params.spawnWidth);

        for (let i = 0; i < this.params.spawnRate; i++) {
            const x = Math.floor(centerX - spawnWidth / 2 + Math.random() * spawnWidth);
            const y = 0;

            if (x >= 0 && x < this.cols && !this.grid[y][x]) {
                this.grid[y][x] = this.createSandParticle(x, y);
            }
        }
    }

    spawnSandFromBodies() {
        for (let body of this.bodyData) {
            if (!body.joints) continue;

            // Spawn from specific joints
            const spawnJoints = ['HAND_LEFT', 'HAND_RIGHT', 'HEAD'];

            for (let joint of body.joints) {
                if (spawnJoints.includes(joint.type)) {
                    const gridX = Math.floor(joint.x / this.cellSize);
                    const gridY = Math.floor(joint.y / this.cellSize);

                    // Spawn multiple particles around joint
                    for (let i = 0; i < 5; i++) {
                        const dx = Math.floor(Math.random() * 5 - 2);
                        const dy = Math.floor(Math.random() * 5 - 2);
                        const x = gridX + dx;
                        const y = gridY + dy;

                        if (x >= 0 && x < this.cols && y >= 0 && y < this.rows && !this.grid[y][x]) {
                            this.grid[y][x] = this.createSandParticle(x, y);
                        }
                    }
                }
            }
        }
    }

    createSandParticle(x, y) {
        return {
            x: x,
            y: y,
            color: this.getParticleColor(),
            settled: false
        };
    }

    updateSandPhysics() {
        // Create new grid for next state
        const newGrid = [];
        for (let y = 0; y < this.rows; y++) {
            newGrid[y] = [];
            for (let x = 0; x < this.cols; x++) {
                newGrid[y][x] = null;
            }
        }

        // Process from bottom to top to avoid double-updating
        for (let y = this.rows - 1; y >= 0; y--) {
            for (let x = 0; x < this.cols; x++) {
                const particle = this.grid[y][x];
                if (!particle) continue;

                // Check if body is blocking (in block mode)
                if (this.params.bodyMode === 'block' && this.isBodyBlocking(x, y)) {
                    // Sand bounces off body
                    const bounceX = x + (Math.random() > 0.5 ? 1 : -1);
                    if (bounceX >= 0 && bounceX < this.cols && y > 0 && !newGrid[y][bounceX]) {
                        newGrid[y][bounceX] = particle;
                        continue;
                    }
                }

                // Try to move down
                if (y < this.rows - 1 && !newGrid[y + 1][x]) {
                    newGrid[y + 1][x] = particle;
                }
                // Try to move down-left or down-right
                else if (y < this.rows - 1) {
                    const directions = [];
                    if (x > 0 && !newGrid[y + 1][x - 1]) directions.push(-1);
                    if (x < this.cols - 1 && !newGrid[y + 1][x + 1]) directions.push(1);

                    if (directions.length > 0) {
                        const dir = directions[Math.floor(Math.random() * directions.length)];
                        newGrid[y + 1][x + dir] = particle;
                    } else {
                        // Can't move - stays in place
                        particle.settled = true;
                        newGrid[y][x] = particle;
                    }
                }
                // At bottom - settled
                else {
                    particle.settled = true;
                    newGrid[y][x] = particle;
                }
            }
        }

        this.grid = newGrid;
    }

    isBodyBlocking(gridX, gridY) {
        if (!this.bodyData || this.bodyData.length === 0) return false;

        const pixelX = gridX * this.cellSize;
        const pixelY = gridY * this.cellSize;
        const blockRadius = 40;

        for (let body of this.bodyData) {
            if (!body.joints) continue;

            for (let joint of body.joints) {
                const dx = pixelX - joint.x;
                const dy = pixelY - joint.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < blockRadius) {
                    return true;
                }
            }
        }

        return false;
    }

    getParticleColor() {
        switch (this.params.colorMode) {
            case 'golden':
                // Golden sand colors
                const goldens = [
                    '#F4A460', '#DAA520', '#CD853F', '#DEB887', '#D2691E'
                ];
                return goldens[Math.floor(Math.random() * goldens.length)];

            case 'rainbow':
                const hue = Math.random() * 360;
                return `hsl(${hue}, 80%, 60%)`;

            case 'ocean':
                // Blue sand
                const blues = [
                    '#4682B4', '#5F9EA0', '#87CEEB', '#6495ED', '#4169E1'
                ];
                return blues[Math.floor(Math.random() * blues.length)];

            case 'volcanic':
                // Red/orange volcanic sand
                const volcanic = [
                    '#FF4500', '#FF6347', '#DC143C', '#B22222', '#8B0000'
                ];
                return volcanic[Math.floor(Math.random() * volcanic.length)];

            case 'monochrome':
                const gray = Math.floor(Math.random() * 100 + 155);
                return `rgb(${gray}, ${gray}, ${gray})`;

            default:
                return '#F4A460';
        }
    }

    render() {
        // Clear background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw sand particles
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const particle = this.grid[y][x];
                if (particle) {
                    this.ctx.fillStyle = particle.color;
                    this.ctx.fillRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        }

        // Draw body outlines in block mode
        if (this.params.bodyMode === 'block' && this.bodyData && this.bodyData.length > 0) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 2;

            for (let body of this.bodyData) {
                if (!body.joints) continue;

                for (let joint of body.joints) {
                    this.ctx.beginPath();
                    this.ctx.arc(joint.x, joint.y, 40, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
            }
        }
    }

    resize(width, height) {
        super.resize(width, height);
        this.init(); // Reinitialize grid on resize
    }
}
