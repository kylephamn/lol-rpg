const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the Dungeon Master for a text-based RPG set in the League of Legends universe (Runeterra).
You narrate scenes, describe combat, and give the player meaningful choices.

Rules:
- Always stay in the Runeterra lore universe. Do not reference the video game itself.
- Narrate in second person ("You step into the...")
- Keep narrative responses to 3-5 sentences unless describing a major event.
- After narrating, ALWAYS return a JSON block with this exact structure:
  {
    "narrative": "string",
    "available_actions": [
      { "id": "string", "label": "string", "type": "ability|item|move|talk|shop|rest|custom", "payload": {} }
    ],
    "state_changes": {
      "xp_gain": number,
      "gold_gain": number,
      "new_enemies": null,
      "scene_transition": null
    }
  }
- Never break character. Never mention JSON in narration.
- Honor the region buffs and terrain effects described in the campaign context.
- Make ability names sound like physical actions in the world, not game mechanics.
- Enemies should taunt, react emotionally, and feel alive.
- Deaths should be dramatic and meaningful. Victory should feel earned.
- Always provide 3-5 varied available_actions appropriate to the current situation.`;

/**
 * Build the user-turn prompt from campaign state + action result
 */
const buildUserPrompt = ({ campaign, players, action, result, combatState }) => {
  const region = campaign.region;
  const cs = combatState || campaign.combat_state;

  const playerSummary = players.map(p =>
    `${p.champion_name} (Level ${p.level}, HP: ${p.current_hp}/${p.stats?.hp || '?'}${p.current_mana > 0 ? `, Mana: ${p.current_mana}` : ''})`
  ).join(', ');

  const enemySummary = cs?.enemies?.map(e =>
    `${e.name} (HP: ${e.hp}/${e.max_hp}${e.status_effects?.length ? `, afflicted: ${e.status_effects.map(se => se.effect).join(',')}` : ''})`
  ).join(', ') || 'None';

  const regionInfo = region ? `${region.name} — ${region.terrain_effect?.description || ''}` : 'Summoner\'s Rift (neutral)';

  return `CAMPAIGN STATE:
- Region/Battleground: ${regionInfo}
- Round: ${cs?.round || 1}
- Campaign State: ${campaign.state}
- Active players: ${playerSummary}
- Enemies: ${enemySummary}

PLAYER ACTION:
${action?.actor || 'Player'} ${action?.description || 'took an action'}.
${action?.payload ? `Details: ${JSON.stringify(action.payload)}` : ''}

RESULT:
${result?.description || 'The action resolved.'}
${result?.damage ? `Damage dealt: ${result.damage}` : ''}
${result?.effects?.length ? `Effects applied: ${result.effects.join(', ')}` : ''}
${result?.deaths?.length ? `Fallen: ${result.deaths.join(', ')}` : ''}
${result?.xp_gain ? `XP gained: ${result.xp_gain}` : ''}
${result?.gold_gain ? `Gold gained: ${result.gold_gain}` : ''}

Continue the narrative and provide the next available actions.`;
};

/**
 * Call the Claude API narrator
 */
const narrateAction = async ({ campaign, players, action, result, combatState }) => {
  const userPrompt = buildUserPrompt({ campaign, players, action, result, combatState });

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const rawText = response.content[0]?.text || '';

    // Extract JSON block from narrative response
    const jsonMatch = rawText.match(/\{[\s\S]*"narrative"[\s\S]*"available_actions"[\s\S]*\}/);
    if (!jsonMatch) {
      // Fallback if no JSON found
      return {
        narrative: rawText.trim(),
        available_actions: defaultActions(campaign.state),
        state_changes: { xp_gain: 0, gold_gain: 0, new_enemies: null, scene_transition: null },
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (err) {
    console.error('Narrator error:', err.message);
    return {
      narrative: 'The winds of fate shift. What will you do next?',
      available_actions: defaultActions(campaign.state),
      state_changes: { xp_gain: 0, gold_gain: 0, new_enemies: null, scene_transition: null },
    };
  }
};

/**
 * Generate opening scene for a new campaign
 */
const narrateOpeningScene = async ({ campaign, players }) => {
  const region = campaign.region;
  const playerList = players.map(p => p.champion_name).join(', ');

  const prompt = `A new adventure begins in ${region?.name || 'Runeterra'}.

The party consists of: ${playerList}.
Region description: ${region?.description || 'A land of conflict and magic.'}
Terrain conditions: ${region?.terrain_effect?.description || 'Standard conditions.'}

Open the campaign with an atmospheric introduction to the region. Describe the immediate surroundings and give the party their first meaningful choices. Make it feel cinematic.

CAMPAIGN STATE:
- Region: ${region?.name || 'Unknown'}
- Campaign State: exploration
- Players: ${playerList}
- Enemies: None yet

PLAYER ACTION: Campaign begins — party arrives in the region.

RESULT: First moments in ${region?.name || 'the region'}.

Narrate the opening scene dramatically.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const rawText = response.content[0]?.text || '';
    const jsonMatch = rawText.match(/\{[\s\S]*"narrative"[\s\S]*"available_actions"[\s\S]*\}/);

    if (!jsonMatch) {
      return {
        narrative: rawText.trim(),
        available_actions: defaultActions('exploration'),
        state_changes: { xp_gain: 0, gold_gain: 0, new_enemies: null, scene_transition: null },
      };
    }
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('Opening scene error:', err.message);
    return {
      narrative: `You arrive in ${region?.name || 'this land'}, the air thick with the promise of conflict. The world stretches before you, dangerous and alive.`,
      available_actions: defaultActions('exploration'),
      state_changes: { xp_gain: 0, gold_gain: 0, new_enemies: null, scene_transition: null },
    };
  }
};

const defaultActions = (state) => {
  if (state === 'combat') {
    return [
      { id: 'use_q', label: 'Use Q Ability', type: 'ability', payload: { slot: 'Q' } },
      { id: 'use_w', label: 'Use W Ability', type: 'ability', payload: { slot: 'W' } },
      { id: 'use_e', label: 'Use E Ability', type: 'ability', payload: { slot: 'E' } },
      { id: 'use_r', label: 'Use Ultimate (R)', type: 'ability', payload: { slot: 'R' } },
    ];
  }
  return [
    { id: 'explore', label: 'Explore the area', type: 'move', payload: {} },
    { id: 'rest', label: 'Rest and recover', type: 'rest', payload: {} },
    { id: 'shop', label: 'Visit the shop', type: 'shop', payload: {} },
    { id: 'advance', label: 'Press forward', type: 'move', payload: {} },
  ];
};

module.exports = { narrateAction, narrateOpeningScene };
