/**
 * Tests for the PromptBuilder utility
 * These tests verify that the prompt builder correctly handles different user profiles
 * and generates efficient tiered prompts
 */

const { buildPrompt, CORE_TIER } = require('./promptBuilder');

describe('PromptBuilder', () => {
  // Test that the core tier is always included
  test('should always include the core tier', () => {
    const result = buildPrompt();
    expect(result.role).toBe('system');
    expect(result.content).toContain('You are a friendly and knowledgeable guitar teacher AI');
    expect(result.content).toContain('CHORD DIAGRAM');
    expect(result.content).toContain('SCALE DIAGRAM');
    expect(result.content).toContain('GUITAR TAB');
    expect(result.content).toContain('FRETBOARD VISUALIZATION');
  });

  // Test with an empty user profile
  test('should handle empty user profile gracefully', () => {
    const emptyProfile = {};
    const result = buildPrompt(emptyProfile);
    
    // Should only contain core tier, not dynamic user profile context
    expect(result.content).not.toContain('User Profile Context');
    
    // Should contain essential teaching elements from CORE_TIER
    expect(result.content).toContain('You are a friendly and knowledgeable guitar teacher AI');
    expect(result.content).toContain('CHORD DIAGRAM');
    expect(result.content).toContain('SCALE DIAGRAM');
    expect(result.content).toContain('GUITAR TAB');
    expect(result.content).toContain('Teaching Instructions');
    
    // Should not include any user-specific information
    expect(result.content).not.toContain('Name:');
    expect(result.content).not.toContain('Skill Level:');
    expect(result.content).not.toContain('Playing Style:');
  });

  // Test with a complete user profile
  test('should include all relevant user profile fields', () => {
    const completeProfile = {
      name: 'John Doe',
      skillLevel: 'intermediate',
      playingStyle: ['fingerpicking', 'strumming'],
      genres: ['rock', 'blues'],
      learningFocus: 'chord progressions',
      guitarType: 'acoustic',
      tuning: 'standard',
      practiceFrequency: '3 times per week',
      practiceDuration: 45,
      goals: ['learn barre chords', 'improve timing'],
      favoriteChords: ['G', 'C', 'D'],
      favoriteSongs: ['Blackbird', 'Wonderwall']
    };
    
    const result = buildPrompt(completeProfile);
    
    // Should include user profile context and all fields
    expect(result.content).toContain('User Profile Context');
    expect(result.content).toContain('John Doe');
    expect(result.content).toContain('Intermediate');
    expect(result.content).toContain('fingerpicking, strumming');
    expect(result.content).toContain('rock, blues');
    expect(result.content).toContain('chord progressions');
    expect(result.content).toContain('Acoustic');
    expect(result.content).toContain('standard');
    expect(result.content).toContain('3 times per week');
    expect(result.content).toContain('learn barre chords, improve timing');
    expect(result.content).toContain('G, C, D');
    expect(result.content).toContain('Blackbird, Wonderwall');
    
    // Should also include teaching instructions
    expect(result.content).toContain('Teaching Instructions');
    expect(result.content).toContain('aim for around 45 minutes per session');
  });
  
  // Test with a partial user profile (some fields missing)
  test('should only include non-empty profile fields', () => {
    const partialProfile = {
      skillLevel: 'beginner',
      genres: ['folk'],
      tuning: 'Drop D',
      // Other fields intentionally missing
    };
    
    const result = buildPrompt(partialProfile);
    
    // Should include available fields
    expect(result.content).toContain('Beginner');
    expect(result.content).toContain('folk');
    expect(result.content).toContain('Drop D');
    
    // Should exclude empty fields
    expect(result.content).not.toContain('Name:');
    expect(result.content).not.toContain('Playing Style:');
    expect(result.content).not.toContain('Favorite Chords:');
  });
  
  // Test with additional context
  test('should include additional context when provided', () => {
    const contextText = 'This is some additional context about the guitar lesson.';
    const result = buildPrompt(null, contextText);
    
    // Should include the additional context
    expect(result.content).toContain(contextText);
  });
  
  // Token efficiency test - comparing with same profile but with "Not specified" values
  test('should be more token-efficient than including empty fields', () => {
    const profile = {
      name: 'Jane Smith',
      skillLevel: 'advanced',
      genres: ['jazz', 'fusion']
    };
    
    // The optimized version excludes empty fields
    const optimizedPrompt = buildPrompt(profile);
    
    // Create a version with the same core content but adding "Not specified" for missing fields
    // This simulates what the old approach would have included
    const withEmptyFields = buildPrompt({
      ...profile,
      playingStyle: 'Not specified',
      learningFocus: 'Not specified',
      guitarType: 'Not specified',
      tuning: 'Not specified',
      practiceFrequency: 'Not specified',
      practiceDuration: 'Not specified',
      goals: ['None specified'],
      favoriteChords: ['None specified'],
      favoriteSongs: ['None specified']
    });
    
    // Token estimation (rough approximation: characters / 4)
    const optimizedTokens = optimizedPrompt.content.length / 4;
    const withEmptyFieldsTokens = withEmptyFields.content.length / 4;
    
    // Optimized should use fewer tokens than including empty fields
    expect(optimizedTokens).toBeLessThan(withEmptyFieldsTokens);
    console.log(`Token savings: ${Math.round(withEmptyFieldsTokens - optimizedTokens)} tokens`);
  });
});
