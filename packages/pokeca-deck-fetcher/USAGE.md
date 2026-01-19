# 使用手順ガイド

## インストール

### npmからインストール（公開後）

```bash
npm install pokeca-deck-fetcher
```

### ローカルからインストール（開発中）

```bash
# パッケージのパスを指定
npm install /path/to/packages/pokeca-deck-fetcher

# または相対パス
npm install ../packages/pokeca-deck-fetcher
```

## 基本的な使用手順

### 1. モジュールのインポート

```javascript
// CommonJS
const { fetchDeckInfo } = require('pokeca-deck-fetcher');

// ES Modules
import { fetchDeckInfo } from 'pokeca-deck-fetcher';
```

### 2. デッキ情報の取得

```javascript
async function getDeck() {
  try {
    const deckCode = 'gnLgHg-2ee09u-LiNNQ9';
    const deckInfo = await fetchDeckInfo(deckCode);
    console.log(deckInfo);
  } catch (error) {
    console.error('エラー:', error.message);
  }
}
```

### 3. 環境に応じた設定

#### ローカル環境（デフォルト）

```javascript
const deckInfo = await fetchDeckInfo(deckCode);
```

#### Vercel環境

```javascript
const chromium = require('@sparticuz/chromium');
const deckInfo = await fetchDeckInfo(deckCode, {
  environment: 'vercel',
  chromium: chromium
});
```

#### カスタム設定

```javascript
const deckInfo = await fetchDeckInfo(deckCode, {
  browserOptions: {
    headless: true,
    args: ['--no-sandbox']
  },
  timeout: 30000
});
```

## 実装例

### Express APIとして使用

```javascript
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

### バッチ処理

```javascript
const { createDeckFetcher } = require('pokeca-deck-fetcher');

const fetcher = createDeckFetcher();
const deckCodes = ['code1', 'code2', 'code3'];

for (const code of deckCodes) {
  try {
    const info = await fetcher.fetch(code);
    console.log(`${code}: ${info.totalCards}枚`);
    // サーバー負荷を考慮して待機
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error(`${code}: エラー - ${error.message}`);
  }
}
```

## トラブルシューティング

### Puppeteerのインストールエラー

```bash
# Chromeを手動でインストール
npx puppeteer browsers install chrome
```

### メモリ不足エラー

```javascript
// ブラウザオプションでメモリ使用量を制限
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

### タイムアウトエラー

```javascript
// タイムアウト時間を延長
const deckInfo = await fetchDeckInfo(deckCode, {
  timeout: 60000  // 60秒
});
```
