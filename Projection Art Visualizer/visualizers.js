/**
 * Visualization Manager
 * Handles switching between different visualization modes
 */
class VisualizationManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.currentViz = null;
        this.currentMode = null;

        // Registry of available visualizations
        this.visualizations = {
            particleField: ParticleField,
            fluidDynamics: FluidDynamics,
            cloth: VerletCloth,
            boids: BoidsSimulation,
            waves: WaveInterference,
            rain: Rain
        };
    }

    /**
     * Switch to a different visualization mode
     * @param {string} mode - The visualization mode to switch to
     */
    switchMode(mode) {
        if (this.currentMode === mode) {
            return; // Already in this mode
        }

        if (!this.visualizations[mode]) {
            console.error(`Visualization mode "${mode}" not found`);
            return;
        }

        // Clean up current visualization
        if (this.currentViz) {
            this.currentViz.destroy();
        }

        // Create new visualization
        const VizClass = this.visualizations[mode];
        this.currentViz = new VizClass(this.canvas, this.ctx);
        this.currentViz.init();
        this.currentMode = mode;

        console.log(`Switched to visualization mode: ${mode}`);
    }

    /**
     * Update the current visualization
     */
    update(deltaTime) {
        if (this.currentViz) {
            this.currentViz.update(deltaTime);
        }
    }

    /**
     * Render the current visualization
     */
    render() {
        if (this.currentViz) {
            this.currentViz.render();
        }
    }

    /**
     * Update body tracking data
     */
    updateBodies(bodies) {
        if (this.currentViz) {
            this.currentViz.updateBodies(bodies);
        }
    }

    /**
     * Update visualization parameters
     */
    updateParams(params) {
        if (this.currentViz) {
            this.currentViz.updateParams(params);
        }
    }

    /**
     * Handle canvas resize
     */
    resize(width, height) {
        if (this.currentViz) {
            this.currentViz.resize(width, height);
        }
    }

    /**
     * Reset current visualization
     */
    reset() {
        if (this.currentViz) {
            this.currentViz.init();
        }
    }
}
