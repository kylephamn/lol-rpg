import React from 'react';

const STATUS_ICONS = {
  stun: '⚡', root: '🌿', slow: '🐌', silence: '🤫', fear: '😱',
  knock_up: '💨', burn: '🔥', bleed: '🩸', poison: '☠️',
  shield: '🛡️', heal: '💚', haste: '⚡', empower: '✨',
};

export default function StatusBar({ player, goldFlash }) {
  const maxHp   = player.stats?.hp || 1;
  const maxMana = player.stats?.mana || 1;
  const hpPct   = Math.max(0, Math.min(100, (player.current_hp / maxHp) * 100));
  const manaPct = Math.max(0, Math.min(100, (player.current_mana / maxMana) * 100));
  const isLow   = hpPct < 25;

  // Filter out hidden/internal effects and region buffs for display
  const visibleEffects = (player.status_effects || []).filter(e =>
    e.duration < 999 && !e.source?.startsWith('region_')
  );

  return (
    <div className="px-3 py-3 space-y-2 shrink-0 border-t border-border/30">
      {/* HP bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-xs text-gray-500">HP</span>
          <span className={`font-mono text-xs ${isLow ? 'text-red-400' : 'text-gray-400'}`}>
            {player.current_hp} / {maxHp}
          </span>
        </div>
        <div className="h-2.5 bg-void rounded-full overflow-hidden border border-black/20">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isLow ? 'hp-bar-fill low' : 'hp-bar-fill'}`}
            style={{ width: `${hpPct}%` }}
          />
        </div>
      </div>

      {/* Mana bar */}
      {maxMana > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-xs text-gray-500">
              {player.stats?.resource_type === 'energy' ? 'Energy' : 'Mana'}
            </span>
            <span className="font-mono text-xs text-gray-400">
              {player.current_mana} / {maxMana}
            </span>
          </div>
          <div className="h-2 bg-void rounded-full overflow-hidden border border-black/20">
            <div
              className="mana-bar-fill h-full rounded-full transition-all duration-500"
              style={{ width: `${manaPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Gold + XP strip */}
      <div className="flex items-center justify-between pt-1">
        <span className={`font-mono text-sm ${goldFlash ? 'gold-flash text-gold-300' : 'text-yellow-600'}`}>
          ◈ {player.gold || 0}g
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs text-gray-600">Lvl {player.level || 1}</span>
          <div className="w-16 h-1 bg-void rounded-full overflow-hidden">
            <div
              className="h-full bg-gold-500/60 rounded-full transition-all"
              style={{ width: `${Math.min(100, ((player.xp || 0) / ((player.level || 1) * 100)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active status effects */}
      {visibleEffects.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {visibleEffects.map((eff, i) => (
            <span
              key={i}
              title={`${eff.effect} (${eff.duration} turns)`}
              className="status-badge inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-surface border border-border"
            >
              <span>{STATUS_ICONS[eff.effect] || '◈'}</span>
              <span className="font-mono text-gray-400">{eff.duration}</span>
            </span>
          ))}
        </div>
      )}

      {/* Items */}
      {(player.items || []).length > 0 && (
        <div className="flex gap-1 pt-1 flex-wrap">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              title={player.items[i] || 'Empty'}
              className={`w-7 h-7 rounded border flex items-center justify-center text-xs
                ${player.items[i] ? 'border-gold-500/40 bg-gold-500/10 text-gold-400' : 'border-border bg-surface text-gray-700'}`}
            >
              {player.items[i] ? '⚙' : '·'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
