/**
 * Demo tabs for the unified tab test page
 */

const demoTabs = [
  {
    id: 'sweet-child-o-mine',
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    data: {
      title: "Sweet Child O' Mine",
      artist: "Guns N' Roses",
      tuning: "Standard",
      measures: 12,
      notes: [
        // Intro - First measure
        { string: 1, fret: 12, position: 0, duration: 1, measure: 0 },
        { string: 1, fret: 15, position: 1, duration: 1, measure: 0 },
        { string: 1, fret: 12, position: 2, duration: 1, measure: 0 },
        { string: 1, fret: 15, position: 3, duration: 1, measure: 0 },
        { string: 2, fret: 15, position: 4, duration: 1, measure: 0 },
        { string: 2, fret: 17, position: 5, duration: 1, measure: 0 },
        { string: 2, fret: 15, position: 6, duration: 1, measure: 0 },
        { string: 2, fret: 17, position: 7, duration: 1, measure: 0 },
        
        // Second measure
        { string: 3, fret: 14, position: 8, duration: 1, measure: 1 },
        { string: 3, fret: 16, position: 9, duration: 1, measure: 1 },
        { string: 3, fret: 14, position: 10, duration: 1, measure: 1 },
        { string: 3, fret: 16, position: 11, duration: 1, measure: 1 },
        { string: 1, fret: 12, position: 12, duration: 1, measure: 1 },
        { string: 1, fret: 15, position: 13, duration: 1, measure: 1 },
        { string: 1, fret: 12, position: 14, duration: 1, measure: 1 },
        { string: 1, fret: 15, position: 15, duration: 1, measure: 1 },
        
        // Third measure - Repeat with variation
        { string: 2, fret: 15, position: 16, duration: 1, measure: 2 },
        { string: 2, fret: 17, position: 17, duration: 1, measure: 2 },
        { string: 2, fret: 15, position: 18, duration: 1, measure: 2 },
        { string: 2, fret: 17, position: 19, duration: 1, measure: 2 },
        { string: 3, fret: 14, position: 20, duration: 1, measure: 2 },
        { string: 3, fret: 16, position: 21, duration: 1, measure: 2 },
        { string: 3, fret: 14, position: 22, duration: 1, measure: 2 },
        { string: 3, fret: 16, position: 23, duration: 1, measure: 2 },
        
        // Fourth measure - Main riff ending
        { string: 1, fret: 12, position: 24, duration: 1, measure: 3 },
        { string: 1, fret: 15, position: 25, duration: 1, measure: 3 },
        { string: 1, fret: 12, position: 26, duration: 1, measure: 3 },
        { string: 1, fret: 15, position: 27, duration: 1, measure: 3 },
        { string: 2, fret: 15, position: 28, duration: 1, measure: 3 },
        { string: 2, fret: 17, position: 29, duration: 1, measure: 3 },
        { string: 2, fret: 15, position: 30, duration: 1, measure: 3 },
        { string: 2, fret: 17, position: 31, duration: 1, measure: 3 },
        
        // Fifth measure - Verse
        { string: 3, fret: 14, position: 32, duration: 2, measure: 4 },
        { string: 3, fret: 16, position: 34, duration: 2, measure: 4 },
        { string: 1, fret: 12, position: 36, duration: 2, measure: 4 },
        { string: 1, fret: 15, position: 38, duration: 2, measure: 4 },
        
        // Sixth measure - Chorus
        { string: 2, fret: 15, position: 40, duration: 1, measure: 5 },
        { string: 2, fret: 17, position: 41, duration: 1, measure: 5 },
        { string: 3, fret: 14, position: 42, duration: 1, measure: 5 },
        { string: 3, fret: 16, position: 43, duration: 1, measure: 5 },
        { string: 1, fret: 12, position: 44, duration: 1, measure: 5 },
        { string: 1, fret: 15, position: 45, duration: 1, measure: 5 },
        { string: 2, fret: 15, position: 46, duration: 1, measure: 5 },
        { string: 2, fret: 17, position: 47, duration: 1, measure: 5 },
      ],
      rawTab: `
        e|-------------------------------------------------------------------------
        B|-------------------------------------------------------------------------
        G|-------------------------------------------------------------------------
        D|-----------------------------------------14--12--14---------------------\
        A|-------------------------------------------------------------------------\
        E|-------------------------------------------------------------------------\

        e|-------------------------------------------------------------------------
        B|-------------------------------------------------------------------------
        G|-------------------------------------------------------------------------
        D|-----------------------------------------14--12--14---------------------/
        A|-------------------------------------------------------------------------/
        E|-------------------------------------------------------------------------/`
    }
  },
  {
    id: 'seven-nation-army',
    title: 'Seven Nation Army',
    artist: 'The White Stripes',
    data: {
      title: 'Seven Nation Army',
      artist: 'The White Stripes',
      tuning: 'Standard',
      measures: 8,
      notes: [
        // Main riff
        { string: 5, fret: 7, position: 0, duration: 2, measure: 0 },
        { string: 5, fret: 7, position: 2, duration: 2, measure: 0 },
        { string: 5, fret: 10, position: 4, duration: 2, measure: 1 },
        { string: 5, fret: 7, position: 6, duration: 2, measure: 1 },
        { string: 5, fret: 5, position: 8, duration: 2, measure: 2 },
        { string: 5, fret: 5, position: 10, duration: 2, measure: 2 },
        { string: 5, fret: 3, position: 12, duration: 2, measure: 3 },
        { string: 5, fret: 3, position: 14, duration: 2, measure: 3 },
        
        // Second part of riff
        { string: 5, fret: 10, position: 16, duration: 2, measure: 4 },
        { string: 5, fret: 10, position: 18, duration: 2, measure: 4 },
        { string: 5, fret: 9, position: 20, duration: 2, measure: 5 },
        { string: 5, fret: 7, position: 22, duration: 2, measure: 5 },
        { string: 5, fret: 7, position: 24, duration: 2, measure: 6 },
        { string: 5, fret: 5, position: 26, duration: 2, measure: 6 },
        { string: 5, fret: 5, position: 28, duration: 2, measure: 7 },
        { string: 5, fret: 3, position: 30, duration: 2, measure: 7 },
      ],
      rawTab: `
        e|-----------------|
        B|-----------------|
        G|-----------------|
        D|-----------------|
        A|--7-7-10-7-5-5-3-|
        E|-----------------|`
    }
  },
  {
    id: 'sunshine-of-your-love',
    title: 'Sunshine of Your Love',
    artist: 'Cream',
    data: {
      title: 'Sunshine of Your Love',
      artist: 'Cream',
      tuning: 'Standard',
      measures: 8,
      notes: [
        // Main riff
        { string: 6, fret: 0, position: 0, duration: 1, measure: 0 },
        { string: 5, fret: 2, position: 1, duration: 1, measure: 0 },
        { string: 4, fret: 2, position: 2, duration: 1, measure: 0 },
        { string: 5, fret: 0, position: 3, duration: 1, measure: 0 },
        { string: 6, fret: 0, position: 4, duration: 1, measure: 0 },
        { string: 5, fret: 2, position: 5, duration: 1, measure: 0 },
        { string: 4, fret: 2, position: 6, duration: 1, measure: 0 },
        { string: 5, fret: 0, position: 7, duration: 1, measure: 0 },
        
        // Variation
        { string: 6, fret: 0, position: 8, duration: 1, measure: 1 },
        { string: 5, fret: 2, position: 9, duration: 1, measure: 1 },
        { string: 4, fret: 2, position: 10, duration: 1, measure: 1 },
        { string: 5, fret: 0, position: 11, duration: 1, measure: 1 },
        { string: 6, fret: 0, position: 12, duration: 1, measure: 1 },
        { string: 5, fret: 2, position: 13, duration: 1, measure: 1 },
        { string: 4, fret: 2, position: 14, duration: 1, measure: 1 },
        { string: 5, fret: 0, position: 15, duration: 1, measure: 1 },
      ],
      rawTab: `
        e|-----------------|
        B|-----------------|
        G|-----------------|
        D|--2-2-0-2-2-2-0-2-|
        A|--0-0-0-0-0-0-0-0-|
        E|-----------------|`
    }
  }
];

export default demoTabs;
