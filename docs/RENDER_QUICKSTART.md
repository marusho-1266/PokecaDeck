# Render クイックスタートガイド

## 5分でデプロイ！

### ステップ1: Renderアカウント作成
1. [render.com](https://render.com)にアクセス
2. 「Get Started for Free」をクリック
3. GitHubアカウントでログイン

### ステップ2: Webサービス作成
1. 「New +」→「Web Service」をクリック
2. GitHubリポジトリを選択

### ステップ3: 設定
以下の設定を入力：

| 項目 | 値 |
|------|-----|
| **Name** | `pokeca-deck-analyzer`（任意） |
| **Region** | `Singapore`（推奨） |
| **Branch** | `main` |
| **Root Directory** | `.`（デフォルト） |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | `Free` |

### ステップ4: デプロイ
1. 「Create Web Service」をクリック
2. 5-10分待つ
3. 完了！

### アクセス
デプロイ完了後、表示されたURLにアクセス：
- 例: `https://pokeca-deck-analyzer.onrender.com`

## よくある質問

**Q: 無料プランでスリープするのは？**  
A: 15分間アクセスがないとスリープします。次回アクセス時に30秒〜1分かかります。Starterプラン（$7/月）ならスリープしません。

**Q: デプロイに失敗する場合は？**  
A: ログを確認してください。通常は依存関係の問題です。ローカルで`npm install`が成功するか確認してください。

**Q: Puppeteerが動作しない場合は？**  
A: Renderでは通常の`puppeteer`が動作します。`server.js`の設定は既に最適化済みです。

詳細は [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) を参照してください。
