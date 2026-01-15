# ポケカデッキ解析ツール

ポケモンカードゲームのデッキコードからデッキの内訳を取得するWebアプリケーションです。

## 機能

- デッキコードを入力するだけで、デッキの詳細情報を取得
- カードの画像、枚数、カテゴリを表示
- デッキ構成のサマリー表示
- カテゴリごとのカード一覧表示

## 技術スタック

- **フロントエンド**: HTML/CSS/JavaScript (Vanilla JS)
- **バックエンド**: Node.js + Express
- **スクレイピング**: Puppeteer
- **スタイリング**: カスタムCSS（モダンなデザイン）

## セットアップ

### 必要な環境

- Node.js (v16以上推奨)
- npm または yarn

### インストール

1. 依存関係のインストール

```bash
npm install
```

2. サーバーの起動

```bash
npm start
```

開発モード（自動リロード）で起動する場合:

```bash
npm run dev
```

3. ブラウザでアクセス

```
http://localhost:3000
```

## 使い方

1. ブラウザで `http://localhost:3000` にアクセス
2. デッキコードを入力（例: `gnLgHg-2ee09u-LiNNQ9`）
3. 「解析」ボタンをクリック
4. デッキ情報が表示されます

## API エンドポイント

### POST /api/deck

デッキコードからデッキ情報を取得します。

**リクエスト:**
```json
{
  "deckCode": "gnLgHg-2ee09u-LiNNQ9"
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "deckCode": "gnLgHg-2ee09u-LiNNQ9",
    "totalCards": 60,
    "cards": [
      {
        "cardId": "48624",
        "name": "ロケット団のヤミカラス",
        "fullName": "ロケット団のヤミカラス(M2a 102/193)",
        "count": 4,
        "category": "ポケモン",
        "mainFlag": 1,
        "imageUrl": "https://...",
        "detailUrl": "https://..."
      }
    ],
    "summary": {
      "pokemon": 6,
      "goods": 5,
      "tool": 2,
      "support": 5,
      "stadium": 1,
      "energy": 2,
      "totalCardTypes": 21
    }
  }
}
```

### GET /api/health

ヘルスチェックエンドポイントです。

## 注意事項

- このツールは公式サイト（https://www.pokemon-card.com/）から情報を取得しています
- サーバーへの負荷を考慮し、適切な間隔でリクエストしてください
- デッキコードは16桁（ハイフン含む）の形式です

## トラブルシューティング

### Puppeteerのインストールエラー

Linux環境などでPuppeteerのインストールに失敗する場合:

```bash
# 必要な依存関係をインストール
sudo apt-get update
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```

### タイムアウトエラー

ページの読み込みに時間がかかる場合、`server.js`のタイムアウト設定を調整してください。

## ライセンス

MIT License

## 免責事項

このツールは非公式のツールです。公式サイトの利用規約を遵守してご利用ください。
