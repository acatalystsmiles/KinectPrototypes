/**
 * Advanced Musical Composition System
 *
 * Sophisticated musical intelligence that creates:
 * - Harmonic progressions based on music theory
 * - Dynamic melodic phrases
 * - Adaptive orchestration
 * - Emotional/expressive musical responses
 * - Multi-voice counterpoint
 * - Microtonality and extended techniques
 */

class AdvancedMusicalComposition {
    constructor() {
        // Music theory foundations
        this.scales = this.initializeScales();
        this.chordProgressions = this.initializeChordProgressions();
        this.modes = this.initializeModes();
        this.rhythmicPatterns = this.initializeRhythmicPatterns();

        // Current musical state
        this.currentKey = 'C';
        this.currentScale = 'major';
        this.currentMode = 'ionian';
        this.currentChord = { root: 'C', quality: 'major7', inversion: 0 };
        this.harmonicPosition = 0; // Position in progression
        this.musicalTension = 0.5; // 0 (resolved) to 1 (maximum tension)

        // Composition state
        this.activeProgression = null;
        this.phraseHistory = [];
        this.voiceLeading = new VoiceLeadingEngine();
        this.orchestrator = new DynamicOrchestrator();

        // Adaptive learning
        this.userMusicalProfile = {
            preferredTempo: 90,
            preferredComplexity: 0.5,
            exploredModes: new Set(['ionian']),
            favoriteProgr
essions: new Map(),
            movementToMusicMappings: new Map()
        };

        // Performance parameters
        this.tempo = 90; // BPM
        this.timeSignature = { numerator: 4, denominator: 4 };
        this.dynamics = 0.7; // 0-1
        this.articulation = 'legato'; // legato, staccato, marcato, etc.

        // Advanced features
        this.microtonalEnabled = false;
        this.polyrhythmEnabled = false;
        this.modalInterchangeEnabled = true;
        this.jazzHarmonyEnabled = false;

        console.log('🎼 Advanced Musical Composition System initialized');
    }

    initializeScales() {
        return {
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10],
            harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
            melodicMinor: [0, 2, 3, 5, 7, 9, 11],
            dorian: [0, 2, 3, 5, 7, 9, 10],
            phrygian: [0, 1, 3, 5, 7, 8, 10],
            lydian: [0, 2, 4, 6, 7, 9, 11],
            mixolydian: [0, 2, 4, 5, 7, 9, 10],
            aeolian: [0, 2, 3, 5, 7, 8, 10],
            locrian: [0, 1, 3, 5, 6, 8, 10],
            wholeTone: [0, 2, 4, 6, 8, 10],
            diminished: [0, 2, 3, 5, 6, 8, 9, 11],
            pentatonic: [0, 2, 4, 7, 9],
            pentatonicMinor: [0, 3, 5, 7, 10],
            blues: [0, 3, 5, 6, 7, 10],
            japanese: [0, 1, 5, 7, 8], // Hirajoshi
            arabic: [0, 1, 4, 5, 7, 8, 11] // Maqam Hijaz
        };
    }

    initializeModes() {
        return {
            ionian: { intervals: [0, 2, 4, 5, 7, 9, 11], character: 'bright, happy' },
            dorian: { intervals: [0, 2, 3, 5, 7, 9, 10], character: 'jazzy, sophisticated' },
            phrygian: { intervals: [0, 1, 3, 5, 7, 8, 10], character: 'spanish, exotic' },
            lydian: { intervals: [0, 2, 4, 6, 7, 9, 11], character: 'dreamy, floating' },
            mixolydian: { intervals: [0, 2, 4, 5, 7, 9, 10], character: 'folk, bluesy' },
            aeolian: { intervals: [0, 2, 3, 5, 7, 8, 10], character: 'sad, dark' },
            locrian: { intervals: [0, 1, 3, 5, 6, 8, 10], character: 'unstable, tense' }
        };
    }

    initializeChordProgressions() {
        return {
            // Common progressions (Roman numeral notation)
            pop: [
                { name: 'I-V-vi-IV', chords: ['I', 'V', 'vi', 'IV'], tension: [0.2, 0.6, 0.4, 0.3] },
                { name: 'I-IV-V-IV', chords: ['I', 'IV', 'V', 'IV'], tension: [0.2, 0.4, 0.7, 0.3] },
                { name: 'vi-IV-I-V', chords: ['vi', 'IV', 'I', 'V'], tension: [0.5, 0.3, 0.1, 0.6] }
            ],
            jazz: [
                { name: 'ii-V-I', chords: ['iim7', 'V7', 'Imaj7'], tension: [0.4, 0.7, 0.1] },
                { name: 'I-vi-ii-V', chords: ['Imaj7', 'vim7', 'iim7', 'V7'], tension: [0.2, 0.4, 0.5, 0.7] },
                { name: 'Giant Steps', chords: ['Imaj7', 'bIIImaj7', 'Vmaj7'], tension: [0.2, 0.6, 0.8] }
            ],
            classical: [
                { name: 'Authentic Cadence', chords: ['V', 'I'], tension: [0.8, 0.1] },
                { name: 'Plagal Cadence', chords: ['IV', 'I'], tension: [0.3, 0.1] },
                { name: 'Deceptive Cadence', chords: ['V', 'vi'], tension: [0.8, 0.6] }
            ],
            modal: [
                { name: 'Dorian vamp', chords: ['i', 'IV'], tension: [0.3, 0.4] },
                { name: 'Lydian float', chords: ['I', 'II'], tension: [0.2, 0.5] },
                { name: 'Phrygian descent', chords: ['i', 'bII'], tension: [0.6, 0.7] }
            ],
            experimental: [
                { name: 'Chromatic mediant', chords: ['I', 'bVI', 'I'], tension: [0.2, 0.7, 0.2] },
                { name: 'Tritone sub', chords: ['I', 'bII', 'I'], tension: [0.2, 0.9, 0.2] },
                { name: 'Suspended resolution', chords: ['Isus4', 'I', 'Vsus4', 'V'], tension: [0.5, 0.2, 0.6, 0.4] }
            ]
        };
    }

    initializeRhythmicPatterns() {
        return {
            straight: { pattern: [1, 0, 0, 0], feel: 'steady' },
            syncopated: { pattern: [1, 0, 1, 0, 0, 1, 0, 0], feel: 'funky' },
            triplet: { pattern: [1, 0, 0, 1, 0, 0], feel: 'flowing' },
            polyrhythm_3_4: { pattern: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1], feel: 'complex' },
            dotted: { pattern: [1, 0, 0, 1, 0, 0], feel: 'lilting' },
            clave: { pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0], feel: 'latin' }
        };
    }

    /**
     * Main composition method - generates musical response to movement
     */
    composeForMovement(movementData, gestureData) {
        try {
            // Analyze movement for musical implications
            const musicalIntent = this.analyzeMusicalIntent(movementData, gestureData);

            // Update harmonic state based on movement
            this.updateHarmonicState(musicalIntent);

            // Generate musical elements
            const composition = {
                harmony: this.generateHarmony(musicalIntent),
                melody: this.generateMelody(musicalIntent),
                rhythm: this.generateRhythm(musicalIntent),
                orchestration: this.orchestrator.orchestrate(musicalIntent, this.currentChord),
                dynamics: this.calculateDynamics(musicalIntent),
                articulation: this.determineArticulation(musicalIntent),

                // Meta information
                tension: this.musicalTension,
                emotionalContent: this.mapEmotionToMusic(musicalIntent.emotion),
                phrase: this.constructPhrase(musicalIntent),

                // Playback instructions
                playbackInstructions: this.createPlaybackInstructions(musicalIntent)
            };

            // Update phrase history
            this.phraseHistory.push({
                timestamp: Date.now(),
                composition: composition,
                movementContext: musicalIntent
            });

            if (this.phraseHistory.length > 50) {
                this.phraseHistory.shift();
            }

            return composition;

        } catch (error) {
            console.error('Musical composition error:', error);
            return this.getDefaultComposition();
        }
    }

    /**
     * Analyze movement data for musical intent
     */
    analyzeMusicalIntent(movementData, gestureData) {
        const intent = {
            energy: 0.5,
            tension: 0.5,
            complexity: 0.5,
            direction: 'neutral',
            quality: 'flowing',
            emotion: 'neutral',
            tempo: this.tempo,
            density: 0.5
        };

        if (!movementData || !movementData.bodies || movementData.bodies.length === 0) {
            return intent;
        }

        const body = movementData.bodies[0];
        const metrics = body.metrics || {};

        // Map movement energy to musical energy
        intent.energy = Math.min((metrics.overallMotion || 0) / 3.0, 1.0);

        // Map movement qualities to musical qualities
        if (metrics.movementQuality) {
            intent.quality = metrics.movementQuality.smooth > 0.7 ? 'flowing' :
                           metrics.movementQuality.speed > 0.7 ? 'energetic' : 'moderate';
        }

        // Analyze gestures for musical direction
        if (gestureData && gestureData.spatial) {
            for (const gesture of gestureData.spatial) {
                if (gesture.type === 'overhead_reach') {
                    intent.direction = 'ascending';
                    intent.tension += 0.2;
                } else if (gesture.type === 'grounded_crouch') {
                    intent.direction = 'descending';
                    intent.tension -= 0.2;
                }
            }
        }

        // Analyze dynamic gestures for articulation
        if (gestureData && gestureData.dynamic) {
            for (const gesture of gestureData.dynamic) {
                if (gesture.type === 'punch' || gesture.type === 'slash') {
                    intent.quality = 'sharp';
                    intent.complexity += 0.2;
                } else if (gesture.type === 'float' || gesture.type === 'glide') {
                    intent.quality = 'smooth';
                    intent.complexity -= 0.1;
                }
            }
        }

        // Map emotional state
        if (gestureData && gestureData.emotionalState) {
            intent.emotion = gestureData.emotionalState;
        }

        // Normalize values
        intent.tension = Math.max(0, Math.min(1, intent.tension));
        intent.complexity = Math.max(0, Math.min(1, intent.complexity));

        return intent;
    }

    /**
     * Update harmonic state based on musical intent
     */
    updateHarmonicState(musicalIntent) {
        // Increase or decrease tension based on movement
        const tensionChange = (musicalIntent.energy - 0.5) * 0.1;
        this.musicalTension = Math.max(0, Math.min(1, this.musicalTension + tensionChange));

        // Move through chord progression based on tension
        if (!this.activeProgression) {
            // Select progression based on emotion and complexity
            this.activeProgression = this.selectProgression(musicalIntent);
            this.harmonicPosition = 0;
        }

        // Decide if we should move to next chord
        const shouldProgress = this.shouldProgressChord(musicalIntent);
        if (shouldProgress) {
            this.harmonicPosition = (this.harmonicPosition + 1) % this.activeProgression.chords.length;
            this.currentChord = this.romanToChord(
                this.activeProgression.chords[this.harmonicPosition],
                this.currentKey
            );
            this.musicalTension = this.activeProgression.tension[this.harmonicPosition];
        }

        // Consider modal interchange if enabled
        if (this.modalInterchangeEnabled && Math.random() < 0.1 * musicalIntent.complexity) {
            this.applyModalInterchange();
        }
    }

    /**
     * Generate harmony based on current state
     */
    generateHarmony(musicalIntent) {
        const harmony = {
            chord: this.currentChord,
            voicing: this.voiceLeading.generateVoicing(this.currentChord, musicalIntent),
            extensions: this.determineExtensions(musicalIntent),
            bass: this.generateBassLine(musicalIntent),
            tension: this.musicalTension,
            color: this.determineHarmonicColor(musicalIntent)
        };

        // Add upper structure if complexity is high
        if (musicalIntent.complexity > 0.7 && this.jazzHarmonyEnabled) {
            harmony.upperStructure = this.generateUpperStructure();
        }

        return harmony;
    }

    /**
     * Generate melody based on movement
     */
    generateMelody(musicalIntent) {
        const scale = this.scales[this.currentScale] || this.scales.major;
        const melody = {
            notes: [],
            contour: musicalIntent.direction,
            range: this.determineMelodyRange(musicalIntent),
            motif: null
        };

        // Generate melodic phrase based on movement
        const phraseLength = Math.floor(4 + musicalIntent.complexity * 8); // 4-12 notes
        const rootNote = this.noteToMidi(this.currentKey, 4);

        let currentNote = rootNote;
        for (let i = 0; i < phraseLength; i++) {
            // Movement-influenced note selection
            const interval = this.selectMelodicInterval(musicalIntent, i, phraseLength);
            currentNote = this.constrainToScale(currentNote + interval, rootNote, scale);

            melody.notes.push({
                midi: currentNote,
                duration: this.selectNoteDuration(musicalIntent),
                velocity: musicalIntent.energy * 0.5 + 0.5,
                articulation: this.articulation
            });
        }

        // Identify or create motif
        if (melody.notes.length >= 3) {
            melody.motif = melody.notes.slice(0, 3).map(n => n.midi);
        }

        return melody;
    }

    /**
     * Generate rhythm pattern
     */
    generateRhythm(musicalIntent) {
        // Select rhythmic pattern based on movement quality
        let basePattern;
        if (musicalIntent.quality === 'sharp' || musicalIntent.quality === 'energetic') {
            basePattern = this.rhythmicPatterns.syncopated;
        } else if (musicalIntent.quality === 'flowing') {
            basePattern = this.rhythmicPatterns.triplet;
        } else {
            basePattern = this.rhythmicPatterns.straight;
        }

        // Adapt tempo to movement
        const tempoAdjustment = (musicalIntent.energy - 0.5) * 20;
        const adaptedTempo = Math.max(60, Math.min(160, this.tempo + tempoAdjustment));

        return {
            pattern: basePattern.pattern,
            tempo: adaptedTempo,
            timeSignature: this.timeSignature,
            feel: basePattern.feel,
            swing: musicalIntent.quality === 'flowing' ? 0.6 : 0.5
        };
    }

    /**
     * Calculate dynamics for musical expression
     */
    calculateDynamics(musicalIntent) {
        const baseDynamics = 0.5;
        const energyInfluence = musicalIntent.energy * 0.3;
        const tensionInfluence = this.musicalTension * 0.2;

        const dynamics = baseDynamics + energyInfluence + tensionInfluence;

        return {
            level: Math.max(0.1, Math.min(1.0, dynamics)),
            envelope: this.generateDynamicEnvelope(musicalIntent),
            crescendo: musicalIntent.direction === 'ascending',
            diminuendo: musicalIntent.direction === 'descending'
        };
    }

    /**
     * Determine articulation style
     */
    determineArticulation(musicalIntent) {
        if (musicalIntent.quality === 'sharp' || musicalIntent.energy > 0.8) {
            return 'staccato';
        } else if (musicalIntent.quality === 'flowing' || musicalIntent.quality === 'smooth') {
            return 'legato';
        } else if (musicalIntent.tension > 0.7) {
            return 'marcato';
        } else {
            return 'mezzo';
        }
    }

    /**
     * Map emotional state to musical parameters
     */
    mapEmotionToMusic(emotion) {
        const emotionMap = {
            joyful: { mode: 'lydian', tempo: 1.2, brightness: 0.9 },
            melancholic: { mode: 'aeolian', tempo: 0.8, brightness: 0.3 },
            energetic: { mode: 'mixolydian', tempo: 1.3, brightness: 0.8 },
            calm: { mode: 'dorian', tempo: 0.9, brightness: 0.5 },
            tense: { mode: 'locrian', tempo: 1.0, brightness: 0.4 },
            mysterious: { mode: 'phrygian', tempo: 0.85, brightness: 0.4 },
            hopeful: { mode: 'ionian', tempo: 1.1, brightness: 0.85 },
            neutral: { mode: 'ionian', tempo: 1.0, brightness: 0.5 }
        };

        return emotionMap[emotion] || emotionMap.neutral;
    }

    /**
     * Construct musical phrase with structure
     */
    constructPhrase(musicalIntent) {
        // Determine phrase structure (e.g., antecedent-consequent)
        const phraseType = this.determinePhraseType(musicalIntent);

        return {
            type: phraseType,
            length: 4, // measures
            structure: this.getPhraseStructure(phraseType),
            climax: this.determineClimaxPoint(musicalIntent),
            cadence: this.selectCadence(musicalIntent)
        };
    }

    /**
     * Create detailed playback instructions for audio engine
     */
    createPlaybackInstructions(musicalIntent) {
        return {
            trigger: true,
            layers: {
                foundation: {
                    enabled: true,
                    volume: 0.6,
                    filter: musicalIntent.tension
                },
                melodic: {
                    enabled: musicalIntent.energy > 0.3,
                    volume: musicalIntent.energy * 0.8,
                    notes: 'from_melody'
                },
                harmonic: {
                    enabled: true,
                    volume: 0.5,
                    voicing: 'from_harmony'
                },
                rhythmic: {
                    enabled: musicalIntent.energy > 0.5,
                    volume: musicalIntent.energy * 0.6,
                    pattern: 'from_rhythm'
                },
                textural: {
                    enabled: musicalIntent.complexity > 0.6,
                    volume: 0.4,
                    density: musicalIntent.complexity
                }
            },
            effects: {
                reverb: Math.max(0.3, musicalIntent.complexity * 0.7),
                delay: musicalIntent.direction === 'ascending' ? 0.4 : 0.2,
                chorus: musicalIntent.quality === 'flowing' ? 0.5 : 0.2,
                filter: {
                    frequency: 200 + (musicalIntent.energy * 3000),
                    resonance: musicalIntent.tension * 10
                }
            }
        };
    }

    // Helper methods

    selectProgression(musicalIntent) {
        const category = musicalIntent.complexity > 0.7 ? 'jazz' :
                        musicalIntent.emotion === 'neutral' ? 'pop' :
                        musicalIntent.complexity > 0.5 ? 'modal' : 'classical';

        const progressions = this.chordProgressions[category];
        return progressions[Math.floor(Math.random() * progressions.length)];
    }

    shouldProgressChord(musicalIntent) {
        // Progress chord based on movement energy and time
        const timeSinceLastChange = Date.now() - (this.lastChordChange || 0);
        const minTime = (60 / this.tempo) * 1000 * 2; // 2 beats minimum

        if (timeSinceLastChange < minTime) return false;

        // Higher energy = more frequent changes
        const changeProbability = musicalIntent.energy * 0.3;
        if (Math.random() < changeProbability) {
            this.lastChordChange = Date.now();
            return true;
        }

        return false;
    }

    romanToChord(romanNumeral, key) {
        // Convert Roman numeral to actual chord
        // Simplified version
        return {
            root: key,
            quality: romanNumeral.includes('m') ? 'minor7' : 'major7',
            inversion: 0
        };
    }

    applyModalInterchange() {
        // Borrow chord from parallel mode
        const parallelModes = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian'];
        const newMode = parallelModes[Math.floor(Math.random() * parallelModes.length)];
        this.currentMode = newMode;
    }

    determineExtensions(musicalIntent) {
        const extensions = [];
        if (musicalIntent.complexity > 0.5) extensions.push('9');
        if (musicalIntent.complexity > 0.7) extensions.push('11');
        if (musicalIntent.tension > 0.6) extensions.push('#11');
        if (musicalIntent.complexity > 0.8) extensions.push('13');
        return extensions;
    }

    generateBassLine(musicalIntent) {
        const root = this.noteToMidi(this.currentChord.root, 2);
        const pattern = [];

        // Simple bass pattern - walking or pedal
        if (musicalIntent.energy > 0.6) {
            // Walking bass
            pattern.push(root, root + 2, root + 4, root + 7);
        } else {
            // Pedal tone
            pattern.push(root, root, root, root);
        }

        return pattern;
    }

    determineHarmonicColor(musicalIntent) {
        if (musicalIntent.emotion === 'joyful') return 'bright';
        if (musicalIntent.emotion === 'melancholic') return 'dark';
        if (musicalIntent.tension > 0.7) return 'dissonant';
        return 'consonant';
    }

    generateUpperStructure() {
        // Add upper structure triad for jazz harmony
        return {
            type: 'triad',
            quality: 'major',
            rootInterval: 9 // 9th above bass
        };
    }

    determineMelodyRange(musicalIntent) {
        const baseOctave = 4;
        const rangeSpan = 1 + Math.floor(musicalIntent.complexity * 2); // 1-3 octaves

        return {
            low: this.noteToMidi(this.currentKey, baseOctave),
            high: this.noteToMidi(this.currentKey, baseOctave + rangeSpan)
        };
    }

    selectMelodicInterval(musicalIntent, position, totalLength) {
        // Create melodic contour based on movement direction
        if (musicalIntent.direction === 'ascending' && position < totalLength / 2) {
            return Math.random() < 0.7 ? 2 : 4; // Prefer ascending intervals
        } else if (musicalIntent.direction === 'descending' && position < totalLength / 2) {
            return Math.random() < 0.7 ? -2 : -4; // Prefer descending intervals
        } else {
            // Random walk
            return Math.floor(Math.random() * 7) - 3; // -3 to +3
        }
    }

    selectNoteDuration(musicalIntent) {
        // Movement quality affects note duration
        if (musicalIntent.quality === 'sharp') {
            return 0.25; // Sixteenth note
        } else if (musicalIntent.quality === 'flowing') {
            return 1.0; // Quarter note
        } else {
            return 0.5; // Eighth note
        }
    }

    constrainToScale(midiNote, root, scale) {
        const octave = Math.floor(midiNote / 12);
        const pitchClass = midiNote % 12;
        const rootPitchClass = root % 12;

        // Find closest scale degree
        let closestNote = midiNote;
        let minDistance = 12;

        for (const interval of scale) {
            const scalePitch = (rootPitchClass + interval) % 12;
            const candidate = octave * 12 + scalePitch;
            const distance = Math.abs(candidate - midiNote);

            if (distance < minDistance) {
                minDistance = distance;
                closestNote = candidate;
            }
        }

        return closestNote;
    }

    noteToMidi(noteName, octave) {
        const noteMap = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
        const pitchClass = noteMap[noteName.charAt(0)] || 0;
        return octave * 12 + pitchClass + 12; // +12 for MIDI offset
    }

    generateDynamicEnvelope(musicalIntent) {
        return {
            attack: musicalIntent.quality === 'sharp' ? 0.01 : 0.1,
            decay: 0.2,
            sustain: 0.7,
            release: musicalIntent.quality === 'flowing' ? 0.8 : 0.3
        };
    }

    determinePhraseType(musicalIntent) {
        if (musicalIntent.tension > 0.7) return 'question';
        if (musicalIntent.tension < 0.3) return 'answer';
        return 'statement';
    }

    getPhraseStructure(phraseType) {
        const structures = {
            question: { pattern: 'antecedent', resolution: false },
            answer: { pattern: 'consequent', resolution: true },
            statement: { pattern: 'period', resolution: true }
        };
        return structures[phraseType] || structures.statement;
    }

    determineClimaxPoint(musicalIntent) {
        // Place climax based on energy
        if (musicalIntent.energy > 0.8) {
            return 0.75; // Late climax
        } else if (musicalIntent.energy > 0.5) {
            return 0.618; // Golden ratio
        } else {
            return 0.5; // Middle
        }
    }

    selectCadence(musicalIntent) {
        if (this.musicalTension > 0.7) {
            return musicalIntent.complexity > 0.6 ? 'deceptive' : 'half';
        } else {
            return 'authentic';
        }
    }

    getDefaultComposition() {
        return {
            harmony: { chord: this.currentChord, voicing: [], extensions: [], bass: [], tension: 0.5 },
            melody: { notes: [], contour: 'neutral', range: {}, motif: null },
            rhythm: { pattern: [1, 0, 0, 0], tempo: 90, timeSignature: { numerator: 4, denominator: 4 } },
            orchestration: {},
            dynamics: { level: 0.5, envelope: {}, crescendo: false, diminuendo: false },
            articulation: 'legato',
            tension: 0.5,
            emotionalContent: { mode: 'ionian', tempo: 1.0, brightness: 0.5 },
            phrase: { type: 'statement', length: 4, structure: {} },
            playbackInstructions: { trigger: false, layers: {}, effects: {} }
        };
    }
}

// Voice Leading Engine - ensures smooth transitions between chords
class VoiceLeadingEngine {
    constructor() {
        this.previousVoicing = null;
    }

    generateVoicing(chord, musicalIntent) {
        // Generate chord voicing with voice leading principles
        const voicing = [];
        const root = this.noteToMidi(chord.root, 3);

        // Simple voicing strategy
        voicing.push(root); // Root
        voicing.push(root + (chord.quality.includes('minor') ? 3 : 4)); // Third
        voicing.push(root + 7); // Fifth
        voicing.push(root + (chord.quality.includes('7') ? 10 : 11)); // Seventh

        // Apply voice leading if we have previous voicing
        if (this.previousVoicing) {
            // Move voices minimally
            // (Simplified - would use proper voice leading rules)
        }

        this.previousVoicing = voicing;
        return voicing;
    }

    noteToMidi(noteName, octave) {
        const noteMap = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
        const pitchClass = noteMap[noteName.charAt(0)] || 0;
        return octave * 12 + pitchClass + 12;
    }
}

// Dynamic Orchestrator - assigns instruments/timbres based on context
class DynamicOrchestrator {
    constructor() {
        this.instrumentPalette = {
            bright: ['piano', 'bells', 'marimba', 'vibraphone'],
            dark: ['cello', 'bass', 'bassoon', 'contrabass'],
            ethereal: ['pad', 'choir', 'strings', 'flute'],
            percussive: ['drums', 'percussion', 'piano', 'pizzicato']
        };
    }

    orchestrate(musicalIntent, currentChord) {
        const color = musicalIntent.tension > 0.6 ? 'dark' :
                     musicalIntent.energy > 0.7 ? 'percussive' :
                     musicalIntent.quality === 'flowing' ? 'ethereal' : 'bright';

        return {
            lead: this.instrumentPalette[color][0],
            harmony: this.instrumentPalette.ethereal[1],
            bass: this.instrumentPalette.dark[1],
            texture: this.instrumentPalette[color][2],
            color: color
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedMusicalComposition;
}
