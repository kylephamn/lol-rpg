import React from 'react';

const STATUS_ICONS = {
  stun: '⚡', root: '🌿', slow: '🐌', silence: '🤫',
  burn: '🔥', bleed: '🩸', poison: '☠️', shield: '🛡️',
};

export default function EnemyPanel({ enemies, regionColor }) {
  const activeEnemies = enemies.filter(e => e.hp > 0);
  const deadEnemies   = enemies.filter(e => e.hp <= 0);

  if (!enemies?.length) return null;

  return (
    <div
      className="shrink-0 border-b border-red-900/30 bg-red-950/10 px-4 py-3"
      style={{ borderColor: regionColor ? regionColor + '20' : undefined }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-mono text-red-400/70 uppercase tracking-widest">Enemies</span>
        {deadEnemies.length > 0 && (
          <span className="text-xs font-mono text-gray-600">({deadEnemies.length} fallen)</span>
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        {activeEnemies.map(enemy => {
          const hpPct = Math.max(0, Math.min(100, (enemy.hp / enemy.max_hp) * 100));
          const isLow = hpPct < 25;
          return (
            <div key={enemy.id} className="flex-1 min-w-32 max-w-52">
              <div className="flex items-center justify-between mb-1">
                <span className="font-heading text-xs text-red-200/80">{enemy.name}</span>
                <span className="font-mono text-xs text-gray-500">{enemy.hp}/{enemy.max_hp}</span>
              </div>
              <div className="h-2 bg-void rounded-full overflow-hidden border border-black/20">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${hpPct}%`,
                    background: isLow
                      ? 'linear-gradient(90deg, #7a1a1a, #e74c3c)'
                      : `linear-gradient(90deg, #7a1a1a, ${regionColor || '#e74c3c'})`,
                  }}
                />
              </div>
              {/* Status effects */}
              {(enemy.status_effects || []).length > 0 && (
                <div className="flex gap-1 mt-1">
                  {enemy.status_effects.slice(0, 4).map((eff, i) => (
                    <span key={i} title={eff.effect} className="text-xs status-badge">
                      {STATUS_ICONS[eff.effect] || '◈'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dead enemies */}
      {deadEnemies.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {deadEnemies.map(e => (
            <span key={e.id} className="text-xs font-mono text-gray-700 line-through">{e.name}</span>
          ))}
        </div>
      )}
    </div>
  );
}
