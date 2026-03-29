import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { getChampionSplash, getChampionLoadingArt, getDDragonVersion, onImgError } from '../utils/dataDragon';
import NarrativeFeed from '../components/game/NarrativeFeed';
import AbilityBar from '../components/game/AbilityBar';
import StatusBar from '../components/game/StatusBar';
import EnemyPanel from '../components/game/EnemyPanel';
import PartyPanel from '../components/game/PartyPanel';
import ActionButtons from '../components/game/ActionButtons';
import RegionBanner from '../components/game/RegionBanner';

export default function GamePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    campaign, players, history, loading, actionLoading, error,
    loadCampaign, loadHistory, submitAction, clearError,
  } = useGameStore();

  const [version, setVersion] = useState('14.4.1');
  const [cooldowns, setCooldowns] = useState({ Q: 0, W: 0, E: 0, R: 0 });
  const [dmgNumbers, setDmgNumbers] = useState([]);
  const [goldFlash, setGoldFlash] = useState(false);
  const pollRef = useRef(null);

  const myPlayer = players.find(p => p.user_id === user?.id);

  useEffect(() => {
    getDDragonVersion().then(v => setVersion(v));
    loadCampaign(id);
    loadHistory(id);
  }, [id]);

  // Poll for campaign updates every 5s (multiplayer sync)
  useEffect(() => {
    pollRef.current = setInterval(() => loadCampaign(id), 5000);
    return () => clearInterval(pollRef.current);
  }, [id]);

  // Redirect to shop if campaign entered shop state
  useEffect(() => {
    if (campaign?.state === 'shop') navigate(`/campaign/${id}/shop`);
    if (campaign?.state === 'finished') navigate('/lobby');
  }, [campaign?.state]);

  const showDmgNumber = useCallback((value, x = 50, y = 50) => {
    const key = Date.now() + Math.random();
    setDmgNumbers(prev => [...prev, { key, value, x, y }]);
    setTimeout(() => setDmgNumbers(prev => prev.filter(d => d.key !== key)), 1300);
  }, []);

  const handleAction = async (action) => {
    if (actionLoading) return;
    const result = await submitAction(id, action);
    if (!result) return;

    // Handle cooldown update
    if (action.type === 'ability' && action.payload?.slot) {
      const slot = action.payload.slot;
      const ability = myPlayer?.abilities?.find(a => a.slot === slot);
      if (ability) {
        const rank = (myPlayer?.ability_ranks || {})[slot] || 1;
        const cdIdx = Math.min(rank - 1, (ability.cooldown?.length || 1) - 1);
        const cdVal = ability.cooldown?.[cdIdx] || 4;
        setCooldowns(prev => ({ ...prev, [slot]: cdVal }));
      }
    }

    // Show damage number
    if (result.state_changes?.damage || result.player?.current_hp) {
      showDmgNumber(result.state_changes?.xp_gain || '?', 60, 30);
    }

    // Gold flash
    if (result.state_changes?.gold_gain > 0) {
      setGoldFlash(true);
      setTimeout(() => setGoldFlash(false), 700);
    }
  };

  // Decrement cooldowns each second
  useEffect(() => {
    const t = setInterval(() => {
      setCooldowns(prev => {
        const next = {};
        let any = false;
        for (const [slot, cd] of Object.entries(prev)) {
          next[slot] = Math.max(0, cd - 1);
          if (cd > 0) any = true;
        }
        return any ? next : prev;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const region = campaign ? {
    id: campaign.region_id,
    name: campaign.region_name,
    colorHex: campaign.color_hex || '#D4AF37',
    iconEmoji: campaign.icon_emoji || '⚔️',
    terrainEffect: campaign.terrain_effect,
  } : null;

  const availableActions = campaign?.current_scene?.available_actions || [];
  const combatState = campaign?.combat_state;
  const isInCombat = campaign?.state === 'combat';

  // Dynamically set region color CSS variable
  useEffect(() => {
    if (region?.colorHex) {
      document.documentElement.style.setProperty('--region-color', region.colorHex);
      document.documentElement.style.setProperty('--region-color-dim', region.colorHex + '25');
    }
    return () => {
      document.documentElement.style.setProperty('--region-color', '#D4AF37');
      document.documentElement.style.setProperty('--region-color-dim', 'rgba(212,175,55,0.15)');
    };
  }, [region?.colorHex]);

  if (loading && !campaign) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⚔️</div>
          <p className="font-body text-gray-500">Entering the Rift...</p>
        </div>
      </div>
    );
  }

  const championId = myPlayer?.champion_id;
  const splashSrc = championId ? getChampionSplash(championId) : '';

  return (
    <div
      className="h-screen flex flex-col overflow-hidden bg-void"
      style={{ '--region-color': region?.colorHex || '#D4AF37' }}
    >
      {/* ── Region Banner ─────────────────────────────── */}
      <RegionBanner region={region} campaignName={campaign?.name} />

      {/* ── Main content area ─────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* ── LEFT: Battlefield / character art ─────── */}
        <div className="w-72 shrink-0 border-r border-border flex flex-col overflow-hidden" style={{ borderColor: region?.colorHex + '30' }}>
          {/* Champion loading art */}
          <div className="relative h-64 overflow-hidden shrink-0">
            {championId && (
              <img
                src={getChampionLoadingArt(championId)}
                alt={myPlayer?.champion_name || 'Champion'}
                onError={onImgError}
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-deep" />
            <div className="absolute bottom-3 left-3 right-3">
              <div className="font-display text-base text-gold-300"
                   style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
                {myPlayer?.champion_name || '—'}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs text-gray-400">Lvl {myPlayer?.level || 1}</span>
                <span className="font-mono text-xs text-gray-600">•</span>
                <span className="font-mono text-xs text-gray-400">{myPlayer?.xp || 0} XP</span>
              </div>
            </div>
          </div>

          {/* Status bars */}
          {myPlayer && (
            <StatusBar player={myPlayer} goldFlash={goldFlash} />
          )}

          {/* Party panel */}
          <div className="flex-1 overflow-y-auto">
            <PartyPanel players={players} myUserId={user?.id} version={version} />
          </div>
        </div>

        {/* ── CENTER: Narrative feed + enemies ─────── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Enemy panel (shown during combat) */}
          {isInCombat && combatState?.enemies && (
            <EnemyPanel enemies={combatState.enemies} regionColor={region?.colorHex} />
          )}

          {/* Narrative feed */}
          <NarrativeFeed history={history} loading={actionLoading} />
        </div>
      </div>

      {/* ── BOTTOM: Ability bar + action buttons ───── */}
      <div
        className="shrink-0 border-t border-border bg-deep/90 backdrop-blur-sm"
        style={{ borderColor: region?.colorHex + '40' }}
      >
        {/* Ability bar */}
        {myPlayer?.abilities && (
          <AbilityBar
            abilities={myPlayer.abilities}
            abilityRanks={myPlayer.ability_ranks || {}}
            cooldowns={cooldowns}
            onUseAbility={(slot) => handleAction({ id: `use_${slot}`, label: `Use ${slot}`, type: 'ability', payload: { slot } })}
            disabled={actionLoading || !isInCombat}
            regionColor={region?.colorHex}
          />
        )}

        {/* Action buttons */}
        <ActionButtons
          actions={availableActions}
          onAction={handleAction}
          disabled={actionLoading}
          campaignState={campaign?.state}
          regionColor={region?.colorHex}
        />

        {/* Bottom status strip */}
        <div className="flex items-center justify-between px-4 py-2 text-xs font-mono text-gray-600 border-t border-border/50">
          <span>{isInCombat ? `⚔ Combat — Round ${combatState?.round || 1}` : `◈ ${campaign?.state || 'exploration'}`}</span>
          <span className={`font-mono ${goldFlash ? 'gold-flash text-gold-300' : 'text-yellow-700'}`}>
            ◈ {myPlayer?.gold || 0}g
          </span>
          <button
            onClick={() => navigate('/lobby')}
            className="text-gray-700 hover:text-gray-500 transition-colors"
          >
            ⏸ Pause
          </button>
        </div>
      </div>

      {/* Floating damage numbers */}
      {dmgNumbers.map(d => (
        <div
          key={d.key}
          className="fixed pointer-events-none font-display text-gold-300 font-bold text-lg dmg-float z-50"
          style={{ left: d.x + '%', top: d.y + '%', textShadow: '0 0 10px rgba(212,175,55,0.8)' }}
        >
          +{d.value}
        </div>
      ))}

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-900/90 border border-red-500/50 rounded-lg text-red-300 text-sm font-body shadow-xl">
          {error}
          <button onClick={clearError} className="ml-4 text-red-500 hover:text-red-300">✕</button>
        </div>
      )}
    </div>
  );
}
