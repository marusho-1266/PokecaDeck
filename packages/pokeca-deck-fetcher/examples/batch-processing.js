/**
 * バッチ処理の例
 */
const { createDeckFetcher } = require('../src/index');

async function main() {
  const fetcher = createDeckFetcher({
    timeout: 30000
  });

  const deckCodes = [
    'gnLgHg-2ee09u-LiNNQ9',
    // 他のデッキコードを追加
  ];

  console.log(`${deckCodes.length}件のデッキ情報を取得します...\n`);

  // 順次処理（サーバー負荷を考慮）
  for (let i = 0; i < deckCodes.length; i++) {
    const deckCode = deckCodes[i];
    try {
      console.log(`[${i + 1}/${deckCodes.length}] ${deckCode} を処理中...`);
      const deckInfo = await fetcher.fetch(deckCode);
      console.log(`  ✓ ${deckInfo.totalCards}枚デッキ (${deckInfo.summary.totalCardTypes}種類)`);
      
      // サーバー負荷を考慮して待機（最後のリクエスト以外）
      if (i < deckCodes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`  ✗ エラー: ${error.message}`);
    }
  }

  console.log('\n処理が完了しました');
}

main().catch(console.error);
