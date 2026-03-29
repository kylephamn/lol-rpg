-- LoL RPG Database Schema
-- Run order: 001_schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Champions (seeded from Data Dragon + manual overrides)
CREATE TABLE IF NOT EXISTS champions (
  id VARCHAR(50) PRIMARY KEY,           -- lowercase, e.g. "darius"
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

-- Regions
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

-- Items
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

-- Campaigns
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

-- Campaign Players (join table)
CREATE TABLE IF NOT EXISTS campaign_players (
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  champion_id VARCHAR(50) REFERENCES champions(id),
  PRIMARY KEY (campaign_id, user_id)
);

-- Player Characters
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

-- Narrative History
CREATE TABLE IF NOT EXISTS history_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  actor VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast history queries
CREATE INDEX IF NOT EXISTS idx_history_campaign ON history_entries(campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_player_chars_campaign ON player_characters(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_players_campaign ON campaign_players(campaign_id);
