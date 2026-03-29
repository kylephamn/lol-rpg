-- Item Seed Data: 20 items (5 components, 8 mid-tier, 7 legendary)

INSERT INTO items (id, name, cost, tier, stats, passive_name, passive_description, active_name, active_description, active_cooldown, tags, build_from) VALUES

-- TIER 1: Components
('long_sword', 'Long Sword', 350, 1,
 '{"attack_damage":10}',
 NULL, NULL, NULL, NULL, NULL,
 '["damage"]', '[]'),

('amplifying_tome', 'Amplifying Tome', 435, 1,
 '{"ability_power":20}',
 NULL, NULL, NULL, NULL, NULL,
 '["damage"]', '[]'),

('cloth_armor', 'Cloth Armor', 300, 1,
 '{"armor":15}',
 NULL, NULL, NULL, NULL, NULL,
 '["tank"]', '[]'),

('null_magic_mantle', 'Null-Magic Mantle', 300, 1,
 '{"magic_resist":15}',
 NULL, NULL, NULL, NULL, NULL,
 '["tank"]', '[]'),

('ruby_crystal', 'Ruby Crystal', 400, 1,
 '{"hp":150}',
 NULL, NULL, NULL, NULL, NULL,
 '["tank"]', '[]'),

-- TIER 2: Mid-tier
('pickaxe', 'Pickaxe', 875, 2,
 '{"attack_damage":25}',
 NULL, NULL, NULL, NULL, NULL,
 '["damage"]', '["long_sword"]'),

('needlessly_large_rod', 'Needlessly Large Rod', 1250, 2,
 '{"ability_power":40}',
 NULL, NULL, NULL, NULL, NULL,
 '["damage"]', '["amplifying_tome"]'),

('chain_vest', 'Chain Vest', 800, 2,
 '{"armor":40}',
 NULL, NULL, NULL, NULL, NULL,
 '["tank"]', '["cloth_armor"]'),

('negatron_cloak', 'Negatron Cloak', 900, 2,
 '{"magic_resist":30}',
 NULL, NULL, NULL, NULL, NULL,
 '["tank"]', '["null_magic_mantle"]'),

('vampiric_scepter', 'Vampiric Scepter', 900, 2,
 '{"attack_damage":15,"hp":100}',
 'Lifesteal', 'Basic attacks restore 8% of damage dealt as health.',
 NULL, NULL, NULL,
 '["damage","healing"]', '["long_sword"]'),

('fiendish_codex', 'Fiendish Codex', 900, 2,
 '{"ability_power":30,"mana":75}',
 'Insight', 'Ability cooldowns reduced by 10%.',
 NULL, NULL, NULL,
 '["damage","utility"]', '["amplifying_tome"]'),

('kindlegem', 'Kindlegem', 800, 2,
 '{"hp":200}',
 'Rejuvenate', 'Restore 30 HP at the start of each round.',
 NULL, NULL, NULL,
 '["tank","healing"]', '["ruby_crystal"]'),

('bilgewater_cutlass', 'Bilgewater Cutlass', 1100, 2,
 '{"attack_damage":20,"hp":150}',
 'Rending Cuts', 'Abilities that deal damage apply a 20% slow for 1 turn.',
 'Drain', 'Deal 100 magic damage to target and slow them by 25% for 2 turns.', 3,
 '["damage","utility","on_hit"]', '["long_sword"]'),

-- TIER 3: Legendary items
('infinity_edge', 'Infinity Edge', 3400, 3,
 '{"attack_damage":70,"crit_chance":20}',
 'Perfection', 'If you have 60%+ crit chance, crits deal 235% damage instead of 175%.',
 NULL, NULL, NULL,
 '["damage","crit"]', '["pickaxe","long_sword"]'),

('rabadon_deathcap', 'Rabadon''s Deathcap', 3800, 3,
 '{"ability_power":120}',
 'Overdrive', 'Increases your total Ability Power by 35%.',
 NULL, NULL, NULL,
 '["damage"]', '["needlessly_large_rod","amplifying_tome"]'),

('trinity_force', 'Trinity Force', 3333, 3,
 '{"attack_damage":30,"attack_speed":0.3,"hp":200,"movement_speed":15}',
 'Spellblade', 'After using an ability, your next basic attack deals bonus physical damage equal to 200% base AD.',
 NULL, NULL, NULL,
 '["damage","utility","on_hit"]', '["pickaxe","kindlegem"]'),

('sunfire_aegis', 'Sunfire Aegis', 3000, 3,
 '{"hp":400,"armor":35}',
 'Immolate', 'Deal 15 magic damage per round to all enemies. Stacks up to 6 times per combat.',
 NULL, NULL, NULL,
 '["tank","damage"]', '["chain_vest","kindlegem"]'),

('luden_tempest', 'Luden''s Tempest', 3200, 3,
 '{"ability_power":80,"mana":600,"movement_speed":15}',
 'Echo', 'First ability used each round hits 3 additional nearby enemies for 100+10% AP magic damage.',
 NULL, NULL, NULL,
 '["damage","utility"]', '["needlessly_large_rod","fiendish_codex"]'),

('blade_of_ruined_king', 'Blade of the Ruined King', 3200, 3,
 '{"attack_damage":40,"attack_speed":0.25,"hp":150}',
 'Siphon', 'Basic attacks deal bonus physical damage equal to 6% of the target current HP. On-hit heals you for the same amount.',
 'Mist''s Edge', 'Steal 25% of target movement speed for 3 turns. Deals 10% current HP as magic damage.', 4,
 '["damage","on_hit","healing"]', '["bilgewater_cutlass","long_sword"]'),

('warmogs_armor', 'Warmog''s Armor', 3000, 3,
 '{"hp":800,"hp_regen":50}',
 'Warmog''s Heart', 'If you have 1100+ bonus HP, restore 5% max HP each round.',
 NULL, NULL, NULL,
 '["tank","healing"]', '["kindlegem","ruby_crystal"]')

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
