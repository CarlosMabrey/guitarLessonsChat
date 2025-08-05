# Guitar Learning & Practice Platform

Welcome to the Guitar Learning & Practice Platform, a professional, AI-powered web application designed to help guitarists of all levels master their instrument. This application provides a rich set of interactive tools, personalized practice routines, and intelligent coaching to create a comprehensive and engaging learning experience.

## ✨ Key Features

*   🎸 **AI-Powered Guitar Coach:** An intelligent chat assistant that provides personalized feedback, answers music theory questions, and helps you break down complex songs. It understands and can generate musical notation like tabs and chord diagrams directly in the chat.
*   🎼 **Interactive Tab Viewer:** A robust engine for rendering and playing guitar tablature, complete with synchronized fretboard visualization and playback controls.
*   🎯 **Structured Practice System:** A dedicated practice hub with AI-generated routines, ear training exercises, progress tracking, and a "Play Along" mode with backing tracks.
*   🎶 **Dynamic Fretboard Visualizer:** An interactive fretboard to explore scales, chords, and voicings. It's a core component used throughout the app for a visual learning experience.
*   📚 **Song Library & Resource Management:** Organize the songs you're learning and curate a personal library of external resources like YouTube tutorials and articles.
*   📊 **Progress Tracking:** Keep track of your practice time, streaks, and learned songs with clear data visualizations.

## 🛠️ Tech Stack

*   **Frontend:** Next.js, React, Tailwind CSS
*   **State Management:** React Context API, Zustand
*   **AI & Backend:** Node.js, Express, OpenAI API
*   **Database:** Currently uses `localStorage` with plans to migrate to a persistent database.
*   **Music APIs:** Integrations with Songsterr, YouTube, and other music services.

## 📚 Project Documentation

This project is extensively documented to help developers and contributors understand its architecture, features, and future plans.

| Document                                       | Description                                                                                                                              |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Development & Planning**                     |                                                                                                                                          |
| [ROADMAP.md](./docs/ROADMAP.md)                | Outlines the development timeline, feature phases, and long-term vision for the project.                                                 |
| [todo.md](./docs/todo.md)                      | A detailed list of completed, pending, and future tasks. A great place to see the project's current status.                              |
| [PAGES.md](./docs/PAGES.md)                    | An overview of the main pages in the application and their core functionalities.                                                         |
| **Architecture & Technical Deep Dives**        |                                                                                                                                          |
| [AGENTIC RAG PROMPT.md](./docs/AGENTIC%20RAG%20PROMPT.md) | A deep dive into the Agentic RAG system that powers our AI Coach, combining vector search and knowledge graphs.                      |
| [CHAT_FEATURE.md](./docs/CHAT_FEATURE.md)      | Detailed documentation on the chat feature, including its components, API, and response formatting.                                      |
| [DB_SYSTEM.md](./docs/DB_SYSTEM.md)            | Explains the current local database system and the modular approach to data management.                                                  |
| [DataBaseRefactor.md](./docs/DataBaseRefactor.md) | A detailed plan for centralizing all music theory data into a single, consistent library.                                                |
| [MUSIC_VISUALIZATION_PLAN.md](./docs/MUSIC_VISUALIZATION_PLAN.md) | The implementation plan for integrating music visualization components (fretboard, chords, tabs) into the chat interface. |
| [code-graph.md](./docs/code-graph.md)          | A visual representation of the module dependencies within the codebase.                                                                  |
| **UI & Design**                                |                                                                                                                                          |
| [PRACTICE_PAGE_WIREFRAME.md](./docs/PRACTICE_PAGE_WIREFRAME.md) | A visual wireframe and layout plan for the main Practice Page.                                                                   |

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18.0.0 or newer)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/guitar-learning-app.git
    cd guitar-learning-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory by copying the example:
    ```bash
    cp .env.example .env.local
    ```
    Add your API keys to the `.env.local` file.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📂 Project Structure

```
├── public/                 # Static assets
├── src/                    # Source code
│   ├── app/                # Next.js App Router pages
│   ├── components/         # Reusable React components
│   ├── lib/                # Core libraries, helpers, and services
│   ├── data/               # Mock data for development
│   └── styles/             # Global styles
├── docs/                   # Project documentation
└── scripts/                # Utility scripts
```

## 🙏 Credits

This project leverages data and resources from several excellent platforms:
- [Songsterr](https://www.songsterr.com/) for tab data
- [Uberchord](https://www.uberchord.com/) for chord information
- [Ultimate Guitar](https://www.ultimate-guitar.com/) for additional resources

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.