# The Tab Rendering Process

## Current Implementation

Currently, the tab renderer is using demo tabs from `src/data/tabs/demoTabs.js` while the tab fetching functionality is being restored. The system has been temporarily simplified to use these demo tabs for visualization.

## Normal Tab Loading Process (Currently being restored)

1. The tab data is loaded via `getTabForSong()` which implements a fallback chain:
   1. Checks cache
   2. Tries hardcoded samples
   3. Attempts to scrape tab data
   4. Falls back to API calls
   5. Generates basic tabs as last resort

2. **Rendering Components**:
   - `TabRenderer`: Basic VexFlow-based renderer for single-stave tabs
   - `SimpleTabRenderer`: Advanced renderer with multi-stave support and error handling
   - `InlineTabRenderer`: Lightweight renderer for simple tab display
   - `TabFretboardVisualizer`: Fretboard visualization with playback controls

3. **Error Handling**:
   - Implements fallbacks for missing data
   - Shows error messages for failed attempts
   - Provides user-friendly fallbacks (currently uses demo tabs)

4. **Performance**:
   - Caching for repeated requests
   - Lazy loading of tab data
   - Efficient rendering of tab staves

---

# Demo Tab Format

The demo tabs are stored in `src/data/tabs/demoTabs.js` and have the following structure:

```javascript
{
  id: 'tab-identifier',
  title: "Song Title",
  artist: "Artist Name",
  data: {
    title: "Song Title",
    artist: "Artist Name",
    tuning: "Standard",
    measures: 12, // Number of measures
    notes: [
      // Each note has:
      { string: 1-6, fret: 0-24, position: 0-N, duration: 1-N, measure: 0-N },
      // More notes...
    ],
    rawTab: `Tab notation in text format`
  }
}
```

## Note Format Explanation:
- `string`: Guitar string number (1=low E, 6=high E)
- `fret`: Fret number (0-24)
- `position`: Sequential position in the tab (0-based index)
- `duration`: Duration in "positions" units
- `measure`: Measure number (0-based index)

# Tab Data Converter

To use demo tabs with the visualizer, a converter (`src/lib/utils/tabDataConverter.js`) transforms the demo format to the one expected by `TabFretboardVisualizer`, which requires:
- Absolute `time` in milliseconds for each note
- Notes grouped by measures

# JSON Tab Format

The TabFretboardVisualizer now supports direct JSON file uploads. The expected JSON format is:

```json
{
  "name": "Tab Name",
  "artist": "Artist Name",
  "tuning": "Standard",
  "bpm": 120,
  "notes": [
    {
      "time": 0,          // Time in milliseconds
      "duration": 500,   // Duration in milliseconds
      "string": 4,       // Guitar string (1=low E, 6=high E)
      "fret": 0,         // Fret number
      "finger": 0,       // Optional finger number
      "measure": 0       // Optional measure number
    },
    // More notes...
  ],
  "measures": [          // Optional - will be auto-generated if missing
    [/* notes in measure 1 */],
    [/* notes in measure 2 */]
  ],
  "totalDuration": 6500  // Optional - total duration in milliseconds
}
```

An example JSON tab template is available for download directly from the TabFretboardVisualizer component.

---

# Component Functionality

## Tab Renderer
A component that renders a tab from a tab data object. The tab data object contains the tab data in a format that can be rendered by the renderer. 

## Fretboard Visualizer
The fretboard visualizer (`TabFretboardVisualizer.jsx`) visualizes a tab on the fretboard. It takes a tab data object as a prop and renders it as midi notes on the fretboard. It features:

- Playback controls (play/pause, speed adjustment, measure navigation)
- Highlighted notes on the fretboard as they play
- Progress bar for tracking position in the tab
- MIDI file upload capability (for custom tabs)
- Time display showing current position and total duration