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
        { string: 1, fret: 15, position: 28, duration: 2, measure: 3 },
        { string: 1, fret: 12, position: 30, duration: 2, measure: 3 },
      ],
      source: {
        type: 'ultimate-guitar',
        format: 'tabs',
        url: 'https://tabs.ultimate-guitar.com/tab/guns-n-roses/sweet-child-o-mine-tabs-12657',
        rawContent: `e|-------------------------------------------------------------------------
B|---------------------15b17--15b17--15b17--15b17--15b17--15--------------
G|---14b16--14b16--14b16----------------------------------------------14---
D|-------------------------------------------------------------------------
A|-------------------------------------------------------------------------
E|-------------------------------------------------------------------------

e|-------------------------------------------------------------------------
B|---------------------15b17--15b17--15b17--15b17--15b17--15--------------
G|---14b16--14b16--14b16----------------------------------------------14---
D|-------------------------------------------------------------------------
A|-------------------------------------------------------------------------
E|-------------------------------------------------------------------------

e|-------------------------------------------------------------------------
B|---------------------15b17--15b17--15b17--15b17--15b17--15--------------
G|---14b16--14b16--14b16----------------------------------------------14---
D|-------------------------------------------------------------------------
A|-------------------------------------------------------------------------
E|-------------------------------------------------------------------------

e|-------------------------------------------------------------------------
B|--15-----------------------15--15---15-----------------------------------
G|------14--12-14--12-14---------14---14-------------14--12--14p12--------
D|-----------------------------------------14--12--14---------------------
A|-------------------------------------------------------------------------
E|-------------------------------------------------------------------------

e|-------------------------------------------------------------------------
B|--15-----------------------15--15---15-----------------------------------
G|------14--12-14--12-14---------14---14-------------14--12--14p12--------
D|-----------------------------------------14--12--14---------------------
A|-------------------------------------------------------------------------
E|-------------------------------------------------------------------------

e|-------------------------------------------------------------------------
B|--15-----------------------15--15---15-----------------------------------
G|------14--12-14--12-14---------14---14-------------14--12--14p12--------
D|-----------------------------------------14--12--14---------------------
A|-------------------------------------------------------------------------
E|-------------------------------------------------------------------------`
      }
    }
  },
  {
    id: 'smoke-on-the-water',
    title: 'Smoke on the Water',
    artist: 'Deep Purple',
    data: {
      title: 'Smoke on the Water',
      artist: 'Deep Purple',
      tuning: 'Standard',
      measures: 4,
      notes: [
        // First measure - Main riff
        { string: 3, fret: 0, position: 0, duration: 1, measure: 0 },
        { string: 3, fret: 3, position: 1, duration: 1, measure: 0 },
        { string: 3, fret: 5, position: 2, duration: 1, measure: 0 },
        { string: 3, fret: 0, position: 4, duration: 1, measure: 0 },
        { string: 3, fret: 3, position: 5, duration: 1, measure: 0 },
        { string: 3, fret: 6, position: 6, duration: 1, measure: 0 },
        { string: 3, fret: 5, position: 7, duration: 1, measure: 0 },
        
        // Second measure - Repeat
        { string: 3, fret: 0, position: 8, duration: 1, measure: 1 },
        { string: 3, fret: 3, position: 9, duration: 1, measure: 1 },
        { string: 3, fret: 5, position: 10, duration: 1, measure: 1 },
        { string: 3, fret: 3, position: 12, duration: 1, measure: 1 },
        { string: 3, fret: 0, position: 13, duration: 1, measure: 1 },
        
        // Third measure - Variation
        { string: 3, fret: 0, position: 16, duration: 1, measure: 2 },
        { string: 3, fret: 3, position: 17, duration: 1, measure: 2 },
        { string: 3, fret: 5, position: 18, duration: 1, measure: 2 },
        { string: 3, fret: 0, position: 20, duration: 1, measure: 2 },
        { string: 3, fret: 3, position: 21, duration: 1, measure: 2 },
        
        // Fourth measure - Ending
        { string: 3, fret: 0, position: 24, duration: 1, measure: 3 },
        { string: 3, fret: 3, position: 25, duration: 1, measure: 3 },
        { string: 3, fret: 5, position: 26, duration: 1, measure: 3 },
        { string: 3, fret: 0, position: 28, duration: 2, measure: 3 },
      ],
      source: {
        type: 'demo',
        format: 'internal'
      }
    }
  },
  {
    id: 'iron-man',
    title: 'Iron Man',
    artist: 'Black Sabbath',
    data: {
      title: 'Iron Man',
      artist: 'Black Sabbath',
      tuning: 'Standard',
      measures: 4,
      notes: [
        // Main riff
        { string: 4, fret: 7, position: 0, duration: 2, measure: 0 },
        { string: 4, fret: 9, position: 2, duration: 1, measure: 0 },
        { string: 4, fret: 10, position: 3, duration: 1, measure: 0 },
        { string: 4, fret: 7, position: 4, duration: 2, measure: 0 },
        { string: 4, fret: 5, position: 6, duration: 1, measure: 0 },
        { string: 4, fret: 3, position: 7, duration: 1, measure: 0 },
        
        // Second measure
        { string: 4, fret: 0, position: 8, duration: 1, measure: 1 },
        { string: 3, fret: 0, position: 9, duration: 1, measure: 1 },
        { string: 3, fret: 2, position: 10, duration: 1, measure: 1 },
        { string: 3, fret: 3, position: 11, duration: 1, measure: 1 },
        { string: 4, fret: 0, position: 12, duration: 1, measure: 1 },
        { string: 3, fret: 0, position: 13, duration: 1, measure: 1 },
        { string: 3, fret: 2, position: 14, duration: 1, measure: 1 },
        { string: 3, fret: 3, position: 15, duration: 1, measure: 1 },
        
        // Third measure - Repeat with variation
        { string: 4, fret: 7, position: 16, duration: 2, measure: 2 },
        { string: 4, fret: 9, position: 18, duration: 1, measure: 2 },
        { string: 4, fret: 10, position: 19, duration: 1, measure: 2 },
        { string: 4, fret: 7, position: 20, duration: 2, measure: 2 },
        { string: 4, fret: 5, position: 22, duration: 1, measure: 2 },
        { string: 4, fret: 3, position: 23, duration: 1, measure: 2 },
        
        // Fourth measure
        { string: 5, fret: 5, position: 24, duration: 2, measure: 3 },
        { string: 5, fret: 3, position: 26, duration: 2, measure: 3 },
        { string: 5, fret: 0, position: 28, duration: 2, measure: 3 },
        { string: 4, fret: 5, position: 30, duration: 2, measure: 3 },
      ],
      source: {
        type: 'demo',
        format: 'internal'
      }
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
      measures: 4,
      notes: [
        // First measure - Main riff
        { string: 4, fret: 7, position: 0, duration: 1, measure: 0 },
        { string: 4, fret: 7, position: 1, duration: 1, measure: 0 },
        { string: 4, fret: 10, position: 2, duration: 1, measure: 0 },
        { string: 4, fret: 7, position: 3, duration: 1, measure: 0 },
        { string: 4, fret: 5, position: 4, duration: 1, measure: 0 },
        { string: 4, fret: 3, position: 5, duration: 1, measure: 0 },
        { string: 4, fret: 2, position: 6, duration: 2, measure: 0 },
        
        // Second measure
        { string: 4, fret: 7, position: 8, duration: 1, measure: 1 },
        { string: 4, fret: 7, position: 9, duration: 1, measure: 1 },
        { string: 4, fret: 10, position: 10, duration: 1, measure: 1 },
        { string: 4, fret: 7, position: 11, duration: 1, measure: 1 },
        { string: 4, fret: 5, position: 12, duration: 1, measure: 1 },
        { string: 4, fret: 3, position: 13, duration: 1, measure: 1 },
        { string: 4, fret: 2, position: 14, duration: 2, measure: 1 },
        
        // Third measure - Repeat with variation
        { string: 4, fret: 7, position: 16, duration: 1, measure: 2 },
        { string: 4, fret: 7, position: 17, duration: 1, measure: 2 },
        { string: 4, fret: 10, position: 18, duration: 1, measure: 2 },
        { string: 4, fret: 7, position: 19, duration: 1, measure: 2 },
        { string: 4, fret: 12, position: 20, duration: 1, measure: 2 },
        { string: 4, fret: 10, position: 21, duration: 1, measure: 2 },
        { string: 4, fret: 7, position: 22, duration: 2, measure: 2 },
        
        // Fourth measure - Ending
        { string: 4, fret: 7, position: 24, duration: 2, measure: 3 },
        { string: 4, fret: 5, position: 26, duration: 2, measure: 3 },
        { string: 4, fret: 3, position: 28, duration: 2, measure: 3 },
        { string: 4, fret: 2, position: 30, duration: 2, measure: 3 },
      ],
      source: {
        type: 'demo',
        format: 'internal'
      }
    }
  },
  {
    id: 'enter-sandman',
    title: 'Enter Sandman',
    artist: 'Metallica',
    data: {
      title: 'Enter Sandman',
      artist: 'Metallica',
      tuning: 'Standard',
      measures: 4,
      notes: [
        // First measure - Intro
        { string: 3, fret: 0, position: 0, duration: 1, measure: 0 },
        { string: 3, fret: 0, position: 1, duration: 1, measure: 0 },
        { string: 2, fret: 0, position: 2, duration: 1, measure: 0 },
        { string: 3, fret: 0, position: 3, duration: 1, measure: 0 },
        { string: 3, fret: 0, position: 4, duration: 1, measure: 0 },
        { string: 2, fret: 0, position: 5, duration: 1, measure: 0 },
        
        // Second measure
        { string: 3, fret: 0, position: 8, duration: 1, measure: 1 },
        { string: 3, fret: 0, position: 9, duration: 1, measure: 1 },
        { string: 2, fret: 0, position: 10, duration: 1, measure: 1 },
        { string: 3, fret: 5, position: 11, duration: 1, measure: 1 },
        { string: 3, fret: 6, position: 12, duration: 1, measure: 1 },
        { string: 3, fret: 7, position: 13, duration: 1, measure: 1 },
        { string: 3, fret: 5, position: 14, duration: 1, measure: 1 },
        { string: 3, fret: 6, position: 15, duration: 1, measure: 1 },
        
        // Third measure - Main riff
        { string: 5, fret: 0, position: 16, duration: 2, measure: 2 },
        { string: 5, fret: 0, position: 18, duration: 1, measure: 2 },
        { string: 5, fret: 6, position: 19, duration: 1, measure: 2 },
        { string: 5, fret: 7, position: 20, duration: 1, measure: 2 },
        { string: 5, fret: 0, position: 21, duration: 1, measure: 2 },
        { string: 5, fret: 0, position: 22, duration: 1, measure: 2 },
        { string: 5, fret: 6, position: 23, duration: 1, measure: 2 },
        
        // Fourth measure
        { string: 5, fret: 0, position: 24, duration: 2, measure: 3 },
        { string: 5, fret: 0, position: 26, duration: 1, measure: 3 },
        { string: 5, fret: 5, position: 27, duration: 1, measure: 3 },
        { string: 5, fret: 6, position: 28, duration: 1, measure: 3 },
        { string: 5, fret: 0, position: 29, duration: 1, measure: 3 },
        { string: 5, fret: 5, position: 30, duration: 1, measure: 3 },
        { string: 5, fret: 6, position: 31, duration: 1, measure: 3 },
      ],
      source: {
        type: 'demo',
        format: 'internal'
      }
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
      measures: 4,
      notes: [
        // First measure - Main riff
        { string: 3, fret: 0, position: 0, duration: 1, measure: 0 },
        { string: 3, fret: 3, position: 1, duration: 1, measure: 0 },
        { string: 3, fret: 5, position: 2, duration: 1, measure: 0 },
        { string: 3, fret: 3, position: 3, duration: 1, measure: 0 },
        { string: 3, fret: 0, position: 4, duration: 1, measure: 0 },
        { string: 4, fret: 5, position: 5, duration: 1, measure: 0 },
        { string: 4, fret: 3, position: 6, duration: 1, measure: 0 },
        { string: 4, fret: 0, position: 7, duration: 1, measure: 0 },
        
        // Second measure
        { string: 3, fret: 0, position: 8, duration: 1, measure: 1 },
        { string: 3, fret: 3, position: 9, duration: 1, measure: 1 },
        { string: 3, fret: 5, position: 10, duration: 1, measure: 1 },
        { string: 3, fret: 3, position: 11, duration: 1, measure: 1 },
        { string: 3, fret: 0, position: 12, duration: 1, measure: 1 },
        { string: 4, fret: 5, position: 13, duration: 1, measure: 1 },
        { string: 4, fret: 3, position: 14, duration: 1, measure: 1 },
        { string: 4, fret: 0, position: 15, duration: 1, measure: 1 },
        
        // Third measure - Variation
        { string: 3, fret: 0, position: 16, duration: 1, measure: 2 },
        { string: 3, fret: 3, position: 17, duration: 1, measure: 2 },
        { string: 3, fret: 5, position: 18, duration: 1, measure: 2 },
        { string: 3, fret: 3, position: 19, duration: 1, measure: 2 },
        { string: 3, fret: 0, position: 20, duration: 1, measure: 2 },
        { string: 3, fret: 3, position: 21, duration: 1, measure: 2 },
        { string: 3, fret: 5, position: 22, duration: 1, measure: 2 },
        { string: 3, fret: 7, position: 23, duration: 1, measure: 2 },
        
        // Fourth measure - Ending
        { string: 3, fret: 8, position: 24, duration: 2, measure: 3 },
        { string: 3, fret: 7, position: 26, duration: 1, measure: 3 },
        { string: 3, fret: 5, position: 27, duration: 1, measure: 3 },
        { string: 3, fret: 3, position: 28, duration: 2, measure: 3 },
        { string: 3, fret: 0, position: 30, duration: 2, measure: 3 },
      ],
      source: {
        type: 'demo',
        format: 'internal'
      }
    }
  },
];

export default demoTabs; 