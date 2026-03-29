import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { api } from '../utils/api';

const TIER_LABELS = { 1: 'Component', 2: 'Advanced', 3: 'Legendary' };
const TIER_COLORS = { 1: '#888', 2: '#4a9af5', 3: '#D4AF37' };
const TAG_ICONS   = { damage: '⚔️', tank: '🛡️', healing: '💚', utility: '⚡', crit: '💥', on_hit: '🎯', aura: '✨' };

export default function ShopPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, loadItems, loadCampaign, campaign, players, submitAction } = useGameStore();

  const [tierFilter, setTierFilter]       = useState('all');
  const [selectedItem, setSelectedItem]   = useState(null);
  const [notification, setNotification]   = useState(null);
  const [buyLoading, setBuyLoading]       = useState(false);

  const myPlayer = players.find(p => p.user_id === user?.id);

  useEffect(() => {
    loadItems();
    loadCampaign(id);
  }, [id]);

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const canAfford = (item) => (myPlayer?.gold || 0) >= item.cost;
  const hasRoom   = () => (myPlayer?.items || []).length < 6;
  const alreadyHas = (item) => (myPlayer?.items || []).includes(item.id);

  const playerLevel = myPlayer?.level || 1;
  const availableItems = items.filter(item => {
    if (item.tier === 3 && playerLevel < 9) return false;
    if (tierFilter !== 'all' && item.tier !== parseInt(tierFilter)) return false;
    return true;
  });

  const handleBuy = async (item) => {
    if (!canAfford(item)) { showNotif('Not enough gold!', 'error'); return; }
    if (!hasRoom())        { showNotif('Inventory full! Sell an item first.', 'error'); return; }
    if (alreadyHas(item))  { showNotif('Already owned.', 'error'); return; }

    setBuyLoading(true);
    const result = await submitAction(id, {
      id: `buy_${item.id}`,
      label: `Buy ${item.name}`,
      type: 'item',
      payload: { item_id: item.id },
    });
    setBuyLoading(false);

    if (result) {
      showNotif(`Purchased ${item.name}!`, 'success');
    } else {
      showNotif('Purchase failed.', 'error');
    }
  };

  const handleSell = async (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    const sellPrice = Math.floor(item.cost * 0.7);
    const result = await submitAction(id, {
      id: `sell_${itemId}`,
      label: `Sell ${item.name}`,
      type: 'item',
      payload: { sell_item_id: itemId, sell_price: sellPrice },
    });
    if (result) showNotif(`Sold ${item.name} for ${sellPrice}g`, 'success');
  };

  const handleLeave = async () => {
    // Transition back to exploration
    await submitAction(id, {
      id: 'leave_shop',
      label: 'Leave Shop',
      type: 'move',
      payload: { leave_shop: true },
    });
    navigate(`/campaign/${id}`);
  };

  const regionColor = campaign?.color_hex || '#D4AF37';

  return (
    <div className="min-h-screen bg-void flex flex-col page-enter">
      {/* Header */}
      <header
        className="border-b px-6 py-4 flex items-center justify-between shrink-0"
        style={{ borderColor: regionColor + '40', background: regionColor + '10' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{campaign?.icon_emoji || '🛒'}</span>
          <span className="font-heading text-sm tracking-widest uppercase" style={{ color: regionColor }}>
            {campaign?.region_name || 'The Shop'} — Merchant
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm" style={{ color: regionColor }}>
            ◈ {myPlayer?.gold || 0}g
          </span>
          <button
            onClick={handleLeave}
            className="px-4 py-2 border border-border rounded font-heading text-xs tracking-widest uppercase text-gray-400 hover:text-gray-200 transition-colors"
          >
            Leave Shop →
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Left: Shop inventory */}
        <div className="flex-1 flex flex-col overflow-hidden p-6">
          {/* Flavor text */}
          <p className="font-body text-gray-600 italic text-sm mb-4">
            "The merchant eyes you with a knowing smile. 'Coin well spent is power gained, champion.'"
          </p>

          {/* Tier filter */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {[['all', 'All Items'], ['1', 'Components'], ['2', 'Advanced'], ['3', 'Legendary']].map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors border
                  ${tierFilter === t
                    ? 'border-gold-400/60 bg-gold-500/10 text-gold-300'
                    : 'border-border bg-surface text-gray-500 hover:text-gray-300'}`}
              >
                {label}
                {t !== 'all' && <span className="ml-1 opacity-50" style={{ color: TIER_COLORS[parseInt(t)] }}>{'★'.repeat(parseInt(t))}</span>}
              </button>
            ))}
            {playerLevel < 9 && (
              <span className="px-3 py-1.5 text-xs font-mono text-gray-600 italic">
                Legendary items unlock at level 9
              </span>
            )}
          </div>

          {/* Item grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableItems.map(item => {
                const affordable = canAfford(item);
                const owned      = alreadyHas(item);
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                    className={`relative p-3 rounded-lg border text-left transition-all group
                      ${selectedItem?.id === item.id
                        ? 'border-gold-400/60 scale-[1.02]'
                        : 'border-border hover:border-gold-500/30'}
                      ${!affordable ? 'opacity-50' : ''}
                      ${owned ? 'opacity-60' : ''}
                      bg-surface`}
                  >
                    {/* Tier indicator */}
                    <div
                      className="absolute top-2 right-2 text-xs font-mono"
                      style={{ color: TIER_COLORS[item.tier] }}
                    >
                      {'★'.repeat(item.tier)}
                    </div>

                    {/* Item icon placeholder */}
                    <div
                      className="w-10 h-10 rounded mb-2 flex items-center justify-center text-lg border"
                      style={{ borderColor: TIER_COLORS[item.tier] + '40', background: TIER_COLORS[item.tier] + '15' }}
                    >
                      {item.tags?.includes('damage') ? '⚔️' :
                       item.tags?.includes('tank') ? '🛡️' :
                       item.tags?.includes('healing') ? '💚' :
                       item.tags?.includes('crit') ? '💥' : '⚙️'}
                    </div>

                    <div className="font-heading text-xs text-gray-200 mb-1 leading-tight">{item.name}</div>
                    <div className="font-mono text-xs" style={{ color: affordable ? '#D4AF37' : '#888' }}>
                      {item.cost}g
                    </div>

                    {owned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                        <span className="text-xs font-mono text-green-400">Owned</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Item detail + inventory */}
        <div className="w-72 shrink-0 border-l border-border flex flex-col overflow-hidden">
          {/* Item detail */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedItem ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-heading text-base text-gold-300">{selectedItem.name}</h3>
                    <span className="font-mono text-sm text-gold-400">{selectedItem.cost}g</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs font-mono" style={{ color: TIER_COLORS[selectedItem.tier] }}>
                      {'★'.repeat(selectedItem.tier)} {TIER_LABELS[selectedItem.tier]}
                    </span>
                    {(selectedItem.tags || []).map(t => (
                      <span key={t} title={t} className="text-xs">{TAG_ICONS[t] || ''}</span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                {Object.entries(selectedItem.stats || {}).filter(([, v]) => v !== 0).length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Stats</div>
                    {Object.entries(selectedItem.stats || {}).filter(([, v]) => v && v !== 0).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="font-body text-gray-400">{key.replace(/_/g, ' ')}</span>
                        <span className="font-mono text-green-400">+{val}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Passive */}
                {selectedItem.passive_name && (
                  <div>
                    <div className="text-xs font-mono text-gold-400/70 mb-1">Passive — {selectedItem.passive_name}</div>
                    <p className="font-body text-xs text-gray-400 leading-relaxed">{selectedItem.passive_description}</p>
                  </div>
                )}

                {/* Active */}
                {selectedItem.active_name && (
                  <div>
                    <div className="text-xs font-mono text-blue-400/70 mb-1">Active — {selectedItem.active_name}</div>
                    <p className="font-body text-xs text-gray-400 leading-relaxed">{selectedItem.active_description}</p>
                    {selectedItem.active_cooldown && (
                      <span className="text-xs font-mono text-gray-600">CD: {selectedItem.active_cooldown} turns</span>
                    )}
                  </div>
                )}

                {/* Build path */}
                {selectedItem.build_from?.length > 0 && (
                  <div>
                    <div className="text-xs font-mono text-gray-500 mb-1">Builds from</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedItem.build_from.map(bid => {
                        const b = items.find(i => i.id === bid);
                        return b ? (
                          <span key={bid} className="text-xs px-2 py-0.5 bg-surface border border-border rounded font-body text-gray-400">
                            {b.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleBuy(selectedItem)}
                  disabled={buyLoading || !canAfford(selectedItem) || !hasRoom() || alreadyHas(selectedItem)}
                  className="w-full py-2.5 font-heading tracking-widest uppercase text-xs
                             bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400
                             text-void font-bold rounded transition-all active:scale-95
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {alreadyHas(selectedItem) ? 'Owned' :
                   !canAfford(selectedItem) ? 'Not enough gold' :
                   !hasRoom() ? 'Inventory full' :
                   buyLoading ? 'Buying...' :
                   `Buy — ${selectedItem.cost}g`}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div className="opacity-30">
                  <div className="text-4xl mb-3">⚙️</div>
                  <p className="font-body text-gray-600 text-sm">Select an item to view details</p>
                </div>
              </div>
            )}
          </div>

          {/* Equipped items */}
          <div className="border-t border-border p-4 shrink-0">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">
              Equipped ({(myPlayer?.items || []).length}/6)
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[...Array(6)].map((_, i) => {
                const itemId = (myPlayer?.items || [])[i];
                const item   = itemId ? items.find(it => it.id === itemId) : null;
                return (
                  <div
                    key={i}
                    title={item?.name || 'Empty slot'}
                    className={`aspect-square rounded border flex items-center justify-center text-sm relative group
                      ${item ? 'border-gold-500/40 bg-gold-500/10 cursor-pointer' : 'border-border bg-surface'}`}
                    onClick={() => item && handleSell(item.id)}
                  >
                    {item ? (
                      <>
                        <span>
                          {item.tags?.includes('damage') ? '⚔️' :
                           item.tags?.includes('tank') ? '🛡️' :
                           item.tags?.includes('healing') ? '💚' : '⚙️'}
                        </span>
                        <div className="absolute inset-0 bg-red-900/60 opacity-0 group-hover:opacity-100 rounded flex items-center justify-center transition-opacity">
                          <span className="text-xs text-red-300 font-mono">Sell</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-700 text-xs">·</span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs font-body text-gray-600 mt-2">Click equipped item to sell (70% value)</p>
          </div>
        </div>
      </div>

      {/* Notification toast */}
      {notification && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg border text-sm font-body shadow-xl
          ${notification.type === 'success'
            ? 'bg-green-900/90 border-green-500/50 text-green-300'
            : 'bg-red-900/90 border-red-500/50 text-red-300'}`}>
          {notification.msg}
        </div>
      )}
    </div>
  );
}
