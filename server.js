const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ブラウザインスタンスを再利用（パフォーマンス向上）
let browser = null;

async function getBrowser() {
  if (!browser) {
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      });
      console.log('ブラウザの起動に成功しました');
    } catch (error) {
      // Chromeが見つからない場合、インストールを試みる（フォールバック）
      if (error.message.includes('Could not find Chrome')) {
        console.log('Chromeが見つかりません。インストールを試みます...');
        try {
          execSync('npx puppeteer browsers install chrome', { 
            stdio: 'inherit',
            timeout: 120000 // 2分のタイムアウト
          });
          console.log('Chromeのインストールが完了しました。再試行します...');
          
          // 再試行
          browser = await puppeteer.launch({
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--disable-gpu'
            ]
          });
          console.log('ブラウザの起動に成功しました（再試行後）');
        } catch (installError) {
          console.error('Chromeのインストールに失敗しました:', installError);
          throw error; // 元のエラーを再スロー
        }
      } else {
        throw error;
      }
    }
  }
  return browser;
}

// デッキコードからデッキ情報を取得するAPI
app.post('/api/deck', async (req, res) => {
  const { deckCode } = req.body;

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
});

// ヘルスチェックエンドポイント
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ルートパス
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});

// グレースフルシャットダウン
process.on('SIGTERM', async () => {
  console.log('SIGTERMシグナルを受信しました。ブラウザを閉じます...');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINTシグナルを受信しました。ブラウザを閉じます...');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});
