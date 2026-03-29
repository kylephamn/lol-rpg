import React from 'react';

const SLOT_COLORS = {
  Q: '#4a9af5',
  W: '#50c878',
  E: '#f5a623',
  R: '#e74c3c',
};

const DAMAGE_TYPE_ICONS = {
  physical: '⚔️',
  magic: '🔮',
  true: '💫',
  none: '🛡️',
};

export default function AbilityBar({ abilities, abilityRanks, cooldowns, onUseAbility, disabled, regionColor }) {
  const slots = ['Q', 'W', 'E', 'R'];

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40">
      <span className="font-mono text-xs text-gray-600 uppercase tracking-widest shrink-0">Abilities</span>
      <div className="flex gap-2 ml-2">
        {slots.map(slot => {
          const ability = abilities?.find(a => a.slot === slot);
          const rank     = (abilityRanks || {})[slot] || 0;
          const cd       = (cooldowns || {})[slot] || 0;
          const onCd     = cd > 0;
          const noRank   = rank === 0;
          const isDisabled = disabled || onCd || noRank;

          return (
            <button
              key={slot}
              onClick={() => !isDisabled && onUseAbility(slot)}
              disabled={isDisabled}
              title={ability ? `${ability.name}\n${ability.description}\nRank ${rank}` : slot}
              className={`ability-btn relative w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center
                          transition-all group overflow-hidden
                          ${onCd || noRank ? 'on-cooldown cursor-not-allowed' : 'hover:scale-105 active:scale-95 cursor-pointer'}
                         `}
              style={{
                borderColor: isDisabled ? '#2A2A4A' : (SLOT_COLORS[slot] + '80'),
                background: isDisabled ? '#0D0D1F' : `linear-gradient(135deg, #1A1A35, ${SLOT_COLORS[slot]}20)`,
                boxShadow: !isDisabled ? `0 0 12px ${SLOT_COLORS[slot]}30` : 'none',
              }}
            >
              {/* Slot label */}
              <span
                className="font-heading font-bold text-base leading-none"
                style={{ color: isDisabled ? '#3A3A5A' : SLOT_COLORS[slot] }}
              >
                {slot}
              </span>

              {/* Damage type icon */}
              {ability && (
                <span className="text-xs leading-none mt-0.5 opacity-60">
                  {DAMAGE_TYPE_ICONS[ability.damage_type] || '⚔️'}
                </span>
              )}

              {/* Rank pips */}
              {rank > 0 && (
                <div className="absolute bottom-1 flex gap-0.5">
                  {[...Array(Math.min(rank, slot === 'R' ? 3 : 5))].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full"
                      style={{ background: SLOT_COLORS[slot] }}
                    />
                  ))}
                </div>
              )}

              {/* Cooldown overlay */}
              {onCd && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                  <span className="font-mono font-bold text-sm text-white/80">{cd}</span>
                </div>
              )}

              {/* No rank overlay */}
              {noRank && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <span className="text-gray-600 text-xs font-mono">—</span>
                </div>
              )}

              {/* Ability name tooltip on hover */}
              {ability && !isDisabled && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 bg-deep border border-border rounded
                                text-xs font-body text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none shadow-xl">
                  <div className="font-heading text-white text-xs mb-0.5">{ability.name}</div>
                  <div className="text-gray-500 leading-tight">{ability.description?.slice(0, 80)}...</div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Active item abilities placeholder */}
      <div className="ml-auto flex items-center gap-1 opacity-40">
        {[1,2,3].map(i => (
          <div key={i} className="w-9 h-9 rounded border border-border bg-surface flex items-center justify-center text-xs text-gray-700 font-mono">
            {i}
          </div>
        ))}
      </div>
    </div>
  );
}
