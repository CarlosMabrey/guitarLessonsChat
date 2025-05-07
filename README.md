# Guitar Learning Chatbot

A professional guitar learning application that helps users break down songs they want to learn through AI-powered analysis and interactive learning features.

## Project Structure

```
├── public/                 # Static assets
│   ├── images/             # Images for the app
│   └── icons/              # Icons for the UI
├── src/                    # Source code
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # Authentication routes
│   │   │   ├── login/      # Login page
│   │   │   └── signup/     # Signup page
│   │   ├── dashboard/      # Dashboard page
│   │   ├── songs/          # Songs management
│   │   ├── practice/       # Practice session page
│   │   ├── progress/       # Progress tracking page
│   │   ├── api/            # API routes
│   │   └── layout.jsx      # Root layout
│   ├── components/         # Reusable components
│   │   ├── ui/             # UI components
│   │   ├── charts/         # Chart components
│   │   ├── player/         # Video player components
│   │   └── diagrams/       # Guitar diagrams components
│   ├── lib/                # Utilities and helpers
│   │   ├── api/            # API clients
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   ├── contexts/           # React contexts
│   ├── styles/             # Global styles
│   └── data/               # Mock data for development
└── package.json            # Dependencies and scripts
```

## Setup Instructions

### Prerequisites

- Node.js (v18.0.0 or newer)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/guitar-learning-chatbot.git
cd guitar-learning-chatbot
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **State Management**: React Context API
- **Database**: (To be implemented - SQLite through Prisma)
- **AI Integration**: OpenAI API
- **Authentication**: NextAuth.js
- **Video Playback**: react-player

## Key Features

- Dark mode UI with responsive design
- Song management with progress tracking
- AI-generated song breakdowns
- Interactive chord and scale diagrams
- Video playback with custom controls
- Progress visualization

## Development Status

This project is currently in MVP phase. See [MVP Plan](./guitar_learning_app_mvp.md) for detailed roadmap.

## License

MIT 

## Innovative Song Discovery

The app now features a cutting-edge song discovery system that allows users to add songs to their library with minimal effort. The system combines multiple data sources and AI to provide accurate information about songs, all in a simple one-click interface.

### Key Features

- **One-Click Song Addition**: Just type a song name and get comprehensive information
- **Voice Search**: Say the name of a song to find it quickly
- **Smart Song Recognition**: Intelligently extracts artist and song data from partial inputs
- **Multi-API Integration**: Combines data from Songsterr, Uberchord, and other sources
- **Confidence Indicators**: Shows how reliable the found information is
- **Fallback Mechanisms**: Uses web search as a fallback when APIs don't return results
- **Learning Resources**: Automatically finds tutorials, chord sheets, and tabs
- **Mobile-Friendly Interface**: Works great on all devices

### How It Works

1. **Intelligent Query Parsing**: The system analyzes your input to extract artist and song information, even from partial or ambiguous queries.

2. **Multi-Source Data Retrieval**: It searches for song information across multiple sources:
   - Songsterr API for tabs and basic info
   - Uberchord API for chord information
   - Web search as a fallback mechanism

3. **Data Cross-Referencing**: Information from different sources is cross-referenced to increase accuracy.

4. **Confidence Scoring**: A reliability score is calculated based on the quality and consistency of information found.

5. **Learning Resource Discovery**: The system automatically finds relevant tutorials, tabs, and videos to help you learn the song.

## Usage

### Quick Add Mode

1. Click "Quick Add" on the Songs page
2. Type a song name or use voice search
3. The system will find the song and show a preview with available information
4. Click "Add to My Songs" to add it to your library

### Advanced Mode

For more control over the song data, you can use the Advanced mode which allows you to manually edit all fields.

## Technologies Used

- Next.js for the framework
- Tailwind CSS for styling
- Framer Motion for animations
- Multiple music APIs for data
- Web Speech API for voice recognition

## API Integration

The app integrates with several music APIs:

- **Songsterr API**: For guitar tabs and song information
- **Uberchord API**: For chord diagrams and additional song data
- **Web Search**: As a fallback data source

## Credits

- [Songsterr](https://www.songsterr.com/) for tab data
- [Uberchord](https://www.uberchord.com/) for chord information
- [Ultimate Guitar](https://www.ultimate-guitar.com/) for additional resources
- [AlphaTab](https://www.alphatab.net/) for music notation rendering 