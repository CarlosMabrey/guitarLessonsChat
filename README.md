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