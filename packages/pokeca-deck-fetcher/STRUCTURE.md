# パッケージ構造

```
pokeca-deck-fetcher/
├── src/
│   ├── index.js          # メイン実装ファイル
│   └── index.d.ts        # TypeScript型定義
├── examples/
│   ├── basic.js          # 基本的な使用例
│   ├── express-api.js    # Express APIの例
│   ├── vercel-serverless.js  # Vercel Serverless Functionの例
│   └── batch-processing.js   # バッチ処理の例
├── package.json          # npmパッケージ設定
├── README.md            # メインドキュメント
├── QUICKSTART.md        # クイックスタートガイド
├── USAGE.md             # 使用手順ガイド
├── PUBLISH.md           # 公開手順
├── TESTING.md           # テスト手順
├── CHANGELOG.md         # 変更履歴
├── LICENSE              # MITライセンス
└── .gitignore          # Git除外設定
```

## 主要ファイルの説明

### src/index.js
- デッキ情報取得のコア機能
- `fetchDeckInfo()`: メイン関数
- `createDeckFetcher()`: インスタンス作成
- `validateDeckCode()`: バリデーション
- エラークラス定義

### src/index.d.ts
- TypeScript型定義
- インターフェース定義
- エクスポートされる型とクラス

### examples/
- 実装例集
- 様々な使用パターンのサンプルコード

## エクスポートされる機能

```javascript
{
  fetchDeckInfo,        // デッキ情報を取得する関数
  createDeckFetcher,    // インスタンス作成関数
  DeckFetcher,          // デッキ情報取得クラス
  InvalidDeckCodeError, // 無効なデッキコードエラー
  TimeoutError,         // タイムアウトエラー
  NetworkError,         // ネットワークエラー
  validateDeckCode      // デッキコード検証関数
}
```
