# Main Page Features

## Dashboard
- **Main Component:** [src/pages/dashboard/index.jsx](src/pages/dashboard/index.jsx)
- **Data Storage:** [src/lib/storage/userProfile.js](src/lib/storage/userProfile.js)
- Features:
  - Personalized greeting based on time of day and user profile.
  - Quick access to key features: Songs Library, Fretboard Trainer, Progress Tracker.
  - Displays user stats: weekly practice time, streak, songs learned, and overall progress.
  - Modern, visually engaging layout with dynamic backgrounds.

## Songs
- **Main Component:** [src/pages/songs/index.jsx](src/pages/songs/index.jsx)
- **Data Storage:** [src/lib/songdb.js](src/lib/songdb.js)
- **API Integration:** [src/lib/services/songsterrApi.js](src/lib/services/songsterrApi.js)
- Features:
  - Song library where users can view, search, filter, and sort their songs.
  - Add new songs via Quick Add or Advanced Add forms.
  - Song details include chord breakdowns with interactive tooltips.
  - Play/pause song audio and view additional song metadata.
  - Responsive UI with modal dialogs for adding songs.

## Practice
- **Main Component:** [src/pages/practice/index.jsx](src/pages/practice/index.jsx)
- **Data Storage:** [src/lib/practicedb.js](src/lib/practicedb.js)
- **Ear Training:** [src/pages/theory/ear-training.js](src/pages/theory/ear-training.js)
- Features:
  - Central hub for practice routines and daily plans.
  - View, select, and manage personal and recommended practice routines.
  - Step-by-step routine progress tracking with completion checkmarks and progress bars.
  - Integrated interactive chord/voicing trainer.
  - Built-in Ear Training Tool for interval/chord/scale recognition.
  - Placeholders for AI Coach and customization settings.

## Progress
- **Main Component:** [src/pages/progress/index.jsx](src/pages/progress/index.jsx)
- **Data Storage:** 
  - [src/lib/practicedb.js](src/lib/practicedb.js)
  - [src/lib/songdb.js](src/lib/songdb.js)
- Features:
  - Visualizes weekly practice activity with bar charts.
  - Displays aggregate stats: total practice time, songs practiced, daily average, and streak.
  - Lists recent practice sessions with details on duration and songs practiced.
  - Clean, dashboard-like interface for tracking improvement over time.

## Theory
- **Main Component:** [src/pages/theory/index.js](src/pages/theory/index.js)
- **Music Theory Library:** [src/lib/musicTheory.js](src/lib/musicTheory.js)
- **Tools:**
  - **Tonnetz Chord Visualizer:** [src/pages/theory/tonnetz](src/pages/theory/tonnetz)
  - **Circle of Fifths:** [src/pages/theory/circle-of-fifths](src/pages/theory/circle-of-fifths)
  - **Fretboard Visualizer:** [src/pages/theory/fretboard](src/pages/theory/fretboard)
  - **Piano Visualizer:** [src/pages/theory/piano](src/pages/theory/piano)
  - **Scale Explorer:** [src/pages/theory/scales](src/pages/theory/scales)
  - **Ear Training Tool:** [src/pages/theory/ear-training.js](src/pages/theory/ear-training.js)
  - **Music Theory Cheatsheet:** [src/pages/theory/cheatsheet](src/pages/theory/cheatsheet)
  - **Chord Progressions:** [src/pages/theory/progressions](src/pages/theory/progressions)
  - **Chord Function Graph:** [src/pages/theory/functions](src/pages/theory/functions)
- Features:
  - Each tool is accessible as a subpage and is designed for interactive learning.

## Resources
- **Main Component:** [src/pages/resources.jsx](src/pages/resources.jsx)
- **Data Storage:** [src/lib/resourcedb.js](src/lib/resourcedb.js)
- Features:
  - Curated list of external learning resources (websites, YouTube, etc.).
  - Add new resources with title and URL.
  - Resource cards display favicon or YouTube icon, title, and date added.
  - Click to open resources in a new tab.
  - Modal dialog for adding new resources.

## Chat
- **Main Component:** [src/pages/chat/index.jsx](src/pages/chat/index.jsx)
- **Data Storage:** 
  - Chat history: [src/lib/chatdb.js](src/lib/chatdb.js)
  - User preferences: [src/context/SettingsContext.js](src/context/SettingsContext.js)
- **AI Integration:** [src/lib/ai/songAnalysisService.js](src/lib/ai/songAnalysisService.js)
- Features:
  - AI-powered chat interface for music/guitar-related questions and coaching.
  - Persistent chat history and multi-chat support.
  - Sidebar with navigation, chat management, and settings access.
  - Suggested prompts for music analysis, theory, and practice.
  - File upload support for tab files and PDFs.
  - Settings modal for API keys and preferences.
  - Responsive, modern UI with collapsible sidebar.

## Dev (Development Manager)
- **Main Component:** [src/pages/dev/index.jsx](src/pages/dev/index.jsx)
- **Task Management:** [src/lib/taskManager.js](src/lib/taskManager.js)
- **API Endpoint:** [src/pages/api/tasks.js](src/pages/api/tasks.js)
- Features:
  - Central hub for tracking feature implementation and overall development progress.
  - Visual statistics on completed, in-progress, and pending features.
  - Feature status cards showing each major feature, its description, status, and last updated date.
  - Interactive task management:
    - Add, edit, and delete development tasks
    - Assign priorities and statuses to tasks
    - Expand tasks to view and manage details
    - Mark steps as complete/incomplete
  - Dynamic, visually engaging background similar to the dashboard.