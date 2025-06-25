# Music Data Centralization & Refactoring Plan

**Date:** May 14, 2025

**Goal:** To centralize music theory data (chords, scales, voicings, tunings, etc.) into a single source of truth. This will improve consistency, maintainability, and reduce redundancy across the application. The current most comprehensive definitions, particularly for chord voicings and fretboard interactions, are found in `src/pages/theory/fretboard/index.jsx`.

---

## Phase 1: Create the Central Music Theory Library

1.  **File Creation:**
    *   Create a new file: `src/lib/musicTheory.js`

2.  **Core Data Structures to Define/Extract into `src/lib/musicTheory.js`:**
    *   **`allNotes`**:
        *   Define an array of all 12 unique musical notes (pitch classes).
        *   Example: `export const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];`
        *   *(Source: `allNotes` constant in `fretboard/index.jsx`)*
    *   **`tunings`**:
        *   Define an object mapping tuning names to arrays of string notes.
        *   Example: `export const tunings = { Standard: ['E', 'A', 'D', 'G', 'B', 'E'], DropD: [...] };`
        *   *(Source: `tunings` constant in `fretboard/index.jsx`)*
    *   **`chordTypes`**:
        *   Define an array of objects, each specifying a chord type's display label and its corresponding `Tonal.js` type.
        *   Example: `export const chordTypes = [{ label: 'Major', type: 'M' }, { label: 'Minor', type: 'm' }, ...];`
        *   *(Source: `chordTypes` constant in `fretboard/index.jsx`)*
    *   **`scaleTypes`**:
        *   Define an array of objects, each specifying a scale type's display label and its corresponding `Tonal.js` type.
        *   Example: `export const scaleTypes = [{ label: 'Major Scale', type: 'major' }, { label: 'Minor Pentatonic', type: 'minor pentatonic' }, ...];`
        *   *(Source: `scaleTypes` constant in `fretboard/index.jsx`)*
    *   **`chordVoicings`**:
        *   This will be the primary collection of detailed chord definitions.
        *   **Structure:** An object where keys are normalized chord names (e.g., "C-M", "Am", "G-7") and values are arrays of voicing objects. Each voicing object should contain:
            *   `name`: Descriptive name (e.g., "Open C", "Am Barre 5th fret").
            *   `frets`: Array of fret numbers (or 'x' for muted string) for each string in standard tuning.
            *   `fingers`: Array of finger numbers for each string.
            *   `barrePosition` (optional): Fret number if a barre is used.
        *   **Extraction from `fretboard/index.jsx`:**
            1.  Transfer the `chordPatterns` object (which defines basic E, A, D, G, C shapes for various types).
            2.  Transfer and adapt the `generateChordVoicings()` function logic. This function programmatically creates many voicings. It should be part of `musicTheory.js` and its output assigned to `chordVoicings`.
            3.  Transfer the manual `Object.assign(chordVoicings, { ... });` block that adds/overrides specific voicings (like open C, Am, G-M, etc.).
        *   **Export:** `export const chordVoicings = generateChordVoicings();` (or however the final object is constructed).
    *   **`adaptVoicingsToTuning(voicings, originalTuningName, targetTuningName)` function**:
        *   Transfer this function from `fretboard/index.jsx`. It's crucial for adjusting fret positions based on the selected tuning. It will use the `tunings` object.
        *   Ensure it correctly calculates fret adjustments based on differences between the `originalTuningName` (likely 'Standard' for base definitions) and `targetTuningName`.
        *   *(Source: `adaptVoicingsToTuning` function in `fretboard/index.jsx`)*

3.  **Normalization Functions (Crucial for Consistency):**
    *   Create and export helper functions to ensure consistent lookup keys.
    *   **`normalizeChordName(inputName)`**:
        *   Takes a chord name string (e.g., "C", "Cmaj", "C Major", "Am", "A minor") as input.
        *   Returns a standardized key used in `chordVoicings` (e.g., "C-M", "A-m").
        *   This will involve string manipulation and mapping common aliases.
    *   **`normalizeScaleName(inputName)`**:
        *   Takes a scale name string (e.g., "A Minor Pentatonic", "C major") as input.
        *   Returns a standardized type or key used for scale lookups (e.g., "minor pentatonic", "major").

---

## Phase 2: Refactor `src/pages/theory/fretboard/index.jsx`

1.  **Remove Local Definitions:**
    *   Delete the local constants: `allNotes`, `tunings`, `chordTypes`, `scaleTypes`.
    *   Delete the local `chordPatterns` object, the `generateChordVoicings` function, and the manual `Object.assign` for `chordVoicings`.
    *   Delete the local `adaptVoicingsToTuning` function.

2.  **Import from Central Library:**
    *   Add imports at the top of the file:
        ```javascript
        import {
          allNotes,
          tunings,
          chordTypes,
          scaleTypes,
          chordVoicings,
          adaptVoicingsToTuning,
          normalizeChordName, // if needed directly for user input handling
          // normalizeScaleName // if needed
        } from '@/lib/musicTheory';
        ```

3.  **Update Logic:**
    *   Ensure all parts of the component that previously referenced the local definitions now use the imported ones.
    *   Pay close attention to how `chordRoot` and `chordType` state variables are used to look up voicings in the `chordVoicings` object. Use `normalizeChordName` if the `chordType` or `chordRoot` combination doesn't directly match the keys in `chordVoicings`.
    *   Verify that `useEffect` hooks that depend on these (e.g., the one that loads selectedVoicings) correctly use the imported `chordVoicings` and `adaptVoicingsToTuning`.
    *   The fretboard's display logic for notes, intervals, and highlighted positions based on `highlightedNotes` and `intervalMap` (derived from `Tonal.Chord.getChord` or `Tonal.Scale.get`) should continue to function. The core change is where the *definitions* of available chords/scales and their *base voicings* come from.

---

## Phase 3: Refactor Core Components

1.  **`src/components/diagrams/ChordDiagram.jsx`:**
    *   **Remove `CHORD_LIBRARY`:** Delete the internal `CHORD_LIBRARY` constant.
    *   **Import:**
        ```javascript
        import { chordVoicings, normalizeChordName } from '@/lib/musicTheory';
        ```
    *   **Props:**
        *   The component should primarily accept a `chordName` prop (e.g., "Am", "G", "Cmaj7").
        *   It can optionally accept a `voicingIndex` (to pick a specific voicing if multiple exist for the `chordName`) or a complete `voicingObject` (if the parent already has it).
    *   **Logic:**
        *   In `useEffect` (or similar logic when `chord` prop changes):
            *   Use `normalizeChordName(props.chordName)` to get the standardized key.
            *   Look up the voicings: `const voicings = chordVoicings[standardizedKey];`
            *   If `voicings` exist:
                *   If `props.voicingIndex` is provided and valid, use `voicings[props.voicingIndex]`.
                *   Else, default to `voicings[0]`.
                *   Set this chosen voicing to local state (e.g., `setChordData`).
            *   If `props.voicingObject` is provided, use that directly.
        *   The rendering logic for frets, strings, finger positions will use the `chordData` (the selected voicing object).
        *   Ensure the structure of the voicing object from `musicTheory.js` matches what `ChordDiagram` expects (e.g., `frets`, `fingers` arrays).

2.  **`src/components/practice/ChordProgressionPlayer.jsx`:**
    *   **Chord Name Handling:**
        *   Progression arrays likely contain simple chord names (e.g., `['G', 'Em', 'C', 'D']`).
        *   When passing a chord name to `ChordDiagram` (which it likely uses), ensure it's a name that `ChordDiagram` can now resolve via the central `musicTheory.js`.
    *   **Direct Lookup (if any):** If this component does its own chord data lookup (unlikely if it uses `ChordDiagram`), refactor it to import and use `chordVoicings` and `normalizeChordName` from `musicTheory.js`.

---

## Phase 4: Refactor Data Handling and Other Pages/Components

1.  **`src/data/mockData.js`:**
    *   **Simplify Chord/Scale Data:**
        *   Review `songs` array: For each song, if it has a `chords` array with full objects, change it to an array of *chord names* that can be normalized and looked up in `musicTheory.js`.
            *   Example: `chords: [{ name: 'Am', ...}]` becomes `chords: ["Am", "G", "C"]`.
        *   Review `scales` object: Similar to chords, if it stores detailed scale positions that are now derivable or defined centrally, simplify to scale *names/types*.
        *   Review the global `chords` object in `mockData.js`. If these are default chord definitions, they are now superseded by `musicTheory.js`. Remove or ensure they don't conflict.
    *   **Consistency:** Ensure chord names used in `mockData.js` (e.g., in song chord lists, common progressions) are compatible with `normalizeChordName`.

2.  **`src/lib/db.js` and `src/lib/db/index.js` (localStorage interaction):**
    *   **`getChords(songId)` / `saveChords(songId, chordData)`:**
        *   `saveChords`: Should save an array of *chord names*.
        *   `getChords`: Should retrieve an array of *chord names*. The responsibility of fetching full voicing data from `musicTheory.js` using these names will lie with the component/page that needs to display them.
        *   Remove any hardcoded default chord lists (e.g., the G, C, D, Em fallback in `src/lib/db.js`'s `getChords`). Fallbacks, if needed, should be handled at a higher level or by looking up common chords from `musicTheory.js`.
    *   **`getScales(songId)` / `saveScales(songId, scaleData)`:**
        *   Similar to chords, save and retrieve scale *names/types*.
    *   **`saveSongAnalysis(songData, analysisData)`:**
        *   When saving chords/scales from `analysisData`, ensure only the *names* are persisted if the full definitions are now central.

3.  **Song Pages (e.g., `src/app/songs/page.jsx`, `src/app/songs/[id]/page.jsx`):**
    *   **Data Retrieval:** When a song's data is loaded, it will contain an array of chord names (e.g., `song.chords = ["Am", "G", "C"]`).
    *   **Displaying Chords:**
        *   When iterating through `song.chords` to display them (e.g., using `ChordDiagram`):
            ```javascript
            // Inside the component
            import { ChordDiagram } from '@/components/diagrams/ChordDiagram';
            // ...
            song.chords.map(chordName => (
              <ChordDiagram key={chordName} chordName={chordName} /* other props */ />
            ));
            ```
    *   **Displaying Scales:** Similar logic for scales; retrieve scale names/types and use them with `Tonal.js` or a potential future `ScaleDiagram` component that might also reference `musicTheory.js` for patterns.

4.  **Practice Page (`src/app/practice/page.jsx`):**
    *   **`COMMON_PROGRESSIONS`:** Chord names within these progressions should be compatible with `normalizeChordName` for lookup in `musicTheory.js` (likely via `ChordDiagram`).
    *   **Custom Progressions:** When users add custom chords, the input string should be processed (potentially normalized) before being used for display or lookup.

5.  **AI Integration (`src/lib/ai/songPrompt.js`, `src/lib/ai/songAnalysisService.js`):**
    *   **`SONG_ANALYSIS_PROMPT`:** The example structure for `chords` and `scales` in the prompt should ideally request *names* that can be mapped to the central library.
        *   If the AI provides full voicings, the `songAnalysisService.js` should attempt to:
            1.  Match the AI's chord/scale to a known one in `musicTheory.js` using its name or by analyzing its structure.
            2.  If a match is found, store the normalized name.
            3.  If it's a unique voicing not in the library, decide on a strategy (e.g., store it as a custom voicing for that song, or attempt to add its *name* and let `ChordDiagram` show a blank/default if the name isn't in `musicTheory.js`).
    *   The goal is to have the AI's output conform to or be translatable to the naming conventions in `musicTheory.js`.

6.  **API Integration (e.g., `src/lib/uberchordApi.js`):**
    *   When `getChordInfo` or other functions fetch data from external APIs:
        *   The chord names and structures returned by the API need to be mapped/transformed.
        *   Use `normalizeChordName` on the API's chord name.
        *   The detailed fingering/position data from the API could be used to find the *closest matching voicing* in `musicTheory.js` or used directly if no match is found (though this reintroduces potential inconsistency if not managed carefully). The ideal is to rely on `musicTheory.js` for the actual voicings displayed.

---

## Phase 5: Testing and Validation

1.  **Comprehensive Testing:**
    *   **Fretboard Page:** Test all functionalities:
        *   Selecting different roots and chord/scale types.
        *   Changing tunings and verifying voicing adaptation.
        *   Note highlighting and interval display.
        *   Voicing navigation.
        *   Chord/scale detection from selected notes.
    *   **`ChordDiagram` Component:** Test in all places it's used:
        *   Song pages, practice player, AI analysis display.
        *   Ensure it correctly displays various chords and their default/selected voicings.
    *   **Song Management:**
        *   Adding new songs (manually and via AI/API).
        *   Display of chords/scales on song detail pages.
    *   **Practice Tools:**
        *   Chord progression player functionality.
        *   Custom progression creation.
    *   **Data Persistence:** Verify that saving and loading songs correctly preserves chord/scale references.

2.  **Consistency Checks:**
    *   Ensure the same chord (e.g., "Am") looks the same and refers to the same base definition across different parts of the application.
    *   Verify that scale information is consistent.

---

## Appendix: Naming Conventions and Normalization (To be finalized in `musicTheory.js`)

*   **Chord Naming:**
    *   Document the canonical internal format (e.g., "C-M", "A-m", "G-7", "Cmaj7"). This should be derived from the keys used in the `chordVoicings` object extracted from `fretboard/index.jsx`.
*   **Scale Naming:**
    *   Document the canonical internal format for scale types (e.g., "major", "minor pentatonic"). This will align with `Tonal.js` types.
*   **`normalizeChordName(inputName)` Implementation Notes:**
    *   Should handle common variations: "C", "Cmaj", "C Major" -> "C-M".
    *   "Am", "Aminor", "A Minor" -> "A-m".
    *   "G7", "G Dominant 7th" -> "G-7".
    *   Case-insensitivity.
*   **`normalizeScaleName(inputName)` Implementation Notes:**
    *   Map descriptive names to `Tonal.js` types if needed.
    *   Case-insensitivity.
