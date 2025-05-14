// components/theory/FretboardTable.js
import React from 'react';
import * as Tonal from 'tonal';

const FretboardTable = ({ tuning, frets, highlightedNotes }) => {
const fretboard = tuning.map(string =>
Array.from({ length: frets + 1 }, (_, fret) =>
Tonal.Note.transpose(string, Tonal.Interval.fromSemitones(fret))
)
);

const dotFrets = [3, 5, 7, 9, 12];

return (
<div style={{ overflowX: 'auto', borderRadius: '0.5rem', border: '1px solid #334155', background: '#1e293b' }}>
<table style={{ width: '100%', borderCollapse: 'collapse' }}>
<tbody>
{fretboard.map((string, i) => (
<tr key={i}>
<td style={{ color: '#94a3b8', paddingRight: '0.5rem', textAlign: 'right', fontWeight: 600 }}>{tuning[i]}</td>
{string.map((note, fretIndex) => {
const pc = Tonal.Note.pitchClass(note);
const isHighlighted = highlightedNotes.includes(pc);
return (
<td
key={fretIndex}
style={{
backgroundColor: isHighlighted ? '#facc15' : '#0f172a',
border: '1px solid #334155',
color: '#fff',
width: 40,
height: 40,
textAlign: 'center',
position: 'relative'
}}
>
{pc}
{dotFrets.includes(fretIndex) && (
<div
style={{
position: 'absolute',
bottom: 2,
left: '50%',
transform: 'translateX(-50%)',
width: 6,
height: 6,
backgroundColor: '#64748b',
borderRadius: '50%',
}}
/>
)}
</td>
);
})}
</tr>
))}
<tr>
<td></td>
{[...Array(frets + 1)].map((_, i) => (
<td key={i} style={{ fontSize: 10, color: '#cbd5e1', textAlign: 'center', paddingTop: '0.25rem' }}>
{i}
</td>
))}
</tr>
</tbody>
</table>
</div>
);
};

export default FretboardTable;