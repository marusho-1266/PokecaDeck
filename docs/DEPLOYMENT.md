# デプロイメントガイド

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

### オプション3: Railway / Render

RailwayやRenderはNode.jsアプリケーションを直接デプロイできます。

**Railwayの場合：**

1. Railwayにアカウント作成
2. GitHubリポジトリを接続
3. 自動的にデプロイ

**Renderの場合：**

1. Renderにアカウント作成
2. New Web Service
3. GitHubリポジトリを選択
4. 設定：
   - Build Command: `npm install`
   - Start Command: `npm start`

### オプション4: Netlify Functions

Netlify Functionsを使ってバックエンドを実装する方法もあります。

**制限事項：**
- PuppeteerはNetlify Functionsでは動作しない可能性が高い（制限時間とメモリ制限）
- 代替として、Puppeteer Core + Chrome Headlessのセットアップが必要

## 推奨構成

**開発環境：**
- ローカルで`npm start`して動作確認

**本番環境：**
- **フロントエンド**: GitHub Pages（無料、簡単）
- **バックエンド**: Vercel（無料プランあり、Node.js対応）

この構成により：
- フロントエンドは無料でホスティング
- バックエンドも無料プランで動作可能
- スケーラブルで保守しやすい

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
