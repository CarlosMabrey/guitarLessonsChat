/**
 * Music Parser tests
 * Tests for the song query analyzer functionality
 */

// Import the function to test
import { analyzeSongQuery } from '../src/lib/musicDiscoveryApi';

describe('Song Query Analyzer', () => {
  // Test artist - song format (preferred)
  test('should handle "artist - song" format correctly', () => {
    const result = analyzeSongQuery('Oasis - Wonderwall');
    expect(result.artist).toBe('Oasis');
    expect(result.title).toBe('Wonderwall');
    expect(result.detectedFormat).toBe('artist-song');
  });

  // Test song - artist format 
  test('should handle "song - artist" format correctly', () => {
    const result = analyzeSongQuery('Wonderwall - Oasis');
    // The analyzer should be smart enough to detect this is song - artist
    // because "Wonderwall" doesn't contain multiple words like most artists
    expect(result.artist).toBe('Oasis');
    expect(result.title).toBe('Wonderwall');
    expect(result.detectedFormat).toBe('song-artist');
  });

  // Test song with keywords that strongly suggest it's a song title
  test('should recognize song title keywords', () => {
    const result = analyzeSongQuery('Wonderwall acoustic - Oasis');
    expect(result.artist).toBe('Oasis');
    expect(result.title).toBe('Wonderwall acoustic');
    expect(result.detectedFormat).toBe('song-artist');
  });

  // Test with keywords indicating song sections
  test('should recognize song parts', () => {
    const result = analyzeSongQuery('Sweet Child O Mine solo - Guns N Roses');
    expect(result.artist).toBe('Guns N Roses');
    expect(result.title).toBe('Sweet Child O Mine solo');
    expect(result.detectedFormat).toBe('song-artist');
  });

  // Test without separator
  test('should handle input without separator', () => {
    const result = analyzeSongQuery('Stairway to Heaven');
    expect(result.artist).toBe('Unknown Artist'); 
    expect(result.title).toBe('Stairway to Heaven');
  });

  // Test with boundary word
  test('should detect artist boundary words', () => {
    const result = analyzeSongQuery('Led Zeppelin by Jimmy Page');
    expect(result.artist).toBe('Led Zeppelin');
    expect(result.title).toBe('Jimmy Page');
  });

  // Test with multiple separators
  test('should handle multiple separators', () => {
    const result = analyzeSongQuery('Pink Floyd - Dark Side - Full Album');
    // This should default to artist - song format for the first split
    expect(result.artist).toBe('Pink Floyd');
    expect(result.title).toBe('Dark Side - Full Album');
  });
});
