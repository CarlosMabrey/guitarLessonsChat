# Guitar Lessons Chat - Project Structure and Refactor Plan

## Developer Guide

Welcome to the Guitar Lessons Chat project! This document serves as a comprehensive guide to understanding and working with the codebase. Whether you're a new developer joining the team or an existing contributor, this guide will help you navigate the project structure, understand the architecture, and contribute effectively.

### Getting Started
1. **Prerequisites**: Ensure you have Node.js (v16+) and npm/yarn installed
2. **Installation**: Run `npm install` to install all dependencies
3. **Development**: Use `npm run dev` to start the development server
4. **Building**: Run `npm run build` to create a production build

### Key Technologies
- **Frontend**: Next.js, React 18
- **Styling**: Tailwind CSS
- **State Management**: React Context (to be migrated to Redux Toolkit)
- **Audio**: Tone.js, @tonejs/midi
- **Music Theory**: tonal, @tonaljs/tonal
- **Visualization**: Three.js, VexFlow

### Found Unused Files
During the codebase analysis, the following potentially unused or redundant files were identified:

1. **Unused Components**:
   - `src/components/tabs/TabFretboardVisualizer.new.jsx` - Appears to be a new version that's not imported anywhere
   - `src/components/tabs/TabFretboardVisualizer.jsx` - Older version, check if still in use

2. **Test Files**:
   - `tests/music-parser.test.js` - Only test file found, consider expanding test coverage

3. **Potential Redundancies**:
   - Multiple music theory libraries (`tonal` and `@tonaljs/tonal`) - Consider standardizing on one
   - Mixed routing approaches (App Router and Pages Router) - Should be consolidated

## Project Overview
A web application for guitar learning, featuring interactive fretboard visualization, music theory tools, and song practice features.

## State Management Strategy

### Current State
- Primarily using React's `useState` for local component state
- Some basic Context usage for theme management
- No centralized state management solution
- Prop drilling in deeper component trees

### Proposed State Management Architecture

#### 1. Global State (App-wide)
```
/src/store/
  /slices
    auth.slice.js       # User authentication state
    ui.slice.js         # UI preferences, theme, notifications
    settings.slice.js   # User preferences and settings
  store.js             # Main store configuration
  hooks.js             # Custom hooks for store access
```

#### 2. Feature State (Feature-specific)
```
/src/features/
  /fretboard
    /state
      fretboard.slice.js  # Fretboard-specific state
      useFretboard.js     # Custom hooks
  /songs
    /state
      songs.slice.js      # Songs library state
      useSongs.js         # Songs-related hooks
  /theory
    /state
      theory.slice.js     # Music theory state
      useTheory.js        # Theory-related hooks
```

#### 3. API State (Server State)
```
/src/services/api/
  /songs
    songsApi.js          # RTK Query API slice for songs
    useGetSongs.js       # Generated hooks
  /tabs
    tabsApi.js           # RTK Query API slice for tabs
  /users
    usersApi.js          # User-related API endpoints
```

### Recommended Libraries
1. **Redux Toolkit** - For global state management
   - Includes RTK Query for data fetching and caching
   - Redux DevTools for debugging
   - Immer for immutable updates

2. **Zustand** (Alternative to Redux)
   - Simpler API
   - Less boilerplate
   - Good for medium-sized applications

3. **React Query**
   - For server state management
   - Data fetching, caching, and synchronization
   - Background updates and refetching

## Component Architecture

### Current Issues
- Mixed component organization
- Inconsistent file/folder naming
- No clear separation of concerns
- Reusability challenges

### Proposed Component Structure

```
/src/
  /components
    /ui                  # Base UI components (agnostic to business logic)
      /buttons
        Button.jsx
        IconButton.jsx
      /forms
        Input.jsx
        Select.jsx
        Toggle.jsx
      /layout
        Container.jsx
        Grid.jsx
        Card.jsx
      /feedback
        Toast.jsx
        Modal.jsx
        Tooltip.jsx
      /navigation
        Tabs.jsx
        Breadcrumb.jsx
        Pagination.jsx
      /data-display
        Table.jsx
        List.jsx
        Badge.jsx

  /features
    /fretboard           # Fretboard feature
      /components
        Fretboard.jsx
        FretboardGrid.jsx
        FretboardControls.jsx
        ScaleDisplay.jsx
        ChordDisplay.jsx
      /hooks
        useFretboard.js
        useFretboardAudio.js
      /utils
        fretboardUtils.js
        noteUtils.js
      index.jsx           # Feature entry point

    /songs               # Songs feature
      /components
        SongList.jsx
        SongDetail.jsx
        SongPlayer.jsx
      /hooks
        useSongs.js
      /services
        songService.js
      index.jsx

    /theory              # Music theory tools
      /circle-of-fifths
      /scales
      /chords
      /ear-training

  /layout                # Layout components
    MainLayout.jsx
    AuthLayout.jsx
    Header.jsx
    Sidebar.jsx
    Footer.jsx

  /hooks                 # Global reusable hooks
    useMediaQuery.js
    useLocalStorage.js
    useDebounce.js

  /utils                 # Utility functions
    /formatters
    /validators
    /api
```

### Component Guidelines
1. **Atomic Design Principles**
   - Atoms: Basic building blocks (buttons, inputs)
   - Molecules: Groups of atoms (search bar, card)
   - Organisms: Complex UI components (header, sidebar)
   - Templates: Page-level layouts
   - Pages: Full pages with data

2. **Container/Component Pattern**
   - Container: Handles data and logic
   - Component: Handles presentation
   - Example: `SongListContainer` -> `SongList`

3. **Props Naming**
   - Event handlers: `on{Event}` (e.g., `onClick`, `onSubmit`)
   - Boolean props: `is{State}` (e.g., `isLoading`, `isOpen`)
   - Default props for optional values

## Implementation Plan

### Phase 1: Setup and Core Architecture
1. Set up Redux Toolkit with RTK Query
2. Create base UI component library
3. Implement authentication flow
4. Set up routing structure

### Phase 2: State Management Migration
1. Migrate global state to Redux slices
2. Set up API services with RTK Query
3. Create custom hooks for common state patterns
4. Implement error handling and loading states

### Phase 3: Component Refactoring
1. Reorganize components following the new structure
2. Implement container/component pattern
3. Add prop-types/types for better type safety
4. Create storybook stories for UI components

### Phase 4: Performance Optimization
1. Implement code splitting
2. Add memoization where needed
3. Optimize re-renders
4. Implement virtualized lists for large data sets

## Example: Fretboard Feature Refactor

### Current Structure
```
src/
  pages/
    theory/
      fretboard/
        components/
          FretboardGrid.jsx
          NoteCell.jsx
          DisplaySettings.jsx
        index.jsx
```

### Refactored Structure
```
src/
  features/
    fretboard/
      components/
        Fretboard.jsx           # Main container
        FretboardGrid/
          index.jsx              # Main component
          FretboardGrid.jsx     # Grid layout
          FretboardCell.jsx     # Individual cell
          FretboardNut.jsx      # Nut component
          FretboardFretMarkers.jsx
        controls/
          FretboardControls.jsx
          TuningSelector.jsx
          ScaleSelector.jsx
        display/
          ScaleDisplay.jsx
          ChordDisplay.jsx
          IntervalDisplay.jsx
      hooks/
        useFretboard.js          # Main hook
        useFretboardAudio.js    # Audio functionality
        useFretboardZoom.js     # Zoom/pan behavior
      store/
        fretboardSlice.js       # Redux slice
        fretboardApi.js         # API integration
      utils/
        fretboardUtils.js       # Helper functions
        noteUtils.js            # Note calculations
        intervalUtils.js        # Interval calculations
      index.jsx                 # Feature entry point
```

## State Management Example: Fretboard

### Redux Slice (fretboardSlice.js)
```javascript
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tuning: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  selectedNotes: [],
  selectedScale: 'major',
  rootNote: 'C',
  showIntervals: false,
  highlightOctaves: true,
  fretRange: [0, 12],
  isPlaying: false,
};

const fretboardSlice = createSlice({
  name: 'fretboard',
  initialState,
  reducers: {
    setTuning: (state, action) => {
      state.tuning = action.payload;
    },
    toggleNote: (state, action) => {
      const { string, fret } = action.payload;
      // ... toggle logic
    },
    setScale: (state, action) => {
      state.selectedScale = action.payload;
    },
    // ... other reducers
  },
});

export const { setTuning, toggleNote, setScale } = fretboardSlice.actions;
export default fretboardSlice.reducer;
```

### Custom Hook (useFretboard.js)
```javascript
import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { toggleNote, setScale } from '../store/fretboardSlice';

export const useFretboard = () => {
  const dispatch = useDispatch();
  const fretboard = useSelector((state) => state.fretboard);

  const handleNoteClick = useCallback((string, fret) => {
    dispatch(toggleNote({ string, fret }));
  }, [dispatch]);

  const handleScaleChange = useCallback((scale) => {
    dispatch(setScale(scale));
  }, [dispatch]);

  return {
    ...fretboard,
    handleNoteClick,
    handleScaleChange,
  };
};
```

## Migration Strategy

1. **Incremental Adoption**
   - Start with new features using the new structure
   - Gradually migrate existing features
   - Use feature flags for gradual rollout

2. **State Migration**
   - Identify state that needs to be lifted up
   - Move shared state to Redux
   - Keep local UI state in components

3. **Testing**
   - Add unit tests for reducers and selectors
   - Add integration tests for components
   - Add E2E tests for critical paths

## Benefits of This Approach

1. **Improved Maintainability**
   - Clear separation of concerns
   - Easier to locate and modify code
   - Better code reuse

2. **Enhanced Developer Experience**
   - Predictable state management
   - Better tooling support
   - Easier onboarding for new developers

3. **Better Performance**
   - Optimized re-renders
   - Efficient data fetching and caching
   - Code splitting and lazy loading

4. **Scalability**
   - Easy to add new features
   - Better organization as the app grows
   - Easier to split into micro-frontends if needed

### Root Directory
- `/app` - Next.js 13+ App Router directory (potentially unused or partially used)
- `/public` - Static assets (images, example files, MIDI files)
- `/src` - Main application source code
  - `/components` - Reusable UI components
  - `/hooks` - Custom React hooks
  - `/lib` - Utility functions and API clients
  - `/pages` - Next.js page components
    - `/dashboard` - User dashboard
    - `/practice` - Practice routines and exercises
    - `/songs` - Song library and management
    - `/theory` - Music theory tools
      - `/fretboard` - Interactive fretboard visualization
      - `/circle-of-fifths` - Circle of fifths tool
      - `/ear-training` - Ear training exercises
      - Other theory-related tools
    - `/tabs` - Tablature viewer/editor
    - `/unified-tab-test` - Testing area for tab features
  - `/styles` - Global styles and theming
- `/scripts` - Build and utility scripts
- `/tests` - Test files
- `/tab-cache` - Cached tablature data
- `/tab-samples` - Example tablature files
- `/tabs` - Additional tablature resources

## Key Dependencies
- **Frontend Framework**: Next.js 14, React 18
- **UI**: TailwindCSS, Framer Motion
- **Audio**: Tone.js, @tonejs/midi
- **Music Theory**: tonal, @tonaljs/tonal
- **Visualization**: Three.js, VexFlow
- **Testing**: Playwright

## Identified Issues

### 1. Duplicate Dependencies
- Both `tonal` and `@tonaljs/tonal` are installed but serve similar purposes
- Multiple music theory libraries might cause confusion and bundle bloat

### 2. Mixed Routing
- App Router (`/app`) and Pages Router (`/src/pages`) are both present
- This can lead to routing conflicts and maintenance challenges

### 3. Unclear Component Organization
- Some components are directly in `/src` while others are in `/src/components`
- No clear distinction between presentational and container components

### 4. State Management
- No clear state management strategy visible
- Potential prop drilling in complex components

### 5. Testing Coverage
- Limited test coverage based on directory structure
- No clear testing strategy

## Refactoring Plan

### Phase 1: Project Structure Cleanup
1. **Consolidate Routing**
   - Choose between App Router or Pages Router (recommend migrating to App Router for future compatibility)
   - Move all routing to the chosen system

2. **Reorganize Components**
   ```
   /src
     /components
       /ui           # Basic UI components (buttons, inputs, etc.)
       /fretboard   # Fretboard-related components
       /theory       # Music theory components
       /songs        # Song-related components
       /layout       # Layout components
       /shared       # Shared components used across features
   ```

3. **Consolidate Dependencies**
   - Remove duplicate music theory libraries
   - Audit and remove unused dependencies
   - Standardize on a single version of shared dependencies

### Phase 2: State Management & Architecture
1. **Implement State Management**
   - Consider using Zustand or Context + useReducer for global state
   - Move API calls to dedicated service layer

2. **Improve Type Safety**
   - Add TypeScript for better type safety
   - Define clear interfaces for data models

3. **Enhance Error Handling**
   - Implement consistent error boundaries
   - Add error handling for API calls

### Phase 3: Performance & Testing
1. **Optimize Bundle Size**
   - Implement code splitting
   - Lazy load non-critical components

2. **Improve Testing**
   - Add unit tests for core utilities
   - Add integration tests for critical user flows
   - Add E2E tests for main features

### Phase 4: Documentation & Developer Experience
1. **Add Documentation**
   - Document component APIs
   - Add JSDoc comments to functions and hooks
   - Create a CONTRIBUTING.md

2. **Improve Developer Experience**
   - Set up pre-commit hooks with Husky
   - Add ESLint and Prettier configurations
   - Create a development guide

## Immediate Action Items
1. [ ] Remove unused `/app` directory or migrate to App Router
2. [ ] Consolidate music theory libraries
3. [ ] Reorganize components into a clearer structure
4. [ ] Set up TypeScript configuration
5. [ ] Add basic testing setup

## Long-term Goals
1. Implement comprehensive test coverage
2. Optimize performance
3. Improve accessibility
4. Enhance mobile responsiveness
5. Add offline capabilities with service workers

## Notes
- The fretboard visualization appears to be a core feature based on open files
- Consider using a monorepo structure if the project continues to grow
- Implement feature flags for experimental features

## Recommendations
1. Use a design system or component library for consistent UI
2. Implement proper error tracking (e.g., Sentry)
3. Set up CI/CD pipelines
4. Consider using a state management solution for complex state
5. Implement proper logging and analytics
