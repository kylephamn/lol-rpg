// Static narrator — no AI calls, pre-written flavor text based on context

// ── Opening Scenes ────────────────────────────────────────────────────────────

const OPENING_SCENES = {
  demacia: [
    `The banners of Demacia snap in the cold wind as your party marches through the stone gates. The air smells of pine and iron. Citizens pause to watch — some with hope in their eyes, others with suspicion. Whatever brought you here, the city's rigid order will test you. Steel yourselves.`,
    `Petricite walls rise on either side as you enter Demacia, pale stone humming faintly with suppressed magic. The guards track your movement without moving their heads. Order here isn't a virtue — it's a weapon, and it's always pointed at someone. Keep your heads down and your hands visible.`,
    `The Great City gleams in the pale morning light, spotless and severe. Crows circle the Justice Tower in lazy spirals. A Mageseekers patrol crosses the square ahead, silver chains at their belts. Whatever you're carrying — literal or otherwise — you'd best not let it show.`,
    `Dawn breaks over the Demacian highlands, cold and clear as a blade. The village ahead is quiet. Too quiet for the hour. A child watches you from behind a fence, then runs. Something is wrong here, and the party has walked straight into the middle of it.`,
  ],
  noxus: [
    `The red banners of Noxus hang from every spire, stained darker by shadow than by dye. The cobblestones beneath your boots are worn smooth by the march of legions. Power is the only currency that matters here, and the city can smell weakness from a mile away. Prove your worth.`,
    `Noxus Prime does not greet you. It assesses you. Every eye on the crowded streets is measuring — ally, rival, or prey. The Trifarix's shadow falls long across the cobblestones. You're either climbing or you're getting stepped on. Choose quickly.`,
    `The war drums haven't stopped since you entered Noxian territory. They don't mean imminent battle — they mean Noxus is always at war, always ready, always hungry. The city breathes violence like other cities breathe air. Fit in or get out.`,
    `Rain hammers the iron streets of Noxus as your party arrives, cloaks heavy with water. The locals don't run for cover — they never do. A tavern brawl spills out of a doorway ahead, and the watching crowd cheers for blood. Welcome to the empire.`,
  ],
  freljord: [
    `A wall of frozen wind hits you the moment you cross the treeline. The Freljord does not welcome strangers — it simply decides whether to kill them quickly or slowly. Ice cracks beneath your feet. Somewhere in the white distance, something howls. Your breath fogs. Move, or freeze.`,
    `The tundra stretches in every direction, white and merciless and beautiful in the way that death sometimes is. A Avarosian warband's campfire glows half a mile off — which means they saw you first. The Freljord has its own rules, written in frost and blood. Learn them fast.`,
    `The World-Rune legends were born in places like this. You understand why. Standing on the open ice, beneath a sky that feels too large and too old, the world feels ancient in a way that makes your ambitions feel very small. Something stirs beneath the permafrost. It has been stirring for a long time.`,
    `Howling winds rake across the glacier your party is crossing. A shape moves beneath the ice below your feet — large, slow, and unconcerned with you. Not all threats in the Freljord are in front of you. Some are below. Some are inside. Watch each other.`,
  ],
  ionia: [
    `Cherry blossoms drift through the still air, settling on ancient stones worn smooth by centuries of contemplation. Ionia is beautiful — and that beauty has been paid for in blood. The land hums with spirit energy, restless and watchful. Whatever you seek here, the land is already aware of you.`,
    `The spirit winds shift as you step off the boat. The forests of Ionia are not empty — they are full of things that do not have names in your language. A fox made of lantern-light watches from the treeline, then blinks away. The land is deciding what you are. Be worthy of a good answer.`,
    `Monasteries cling to the cliffs above like barnacles on a ship's hull, eternal and impractical. Monks move in silence along rope bridges over the valley mist. Somewhere below, a temple bell rings. Ionia's peace is not passivity — it is the stillness of a drawn bowstring.`,
    `The First Lands do not forget what has been done to them. Scars from the Noxian invasion still show in the bark of trees, in the bent spires of ruined shrines, in the eyes of elders who saw it happen. The spirit energy here carries grief in it. Step carefully.`,
  ],
  piltover: [
    `The hum of hextech machinery fills every alley. Copper pipes snake between gleaming towers, venting steam into a sky already thick with invention. Piltover is a city of possibility — and of those willing to exploit it. Keep your wits sharp. Progress waits for no one.`,
    `Piltover smells like ozone and ambition. Clockwork constructs wheel through the streets on errands no one has time for themselves. A Progress Day banner hangs across the main thoroughfare, slightly crooked. The city that never sleeps mostly because it's too busy arguing about patents.`,
    `The Academy's towers cast long geometric shadows across the Entresol. Scholars in ink-stained coats argue loudly over blueprints in the street, oblivious to everything around them. A hextech gem pulses blue in a shop window. Everything here is for sale, especially ideas.`,
    `Airships drift between the upper spires as your party arrives, trailing streamers of steam. Below the skybridge you're crossing, Zaun's yellow fog churns. Piltover is built on that fog — on the labor that produces it and the people it buries. Remember that when the city starts to shine too bright.`,
  ],
  zaun: [
    `The underbelly of progress. Zaun reeks of chemtech fumes and desperation, but there's a defiant life to it that the polished spires above never have. Every shadow here hides either an opportunity or a threat. Sometimes both. Watch your backs.`,
    `Yellow fog clings to the pipes and gantries of the Sump. Children play in it, immune by necessity. A chem-baron's enforcer leans against a wall across the way, watching you with professional boredom. In Zaun, who you know matters more than what you know. Figure out who to know.`,
    `The gray market here makes Piltover's black market look like a children's shop. Need an off-register hextech mod? Something that changes your blood chemistry? A name removed from a ledger? Zaun has it, for a price denominated in coin or consequence. Choose your transactions carefully.`,
    `Neon signs flicker through the yellow murk, advertising pleasures and promises of dubious reliability. Somewhere above, a Progress Day celebration. Here, a different kind of celebration — louder, cheaper, more honest about what it is. The people of Zaun survive. That's not nothing.`,
  ],
  shadow_isles: [
    `The mist rolls in without warning, cold and wrong in a way that has nothing to do with temperature. The Shadow Isles are not haunted — they ARE a haunting. The dead here do not rest, and they do not forget. Every step forward is a step deeper into something ancient and hungry.`,
    `Your compass spins. Your lantern dims to a point of light that barely reaches the ground. The trees are dead but they move, slowly, in a wind that isn't blowing. Whatever brought you to the Shadow Isles — treasure, duty, desperation — ask yourself once more if it was worth it. Then keep moving. Stopping is worse.`,
    `The Black Mist tastes like iron and old grief. It curls around your ankles like something alive — because it is. The souls trapped in it aren't malevolent, not exactly. They're hungry. They've forgotten what they were hungry for. That's what makes them dangerous.`,
    `What was once the Blessed Isles is visible beneath the corruption if you know where to look — perfect stonework, beautiful gardens, frozen mid-bloom. A paradise consumed by catastrophe and preserved in it forever. The Ruination didn't destroy beauty here. It imprisoned it.`,
  ],
  bilgewater: [
    `Salt, blood, and rum — the holy trinity of Bilgewater. The docks creak under the weight of a thousand deals gone sideways, and the sea watches everything with black, indifferent eyes. Fortunes are made and lost here before the tide turns twice. Stay alert.`,
    `Bilgewater never smells clean. The sea, the fish, the humanity packed in too tight for too long — it layers up into something that stops being offensive and starts being identity. A broadside of cannon fire echoes from the harbor. Nobody looks up. That's just commerce here.`,
    `The Slaughter Docks live up to the name. Your party picks a path between fish guts and fresh blood — hard to say which belongs to whom. Gangplank's influence is supposedly weakened, but the vacuum he left has been filled by six factions who hate each other slightly less than they hate outsiders. Navigate carefully.`,
    `A monster surfaces in the harbor as you arrive — vast, barnacled, ancient. It regards the city with one enormous eye, then submerges. The dockworkers don't miss a beat. The sea here has opinions, and the locals have learned to file them under "not my problem."`,
  ],
  targon: [
    `The mountain doesn't care that you're climbing it. That's the first lesson Targon teaches. The second is that something at the top is watching, and it has been watching far longer than you've been alive. The air thins. Your legs burn. The sky above is impossibly clear and impossibly blue. Keep climbing.`,
    `The Rakkor warriors who passed you on the path below did not acknowledge your existence. In their worldview, you either ascend and become worthy, or you die trying. There is no third option worth naming. The peak is still visible above — which means the trial is just beginning.`,
    `Stars feel closer here. Not metaphorically — the sky above Targon is different, the celestial bodies larger and more deliberate in their movements, like they're watching. They are watching. You have attracted the attention of forces that don't think in human terms. Proceed with appropriate humility.`,
  ],
  shurima: [
    `The sun here has weight. It presses down on the sand dunes like a hand, and the sand radiates it back up through your boots. Shurima is beautiful the way all deadly things are — vast, ancient, indifferent. The ruins on the horizon weren't always ruins. That should give you pause.`,
    `The city rose and fell and rose again, and the bones of all three versions are visible in the stonework around you. Ascended warriors became gods became horrors. Emperors became dust. The ambition that built Shurima is baked into the very sand. Try not to breathe too much of it.`,
    `A sand wyrm's passage shook the dunes three hours ago — you can still see the furrow it left, half-buried already by shifting sand. The Shuriman desert is alive in a way that has nothing to do with the creatures in it. It has memory. It knows what was built here. And it remembers who destroyed it.`,
  ],
  default: [
    `Your party arrives at the edge of the unknown. The world stretches before you, wild and indifferent to your ambitions. Somewhere ahead lies conflict, treasure, and the kind of story worth telling. The journey begins now.`,
    `The road behind you is already fading. Whatever brought the party together — fate, desperation, or something more mercenary — it's led you here. The path forward is uncharted. That's the point.`,
    `This land doesn't have a name on most maps. That's not because cartographers missed it. It's because most people who come here don't go back to tell them. Your party looks at each other, then forward. Forward it is.`,
    `The horizon is wide and unreadable. Your party takes stock — of each other, of the supplies, of the quiet that hangs over everything like a held breath. Something is going to break that quiet. Might as well be you.`,
  ],
};

// ── Ability Hit Narratives ────────────────────────────────────────────────────

const ABILITY_HIT = [
  `The strike lands true, sending ripples of force through the battlefield.`,
  `A decisive blow — the enemy staggers, buying precious seconds.`,
  `The ability connects with brutal efficiency. The enemy won't forget that.`,
  `Power surges through the attack. The target takes the full brunt of it.`,
  `Clean execution. The battlefield tips ever so slightly in your favor.`,
  `The impact is visceral, final-sounding. The enemy is hurt, badly.`,
  `A flash of power, then the crunch of contact. The enemy reels.`,
  `The ability discharges with a sound like thunder. The enemy absorbs it — barely.`,
  `That hit carries the weight of everything behind it. The enemy felt every bit.`,
  `Not elegant. Effective. The enemy's footing is shot and their confidence with it.`,
  `The ability releases with precision. The enemy had no answer for it.`,
  `Force meets resistance, and force wins. The enemy is pushed back, wounded.`,
  `A textbook strike — positioned perfectly, delivered without hesitation.`,
  `The enemy thought they had an opening. They were wrong.`,
  `Every ounce of power behind it, delivered in a fraction of a second. The enemy staggers.`,
  `The ground shudders at the impact. The enemy struggles to keep their feet.`,
  `It connected. That's what matters. The enemy is in trouble now.`,
  `The ability tears through their defenses like they weren't there.`,
  `The blow lands harder than the enemy expected. You can see it in their eyes.`,
  `Swift, ruthless, and perfectly timed. The enemy has no answer for it.`,
];

// ── Killing Blow Narratives ───────────────────────────────────────────────────

const ABILITY_KILL = [
  `With a final cry, the enemy crumples. The battle is yours — for now.`,
  `The last enemy falls. Silence rushes in to fill the void of combat.`,
  `Victory. Hard-won, but real. The fallen won't trouble you again.`,
  `The enemy's strength was not enough. Yours was. That is all that matters.`,
  `The fight is over. Catch your breath — there's always another ahead.`,
  `They drop without a word. The sudden quiet is almost louder than the battle was.`,
  `The killing blow lands and everything stops for a moment. Then the world resumes.`,
  `Dust settles. The enemy is down. You're still standing. That's what winning looks like.`,
  `A short fight. A decisive end. The kind of victory that doesn't feel like anything until later.`,
  `The last of them goes still. The tension drains out of the battlefield all at once.`,
  `They fall. You breathe. The calculus of violence resolves in your favor once more.`,
  `The enemy had time for one last look of surprise. Then nothing.`,
  `It ends as suddenly as it began. The party stands in the wreckage, intact. More or less.`,
  `The field belongs to you. Silence settles like snow over the aftermath.`,
  `Done. The bodies are testimony to what happens when you underestimate this party.`,
  `The final enemy hits the ground with a sound of finality. Combat: resolved.`,
  `You were better. They were brave. Neither of those things cancels the other out. They're still down.`,
  `End of the line. The enemy gave everything. It wasn't quite enough.`,
  `The last one falls. Someone exhales slowly. It's over — this part, anyway.`,
  `Combat ends. You take stock of yourselves. Bruised, maybe. But victorious. Undeniably.`,
];

// ── Rest Narratives ───────────────────────────────────────────────────────────

const REST_NARRATIVES = [
  `The party takes a moment to breathe. Wounds close, mana seeps back like a tide returning. It won't last, but it helps.`,
  `A brief respite. The world doesn't stop being dangerous, but at least you face it a little less broken.`,
  `Rest comes quickly, leaves too soon. You rise steadier than you fell.`,
  `Quiet settles over the group. Energy slowly returns to aching limbs and spent reserves.`,
  `Not enough time to recover fully. Enough time to recover partially. The party will take it.`,
  `The ground is uncomfortable and the air smells like whatever just happened. Still, it's rest. Everyone takes it.`,
  `Bandages change hands. Water gets passed around. Nobody talks. There's an understanding here that doesn't need words.`,
  `The world gives you this one moment of stillness. You use every second of it.`,
  `Rest isn't sleep — it's the deliberate choice to be still in a world that keeps moving. The party manages it, briefly.`,
  `Breathing slows. The shaking stops. The party is battered, but upright. Good enough.`,
  `Someone finds a piece of ration at the bottom of their pack. It tastes like old leather and salvation. The group recovers.`,
  `Eyes close for a moment. Not long — but long enough for the body to do its quiet work. Better. Not well. Better.`,
  `The camp is simple. No fire — too visible. But the darkness and the silence do their work. The party wakes readier.`,
  `There's a version of rest that happens in the middle of chaos. It's not comfortable. It keeps you alive. The party takes it.`,
  `The worst of it is patched up. The rest will have to wait. At least what was empty is a little less so.`,
];

// ── Shop Narratives ───────────────────────────────────────────────────────────

const SHOP_NARRATIVES = [
  `The merchant eyes your coin purse with practiced interest. "Got everything a champion needs — if the price is right."`,
  `Goods are laid out before you. Some of it's useful. Some of it's junk. Knowing the difference is half the battle.`,
  `The shop is a brief island of commerce in a sea of conflict. Spend wisely.`,
  `The shopkeeper has the look of someone who has sold to both sides of every war and slept fine afterward. Their stock is impressively neutral.`,
  `"Everything's priced fair," the merchant says, which is a fascinating claim given the markup on that longsword. Still — needs must.`,
  `The stall smells like leather and reagents and the particular desperation of people who don't know if they'll live through the next hour. Good browsing atmosphere.`,
  `The merchant doesn't ask questions. That's a selling point. Another selling point: they have what you need.`,
  `Row after row of equipment, potions, curios. Half of it looks legitimate. The other half looks like it might bite back. Choose thoughtfully.`,
  `"Special discount for champions," the merchant says, with the smooth confidence of someone who has said that exact thing to every customer today. Still, the goods are real.`,
  `The shop appears from nowhere, as such things do in Runeterra. Stocked, attended, inexplicably available. Some things you don't question. You browse.`,
  `The merchant lays out the goods with the careful efficiency of someone who has done this a thousand times in a hundred different wars. "What'll it be?"`,
  `Between battles, commerce. The mundane act of buying and selling feels almost absurd given the circumstances. Almost. The items are useful enough to push past the absurdity.`,
];

// ── Item Purchase Narratives ──────────────────────────────────────────────────

const ITEM_NARRATIVES = [
  `The item is yours. You can already feel the difference in your grip, your stance, your confidence.`,
  `A worthy investment. Equipment like this doesn't come cheap for a reason.`,
  `Purchased and stowed. The merchant nods approvingly — or maybe that's just avarice.`,
  `Good steel, good craftsmanship, good timing. The item slides into place like it was always supposed to be there.`,
  `The weight of it feels right. Whatever advantage it provides, it starts the moment you hold it.`,
  `Coin changes hands. Equipment changes hands. The transaction is simple; what you do with it is not.`,
  `The merchant wraps it carefully. They know good stock, and they treat it accordingly. It's yours now. Use it well.`,
  `Power, crystallized into something you can carry. The expense was real; so is the return.`,
  `Item acquired. The math of this fight just changed a little more in your favor.`,
  `You feel it immediately — the subtle shift in what you're capable of. Worth every coin.`,
  `"Take care of it," the merchant says, almost like they mean it. You intend to.`,
  `Stowed, secured, ready. The right tool changes everything about how you approach the work.`,
];

// ── Movement / Exploration Narratives ────────────────────────────────────────

const MOVE_NARRATIVES = [
  `The party presses forward. The path ahead is uncertain, but standing still is its own kind of danger.`,
  `You advance through unfamiliar terrain, senses sharp, footsteps deliberate.`,
  `Forward. Always forward. The only way out is through.`,
  `The group moves deeper in. Whatever waits ahead has had time to prepare. So have you.`,
  `The landscape shifts as you travel. Familiar things become unfamiliar. You press on.`,
  `The path forks, branches, doubles back. The party picks a direction and commits to it.`,
  `An hour of travel. The world changes around you in ways that are hard to name precisely.`,
  `You move through the terrain like water through stone — finding the way that's there, not forcing one.`,
  `The ground changes texture underfoot. The air changes smell. You're somewhere different now, even if the map doesn't know it yet.`,
  `Footsteps, breath, the creak of equipment. The rhythm of travel. Whatever waits at the destination, you close the distance to it.`,
  `The horizon you were walking toward is a different horizon now that you've crossed it. The party keeps moving.`,
  `Scouts ahead, flanks watched, eyes open. Moving carefully is moving alive.`,
  `The landscape here doesn't give anything away. It watches you cross it without expression. Keep going.`,
  `Miles behind you. Miles possibly ahead. The party keeps the pace.`,
  `A sound in the distance — hard to identify, easy to be cautious about. You adjust course and continue.`,
  `The path is rough, the footing uncertain, the destination unconfirmed. The party moves anyway.`,
];

// ── Exploration Discovery Narratives ─────────────────────────────────────────

const EXPLORE_NARRATIVES = [
  `The area gives up its secrets slowly. You search carefully, turning over every stone worth turning.`,
  `Exploration reveals what maps never capture: the texture of a place, its mood, its hidden geometries.`,
  `You spread out and search. The terrain has stories in it, if you know how to read them.`,
  `Every corner examined, every shadow checked. If there's something here, you'll find it.`,
  `The party combs through the area with practiced efficiency. Runeterra rewards the observant.`,
  `Boots on ground, eyes open, instincts active. The kind of search that turns up the things that matter.`,
  `What the road missed, the thorough search finds. You pick through the area with care.`,
  `Something in the air here — old energy, old decisions, old consequences. Worth taking seriously.`,
  `The search is methodical. Patient. The party has learned that rushing exploration costs more than it saves.`,
  `You cover every angle of the area, leave nothing unexamined. Whatever this place holds, it won't hide from you.`,
];

// ── Enemy Turn Narratives ─────────────────────────────────────────────────────

const ENEMY_TURN_NARRATIVES = [
  `The enemy seizes the opening, pressing forward with renewed aggression.`,
  `Not content to absorb punishment, the enemy strikes back.`,
  `Your foe recovers faster than expected. Stay ready.`,
  `The enemy's counterattack is swift and practiced. This won't be easy.`,
  `They weren't done. They make that clear with force.`,
  `The enemy finds an angle and takes it. The pressure is back on.`,
  `Hurt, but not finished. The enemy answers your attack with one of their own.`,
  `They recalibrate, reposition, and come back harder. Respect the threat.`,
  `The enemy has been in fights before. They know how to recover. They do.`,
  `A moment of vulnerability, and they exploit it without hesitation. Watch your footing.`,
  `The enemy was biding their time. They've found their moment. React.`,
  `No hesitation. No flinching. The counterattack comes like it was already in motion.`,
  `They hit back harder than expected. Pain is a two-way street here.`,
  `Your blow landed. Their answer is already coming. Keep moving.`,
  `The enemy's eyes sharpen. They've read something in your stance and they're acting on it.`,
];

// ── Combat Victory Stingers (appended after kills) ────────────────────────────

const VICTORY_STINGERS = [
  `The silence after is its own kind of sound.`,
  `Still standing. That's the only metric that matters.`,
  `The battlefield answers to you now.`,
  `It was always going to end this way. You just had to get there.`,
  `Whatever they were protecting, it's yours to take.`,
  `Catch your breath. The world doesn't stop.`,
  `Well earned. Keep that feeling — you'll need it.`,
  `The cost was real. So is the outcome.`,
  `Dust and silence. Victory.`,
  `The party exchanges a look. There's something in it that didn't exist before this fight.`,
];

// ── XP Gain Flavor ────────────────────────────────────────────────────────────

const XP_FLAVOR = [
  `The experience of battle settles into bone and muscle.`,
  `Something sharpens in you — hard won, deeply real.`,
  `The fight teaches what no training can. You absorb the lesson.`,
  `Survival is its own education. You graduate a little more.`,
  `The gap between who you were and who you're becoming narrows slightly.`,
  `Battle-knowledge settles into you like heat into stone.`,
  `You're different than you were before that fight. In the ways that count.`,
];

// ── Gold Gain Flavor ──────────────────────────────────────────────────────────

const GOLD_FLAVOR = [
  `Spoils of war.`,
  `The dead don't spend it.`,
  `Your purse is heavier. Marginally.`,
  `It's not nothing.`,
  `Looted before the dust settled. Efficient.`,
  `The coin is real, at least.`,
  `Material reward for material risk.`,
];

// ── Utility ───────────────────────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

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

// ── Narrator Functions ────────────────────────────────────────────────────────

const narrateOpeningScene = async ({ campaign, players }) => {
  const regionId = campaign.region?.id || 'default';
  const playerList = players.map(p => p.champion_name).join(', ');

  const scenes = OPENING_SCENES[regionId] || OPENING_SCENES['default'];
  const base = pick(scenes);
  const narrative = `${base} The party — ${playerList} — stands ready. What happens next is up to them.`;

  return {
    narrative,
    available_actions: defaultActions('exploration'),
    state_changes: { xp_gain: 0, gold_gain: 0, new_enemies: null, scene_transition: null },
  };
};

const narrateAction = async ({ campaign, players, action, result, combatState }) => {
  const state = campaign.state || 'exploration';
  const type = action?.type || 'default';

  let narrative;

  if (type === 'ability') {
    const hasKills = result?.deaths?.length > 0;
    const base = pick(hasKills ? ABILITY_KILL : ABILITY_HIT);
    const actorLine = result?.description ? `${result.description} ` : '';
    narrative = `${actorLine}${base}`;

    if (hasKills) {
      narrative += ` ${pick(VICTORY_STINGERS)}`;
    }
    if (result?.xp_gain > 0) {
      narrative += ` ${pick(XP_FLAVOR)} (+${result.xp_gain} XP)`;
    }
    if (result?.gold_gain > 0) {
      narrative += ` ${pick(GOLD_FLAVOR)} +${result.gold_gain} gold.`;
    }
  } else if (type === 'rest') {
    narrative = pick(REST_NARRATIVES);
  } else if (type === 'shop') {
    narrative = pick(SHOP_NARRATIVES);
  } else if (type === 'item') {
    narrative = pick(ITEM_NARRATIVES);
  } else if (type === 'move') {
    const pool = action?.id === 'explore' ? EXPLORE_NARRATIVES : MOVE_NARRATIVES;
    narrative = pick(pool);
  } else {
    const base = pick(MOVE_NARRATIVES);
    narrative = result?.description ? `${result.description} ${base}` : base;
  }

  // Enemy turn flavor appended after player action
  if (combatState?.phase === 'enemy_turn') {
    narrative += ` ${pick(ENEMY_TURN_NARRATIVES)}`;
  }

  return {
    narrative,
    available_actions: defaultActions(state),
    state_changes: {
      xp_gain: result?.xp_gain || 0,
      gold_gain: result?.gold_gain || 0,
      new_enemies: null,
      scene_transition: null,
    },
  };
};

module.exports = { narrateAction, narrateOpeningScene };
