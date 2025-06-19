import { tunings } from './musicTheory';
import { allNotes } from './musicTheory';

/**
 * Adapts chord voicings from one tuning to another
 * @param {Array} voicings - Array of voicing objects to adapt
 * @param {string} fromTuning - Name of the source tuning
 * @param {string} toTuning - Name of the target tuning
 * @returns {Array} Adapted voicings
 */
export function adaptVoicingsToTuning(voicings, fromTuning, toTuning) {
  if (!voicings || voicings.length === 0) return [];
  if (fromTuning === toTuning) return voicings;
  
  const fromTuningArray = tunings[fromTuning];
  const targetTuningArray = tunings[toTuning];
  
  // If either tuning is not found, return the original voicings
  if (!fromTuningArray || !targetTuningArray) {
    console.warn(`Could not find tuning: ${!fromTuningArray ? fromTuning : toTuning}`);
    return voicings;
  }
  
  return voicings.map(voicing => {
    const newVoicing = { ...voicing };
    newVoicing.name = `${newVoicing.name} (adapted)`;
    const newFrets = [...voicing.frets];
    
    for (let i = 0; i < 6; i++) {
      const fret = voicing.frets[i];
      if (fret === 'x') continue;
      if (fret === 0 || fret === '0') {
        newFrets[i] = 0;
        continue;
      }
      
      const origNote = getFretNote(fromTuningArray[5 - i], parseInt(fret, 10));
      const targetOpenNote = targetTuningArray[5 - i];
      const targetNoteIndex = allNotes.indexOf(origNote);
      const targetOpenIndex = allNotes.indexOf(targetOpenNote);
      
      if (targetNoteIndex === -1 || targetOpenIndex === -1) {
        console.warn(`Could not find note in scale: ${origNote} or ${targetOpenNote}`);
        continue;
      }
      
      let newFret = (targetNoteIndex - targetOpenIndex + 12) % 12;
      if (newFret > 12 && parseInt(fret, 10) <= 12) {
        newFret = newFret - 12;
      } else if (newFret === 0 && parseInt(fret, 10) > 0) {
        newFret = 12;
      }
      newFrets[i] = newFret.toString();
    }
    
    return {
      ...newVoicing,
      frets: newFrets,
      fingers: voicing.fingers ? [...voicing.fingers] : newFrets.map(_ => '')
    };
  });
}

/**
 * Helper to get the note at a specific fret
 * @param {string} openNote - The open string note
 * @param {number} fret - The fret number
 * @returns {string} The note at the specified fret
 */
function getFretNote(openNote, fret) {
  const index = allNotes.indexOf(openNote);
  if (index === -1) return '';
  return allNotes[(index + fret) % 12];
}
