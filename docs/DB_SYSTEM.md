# Local Database System (`@src/lib/db`)

This document explains the local database system used in this project, how it works, and how the site retrieves and stores information using it.

## Overview
The local database system in `@src/lib/db` (and related files) is responsible for persisting user and app data in the browser using `localStorage`. This approach ensures that user data (such as resources, songs, practice sessions, and preferences) is stored locally and remains available across sessions, even when offline.

## Modular Local Database System

The local database system is now fully modular, with each major data type managed in its own file under `src/lib/`. This design improves maintainability, scalability, and clarity. Each module uses a unique localStorage key and exposes simple CRUD functions for its data type.

### Modules and Their Purpose

- **songdb.js**: Manages all song data and progress tracking.
- **practicedb.js**: Handles practice routines and session logs.
- **profiledb.js**: Stores and manages user profile information.
- **resourcedb.js**: Manages useful links, videos, and learning resources.

> The legacy `db.js` file may still exist but should not be used for songs, practice, profile, or resource data.

### File Structure

```
src/lib/
  songdb.js        # Song data management
  practicedb.js    # Practice session management
  profiledb.js     # User profile management
  resourcedb.js    # Resource management
  db.js            # (legacy, for other types only)
```

### Usage Examples

#### Songs
```js
import { getAllSongs, addSong, updateSong, removeSong, getSongById } from '@/lib/songdb';

const songs = getAllSongs();
const song = getSongById('abc123');
addSong({ title: 'Wonderwall', artist: 'Oasis' });
```

#### Practice Sessions
```js
import { getAllPracticeSessions, addPracticeSession, removePracticeSession, getPracticeSessionsBySongId } from '@/lib/practicedb';

const sessions = getAllPracticeSessions();
const sessionsForSong = getPracticeSessionsBySongId('abc123');
addPracticeSession({ songId: 'abc123', duration: 30 });
```

#### User Profile
```js
import { getUserProfile, saveUserProfile, clearUserProfile, defaultUserProfile } from '@/lib/profiledb';

const profile = getUserProfile();
saveUserProfile({ name: 'Carlos', instrument: 'Guitar' });
clearUserProfile();
```

#### Resources
```js
import { getAllResources, addResource, removeResource } from '@/lib/resourcedb';

const resources = getAllResources();
addResource({ url: 'https://www.justinguitar.com', title: 'JustinGuitar' });
removeResource('resource-id');
```

### How the Site Uses the DB
- **On Page Load:** Components call `getAllResources()` (or similar) to fetch data for display.
- **Adding Data:** When a user adds a resource, the UI calls `addResource()`, which updates localStorage and re-renders the UI.
- **Removing Data:** When a user deletes a resource, the UI calls `removeResource()`, which updates localStorage and the UI.
- **Persistence:** All changes are immediately persisted in the browser and available on next visit.

### Extending the System
2. Implement `initialize`, `getAll`, `add`, `remove`, and (if needed) `update` functions.
3. Import and use these functions in your React components as needed.

## Notes
- **Security:** Data is only as secure as the user's browser. Do not store sensitive information.
- **Portability:** Data does not sync between devices/browsers.
- **Reset:** Clearing browser storage or using incognito mode will reset all data.

---
For more details, see the code in `@src/lib/resourcedb.js` and related files.
