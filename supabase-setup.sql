-- =============================================
-- BlogHub V1 - Supabase セットアップSQL
-- Supabase ダッシュボード → SQL Editor で実行
-- =============================================

-- プロフィール
CREATE TABLE profiles (
  id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username     TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio          TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ハブ（1ユーザー=1ハブ）
CREATE TABLE hubs (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  is_public    BOOLEAN DEFAULT TRUE,
  default_view TEXT DEFAULT 'grid',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- コンテンツ
CREATE TABLE contents (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hub_id        UUID REFERENCES hubs(id) ON DELETE CASCADE NOT NULL,
  title         TEXT NOT NULL,
  url           TEXT NOT NULL,
  content_type  TEXT DEFAULT 'hatena',
  category      TEXT,
  tags          TEXT[],
  description   TEXT,
  thumbnail_url TEXT,
  published_at  TIMESTAMPTZ,
  display_order INTEGER DEFAULT 0,
  is_visible    BOOLEAN DEFAULT TRUE,
  parent_id     UUID REFERENCES contents(id),
  external_id   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hub_id, external_id)
);

-- インデックス
CREATE INDEX contents_hub_id_idx ON contents(hub_id);
CREATE INDEX contents_display_order_idx ON contents(hub_id, display_order);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hubs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

-- profiles: 誰でも読める / 本人だけ更新
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- hubs: 公開ハブは誰でも読める / 本人だけCRUD
CREATE POLICY "hubs_select"  ON hubs FOR SELECT  USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "hubs_insert"  ON hubs FOR INSERT  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "hubs_update"  ON hubs FOR UPDATE  USING (auth.uid() = user_id);
CREATE POLICY "hubs_delete"  ON hubs FOR DELETE  USING (auth.uid() = user_id);

-- contents: 公開ハブのコンテンツは誰でも読める / 本人だけCRUD
CREATE POLICY "contents_select" ON contents FOR SELECT
  USING (EXISTS (SELECT 1 FROM hubs WHERE hubs.id = contents.hub_id AND (hubs.is_public = true OR hubs.user_id = auth.uid())));
CREATE POLICY "contents_insert" ON contents FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM hubs WHERE hubs.id = contents.hub_id AND hubs.user_id = auth.uid()));
CREATE POLICY "contents_update" ON contents FOR UPDATE
  USING (EXISTS (SELECT 1 FROM hubs WHERE hubs.id = contents.hub_id AND hubs.user_id = auth.uid()));
CREATE POLICY "contents_delete" ON contents FOR DELETE
  USING (EXISTS (SELECT 1 FROM hubs WHERE hubs.id = contents.hub_id AND hubs.user_id = auth.uid()));
