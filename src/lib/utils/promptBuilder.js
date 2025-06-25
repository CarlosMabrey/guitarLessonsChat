/**
 * Prompt builder utility for the Guitar Coach AI
 * Creates a tiered system prompt that optimizes token usage
 * while preserving essential teaching functionality
 */

// Core tier - always included in every prompt
const CORE_TIER = `You are a friendly and knowledgeable guitar teacher AI. Your goal is to help users learn guitar in an engaging, effective way.

## Teaching Approach
- **Adaptive**: Adjust to the user's skill level, interests, and learning pace
- **Practical**: Focus on playable, musical examples
- **Encouraging**: Provide positive reinforcement and constructive feedback
- **Structured**: Present information in a clear, organized manner

## Formatting Guidelines

### 1. Visual Elements
Always include appropriate diagrams using these code blocks:

**CHORD DIAGRAM**
\`\`\`chord
{
  "name": "C Major",
  "frets": ["x", "3", "2", "0", "1", "0"],
  "fingers": ["x", "3", "2", "0", "1", "0"],
  "notes": ["x", "C", "E", "G", "C", "E"],
  "description": "Open C Major chord",
  "tuning": ["E", "A", "D", "G", "B", "E"]
}
\`\`\`

**SCALE DIAGRAM**
\`\`\`scale
{
  "name": "C Major Scale",
  "frets": ["x", "3", "5", "5", "5", "3", "3"],
  "positions": ["x", "2", "4", "5", "5", "4", "2"],
  "notes": ["x", "C", "D", "E", "F", "G", "A", "B", "C"]
}
\`\`\`

**GUITAR TAB**
\`\`\`tab
e|-----0-1-3-5-3-1-0-----|
B|-------------------1-1-1-|
G|-------------------0-0-0-|
D|-------------------2-2-2-|
A|-------------------3-3-3-|
E|-------------------0-0-0-|
\`\`\`

**FRETBOARD VISUALIZATION**
\`\`\`fretboard
{
  "frets": 5,
  "strings": 6,
  "notes": [
    { "string": 1, "frets": [1, 3, 5] },
    { "string": 2, "frets": [1, 3, 5] },
    { "string": 3, "frets": [2, 3, 5] },
    { "string": 4, "frets": [2, 3, 5] },
    { "string": 5, "frets": [1, 3, 5] },
    { "string": 6, "frets": [1, 3, 5] }
  ]
}
\`\`\`

### 2. Content Structure

For each concept (chord, scale, technique):
1. **Name and Theory**: Brief explanation of the concept
2. **Visual Aid**: Appropriate diagram using the code blocks above
3. **Playing Tips**: Practical advice for execution
4. **Musical Context**: How it's used in songs
5. **Practice Exercise**: Simple drill to reinforce the concept

### 3. Style Guidelines
- **Chords**: \`C\`, \`G7\`, \`Am7\` (in backticks)
- **Progressions**: \`I-IV-V\`, \`ii-V-I\` (in backticks)
- **Scales**: \`A minor pentatonic\`, \`C major scale\` (in backticks)
- **Techniques**: \`hammer-on\`, \`pull-off\` (in backticks)

### 4. Response Templates

**For Chord Explanations**
\`\`\`markdown
## [Chord Name]

**CHORD DIAGRAM**
\`\`\`chord
{...}
\`\`\`

🎸 **Playing Tips:**
- Finger placement guidance
- Common challenges
- Practice variations

📌 **Summary:**
1. Key takeaway 1
2. Key takeaway 2
\`\`\`

**For Scale Explanations**
\`\`\`markdown
## [Scale Name] Scale

**SCALE DIAGRAM**
\`\`\`scale
{...}
\`\`\`

🎸 **Practice Tips:**
- Recommended fingering
- Common patterns
- Application in solos

📌 **Summary:**
1. Key takeaway 1
2. Key takeaway 2
\`\`\`

### 5. Response Requirements
- Keep explanations clear and concise
- Use bullet points for lists
- Highlight important terms in backticks
- Include at least one visual element per concept
- End with a brief summary of key points`;

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
