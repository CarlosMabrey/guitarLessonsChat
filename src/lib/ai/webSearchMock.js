// This is a mock implementation of a web search service
// In a real application, you would use an actual web search API

/**
 * Mock web search function
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Array of search results
 */
export async function web_search(query) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Normalize query for matching
  const normalizedQuery = query.toLowerCase();
  
  // Mock results based on query
  if (normalizedQuery.includes("wonderwall") || normalizedQuery.includes("oasis")) {
    return mockWonderwallResults();
  }
  
  // Default generic results
  return [
    {
      title: "Learn to play this song on guitar - Ultimate Guitar",
      snippet: "Find chords, tabs, and tutorials for this song. Key: A minor, Tempo: 120 BPM.",
      url: "https://www.ultimate-guitar.com/example"
    },
    {
      title: "Song tutorial with tabs - YouTube",
      snippet: "Complete guitar tutorial with on-screen tablature. Learn the intro, verse, chorus and bridge sections.",
      url: "https://www.youtube.com/watch?v=example1"
    },
    {
      title: "Play along with scrolling tabs - YouTube",
      snippet: "Guitar cover with scrolling tabs. Perfect for practice at different speeds.",
      url: "https://www.youtube.com/watch?v=example2"
    },
    {
      title: "Song structure and chord progressions - GuitarLessons.com",
      snippet: "Detailed breakdown of the song structure: Intro (Am-G-F-C), Verse (Am-G-F-C), Chorus (F-C-G-Am).",
      url: "https://www.guitarlessons.com/example"
    },
    {
      title: "Common techniques in this song - JustinGuitar",
      snippet: "Learn the strumming patterns and fingerpicking techniques used in this popular song.",
      url: "https://www.justinguitar.com/example"
    }
  ];
}

// Specific mock results for Wonderwall
function mockWonderwallResults() {
  return [
    {
      title: "Wonderwall by Oasis - Guitar Tab and Chords - Ultimate Guitar",
      snippet: "Chords: Em7, G, D, A7sus4. Key: E minor. Tempo: 87 BPM. Capo: 2nd fret. Difficulty: Beginner.",
      url: "https://www.ultimate-guitar.com/search.php?search_type=title&value=wonderwall"
    },
    {
      title: "How To Play Wonderwall by Oasis - Guitar Tutorial with Tabs - YouTube",
      snippet: "Complete tutorial for beginners. Learn the famous chord progression and strumming pattern that made this song iconic.",
      url: "https://www.youtube.com/watch?v=k-HdGnzYdFQ"
    },
    {
      title: "Wonderwall - Oasis - Scrolling Guitar Tab - YouTube",
      snippet: "Play along with scrolling tabs. Includes intro, verse, chorus, and outro sections at normal and slow speeds.",
      url: "https://www.youtube.com/watch?v=DtsqLt6rjno"
    },
    {
      title: "Oasis - Wonderwall (Official Video) - YouTube",
      snippet: "Official music video for Wonderwall by Oasis, released in 1995 as the third single from their album (What's the Story) Morning Glory?",
      url: "https://www.youtube.com/watch?v=bx1Bh8ZvH84"
    },
    {
      title: "Wonderwall by Oasis - Songsterr Tabs with Rhythm",
      snippet: "Interactive guitar tablature with playback. Includes chord charts, rhythm notation, and different instrument parts.",
      url: "https://www.songsterr.com/a/wsa/oasis-wonderwall-tab-s237t1"
    },
    {
      title: "The Secret to Playing Wonderwall - Guitar Techniques Explained",
      snippet: "The distinctive sound comes from the Em7-G-D-A7sus4 progression played with a specific strumming pattern. This article breaks down how to master it.",
      url: "https://www.guitarworld.com/example-wonderwall"
    }
  ];
} 