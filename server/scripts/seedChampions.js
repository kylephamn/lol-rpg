require('dotenv').config({ path: '../.env' });
const pool = require('../db/pool');

// Manual region inference map — Data Dragon does not provide lore regions
const CHAMPION_REGION_MAP = {
  // Noxus
  darius: 'noxus', draven: 'noxus', swain: 'noxus', katarina: 'noxus',
  talon: 'noxus', vladimir: 'noxus', mordekaiser: 'noxus', urgot: 'noxus',
  sion: 'noxus', leblanc: 'noxus', cassiopeia: 'noxus', kled: 'noxus',
  samira: 'noxus', rell: 'noxus', elise: 'noxus',

  // Demacia
  garen: 'demacia', lux: 'demacia', jarvaniv: 'demacia', fiora: 'demacia',
  vayne: 'demacia', poppy: 'demacia', galio: 'demacia', kayle: 'demacia',
  morgana: 'demacia', sylas: 'demacia', shyvana: 'demacia', xinzhao: 'demacia',
  quinn: 'demacia',

  // Freljord
  ashe: 'freljord', sejuani: 'freljord', lissandra: 'freljord', tryndamere: 'freljord',
  braum: 'freljord', volibear: 'freljord', anivia: 'freljord', nunu: 'freljord',
  udyr: 'freljord', olaf: 'freljord', trundle: 'freljord',

  // Ionia
  yasuo: 'ionia', yone: 'ionia', zed: 'ionia', irelia: 'ionia',
  karma: 'ionia', kennen: 'ionia', ahri: 'ionia', akali: 'ionia',
  shen: 'ionia', masteryi: 'ionia', monkeyking: 'ionia', riven: 'ionia',
  varus: 'ionia', xayah: 'ionia', rakan: 'ionia', kayn: 'ionia',
  jhin: 'ionia', kindred: 'ionia', wukong: 'ionia',

  // Piltover
  jinx: 'zaun', vi: 'piltover', caitlyn: 'piltover', jayce: 'piltover',
  viktor: 'zaun', heimerdinger: 'piltover', ezreal: 'piltover',
  camille: 'piltover', orianna: 'piltover',

  // Zaun
  warwick: 'zaun', singed: 'zaun', twitch: 'zaun', ekko: 'zaun',
  blitzcrank: 'zaun', ziggs: 'zaun', zeri: 'zaun',

  // Bilgewater
  gangplank: 'bilgewater', missfortune: 'bilgewater', twistedfate: 'bilgewater',
  graves: 'bilgewater', nautilus: 'bilgewater', illaoi: 'bilgewater',
  pyke: 'bilgewater', fizz: 'bilgewater',

  // Shadow Isles
  thresh: 'shadow_isles', hecarim: 'shadow_isles', karthus: 'shadow_isles',
  yorick: 'shadow_isles', nocturne: 'shadow_isles', maokai: 'shadow_isles',
  gwen: 'shadow_isles', vex: 'shadow_isles', senna: 'shadow_isles',
  lucian: 'shadow_isles', kalista: 'shadow_isles',

  // Targon
  leona: 'targon', diana: 'targon', taric: 'targon', pantheon: 'targon',
  aphelios: 'targon', soraka: 'targon', zoe: 'targon', aurelionsol: 'targon',

  // Shurima
  nasus: 'shurima', renekton: 'shurima', sivir: 'shurima', azir: 'shurima',
  taliyah: 'shurima', xerath: 'shurima', rammus: 'shurima', amumu: 'shurima',
  skarner: 'shurima', akshan: 'shurima',

  // Void
  kassadin: 'void', malzahar: 'void', khazix: 'void', chogath: 'void',
  velkoz: 'void', kogmaw: 'void', reksai: 'void',

  // Ixtal
  qiyana: 'ixtal', nidalee: 'ixtal', rengar: 'ixtal', malphite: 'ixtal',
  zyra: 'ixtal', neeko: 'ixtal',
};

// Manual role inference — Data Dragon provides tags but not exact roles
const inferRole = (tags, championId) => {
  const t = tags.map(t => t.toLowerCase());
  if (t.includes('assassin')) return 'assassin';
  if (t.includes('marksman')) return 'marksman';
  if (t.includes('mage')) return 'mage';
  if (t.includes('support')) return 'support';
  if (t.includes('tank')) return 'tank';
  if (t.includes('fighter')) return 'fighter';
  return 'fighter'; // default fallback
};

// Lore blurbs for featured champions
const LORE_BLURBS = {
  darius: 'The iron fist of Noxus, Darius crushes all who stand before the empire. His greataxe has ended the lives of more enemies than any other Noxian general.',
  ahri: 'A vastaya of mysterious origin, Ahri wields the guile of spirit magic to charm and destroy her enemies. She seeks to reclaim her fragmented memories.',
  yasuo: 'A disgraced exile and gifted swordsman, Yasuo fights with the wind itself at his command. His path is one of constant conflict and quiet regret.',
  lux: 'A noble mage who hides her light magic from Demacia, Lux channels radiant energy with a smile that belies the danger she represents.',
  drmundo: 'Dr. Mundo goes where he pleases — and he pleases to go anywhere that screams.',
  jinx: 'A manic explosion of chaos from Zaun, Jinx lives to create anarchy and leave destruction in her wake.',
  thresh: 'The Chain Warden, Thresh collects souls with sadistic glee, tormenting the living and the dead alike.',
  leona: 'The Radiant Dawn, Leona is a solar warrior of Targon who brings the wrath of the sun to bear upon her enemies.',
  ashe: 'The Frost Archer, Ashe carries the burden of uniting the Freljord, firing enchanted arrows of ice across the eternal tundra.',
  garen: 'The Might of Demacia, Garen is an uncompromising warrior who embodies the nation\'s ideals of justice and strength.',
};

const seedChampions = async () => {
  console.log('🌐 Fetching Data Dragon version...');
  const versionRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
  const versions = await versionRes.json();
  const version = versions[0];
  console.log(`📦 Using patch version: ${version}`);

  const champRes = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
  );
  const { data } = await champRes.json();

  console.log(`🏆 Found ${Object.keys(data).length} champions. Seeding...`);
  let seeded = 0;
  let skipped = 0;

  for (const [ddId, champ] of Object.entries(data)) {
    const dbId = ddId.toLowerCase();
    const region = CHAMPION_REGION_MAP[dbId] || 'the_rift';
    const role = inferRole(champ.tags || [], dbId);

    // Map Data Dragon stat names to our BaseStats interface
    const baseStats = {
      hp: champ.stats.hp,
      mana: champ.stats.mp,
      resource_type: champ.stats.mp > 0 ? 'mana' : 'none',
      attack_damage: champ.stats.attackdamage,
      ability_power: 0,
      armor: champ.stats.armor,
      magic_resist: champ.stats.spellblock,
      attack_speed: champ.stats.attackspeed,
      movement_speed: champ.stats.movespeed,
      crit_chance: 0,
    };

    // Default abilities skeleton — to be filled in manually or by separate script
    const abilities = [
      { slot: 'Q', name: 'Basic Ability Q', description: 'A powerful ability.', damage_type: 'physical', base_damage: [60,85,110,135,160], scaling: ['ad'], scaling_ratio: 0.6, cooldown: [8,7,6,5,4], mana_cost: [40,45,50,55,60], effect: [], rank: 1 },
      { slot: 'W', name: 'Basic Ability W', description: 'A defensive ability.', damage_type: 'none', base_damage: [0,0,0,0,0], scaling: ['none'], scaling_ratio: 0, cooldown: [16,14,12,10,8], mana_cost: [60,65,70,75,80], effect: [{ type: 'shield', duration: 2, value: 80 }], rank: 1 },
      { slot: 'E', name: 'Basic Ability E', description: 'A utility ability.', damage_type: 'magic', base_damage: [50,75,100,125,150], scaling: ['ap'], scaling_ratio: 0.5, cooldown: [12,11,10,9,8], mana_cost: [50,55,60,65,70], effect: [{ type: 'slow', duration: 1, value: 25 }], rank: 1 },
      { slot: 'R', name: 'Ultimate Ability R', description: 'A devastating ultimate.', damage_type: 'physical', base_damage: [150,250,350], scaling: ['ad','ap'], scaling_ratio: 1.0, cooldown: [120,100,80], mana_cost: [100,100,100], effect: [], rank: 0 },
    ];

    const passive = {
      name: 'Innate Passive',
      description: `${champ.name}'s innate passive ability.`,
    };

    try {
      await pool.query(
        `INSERT INTO champions (id, name, title, region, role, lore_blurb, base_stats, abilities, passive, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           title = EXCLUDED.title,
           region = EXCLUDED.region,
           role = EXCLUDED.role,
           lore_blurb = EXCLUDED.lore_blurb,
           base_stats = EXCLUDED.base_stats,
           tags = EXCLUDED.tags`,
        [
          dbId,
          champ.name,
          champ.title || '',
          region,
          role,
          LORE_BLURBS[dbId] || `${champ.name}, ${champ.title || 'a champion of Runeterra'}.`,
          JSON.stringify(baseStats),
          JSON.stringify(abilities),
          JSON.stringify(passive),
          JSON.stringify(champ.tags || []),
        ]
      );
      seeded++;
    } catch (err) {
      console.error(`Failed to seed ${champ.name}:`, err.message);
      skipped++;
    }
  }

  console.log(`✅ Seeded ${seeded} champions. Skipped: ${skipped}.`);
  await pool.end();
};

seedChampions().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
