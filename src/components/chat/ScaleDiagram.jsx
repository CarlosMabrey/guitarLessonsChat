'use client';
import clsx from 'clsx';

export const ScaleDiagram = ({ scale }) => {
  if (!scale) return null;

  const tuning = scale.tuning || ['E', 'A', 'D', 'G', 'B', 'E'];
  const strings = tuning.length;
  const positions = scale.positions || [];
  const notes = scale.notes || [];
  const intervals = scale.intervals || [];

  // Calculate frets to display
  const allFrets = positions.flatMap(pos => Object.values(pos.notes || {}));
  const minFret = Math.min(...allFrets.filter(f => f > 0), 1);
  const maxFret = Math.max(...allFrets, 5) + 1;
  const showNut = minFret === 1;

  return (
    <div className="my-4 p-4 bg-card-hover/10 rounded-xl border border-card-hover/30">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-text-primary">{scale.name || 'Scale'}</h4>
          {scale.description && (
            <p className="text-sm text-text-secondary mt-1">{scale.description}</p>
          )}
        </div>
        {scale.type && (
          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
            {scale.type}
          </span>
        )}
      </div>

      {/* Scale notes */}
      {notes.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center flex-wrap gap-2">
            {notes.map((note, i) => (
              <div key={i} className="relative group">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                  {note}
                </div>
                {intervals[i] && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">
                    {intervals[i]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fretboard visualization */}
      <div className="mt-4">
        <div className="text-xs font-medium text-text-secondary mb-2">Positions:</div>
        <div className="space-y-4">
          {positions.map((pos, posIdx) => (
            <div key={posIdx} className="bg-card/30 p-3 rounded-lg">
              <div className="font-medium text-sm text-text-secondary mb-2">
                Position {pos.position}
                {pos.fret && ` (Fret ${pos.fret})`}
              </div>
              
              <div className="flex items-start">
                {/* Fretboard */}
                <div className="relative">
                  {/* Nut or position marker */}
                  {showNut ? (
                    <div className="h-1 bg-gray-300 mb-1 w-full"></div>
                  ) : (
                    <div className="h-6 flex items-center justify-center mb-1">
                      <span className="text-xs font-mono text-text-tertiary">{minFret}fr</span>
                    </div>
                  )}
                  
                  {/* Strings */}
                  <div className="flex">
                    {Array.from({ length: strings }).map((_, stringIdx) => {
                      const fret = pos.notes?.[stringIdx] || 0;
                      const isRoot = pos.rootString === stringIdx;
                      const isMuted = fret === -1;
                      
                      return (
                        <div key={stringIdx} className="flex flex-col items-center">
                          {/* String */}
                          <div className="w-8 h-6 flex items-center justify-center">
                            {isMuted ? (
                              <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                                <div className="w-3 h-0.5 bg-red-500 rotate-45"></div>
                              </div>
                            ) : fret > 0 ? (
                              <div className={clsx(
                                'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                                isRoot 
                                  ? 'bg-primary text-white ring-2 ring-primary/30' 
                                  : 'bg-card-hover/80 text-text-primary',
                                'shadow-md'
                              )}>
                                {fret}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Fret numbers */}
                  <div className="flex justify-between mt-1">
                    {Array.from({ length: strings }).map((_, i) => (
                      <div key={i} className="w-8 text-center">
                        <span className="text-[10px] text-text-tertiary">{tuning[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Position notes */}
                <div className="ml-6 flex-1">
                  <div className="text-sm">
                    <div className="font-medium text-text-secondary mb-1">Notes:</div>
                    <div className="flex flex-wrap gap-1">
                      {pos.notesArray?.map((note, i) => (
                        <span 
                          key={i} 
                          className={clsx(
                            'px-2 py-0.5 rounded text-xs',
                            pos.rootNote === note 
                              ? 'bg-primary/10 text-primary font-medium' 
                              : 'bg-card-hover/30 text-text-secondary'
                          )}
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Additional scale information */}
      <div className="mt-4 pt-3 border-t border-card-hover/20">
        <div className="grid grid-cols-2 gap-4">
          {scale.formula && (
            <div>
              <div className="text-xs font-medium text-text-secondary mb-1">Formula:</div>
              <div className="text-sm">{scale.formula}</div>
            </div>
          )}
          {scale.chords && scale.chords.length > 0 && (
            <div>
              <div className="text-xs font-medium text-text-secondary mb-1">Chords in this scale:</div>
              <div className="flex flex-wrap gap-1">
                {scale.chords.map((chord, i) => (
                  <span key={i} className="px-2 py-0.5 bg-card-hover/30 text-xs rounded">
                    {chord}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};