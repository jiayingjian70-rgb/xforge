-- ============================================================
-- XForge 数据库初始化
-- 文件：supabase/migrations/001_initial.sql
-- 执行：Supabase > SQL Editor > 粘贴全部内容 > Run
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- accounts · 账号 + 人设
-- ============================================================
CREATE TABLE accounts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  twitter_handle    TEXT NOT NULL UNIQUE,
  twitter_id        TEXT UNIQUE,
  display_name      TEXT NOT NULL,
  avatar_url        TEXT,

  -- 赛道
  track             TEXT NOT NULL CHECK (track IN ('crypto_kol','ai','airdrop')),
  sub_track         TEXT,

  -- 人设
  persona_name      TEXT NOT NULL,
  persona_bio       TEXT NOT NULL,
  persona_story     TEXT,                        -- 喂给AI的完整人设档案
  personality       TEXT[]  NOT NULL DEFAULT '{}',
  tone_keywords     TEXT[]  NOT NULL DEFAULT '{}',
  forbidden_topics  TEXT[]  NOT NULL DEFAULT '{}',

  -- 发布配置
  post_per_day      SMALLINT NOT NULL DEFAULT 3,
  active_hours      SMALLINT[] DEFAULT '{8,12,21}',
  time_variance     SMALLINT DEFAULT 15,         -- 时间偏移分钟数(±)

  -- X API凭证
  access_token      TEXT,
  refresh_token     TEXT,
  token_expires_at  TIMESTAMPTZ,

  -- 代理（防同IP封号）
  proxy_url         TEXT,

  -- 状态
  status            TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','paused','suspended','warming')),
  warming_until     DATE,
  monthly_post_count INT  NOT NULL DEFAULT 0,
  monthly_post_limit INT  NOT NULL DEFAULT 500,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- sources · 素材来源（博主/关键词）
-- ============================================================
CREATE TABLE sources (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type            TEXT NOT NULL CHECK (type IN ('twitter_user','keyword','manual')),
  value           TEXT NOT NULL,
  display_name    TEXT,
  tracks          TEXT[] NOT NULL DEFAULT '{}',
  priority        SMALLINT DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  is_active       BOOLEAN DEFAULT TRUE,
  last_fetched_at TIMESTAMPTZ,
  fetch_count     INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- materials · 素材库
-- ============================================================
CREATE TABLE materials (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id       UUID REFERENCES sources(id) ON DELETE SET NULL,

  original_text   TEXT NOT NULL,
  original_url    TEXT,
  original_author TEXT,
  original_lang   TEXT DEFAULT 'en',
  published_at    TIMESTAMPTZ,

  tracks          TEXT[] NOT NULL DEFAULT '{}',
  content_type    TEXT CHECK (content_type IN
                    ('news','opinion','alpha','tutorial','meme','data','other')),
  sentiment       TEXT CHECK (sentiment IN ('bullish','bearish','neutral','educational')),
  importance      SMALLINT DEFAULT 3 CHECK (importance BETWEEN 1 AND 5),
  tags            TEXT[] DEFAULT '{}',
  summary         TEXT,

  source_type     TEXT DEFAULT 'auto' CHECK (source_type IN ('auto','manual')),
  is_evergreen    BOOLEAN DEFAULT FALSE,
  used_count      INT DEFAULT 0,
  last_used_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,

  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- posts · 帖子全生命周期
-- ============================================================
CREATE TABLE posts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id        UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  material_id       UUID REFERENCES materials(id) ON DELETE SET NULL,

  content           TEXT NOT NULL,
  content_variants  JSONB DEFAULT '[]',          -- [{text, angle, score}]
  media_urls        TEXT[] DEFAULT '{}',

  generation_prompt TEXT,
  ai_model          TEXT DEFAULT 'claude-3-5-sonnet-20241022',
  human_edited      BOOLEAN DEFAULT FALSE,

  status            TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN (
                      'draft','pending_review','approved',
                      'scheduled','posted','failed','archived'
                    )),
  scheduled_at      TIMESTAMPTZ,
  actual_posted_at  TIMESTAMPTZ,

  twitter_post_id   TEXT,
  error_message     TEXT,
  retry_count       SMALLINT DEFAULT 0,

  likes             INT DEFAULT 0,
  retweets          INT DEFAULT 0,
  replies           INT DEFAULT 0,
  impressions       INT DEFAULT 0,
  stats_updated_at  TIMESTAMPTZ,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- interaction_rules · 自动互动规则
-- ============================================================
CREATE TABLE interaction_rules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  rule_type   TEXT NOT NULL CHECK (rule_type IN
                ('auto_like','auto_retweet','auto_follow','auto_reply')),
  condition   JSONB NOT NULL,
  action      JSONB NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  daily_limit SMALLINT DEFAULT 20,
  today_count SMALLINT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- activity_logs · 操作日志
-- ============================================================
CREATE TABLE activity_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id  UUID REFERENCES accounts(id) ON DELETE SET NULL,
  post_id     UUID REFERENCES posts(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('success','failed','warning')),
  detail      JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 索引
-- ============================================================
CREATE INDEX idx_posts_account_status   ON posts(account_id, status);
CREATE INDEX idx_posts_scheduled        ON posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_materials_tracks       ON materials USING GIN(tracks);
CREATE INDEX idx_materials_tags         ON materials USING GIN(tags);
CREATE INDEX idx_materials_unused       ON materials(used_count, importance DESC)
                                        WHERE used_count = 0;
CREATE INDEX idx_accounts_status        ON accounts(status);
CREATE INDEX idx_logs_account_time      ON activity_logs(account_id, created_at DESC);

-- ============================================================
-- 自动更新 updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_accounts_updated BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_posts_updated    BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
