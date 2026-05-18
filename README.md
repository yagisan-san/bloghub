# BlogHub

> 散らばった発信を、ひとつのホームに。

BlogHubは、はてなブログ・note・Notion・PDF・YouTubeなど、個人が行っている複数の発信コンテンツをまとめて整理し、「自分だけの発信ホームページ」として公開できるWebサービスです。

---

## 🌟 サービスの特徴

- **無料ブログをサイトっぽく見せる**：はてなブログなどの記事一覧を、カテゴリ・ツリー・ロードマップ形式で再整理して公開できる
- **複数媒体を一元管理**：はてなブログ・note・Notion・PDF・YouTube・スプレッドシートなどを1つのハブにまとめられる
- **公開URL発行**：`/u/ユーザー名` 形式の公開URLを発行。Xプロフィールやnoteのリンク欄に貼れる
- **4つの表示形式**：グリッド・カテゴリ・読む順番（ロードマップ）・ツリー構造で自由に切り替え
- **デザインカスタマイズ**：背景色・アクセントカラー・カード色などをプリセット＋カスタムで変更可能
- **管理画面と公開ページを分離**：編集はオーナーだけ。訪問者は閲覧専用

---

## 🛠 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 16 (App Router) + React + TypeScript |
| スタイリング | Tailwind CSS v4 |
| 認証 | Supabase Auth |
| データベース | Supabase PostgreSQL |
| ファイルストレージ | Supabase Storage |
| ホスティング | Vercel |

すべて**無料枠**で運用可能（Vercel Free + Supabase Free）。

---

## 📁 ディレクトリ構成

```
├── app/
│   ├── page.tsx                  # ランディングページ
│   ├── signup/                   # 会員登録
│   ├── login/                    # ログイン
│   ├── onboarding/               # 初回設定（username・はてな連携）
│   ├── dashboard/                # 管理画面
│   │   ├── page.tsx              # ダッシュボードトップ
│   │   ├── contents/             # コンテンツ管理
│   │   ├── categories/           # カテゴリ管理
│   │   ├── order/                # 読む順番（ロードマップ）
│   │   ├── tree/                 # ツリー構造管理
│   │   ├── design/               # デザイン設定
│   │   └── settings/             # ハブ設定・プロフィール
│   ├── u/[username]/             # 公開ページ（ホーム）
│   │   └── [type]/               # コンテンツ種別別ページ
│   └── api/
│       ├── hatena/               # はてなAPIプロキシ（APIキー非保存）
│       ├── contents/             # コンテンツCRUD
│       └── auth/signout/         # ログアウト
├── components/
│   ├── ui/                       # 共通UIパーツ
│   ├── hub/                      # 公開ページ用ビュー
│   └── dashboard/                # 管理画面コンポーネント
├── lib/
│   ├── supabase/                 # Supabaseクライアント（browser/server）
│   └── hatena.ts                 # AtomPub XMLパーサー
└── types/
    └── database.ts               # Supabase型定義
```

---

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/yagisan-san/bloghub.git
cd bloghub
npm install
```

### 2. Supabaseプロジェクトの作成

1. [supabase.com](https://supabase.com) でプロジェクトを作成
2. SQL Editorで `supabase-setup.sql` を実行（テーブル・RLSを作成）

### 3. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、各値を入力：

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Supabase Storageの設定

Supabaseのダッシュボードで以下の2つのバケットを **Public** で作成：
- `avatars`（プロフィール画像用）
- `covers`（カバー画像用）

作成後、SQL Editorで以下を実行：

```sql
CREATE POLICY "storage access for authenticated users"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id IN ('avatars', 'covers'))
WITH CHECK (bucket_id IN ('avatars', 'covers'));
```

### 5. ローカル起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) で確認。

---

## 🗄 データベース設計

### テーブル構成

| テーブル | 用途 |
|---|---|
| `profiles` | ユーザー情報（username・表示名・アイコン・カバー画像・SNSリンク） |
| `hubs` | 発信ハブ設定（タイトル・説明文・デザインテーマ・カード表示順） |
| `contents` | コンテンツ一覧（記事・PDF・note等。parent_idで階層構造に対応） |

### セキュリティ方針

- **APIキーは保存しない（V1方針）**：はてなブログのAPIキーはサーバー側で一時的に使用し、記事データのみDBに保存
- **RLS（Row Level Security）**：Supabaseのポリシーで、自分のデータのみ編集可能
- **管理画面保護**：`middleware.ts` により `/dashboard` は認証済みユーザーのみアクセス可能

---

## ✨ 主要機能

### 公開ページ（/u/ユーザー名）

- プロフィールヒーロー（カバー画像・アバター・ハブタイトル・説明文）
- コンテンツ種別カード（はてなブログ・note・Notion等を種別ごとに表示）
- SNSリンクカード（X・Instagram・YouTube・メール）
- 4つの表示形式切り替え（グリッド・カテゴリ・読む順番・ツリー）
- キーワード検索・メディアタイプフィルター
- テーマカラーのカスタマイズ反映

### 管理画面（/dashboard）

- **コンテンツ管理**：種別タブ別管理、インラインURL追加、D&D並び替え、表示/非表示設定
- **カテゴリ**：コンテンツ種別ごとのカテゴリ一覧表示
- **読む順番（ロードマップ）**：種別ごとにD&Dで読む順番を設定
- **ツリー構造**：parent_idドロップダウンで親子関係を設定
- **デザイン設定**：6つのプリセットテーマ＋カスタムカラーピッカー（ライブプレビュー付き）
- **ハブ設定**：プロフィール・SNSリンク・カバー/アイコン画像アップロード・カード表示順・「その他」種別の表示名変更

---

## 📦 デプロイ（Vercel）

GitHubリポジトリをVercelに連携して自動デプロイ、またはVercel CLIを使用：

```bash
vercel --prod
```

Vercelの環境変数に `.env.local` の内容を登録し、`NEXT_PUBLIC_SITE_URL` を本番URLに変更：

```
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

---

## 🔮 今後の予定（V2以降）

- SEO構造分析・孤立記事チェック
- 内部リンク提案
- AIによる読む順番・導線提案
- Google Analytics / Search Console連携
- 複数ハブ管理（有料版）
- 独自ドメイン対応（有料版）
- 自動更新（APIキー暗号化保存・有料版）

---

## 📄 ライセンス

MIT
