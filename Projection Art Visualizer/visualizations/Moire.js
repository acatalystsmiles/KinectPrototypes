/**
 * Moiré Patterns and Optical Illusions
 *
 * Creates mesmerizing moiré patterns and visual illusions through overlapping geometries.
 * Body tracking controls rotation, density, and animation of patterns.
 *
 * Pattern Types:
 * - Overlapping Grids: Two grids at different angles create interference patterns
 * - Concentric Circles: Classic moiré from overlapping circular patterns
 * - Line Gratings: Parallel lines with varying density
 * - Rotating Snakes: Peripheral drift motion illusion
 * - Spiral Illusion: Fraser spiral - concentric circles that appear to spiral
 * - Pinna Rotation: Square patterns create rotation perception
 */

class Moire extends BaseVisualization {
    constructor(canvas, ctx) {
        super(canvas, ctx);

        this.params = {
            patternType: 'grids',
            layer1Angle: 0,
            layer2Angle: 15,
            density: 20,
            lineThickness: 2,
            animationSpeed: 1,
            colorMode: 'bw',
            autoRotate: true
        };

        this.time = 0;
        this.layer1Rotation = 0;
        this.layer2Rotation = 0;
    }

    init() {
        this.time = 0;
        this.layer1Rotation = this.params.layer1Angle * Math.PI / 180;
        this.layer2Rotation = this.params.layer2Angle * Math.PI / 180;
    }

    update(deltaTime) {
        this.time += deltaTime * 0.001 * this.params.animationSpeed;

        // Auto-rotate patterns if enabled
        if (this.params.autoRotate) {
            this.layer1Rotation += deltaTime * 0.0001 * this.params.animationSpeed;
            this.layer2Rotation += deltaTime * 0.00015 * this.params.animationSpeed;
        } else {
            this.layer1Rotation = this.params.layer1Angle * Math.PI / 180;
            this.layer2Rotation = this.params.layer2Angle * Math.PI / 180;
        }

        // Body interaction: Use joints to influence rotation
        if (this.bodyData && this.bodyData.length > 0) {
            const body = this.bodyData[0];

            // Left hand controls layer 1 rotation
            const leftHand = body.joints.find(j => j.type === 'HAND_LEFT');
            if (leftHand) {
                const normalizedX = leftHand.x / this.width;
                this.layer1Rotation = normalizedX * Math.PI * 2;
            }

            // Right hand controls layer 2 rotation
            const rightHand = body.joints.find(j => j.type === 'HAND_RIGHT');
            if (rightHand) {
                const normalizedX = rightHand.x / this.width;
                this.layer2Rotation = normalizedX * Math.PI * 2;
            }

            // Head height controls density
            const head = body.joints.find(j => j.type === 'HEAD');
            if (head) {
                const normalizedY = 1 - (head.y / this.height);
                this.params.density = 10 + normalizedY * 40;
            }
        }
    }

    render() {
        // Clear with background
        this.ctx.fillStyle = this.params.colorMode === 'inverted' ? '#ffffff' : '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Set blend mode for moiré effect
        this.ctx.globalCompositeOperation = this.params.colorMode === 'inverted' ? 'multiply' : 'lighter';

        switch (this.params.patternType) {
            case 'grids':
                this.renderOverlappingGrids();
                break;
            case 'circles':
                this.renderConcentricCircles();
                break;
            case 'lines':
                this.renderLineGratings();
                break;
            case 'snakes':
                this.renderRotatingSnakes();
                break;
            case 'spiral':
                this.renderFraserSpiral();
                break;
            case 'pinna':
                this.renderPinnaIllusion();
                break;
        }

        // Reset blend mode
        this.ctx.globalCompositeOperation = 'source-over';
    }

    renderOverlappingGrids() {
        const spacing = this.params.density;

        // Draw two overlapping grids at different angles
        this.drawGrid(this.layer1Rotation, spacing, this.getColor(0));
        this.drawGrid(this.layer2Rotation, spacing, this.getColor(1));
    }

    drawGrid(angle, spacing, color) {
        this.ctx.save();
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.rotate(angle);

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = this.params.lineThickness;

        const maxDist = Math.sqrt(this.width * this.width + this.height * this.height);

        // Vertical lines
        for (let x = -maxDist; x <= maxDist; x += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, -maxDist);
            this.ctx.lineTo(x, maxDist);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = -maxDist; y <= maxDist; y += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(-maxDist, y);
            this.ctx.lineTo(maxDist, y);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    renderConcentricCircles() {
        const spacing = this.params.density;
        const maxRadius = Math.sqrt(this.width * this.width + this.height * this.height);

        this.ctx.lineWidth = this.params.lineThickness;
        this.ctx.strokeStyle = this.getColor(0);

        // First set of circles centered
        const cx1 = this.width / 2 + Math.cos(this.layer1Rotation) * 100;
        const cy1 = this.height / 2 + Math.sin(this.layer1Rotation) * 100;

        for (let r = spacing; r <= maxRadius; r += spacing) {
            this.ctx.beginPath();
            this.ctx.arc(cx1, cy1, r, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Second set of circles offset
        this.ctx.strokeStyle = this.getColor(1);
        const cx2 = this.width / 2 + Math.cos(this.layer2Rotation) * 100;
        const cy2 = this.height / 2 + Math.sin(this.layer2Rotation) * 100;

        for (let r = spacing; r <= maxRadius; r += spacing) {
            this.ctx.beginPath();
            this.ctx.arc(cx2, cy2, r, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    renderLineGratings() {
        const spacing = this.params.density;

        this.ctx.lineWidth = this.params.lineThickness;

        // First grating
        this.ctx.save();
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.rotate(this.layer1Rotation);
        this.ctx.strokeStyle = this.getColor(0);

        for (let x = -this.width; x <= this.width; x += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, -this.height);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        this.ctx.restore();

        // Second grating at different angle
        this.ctx.save();
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.rotate(this.layer2Rotation);
        this.ctx.strokeStyle = this.getColor(1);

        for (let x = -this.width; x <= this.width; x += spacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, -this.height);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    renderRotatingSnakes() {
        // Peripheral drift illusion - stationary pattern that appears to move
        const tileSize = this.params.density * 3;
        const numSegments = 4;
        const segmentSize = tileSize / numSegments;

        for (let y = 0; y < this.height + tileSize; y += tileSize) {
            for (let x = 0; x < this.width + tileSize; x += tileSize) {
                // Alternate pattern direction based on position
                const offset = ((x / tileSize) + (y / tileSize)) % 2 === 0 ? 0 : 2;

                // Draw the four-segment pattern
                for (let i = 0; i < numSegments; i++) {
                    const segIdx = (i + offset) % numSegments;
                    const brightness = [0, 85, 170, 255][segIdx];

                    if (this.params.colorMode === 'color') {
                        const hue = ((segIdx / numSegments) * 360 + this.time * 50) % 360;
                        this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                    } else {
                        this.ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
                    }

                    this.ctx.fillRect(
                        x + (i % 2) * segmentSize,
                        y + Math.floor(i / 2) * segmentSize,
                        segmentSize,
                        segmentSize
                    );
                }

                // Add rotating overlay element (creates motion perception)
                this.ctx.save();
                this.ctx.translate(x + tileSize / 2, y + tileSize / 2);
                this.ctx.rotate(this.layer1Rotation + (x + y) * 0.01);

                this.ctx.strokeStyle = this.params.colorMode === 'inverted' ? '#000000' : '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, tileSize / 3, 0, Math.PI * 2);
                this.ctx.stroke();

                this.ctx.restore();
            }
        }
    }

    renderFraserSpiral() {
        // Fraser spiral illusion - concentric circles that appear to spiral
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const spacing = this.params.density;
        const maxRadius = Math.min(this.width, this.height) / 2;

        for (let r = spacing; r <= maxRadius; r += spacing) {
            const numSegments = Math.floor(r * 0.5);
            const angleStep = (Math.PI * 2) / numSegments;

            for (let i = 0; i < numSegments; i++) {
                const angle = i * angleStep + this.layer1Rotation;
                const nextAngle = angle + angleStep / 2;

                // Alternate black and white segments
                const segmentIndex = Math.floor(r / spacing) + i;

                if (this.params.colorMode === 'color') {
                    const hue = (angle * 180 / Math.PI + this.time * 50) % 360;
                    this.ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
                } else {
                    this.ctx.strokeStyle = segmentIndex % 2 === 0 ?
                        (this.params.colorMode === 'inverted' ? '#000000' : '#ffffff') :
                        (this.params.colorMode === 'inverted' ? '#ffffff' : '#000000');
                }

                this.ctx.lineWidth = this.params.lineThickness * 3;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, r, angle, nextAngle);
                this.ctx.stroke();
            }
        }
    }

    renderPinnaIllusion() {
        // Pinna illusion - creates perception of rotation
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const ringSpacing = this.params.density * 2;
        const squareSize = this.params.density * 0.8;

        for (let radius = ringSpacing; radius < Math.min(this.width, this.height) / 2; radius += ringSpacing * 2) {
            const numSquares = Math.floor(radius * 0.3);
            const angleStep = (Math.PI * 2) / numSquares;

            // Determine rotation direction based on ring
            const ringIndex = Math.floor(radius / (ringSpacing * 2));
            const rotationDir = ringIndex % 2 === 0 ? 1 : -1;

            for (let i = 0; i < numSquares; i++) {
                const angle = i * angleStep;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;

                this.ctx.save();
                this.ctx.translate(x, y);
                this.ctx.rotate(angle + rotationDir * Math.PI / 4 + this.layer1Rotation * rotationDir);

                // Alternate colors
                if (this.params.colorMode === 'color') {
                    const hue = (i / numSquares * 360 + ringIndex * 60 + this.time * 50) % 360;
                    this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                } else {
                    this.ctx.fillStyle = (i + ringIndex) % 2 === 0 ?
                        (this.params.colorMode === 'inverted' ? '#ffffff' : '#000000') :
                        (this.params.colorMode === 'inverted' ? '#000000' : '#ffffff');
                }

                this.ctx.fillRect(-squareSize / 2, -squareSize / 2, squareSize, squareSize);

                // Add contrasting border
                this.ctx.strokeStyle = (i + ringIndex) % 2 === 0 ?
                    (this.params.colorMode === 'inverted' ? '#000000' : '#ffffff') :
                    (this.params.colorMode === 'inverted' ? '#ffffff' : '#000000');
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(-squareSize / 2, -squareSize / 2, squareSize, squareSize);

                this.ctx.restore();
            }
        }
    }

    getColor(layerIndex) {
        if (this.params.colorMode === 'color') {
            const hue = (layerIndex * 180 + this.time * 50) % 360;
            return `hsla(${hue}, 100%, 50%, 0.7)`;
        } else if (this.params.colorMode === 'inverted') {
            return 'rgba(0, 0, 0, 0.7)';
        } else {
            return 'rgba(255, 255, 255, 0.7)';
        }
    }
}
