const puppeteer = require('puppeteer-core');

/**
 * デッキコードの形式を検証
 * @param {string} deckCode - デッキコード
 * @returns {boolean} 有効な形式かどうか
 */
function validateDeckCode(deckCode) {
  if (!deckCode || typeof deckCode !== 'string') {
    return false;
  }
  const deckCodePattern = /^[A-Za-z0-9]{6}-[A-Za-z0-9]{6}-[A-Za-z0-9]{6}$/;
  return deckCodePattern.test(deckCode);
}

/**
 * カスタムエラークラス
 */
class InvalidDeckCodeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidDeckCodeError';
  }
}

class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
  }
}

class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * ブラウザインスタンスを取得する関数を生成
 * @param {Object} options - 設定オプション
 * @returns {Function} ブラウザを取得する関数
 */
function createBrowserGetter(options = {}) {
  const { environment, chromium, browserOptions } = options;

  if (environment === 'vercel' && chromium) {
    // Vercel環境用
    chromium.setGraphicsMode(false);
    return async () => {
      try {
        const executablePath = await chromium.executablePath();
        return await puppeteer.launch({
          args: [
            ...chromium.args,
            '--hide-scrollbars',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
          ],
          defaultViewport: chromium.defaultViewport,
          executablePath: executablePath,
          headless: chromium.headless,
          ignoreHTTPSErrors: true,
        });
      } catch (error) {
        throw new Error(`ブラウザの起動に失敗しました: ${error.message}`);
      }
    };
  } else {
    // ローカル環境またはカスタム設定
    const puppeteerFull = require('puppeteer');
    const defaultOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    };

    return async () => {
      try {
        const launchOptions = browserOptions 
          ? { ...defaultOptions, ...browserOptions }
          : defaultOptions;
        return await puppeteerFull.launch(launchOptions);
      } catch (error) {
        throw new Error(`ブラウザの起動に失敗しました: ${error.message}`);
      }
    };
  }
}

/**
 * デッキ情報を取得する
 * @param {string} deckCode - デッキコード
 * @param {Object} options - 設定オプション
 * @param {string} options.environment - 環境 ('local' | 'vercel')
 * @param {Object} options.chromium - Vercel用のchromiumモジュール
 * @param {Object} options.browserOptions - Puppeteerの起動オプション
 * @param {number} options.timeout - タイムアウト時間（ミリ秒）
 * @param {Function} options.getBrowser - カスタムブラウザ取得関数
 * @returns {Promise<Object>} デッキ情報
 */
async function fetchDeckInfo(deckCode, options = {}) {
  // デッキコードの検証
  if (!validateDeckCode(deckCode)) {
    throw new InvalidDeckCodeError('無効なデッキコード形式です。形式: XXXXXX-XXXXXX-XXXXXX');
  }

  const {
    environment = 'local',
    chromium = null,
    browserOptions = null,
    timeout = 30000,
    getBrowser = null
  } = options;

  // ブラウザ取得関数を決定
  const browserGetter = getBrowser || createBrowserGetter({
    environment,
    chromium,
    browserOptions
  });

  let browser = null;
  let page = null;

  try {
    // ブラウザを起動
    browser = await browserGetter();
    page = await browser.newPage();

    // User-Agentを設定（Bot検知を避けるため）
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const url = `https://www.pokemon-card.com/deck/result.html/deckID/${deckCode}/`;

    // ページにアクセス
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: timeout
    });

    // ページが完全に読み込まれるまで待機
    await page.waitForSelector('#copyID', { timeout: 8000 });

    // デッキ情報を抽出
    const deckInfo = await page.evaluate(() => {
      // デッキ基本情報
      const deckCode = document.getElementById('copyID')?.textContent?.trim() || '';
      const totalCardsText = document.querySelector('.Grid_item')?.textContent || '';
      const totalCardsMatch = totalCardsText.match(/(\d+)枚デッキ/);
      const totalCards = totalCardsMatch ? parseInt(totalCardsMatch[1]) : 0;

      // hidden inputからカード情報を取得
      const parseDeckData = (value, category) => {
        if (!value) return [];
        return value.split('-').map(item => {
          const [cardId, count, mainFlag] = item.split('_');
          return {
            cardId: cardId,
            count: parseInt(count),
            mainFlag: parseInt(mainFlag),
            category: category
          };
        });
      };

      const deckData = {
        deckCode: deckCode,
        totalCards: totalCards,
        pokemon: parseDeckData(document.getElementById('deck_pke')?.value, 'ポケモン'),
        goods: parseDeckData(document.getElementById('deck_gds')?.value, 'グッズ'),
        tool: parseDeckData(document.getElementById('deck_tool')?.value, 'ポケモンのどうぐ'),
        support: parseDeckData(document.getElementById('deck_sup')?.value, 'サポート'),
        stadium: parseDeckData(document.getElementById('deck_sta')?.value, 'スタジアム'),
        energy: parseDeckData(document.getElementById('deck_ene')?.value, 'エネルギー')
      };

      // PCGDECKオブジェクトからカード名と画像URLを取得
      const allCards = [];

      [...deckData.pokemon, ...deckData.goods, ...deckData.tool, ...deckData.support, ...deckData.stadium, ...deckData.energy].forEach(card => {
        const cardId = card.cardId;
        if (window.PCGDECK && window.PCGDECK.searchItemNameAlt && window.PCGDECK.searchItemNameAlt[cardId]) {
          allCards.push({
            cardId: cardId,
            name: window.PCGDECK.searchItemNameAlt[cardId],
            fullName: window.PCGDECK.searchItemName[cardId] || window.PCGDECK.searchItemNameAlt[cardId],
            count: card.count,
            category: card.category,
            mainFlag: card.mainFlag,
            imageUrl: window.PCGDECK.searchItemCardPict && window.PCGDECK.searchItemCardPict[cardId] ? 
              `https://www.pokemon-card.com${window.PCGDECK.searchItemCardPict[cardId]}` : null,
            detailUrl: `https://www.pokemon-card.com/card-search/details.php/card/${cardId}/`
          });
        }
      });

      return {
        deckCode: deckData.deckCode,
        totalCards: deckData.totalCards,
        cards: allCards,
        summary: {
          pokemon: deckData.pokemon.length,
          goods: deckData.goods.length,
          tool: deckData.tool.length,
          support: deckData.support.length,
          stadium: deckData.stadium.length,
          energy: deckData.energy.length,
          totalCardTypes: allCards.length
        }
      };
    });

    await page.close();
    await browser.close();

    return deckInfo;

  } catch (error) {
    // クリーンアップ
    try {
      if (page) {
        await page.close().catch(() => {});
      }
      if (browser) {
        await browser.close().catch(() => {});
      }
    } catch (cleanupError) {
      // クリーンアップエラーは無視
    }

    // エラーの種類に応じて適切なエラーをスロー
    if (error.message && error.message.includes('timeout')) {
      throw new TimeoutError('タイムアウト: ページの読み込みに時間がかかりすぎました');
    } else if (error.message && (error.message.includes('net::ERR') || error.message.includes('ECONNREFUSED'))) {
      throw new NetworkError('サーバーに接続できませんでした');
    } else if (error instanceof InvalidDeckCodeError || error instanceof TimeoutError || error instanceof NetworkError) {
      throw error;
    } else {
      throw new Error(`デッキ情報の取得に失敗しました: ${error.message}`);
    }
  }
}

/**
 * デッキ情報取得用のクラス（設定を保持）
 */
class DeckFetcher {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * デッキ情報を取得
   * @param {string} deckCode - デッキコード
   * @returns {Promise<Object>} デッキ情報
   */
  async fetch(deckCode) {
    return fetchDeckInfo(deckCode, this.options);
  }
}

/**
 * デッキ情報取得用のインスタンスを作成
 * @param {Object} options - 設定オプション
 * @returns {DeckFetcher} デッキ情報取得インスタンス
 */
function createDeckFetcher(options = {}) {
  return new DeckFetcher(options);
}

module.exports = {
  fetchDeckInfo,
  createDeckFetcher,
  DeckFetcher,
  InvalidDeckCodeError,
  TimeoutError,
  NetworkError,
  validateDeckCode
};
