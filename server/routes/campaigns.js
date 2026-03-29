const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const combat = require('../services/combat');
const narrator = require('../services/narrator');

// ── POST /api/campaigns ─────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { name, region_id, hardcore = false } = req.body;
    if (!name || !region_id) return res.status(400).json({ error: 'Name and region_id required' });

    // Validate region
    const regionCheck = await pool.query('SELECT id FROM regions WHERE id = $1', [region_id]);
    if (!regionCheck.rows[0]) return res.status(404).json({ error: 'Region not found' });

    const result = await pool.query(
      `INSERT INTO campaigns (name, dm_user_id, region_id, state, settings)
       VALUES ($1, $2, $3, 'lobby', $4)
       RETURNING *`,
      [name, req.user.id, region_id, JSON.stringify({ hardcore })]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create campaign error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/campaigns/:id ──────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const campResult = await pool.query(
      `SELECT c.*, r.name as region_name, r.color_hex, r.icon_emoji, r.terrain_effect, r.native_buff, r.enemy_debuff, r.native_champions
       FROM campaigns c
       JOIN regions r ON c.region_id = r.id
       WHERE c.id = $1`,
      [req.params.id]
    );
    if (!campResult.rows[0]) return res.status(404).json({ error: 'Campaign not found' });

    const campaign = campResult.rows[0];

    // Get players
    const playersResult = await pool.query(
      `SELECT pc.*, u.username, ch.name as champion_name, ch.title, ch.role, ch.region as champion_region
       FROM player_characters pc
       JOIN users u ON pc.user_id = u.id
       JOIN champions ch ON pc.champion_id = ch.id
       WHERE pc.campaign_id = $1`,
      [req.params.id]
    );

    res.json({ ...campaign, players: playersResult.rows });
  } catch (err) {
    console.error('Get campaign error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/campaigns/:id/join ────────────────────────────────────────────
router.post('/:id/join', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { champion_id } = req.body;
    if (!champion_id) return res.status(400).json({ error: 'champion_id required' });

    await client.query('BEGIN');

    // Check campaign
    const campResult = await client.query('SELECT * FROM campaigns WHERE id = $1', [req.params.id]);
    const campaign = campResult.rows[0];
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (campaign.state !== 'lobby') return res.status(400).json({ error: 'Campaign already started' });

    // Check player count
    const countResult = await client.query(
      'SELECT COUNT(*) FROM campaign_players WHERE campaign_id = $1', [req.params.id]
    );
    if (parseInt(countResult.rows[0].count) >= 5) {
      return res.status(400).json({ error: 'Campaign is full (max 5 players)' });
    }

    // Get champion
    const champResult = await client.query('SELECT * FROM champions WHERE id = $1', [champion_id.toLowerCase()]);
    const champion = champResult.rows[0];
    if (!champion) return res.status(404).json({ error: 'Champion not found' });

    // Add to campaign_players
    await client.query(
      'INSERT INTO campaign_players (campaign_id, user_id, champion_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [req.params.id, req.user.id, champion_id.toLowerCase()]
    );

    // Create player character
    const baseStats = champion.base_stats;
    await client.query(
      `INSERT INTO player_characters (user_id, campaign_id, champion_id, current_hp, current_mana, stats)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, campaign_id) DO UPDATE SET champion_id = EXCLUDED.champion_id, stats = EXCLUDED.stats`,
      [req.user.id, req.params.id, champion_id.toLowerCase(), baseStats.hp, baseStats.mana, JSON.stringify(baseStats)]
    );

    await client.query('COMMIT');
    res.json({ message: 'Joined campaign', champion: champion.name });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return res.status(409).json({ error: 'Already in this campaign' });
    console.error('Join campaign error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// ── POST /api/campaigns/:id/start ───────────────────────────────────────────
router.post('/:id/start', auth, async (req, res) => {
  try {
    const campResult = await pool.query(
      `SELECT c.*, r.* FROM campaigns c JOIN regions r ON c.region_id = r.id WHERE c.id = $1`,
      [req.params.id]
    );
    const campaign = campResult.rows[0];
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (campaign.dm_user_id !== req.user.id) return res.status(403).json({ error: 'Only the DM can start' });
    if (campaign.state !== 'lobby') return res.status(400).json({ error: 'Campaign already started' });

    // Get all players
    const playersResult = await pool.query(
      `SELECT pc.*, ch.name as champion_name, ch.region as champion_region
       FROM player_characters pc JOIN champions ch ON pc.champion_id = ch.id
       WHERE pc.campaign_id = $1`,
      [req.params.id]
    );
    const players = playersResult.rows;

    if (players.length === 0) return res.status(400).json({ error: 'Need at least 1 player to start' });

    // Generate opening scene via AI narrator
    const region = {
      id: campaign.region_id,
      name: campaign.name_2 || campaign.region_id,
      description: campaign.description,
      terrain_effect: campaign.terrain_effect,
      native_buff: campaign.native_buff,
      enemy_debuff: campaign.enemy_debuff,
    };
    // Fix: region fields come from JOIN
    const regionData = {
      id: campaign.region_id,
      name: campaign.name, // This is the campaign name — fix with explicit alias below
    };

    // Re-query with explicit aliases
    const campRegionResult = await pool.query(
      `SELECT c.id as campaign_id, c.name as campaign_name, c.dm_user_id, c.state, c.settings,
              r.id as region_id, r.name as region_name, r.description as region_description,
              r.terrain_effect, r.native_buff, r.enemy_debuff, r.native_champions, r.color_hex, r.icon_emoji
       FROM campaigns c JOIN regions r ON c.region_id = r.id WHERE c.id = $1`,
      [req.params.id]
    );
    const cr = campRegionResult.rows[0];

    const openingScene = await narrator.narrateOpeningScene({
      campaign: {
        state: 'exploration',
        region: {
          id: cr.region_id,
          name: cr.region_name,
          description: cr.region_description,
          terrain_effect: cr.terrain_effect,
          native_buff: cr.native_buff,
        },
      },
      players,
    });

    // Update campaign state
    await pool.query(
      `UPDATE campaigns SET state = 'exploration', current_scene = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify({ description: openingScene.narrative, available_actions: openingScene.available_actions }), req.params.id]
    );

    // Save opening narrative to history
    await pool.query(
      `INSERT INTO history_entries (campaign_id, type, content, actor) VALUES ($1, 'narrative', $2, 'narrator')`,
      [req.params.id, openingScene.narrative]
    );

    res.json({ message: 'Campaign started', scene: openingScene });
  } catch (err) {
    console.error('Start campaign error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/campaigns/:id/action ──────────────────────────────────────────
// The main game loop
router.post('/:id/action', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { action } = req.body;
    if (!action) return res.status(400).json({ error: 'action required' });

    await client.query('BEGIN');

    // Load full campaign state
    const campResult = await client.query(
      `SELECT c.*, r.id as region_id, r.name as region_name, r.description as region_description,
              r.terrain_effect, r.native_buff, r.enemy_debuff, r.native_champions, r.color_hex, r.icon_emoji
       FROM campaigns c JOIN regions r ON c.region_id = r.id WHERE c.id = $1 FOR UPDATE`,
      [req.params.id]
    );
    if (!campResult.rows[0]) return res.status(404).json({ error: 'Campaign not found' });
    const cr = campResult.rows[0];

    // Load player character
    const pcResult = await client.query(
      `SELECT pc.*, ch.name as champion_name, ch.abilities, ch.passive, ch.region as champion_region, u.username
       FROM player_characters pc
       JOIN champions ch ON pc.champion_id = ch.id
       JOIN users u ON pc.user_id = u.id
       WHERE pc.user_id = $1 AND pc.campaign_id = $2 FOR UPDATE`,
      [req.user.id, req.params.id]
    );
    if (!pcResult.rows[0]) return res.status(404).json({ error: 'Player character not found' });
    let pc = pcResult.rows[0];

    const region = {
      id: cr.region_id, name: cr.region_name, description: cr.region_description,
      terrain_effect: cr.terrain_effect, native_buff: cr.native_buff,
      enemy_debuff: cr.enemy_debuff, native_champions: cr.native_champions,
    };

    let combatState = cr.combat_state;
    let actionResult = { description: '', damage: 0, effects: [], deaths: [], xp_gain: 0, gold_gain: 0 };

    // ── Handle action type ───────────────────────────────────────────────────
    if (action.type === 'ability' && cr.state === 'combat') {
      const slot = action.payload?.slot;
      const abilities = pc.abilities || [];
      const ability = abilities.find(a => a.slot === slot);

      if (!ability) {
        actionResult.description = `${pc.champion_name} tried to use ${slot} but it failed.`;
      } else {
        const rank = (pc.ability_ranks || {})[slot] || 1;
        const cooldowns = pc.status_effects?.find(e => e.effect === 'cooldown') || {};

        // Pick target (first living enemy)
        const enemies = combatState?.enemies || [];
        const targetEnemy = enemies.find(e => e.hp > 0);

        if (targetEnemy) {
          const dmg = combat.calcDamage(ability, rank, pc.stats, targetEnemy.stats);
          targetEnemy.hp = Math.max(0, targetEnemy.hp - dmg);
          actionResult.damage = dmg;
          actionResult.description = `${pc.champion_name} used ${ability.name} on ${targetEnemy.name} for ${dmg} damage.`;

          // Apply effects
          for (const eff of (ability.effect || [])) {
            targetEnemy.status_effects = [...(targetEnemy.status_effects || []), { ...eff, source: pc.champion_id }];
            actionResult.effects.push(`${eff.type} on ${targetEnemy.name}`);
          }

          // Mana cost
          const manaIdx = Math.min(rank - 1, (ability.mana_cost?.length || 1) - 1);
          const manaCost = ability.mana_cost?.[manaIdx] || 0;
          pc.current_mana = Math.max(0, pc.current_mana - manaCost);

          // Check enemy deaths
          const dead = enemies.filter(e => e.hp <= 0);
          for (const d of dead) {
            actionResult.deaths.push(d.name);
            const killGold = combat.calcKillGold(d.level || 1);
            actionResult.gold_gain += killGold;
            actionResult.xp_gain += 50 + (d.level || 1) * 15;

            // Loot drops
            for (const loot of (d.loot_table || [])) {
              if (Math.random() < loot.drop_chance) {
                actionResult.gold_gain += loot.gold_value;
              }
            }
          }

          // Update combat state
          combatState = {
            ...combatState,
            enemies: enemies,
            round: (combatState?.round || 1),
            phase: 'enemy_turn',
          };

          // Check win condition
          const allDead = enemies.every(e => e.hp <= 0);
          if (allDead) {
            combatState.phase = 'resolution';
            // Apply XP and level ups
            pc = combat.applyXpAndLevelUp(pc, actionResult.xp_gain);
            pc.gold = (pc.gold || 500) + actionResult.gold_gain;
          }
        } else {
          actionResult.description = `No valid targets. The battle may be over.`;
        }
      }

    } else if (action.type === 'rest') {
      const healAmt = Math.round(pc.stats.hp * 0.3);
      pc.current_hp = Math.min(pc.stats.hp, pc.current_hp + healAmt);
      pc.current_mana = Math.min(pc.stats.mana, pc.current_mana + Math.round(pc.stats.mana * 0.5));
      actionResult.description = `${pc.champion_name} rests and recovers ${healAmt} HP.`;

    } else if (action.type === 'shop') {
      await client.query(`UPDATE campaigns SET state = 'shop', updated_at = NOW() WHERE id = $1`, [req.params.id]);
      actionResult.description = `${pc.champion_name} visits the shop.`;

    } else if (action.type === 'item' && action.payload?.item_id) {
      // Item purchase
      const itemRes = await client.query('SELECT * FROM items WHERE id = $1', [action.payload.item_id]);
      const item = itemRes.rows[0];
      if (item && pc.gold >= item.cost && (pc.items || []).length < 6) {
        pc.gold -= item.cost;
        pc.items = [...(pc.items || []), item.id];
        // Recompute stats would happen here
        actionResult.description = `${pc.champion_name} purchased ${item.name}.`;
        actionResult.gold_gain = -item.cost;
      }

    } else {
      actionResult.description = `${pc.champion_name} ${action.label || 'takes an action'}.`;
    }

    // ── Status effect ticks (for current player) ─────────────────────────────
    const tickResult = combat.tickStatusEffects(pc);
    pc = { ...tickResult.entity, current_hp: Math.max(0, pc.current_hp + tickResult.hpChange) };

    // ── Apply terrain effect ────────────────────────────────────────────────
    if (region.terrain_effect?.stat_modifier && cr.state === 'combat') {
      const tm = region.terrain_effect.stat_modifier;
      if (tm.movement_speed) pc.stats = { ...pc.stats, movement_speed: Math.max(0, (pc.stats.movement_speed || 300) + (tm.movement_speed || 0)) };
    }

    // ── Death check ─────────────────────────────────────────────────────────
    const hardcore = cr.settings?.hardcore;
    if (pc.current_hp <= 0 && !hardcore) {
      pc.current_hp = Math.round(pc.stats.hp * 0.4);
      pc.status_effects = [];
      actionResult.description += ` ${pc.champion_name} fell but returns to the fight!`;
    }

    // ── Save player character ───────────────────────────────────────────────
    await client.query(
      `UPDATE player_characters SET
         current_hp = $1, current_mana = $2, gold = $3, xp = $4, level = $5,
         items = $6, status_effects = $7, stats = $8, ability_ranks = $9, updated_at = NOW()
       WHERE id = $10`,
      [
        pc.current_hp, pc.current_mana, pc.gold || 500, pc.xp || 0, pc.level || 1,
        JSON.stringify(pc.items || []),
        JSON.stringify(pc.status_effects || []),
        JSON.stringify(pc.stats),
        JSON.stringify(pc.ability_ranks || { Q: 1, W: 1, E: 1, R: 0 }),
        pc.id,
      ]
    );

    // ── Update campaign ────────────────────────────────────────────────────
    const newCampaignState = combatState?.phase === 'resolution'
      ? (combatState.enemies.every(e => e.hp <= 0) ? 'shop' : 'exploration')
      : cr.state;

    await client.query(
      `UPDATE campaigns SET combat_state = $1, state = $2, updated_at = NOW() WHERE id = $3`,
      [JSON.stringify(combatState), newCampaignState, req.params.id]
    );

    // ── AI Narrator ────────────────────────────────────────────────────────
    const allPlayers = await client.query(
      `SELECT pc.*, ch.name as champion_name FROM player_characters pc
       JOIN champions ch ON pc.champion_id = ch.id WHERE pc.campaign_id = $1`,
      [req.params.id]
    );

    const narration = await narrator.narrateAction({
      campaign: { state: newCampaignState, region },
      players: allPlayers.rows,
      action: { actor: pc.champion_name, description: actionResult.description, payload: action.payload },
      result: actionResult,
      combatState,
    });

    // ── Save to history ────────────────────────────────────────────────────
    await client.query(
      `INSERT INTO history_entries (campaign_id, type, content, actor) VALUES ($1, 'combat', $2, $3)`,
      [req.params.id, actionResult.description, pc.username || 'player']
    );
    await client.query(
      `INSERT INTO history_entries (campaign_id, type, content, actor) VALUES ($1, 'narrative', $2, 'narrator')`,
      [req.params.id, narration.narrative]
    );

    // ── Update scene with narrator's actions ──────────────────────────────
    await client.query(
      `UPDATE campaigns SET current_scene = $1 WHERE id = $2`,
      [JSON.stringify({ description: narration.narrative, available_actions: narration.available_actions }), req.params.id]
    );

    await client.query('COMMIT');

    res.json({
      narrative: narration.narrative,
      available_actions: narration.available_actions,
      state_changes: narration.state_changes,
      combat_state: combatState,
      player: { level: pc.level, xp: pc.xp, gold: pc.gold, current_hp: pc.current_hp, current_mana: pc.current_mana, items: pc.items, status_effects: pc.status_effects },
      campaign_state: newCampaignState,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Action error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  } finally {
    client.release();
  }
});

// ── GET /api/campaigns/:id/history ─────────────────────────────────────────
router.get('/:id/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const result = await pool.query(
      `SELECT * FROM history_entries WHERE campaign_id = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3`,
      [req.params.id, limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/campaigns/:id/encounter ──────────────────────────────────────
// DM starts a combat encounter
router.post('/:id/encounter', auth, async (req, res) => {
  try {
    const { enemies } = req.body;
    if (!enemies || !Array.isArray(enemies)) return res.status(400).json({ error: 'enemies array required' });

    const campResult = await pool.query('SELECT * FROM campaigns WHERE id = $1', [req.params.id]);
    const campaign = campResult.rows[0];
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (campaign.dm_user_id !== req.user.id) return res.status(403).json({ error: 'Only DM can start encounters' });

    const playersResult = await pool.query(
      `SELECT pc.*, ch.name as champion_name FROM player_characters pc JOIN champions ch ON pc.champion_id = ch.id WHERE pc.campaign_id = $1`,
      [req.params.id]
    );
    const players = playersResult.rows;

    // Build initiative order
    const allCombatants = [
      ...players.map(p => ({ id: p.id, type: 'player', stats: p.stats, name: p.champion_name })),
      ...enemies.map(e => ({ id: e.id, type: 'enemy', stats: e.stats, name: e.name })),
    ];
    const turnOrder = allCombatants
      .map(c => ({ id: c.id, initiative: combat.rollInitiative(c) }))
      .sort((a, b) => b.initiative - a.initiative)
      .map(c => c.id);

    // Apply region buffs to all players
    const regionResult = await pool.query('SELECT * FROM regions WHERE id = $1', [campaign.region_id]);
    const region = regionResult.rows[0];

    const combatState = {
      turn_order: turnOrder,
      current_turn_index: 0,
      round: 1,
      enemies: enemies.map(e => ({
        ...e,
        status_effects: [],
      })),
      phase: 'player_turn',
    };

    await pool.query(
      `UPDATE campaigns SET state = 'combat', combat_state = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(combatState), req.params.id]
    );

    // Apply region buffs to players
    for (const p of players) {
      const buffedPlayer = combat.applyRegionBuffs({ ...p, region: p.champion_region }, region);
      await pool.query(
        `UPDATE player_characters SET status_effects = $1 WHERE id = $2`,
        [JSON.stringify(buffedPlayer.status_effects), p.id]
      );
    }

    res.json({ message: 'Encounter started', combat_state: combatState });
  } catch (err) {
    console.error('Encounter error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
