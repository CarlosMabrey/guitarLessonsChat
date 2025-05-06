# Guitar Learning App - Knowledge Graph

## Core Architecture
- **Framework**: Next.js (using App Router structure)
- **Directory Structure**: `/src/app/` (main application), `/src/components/` (reusable UI components), `/src/lib/` (utilities and data layer)

## Main Components

### Data Layer
- `src/lib/db.js`: Local database implementation using localStorage
  - Manages songs, practice sessions, user preferences, chat history, chord data
  - Key functions: getAllSongs, getSongById, addSong, updateSong, getPracticeSessions, saveSongAnalysis

### AI Services
- `src/lib/ai/songAnalysisService.js`: Handles song analysis with OpenAI API (with fallback to mock data)
  - Main function: analyzeSong() - analyzes songs and generates learning resources
  - Uses web search for additional song info (optional)

### Pages
- `src/app/page.jsx`: Root page with redirect to dashboard
- `src/app/dashboard/page.jsx`: Main dashboard with practice stats and recent songs
- `src/app/songs/page.jsx`: Song library listing
- `src/app/songs/[id]/page.jsx`: Individual song detail page with practice history
- `src/app/practice/page.jsx`: Practice session management 
- `src/app/practice/[id]/page.jsx`: Focused practice page for individual songs

### UI Components
- `src/components/SongsterrTab.jsx`: Displays interactive guitar tabs from Songsterr
- `src/components/ui/Chat.jsx`: AI chat interface for song-specific assistance
- `src/components/ui/Layout.jsx`: Main application layout wrapper
- `src/components/ui/Card.jsx`: Reusable card component with subcomponents
- `src/components/songs/AddSongForm.jsx`: Form for adding songs with AI analysis
- `src/components/ui/SongItem.jsx`: Reusable song list item component

### Data Flow
1. User adds songs via `AddSongForm` → saved to localStorage via `db.js`
2. Songs displayed in song list (`songs/page.jsx`) and dashboard (`dashboard/page.jsx`)
3. Songs can be practiced (`practice/[id]/page.jsx`) with Songsterr integration
4. Practice sessions tracked and saved to localStorage
5. Chat interactions saved per song

### Key Features
- Song management with metadata (key, tempo, difficulty)
- Interactive guitar tabs via Songsterr iframe embedding
- Practice session tracking and timer
- AI-powered song analysis and learning guidance
- Chat assistance for learning specific songs

## Integration Features
- **Songsterr Tab Integration**: Embedded iframe displays interactive guitar tabs
- **Local Storage Database**: All data persisted client-side
- **AI Analysis**: Song breakdown with chords, practice plan, and difficulty analysis
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS 