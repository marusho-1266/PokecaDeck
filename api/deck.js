const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

// Chromiumの設定を最適化
chromium.setGraphicsMode(false);

async function getBrowser() {
  // Vercel環境ではリクエストごとに新しいブラウザインスタンスを作成
  // （Serverless Functionsでは再利用が推奨されない）
  try {
    console.log('Chromiumの実行パスを取得中...');
    const executablePath = await chromium.executablePath();
    console.log('Chromium実行パス:', executablePath);
    
    console.log('ブラウザを起動中...');
    const browser = await puppeteer.launch({
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
    
    console.log('ブラウザの起動に成功しました');
    return browser;
  } catch (error) {
    console.error('ブラウザの起動に失敗しました:', error);
    throw error;
  }
}

// Vercel Serverless Functionとしてエクスポート
module.exports = async (req, res) => {
  // レスポンスが既に送信されたかどうかを追跡
  let responseSent = false;

  // 安全にJSONレスポンスを送信するヘルパー関数
  const sendJsonResponse = (statusCode, data) => {
    if (responseSent) {
      console.warn('レスポンスは既に送信されています');
      return;
    }
    responseSent = true;
    res.status(statusCode).json(data);
  };

  // 最外側のtry-catchで全てのエラーをキャッチ
  try {
    // CORSヘッダーを設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // OPTIONSリクエスト（プリフライト）の処理
    if (req.method === 'OPTIONS') {
      responseSent = true;
      return res.status(200).end();
    }

    // POSTリクエストのみ処理
    if (req.method !== 'POST') {
      return sendJsonResponse(405, { success: false, error: 'Method not allowed' });
    }

    // リクエストボディをパース
    let body;
    try {
      // Vercelではreq.bodyが既にパースされている場合がある
      if (typeof req.body === 'string') {
        body = JSON.parse(req.body);
      } else if (req.body && typeof req.body === 'object') {
        body = req.body;
      } else {
        return sendJsonResponse(400, { success: false, error: 'リクエストボディが無効です' });
      }
    } catch (e) {
      console.error('リクエストボディのパースエラー:', e);
      return sendJsonResponse(400, { success: false, error: 'Invalid JSON: ' + e.message });
    }

    const { deckCode } = body || {};

    if (!deckCode) {
      return sendJsonResponse(400, { success: false, error: 'デッキコードが指定されていません' });
    }

    // デッキコードの形式チェック（16文字、ハイフン区切り）
    const deckCodePattern = /^[A-Za-z0-9]{6}-[A-Za-z0-9]{6}-[A-Za-z0-9]{6}$/;
    if (!deckCodePattern.test(deckCode)) {
      return sendJsonResponse(400, { success: false, error: '無効なデッキコード形式です' });
    }

    let browser = null;
    let page = null;
    try {
      console.log('ブラウザの起動を開始します...');
      browser = await getBrowser();
      console.log('ブラウザの起動が完了しました');
      
      page = await browser.newPage();
      console.log('新しいページを作成しました');

    // User-Agentを設定（Bot検知を避けるため）
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const url = `https://www.pokemon-card.com/deck/result.html/deckID/${deckCode}/`;
    
    console.log(`デッキ情報を取得中: ${url}`);
    
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 25000  // Vercelのタイムアウトを考慮して25秒に短縮
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

      return sendJsonResponse(200, {
        success: true,
        data: deckInfo
      });

    } catch (error) {
      console.error('エラーが発生しました:', error);
      console.error('エラースタック:', error.stack);
      
      // クリーンアップ
      try {
        if (page) {
          await page.close().catch(() => {});
        }
        if (browser) {
          await browser.close().catch(() => {});
        }
      } catch (cleanupError) {
        console.error('クリーンアップエラー:', cleanupError);
      }

      // エラーメッセージを適切に処理（必ずJSONレスポンスを返す）
      let statusCode = 500;
      let errorMessage = 'デッキ情報の取得に失敗しました';

      if (error.message && error.message.includes('timeout')) {
        statusCode = 408;
        errorMessage = 'タイムアウト: ページの読み込みに時間がかかりすぎました';
      } else if (error.message && (error.message.includes('net::ERR') || error.message.includes('ECONNREFUSED'))) {
        statusCode = 503;
        errorMessage = 'サーバーに接続できませんでした';
      } else if (error.message && (error.message.includes('libnss3') || error.message.includes('shared libraries'))) {
        statusCode = 500;
        errorMessage = 'ブラウザの起動に失敗しました。しばらく待ってから再度お試しください。';
      } else {
        // エラーメッセージの最初の100文字のみを返す（機密情報の漏洩を防ぐ）
        const safeMessage = error.message ? error.message.substring(0, 100) : 'Unknown error';
        errorMessage = `デッキ情報の取得に失敗しました: ${safeMessage}`;
      }

      return sendJsonResponse(statusCode, { 
        success: false,
        error: errorMessage 
      });
    }
  } catch (outerError) {
    // 最外側のエラーハンドリング（予期しないエラー）
    console.error('予期しないエラーが発生しました:', outerError);
    console.error('エラースタック:', outerError.stack);
    
    // 必ずJSONレスポンスを返す
    if (!responseSent) {
      return sendJsonResponse(500, {
        success: false,
        error: 'サーバーエラーが発生しました。しばらく待ってから再度お試しください。'
      });
    }
  }
};
