# Runeterra Chronicles — Text RPG

A full-stack text-based RPG set in the League of Legends universe. Every encounter is narrated by Claude AI. Choose your champion, battle across Runeterra's regions, and forge your legend.

---

## Stack

| Layer      | Tech                                         |
|------------|----------------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS + Zustand     |
| Backend    | Node.js 20 + Express                         |
| Database   | PostgreSQL 16                                |
| AI Narrator| Anthropic Claude (claude-sonnet-4-20250514)  |
| Assets     | Riot Data Dragon CDN (no API key required)   |
| Deployment | Netlify (client) + Docker (server + DB)      |

---

## Project Structure

```
lol-rpg/
├── client/                   # React Vite app → Netlify
│   ├── src/
│   │   ├── pages/            # HomePage, LobbyPage, SetupPage, GamePage, ShopPage
│   │   ├── components/game/  # NarrativeFeed, AbilityBar, StatusBar, EnemyPanel, …
│   │   ├── store/            # Zustand: authStore, gameStore
│   │   └── utils/            # dataDragon.js, api.js
│   └── vite.config.js
├── server/                   # Express API → Docker
│   ├── routes/               # auth.js, data.js, campaigns.js
│   ├── services/             # combat.js, narrator.js
│   ├── db/                   # pool.js
│   ├── middleware/            # auth.js (JWT)
│   ├── scripts/              # seedChampions.js
│   └── index.js
├── db/migrations/            # SQL run by Postgres on first boot
│   ├── 001_schema.sql
│   ├── 002_seed_regions.sql
│   └── 003_seed_items.sql
├── docker-compose.yml
├── netlify.toml
└── .env.example
```

---

## Quick Start (Local Development)

### 1. Clone and configure

```bash
git clone <your-repo>
cd lol-rpg
cp .env.example .env
# Edit .env — fill in DB_PASSWORD, JWT_SECRET, ANTHROPIC_API_KEY
```

### 2. Start the backend (Docker)

```bash
docker compose up --build
```

This will:
- Boot PostgreSQL 16
- Run all migrations + seed data automatically (regions, items)
- Start the Express server on port 3001

### 3. Seed champions from Data Dragon

```bash
cd server
npm install
npm run seed
```

This pulls all champion metadata from Riot's CDN and inserts into your DB.

### 4. Start the frontend

```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## Deployment

### Backend (Docker on your server)

```bash
# On your server
git clone <your-repo>
cd lol-rpg
cp .env.example .env && nano .env   # fill secrets
docker compose up -d --build
docker compose exec server node scripts/seedChampions.js
```

### Frontend (Netlify)

1. Connect your repo to Netlify
2. Set build settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variable:
   - `VITE_API_URL` = `http://YOUR_SERVER_IP:3001/api`
4. Update `netlify.toml` — replace `<your-server-ip>` with your actual server IP
5. Deploy

---

## Game Systems

### Core Loop
```
Player Action → POST /api/campaigns/:id/action
    → Combat Resolution (services/combat.js)
    → Claude AI Narration (services/narrator.js)
    → State saved to PostgreSQL
    → Response: narrative + available_actions
```

### Combat Resolution (Section 3)
- **Damage**: `base_damage[rank] + (stat × scaling_ratio)` reduced by `100/(100+resist)`
- **Initiative**: `1d20 + movement_speed/30`
- **Status ticks**: burn/bleed/poison damage, duration decrement
- **XP thresholds**: `level × 100` XP per level
- **Gold on kill**: `50 + enemy_level × 10`

### Region System
- 12 lore regions + neutral Rift (13 total)
- Native champions: permanent combat buff at fight start
- Enemy pairs (bidirectional debuffs): Noxus↔Demacia, Void↔Shurima, Piltover↔Zaun, Shadow Isles→all
- The Rift is fully neutral — no buffs or debuffs

### AI Narrator
- Receives full campaign state on every action
- Returns `{ narrative, available_actions[], state_changes{} }` JSON
- Section 4 system prompt: stays in Runeterra lore, second-person narration, 3–5 sentences
- All narrative appended to scrollable `history_entries` feed

### Shop
- Between encounters (`state: "shop"`)
- Tier 3 items require level ≥ 9
- Sell price: 70% of cost
- Max 6 items equipped

---

## API Reference

```
POST   /api/auth/register              { username, email, password }
POST   /api/auth/login                 { email, password }
GET    /api/auth/me                    → current user

POST   /api/campaigns                  { name, region_id, hardcore? }
GET    /api/campaigns/:id              → full campaign state + players
POST   /api/campaigns/:id/join         { champion_id }
POST   /api/campaigns/:id/start        → DM only, generates opening scene
POST   /api/campaigns/:id/action       { action: { id, label, type, payload } }
POST   /api/campaigns/:id/encounter    { enemies: Enemy[] }  → DM only
GET    /api/campaigns/:id/history      → paginated narrative log

GET    /api/data/champions             → all champions
GET    /api/data/champions/:id         → single champion full data
GET    /api/data/items                 → all items (tier filter: ?tier=1|2|3)
GET    /api/data/regions               → all 13 regions
```

---

## Data Dragon Notes

All champion art is served from Riot's free public CDN — no API key required.

```js
// Square icon
https://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{ChampionId}.png

// Splash art  (used in GamePage header)
https://ddragon.leagueoflegends.com/cdn/img/champion/splash/{ChampionId}_0.png

// Loading art (used in character sheet)
https://ddragon.leagueoflegends.com/cdn/img/champion/loading/{ChampionId}_0.png
```

- Version fetched dynamically at runtime via `getDDragonVersion()`
- Champion IDs converted to PascalCase via `toDDragonId()` in `dataDragon.js`
- Manual override map handles edge cases: `MasterYi`, `DrMundo`, `JarvanIV`, etc.
- Images are never stored in the DB — always derived at runtime

---

## Environment Variables

| Variable          | Where        | Description                          |
|-------------------|--------------|--------------------------------------|
| `DB_PASSWORD`     | `.env`       | PostgreSQL password                  |
| `JWT_SECRET`      | `.env`       | JWT signing secret (≥64 chars)       |
| `ANTHROPIC_API_KEY` | `.env`     | Your Anthropic API key               |
| `PORT`            | `.env`       | Express port (default 3001)          |
| `VITE_API_URL`    | Netlify env  | Full URL to your Express server `/api` |

---

## Notes for Future Development

- **Ability data**: The seed script insterts placeholder abilities. Flesh out each champion's Q/W/E/R with real lore-accurate abilities in a follow-up seed or admin panel.
- **Multiplayer sync**: Currently uses 5-second polling. Upgrade to WebSockets (socket.io) for real-time multi-player.
- **DM encounter builder**: The `/encounter` route accepts any `Enemy[]` array. Build a DM UI panel to compose custom encounters.
- **Rune bonuses**: Rune path stat bonuses are defined in `SetupPage.jsx` — wire them into `computeStats()` in `combat.js` for full effect.
- **Item passive effects**: Item passives are described in the DB but combat resolution doesn't yet auto-apply all of them. Extend `combat.js` to read `item.passive_description` and apply effects accordingly.

---

*Runeterra Chronicles is a fan-made project. Not affiliated with or endorsed by Riot Games.*
*League of Legends, champion names, and all related assets are property of Riot Games.*
