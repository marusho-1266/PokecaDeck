# クイックスタートガイド

## 5分で始める

### 1. インストール

```bash
npm install pokeca-deck-fetcher
```

### 2. 基本的なコード

```javascript
const { fetchDeckInfo } = require('pokeca-deck-fetcher');

async function main() {
  const deckInfo = await fetchDeckInfo('gnLgHg-2ee09u-LiNNQ9');
  console.log(deckInfo);
}

main();
```

### 3. 実行

```bash
node your-file.js
```

## よくある使用パターン

### パターン1: シンプルな取得

```javascript
const { fetchDeckInfo } = require('pokeca-deck-fetcher');
const deckInfo = await fetchDeckInfo('デッキコード');
```

### パターン2: エラーハンドリング

```javascript
const { fetchDeckInfo, InvalidDeckCodeError } = require('pokeca-deck-fetcher');

try {
  const deckInfo = await fetchDeckInfo('デッキコード');
} catch (error) {
  if (error instanceof InvalidDeckCodeError) {
    console.error('無効なデッキコード');
  } else {
    console.error('その他のエラー:', error.message);
  }
}
```

### パターン3: 複数回使用

```javascript
const { createDeckFetcher } = require('pokeca-deck-fetcher');

const fetcher = createDeckFetcher();
const info1 = await fetcher.fetch('コード1');
const info2 = await fetcher.fetch('コード2');
```

### パターン4: Vercel環境

```javascript
const { fetchDeckInfo } = require('pokeca-deck-fetcher');
const chromium = require('@sparticuz/chromium');

const deckInfo = await fetchDeckInfo('デッキコード', {
  environment: 'vercel',
  chromium: chromium
});
```

## 次のステップ

- 詳細な使用方法: [README.md](./README.md)
- 使用例: [examples/](./examples/) ディレクトリ
- 公開手順: [PUBLISH.md](./PUBLISH.md)
