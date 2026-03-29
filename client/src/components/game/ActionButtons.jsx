import React from 'react';

const ACTION_TYPE_STYLES = {
  ability: { border: '#4a9af5', bg: 'rgba(74,154,245,0.08)', icon: '⚔️' },
  item:    { border: '#D4AF37', bg: 'rgba(212,175,55,0.08)', icon: '⚙️' },
  move:    { border: '#50c878', bg: 'rgba(80,200,120,0.08)', icon: '→' },
  talk:    { border: '#c878c8', bg: 'rgba(200,120,200,0.08)', icon: '💬' },
  shop:    { border: '#D4AF37', bg: 'rgba(212,175,55,0.08)', icon: '🛒' },
  rest:    { border: '#50c878', bg: 'rgba(80,200,120,0.08)', icon: '⏸' },
  custom:  { border: '#888',    bg: 'rgba(136,136,136,0.08)', icon: '◈' },
};

export default function ActionButtons({ actions, onAction, disabled, campaignState, regionColor }) {
  if (!actions?.length) return null;

  // Filter out raw ability buttons if in combat — handled by AbilityBar
  const filteredActions = actions.filter(a => {
    if (campaignState === 'combat' && a.type === 'ability') return false;
    return true;
  });

  if (!filteredActions.length) return null;

  return (
    <div className="px-4 py-2.5 flex flex-wrap gap-2">
      {filteredActions.map(action => {
        const style = ACTION_TYPE_STYLES[action.type] || ACTION_TYPE_STYLES.custom;
        return (
          <button
            key={action.id}
            onClick={() => !disabled && onAction(action)}
            disabled={disabled}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body
                       border transition-all active:scale-95
                       disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-125"
            style={{
              borderColor: disabled ? '#2A2A4A' : style.border + '60',
              background: disabled ? 'transparent' : style.bg,
              color: disabled ? '#4A4A6A' : '#D4C090',
            }}
          >
            <span className="text-base leading-none">{style.icon}</span>
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
