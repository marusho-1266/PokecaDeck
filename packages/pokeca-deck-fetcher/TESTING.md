# テスト手順

## ローカルでのテスト

### 1. 依存関係のインストール

```bash
cd packages/pokeca-deck-fetcher
npm install
```

### 2. 基本的な動作確認

```bash
# 基本的な使用例を実行
node examples/basic.js
```

期待される出力:
- デッキコード、総枚数、サマリー、カード一覧が表示される

### 3. Express APIのテスト

```bash
# Express APIサーバーを起動
node examples/express-api.js
```

別のターミナルで:

```bash
# APIをテスト
curl -X POST http://localhost:3000/api/deck \
  -H "Content-Type: application/json" \
  -d '{"deckCode":"gnLgHg-2ee09u-LiNNQ9"}'
```

### 4. エラーハンドリングのテスト

無効なデッキコードでテスト:

```javascript
const { fetchDeckInfo, InvalidDeckCodeError } = require('./src/index');

async function test() {
  try {
    await fetchDeckInfo('invalid-code');
  } catch (error) {
    if (error instanceof InvalidDeckCodeError) {
      console.log('✓ 無効なデッキコードエラーが正しく処理されました');
    }
  }
}

test();
```

## トラブルシューティング

### Puppeteerのインストールエラー

```bash
# Chromeを手動でインストール
npx puppeteer browsers install chrome
```

### メモリ不足エラー

メモリが不足する場合は、ブラウザオプションを調整してください。

### タイムアウトエラー

ネットワークが遅い場合は、タイムアウト時間を延長してください。
