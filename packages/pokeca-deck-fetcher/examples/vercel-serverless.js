/**
 * Vercel Serverless Functionとして使用する例
 * 
 * このファイルは api/deck.js として配置します
 */
const { fetchDeckInfo } = require('pokeca-deck-fetcher');
const chromium = require('@sparticuz/chromium');

// Vercel Serverless Functionとしてエクスポート
module.exports = async (req, res) => {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // OPTIONSリクエスト（プリフライト）の処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POSTリクエストのみ処理
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  // リクエストボディをパース
  let body;
  try {
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else if (req.body && typeof req.body === 'object') {
      body = req.body;
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'リクエストボディが無効です' 
      });
    }
  } catch (e) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid JSON: ' + e.message 
    });
  }

  const { deckCode } = body || {};

  if (!deckCode) {
    return res.status(400).json({ 
      success: false, 
      error: 'デッキコードが指定されていません' 
    });
  }

  try {
    // Vercel環境用の設定でデッキ情報を取得
    const deckInfo = await fetchDeckInfo(deckCode, {
      environment: 'vercel',
      chromium: chromium,
      timeout: 25000
    });

    return res.status(200).json({
      success: true,
      data: deckInfo
    });
  } catch (error) {
    console.error('エラー:', error);
    
    let statusCode = 500;
    let errorMessage = 'デッキ情報の取得に失敗しました';

    if (error.name === 'InvalidDeckCodeError') {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.name === 'TimeoutError') {
      statusCode = 408;
      errorMessage = error.message;
    } else if (error.name === 'NetworkError') {
      statusCode = 503;
      errorMessage = error.message;
    } else {
      errorMessage = `デッキ情報の取得に失敗しました: ${error.message}`;
    }

    return res.status(statusCode).json({ 
      success: false,
      error: errorMessage 
    });
  }
};
