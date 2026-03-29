/**
 * Combat Resolution Service
 * Implements all rules from Section 3 of the spec.
 */

// ── Damage formula ─────────────────────────────────────────────────────────
const calcDamage = (ability, rank, attackerStats, targetStats) => {
  const r = Math.max(0, rank - 1);
  const baseDmg = ability.base_damage[r] || ability.base_damage[0] || 0;

  let scalingBonus = 0;
  for (const scaleType of (ability.scaling || [])) {
    switch (scaleType) {
      case 'ad': scalingBonus += (attackerStats.attack_damage || 0) * (ability.scaling_ratio || 0); break;
      case 'ap': scalingBonus += (attackerStats.ability_power || 0) * (ability.scaling_ratio || 0); break;
      case 'hp': scalingBonus += (attackerStats.hp || 0) * (ability.scaling_ratio || 0); break;
      case 'armor': scalingBonus += (attackerStats.armor || 0) * (ability.scaling_ratio || 0); break;
      case 'mr': scalingBonus += (attackerStats.magic_resist || 0) * (ability.scaling_ratio || 0); break;
    }
  }

  const rawDamage = baseDmg + scalingBonus;

  // Apply resistance reduction
  let finalDamage = rawDamage;
  if (ability.damage_type === 'physical') {
    const armor = Math.max(0, targetStats.armor || 0);
    finalDamage = rawDamage * (100 / (100 + armor));
  } else if (ability.damage_type === 'magic') {
    const mr = Math.max(0, targetStats.magic_resist || 0);
    finalDamage = rawDamage * (100 / (100 + mr));
  }
  // 'true' damage bypasses all resistances

  return Math.max(0, Math.round(finalDamage));
};

// ── Initiative roll ─────────────────────────────────────────────────────────
const rollInitiative = (entity) => {
  const d20 = Math.floor(Math.random() * 20) + 1;
  const msBonus = Math.floor((entity.stats?.movement_speed || 300) / 30);
  return d20 + msBonus;
};

// ── Region buff application ─────────────────────────────────────────────────
const applyRegionBuffs = (player, region) => {
  if (!region) return player;

  const effects = [...(player.status_effects || [])];

  // Check if player is native
  const nativeChamps = region.native_champions || [];
  const isNative = nativeChamps.includes(player.champion_id);

  if (isNative && region.native_buff?.stat_modifier) {
    effects.push({
      effect: 'empower',
      duration: 999,
      value: 0,
      source: `region_buff_${region.id}`,
      stat_modifier: region.native_buff.stat_modifier,
      label: `${region.name} Native`,
    });
  }

  // Check enemy debuff
  const ENEMY_PAIRS = {
    noxus: 'demacia',
    demacia: 'noxus',
    void: 'shurima',
    shurima: 'void',
    piltover: 'zaun',
    zaun: 'piltover',
  };
  const shadowIslesDebuffs = ['noxus', 'demacia', 'freljord', 'ionia', 'piltover', 'zaun', 'bilgewater', 'targon', 'shurima', 'void', 'ixtal'];

  let shouldDebuff = false;
  if (region.enemy_debuff) {
    if (region.id === 'shadow_isles') {
      shouldDebuff = shadowIslesDebuffs.includes(player.region);
    } else if (region.enemy_debuff.condition === 'always') {
      shouldDebuff = !isNative;
    } else if (region.enemy_debuff.condition === 'enemy_region') {
      shouldDebuff = ENEMY_PAIRS[region.id] === player.region || ENEMY_PAIRS[player.region] === region.id;
    }
  }

  if (shouldDebuff && region.enemy_debuff?.stat_modifier) {
    effects.push({
      effect: 'slow',
      duration: 999,
      value: 0,
      source: `region_debuff_${region.id}`,
      stat_modifier: region.enemy_debuff.stat_modifier,
      label: `${region.name} Debuff`,
    });
  }

  return { ...player, status_effects: effects };
};

// ── Status effect tick ──────────────────────────────────────────────────────
const tickStatusEffects = (entity) => {
  let hpChange = 0;
  const newEffects = [];

  for (const eff of (entity.status_effects || [])) {
    if (eff.duration <= 0) continue;

    if (eff.effect === 'burn' || eff.effect === 'bleed' || eff.effect === 'poison') {
      hpChange -= eff.value;
    }
    if (eff.effect === 'heal') {
      hpChange += eff.value;
    }

    const remaining = { ...eff, duration: eff.duration - 1 };
    if (remaining.duration > 0) newEffects.push(remaining);
  }

  return {
    entity: { ...entity, status_effects: newEffects },
    hpChange,
  };
};

// ── Cooldown decrement ──────────────────────────────────────────────────────
const decrementCooldowns = (cooldowns) => {
  const next = {};
  for (const [slot, cd] of Object.entries(cooldowns || {})) {
    next[slot] = Math.max(0, (cd || 0) - 1);
  }
  return next;
};

// ── Win/loss condition check ────────────────────────────────────────────────
const checkCombatEnd = (players, enemies) => {
  const allPlayersDown = players.every(p => p.current_hp <= 0);
  const allEnemiesDown = enemies.every(e => e.hp <= 0);

  if (allEnemiesDown) return 'victory';
  if (allPlayersDown) return 'defeat';
  return null;
};

// ── XP threshold ────────────────────────────────────────────────────────────
const xpToLevel = (level) => level * 100;

const applyXpAndLevelUp = (player, xpGain) => {
  let { level, xp } = player;
  xp += xpGain;

  while (level < 18 && xp >= xpToLevel(level)) {
    xp -= xpToLevel(level);
    level++;
    // HP increases by 7% per level
    player = {
      ...player,
      current_hp: Math.round(player.current_hp + player.stats.hp * 0.07),
    };
  }
  return { ...player, level, xp };
};

// ── Compute stats from base + items + runes ─────────────────────────────────
const computeStats = (champion, itemList, runeBonus = {}) => {
  const base = { ...champion.base_stats };

  for (const item of itemList) {
    if (!item?.stats) continue;
    for (const [stat, val] of Object.entries(item.stats)) {
      if (typeof val === 'number') {
        base[stat] = (base[stat] || 0) + val;
      }
    }
  }

  for (const [stat, val] of Object.entries(runeBonus)) {
    if (typeof val === 'number') {
      base[stat] = (base[stat] || 0) + val;
    }
  }

  return base;
};

// ── Gold reward for killing an enemy ────────────────────────────────────────
const calcKillGold = (enemyLevel) => 50 + (enemyLevel || 1) * 10;

module.exports = {
  calcDamage,
  rollInitiative,
  applyRegionBuffs,
  tickStatusEffects,
  decrementCooldowns,
  checkCombatEnd,
  applyXpAndLevelUp,
  computeStats,
  calcKillGold,
};
