import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { getChampionSplash, getChampionIconSync, preloadSplashArt, onImgError, getDDragonVersion } from '../utils/dataDragon';

const ROLE_ICONS = { fighter: '⚔️', mage: '🔮', assassin: '🗡️', tank: '🛡️', marksman: '🏹', support: '✨' };
const RUNE_PATHS = [
  { id: 'precision',    name: 'Precision',    icon: '⚔️',  desc: '+15 AD, +5% attack speed' },
  { id: 'domination',   name: 'Domination',   icon: '🗡️',  desc: '+12 AD, +5% crit chance' },
  { id: 'sorcery',      name: 'Sorcery',      icon: '🔮',  desc: '+20 AP, -5% cooldowns' },
  { id: 'resolve',      name: 'Resolve',      icon: '🛡️',  desc: '+80 HP, +10 armor' },
  { id: 'inspiration',  name: 'Inspiration',  icon: '⚡',  desc: '+50 gold start, utility' },
];

export default function SetupPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { champions, loadChampions, loadCampaign, joinCampaign, startCampaign, campaign, loading, error } = useGameStore();

  const [step, setStep]               = useState('champion'); // 'champion' | 'runes' | 'ready'
  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState('all');
  const [selectedChamp, setSelectedChamp] = useState(null);
  const [primaryRune, setPrimaryRune] = useState('precision');
  const [secondaryRune, setSecondaryRune] = useState('domination');
  const [version, setVersion]         = useState('14.4.1');
  const [previewSrc, setPreviewSrc]   = useState('');

  useEffect(() => {
    loadChampions();
    loadCampaign(id);
    getDDragonVersion().then(v => setVersion(v));
  }, [id]);

  useEffect(() => {
    if (selectedChamp) {
      const splash = getChampionSplash(selectedChamp.id);
      setPreviewSrc(splash);
      preloadSplashArt([selectedChamp.id]);
    }
  }, [selectedChamp]);

  const filtered = champions.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === 'all' || c.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleSelectChamp = (champ) => setSelectedChamp(champ);

  const handleConfirmChampion = async () => {
    if (!selectedChamp) return;
    const ok = await joinCampaign(id, selectedChamp.id);
    if (ok) setStep('runes');
  };

  const handleStart = async () => {
    const result = await startCampaign(id);
    if (result) navigate(`/campaign/${id}`);
  };

  const isDM = campaign?.dm_user_id === user?.id;

  return (
    <div className="min-h-screen bg-void flex flex-col page-enter">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
        <button onClick={() => navigate('/lobby')} className="text-gray-500 hover:text-gray-300 font-mono text-sm transition-colors">
          ← Back to Lobby
        </button>
        <div className="font-heading text-gold-400 tracking-widest text-sm uppercase">
          {campaign?.name || 'Campaign Setup'}
        </div>
        {campaign && (
          <div className="font-mono text-xs text-gray-600">
            ID: {id.slice(0, 8)}...
          </div>
        )}
      </header>

      {/* Step indicator */}
      <div className="flex justify-center py-5 gap-3 shrink-0">
        {[['champion', 'Choose Champion'], ['runes', 'Select Runes'], ['ready', 'Ready']].map(([s, label], i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 text-xs font-mono ${step === s ? 'text-gold-400' : 'text-gray-600'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border
                ${step === s ? 'border-gold-400 text-gold-400 bg-gold-400/10' : 'border-gray-700 text-gray-700'}`}>
                {i + 1}
              </span>
              <span className="uppercase tracking-widest hidden sm:inline">{label}</span>
            </div>
            {i < 2 && <span className="text-gray-700 self-center">—</span>}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="max-w-xl mx-auto px-6 mb-4 p-3 bg-red-900/30 border border-red-500/40 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* STEP: Champion Select */}
      {step === 'champion' && (
        <div className="flex flex-1 overflow-hidden">
          {/* Left: champion grid */}
          <div className="flex flex-col flex-1 overflow-hidden px-6 pb-6">
            {/* Filters */}
            <div className="flex gap-3 mb-4 flex-wrap shrink-0">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search champion..."
                className="bg-surface border border-border rounded px-3 py-2 text-sm font-body text-amber-100 placeholder-gray-600
                           focus:outline-none focus:border-gold-400/60 transition-colors w-48"
              />
              <div className="flex gap-1">
                {['all', 'fighter', 'mage', 'assassin', 'tank', 'marksman', 'support'].map(r => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-2.5 py-1.5 rounded text-xs font-mono transition-colors ${
                      roleFilter === r ? 'bg-gold-500/20 text-gold-300' : 'bg-surface text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {r === 'all' ? 'All' : ROLE_ICONS[r]}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 overflow-y-auto flex-1">
              {filtered.map(champ => (
                <button
                  key={champ.id}
                  onClick={() => handleSelectChamp(champ)}
                  title={`${champ.name} — ${champ.title}`}
                  className={`relative rounded overflow-hidden border-2 transition-all aspect-square group
                    ${selectedChamp?.id === champ.id ? 'border-gold-400 scale-105' : 'border-transparent hover:border-gold-500/50'}`}
                >
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${
                      champ.id.charAt(0).toUpperCase() + champ.id.slice(1)
                    }.png`}
                    alt={champ.name}
                    onError={onImgError}
                    className="w-full h-full object-cover"
                  />
                  {selectedChamp?.id === champ.id && (
                    <div className="absolute inset-0 bg-gold-400/20" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right: champion preview */}
          <div className="w-72 shrink-0 border-l border-border flex flex-col overflow-hidden">
            {selectedChamp ? (
              <>
                <div className="relative h-80 overflow-hidden shrink-0">
                  <img
                    src={previewSrc}
                    alt={selectedChamp.name}
                    onError={onImgError}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="font-display text-lg text-gold-300">{selectedChamp.name}</div>
                    <div className="font-body text-xs text-gray-400 italic">{selectedChamp.title}</div>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{ROLE_ICONS[selectedChamp.role] || '⚔️'}</span>
                    <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">{selectedChamp.role}</span>
                    <span className="ml-auto font-mono text-xs text-gray-600">{selectedChamp.region?.replace('_', ' ')}</span>
                  </div>
                  <p className="font-body text-sm text-gray-300 leading-relaxed mb-4">
                    {selectedChamp.lore_blurb || `${selectedChamp.name} is a champion of Runeterra.`}
                  </p>
                  <button
                    onClick={handleConfirmChampion}
                    disabled={loading}
                    className="w-full py-3 font-heading tracking-widest uppercase text-sm
                               bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400
                               text-void font-bold rounded transition-all active:scale-95
                               disabled:opacity-40"
                    style={{ boxShadow: '0 0 15px rgba(212,175,55,0.3)' }}
                  >
                    {loading ? 'Selecting...' : `Lock In ${selectedChamp.name}`}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-6">
                <div>
                  <div className="text-5xl mb-4 opacity-30">⚔️</div>
                  <p className="font-body text-gray-600 text-sm">Click a champion to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP: Rune Selection */}
      {step === 'runes' && (
        <div className="flex-1 max-w-2xl mx-auto px-6 py-4 w-full">
          <h3 className="font-heading text-xl text-gold-300 text-center mb-6 tracking-widest uppercase">
            Choose Your Rune Path
          </h3>
          <div className="grid grid-cols-1 gap-4 mb-6">
            {[['Primary Path', primaryRune, setPrimaryRune], ['Secondary Path', secondaryRune, setSecondaryRune]].map(([label, val, setter], gi) => (
              <div key={gi}>
                <div className="text-xs font-mono tracking-widest text-gold-400/70 uppercase mb-2">{label}</div>
                <div className="grid grid-cols-5 gap-2">
                  {RUNE_PATHS.map(rp => (
                    <button
                      key={rp.id}
                      onClick={() => setter(rp.id)}
                      disabled={gi === 1 && rp.id === primaryRune}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        val === rp.id
                          ? 'border-gold-400/70 bg-gold-500/10'
                          : 'border-border bg-surface hover:border-gold-500/30 disabled:opacity-30 disabled:cursor-not-allowed'
                      }`}
                    >
                      <div className="text-2xl mb-1">{rp.icon}</div>
                      <div className="font-mono text-xs text-gray-400">{rp.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-surface border border-border rounded-lg p-4 mb-6 text-sm font-body text-gray-300">
            <div className="font-heading text-xs text-gold-400/70 uppercase tracking-widest mb-2">Rune Bonuses</div>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• {RUNE_PATHS.find(r=>r.id===primaryRune)?.name}: {RUNE_PATHS.find(r=>r.id===primaryRune)?.desc}</li>
              <li>• {RUNE_PATHS.find(r=>r.id===secondaryRune)?.name}: {RUNE_PATHS.find(r=>r.id===secondaryRune)?.desc}</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('champion')} className="flex-1 py-3 border border-border rounded font-heading text-sm tracking-widest uppercase text-gray-400 hover:text-gray-200 transition-colors">
              Back
            </button>
            <button onClick={() => setStep('ready')} className="flex-1 py-3 bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-void font-bold font-heading text-sm tracking-widest uppercase rounded transition-all active:scale-95">
              Confirm Runes
            </button>
          </div>
        </div>
      )}

      {/* STEP: Ready lobby */}
      {step === 'ready' && (
        <div className="flex-1 max-w-xl mx-auto px-6 py-8 w-full text-center">
          <div className="text-6xl mb-4">🏰</div>
          <h3 className="font-display text-2xl text-gold-300 mb-2">Ready for Battle</h3>
          <p className="font-body text-gray-500 text-sm mb-6">
            Your champion is locked in. Share the Campaign ID with allies, then begin when all are ready.
          </p>

          <div className="bg-surface border border-border rounded-lg p-4 mb-6">
            <div className="text-xs font-mono text-gray-500 mb-1">Campaign ID (share this)</div>
            <div className="font-mono text-sm text-gold-300 break-all">{id}</div>
          </div>

          {/* Players in lobby */}
          {campaign?.players && campaign.players.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-mono tracking-widest text-gray-500 uppercase mb-2">Party</div>
              <div className="flex flex-wrap justify-center gap-2">
                {campaign.players.map(p => (
                  <div key={p.user_id} className="flex items-center gap-2 bg-surface border border-border rounded-full px-3 py-1.5">
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${
                        p.champion_id?.charAt(0).toUpperCase() + p.champion_id?.slice(1)
                      }.png`}
                      onError={onImgError}
                      className="w-6 h-6 rounded-full"
                      alt=""
                    />
                    <span className="font-body text-xs text-gray-300">{p.username || 'Summoner'}</span>
                    <span className="font-mono text-xs text-gray-600">{p.champion_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isDM ? (
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full py-4 font-heading tracking-[0.25em] uppercase text-base
                         bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400
                         text-void font-bold rounded-lg transition-all active:scale-95
                         disabled:opacity-40"
              style={{ boxShadow: '0 0 30px rgba(212,175,55,0.4)' }}
            >
              {loading ? 'Weaving fate...' : '⚔ Begin the Campaign'}
            </button>
          ) : (
            <div className="p-4 border border-border rounded-lg text-gray-500 font-body text-sm">
              Waiting for the Dungeon Master to start the campaign...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
