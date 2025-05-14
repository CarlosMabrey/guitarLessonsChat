# Guitar Learning App Todos

## Completed
- Next.js application with Tailwind CSS and dark-themed responsive UI
- Component structure (Sidebar, Header, Cards)
- Multiple pages (Dashboard, Songs library, Song details, Practice, Progress)
- Database module using localStorage for songs, practice sessions, and progress
- Fixed dashboard terminology to match guitar learning context
- Fixed dynamic Tailwind classes in StatsCard
- Practice page with session tracking, timer, and section selection
- Progress tracking page with statistics and achievements
- AI song analysis service implementation (with OpenAI integration)
- Web search capabilities via SERP API
- Mock data fallbacks for development
- Tab viewer via Songsterr integration
- Fix Songsterr tab viewer to show the correct tab for each song, not just Stairway to Heaven
- Make learning resources embed real, playable YouTube videos for each song
- Fixed the Recent Songs card layout on dashboard to match design
- Fixed theme switching functionality between practice page and dashboard
- Ensured consistency in layout components across pages
- Standardized theme-responsive CSS classes for UI components

## Pending

### User Experience & UI
- [ ] Chord Diagram Enhancements - Add chord sound playback, alternative fingerings, and finger transition animations
- [ ] Smart Positioning - Ensure preview cards are always fully visible within viewport
- [ ] Audio Pitch Control - Add speed/pitch adjustment for practice sessions (inspired by Chordify)
- [ ] Loop Feature - Enable looping of difficult sections during practice (inspired by https://www.looper.tube/)
- [ ] Chromatic Tuner - Include built-in instrument tuner functionality
- [ ] Chord Sheets Export - Add PDF export of chord sheets and diagrams
- [ ] Create mobile-responsive practice mode
- [ ] Add video player with custom controls for practice sessions
- [ ] Implement metronome functionality
- [ ] Enhance ChordProgressionPlayer with visual feedback during countdown
- [ ] Improve Chord Library
- [ ] Add more advanced chords and different recommendations for how to play them
- [ ] UI improvements for the fretboard visualizer (tabbed workflow, mini legend, etc.)

### Mobile & Accessibility
- [ ] Mobile Experience - Adapt hover preview functionality for touch devices with tap/hold actions
- [ ] Develop offline mode capabilities
- [ ] Accessibility improvements
- [ ] Mobile gesture support

### Core Functionality
- [ ] Enhancing the practice tracking functionality
- [ ] Practice Mode Integration - Add direct links between chord pages and practice features
- [ ] Song Data Enrichment - Implement automatic chord detection using Songsterr API
- [ ] Chord Progress Tracking - Allow marking specific chords as "mastered" for detailed progress
- [ ] Adding a customized learning path feature
- [ ] Create song search/recommendation feature
- [ ] Improve Chord Library
- [ ] Add more advanced chords and different recommendations for how to play them

### AI Features
- [ ] Implementing the AI chat feature for song breakdowns
- [ ] Connect AI analysis service to UI (currently implemented but not integrated)

### Data Management
- [ ] Adding user authentication
- [ ] Implementing cloud storage instead of localStorage
- [ ] Add user profile management
- [ ] Implement cloud sync for user data
- [ ] Offline Support - Save songs and chord diagrams for practice without internet connection
- [ ] Implement authentication system

### Performance Optimization
- [ ] Performance Optimization - Implement virtualization for song lists and lazy-loading for chord diagrams

### Technical Debt & Refactoring
- [ ] Refactor remaining components to use theme-responsive classes
- [ ] Create consistent component structure between pages
- [ ] Review and update class naming conventions
- [ ] Add proper type definitions for components

### Social Features
- [ ] Add social sharing features

### Recently Implemented
- Today's changes

### New Features
- Tonnetz Chord Visualizer
- Interactive Tonnetz navigation
- More advanced scale/chord analysis
- Test coverage for fretboard and tonnetz components
- Refactor fretboard logic for maintainability
- Add user-customizable color schemes
- Export diagrams as SVG/PNG

### Improved Code Structure
- Improved code structure and component modularity