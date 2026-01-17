# デプロイメントガイド

## クイックスタート

**最も簡単な方法：Render（推奨）**

1. [render.com](https://render.com)にアカウント作成
2. 「New」→「Web Service」
3. GitHubリポジトリを接続
4. 設定：
   - Build Command: `npm install`
   - Start Command: `npm start`
5. 「Create Web Service」をクリック

**その他の選択肢：**
- **Railway**: 設定が最も簡単（[railway.app](https://railway.app)）
- **Vercel**: サーバーレス関数として動作（Proプラン推奨）
- **Fly.io**: Docker対応で柔軟

詳細は下記の各セクションを参照してください。

---

## GitHub Pagesでの動作について

**現在の構成では、GitHub Pagesでは動作しません。**

理由：
- GitHub Pagesは静的サイトホスティングのみ対応
- Node.jsサーバーやPuppeteerは実行できない
- バックエンドAPI（`/api/deck`）が必要だが、GitHub Pagesではサーバーサイド処理が不可

## デプロイメントオプション

### オプション1: フロントエンド + バックエンド分離（推奨）

#### フロントエンド: GitHub Pages
#### バックエンド: Vercel / Netlify Functions / Railway

**手順：**

1. **バックエンドをVercelにデプロイ**
   ```bash
   # Vercel CLIをインストール
   npm i -g vercel
   
   # デプロイ
   vercel
   ```

2. **フロントエンドのAPI URLを変更**
   - `public/app.js`のAPIエンドポイントをVercelのURLに変更
   ```javascript
   // 変更前
   const response = await fetch('/api/deck', {
   
   // 変更後
   const response = await fetch('https://your-backend.vercel.app/api/deck', {
   ```

3. **フロントエンドをGitHub Pagesにデプロイ**
   - GitHubリポジトリのSettings > Pagesで有効化
   - `public`フォルダをルートに配置

### オプション2: Vercel（フルスタック）

VercelはNode.jsサーバーも実行可能なので、フロントエンドとバックエンドを一緒にデプロイできます。

#### 方法A: GitHub連携による自動デプロイ（推奨）

**初回設定（1回のみ）：**

1. **Vercelにアカウント作成**
   - [Vercel](https://vercel.com)にアクセス
   - GitHubアカウントでログイン

2. **プロジェクトをインポート**
   - Vercelダッシュボードで「Add New Project」をクリック
   - GitHubリポジトリを選択
   - プロジェクト設定：
     - **Framework Preset**: Other
     - **Root Directory**: `./`（プロジェクトルート）
     - **Build Command**: （空欄のまま）
     - **Output Directory**: （空欄のまま）
     - **Install Command**: `npm install`

3. **環境変数（必要に応じて）**
   - 環境変数がある場合は設定

4. **デプロイ**
   - 「Deploy」をクリック
   - 初回デプロイが開始されます

**2回目以降：**

- GitHubにpushするだけで自動的にデプロイされます
- `main`ブランチへのpush → 本番環境にデプロイ
- その他のブランチへのpush → プレビュー環境にデプロイ

#### 方法B: Vercel CLIを使ったデプロイ

1. **Vercel CLIをインストール**
   ```bash
   npm i -g vercel
   ```

2. **プロジェクトルートに`vercel.json`を作成**（既に作成済み）
   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "/server.js"
       }
     ]
   }
   ```

3. **デプロイ**
   ```bash
   # 初回デプロイ（対話形式で設定）
   vercel
   
   # 本番環境にデプロイ
   vercel --prod
   ```

### オプション3: Railway（推奨度：★★★★☆）

RailwayはNode.jsアプリケーションを簡単にデプロイできます。Puppeteerにも対応しています。

**メリット：**
- GitHub連携で自動デプロイ
- 設定が簡単
- データベースも簡単に追加可能
- Docker対応

**デメリット：**
- 無料枠は制限が厳しい（月$5のクレジット）
- スケールするとコストが上がる

**Railwayでのデプロイ手順：**

1. Railwayにアカウント作成（[railway.app](https://railway.app)）
   - GitHubアカウントでログイン
2. 「New Project」をクリック
3. 「Deploy from GitHub repo」を選択
4. リポジトリを選択
5. 自動的にデプロイが開始されます
6. デプロイ完了後、生成されたURLを確認
7. 環境変数があれば「Variables」タブで設定

**Railwayでの設定のポイント：**
- `server.js`を使用する場合、そのまま動作します
- 環境変数`PORT`は自動設定されます
- Puppeteerは通常の`puppeteer`パッケージで動作します（`@sparticuz/chromium`は不要）
- 無料プランでは月$5のクレジットが提供されます
- クレジットを使い切ると一時停止します

**Railway用の`package.json`確認：**
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### オプション4: Render（推奨度：★★★★★）

Renderはフルスタックアプリケーションに最適です。Puppeteerも問題なく動作します。

**メリット：**
- 無料プランあり（制限あり）
- Webサービスとして常時稼働可能
- GitHub連携で自動デプロイ
- SSL証明書が自動で設定される

**デメリット：**
- 無料プランは15分間の非アクティブ後にスリープ
- スリープからの復帰に時間がかかる

**Renderでのデプロイ手順：**

1. Renderにアカウント作成（[render.com](https://render.com)）
2. 「New」→「Web Service」
3. GitHubリポジトリを接続
4. 設定：
   - **Name**: 任意の名前（例: `pokeca-deck-analyzer`）
   - **Environment**: Node
   - **Region**: 最寄りのリージョン（例: Singapore）
   - **Branch**: `main`（またはデプロイしたいブランチ）
   - **Root Directory**: `.`（プロジェクトルート）
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free（またはStarter $7/月）
5. 「Create Web Service」をクリック
6. デプロイが完了するまで待機（初回は5-10分程度）

**Renderでの設定のポイント：**
- `server.js`を使用する場合、そのまま動作します
- 環境変数`PORT`は自動設定されます（`process.env.PORT`を使用）
- 無料プランでは15分間の非アクティブ後にスリープします
- スリープからの復帰には30秒〜1分程度かかります
- Puppeteerは通常の`puppeteer`パッケージで動作します（`@sparticuz/chromium`は不要）

**Render用の`package.json`確認：**
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### オプション5: Fly.io（推奨度：★★★★☆）

Fly.ioはDocker対応で、グローバルに分散配置できます。

**メリット：**
- Docker対応で柔軟性が高い
- 低レイテンシ（エッジ配置）
- 無料枠あり（制限あり）

**デメリット：**
- Dockerの知識が必要
- 設定がやや複雑

**Fly.ioでのデプロイ手順：**

1. Fly.ioにアカウント作成
2. Fly CLIをインストール: `curl -L https://fly.io/install.sh | sh`
3. ログイン: `fly auth login`
4. アプリを作成: `fly launch`
5. `fly.toml`を設定（必要に応じて）
6. デプロイ: `fly deploy`

**必要な設定（`fly.toml`の例）：**
```toml
app = "your-app-name"
primary_region = "nrt"  # 東京リージョン

[build]

[env]
  PORT = "8080"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

### オプション6: Google Cloud Run（推奨度：★★★☆☆）

Google Cloud RunはDockerコンテナを実行できるサーバーレスプラットフォームです。

**メリット：**
- 使用した分だけ課金（従量課金）
- 自動スケーリング
- 無料枠あり（月200万リクエストまで）

**デメリット：**
- 初期設定が複雑
- Google Cloud Platformの知識が必要
- コスト計算が複雑

**Cloud Runでのデプロイ手順：**

1. Google Cloud Platformにアカウント作成
2. プロジェクトを作成
3. Cloud Run APIを有効化
4. `Dockerfile`を作成
5. デプロイ: `gcloud run deploy`

### オプション7: DigitalOcean App Platform（推奨度：★★★☆☆）

DigitalOceanのPaaSサービスです。

**メリット：**
- シンプルな設定
- スケーラブル
- データベースも簡単に追加可能

**デメリット：**
- 無料プランなし（最低$5/月）
- コストが高め

### オプション8: Netlify Functions（非推奨）

Netlify Functionsはサーバーレス関数のみで、Puppeteerには不向きです。

**制限事項：**
- PuppeteerはNetlify Functionsでは動作しない可能性が高い（制限時間とメモリ制限）
- 長時間処理に対応していない
- **本システムには非推奨**

## ホスティングサービス比較表

本システム（Express + Puppeteer）に適したホスティングサービスを比較：

| サービス | 推奨度 | 無料プラン | タイムアウト | Puppeteer対応 | 難易度 | 月額コスト目安 |
|---------|--------|-----------|------------|--------------|--------|--------------|
| **Render** | ★★★★★ | あり（制限あり） | 制限なし | ✅ 完全対応 | 簡単 | $0（無料）〜$7 |
| **Railway** | ★★★★☆ | あり（$5クレジット） | 制限なし | ✅ 完全対応 | 簡単 | $0（無料）〜$5+ |
| **Vercel** | ★★★★☆ | あり（制限あり） | 10-60秒 | ✅ 対応（要設定） | 簡単 | $0（無料）〜$20 |
| **Fly.io** | ★★★★☆ | あり（制限あり） | 制限なし | ✅ 完全対応 | 中 | $0（無料）〜$5+ |
| **Google Cloud Run** | ★★★☆☆ | あり（制限あり） | 60分 | ✅ 完全対応 | 難しい | $0（無料）〜従量 |
| **DigitalOcean App Platform** | ★★★☆☆ | なし | 制限なし | ✅ 完全対応 | 中 | $5〜 |
| **Netlify Functions** | ★☆☆☆☆ | あり | 10秒 | ❌ 非対応 | 簡単 | $0（無料） |

### 推奨順位

1. **Render**（最推奨）
   - 無料プランあり
   - 設定が簡単
   - Puppeteerが問題なく動作
   - 常時稼働可能（無料プランはスリープあり）

2. **Railway**
   - 設定が非常に簡単
   - GitHub連携がスムーズ
   - 無料クレジットあり

3. **Vercel**
   - サーバーレス関数として動作
   - タイムアウト制限に注意が必要
   - Proプラン以上を推奨

4. **Fly.io**
   - Docker対応で柔軟
   - グローバル配置可能
   - 設定がやや複雑

## 推奨構成

**開発環境：**
- ローカルで`npm start`して動作確認

**本番環境（推奨順）：**

1. **Render（最推奨）**
   - 無料プランで動作可能
   - 設定が簡単
   - Puppeteerが問題なく動作

2. **Railway**
   - 無料クレジットで試せる
   - 設定が非常に簡単

3. **Vercel（Proプラン以上）**
   - サーバーレス関数として動作
   - タイムアウト制限に注意

この構成により：
- フロントエンドとバックエンドを一緒にデプロイ可能
- スケーラブルで保守しやすい
- コストを抑えられる

## 各サービスでの注意点

### Render

**メリット：**
- 無料プランでWebサービスとして常時稼働可能
- 設定が非常に簡単
- Puppeteerが問題なく動作

**デメリット：**
- 無料プランは15分間の非アクティブ後にスリープ
- スリープからの復帰に30秒〜1分かかる
- スリープを防ぐにはStarterプラン（$7/月）が必要

**推奨設定：**
- Starterプラン（$7/月）を使用するとスリープしない
- 無料プランでも動作は可能だが、初回アクセスが遅い

### Railway

**メリット：**
- 設定が最も簡単
- GitHub連携がスムーズ
- 自動デプロイ

**デメリット：**
- 無料クレジット（月$5）を使い切ると一時停止
- スケールするとコストが上がる

**推奨設定：**
- 開発・テスト用途には無料クレジットで十分
- 本番環境では有料プランを検討

### Vercel

**メリット：**
- サーバーレス関数として動作
- 自動スケーリング
- エッジ配置で高速

**デメリット：**
- タイムアウト制限が厳しい（Hobby: 10秒、Pro: 60秒）
- Puppeteerの起動に時間がかかる場合がある
- `@sparticuz/chromium`が必要

**推奨設定：**
- Proプラン以上を推奨
- `vercel.json`で`maxDuration`を設定

### Fly.io

**メリット：**
- Docker対応で柔軟
- グローバル配置可能
- 低レイテンシ

**デメリット：**
- Dockerの知識が必要
- 設定がやや複雑
- 無料枠は制限あり

**推奨設定：**
- Dockerfileを作成する必要がある
- リージョンは最寄りを選択（例: 東京 `nrt`）

## サービス別のコード変更が必要な場合

### Render / Railway / Fly.io など（通常のNode.jsサーバー）

**変更不要** - `server.js`をそのまま使用できます。

```javascript
// server.js をそのまま使用
const app = express();
app.listen(process.env.PORT || 3000);
```

### Vercel（サーバーレス関数）

**変更必要** - `api/deck.js`を使用します（既に実装済み）。

```javascript
// api/deck.js を使用
module.exports = async (req, res) => {
  // Serverless Function形式
};
```

## トラブルシューティング

### よくある問題

#### 1. Puppeteerが起動しない

**原因：**
- 必要な依存関係が不足
- 権限の問題

**対処法：**
- `--no-sandbox`オプションを確認（`server.js`に既に含まれています）
- メモリ不足の可能性がある場合は、プランをアップグレード

#### 2. タイムアウトエラー

**原因：**
- 処理時間が制限を超えている
- 外部サイトへのアクセスが遅い

**対処法：**
- タイムアウト設定を調整
- より高いプランにアップグレード
- 処理を最適化

#### 3. メモリ不足エラー

**原因：**
- Chromiumが大量のメモリを使用
- プランのメモリ制限を超えている

**対処法：**
- より高いプランにアップグレード
- ブラウザインスタンスを適切にクリーンアップ（既に実装済み）

#### 4. スリープからの復帰が遅い（Render無料プラン）

**原因：**
- 15分間の非アクティブ後にスリープ

**対処法：**
- Starterプラン（$7/月）にアップグレード
- または、定期的にpingを送る（外部サービスを使用）

## コスト比較（月額目安）

| サービス | 無料プラン | 有料プラン（最小） | 備考 |
|---------|-----------|------------------|------|
| Render | あり（スリープあり） | $7/月 | Starterプランでスリープなし |
| Railway | あり（$5クレジット） | $5/月 | 使用量に応じて課金 |
| Vercel | あり（制限あり） | $20/月 | Proプラン推奨 |
| Fly.io | あり（制限あり） | $5/月 | 使用量に応じて課金 |
| Google Cloud Run | あり（制限あり） | 従量課金 | 使用量に応じて課金 |
| DigitalOcean | なし | $5/月 | 最低$5から |

## 注意事項

### Puppeteerのデプロイ時の注意

PuppeteerはChrome/Chromiumを含むため、デプロイ先によっては追加設定が必要です：

1. **Vercel**
   - `@sparticuz/chromium`パッケージが必要（既に実装済み）
   - Puppeteer Coreを使用（`api/deck.js`で実装済み）
   - **タイムアウト制限に注意**（下記参照）

2. **Railway / Render**
   - 通常のPuppeteerで動作するが、メモリ使用量に注意

3. **Docker使用時**
   - Chrome/Chromiumを含むイメージが必要

### Vercelでの動作可能性と制限事項

**✅ 動作可能です**

本システムはVercelで動作可能ですが、以下の制限事項があります：

#### プラン別の制限

| プラン | デフォルトタイムアウト | maxDuration設定可能 | メモリ制限 |
|--------|----------------------|-------------------|-----------|
| Hobby (無料) | 10秒 | 10秒（変更不可） | 1GB |
| Pro | 15秒 | 60秒まで | 3GB |
| Enterprise | 15秒 | 300秒まで（Fluid Compute使用時は最大800秒） | 4GB |

#### 現在の設定

- `vercel.json`で`maxDuration: 30`を設定していますが、**Hobbyプランでは10秒が上限**です
- 実際の処理時間を考慮して、タイムアウトを25秒に短縮しています
- Chromiumの起動に約2-5秒かかるため、Hobbyプランではタイムアウトする可能性があります

#### 推奨事項

1. **Proプラン以上を使用することを推奨**
   - より長い実行時間が可能
   - より多くのメモリが利用可能
   - より安定した動作

2. **Hobbyプランで使用する場合**
   - タイムアウトが発生する可能性があることを理解する
   - エラーハンドリングが適切に実装されているため、エラーメッセージが表示される
   - 再試行機能の実装を検討

#### よくあるエラーと対処法

##### 1. 「サーバーから無効なレスポンスが返されました」

**原因：**
- タイムアウト（処理が10秒/15秒を超えた）
- エラーレスポンスが正しくJSON形式で返されていない
- Chromiumの起動に失敗した

**対処法：**
- VercelのFunction Logsを確認（Dashboard → Deployments → 関数ログ）
- エラーメッセージを確認して原因を特定
- Proプランへのアップグレードを検討

##### 2. タイムアウトエラー

**原因：**
- 処理時間がプランの制限を超えた
- Chromiumの起動に時間がかかった
- 外部サイトへのアクセスが遅い

**対処法：**
- Proプラン以上を使用
- `vercel.json`の`maxDuration`を調整（プラン上限内で）
- 処理を最適化（不要な待機時間を削減）

##### 3. メモリ不足エラー

**原因：**
- Chromiumが大量のメモリを使用
- デッキ情報が大きすぎる

**対処法：**
- Proプラン以上を使用（より多くのメモリが利用可能）
- レスポンスサイズを削減

#### デバッグ方法

1. **Vercel Dashboardでログを確認**
   - Dashboard → プロジェクト → Deployments
   - 該当するデプロイメントを選択
   - Function Logsタブでエラーログを確認

2. **ローカルで`vercel dev`を使用**
   ```bash
   npm i -g vercel
   vercel dev
   ```
   - ローカル環境でVercelの動作を再現
   - エラーを再現してデバッグ

3. **エラーハンドリングの確認**
   - `api/deck.js`で全てのエラーが適切にキャッチされているか確認
   - JSONレスポンスが必ず返されるように実装済み

#### パフォーマンス最適化

1. **Chromiumの起動時間を短縮**
   - `@sparticuz/chromium`を使用（既に実装済み）
   - 不要なオプションを削減

2. **タイムアウトの調整**
   - ページ読み込みのタイムアウトを適切に設定（現在25秒）
   - セレクター待機のタイムアウトを短縮（現在8秒）

3. **エラーハンドリングの改善**
   - 全てのエラーケースでJSONレスポンスを返す（実装済み）
   - 適切なHTTPステータスコードを返す（実装済み）

## クイックスタート（Vercel推奨）

### GitHub連携による自動デプロイ（最も簡単）

1. **Vercelにアクセス**
   - [https://vercel.com](https://vercel.com)にアクセス
   - GitHubアカウントでログイン

2. **プロジェクトをインポート**
   - 「Add New Project」をクリック
   - GitHubリポジトリを選択
   - 設定を確認して「Deploy」をクリック

3. **完了！**
   - 初回デプロイが完了したら、以降はGitHubにpushするだけで自動デプロイされます

### Vercel CLIを使ったデプロイ

```bash
# 1. Vercel CLIインストール
npm i -g vercel

# 2. ログイン
vercel login

# 3. デプロイ
vercel

# 4. 本番環境にデプロイ
vercel --prod
```

**注意：** GitHub連携を設定した場合、CLIでのデプロイは不要です。GitHubにpushするだけで自動的にデプロイされます。
