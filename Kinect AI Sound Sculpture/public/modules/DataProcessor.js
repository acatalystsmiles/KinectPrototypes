/**
 * Data Processor Module
 * Handles raw movement data processing, smoothing, and enhancement
 */

class DataProcessor extends BasePlugin {
    constructor(options) {
        super(options);
        this.smoothingFactor = this.config.smoothing || 0.8;
        this.processingRate = this.config.processingRate || 60;
        this.previousData = null;
        this.dataHistory = [];
        this.maxHistoryLength = 30; // Keep 0.5 seconds at 60fps
        this.processingMetrics = {
            frameCount: 0,
            droppedFrames: 0,
            processingTime: 0
        };
    }

    async initialize() {
        console.log('DataProcessor: Initializing...');
        this.isInitialized = true;
        console.log('DataProcessor: Initialized successfully');
    }

    processRawData(rawData) {
        if (!this.isEnabled || !this.isInitialized) {
            return rawData;
        }

        const startTime = performance.now();

        try {
            // Basic validation
            if (!this.validateRawData(rawData)) {
                console.warn('DataProcessor: Invalid raw data received');
                return null;
            }

            // Process skeleton data
            const processedSkeletons = this.processSkeletons(rawData.skeletons || []);

            // Calculate aggregate metrics
            const aggregateMetrics = this.calculateAggregateMetrics(processedSkeletons);

            // Create processed data object
            const processedData = {
                timestamp: Date.now(),
                originalTimestamp: rawData.timestamp,
                skeletons: processedSkeletons,
                metrics: aggregateMetrics,
                frameInfo: {
                    frameCount: this.processingMetrics.frameCount++,
                    processingTime: 0 // Will be set below
                }
            };

            // Apply smoothing if we have previous data
            if (this.previousData) {
                processedData.skeletons = this.applySmoothingToSkeletons(
                    processedData.skeletons,
                    this.previousData.skeletons
                );
            }

            // Store in history
            this.dataHistory.push(processedData);
            if (this.dataHistory.length > this.maxHistoryLength) {
                this.dataHistory.shift();
            }

            // Update processing metrics
            const processingTime = performance.now() - startTime;
            processedData.frameInfo.processingTime = processingTime;
            this.processingMetrics.processingTime = processingTime;

            // Store as previous data
            this.previousData = processedData;

            // Emit processed data
            this.globalEventBus.emit('data:processed', processedData);

            return processedData;

        } catch (error) {
            this.handleError('processRawData', error);
            this.processingMetrics.droppedFrames++;
            return null;
        }
    }

    validateRawData(data) {
        return data &&
               typeof data === 'object' &&
               Array.isArray(data.skeletons);
    }

    processSkeletons(skeletons) {
        return skeletons.map((skeleton, index) => this.processSkeleton(skeleton, index));
    }

    processSkeleton(skeleton, index) {
        const processedSkeleton = {
            id: skeleton.id || index,
            confidence: skeleton.confidence || 0,
            joints: this.processJoints(skeleton.joints || {}),
            metrics: this.calculateSkeletonMetrics(skeleton)
        };

        return processedSkeleton;
    }

    processJoints(joints) {
        const processedJoints = {};

        for (const [jointName, joint] of Object.entries(joints)) {
            if (joint && joint.position) {
                processedJoints[jointName] = {
                    position: {
                        x: this.clampValue(joint.position.x, -5, 5),
                        y: this.clampValue(joint.position.y, -3, 3),
                        z: this.clampValue(joint.position.z, 0, 10)
                    },
                    confidence: this.clampValue(joint.confidence || 0, 0, 1),
                    velocity: this.calculateJointVelocity(jointName, joint.position),
                    acceleration: this.calculateJointAcceleration(jointName, joint.position)
                };
            }
        }

        return processedJoints;
    }

    calculateJointVelocity(jointName, currentPosition) {
        if (!this.previousData || !this.previousData.skeletons) return { x: 0, y: 0, z: 0 };

        // Find corresponding joint in previous frame
        for (const prevSkeleton of this.previousData.skeletons) {
            const prevJoint = prevSkeleton.joints[jointName];
            if (prevJoint && prevJoint.position) {
                const dt = 1 / this.processingRate; // Assume consistent frame rate
                return {
                    x: (currentPosition.x - prevJoint.position.x) / dt,
                    y: (currentPosition.y - prevJoint.position.y) / dt,
                    z: (currentPosition.z - prevJoint.position.z) / dt
                };
            }
        }

        return { x: 0, y: 0, z: 0 };
    }

    calculateJointAcceleration(jointName, currentPosition) {
        if (this.dataHistory.length < 2) return { x: 0, y: 0, z: 0 };

        const prevFrame = this.dataHistory[this.dataHistory.length - 1];
        const prevPrevFrame = this.dataHistory[this.dataHistory.length - 2];

        // Find corresponding joints
        let currentVel = null, prevVel = null;

        for (const skeleton of prevFrame.skeletons) {
            const joint = skeleton.joints[jointName];
            if (joint) {
                currentVel = joint.velocity;
                break;
            }
        }

        for (const skeleton of prevPrevFrame.skeletons) {
            const joint = skeleton.joints[jointName];
            if (joint) {
                prevVel = joint.velocity;
                break;
            }
        }

        if (currentVel && prevVel) {
            const dt = 1 / this.processingRate;
            return {
                x: (currentVel.x - prevVel.x) / dt,
                y: (currentVel.y - prevVel.y) / dt,
                z: (currentVel.z - prevVel.z) / dt
            };
        }

        return { x: 0, y: 0, z: 0 };
    }

    calculateSkeletonMetrics(skeleton) {
        const joints = skeleton.joints || {};
        let totalMotion = 0;
        let totalExpansion = 0;
        let validJoints = 0;

        // Calculate overall motion
        for (const joint of Object.values(joints)) {
            if (joint && joint.position && joint.confidence > 0.5) {
                const velocity = this.calculateJointVelocity('', joint.position);
                const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
                totalMotion += speed;
                validJoints++;
            }
        }

        // Calculate body expansion (distance between extremities)
        const leftHand = joints.HAND_LEFT;
        const rightHand = joints.HAND_RIGHT;
        const head = joints.HEAD;
        const leftFoot = joints.FOOT_LEFT;
        const rightFoot = joints.FOOT_RIGHT;

        if (leftHand && rightHand && leftHand.confidence > 0.5 && rightHand.confidence > 0.5) {
            const handSpan = this.calculateDistance(leftHand.position, rightHand.position);
            totalExpansion += handSpan;
        }

        if (head && leftFoot && head.confidence > 0.5 && leftFoot.confidence > 0.5) {
            const height = Math.abs(head.position.y - leftFoot.position.y);
            totalExpansion += height;
        }

        return {
            overallMotion: validJoints > 0 ? totalMotion / validJoints : 0,
            bodyExpansion: totalExpansion,
            jointCount: validJoints,
            averageConfidence: this.calculateAverageConfidence(joints)
        };
    }

    calculateAggregateMetrics(skeletons) {
        if (skeletons.length === 0) {
            return {
                totalBodies: 0,
                averageMotion: 0,
                totalHandActivity: 0,
                groupCohesion: 0,
                energyLevel: 0
            };
        }

        let totalMotion = 0;
        let totalHandActivity = 0;
        let energyLevel = 0;

        for (const skeleton of skeletons) {
            totalMotion += skeleton.metrics.overallMotion || 0;

            // Calculate hand activity
            const leftHand = skeleton.joints.HAND_LEFT;
            const rightHand = skeleton.joints.HAND_RIGHT;
            if (leftHand && rightHand) {
                const leftSpeed = this.calculateSpeed(leftHand.velocity);
                const rightSpeed = this.calculateSpeed(rightHand.velocity);
                totalHandActivity += leftSpeed + rightSpeed;
            }

            // Energy level is a combination of motion and expansion
            energyLevel += (skeleton.metrics.overallMotion || 0) * (skeleton.metrics.bodyExpansion || 1);
        }

        // Calculate group cohesion (how close people are to each other)
        const groupCohesion = this.calculateGroupCohesion(skeletons);

        return {
            totalBodies: skeletons.length,
            averageMotion: totalMotion / skeletons.length,
            totalHandActivity: totalHandActivity,
            groupCohesion: groupCohesion,
            energyLevel: energyLevel / skeletons.length
        };
    }

    calculateGroupCohesion(skeletons) {
        if (skeletons.length < 2) return 0;

        const centers = skeletons.map(skeleton => {
            const spine = skeleton.joints.SPINE_CHEST;
            return spine ? spine.position : { x: 0, y: 0, z: 0 };
        });

        // Calculate average center
        const avgCenter = centers.reduce(
            (acc, center) => ({
                x: acc.x + center.x / centers.length,
                y: acc.y + center.y / centers.length,
                z: acc.z + center.z / centers.length
            }),
            { x: 0, y: 0, z: 0 }
        );

        // Calculate average distance from center
        const avgDistance = centers.reduce((sum, center) =>
            sum + this.calculateDistance(center, avgCenter), 0
        ) / centers.length;

        // Convert to cohesion score (closer = higher cohesion)
        return Math.max(0, 1 - avgDistance / 3); // Normalize to 0-1
    }

    applySmoothingToSkeletons(currentSkeletons, previousSkeletons) {
        return currentSkeletons.map(currentSkeleton => {
            // Find corresponding skeleton in previous frame
            const prevSkeleton = previousSkeletons.find(prev => prev.id === currentSkeleton.id);

            if (!prevSkeleton) return currentSkeleton;

            // Apply smoothing to joint positions
            const smoothedJoints = {};
            for (const [jointName, joint] of Object.entries(currentSkeleton.joints)) {
                const prevJoint = prevSkeleton.joints[jointName];

                if (prevJoint && joint.confidence > 0.3) {
                    smoothedJoints[jointName] = {
                        ...joint,
                        position: this.smoothPosition(joint.position, prevJoint.position)
                    };
                } else {
                    smoothedJoints[jointName] = joint;
                }
            }

            return {
                ...currentSkeleton,
                joints: smoothedJoints
            };
        });
    }

    smoothPosition(current, previous) {
        const factor = this.smoothingFactor;
        return {
            x: previous.x * factor + current.x * (1 - factor),
            y: previous.y * factor + current.y * (1 - factor),
            z: previous.z * factor + current.z * (1 - factor)
        };
    }

    // Utility methods
    clampValue(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    calculateDistance(pos1, pos2) {
        return Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) +
            Math.pow(pos1.y - pos2.y, 2) +
            Math.pow(pos1.z - pos2.z, 2)
        );
    }

    calculateSpeed(velocity) {
        return Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
    }

    calculateAverageConfidence(joints) {
        const confidences = Object.values(joints)
            .filter(joint => joint && typeof joint.confidence === 'number')
            .map(joint => joint.confidence);

        return confidences.length > 0 ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0;
    }

    getProcessingMetrics() {
        return {
            ...this.processingMetrics,
            dropRate: this.processingMetrics.droppedFrames / Math.max(this.processingMetrics.frameCount, 1),
            historyLength: this.dataHistory.length
        };
    }

    updateConfig(newConfig) {
        super.updateConfig(newConfig);
        this.smoothingFactor = this.config.smoothing || 0.8;
        this.processingRate = this.config.processingRate || 60;
    }

    static getMetadata() {
        return {
            name: 'DataProcessor',
            version: '1.0.0',
            description: 'Processes raw movement data with smoothing and enhancement',
            author: 'Kinect Sculpture System',
            category: 'core',
            dependencies: [],
            configSchema: {
                smoothing: { type: 'number', default: 0.8, min: 0, max: 1 },
                processingRate: { type: 'number', default: 60, min: 10, max: 120 }
            }
        };
    }

    static getDefaultConfig() {
        return {
            ...super.getDefaultConfig(),
            smoothing: 0.8,
            processingRate: 60,
            critical: false
        };
    }
}

// Export for both CommonJS and browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataProcessor;
} else if (typeof window !== 'undefined') {
    window.DataProcessor = DataProcessor;
}