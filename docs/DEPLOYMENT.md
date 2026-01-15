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

**手順：**

1. **Vercel CLIをインストール**
   ```bash
   npm i -g vercel
   ```

2. **プロジェクトルートに`vercel.json`を作成**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       },
       {
         "src": "public/**",
         "use": "@vercel/static"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "server.js"
       },
       {
         "src": "/(.*)",
         "dest": "public/$1"
       }
     ]
   }
   ```

3. **デプロイ**
   ```bash
   vercel
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
   - `@sparticuz/chromium`パッケージが必要な場合あり
   - または、Puppeteer Coreを使用

2. **Railway / Render**
   - 通常のPuppeteerで動作するが、メモリ使用量に注意

3. **Docker使用時**
   - Chrome/Chromiumを含むイメージが必要

## クイックスタート（Vercel推奨）

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

これで、フロントエンドとバックエンドが一緒にデプロイされます。
