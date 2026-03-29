import React, { useState } from 'react';

export default function RegionBanner({ region, campaignName }) {
  const [expanded, setExpanded] = useState(false);
  const color = region?.colorHex || '#D4AF37';

  return (
    <div
      className="shrink-0 border-b relative overflow-hidden"
      style={{
        borderColor: color + '40',
        background: `linear-gradient(90deg, ${color}15 0%, transparent 60%)`,
      }}
    >
      <div className="flex items-center px-4 py-2.5 gap-3">
        <span className="text-xl shrink-0">{region?.iconEmoji || '⚔️'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="font-heading text-sm tracking-widest uppercase"
              style={{ color }}
            >
              {region?.name || 'Summoner\'s Rift'}
            </span>
            {campaignName && (
              <span className="text-gray-600 text-xs font-mono">• {campaignName}</span>
            )}
          </div>
          {region?.terrainEffect && (
            <p className={`font-body text-xs text-gray-500 transition-all overflow-hidden ${expanded ? 'max-h-20' : 'max-h-4 truncate'}`}>
              {region.terrainEffect.description}
            </p>
          )}
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-gray-600 hover:text-gray-400 transition-colors text-xs font-mono shrink-0 ml-2"
          title={expanded ? 'Collapse' : 'Show terrain effect'}
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Region color accent line */}
      <div
        className="absolute bottom-0 left-0 h-px w-full opacity-60"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
    </div>
  );
}
