/**
 * Utility functions for formatting chat data
 */

/**
 * Format chat date for display in the sidebar
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatChatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

/**
 * Suggested prompts to show when chat is empty
 */
export const SUGGESTED_PROMPTS = [
  {
    title: "Song Analysis",
    description: "Break down chords, structure, and techniques",
    icon: "🎸",
    prompt: "Can you analyze the chord progression and structure of this song?"
  },
  {
    title: "Strumming Patterns",
    description: "Learn different ways to strum",
    icon: "🎵",
    prompt: "Can you explain the strumming pattern for this song?"
  },
  {
    title: "Music Theory",
    description: "Understand the theory behind the music",
    icon: "🎼",
    prompt: "What music theory concepts are used in this song?"
  }
];
