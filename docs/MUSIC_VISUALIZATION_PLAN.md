# Music Visualization in Chat - Implementation Plan

## 1. Overview
This document outlines the plan to integrate music visualization components (fretboard, chords, tabs) into the chat interface, leveraging existing components while creating new adapters for chat-specific use cases.

## 2. Component Architecture

### 2.1 Existing Components

#### TabFretboardVisualizer (`/src/components/tabs/TabFretboardVisualizer.jsx`)
- **Purpose**: Renders tablature with timing and playback
- **Key Features**:
  - Note highlighting with timing
  - Playback controls
  - Interactive fretboard
- **Adaptation Needed**:
  - Create a simplified version for chat
  - Make it responsive
  - Add touch support

#### ChordBuilderPanel (`/src/pages/theory/fretboard/components/ChordBuilderPanel.jsx`)
- **Purpose**: Displays and interacts with chord voicings
- **Key Features**:
  - Chord visualization
  - Voicing selection
  - Playback
- **Adaptation Needed**:
  - Extract chord display logic
  - Create a standalone chord component
  - Optimize for chat messages

### 2.2 New Components

#### ChatFretboard (`/src/components/chat/ChatFretboard.jsx`)
```jsx
// Lightweight wrapper for fretboard visualization in chat
const ChatFretboard = ({
  notes = [],
  tuning = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  width = '100%',
  maxWidth = 400,
  showControls = true,
  interactive = true
}) => {
  // Implementation using TabFretboardVisualizer
};
```

#### ChatChord (`/src/components/chat/ChatChord.jsx`)
```jsx
// Component for displaying chords in chat
const ChatChord = ({
  chord,           // e.g., 'Cmaj7'
  voicing,         // Optional specific voicing
  showInfo = true, // Show chord name
  interactive = false,
  size = 'medium'  // 'small' | 'medium' | 'large'
}) => {
  // Implementation using ChordBuilderPanel logic
};
```

## 3. Message Format

### 3.1 Tablature
```markdown
```tab
e|-----------------0--1--|
B|--------------1--------|
G|-----------2-----------|
D|--------2--------------|
A|-----0-----------------|
E|--3--------------------|
```
```

### 3.2 Chords
```markdown
```chord
{
  "name": "C major",
  "notes": ["C", "E", "G"],
  "voicing": [
    {"string": 5, "fret": 3, "note": "C"},
    {"string": 4, "fret": 2, "note": "E"},
    {"string": 3, "fret": 0, "note": "G"},
    {"string": 2, "fret": 1, "note": "C"},
    {"string": 1, "fret": 0, "note": "E"}
  ]
}
```

### 3.3 Interactive Fretboard
```markdown
```fretboard
{
  "tuning": ["E2", "A2", "D3", "G3", "B3", "E4"],
  "notes": [
    {
      "string": 6, 
      "fret": 3, 
      "note": "G", 
      "duration": "q",
      "highlight": true,
      "label": "Root",
      "color": "#3b82f6"
    }
  ],
  "showFretNumbers": true,
  "showNoteNames": true
}
```

## 4. Implementation Phases

### Phase 1: Component Extraction (Week 1-2)
1. Create `ChatFretboard` component
   - Adapt TabFretboardVisualizer for chat
   - Add responsive design
   - Implement touch support

2. Create `ChatChord` component
   - Extract chord visualization from ChordBuilderPanel
   - Add responsive sizing
   - Implement touch interactions

### Phase 2: Message Parser (Week 3)
1. Implement message parsing
   - Detect music notation blocks
   - Parse tablature, chords, and fretboard data
   - Handle errors gracefully

2. Create renderers
   - Tablature renderer
   - Chord diagram renderer
   - Interactive fretboard renderer

### Phase 3: AI Integration (Week 4)
1. Update AI instructions
   - Teach proper formatting
   - Add examples
   - Implement validation

2. Test with real-world examples
   - Common chord progressions
   - Scale patterns
   - Song snippets

## 5. Technical Considerations

### Performance
- Virtualize long tablature
- Memoize components
- Lazy load heavy components

### Accessibility
- Keyboard navigation
- Screen reader support
- High contrast modes

### Mobile Support
- Touch-friendly controls
- Responsive layouts
- Performance optimization

## 6. Testing Plan

### Unit Tests
- Parser correctness
- Component rendering
- Edge cases

### Integration Tests
- Chat message flow
- Interactive elements
- Mobile responsiveness

### User Testing
- Musicians of different skill levels
- Various devices
- Real-world usage scenarios
