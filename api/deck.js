const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

// ブラウザインスタンスを再利用（パフォーマンス向上）
let browser = null;

async function getBrowser() {
  if (!browser) {
    // Vercel環境では@sparticuz/chromiumを使用
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  }
  return browser;
}

// Vercel Serverless Functionとしてエクスポート
module.exports = async (req, res) => {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエスト（プリフライト）の処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POSTリクエストのみ処理
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // リクエストボディをパース
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { deckCode } = body;

  if (!deckCode) {
    return res.status(400).json({ error: 'デッキコードが指定されていません' });
  }

  // デッキコードの形式チェック（16文字、ハイフン区切り）
  const deckCodePattern = /^[A-Za-z0-9]{6}-[A-Za-z0-9]{6}-[A-Za-z0-9]{6}$/;
  if (!deckCodePattern.test(deckCode)) {
    return res.status(400).json({ error: '無効なデッキコード形式です' });
  }

  let page = null;
  try {
    const browserInstance = await getBrowser();
    page = await browserInstance.newPage();

    // User-Agentを設定（Bot検知を避けるため）
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const url = `https://www.pokemon-card.com/deck/result.html/deckID/${deckCode}/`;
    
    console.log(`デッキ情報を取得中: ${url}`);
    
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // ページが完全に読み込まれるまで待機
    await page.waitForSelector('#copyID', { timeout: 10000 });

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

    res.json({
      success: true,
      data: deckInfo
    });

  } catch (error) {
    console.error('エラーが発生しました:', error);
    
    if (page) {
      await page.close().catch(() => {});
    }

    // エラーメッセージを適切に処理
    if (error.message.includes('timeout')) {
      return res.status(408).json({ 
        error: 'タイムアウト: ページの読み込みに時間がかかりすぎました' 
      });
    } else if (error.message.includes('net::ERR')) {
      return res.status(503).json({ 
        error: 'サーバーに接続できませんでした' 
      });
    } else {
      return res.status(500).json({ 
        error: 'デッキ情報の取得に失敗しました: ' + error.message 
      });
    }
  }
};
