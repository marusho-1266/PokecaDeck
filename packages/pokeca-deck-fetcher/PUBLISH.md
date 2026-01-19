# npmパッケージの公開手順

## ローカルでのテスト

### 1. パッケージのビルド確認

```bash
cd packages/pokeca-deck-fetcher
npm install
```

### 2. 使用例の実行

```bash
# 基本的な使用例
node examples/basic.js

# Express APIの例（別ターミナルで実行）
node examples/express-api.js
```

## npmに公開する場合

### 1. npmアカウントにログイン

```bash
npm login
```

### 2. パッケージ名の確認

`package.json`の`name`フィールドが既に使用されていないか確認してください。
既に使用されている場合は、別の名前に変更する必要があります。

### 3. バージョンの確認

`package.json`の`version`フィールドを確認・更新してください。

### 4. 公開

```bash
cd packages/pokeca-deck-fetcher
npm publish
```

### 5. 公開後の確認

```bash
npm view pokeca-deck-fetcher
```

## ローカルで使用する場合（公開前のテスト）

### 方法1: npm linkを使用

```bash
# パッケージディレクトリで
cd packages/pokeca-deck-fetcher
npm link

# 使用するプロジェクトで
cd /path/to/your/project
npm link pokeca-deck-fetcher
```

### 方法2: ローカルパスでインストール

使用するプロジェクトの`package.json`に以下を追加：

```json
{
  "dependencies": {
    "pokeca-deck-fetcher": "file:../packages/pokeca-deck-fetcher"
  }
}
```

その後：

```bash
npm install
```

### 方法3: 相対パスで直接require

```javascript
const { fetchDeckInfo } = require('../packages/pokeca-deck-fetcher/src/index');
```

## バージョンアップ

```bash
# パッチバージョン（1.0.0 -> 1.0.1）
npm version patch

# マイナーバージョン（1.0.0 -> 1.1.0）
npm version minor

# メジャーバージョン（1.0.0 -> 2.0.0）
npm version major

# 公開
npm publish
```
