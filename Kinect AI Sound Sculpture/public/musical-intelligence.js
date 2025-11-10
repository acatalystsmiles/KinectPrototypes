class MusicalIntelligence {
    constructor() {
        // Musical knowledge base
        this.scales = this.initializeScales();
        this.chordProgressions = this.initializeChordProgressions();
        this.rhythmPatterns = this.initializeRhythmPatterns();
        this.musicalRules = this.initializeMusicalRules();

        // Current musical state
        this.currentKey = 'C major';
        this.currentTempo = 120; // BPM
        this.currentMeter = [4, 4]; // Time signature
        this.musicalTension = 0.5; // 0-1 scale

        // Phrase analysis
        this.phraseBuffer = [];
        this.maxPhraseLength = 32; // Musical phrases (bars)
        this.currentPhrase = null;
        this.detectedPhrases = [];

        // Harmonic analysis
        this.harmonicContext = {
            currentChord: 'C',
            progression: [],
            cadencePoints: [],
            tensionCurve: []
        };

        // Rhythmic analysis
        this.rhythmicContext = {
            detectedMeter: [4, 4],
            rhythmicPatterns: [],
            syncopation: 0,
            polyrhythm: false
        };

        // Musical memory and learning
        this.musicalMemory = {
            phrases: [],
            progressions: [],
            patterns: [],
            preferences: {}
        };

        console.log('🎼 Musical Intelligence initialized');
    }

    initializeScales() {
        return {
            'C major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
            'A minor': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            'G major': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
            'E minor': ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],
            'D major': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
            'B minor': ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'],
            'pentatonic': ['C', 'D', 'E', 'G', 'A'],
            'blues': ['C', 'Eb', 'F', 'Gb', 'G', 'Bb']
        };
    }

    initializeChordProgressions() {
        return {
            'classical': [
                ['I', 'V', 'vi', 'IV'], // Canon progression
                ['I', 'vi', 'IV', 'V'], // 50s progression
                ['vi', 'IV', 'I', 'V'], // Pop punk progression
                ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'] // Circle of fifths
            ],
            'modal': [
                ['i', 'VII', 'VI', 'VII'], // Natural minor
                ['I', 'bVII', 'IV', 'I'], // Mixolydian
                ['i', 'ii°', 'v', 'i'] // Dorian
            ],
            'ambient': [
                ['I', 'I', 'I', 'I'], // Static harmony
                ['I', 'bII', 'I', 'bII'], // Chromatic mediant
                ['I', 'V/V', 'V', 'I'] // Secondary dominant
            ]
        };
    }

    initializeRhythmPatterns() {
        return {
            'simple': [
                [1, 0, 0, 0, 1, 0, 0, 0], // Basic rock
                [1, 0, 1, 0, 1, 0, 1, 0], // Simple steady
                [1, 1, 0, 1, 0, 1, 0, 0] // Syncopated
            ],
            'complex': [
                [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], // 12/8 feel
                [1, 0, 1, 1, 0, 1, 0, 1], // Polyrhythmic
                [1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1] // Additive meter
            ],
            'flowing': [
                [1, 0.7, 0.3, 0.5, 0.8, 0.2, 0.6, 0.4], // Continuous flow
                [1, 0.8, 0.6, 0.4, 0.2, 0.4, 0.6, 0.8] // Wave pattern
            ]
        };
    }

    initializeMusicalRules() {
        return {
            tension: {
                // How movement qualities map to musical tension
                'sharp': { tensionIncrease: 0.3, resolution: 'staccato' },
                'flowing': { tensionIncrease: -0.1, resolution: 'legato' },
                'expansive': { tensionIncrease: 0.2, resolution: 'crescendo' },
                'contracted': { tensionIncrease: -0.2, resolution: 'diminuendo' },
                'fast': { tensionIncrease: 0.4, resolution: 'accelerando' },
                'slow': { tensionIncrease: -0.3, resolution: 'ritardando' }
            },
            harmony: {
                // Movement-to-harmony mappings
                'reach_up': { progression: 'ascending', chords: ['I', 'iii', 'V', 'I'] },
                'crouch': { progression: 'descending', chords: ['I', 'vi', 'IV', 'I'] },
                'embrace': { progression: 'resolution', chords: ['V', 'I'] },
                'wave': { progression: 'oscillating', chords: ['I', 'V', 'I', 'V'] }
            },
            rhythm: {
                // Movement patterns to rhythmic patterns
                'steady': { pattern: 'simple', subdivision: 4 },
                'irregular': { pattern: 'complex', subdivision: 'variable' },
                'pulsing': { pattern: 'accented', subdivision: 2 },
                'flowing': { pattern: 'continuous', subdivision: 8 }
            }
        };
    }

    // Main interpretation method
    interpretMovement(movementData, gestureData) {
        try {
            // Analyze musical phrases from movement
            const phrases = this.analyzePhrases(movementData, gestureData);

            // Calculate musical tension from movement quality
            const tension = this.calculateMusicalTension(movementData, gestureData);

            // Generate harmonic suggestions
            const harmonicSuggestions = this.generateHarmonicSuggestions(movementData, gestureData);

            // Detect rhythmic patterns
            const rhythmicPatterns = this.detectRhythmicPatterns(movementData, gestureData);

            // Update musical memory
            this.updateMusicalMemory(phrases, harmonicSuggestions, rhythmicPatterns);

            return this.createMusicalInterpretation(phrases, tension, harmonicSuggestions, rhythmicPatterns);

        } catch (error) {
            console.error('Musical Intelligence error:', error);
            return this.createEmptyInterpretation();
        }
    }

    analyzePhrases(movementData, gestureData) {
        const phrases = [];

        if (!gestureData.detectedGestures || gestureData.detectedGestures.length === 0) {
            return phrases;
        }

        // Group gestures into musical phrases
        const gestureGroups = this.groupGesturesIntoPhrasesbyPausesByTime(gestureData.detectedGestures);

        for (const group of gestureGroups) {
            const phrase = this.createMusicalPhrase(group, movementData);
            if (phrase) {
                phrases.push(phrase);
            }
        }

        return phrases;
    }

    groupGesturesIntoPhrasesbyPausesByTime(gestures) {
        if (gestures.length === 0) return [];

        const groups = [];
        let currentGroup = [gestures[0]];
        const maxPhraseGap = 2000; // 2 seconds

        for (let i = 1; i < gestures.length; i++) {
            const timeDiff = gestures[i].timestamp - gestures[i-1].timestamp;

            if (timeDiff > maxPhraseGap) {
                // Start new phrase
                groups.push(currentGroup);
                currentGroup = [gestures[i]];
            } else {
                // Continue current phrase
                currentGroup.push(gestures[i]);
            }
        }

        groups.push(currentGroup);
        return groups.filter(group => group.length > 0);
    }

    createMusicalPhrase(gestureGroup, movementData) {
        if (gestureGroup.length === 0) return null;

        const startTime = gestureGroup[0].timestamp;
        const endTime = gestureGroup[gestureGroup.length - 1].timestamp;
        const duration = (endTime - startTime) / 1000; // seconds

        // Analyze phrase characteristics
        const gestureTypes = gestureGroup.map(g => g.name);
        const dominantGesture = this.findDominantGesture(gestureTypes);
        const phraseShape = this.analyzePhraseShape(gestureGroup);
        const musicalDirection = this.determineMusicalDirection(gestureGroup);

        // Create musical phrase structure
        const phrase = {
            id: `phrase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            startTime: startTime,
            endTime: endTime,
            duration: duration,
            gestures: gestureGroup,
            dominantGesture: dominantGesture,
            shape: phraseShape, // 'ascending', 'descending', 'arch', 'wave'
            direction: musicalDirection,
            suggested: {
                melody: this.suggestMelody(dominantGesture, phraseShape),
                harmony: this.suggestHarmony(dominantGesture, phraseShape),
                rhythm: this.suggestRhythm(gestureGroup, duration),
                dynamics: this.suggestDynamics(phraseShape, gestureGroup)
            },
            confidence: this.calculatePhraseConfidence(gestureGroup)
        };

        return phrase;
    }

    findDominantGesture(gestureTypes) {
        // Find most common gesture type
        const counts = {};
        gestureTypes.forEach(type => {
            counts[type] = (counts[type] || 0) + 1;
        });

        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }

    analyzePhraseShape(gestureGroup) {
        if (gestureGroup.length < 2) return 'static';

        // Analyze the overall shape based on gesture progression
        const shapes = gestureGroup.map(gesture => {
            if (gesture.name.includes('reach_up') || gesture.name.includes('jump')) return 1;
            if (gesture.name.includes('crouch') || gesture.name.includes('reach_down')) return -1;
            return 0;
        });

        const shapeSum = shapes.reduce((sum, val) => sum + val, 0);
        const shapeVariance = this.calculateVariance(shapes);

        if (shapeVariance > 0.5) return 'wave'; // High variance = wave-like
        if (shapeSum > 0.5) return 'ascending';
        if (shapeSum < -0.5) return 'descending';
        if (shapes[0] < shapes[shapes.length - 1]) return 'arch';

        return 'stable';
    }

    determineMusicalDirection(gestureGroup) {
        // Analyze gesture sequence for musical direction
        const directions = {
            tension: 0,
            release: 0,
            static: 0
        };

        gestureGroup.forEach(gesture => {
            const rule = this.musicalRules.tension[gesture.type];
            if (rule) {
                if (rule.tensionIncrease > 0) directions.tension++;
                else if (rule.tensionIncrease < 0) directions.release++;
                else directions.static++;
            }
        });

        const total = directions.tension + directions.release + directions.static;
        if (total === 0) return 'neutral';

        const dominantDirection = Object.keys(directions).reduce((a, b) =>
            directions[a] > directions[b] ? a : b);

        return dominantDirection;
    }

    suggestMelody(dominantGesture, phraseShape) {
        const scale = this.scales[this.currentKey];
        let notes = [];

        switch (phraseShape) {
            case 'ascending':
                notes = scale.slice(0, 5); // C D E F G
                break;
            case 'descending':
                notes = scale.slice(0, 5).reverse(); // G F E D C
                break;
            case 'arch':
                notes = [scale[0], scale[1], scale[2], scale[1], scale[0]]; // C D E D C
                break;
            case 'wave':
                notes = [scale[0], scale[2], scale[1], scale[3], scale[2]]; // C E D F E
                break;
            default:
                notes = [scale[0], scale[2], scale[4]]; // C E G (triad)
        }

        return {
            notes: notes,
            rhythm: this.suggestMelodyRhythm(dominantGesture),
            articulation: this.suggestArticulation(dominantGesture)
        };
    }

    suggestHarmony(dominantGesture, phraseShape) {
        const progressionType = this.determineProgressionType(dominantGesture);
        const progressions = this.chordProgressions[progressionType] || this.chordProgressions['classical'];

        // Select progression based on phrase shape
        let selectedProgression;
        switch (phraseShape) {
            case 'ascending':
                selectedProgression = progressions.find(p => p.includes('V')) || progressions[0];
                break;
            case 'descending':
                selectedProgression = progressions.find(p => p.includes('vi')) || progressions[1];
                break;
            default:
                selectedProgression = progressions[0];
        }

        return {
            progression: selectedProgression,
            voicing: this.suggestVoicing(dominantGesture),
            rhythm: this.suggestHarmonicRhythm(phraseShape)
        };
    }

    suggestRhythm(gestureGroup, duration) {
        // Analyze gesture timing to suggest rhythm
        const gestureIntervals = [];
        for (let i = 1; i < gestureGroup.length; i++) {
            const interval = (gestureGroup[i].timestamp - gestureGroup[i-1].timestamp) / 1000;
            gestureIntervals.push(interval);
        }

        if (gestureIntervals.length === 0) {
            return { pattern: [1], subdivision: 4 };
        }

        const avgInterval = gestureIntervals.reduce((sum, val) => sum + val, 0) / gestureIntervals.length;
        const rhythmComplexity = this.calculateVariance(gestureIntervals);

        // Determine rhythm pattern based on gesture timing
        let patternType = 'simple';
        if (rhythmComplexity > 0.5) patternType = 'complex';
        if (avgInterval < 0.5) patternType = 'flowing';

        const patterns = this.rhythmPatterns[patternType];
        const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];

        return {
            pattern: selectedPattern,
            subdivision: this.calculateSubdivision(avgInterval),
            complexity: rhythmComplexity,
            syncopation: rhythmComplexity > 0.3
        };
    }

    suggestDynamics(phraseShape, gestureGroup) {
        const avgConfidence = gestureGroup.reduce((sum, g) => sum + g.confidence, 0) / gestureGroup.length;

        let dynamicShape;
        switch (phraseShape) {
            case 'ascending':
                dynamicShape = 'crescendo';
                break;
            case 'descending':
                dynamicShape = 'diminuendo';
                break;
            case 'arch':
                dynamicShape = 'crescendo-diminuendo';
                break;
            case 'wave':
                dynamicShape = 'undulating';
                break;
            default:
                dynamicShape = 'stable';
        }

        return {
            shape: dynamicShape,
            intensity: Math.min(1, avgConfidence + 0.3),
            articulation: avgConfidence > 0.8 ? 'accented' : 'normal'
        };
    }

    calculateMusicalTension(movementData, gestureData) {
        let tension = this.musicalTension;

        // Analyze movement quality for tension changes
        if (movementData.bodies && movementData.bodies.length > 0) {
            const body = movementData.bodies[0];
            if (body.metrics && body.metrics.movementQuality) {
                const quality = body.metrics.movementQuality;

                // Apply tension rules
                Object.keys(this.musicalRules.tension).forEach(qualityType => {
                    if (quality[qualityType] !== undefined) {
                        const rule = this.musicalRules.tension[qualityType];
                        tension += rule.tensionIncrease * quality[qualityType];
                    }
                });
            }
        }

        // Clamp tension between 0 and 1
        this.musicalTension = Math.max(0, Math.min(1, tension));

        return {
            current: this.musicalTension,
            trend: tension > this.musicalTension ? 'increasing' : 'decreasing',
            level: this.musicalTension < 0.3 ? 'low' : this.musicalTension > 0.7 ? 'high' : 'medium'
        };
    }

    generateHarmonicSuggestions(movementData, gestureData) {
        const suggestions = [];

        // Base suggestions on detected gestures
        gestureData.detectedGestures.forEach(gesture => {
            const harmonyRule = this.musicalRules.harmony[gesture.name];
            if (harmonyRule) {
                suggestions.push({
                    type: harmonyRule.progression,
                    chords: harmonyRule.chords,
                    triggeredBy: gesture.name,
                    confidence: gesture.confidence,
                    timing: 'immediate'
                });
            }
        });

        // Add tension-based suggestions
        const tension = this.musicalTension;
        if (tension > 0.7) {
            suggestions.push({
                type: 'resolution',
                chords: ['V7', 'I'],
                triggeredBy: 'high_tension',
                confidence: tension,
                timing: 'next_phrase'
            });
        }

        return suggestions;
    }

    detectRhythmicPatterns(movementData, gestureData) {
        const patterns = [];

        if (gestureData.detectedGestures.length < 2) {
            return patterns;
        }

        // Analyze gesture timing for rhythmic patterns
        const timestamps = gestureData.detectedGestures.map(g => g.timestamp);
        const intervals = [];

        for (let i = 1; i < timestamps.length; i++) {
            intervals.push(timestamps[i] - timestamps[i-1]);
        }

        // Detect repeating patterns
        const pattern = this.findRepeatingPattern(intervals);
        if (pattern) {
            patterns.push({
                type: 'repeating',
                pattern: pattern,
                confidence: 0.8,
                period: pattern.length,
                tempo: this.calculateTempo(pattern)
            });
        }

        // Detect polyrhythm
        const polyrhythm = this.detectPolyrhythm(intervals);
        if (polyrhythm) {
            patterns.push({
                type: 'polyrhythm',
                patterns: polyrhythm,
                confidence: 0.6,
                complexity: polyrhythm.length
            });
        }

        return patterns;
    }

    // Utility methods
    calculateVariance(values) {
        if (values.length === 0) return 0;
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    }

    findRepeatingPattern(intervals) {
        // Simple pattern detection - look for repeating sequences
        if (intervals.length < 4) return null;

        for (let patternLength = 2; patternLength <= intervals.length / 2; patternLength++) {
            const pattern = intervals.slice(0, patternLength);
            let matches = 0;

            for (let i = patternLength; i < intervals.length; i += patternLength) {
                const segment = intervals.slice(i, i + patternLength);
                if (this.arraysEqual(pattern, segment, 0.1)) { // 10% tolerance
                    matches++;
                }
            }

            if (matches >= 2) {
                return pattern;
            }
        }

        return null;
    }

    arraysEqual(arr1, arr2, tolerance = 0) {
        if (arr1.length !== arr2.length) return false;

        for (let i = 0; i < arr1.length; i++) {
            if (Math.abs(arr1[i] - arr2[i]) > tolerance * Math.max(arr1[i], arr2[i])) {
                return false;
            }
        }

        return true;
    }

    detectPolyrhythm(intervals) {
        // Simplified polyrhythm detection
        // Look for multiple simultaneous rhythmic patterns
        return null; // Placeholder for complex polyrhythm detection
    }

    calculateTempo(pattern) {
        const avgInterval = pattern.reduce((sum, val) => sum + val, 0) / pattern.length;
        const beatsPerSecond = 1000 / avgInterval; // intervals are in milliseconds
        return Math.round(beatsPerSecond * 60); // Convert to BPM
    }

    determineProgressionType(gesture) {
        if (gesture.includes('flowing')) return 'ambient';
        if (gesture.includes('sharp') || gesture.includes('jump')) return 'modal';
        return 'classical';
    }

    suggestMelodyRhythm(gesture) {
        const rhythmRule = this.musicalRules.rhythm[gesture] || this.musicalRules.rhythm['steady'];
        return rhythmRule.pattern;
    }

    suggestArticulation(gesture) {
        if (gesture.includes('sharp')) return 'staccato';
        if (gesture.includes('flowing')) return 'legato';
        return 'normal';
    }

    suggestVoicing(gesture) {
        if (gesture.includes('expansive')) return 'open';
        if (gesture.includes('contracted')) return 'close';
        return 'balanced';
    }

    suggestHarmonicRhythm(phraseShape) {
        switch (phraseShape) {
            case 'ascending':
            case 'descending':
                return 'steady';
            case 'wave':
                return 'syncopated';
            default:
                return 'simple';
        }
    }

    calculateSubdivision(avgInterval) {
        if (avgInterval < 0.25) return 16; // Sixteenth notes
        if (avgInterval < 0.5) return 8;   // Eighth notes
        if (avgInterval < 1.0) return 4;   // Quarter notes
        return 2; // Half notes
    }

    calculatePhraseConfidence(gestureGroup) {
        const avgGestureConfidence = gestureGroup.reduce((sum, g) => sum + g.confidence, 0) / gestureGroup.length;
        const lengthBonus = Math.min(1, gestureGroup.length / 5); // Bonus for longer phrases
        return (avgGestureConfidence + lengthBonus) / 2;
    }

    updateMusicalMemory(phrases, harmonicSuggestions, rhythmicPatterns) {
        // Store successful musical interpretations for learning
        this.musicalMemory.phrases.push(...phrases);
        this.musicalMemory.progressions.push(...harmonicSuggestions);
        this.musicalMemory.patterns.push(...rhythmicPatterns);

        // Maintain memory size
        if (this.musicalMemory.phrases.length > 100) {
            this.musicalMemory.phrases = this.musicalMemory.phrases.slice(-50);
        }
    }

    createMusicalInterpretation(phrases, tension, harmonicSuggestions, rhythmicPatterns) {
        return {
            phrases: phrases,
            tension: tension,
            harmonicSuggestions: harmonicSuggestions,
            rhythmicPatterns: rhythmicPatterns,
            currentKey: this.currentKey,
            currentTempo: this.currentTempo,
            musicalContext: {
                harmonic: this.harmonicContext,
                rhythmic: this.rhythmicContext
            },
            confidence: this.calculateOverallConfidence(phrases, harmonicSuggestions),
            timestamp: Date.now()
        };
    }

    createEmptyInterpretation() {
        return {
            phrases: [],
            tension: { current: 0.5, trend: 'stable', level: 'medium' },
            harmonicSuggestions: [],
            rhythmicPatterns: [],
            currentKey: this.currentKey,
            currentTempo: this.currentTempo,
            confidence: 0,
            timestamp: Date.now()
        };
    }

    calculateOverallConfidence(phrases, harmonicSuggestions) {
        const phraseConfidence = phrases.length > 0 ?
            phrases.reduce((sum, p) => sum + p.confidence, 0) / phrases.length : 0;

        const harmonicConfidence = harmonicSuggestions.length > 0 ?
            harmonicSuggestions.reduce((sum, h) => sum + h.confidence, 0) / harmonicSuggestions.length : 0;

        return (phraseConfidence + harmonicConfidence) / 2;
    }

    // Public API
    getCurrentKey() {
        return this.currentKey;
    }

    setKey(key) {
        if (this.scales[key]) {
            this.currentKey = key;
            console.log(`🎼 Musical key set to: ${key}`);
        }
    }

    getCurrentTempo() {
        return this.currentTempo;
    }

    setTempo(tempo) {
        if (tempo >= 60 && tempo <= 200) {
            this.currentTempo = tempo;
            console.log(`🎼 Musical tempo set to: ${tempo} BPM`);
        }
    }

    getMusicalMemory() {
        return this.musicalMemory;
    }

    reset() {
        this.phraseBuffer = [];
        this.detectedPhrases = [];
        this.musicalTension = 0.5;
        this.harmonicContext = {
            currentChord: 'C',
            progression: [],
            cadencePoints: [],
            tensionCurve: []
        };
        this.rhythmicContext = {
            detectedMeter: [4, 4],
            rhythmicPatterns: [],
            syncopation: 0,
            polyrhythm: false
        };
    }
}

// Export for use in AI system
window.MusicalIntelligence = MusicalIntelligence;