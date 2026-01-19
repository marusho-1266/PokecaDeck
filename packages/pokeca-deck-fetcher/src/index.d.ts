/**
 * カード情報
 */
export interface Card {
  /** カードID（5桁） */
  cardId: string;
  /** カード名 */
  name: string;
  /** 正式名称（セット情報含む） */
  fullName: string;
  /** 枚数 */
  count: number;
  /** カテゴリ */
  category: string;
  /** メインフラグ（1または9） */
  mainFlag: number;
  /** 画像URL */
  imageUrl: string | null;
  /** 詳細ページURL */
  detailUrl: string;
}

/**
 * デッキ情報のサマリー
 */
export interface DeckSummary {
  /** ポケモンの種類数 */
  pokemon: number;
  /** グッズの種類数 */
  goods: number;
  /** ポケモンのどうぐの種類数 */
  tool: number;
  /** サポートの種類数 */
  support: number;
  /** スタジアムの種類数 */
  stadium: number;
  /** エネルギーの種類数 */
  energy: number;
  /** 総カード種類数 */
  totalCardTypes: number;
}

/**
 * デッキ情報
 */
export interface DeckInfo {
  /** デッキコード */
  deckCode: string;
  /** 総枚数 */
  totalCards: number;
  /** カード一覧 */
  cards: Card[];
  /** サマリー */
  summary: DeckSummary;
}

/**
 * 設定オプション
 */
export interface FetchOptions {
  /** 環境 ('local' | 'vercel') */
  environment?: 'local' | 'vercel';
  /** Vercel用のchromiumモジュール（environment: 'vercel'の場合に必要） */
  chromium?: any;
  /** Puppeteerの起動オプション */
  browserOptions?: import('puppeteer').LaunchOptions;
  /** タイムアウト時間（ミリ秒） */
  timeout?: number;
  /** カスタムブラウザ取得関数 */
  getBrowser?: () => Promise<import('puppeteer').Browser>;
}

/**
 * 無効なデッキコードエラー
 */
export class InvalidDeckCodeError extends Error {
  constructor(message: string);
}

/**
 * タイムアウトエラー
 */
export class TimeoutError extends Error {
  constructor(message: string);
}

/**
 * ネットワークエラー
 */
export class NetworkError extends Error {
  constructor(message: string);
}

/**
 * デッキ情報取得用のクラス
 */
export class DeckFetcher {
  constructor(options?: FetchOptions);
  /**
   * デッキ情報を取得
   * @param deckCode デッキコード
   * @returns デッキ情報
   */
  fetch(deckCode: string): Promise<DeckInfo>;
}

/**
 * デッキコードからデッキ情報を取得
 * @param deckCode デッキコード（形式: XXXXXX-XXXXXX-XXXXXX）
 * @param options 設定オプション
 * @returns デッキ情報
 */
export function fetchDeckInfo(deckCode: string, options?: FetchOptions): Promise<DeckInfo>;

/**
 * 設定を保持したデッキ情報取得インスタンスを作成
 * @param options 設定オプション
 * @returns デッキ情報取得インスタンス
 */
export function createDeckFetcher(options?: FetchOptions): DeckFetcher;

/**
 * デッキコードの形式を検証
 * @param deckCode デッキコード
 * @returns 有効な形式かどうか
 */
export function validateDeckCode(deckCode: string): boolean;
