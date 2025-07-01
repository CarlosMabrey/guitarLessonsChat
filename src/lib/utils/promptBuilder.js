/**
 * Prompt builder utility for the Guitar Coach AI
 * Creates a tiered system prompt that optimizes token usage
 * while preserving essential teaching functionality
 */

// Core tier - always included in every prompt
const CORE_TIER = `You are a helpful, friendly guitar teacher AI. Focus on practical, adaptive instruction that fits the user's skill level, genre, and goals. Respond with clear formatting, visuals, and brief explanations.

## Guidelines

### Teaching Style
- Adaptive: Fit user's level and interests
- Practical: Prioritize musical examples
- Encouraging: Positive tone with tips
- Structured: Clear and concise

### Visual Formats

Use fenced code blocks for diagrams:

\`\`\`chord
{ "name": "C", "frets": ["x","3","2","0","1","0"] }
\`\`\`

\`\`\`scale
{ "name": "C Major", "frets": ["x","3","5","5","5","3","3"] }
\`\`\`

\`\`\`tab
e|--0-1-3--|
\`\`\`

\`\`\`fretboard
{ "notes": [ { "string": 1, "frets": [1, 3] } ] }
\`\`\`

### Chords
For every chord you mention, provide a full chord diagram using a chord ... code block. 

### Grouped Chord Sets
- When presenting multiple chords (e.g., “5 open chords”), output all chord diagrams together, **one after another with no text in between**.
- Place any descriptive text, tips, or summaries **before or after** the group of chord diagrams, not between them.
- Example:

Here are five open chords for beginners:

\`\`\`chord
{ "name": "C Major", "frets": ["x","3","2","0","1","0"] }
\`\`\`
\`\`\`chord
{ "name": "G Major", "frets": ["3","2","0","0","0","3"] }
\`\`\`
\`\`\`chord
{ "name": "D Major", "frets": ["x","x","0","2","3","2"] }
\`\`\`
\`\`\`chord
{ "name": "A Minor", "frets": ["x","0","2","2","1","0"] }
\`\`\`
\`\`\`chord
{ "name": "E Minor", "frets": ["0","2","2","0","0","0"] }
\`\`\`

After the diagrams, provide a summary.

### Response Structure (per concept)
- Name + brief theory
- Visual (use correct block)
- Playing tips
- Musical context
- Short practice drill

### Style Rules
- Highlight: \`chords\`, \`scales\`, \`techniques\`, \`progressions\`
- Lists: Use bullets
- Avoid filler, focus on clarity
- Include 1+ visual per concept
`;


/**
 * Builds the user profile section of the prompt
 * Only includes fields that have actual values
 * @param {Object} userProfile - The user profile object
 * @returns {String} Formatted user profile context
 */
function buildUserProfileContext(userProfile) {
  if (!userProfile) return '';
  
  // Create an array of profile fields that have values
  const profileLines = [];
  
  // Only add fields that have values and are not "Not specified"
  if (userProfile.name && userProfile.name !== 'Not specified') {
    profileLines.push(`- Name: ${userProfile.name}`);
  }
  
  if (userProfile.skillLevel) {
    const formattedSkillLevel = userProfile.skillLevel.charAt(0).toUpperCase() + userProfile.skillLevel.slice(1);
    profileLines.push(`- Skill Level: ${formattedSkillLevel}`);
  }
  
  if (userProfile.playingStyle?.length) {
    const styles = Array.isArray(userProfile.playingStyle) ? 
      userProfile.playingStyle.join(', ') : userProfile.playingStyle;
    profileLines.push(`- Playing Style: ${styles}`);
  }
  
  if (userProfile.genres?.length) {
    profileLines.push(`- Preferred Genres: ${userProfile.genres.join(', ')}`);
  }
  
  if (userProfile.learningFocus) {
    const formattedFocus = userProfile.learningFocus.charAt(0).toUpperCase() + userProfile.learningFocus.slice(1);
    profileLines.push(`- Learning Focus: ${formattedFocus}`);
  }
  
  if (userProfile.guitarType) {
    const formattedType = userProfile.guitarType.charAt(0).toUpperCase() + userProfile.guitarType.slice(1);
    profileLines.push(`- Guitar Type: ${formattedType}`);
  }
  
  if (userProfile.tuning) {
    profileLines.push(`- Tuning: ${userProfile.tuning}`);
  }
  
  if (userProfile.practiceFrequency) {
    profileLines.push(`- Practice Frequency: ${userProfile.practiceFrequency}`);
  }
  
  if (userProfile.goals?.length) {
    profileLines.push(`- Goals: ${userProfile.goals.join(', ')}`);
  }
  
  if (userProfile.favoriteChords?.length) {
    profileLines.push(`- Favorite Chords: ${userProfile.favoriteChords.join(', ')}`);
  }
  
  if (userProfile.favoriteSongs?.length) {
    profileLines.push(`- Favorite Songs: ${userProfile.favoriteSongs.join(', ')}`);
  }
  
  // Only return the section if there are actual profile lines
  if (profileLines.length > 0) {
    return `\n\n### User Profile Context:\n${profileLines.join('\n')}`;
  }
  
  return '';
}

/**
 * Builds teaching instructions based on user profile
 * @param {Object} userProfile - The user profile object
 * @returns {String} Formatted teaching instructions
 */
function buildTeachingInstructions(userProfile) {
  if (!userProfile) return '';
  
  const instructions = [];
  
  // Only add instructions that are relevant based on profile data
  if (userProfile.skillLevel) {
    instructions.push(`- Adapt your teaching to the user's skill level (${userProfile.skillLevel})`);
  }
  
  if (userProfile.playingStyle?.length) {
    const styles = Array.isArray(userProfile.playingStyle) ? 
      userProfile.playingStyle.join(', ') : userProfile.playingStyle;
    instructions.push(`- Focus on techniques relevant to: ${styles}`);
  }
  
  if (userProfile.genres?.length) {
    instructions.push(`- Reference songs and artists from these genres when helpful: ${userProfile.genres.join(', ')}`);
  }
  
  if (userProfile.learningFocus) {
    instructions.push(`- Prioritize teaching concepts related to: ${userProfile.learningFocus}`);
  }
  
  // Always include these general instructions
  instructions.push(`- Keep responses concise and focused on practical guitar playing`);
  
  // Add practice duration if available, otherwise use default
  const duration = userProfile.practiceDuration || 30;
  instructions.push(`- When suggesting practice routines, aim for around ${duration} minutes per session`);
  
  if (userProfile.practiceFrequency) {
    instructions.push(`- The user practices ${userProfile.practiceFrequency}, so adjust practice recommendations accordingly`);
  }
  
  // Only return the section if there are actual instructions
  if (instructions.length > 0) {
    return `\n\n### Teaching Instructions:\n${instructions.join('\n')}`;
  }
  
  return '';
}

/**
 * Builds the complete system prompt using a tiered approach
 * @param {Object} userProfile - User profile object
 * @param {String} context - Additional context like relevant knowledge base items
 * @returns {Object} System message object for OpenAI API
 */
function buildPrompt(userProfile, context = '') {
  // Start with the core tier
  let promptContent = CORE_TIER;
  
  // Add the dynamic tier if user profile exists
  if (userProfile) {
    // Add user profile context if available
    const profileContext = buildUserProfileContext(userProfile);
    if (profileContext) {
      promptContent += profileContext;
    }
    
    // Add teaching instructions if available
    const teachingInstructions = buildTeachingInstructions(userProfile);
    if (teachingInstructions) {
      promptContent += teachingInstructions;
    }
  }
  
  // Add any additional context like knowledge base items
  if (context) {
    promptContent += `\n\nNow, here's some specific information to help you assist the user:\n\n${context}`;
  }
  
  // Return the formatted system message
  return {
    role: 'system',
    content: promptContent
  };
}

module.exports = {
  buildPrompt,
  CORE_TIER
};
