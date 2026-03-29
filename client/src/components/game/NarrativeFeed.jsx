import React, { useEffect, useRef } from 'react';

const TYPE_STYLES = {
  narrative: { color: 'text-amber-100/90', prefix: '' },
  combat:    { color: 'text-red-300/80',   prefix: '⚔ ' },
  system:    { color: 'text-gold-400/70',  prefix: '◈ ' },
};

export default function NarrativeFeed({ history, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col min-h-0" aria-live="polite">
      {history.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center opacity-30">
            <div className="text-4xl mb-3">📜</div>
            <p className="font-body text-gray-600 text-sm">The story has not yet begun...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry, i) => {
            const style = TYPE_STYLES[entry.type] || TYPE_STYLES.narrative;
            return (
              <div
                key={entry.id || i}
                className={`narrative-entry ${style.color} font-body leading-relaxed`}
                style={{ animationDelay: `${Math.min(i * 0.02, 0.3)}s` }}
              >
                {entry.type === 'combat' && (
                  <div className="flex items-start gap-2">
                    <span className="text-red-500/60 text-xs shrink-0 mt-1 font-mono">⚔</span>
                    <span className="text-sm text-red-200/70">{entry.content}</span>
                  </div>
                )}
                {entry.type === 'system' && (
                  <div className="flex items-start gap-2">
                    <span className="text-gold-400/60 text-xs shrink-0 mt-1 font-mono">◈</span>
                    <span className="text-xs text-gold-400/70 font-mono tracking-wide">{entry.content}</span>
                  </div>
                )}
                {(!entry.type || entry.type === 'narrative') && (
                  <p className="text-base leading-relaxed"
                     style={{ textIndent: '1em' }}>
                    {entry.content}
                  </p>
                )}
              </div>
            );
          })}

          {/* Loading indicator — AI narrating */}
          {loading && (
            <div className="narrative-entry flex items-center gap-3 text-gold-400/50">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="block w-1.5 h-1.5 rounded-full bg-gold-400/40"
                    style={{
                      animation: 'pulse 1.2s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
              <span className="font-body text-sm italic">The Narrator weaves the tale...</span>
            </div>
          )}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
