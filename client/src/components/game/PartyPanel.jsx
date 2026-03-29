import React from 'react';
import { getChampionIconSync, onImgError } from '../../utils/dataDragon';

export default function PartyPanel({ players, myUserId, version }) {
  const others = players.filter(p => p.user_id !== myUserId);
  if (!others.length) return null;

  return (
    <div className="p-3 border-t border-border/30">
      <div className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-2">Party</div>
      <div className="space-y-2">
        {others.map(p => {
          const maxHp  = p.stats?.hp || 1;
          const hpPct  = Math.max(0, Math.min(100, (p.current_hp / maxHp) * 100));
          const isLow  = hpPct < 25;
          return (
            <div key={p.user_id} className="flex items-center gap-2">
              <img
                src={getChampionIconSync(p.champion_id, version)}
                onError={onImgError}
                alt={p.champion_name}
                className="w-8 h-8 rounded border border-border shrink-0 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-gray-400 truncate">{p.username || p.champion_name}</span>
                  <span className="font-mono text-xs text-gray-600">Lv{p.level}</span>
                </div>
                <div className="h-1.5 bg-void rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${hpPct}%`,
                      background: isLow
                        ? 'linear-gradient(90deg, #7a1a1a, #e74c3c)'
                        : 'linear-gradient(90deg, #1a7a1a, #2ecc71)',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
