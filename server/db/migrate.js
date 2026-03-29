const pool = require('./pool');

const migrations = [
  {
    name: '001_schema',
    sql: `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS champions (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(200),
  region VARCHAR(50),
  role VARCHAR(20),
  lore_blurb TEXT,
  base_stats JSONB NOT NULL,
  abilities JSONB DEFAULT '[]',
  passive JSONB,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS regions (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  terrain_effect JSONB,
  native_buff JSONB,
  enemy_debuff JSONB,
  native_champions JSONB DEFAULT '[]',
  color_hex VARCHAR(7),
  icon_emoji VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS items (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  cost INTEGER NOT NULL,
  tier INTEGER NOT NULL CHECK (tier IN (1,2,3)),
  stats JSONB DEFAULT '{}',
  passive_name VARCHAR(100),
  passive_description TEXT,
  active_name VARCHAR(100),
  active_description TEXT,
  active_cooldown INTEGER,
  tags JSONB DEFAULT '[]',
  build_from JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  dm_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  region_id VARCHAR(50) REFERENCES regions(id),
  state VARCHAR(20) DEFAULT 'lobby',
  current_scene JSONB,
  combat_state JSONB,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_players (
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  champion_id VARCHAR(50) REFERENCES champions(id),
  PRIMARY KEY (campaign_id, user_id)
);

CREATE TABLE IF NOT EXISTS player_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  champion_id VARCHAR(50) NOT NULL,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 500,
  current_hp INTEGER NOT NULL,
  current_mana INTEGER NOT NULL,
  ability_ranks JSONB DEFAULT '{"Q":1,"W":1,"E":1,"R":0}',
  items JSONB DEFAULT '[]',
  rune_page JSONB,
  status_effects JSONB DEFAULT '[]',
  stats JSONB NOT NULL,
  UNIQUE(user_id, campaign_id)
);

CREATE TABLE IF NOT EXISTS history_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  actor VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_campaign ON history_entries(campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_player_chars_campaign ON player_characters(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_players_campaign ON campaign_players(campaign_id);
    `,
  },
  {
    name: '002_seed_regions',
    sql: `
INSERT INTO regions (id, name, description, terrain_effect, native_buff, enemy_debuff, native_champions, color_hex, icon_emoji) VALUES
('noxus', 'Noxus', 'A brutal empire that values strength above all else. Its blood-soaked banners stretch across conquered lands.',
 '{"description":"The stench of war hangs heavy — soldiers fight with savage fury. All combatants deal 5% bonus physical damage.","trigger":"every_round","stat_modifier":{"attack_damage":5},"special_rule":"Any champion who kills an enemy this round gains a stack of Conquest (+10 AD) for the rest of combat."}',
 '{"description":"Noxian warriors thrive in the heat of battle, growing stronger with each strike.","stat_modifier":{"attack_damage":20,"armor":10,"hp":150},"bonus_ability_effect":"Physical abilities that deal damage to a bleeding target deal 15% bonus damage."}',
 '{"description":"Outsiders are ground down by Noxian aggression and intimidation.","stat_modifier":{"magic_resist":-10,"movement_speed":-15},"condition":"always"}',
 '["darius","draven","swain","katarina","talon","vladimir","mordekaiser","urgot","sion","leblanc","cassiopeia","kled","samira","rell"]',
 '#C4372A', '⚔️'),
('demacia', 'Demacia', 'A kingdom of rigid justice and anti-magic law. White stone walls hide a deep fear of sorcery.',
 '{"description":"The air crackles with anti-magic dampening fields. All magic damage is reduced by 8%.","trigger":"every_round","stat_modifier":{"magic_resist":8},"special_rule":"Mana costs for all abilities are increased by 5 each round as the dampeners grow stronger."}',
 '{"description":"Demacian champions fight with righteous conviction, bolstered by their homeland.","stat_modifier":{"armor":20,"magic_resist":15,"hp":200},"bonus_ability_effect":"Shield abilities have 25% increased value and last 1 extra turn."}',
 '{"description":"Mages are weakened by Demacian suppression fields.","stat_modifier":{"ability_power":-20,"mana":-50},"condition":"enemy_region"}',
 '["garen","lux","jarvaniv","fiora","vayne","poppy","galio","kayle","morgana","sylas","shyvana","xin zhao","quinn"]',
 '#4A90D9', '🛡️'),
('freljord', 'The Freljord', 'A frozen wasteland of ancient magic and brutal survival. Three warring tribes contest dominion over endless tundra.',
 '{"description":"Blizzard winds tear through the battlefield, slowing all movement.","trigger":"every_round","stat_modifier":{"movement_speed":-20},"special_rule":"All non-Freljord champions have their first ability each round deal 10% less damage due to frozen limbs."}',
 '{"description":"Freljord champions are hardened against the cold, their bodies tempered by the eternal winter.","stat_modifier":{"armor":15,"magic_resist":10,"hp":200},"bonus_ability_effect":"CC abilities applied by Freljord champions last 1 extra turn."}',
 '{"description":"The bone-deep cold saps the strength and concentration of outsiders.","stat_modifier":{"attack_damage":-10,"ability_power":-15},"condition":"always"}',
 '["ashe","sejuani","lissandra","tryndamere","braum","volibear","anivia","nunu","udyr","olaf","trundle"]',
 '#7EC8E3', '🏔️'),
('ionia', 'Ionia', 'The First Lands, rich with spirit energy and ancient balance. A place of beauty scarred by Noxian occupation.',
 '{"description":"The spirit realm bleeds into reality, empowering abilities with spiritual resonance.","trigger":"every_round","stat_modifier":{"ability_power":8},"special_rule":"All ability cooldowns are reduced by 1 additional round at end of each turn due to spiritual attunement."}',
 '{"description":"Ionian champions move with the flow of the spirit realm itself.","stat_modifier":{"ability_power":20,"movement_speed":20,"mana":100},"bonus_ability_effect":"Abilities that apply CC also grant the user a brief burst of Haste (+30 MS) for 1 turn."}',
 '{"description":"The spiritual energy of Ionia disorients those not attuned to its flow.","stat_modifier":{"attack_damage":-8,"movement_speed":-10},"condition":"enemy_region"}',
 '["yasuo","yone","zed","irelia","karma","kennen","ahri","akali","shen","master yi","wukong","riven","varus","xayah","rakan","kayn","jhin","kindred"]',
 '#C8A951', '🌸'),
('piltover', 'Piltover', 'The City of Progress, gleaming with hextech innovation. Science and magic merge in this mercantile powerhouse.',
 '{"description":"Hextech energy fields pulse through the air, amplifying technological gadgets and spells alike.","trigger":"every_round","stat_modifier":{"attack_speed":0.1},"special_rule":"Item active cooldowns are reduced by 1 at the end of each round."}',
 '{"description":"Piltover inventors have home-field advantage with their hextech devices fully charged.","stat_modifier":{"ability_power":15,"attack_speed":0.2,"mana":80},"bonus_ability_effect":"On-hit item effects trigger an additional time per combat round."}',
 '{"description":"Zaun-born champions are destabilized by Piltover hex-energy that discriminates against shimmer-augmented biology.","stat_modifier":{"hp":-100,"attack_damage":-10},"condition":"enemy_region"}',
 '["vi","caitlyn","jayce","heimerdinger","ezreal","ekko","camille","orianna","seraphine","zeri","jinx"]',
 '#B8860B', '⚙️'),
('zaun', 'Zaun', 'The undercity beneath Piltover, choked with chemtech fumes and desperate innovation. Shimmer flows through its veins.',
 '{"description":"Toxic chemtech fumes fill the air. All combatants take 8 true damage at the start of each round.","trigger":"every_round","stat_modifier":{},"special_rule":"Poison and burn effects applied in Zaun deal +3 bonus damage per tick."}',
 '{"description":"Zaun survivors have evolved to thrive in toxic environments, converting poison into power.","stat_modifier":{"armor":10,"hp":250,"attack_damage":15},"bonus_ability_effect":"Zaun champions are immune to poison/burn damage and instead heal for 50% of what they would have taken."}',
 '{"description":"Piltover-aligned champions find their hextech sputters in the corrosive Zaunite atmosphere.","stat_modifier":{"ability_power":-15,"attack_speed":-0.15},"condition":"enemy_region"}',
 '["jinx","viktor","singed","warwick","ekko","twitch","blitzcrank","urgot","zac","renata glasc"]',
 '#4A7C59', '☠️'),
('bilgewater', 'Bilgewater', 'A lawless port city of pirates, hunters, and sea monsters. Fortune favors the bold — and the ruthless.',
 '{"description":"The rolling seas make footing treacherous. All movement costs 5 more MS to execute effectively.","trigger":"every_round","stat_modifier":{"movement_speed":-5},"special_rule":"Crits deal an additional 15% damage due to the chaotic, reckless combat style of seasoned pirates."}',
 '{"description":"Bilgewater fighters are seasoned sea dogs who use the unpredictable terrain to their advantage.","stat_modifier":{"crit_chance":15,"attack_damage":15,"movement_speed":10},"bonus_ability_effect":"Critical strikes also apply a 20% slow for 1 turn."}',
 NULL,
 '["gangplank","miss fortune","twisted fate","graves","nautilus","illaoi","pyke","nilah","fizz"]',
 '#B5651D', '🏴‍☠️'),
('shadow_isles', 'Shadow Isles', 'A death-haunted archipelago shrouded in the Black Mist. The undead walk and the living suffer.',
 '{"description":"The Black Mist seeps into all wounds. Abilities deal 5 bonus magic damage as necrotic energy leaks through.","trigger":"every_round","stat_modifier":{},"special_rule":"Champions at or below 25% HP gain Undying Rage: +20% damage dealt and +10% damage taken."}',
 '{"description":"Shadow Isles denizens draw power from death itself, healing on kills and reveling in the Black Mist.","stat_modifier":{"ability_power":25,"hp":150},"bonus_ability_effect":"On kill, heal for 15% of max HP. CC abilities also apply a 5-damage necrotic burn for 2 turns."}',
 '{"description":"The Black Mist corrupts and saps the life force of the living.","stat_modifier":{"hp":-150,"magic_resist":-10},"condition":"always"}',
 '["thresh","hecarim","karthus","yorick","morgana","elise","nocturne","maokai","gwen","vex","senna","lucian"]',
 '#1A472A', '💀'),
('targon', 'Mount Targon', 'The peak that scrapes heaven. An impossibly tall mountain home to gods, aspects, and those mad enough to climb it.',
 '{"description":"Celestial energy rains down from above, empowering magic and weakening physical strikes.","trigger":"every_round","stat_modifier":{"ability_power":10,"attack_damage":-5},"special_rule":"At the start of each round, a random champion receives a Celestial Blessing: +20 AP or +15 AD for 1 turn."}',
 '{"description":"Targon Aspects channel divine power directly through their being.","stat_modifier":{"ability_power":30,"magic_resist":15,"hp":100},"bonus_ability_effect":"Healing abilities are 30% more effective. Ultimate abilities (R) deal bonus true damage equal to 5% of target max HP."}',
 NULL,
 '["leona","diana","taric","pantheon","aphelios","soraka","zoe","aurelionsol"]',
 '#FFD700', '✨'),
('shurima', 'Shurima', 'Ancient desert empire risen from the sand. Home to the Sun Disc, Ascended beings, and forgotten god-emperors.',
 '{"description":"The blazing Shuriman sun scorches all. Mana regeneration is halved, but Ascended abilities cost no mana.","trigger":"every_round","stat_modifier":{},"special_rule":"Every 3 rounds, a sandstorm hits: all non-Shurima champions take 25 magic damage and are blinded for 1 turn."}',
 '{"description":"Ascended Shuriman champions are empowered by the Sun Disc and ancient desert magic.","stat_modifier":{"ability_power":20,"attack_damage":15,"armor":10},"bonus_ability_effect":"Shurima champions passively restore 5% of max mana each round. Sand-based abilities reduce armor by 15% for 1 turn."}',
 '{"description":"The desert heat and spiritual weight of Shurima crushes outsiders.","stat_modifier":{"movement_speed":-15,"mana":-30},"condition":"always"}',
 '["nasus","renekton","sivir","azir","taliyah","xerath","rammus","amumu","skarner","akshan","naafiri"]',
 '#D4A017', '🏜️'),
('void', 'The Void', 'A tear in reality itself. The Nothing that hungers to consume all of existence. Pure horror given form.',
 '{"description":"Void energy destabilizes physical matter. All armor and MR values are reduced by 15% for all combatants.","trigger":"every_round","stat_modifier":{},"special_rule":"True damage bypasses all resistances here. Every 4 rounds, a Void Rift spawns, dealing 30 true damage to all non-Void champions."}',
 '{"description":"Void creatures are in their element — reality bends to feed their hunger.","stat_modifier":{"attack_damage":20,"ability_power":20,"hp":200},"bonus_ability_effect":"Void champions deal +10% true damage. Kill blows cause the target to explode for 20 magic damage to nearby enemies."}',
 '{"description":"The Void unmakes the mind and body. Non-Void champions are eaten from within.","stat_modifier":{"armor":-15,"magic_resist":-15,"hp":-100},"condition":"always"}',
 '["kassadin","malzahar","kha zix","cho gath","vel koz","kog maw","bel veth","rek sai"]',
 '#7B2FBE', '🕳️'),
('ixtal', 'Ixtal', 'A hidden jungle nation of elemental magic, isolationist and ancient. Elementalism flows through every living thing.',
 '{"description":"Elemental magic pulses through the jungle. Abilities that deal elemental damage (fire, ice, lightning, earth) deal +12% damage.","trigger":"every_round","stat_modifier":{},"special_rule":"At the start of each round, the active element rotates: Fire (+8 AD), Water (+8 MR), Earth (+8 Armor), Wind (+15 MS)."}',
 '{"description":"Ixtal elementalists are masters of their craft in their homeland.","stat_modifier":{"ability_power":25,"movement_speed":15,"mana":75},"bonus_ability_effect":"Elemental abilities apply a lingering secondary effect: fire=burn 3/turn, water=slow 25%, earth=root 1 turn, wind=haste 20MS."}',
 NULL,
 '["qiyana","nidalee","rengar","malphite","zyra","neeko"]',
 '#228B22', '🌿'),
('the_rift', 'Summoner''s Rift', 'The neutral proving ground where all champions meet as equals. The ancient magic here is balanced — no home advantage.',
 '{"description":"The Rift is neutral ground. Ancient wards maintain perfect balance between all forces.","trigger":"passive","stat_modifier":{},"special_rule":"No terrain effects active. All champions fight on equal footing here."}',
 '{"description":"No native buff — the Rift belongs to no one faction.","stat_modifier":{}}',
 NULL,
 '[]',
 '#2D5A27', '🗺️')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  terrain_effect = EXCLUDED.terrain_effect,
  native_buff = EXCLUDED.native_buff,
  enemy_debuff = EXCLUDED.enemy_debuff,
  native_champions = EXCLUDED.native_champions,
  color_hex = EXCLUDED.color_hex,
  icon_emoji = EXCLUDED.icon_emoji;
    `,
  },
  {
    name: '003_seed_items',
    sql: `
INSERT INTO items (id, name, cost, tier, stats, passive_name, passive_description, active_name, active_description, active_cooldown, tags, build_from) VALUES
('long_sword', 'Long Sword', 350, 1, '{"attack_damage":10}', NULL, NULL, NULL, NULL, NULL, '["damage"]', '[]'),
('amplifying_tome', 'Amplifying Tome', 435, 1, '{"ability_power":20}', NULL, NULL, NULL, NULL, NULL, '["damage"]', '[]'),
('cloth_armor', 'Cloth Armor', 300, 1, '{"armor":15}', NULL, NULL, NULL, NULL, NULL, '["tank"]', '[]'),
('null_magic_mantle', 'Null-Magic Mantle', 300, 1, '{"magic_resist":15}', NULL, NULL, NULL, NULL, NULL, '["tank"]', '[]'),
('ruby_crystal', 'Ruby Crystal', 400, 1, '{"hp":150}', NULL, NULL, NULL, NULL, NULL, '["tank"]', '[]'),
('pickaxe', 'Pickaxe', 875, 2, '{"attack_damage":25}', NULL, NULL, NULL, NULL, NULL, '["damage"]', '["long_sword"]'),
('needlessly_large_rod', 'Needlessly Large Rod', 1250, 2, '{"ability_power":40}', NULL, NULL, NULL, NULL, NULL, '["damage"]', '["amplifying_tome"]'),
('chain_vest', 'Chain Vest', 800, 2, '{"armor":40}', NULL, NULL, NULL, NULL, NULL, '["tank"]', '["cloth_armor"]'),
('negatron_cloak', 'Negatron Cloak', 900, 2, '{"magic_resist":30}', NULL, NULL, NULL, NULL, NULL, '["tank"]', '["null_magic_mantle"]'),
('vampiric_scepter', 'Vampiric Scepter', 900, 2, '{"attack_damage":15,"hp":100}', 'Lifesteal', 'Basic attacks restore 8% of damage dealt as health.', NULL, NULL, NULL, '["damage","healing"]', '["long_sword"]'),
('fiendish_codex', 'Fiendish Codex', 900, 2, '{"ability_power":30,"mana":75}', 'Insight', 'Ability cooldowns reduced by 10%.', NULL, NULL, NULL, '["damage","utility"]', '["amplifying_tome"]'),
('kindlegem', 'Kindlegem', 800, 2, '{"hp":200}', 'Rejuvenate', 'Restore 30 HP at the start of each round.', NULL, NULL, NULL, '["tank","healing"]', '["ruby_crystal"]'),
('bilgewater_cutlass', 'Bilgewater Cutlass', 1100, 2, '{"attack_damage":20,"hp":150}', 'Rending Cuts', 'Abilities that deal damage apply a 20% slow for 1 turn.', 'Drain', 'Deal 100 magic damage to target and slow them by 25% for 2 turns.', 3, '["damage","utility","on_hit"]', '["long_sword"]'),
('infinity_edge', 'Infinity Edge', 3400, 3, '{"attack_damage":70,"crit_chance":20}', 'Perfection', 'If you have 60%+ crit chance, crits deal 235% damage instead of 175%.', NULL, NULL, NULL, '["damage","crit"]', '["pickaxe","long_sword"]'),
('rabadon_deathcap', 'Rabadon''s Deathcap', 3800, 3, '{"ability_power":120}', 'Overdrive', 'Increases your total Ability Power by 35%.', NULL, NULL, NULL, '["damage"]', '["needlessly_large_rod","amplifying_tome"]'),
('trinity_force', 'Trinity Force', 3333, 3, '{"attack_damage":30,"attack_speed":0.3,"hp":200,"movement_speed":15}', 'Spellblade', 'After using an ability, your next basic attack deals bonus physical damage equal to 200% base AD.', NULL, NULL, NULL, '["damage","utility","on_hit"]', '["pickaxe","kindlegem"]'),
('sunfire_aegis', 'Sunfire Aegis', 3000, 3, '{"hp":400,"armor":35}', 'Immolate', 'Deal 15 magic damage per round to all enemies. Stacks up to 6 times per combat.', NULL, NULL, NULL, '["tank","damage"]', '["chain_vest","kindlegem"]'),
('luden_tempest', 'Luden''s Tempest', 3200, 3, '{"ability_power":80,"mana":600,"movement_speed":15}', 'Echo', 'First ability used each round hits 3 additional nearby enemies for 100+10% AP magic damage.', NULL, NULL, NULL, '["damage","utility"]', '["needlessly_large_rod","fiendish_codex"]'),
('blade_of_ruined_king', 'Blade of the Ruined King', 3200, 3, '{"attack_damage":40,"attack_speed":0.25,"hp":150}', 'Siphon', 'Basic attacks deal bonus physical damage equal to 6% of the target current HP. On-hit heals you for the same amount.', 'Mist''s Edge', 'Steal 25% of target movement speed for 3 turns. Deals 10% current HP as magic damage.', 4, '["damage","on_hit","healing"]', '["bilgewater_cutlass","long_sword"]'),
('warmogs_armor', 'Warmog''s Armor', 3000, 3, '{"hp":800,"hp_regen":50}', 'Warmog''s Heart', 'If you have 1100+ bonus HP, restore 5% max HP each round.', NULL, NULL, NULL, '["tank","healing"]', '["kindlegem","ruby_crystal"]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  cost = EXCLUDED.cost,
  tier = EXCLUDED.tier,
  stats = EXCLUDED.stats,
  passive_name = EXCLUDED.passive_name,
  passive_description = EXCLUDED.passive_description,
  active_name = EXCLUDED.active_name,
  active_description = EXCLUDED.active_description,
  active_cooldown = EXCLUDED.active_cooldown,
  tags = EXCLUDED.tags,
  build_from = EXCLUDED.build_from;
    `,
  },
];

async function migrate() {
  for (const migration of migrations) {
    try {
      await pool.query(migration.sql);
      console.log(`✅ Migration ${migration.name} complete`);
    } catch (err) {
      console.error(`❌ Migration ${migration.name} failed:`, err.message);
      throw err;
    }
  }
}

module.exports = migrate;
