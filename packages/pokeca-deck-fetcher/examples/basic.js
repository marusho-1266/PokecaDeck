/**
 * 基本的な使用例
 */
const { fetchDeckInfo } = require('../src/index');

async function main() {
  try {
    const deckCode = 'gnLgHg-2ee09u-LiNNQ9';
    console.log(`デッキコード ${deckCode} の情報を取得中...`);
    
    const deckInfo = await fetchDeckInfo(deckCode);
    
    console.log('\n=== デッキ情報 ===');
    console.log('デッキコード:', deckInfo.deckCode);
    console.log('総枚数:', deckInfo.totalCards);
    console.log('\n=== サマリー ===');
    console.log('ポケモン:', deckInfo.summary.pokemon, '種類');
    console.log('グッズ:', deckInfo.summary.goods, '種類');
    console.log('ポケモンのどうぐ:', deckInfo.summary.tool, '種類');
    console.log('サポート:', deckInfo.summary.support, '種類');
    console.log('スタジアム:', deckInfo.summary.stadium, '種類');
    console.log('エネルギー:', deckInfo.summary.energy, '種類');
    console.log('総カード種類数:', deckInfo.summary.totalCardTypes);
    
    console.log('\n=== カード一覧（最初の5枚） ===');
    deckInfo.cards.slice(0, 5).forEach(card => {
      console.log(`- ${card.name} x${card.count} (${card.category})`);
    });
    
  } catch (error) {
    console.error('エラー:', error.message);
    process.exit(1);
  }
}

main();
