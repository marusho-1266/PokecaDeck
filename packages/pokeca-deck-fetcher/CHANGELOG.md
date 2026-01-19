# Changelog

## [1.0.0] - 2024-01-XX

### 追加
- デッキコードからデッキ情報を取得する基本機能
- ローカル環境とVercel環境の両方に対応
- カスタムPuppeteer設定のサポート
- TypeScript型定義ファイル
- エラーハンドリング（InvalidDeckCodeError, TimeoutError, NetworkError）
- 使用例（基本的な使用、Express API、Vercel Serverless、バッチ処理）

### 機能
- `fetchDeckInfo()`: デッキ情報を取得する関数
- `createDeckFetcher()`: 設定を保持したインスタンスを作成
- `validateDeckCode()`: デッキコードの形式を検証
- `DeckFetcher`クラス: 再利用可能なデッキ情報取得インスタンス
