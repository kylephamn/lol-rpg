import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';

export default function LobbyPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { regions, loadRegions, createCampaign, loading, error, clearError } = useGameStore();

  const [tab, setTab]             = useState('create'); // 'create' | 'join'
  const [campaignName, setCampaignName] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [hardcore, setHardcore]   = useState(false);
  const [joinId, setJoinId]       = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => { loadRegions(); }, []);
  useEffect(() => { clearError(); }, [tab]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedRegion) return;
    const campaign = await createCampaign(campaignName, selectedRegion, hardcore);
    if (campaign) navigate(`/campaign/${campaign.id}/setup`);
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const id = joinId.trim();
    if (!id) { setJoinError('Enter a Campaign ID'); return; }
    navigate(`/campaign/${id}/setup`);
  };

  return (
    <div className="min-h-screen bg-void page-enter">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚔️</span>
          <span className="font-heading text-gold-400 tracking-widest text-sm uppercase">Runeterra Chronicles</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-body text-gray-400">
            Summoner: <span className="text-gold-300">{user?.username}</span>
          </span>
          <button
            onClick={logout}
            className="text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors px-3 py-1.5 border border-border rounded"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="font-display text-3xl text-gold-300 mb-2 title-cinematic text-center">
          Campaign Hall
        </h2>
        <p className="text-center text-gray-500 font-body mb-10 text-sm">
          Gather your party or forge a new destiny
        </p>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex border border-border rounded-lg overflow-hidden">
            {[['create', '+ Create Campaign'], ['join', '→ Join Campaign']].map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-8 py-3 text-sm font-heading tracking-widest uppercase transition-all ${
                  tab === t ? 'bg-gold-500/15 text-gold-300' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="max-w-xl mx-auto mb-6 p-3 bg-red-900/30 border border-red-500/40 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Create form */}
        {tab === 'create' && (
          <form onSubmit={handleCreate} className="max-w-xl mx-auto space-y-6">
            <div>
              <label className="block text-xs font-mono tracking-widest text-gold-400/70 uppercase mb-2">
                Campaign Name
              </label>
              <input
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                placeholder="The Fall of Noxus..."
                required
                className="w-full bg-surface border border-border rounded px-4 py-3 font-body text-amber-100 placeholder-gray-600
                           focus:outline-none focus:border-gold-400/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono tracking-widest text-gold-400/70 uppercase mb-3">
                Battleground — Select a Region
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {regions.map(region => (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setSelectedRegion(region.id)}
                    className={`relative p-3 rounded-lg border text-left transition-all ${
                      selectedRegion === region.id
                        ? 'border-gold-400/70 bg-gold-500/10'
                        : 'border-border hover:border-gold-500/30 bg-surface'
                    }`}
                    style={selectedRegion === region.id ? {
                      '--region-color': region.color_hex,
                      borderColor: region.color_hex + '80',
                      background: region.color_hex + '15',
                    } : {}}
                  >
                    <span className="text-xl block mb-1">{region.icon_emoji}</span>
                    <span className="font-heading text-xs text-gray-200 block">{region.name}</span>
                    {selectedRegion === region.id && (
                      <span className="absolute top-2 right-2 text-xs text-gold-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {selectedRegion && (() => {
              const r = regions.find(r => r.id === selectedRegion);
              return r ? (
                <div className="p-4 rounded-lg border text-sm" style={{ borderColor: r.color_hex + '50', background: r.color_hex + '10' }}>
                  <div className="font-heading text-xs tracking-widest uppercase mb-1" style={{ color: r.color_hex }}>
                    Terrain Effect
                  </div>
                  <p className="font-body text-gray-300 text-xs leading-relaxed">{r.terrain_effect?.description}</p>
                </div>
              ) : null;
            })()}

            <div className="flex items-center gap-3 p-4 bg-surface border border-border rounded-lg">
              <input
                type="checkbox"
                id="hardcore"
                checked={hardcore}
                onChange={e => setHardcore(e.target.checked)}
                className="w-4 h-4 accent-gold-400"
              />
              <label htmlFor="hardcore" className="flex-1 cursor-pointer">
                <span className="font-heading text-sm text-red-400 block">Hardcore Mode</span>
                <span className="font-body text-xs text-gray-500">Death is permanent. No second chances.</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedRegion}
              className="w-full py-3.5 font-heading tracking-[0.2em] uppercase text-sm
                         bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400
                         text-void font-bold rounded transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              style={{ boxShadow: '0 0 20px rgba(212,175,55,0.25)' }}
            >
              {loading ? 'Forging Campaign...' : 'Create Campaign'}
            </button>
          </form>
        )}

        {/* Join form */}
        {tab === 'join' && (
          <form onSubmit={handleJoin} className="max-w-md mx-auto space-y-6">
            <div className="text-center text-gray-500 font-body text-sm mb-6">
              Ask your Dungeon Master for the Campaign ID to join their session.
            </div>
            {joinError && (
              <div className="p-3 bg-red-900/30 border border-red-500/40 rounded text-red-300 text-sm">{joinError}</div>
            )}
            <div>
              <label className="block text-xs font-mono tracking-widest text-gold-400/70 uppercase mb-2">
                Campaign ID
              </label>
              <input
                value={joinId}
                onChange={e => { setJoinId(e.target.value); setJoinError(''); }}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full bg-surface border border-border rounded px-4 py-3 font-mono text-sm text-amber-100 placeholder-gray-600
                           focus:outline-none focus:border-gold-400/60 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 font-heading tracking-[0.2em] uppercase text-sm
                         bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400
                         text-void font-bold rounded transition-all active:scale-95"
              style={{ boxShadow: '0 0 20px rgba(212,175,55,0.25)' }}
            >
              Join Campaign
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
