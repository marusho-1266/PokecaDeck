# 別アプリへの統合方法

## 統合方法の選択

### 方法1: npmパッケージとしてインストール（推奨）

#### 公開後
```bash
npm install pokeca-deck-fetcher
```

#### 公開前（ローカル）
```bash
# プロジェクトのpackage.jsonに追加
{
  "dependencies": {
    "pokeca-deck-fetcher": "file:../packages/pokeca-deck-fetcher"
  }
}

# インストール
npm install
```

### 方法2: npm linkを使用

```bash
# パッケージディレクトリで
cd packages/pokeca-deck-fetcher
npm link

# 使用するプロジェクトで
cd /path/to/your/project
npm link pokeca-deck-fetcher
```

### 方法3: 直接コピー

```javascript
// プロジェクト内に直接コピー
const { fetchDeckInfo } = require('./lib/pokeca-deck-fetcher/src/index');
```

## 統合例

### Expressアプリへの統合

```javascript
// app.js
const express = require('express');
const { fetchDeckInfo } = require('pokeca-deck-fetcher');

const app = express();
app.use(express.json());

app.post('/api/deck', async (req, res) => {
  try {
    const { deckCode } = req.body;
    const deckInfo = await fetchDeckInfo(deckCode);
    res.json({ success: true, data: deckInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000);
```

### Next.js API Routeへの統合

```javascript
// pages/api/deck.js または app/api/deck/route.js
import { fetchDeckInfo } from 'pokeca-deck-fetcher';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { deckCode } = req.body;
    const deckInfo = await fetchDeckInfo(deckCode);
    res.json({ success: true, data: deckInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

### Vercel Serverless Functionへの統合

```javascript
// api/deck.js
const { fetchDeckInfo } = require('pokeca-deck-fetcher');
const chromium = require('@sparticuz/chromium');

module.exports = async (req, res) => {
  // CORS設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { deckCode } = req.body;
    const deckInfo = await fetchDeckInfo(deckCode, {
      environment: 'vercel',
      chromium: chromium,
      timeout: 25000
    });
    res.json({ success: true, data: deckInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### クラスベースのアプリへの統合

```javascript
// DeckService.js
const { createDeckFetcher } = require('pokeca-deck-fetcher');

class DeckService {
  constructor() {
    this.fetcher = createDeckFetcher({
      timeout: 30000
    });
  }

  async getDeckInfo(deckCode) {
    return await this.fetcher.fetch(deckCode);
  }

  async getMultipleDecks(deckCodes) {
    const results = [];
    for (const code of deckCodes) {
      try {
        const info = await this.fetcher.fetch(code);
        results.push({ code, success: true, data: info });
      } catch (error) {
        results.push({ code, success: false, error: error.message });
      }
    }
    return results;
  }
}

module.exports = DeckService;
```

## 依存関係の管理

### package.jsonの例

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "pokeca-deck-fetcher": "file:../packages/pokeca-deck-fetcher",
    "express": "^4.18.2"
  }
}
```

### 必要な依存関係

パッケージ自体が自動的にインストール:
- `puppeteer` (ローカル環境用)
- `puppeteer-core` (Serverless環境用)

オプション（Vercel環境の場合）:
- `@sparticuz/chromium`

## トラブルシューティング

### モジュールが見つからない

```bash
# node_modulesを再インストール
rm -rf node_modules package-lock.json
npm install
```

### Puppeteerのエラー

```bash
# Chromeを手動でインストール
npx puppeteer browsers install chrome
```

### メモリ不足

```javascript
// ブラウザオプションを調整
const deckInfo = await fetchDeckInfo(deckCode, {
  browserOptions: {
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  }
});
```
