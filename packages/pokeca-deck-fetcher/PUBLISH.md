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

### 2. 2要素認証（2FA）の設定

npmにパッケージを公開するには、2要素認証（2FA）が必要です。

#### 方法A: npmアカウントで2FAを有効にする（推奨）

1. [npm公式サイト](https://www.npmjs.com/)にログイン
2. アカウント設定 → 「Two-Factor Authentication」を有効化
3. 認証アプリ（Google Authenticatorなど）でQRコードをスキャン
4. 認証コードを入力して有効化

#### 方法B: Granular Access Tokenを使用する

2FAを有効にしたくない場合は、細かい権限のアクセストークンを作成します。

1. [npm公式サイト](https://www.npmjs.com/)にログイン
2. アカウント設定 → 「Access Tokens」を開く
3. 「Generate New Token」をクリック
4. トークンタイプ: 「Granular」を選択
5. 権限: 「Publish」を選択
6. パッケージ: 特定のパッケージ名を指定（例: `pokeca-deck-fetcher`）
7. トークンを生成し、安全な場所に保存

トークンを使用してログイン:

```bash
npm login --auth-type=legacy
# Username: あなたのnpmユーザー名
# Password: 生成したトークン
# Email: あなたのメールアドレス
```

または、`.npmrc`ファイルに直接設定:

```bash
# .npmrcファイルに追加
echo "//registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE" > ~/.npmrc
```

### 3. パッケージ名の確認

`package.json`の`name`フィールドが既に使用されていないか確認してください。

```bash
npm view pokeca-deck-fetcher
```

既に使用されている場合は、別の名前に変更する必要があります。

### 4. バージョンの確認

`package.json`の`version`フィールドを確認・更新してください。

### 5. 公開

```bash
cd packages/pokeca-deck-fetcher
npm publish
```

**注意**: 初回公開時は、2FAの認証コードが求められる場合があります。

### 6. 公開後の確認

```bash
npm view pokeca-deck-fetcher
```

## エラー対処

### 403 Forbidden エラー（2FA関連）

エラーメッセージ:
```
403 Forbidden - Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages.
```

**解決方法**:
1. npmアカウントで2FAを有効化する（上記「方法A」を参照）
2. または、Granular Access Tokenを作成して使用する（上記「方法B」を参照）

### パッケージ名が既に使用されている

エラーメッセージ:
```
403 Forbidden - You do not have permission to publish "package-name".
```

**解決方法**:
1. `package.json`の`name`フィールドを別の名前に変更
2. または、そのパッケージの所有者に連絡して権限を取得

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
