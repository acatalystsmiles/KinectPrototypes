/**
 * Base class for all visualization modes
 * Each visualization should extend this and implement the required methods
 */
class BaseVisualization {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        this.bodyData = []; // Array of body skeleton data from Kinect
        this.params = {}; // Visualization-specific parameters
    }

    /**
     * Initialize the visualization
     * Called once when the visualization is created or reset
     */
    init() {
        throw new Error('init() must be implemented by subclass');
    }

    /**
     * Update visualization state
     * Called every frame before render
     * @param {number} deltaTime - Time since last frame in seconds
     */
    update(deltaTime) {
        throw new Error('update() must be implemented by subclass');
    }

    /**
     * Render the visualization
     * Called every frame after update
     */
    render() {
        throw new Error('render() must be implemented by subclass');
    }

    /**
     * Update body tracking data from Kinect
     * @param {Array} bodies - Array of body objects with joint positions
     */
    updateBodies(bodies) {
        this.bodyData = bodies;
    }

    /**
     * Update visualization parameters
     * @param {Object} params - Parameter object
     */
    updateParams(params) {
        this.params = { ...this.params, ...params };
    }

    /**
     * Handle canvas resize
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
    }

    /**
     * Clean up resources when switching visualizations
     */
    destroy() {
        // Override if needed
    }

    /**
     * Get available parameters for UI controls
     * @returns {Object} Parameter definitions
     */
    getParameters() {
        return {};
    }
}
