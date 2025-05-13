import { SONG_ANALYSIS_PROMPT, formatSongSearch, parseSongAnalysis } from './songPrompt';
import { API_KEYS, API_CONFIG, FEATURES } from '../config';

// Real implementation using OpenAI API and SERP API for web search
export async function analyzeSong(songTitle) {
  try {
    // Step 1: Format the song title for search
    const { searchQuery, artist, title } = formatSongSearch(songTitle);
    
    // Step 2: Search the web for song information if enabled
    let searchResults = [];
    if (FEATURES.ENABLE_WEB_SEARCH) {
      searchResults = await webSearch(searchQuery);
    }
    
    // Step 3: Send the formatted prompt + search results to AI
    const aiResponse = await callOpenAI(songTitle, artist, title, searchResults);
    
    // Step 4: Parse and validate the AI response
    const parsedData = parseSongAnalysis(aiResponse);
    
    if (!parsedData) {
      throw new Error("Failed to parse AI response");
    }
    
    return {
      success: true,
      data: parsedData
    };
  } catch (error) {
    console.error("Song analysis error:", error);
    
    // Always fall back to mock for development/testing when there's an error
    console.log("Falling back to mock response due to API error");
    return await mockAnalyzeSong(songTitle);
  }
}

// Function to search for song information using SERP API
async function webSearch(query) {
  try {
    const apiKey = API_KEYS.SERPAPI_KEY;
    
    if (!apiKey || apiKey === "your_serpapi_key_here") {
      console.warn("No SERP API key provided. Falling back to mock search results.");
      return await mockWebSearch(query);
    }

    console.log("Using SERP API with key:", apiKey.substring(0, 5) + "...");
    
    try {
      const response = await fetch(
        `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${apiKey}&num=${API_CONFIG.SEARCH_RESULT_COUNT}`
      );
      
      if (!response.ok) {
        throw new Error(`SERP API error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.organic_results || !Array.isArray(data.organic_results)) {
        console.warn("SERP API returned unexpected format:", data);
        return await mockWebSearch(query);
      }
      
      // Format results to match our expected format
      return data.organic_results.map(result => ({
        title: result.title,
        snippet: result.snippet || "No description available",
        url: result.link
      }));
    } catch (fetchError) {
      console.error("SERP API fetch error:", fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error("Web search error:", error);
    // Fall back to mock search results on error
    return await mockWebSearch(query);
  }
}

// Function to call OpenAI API
async function callOpenAI(songTitle, artist, title, searchResults) {
  try {
    const apiKey = API_KEYS.OPENAI_API_KEY;
    
    if (!apiKey || apiKey === "your_openai_api_key_here") {
      console.warn("No OpenAI API key provided. Falling back to mock AI response.");
      return await mockAiAnalysis(songTitle, searchResults);
    }

    console.log("Using OpenAI API with key:", apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 5));

    // Prepare the prompt with search results
    let prompt = SONG_ANALYSIS_PROMPT;
    
    // Add song info
    prompt += `\n\nAnalyze the song "${title}" by "${artist || 'Unknown Artist'}".\n\n`;
    
    // Add search results if available
    if (searchResults && searchResults.length > 0) {
      prompt += "Here are some search results that might help with your analysis:\n\n";
      
      searchResults.forEach((result, index) => {
        prompt += `[${index + 1}] ${result.title}\n${result.snippet}\nURL: ${result.url}\n\n`;
      });
    }

    // Call OpenAI API
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: API_CONFIG.OPENAI_MODEL,
          messages: [
            {
              role: "system", 
              content: "You are a professional guitar teacher specialized in analyzing songs and creating learning plans."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: API_CONFIG.TEMPERATURE,
          max_tokens: API_CONFIG.MAX_TOKENS
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(e => ({ error: { message: "Error parsing error response" } }));
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (fetchError) {
      console.error("OpenAI API fetch error:", fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    // Fall back to mock AI analysis on error
    return await mockAiAnalysis(songTitle, searchResults);
  }
}

// Mock functions for fallback during development or when API keys are not provided
async function mockWebSearch(query) {
  // Import the mock module only when needed
  const { web_search } = await import('./webSearchMock');
  return await web_search(query);
}

async function mockAiAnalysis(songTitle, searchResults) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For demo purposes, return a hardcoded response for a popular song
  const lowerTitle = songTitle.toLowerCase();
  
  if (lowerTitle.includes("wonderwall") || lowerTitle.includes("oasis")) {
    return JSON.stringify({
      songInfo: {
        key: "E minor",
        tempo: "87 BPM",
        timeSignature: "4/4",
        difficulty: "Beginner",
        genre: "Rock/Britpop"
      },
      chords: [
        {
          name: "Em7",
          positions: [
            [1, "0"],
            [2, "2"],
            [3, "0"],
            [4, "0"],
            [5, "0"],
            [6, "0"]
          ],
          fingerings: [0, 2, 0, 0, 0, 0],
          baseFret: 1,
          barres: []
        },
        {
          name: "G",
          positions: [
            [1, "3"],
            [2, "0"],
            [3, "0"],
            [4, "0"],
            [5, "2"],
            [6, "3"]
          ],
          fingerings: [3, 0, 0, 0, 1, 2],
          baseFret: 1,
          barres: []
        },
        {
          name: "D",
          positions: [
            [1, "x"],
            [2, "x"],
            [3, "0"],
            [4, "2"],
            [5, "3"],
            [6, "2"]
          ],
          fingerings: [0, 0, 0, 2, 3, 1],
          baseFret: 1,
          barres: []
        },
        {
          name: "A7sus4",
          positions: [
            [1, "0"],
            [2, "3"],
            [3, "0"],
            [4, "2"],
            [5, "0"],
            [6, "x"]
          ],
          fingerings: [0, 3, 0, 2, 0, 0],
          baseFret: 1,
          barres: []
        }
      ],
      songStructure: {
        intro: "Em7 - G - D - A7sus4",
        verse: "Em7 - G - D - A7sus4 (4x)",
        chorus: "C - D - Em7 (2x) - G - A7sus4",
        bridge: "D - A7sus4 - Em7 - G",
        outro: "Em7 - G - D - A7sus4 (fade out)"
      },
      recommendedVideos: {
        tutorial: "https://www.youtube.com/watch?v=k-HdGnzYdFQ",
        playAlong: "https://www.youtube.com/watch?v=bx1Bh8ZvH84",
        tabPlayback: "https://www.youtube.com/watch?v=DtsqLt6rjno"
      },
      songsterr: "https://www.songsterr.com/a/wsa/oasis-wonderwall-tab-s237t1",
      scales: [
        {
          name: "E Dorian",
          description: "Perfect for solos over the chord progression",
          positions: [
            [1, "0", "2", "4", "5", "7", "9", "10", "12"],
            [2, "0", "2", "3", "5", "7", "9", "10", "12"],
            [3, "0", "2", "4", "6", "7", "9", "11", "12"],
            [4, "0", "2", "4", "5", "7", "9", "10", "12"],
            [5, "0", "2", "3", "5", "7", "9", "10", "12"],
            [6, "0", "2", "4", "5", "7", "9", "10", "12"]
          ]
        }
      ],
      learningPath: {
        beginner: [
          "Focus on the basic chord shapes and transitions",
          "Practice the signature strumming pattern slowly",
          "Learn the verse section first at 60% tempo"
        ],
        intermediate: [
          "Add the full strumming pattern with proper dynamics",
          "Practice chord transitions without looking at your hands",
          "Learn the fills between chord changes"
        ],
        advanced: [
          "Add percussive elements to your strumming",
          "Incorporate vocals while playing",
          "Learn to play the lead parts over the rhythm"
        ]
      },
      technicalNotes: [
        "Focus on muting unused strings for clean chord transitions",
        "The distinctive strumming pattern is critical to the song's sound",
        "Keep your wrist loose for the quick strumming sections",
        "Pay attention to the rhythmic accents in the chorus"
      ]
    });
  }
  
  // Generic response for any other song
  return JSON.stringify({
    songInfo: {
      key: "A minor",
      tempo: "120 BPM",
      timeSignature: "4/4",
      difficulty: "Intermediate",
      genre: "Rock"
    },
    chords: [
      {
        name: "Am",
        positions: [
          [1, "x"],
          [2, "0"],
          [3, "2"],
          [4, "2"],
          [5, "1"],
          [6, "0"]
        ],
        fingerings: [0, 0, 2, 3, 1, 0],
        baseFret: 1,
        barres: []
      },
      {
        name: "G",
        positions: [
          [1, "3"],
          [2, "0"],
          [3, "0"],
          [4, "0"],
          [5, "2"],
          [6, "3"]
        ],
        fingerings: [3, 0, 0, 0, 1, 2],
        baseFret: 1,
        barres: []
      },
      {
        name: "F",
        positions: [
          [1, "1"],
          [2, "1"],
          [3, "2"],
          [4, "3"],
          [5, "3"],
          [6, "1"]
        ],
        fingerings: [1, 1, 2, 3, 4, 1],
        baseFret: 1,
        barres: [{ fret: 1, strings: [1, 6] }]
      },
      {
        name: "C",
        positions: [
          [1, "0"],
          [2, "1"],
          [3, "0"],
          [4, "2"],
          [5, "3"],
          [6, "x"]
        ],
        fingerings: [0, 1, 0, 2, 3, 0],
        baseFret: 1,
        barres: []
      }
    ],
    songStructure: {
      intro: "Am - G - F - C (2x)",
      verse: "Am - G - F - C (4x)",
      chorus: "F - C - G - Am (2x)",
      bridge: "C - G - Am - F",
      outro: "Am - G - F - C (fade out)"
    },
    recommendedVideos: {
      tutorial: "https://www.youtube.com/watch?v=example1",
      playAlong: "https://www.youtube.com/watch?v=example2",
      tabPlayback: "https://www.youtube.com/watch?v=example3"
    },
    songsterr: "",
    scales: [
      {
        name: "A Minor Pentatonic",
        description: "Perfect for solos and improvisation",
        positions: [
          [1, "5", "8"],
          [2, "5", "8"],
          [3, "5", "7"],
          [4, "5", "7"],
          [5, "5", "8"],
          [6, "5", "8"]
        ]
      }
    ],
    learningPath: {
      beginner: [
        "Practice basic chord shapes and transitions slowly",
        "Focus on simple down strumming",
        "Learn the verse section first at 60% tempo"
      ],
      intermediate: [
        "Add the full strumming pattern with proper dynamics",
        "Practice chord transitions at 80% tempo",
        "Learn the bridge section with attention to detail"
      ],
      advanced: [
        "Add embellishments and fills",
        "Incorporate full dynamics and expression",
        "Master all song sections at full tempo"
      ]
    },
    technicalNotes: [
      "Focus on smooth transitions between Am and G chords",
      "Practice the arpeggiated picking pattern in the intro",
      "The F barre chord may be challenging - use a Fmaj7 as an alternative",
      "Pay attention to dynamics in the chorus"
    ]
  });
}

// For easier testing during development
export async function mockAnalyzeSong(songTitle) {
  try {
    const { searchQuery } = formatSongSearch(songTitle);
    const searchResults = await mockWebSearch(searchQuery);
    const aiResponse = await mockAiAnalysis(songTitle, searchResults);
    const parsedData = parseSongAnalysis(aiResponse);
    
    return {
      success: true,
      data: parsedData
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
} 