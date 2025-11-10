class MovementAnalyzer {
    constructor() {
        this.previousFrames = new Map();
        this.historyLength = 30; // 30 frames of history (~0.5 seconds at 60fps)
        this.smoothingFactor = 0.7;

        this.azureKinectJoints = {
            PELVIS: 0,
            SPINE_NAVAL: 1,
            SPINE_CHEST: 2,
            NECK: 3,
            CLAVICLE_LEFT: 4,
            SHOULDER_LEFT: 5,
            ELBOW_LEFT: 6,
            WRIST_LEFT: 7,
            HAND_LEFT: 8,
            HANDTIP_LEFT: 9,
            THUMB_LEFT: 10,
            CLAVICLE_RIGHT: 11,
            SHOULDER_RIGHT: 12,
            ELBOW_RIGHT: 13,
            WRIST_RIGHT: 14,
            HAND_RIGHT: 15,
            HANDTIP_RIGHT: 16,
            THUMB_RIGHT: 17,
            HIP_LEFT: 18,
            KNEE_LEFT: 19,
            ANKLE_LEFT: 20,
            FOOT_LEFT: 21,
            HIP_RIGHT: 22,
            KNEE_RIGHT: 23,
            ANKLE_RIGHT: 24,
            FOOT_RIGHT: 25,
            HEAD: 26,
            NOSE: 27,
            EYE_LEFT: 28,
            EAR_LEFT: 29,
            EYE_RIGHT: 30,
            EAR_RIGHT: 31
        };
    }

    analyze(skeletonData) {
        const timestamp = Date.now();
        const bodies = skeletonData.bodies || skeletonData.skeletons || [];
        const processedBodies = [];

        for (let bodyIndex = 0; bodyIndex < bodies.length; bodyIndex++) {
            const body = bodies[bodyIndex];
            const bodyId = body.id || bodyIndex;

            if (!this.previousFrames.has(bodyId)) {
                this.previousFrames.set(bodyId, []);
            }

            const bodyHistory = this.previousFrames.get(bodyId);
            const processedBody = this.processBody(body, bodyHistory, timestamp);
            processedBodies.push(processedBody);

            bodyHistory.push({
                timestamp,
                joints: this.normalizeJoints(body.joints || body.skeleton?.joints || []),
                metrics: processedBody.metrics
            });

            if (bodyHistory.length > this.historyLength) {
                bodyHistory.shift();
            }
        }

        const aggregateMetrics = this.calculateAggregateMetrics(processedBodies);

        this.cleanupOldBodies(timestamp);

        return {
            timestamp,
            bodies: processedBodies,
            metrics: aggregateMetrics
        };
    }

    processBody(body, history, timestamp) {
        const joints = this.normalizeJoints(body.joints || body.skeleton?.joints || []);
        const metrics = this.calculateBodyMetrics(joints, history, timestamp);

        return {
            id: body.id || 0,
            confidence: body.confidence || 1.0,
            joints,
            metrics
        };
    }

    normalizeJoints(rawJoints) {
        const joints = {};

        if (Array.isArray(rawJoints)) {
            rawJoints.forEach((joint, index) => {
                if (joint && typeof joint === 'object') {
                    joints[index] = {
                        position: {
                            x: joint.position?.x || joint.x || 0,
                            y: joint.position?.y || joint.y || 0,
                            z: joint.position?.z || joint.z || 0
                        },
                        confidence: joint.confidence || joint.trackingState || 1.0
                    };
                }
            });
        } else if (typeof rawJoints === 'object') {
            Object.keys(rawJoints).forEach(key => {
                const joint = rawJoints[key];
                joints[key] = {
                    position: {
                        x: joint.position?.x || joint.x || 0,
                        y: joint.position?.y || joint.y || 0,
                        z: joint.position?.z || joint.z || 0
                    },
                    confidence: joint.confidence || joint.trackingState || 1.0
                };
            });
        }

        return joints;
    }

    calculateBodyMetrics(joints, history, timestamp) {
        const metrics = {
            overallMotion: 0,
            handVelocities: { left: 0, right: 0 },
            centerOfMass: { x: 0, y: 0, z: 0 },
            centerOfMassShift: 0,
            bodyExpansion: 0,
            verticalMovement: 0,
            symmetry: 0,
            movementQuality: {
                flowing: 0,
                expansive: 0,
                rhythmic: 0,
                smooth: 0,
                speed: 0,
                grounded: 0
            }
        };

        if (history.length === 0) {
            metrics.centerOfMass = this.calculateCenterOfMass(joints);
            return metrics;
        }

        const previousFrame = history[history.length - 1];
        const deltaTime = (timestamp - previousFrame.timestamp) / 1000; // Convert to seconds

        if (deltaTime <= 0) return metrics;

        metrics.overallMotion = this.calculateOverallMotion(joints, previousFrame.joints, deltaTime);

        metrics.handVelocities = this.calculateHandVelocities(joints, previousFrame.joints, deltaTime);

        metrics.centerOfMass = this.calculateCenterOfMass(joints);
        metrics.centerOfMassShift = this.calculateCenterOfMassShift(
            metrics.centerOfMass,
            previousFrame.joints
        );

        metrics.bodyExpansion = this.calculateBodyExpansion(joints);

        metrics.verticalMovement = this.calculateVerticalMovement(joints, previousFrame.joints, deltaTime);

        metrics.symmetry = this.calculateSymmetry(joints);

        metrics.movementQuality = this.calculateMovementQuality(joints, history, deltaTime);

        return metrics;
    }

    calculateOverallMotion(currentJoints, previousJoints, deltaTime) {
        let totalVelocity = 0;
        let jointCount = 0;

        Object.keys(currentJoints).forEach(jointKey => {
            if (previousJoints[jointKey]) {
                const current = currentJoints[jointKey].position;
                const previous = previousJoints[jointKey].position;

                const velocity = Math.sqrt(
                    Math.pow(current.x - previous.x, 2) +
                    Math.pow(current.y - previous.y, 2) +
                    Math.pow(current.z - previous.z, 2)
                ) / deltaTime;

                totalVelocity += velocity;
                jointCount++;
            }
        });

        return jointCount > 0 ? totalVelocity / jointCount : 0;
    }

    calculateHandVelocities(currentJoints, previousJoints, deltaTime) {
        const velocities = { left: 0, right: 0 };

        const leftHandKey = this.azureKinectJoints.HAND_LEFT;
        const rightHandKey = this.azureKinectJoints.HAND_RIGHT;

        if (currentJoints[leftHandKey] && previousJoints[leftHandKey]) {
            const current = currentJoints[leftHandKey].position;
            const previous = previousJoints[leftHandKey].position;
            velocities.left = Math.sqrt(
                Math.pow(current.x - previous.x, 2) +
                Math.pow(current.y - previous.y, 2) +
                Math.pow(current.z - previous.z, 2)
            ) / deltaTime;
        }

        if (currentJoints[rightHandKey] && previousJoints[rightHandKey]) {
            const current = currentJoints[rightHandKey].position;
            const previous = previousJoints[rightHandKey].position;
            velocities.right = Math.sqrt(
                Math.pow(current.x - previous.x, 2) +
                Math.pow(current.y - previous.y, 2) +
                Math.pow(current.z - previous.z, 2)
            ) / deltaTime;
        }

        return velocities;
    }

    calculateCenterOfMass(joints) {
        let totalX = 0, totalY = 0, totalZ = 0;
        let jointCount = 0;

        Object.values(joints).forEach(joint => {
            if (joint.confidence > 0.5) {
                totalX += joint.position.x;
                totalY += joint.position.y;
                totalZ += joint.position.z;
                jointCount++;
            }
        });

        return jointCount > 0 ? {
            x: totalX / jointCount,
            y: totalY / jointCount,
            z: totalZ / jointCount
        } : { x: 0, y: 0, z: 0 };
    }

    calculateCenterOfMassShift(currentCOM, previousJoints) {
        const previousCOM = this.calculateCenterOfMass(previousJoints);
        return Math.sqrt(
            Math.pow(currentCOM.x - previousCOM.x, 2) +
            Math.pow(currentCOM.y - previousCOM.y, 2) +
            Math.pow(currentCOM.z - previousCOM.z, 2)
        );
    }

    calculateBodyExpansion(joints) {
        const coreJoints = [
            this.azureKinectJoints.HEAD,
            this.azureKinectJoints.HAND_LEFT,
            this.azureKinectJoints.HAND_RIGHT,
            this.azureKinectJoints.FOOT_LEFT,
            this.azureKinectJoints.FOOT_RIGHT
        ];

        const center = this.calculateCenterOfMass(joints);
        let totalDistance = 0;
        let validJoints = 0;

        coreJoints.forEach(jointKey => {
            if (joints[jointKey] && joints[jointKey].confidence > 0.5) {
                const joint = joints[jointKey].position;
                const distance = Math.sqrt(
                    Math.pow(joint.x - center.x, 2) +
                    Math.pow(joint.y - center.y, 2) +
                    Math.pow(joint.z - center.z, 2)
                );
                totalDistance += distance;
                validJoints++;
            }
        });

        return validJoints > 0 ? totalDistance / validJoints : 0;
    }

    calculateVerticalMovement(currentJoints, previousJoints, deltaTime) {
        const headKey = this.azureKinectJoints.HEAD;
        const pelvisKey = this.azureKinectJoints.PELVIS;

        let verticalVelocity = 0;
        let measurements = 0;

        [headKey, pelvisKey].forEach(jointKey => {
            if (currentJoints[jointKey] && previousJoints[jointKey]) {
                const currentY = currentJoints[jointKey].position.y;
                const previousY = previousJoints[jointKey].position.y;
                verticalVelocity += Math.abs(currentY - previousY) / deltaTime;
                measurements++;
            }
        });

        return measurements > 0 ? verticalVelocity / measurements : 0;
    }

    calculateSymmetry(joints) {
        const symmetryPairs = [
            [this.azureKinectJoints.SHOULDER_LEFT, this.azureKinectJoints.SHOULDER_RIGHT],
            [this.azureKinectJoints.ELBOW_LEFT, this.azureKinectJoints.ELBOW_RIGHT],
            [this.azureKinectJoints.HAND_LEFT, this.azureKinectJoints.HAND_RIGHT],
            [this.azureKinectJoints.HIP_LEFT, this.azureKinectJoints.HIP_RIGHT],
            [this.azureKinectJoints.KNEE_LEFT, this.azureKinectJoints.KNEE_RIGHT],
            [this.azureKinectJoints.ANKLE_LEFT, this.azureKinectJoints.ANKLE_RIGHT]
        ];

        const center = this.calculateCenterOfMass(joints);
        let symmetryScore = 0;
        let validPairs = 0;

        symmetryPairs.forEach(([leftKey, rightKey]) => {
            if (joints[leftKey] && joints[rightKey] &&
                joints[leftKey].confidence > 0.5 && joints[rightKey].confidence > 0.5) {

                const leftPos = joints[leftKey].position;
                const rightPos = joints[rightKey].position;

                const leftDistance = Math.abs(leftPos.x - center.x);
                const rightDistance = Math.abs(rightPos.x - center.x);

                const symmetry = 1 - Math.abs(leftDistance - rightDistance) / (leftDistance + rightDistance + 0.001);
                symmetryScore += symmetry;
                validPairs++;
            }
        });

        return validPairs > 0 ? symmetryScore / validPairs : 0;
    }

    calculateMovementQuality(joints, history, deltaTime) {
        const quality = {
            flowing: 0,
            expansive: 0,
            rhythmic: 0,
            smooth: 0,
            speed: 0,
            grounded: 0
        };

        if (history.length < 3) return quality;

        const recent = history.slice(-10);

        quality.flowing = this.calculateFlowiness(recent);
        quality.expansive = this.calculateExpansiveness(joints);
        quality.rhythmic = this.calculateRhythmicity(recent);
        quality.smooth = this.calculateSmoothness(recent);
        quality.speed = this.calculateSpeed(recent);
        quality.grounded = this.calculateGroundedness(joints);

        return quality;
    }

    calculateFlowiness(history) {
        if (history.length < 3) return 0;

        let totalChange = 0;
        for (let i = 1; i < history.length - 1; i++) {
            const prev = history[i - 1].metrics.overallMotion;
            const curr = history[i].metrics.overallMotion;
            const next = history[i + 1].metrics.overallMotion;

            const acceleration = Math.abs((next - curr) - (curr - prev));
            totalChange += acceleration;
        }

        const averageChange = totalChange / (history.length - 2);
        return Math.max(0, 1 - averageChange / 10);
    }

    calculateExpansiveness(joints) {
        return Math.min(1, this.calculateBodyExpansion(joints) / 2);
    }

    calculateRhythmicity(history) {
        if (history.length < 10) return 0;

        const motionValues = history.map(frame => frame.metrics.overallMotion);
        const fft = this.simpleFFT(motionValues);

        const dominantFrequency = fft.reduce((max, current, index) =>
            current > fft[max] ? index : max, 0);

        return dominantFrequency > 0 && dominantFrequency < motionValues.length / 3 ? fft[dominantFrequency] / 10 : 0;
    }

    calculateSmoothness(history) {
        if (history.length < 3) return 0;

        let jerkSum = 0;
        for (let i = 2; i < history.length; i++) {
            const vel1 = history[i - 1].metrics.overallMotion;
            const vel2 = history[i].metrics.overallMotion;
            const vel3 = history[i - 2].metrics.overallMotion;

            const accel1 = vel2 - vel1;
            const accel2 = vel1 - vel3;
            const jerk = Math.abs(accel1 - accel2);
            jerkSum += jerk;
        }

        const averageJerk = jerkSum / (history.length - 2);
        return Math.max(0, 1 - averageJerk / 5);
    }

    calculateSpeed(history) {
        if (history.length === 0) return 0;
        const recentMotion = history[history.length - 1].metrics.overallMotion;
        return Math.min(1, recentMotion / 5);
    }

    calculateGroundedness(joints) {
        const footKeys = [this.azureKinectJoints.FOOT_LEFT, this.azureKinectJoints.FOOT_RIGHT];
        const pelvisKey = this.azureKinectJoints.PELVIS;

        if (!joints[pelvisKey]) return 0;

        const pelvisHeight = joints[pelvisKey].position.y;
        let avgFootHeight = 0;
        let validFeet = 0;

        footKeys.forEach(footKey => {
            if (joints[footKey] && joints[footKey].confidence > 0.5) {
                avgFootHeight += joints[footKey].position.y;
                validFeet++;
            }
        });

        if (validFeet === 0) return 0;

        avgFootHeight /= validFeet;
        const bodyHeight = pelvisHeight - avgFootHeight;

        return Math.max(0, 1 - bodyHeight / 2);
    }

    calculateAggregateMetrics(processedBodies) {
        if (processedBodies.length === 0) {
            return {
                totalBodies: 0,
                averageMotion: 0,
                totalHandActivity: 0,
                groupCohesion: 0,
                energyLevel: 0
            };
        }

        const totalMotion = processedBodies.reduce((sum, body) => sum + body.metrics.overallMotion, 0);
        const totalHandActivity = processedBodies.reduce((sum, body) =>
            sum + body.metrics.handVelocities.left + body.metrics.handVelocities.right, 0);

        let groupCohesion = 0;
        if (processedBodies.length > 1) {
            const centers = processedBodies.map(body => body.metrics.centerOfMass);
            let totalDistance = 0;
            let comparisons = 0;

            for (let i = 0; i < centers.length; i++) {
                for (let j = i + 1; j < centers.length; j++) {
                    const distance = Math.sqrt(
                        Math.pow(centers[i].x - centers[j].x, 2) +
                        Math.pow(centers[i].y - centers[j].y, 2) +
                        Math.pow(centers[i].z - centers[j].z, 2)
                    );
                    totalDistance += distance;
                    comparisons++;
                }
            }
            groupCohesion = comparisons > 0 ? Math.max(0, 1 - (totalDistance / comparisons) / 5) : 0;
        }

        const energyLevel = Math.min(1, (totalMotion + totalHandActivity) / (processedBodies.length * 10));

        return {
            totalBodies: processedBodies.length,
            averageMotion: totalMotion / processedBodies.length,
            totalHandActivity,
            groupCohesion,
            energyLevel
        };
    }

    simpleFFT(values) {
        const N = values.length;
        const result = new Array(N).fill(0);

        for (let k = 0; k < N; k++) {
            let real = 0;
            let imag = 0;
            for (let n = 0; n < N; n++) {
                const angle = -2 * Math.PI * k * n / N;
                real += values[n] * Math.cos(angle);
                imag += values[n] * Math.sin(angle);
            }
            result[k] = Math.sqrt(real * real + imag * imag);
        }

        return result;
    }

    cleanupOldBodies(currentTimestamp) {
        const maxAge = 5000; // 5 seconds

        for (const [bodyId, history] of this.previousFrames.entries()) {
            if (history.length > 0) {
                const lastTimestamp = history[history.length - 1].timestamp;
                if (currentTimestamp - lastTimestamp > maxAge) {
                    this.previousFrames.delete(bodyId);
                }
            }
        }
    }
}

module.exports = MovementAnalyzer;