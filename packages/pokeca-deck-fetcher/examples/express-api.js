/**
 * Express APIとして使用する例
 */
const express = require('express');
const { fetchDeckInfo, InvalidDeckCodeError } = require('../src/index');

const app = express();
app.use(express.json());

// デッキ情報を取得するAPI
app.post('/api/deck', async (req, res) => {
  try {
    const { deckCode } = req.body;
    
    if (!deckCode) {
      return res.status(400).json({ 
        success: false,
        error: 'デッキコードが指定されていません' 
      });
    }

    const deckInfo = await fetchDeckInfo(deckCode);
    res.json({ 
      success: true, 
      data: deckInfo 
    });
  } catch (error) {
    if (error instanceof InvalidDeckCodeError) {
      return res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
