# ポケモンカード公式サイトのデッキ表示ページ解析結果まとめ

## はじめに

ポケモンカードゲーム（ポケカ）の公式サイト「トレーナーズウェブサイト」では、デッキコードを入力すると、そのデッキの詳細情報が表示される「デッキ表示ページ」が公開されています。この記事では、このデッキ表示ページ（`confirm.html` または `result.html`）のHTML構造を解析し、どのような情報がどのような形式で格納されているのか、実際の解析結果を交えながら詳しく解説します。

## デッキ表示ページとは

デッキ表示ページは、16桁のデッキコード（例：`bFkVkd-lnUMIE-FV1VfF`）を基に、デッキに含まれる全カードの情報を視覚的に表示するページです。

### URL構造

```
https://www.pokemon-card.com/deck/confirm.html/deckID/{デッキコード}/
```

例: `https://www.pokemon-card.com/deck/confirm.html/deckID/bFkVkd-lnUMIE-FV1VfF/`

**注意**: デッキ表示ページのURLは、`result.html` または `confirm.html` のいずれかが使用される場合があります。どちらのURLでも同じ構造で情報を取得できます。

このページにアクセスすると、サーバー側で保存されたデッキ構成データが読み込まれ、HTMLとしてレンダリングされます。

### デッキ表示ページの実際の表示

![デッキ表示ページの全体スクリーンショット](./deck_display_page_full.png)

*デッキコード `bFkVkd-lnUMIE-FV1VfF` のデッキ表示ページの全体表示*

## デッキ表示ページのHTML構造解析

デッキ表示ページから情報を取得するには、主に2つのデータソースを利用します：

1. **Hidden Input Fields** - HTMLフォーム内のhidden input要素
2. **JavaScript PCGDECK Object** - ページ内のJavaScriptオブジェクト

それぞれの構造を詳しく見ていきましょう。

## 1. Hidden Input Fieldsからのデータ取得

### HTML構造

デッキ表示ページには、カテゴリごとにhidden inputフィールドが存在します。これらの要素は、ブラウザのデベロッパーツール（F12キーまたは右クリック→「検証」）で確認できます。

**デベロッパーツールでの確認方法：**
1. デッキ表示ページを開く
2. F12キーを押すか、ページ上で右クリック→「検証」を選択
3. 「Elements」タブ（または「要素」タブ）で、`<input type="hidden" id="deck_pke">` などの要素を検索
4. 各要素の `value` 属性に、カード情報がエンコードされた形式で格納されている

```html
<input type="hidden" id="deck_pke" value="48397_3_1-48396_4_1-48436_1_1-45762_1_1-46415_1_1-49685_1_1-46067_1_1-45849_3_1-46066_1_1-46662_1_1-47178_1_1">
<input type="hidden" id="deck_gds" value="45209_3_1-49378_4_1-35140_3_1-42066_1_1-45640_1_1-49356_2_1-46812_2_1">
<input type="hidden" id="deck_tool" value="41126_2_1">
<input type="hidden" id="deck_sup" value="48253_3_1-38821_3_1-45215_3_1-47104_2_1-49608_2_1">
<input type="hidden" id="deck_sta" value="47796_2_1">
<input type="hidden" id="deck_ene" value="47909_9_1">
```

**デベロッパーツールでの表示例：**

```
Elements タブ
├─ <html>
   └─ <body>
      └─ <form>
         ├─ <input type="hidden" id="deck_pke" value="48397_3_1-48396_4_1-...">
         ├─ <input type="hidden" id="deck_gds" value="45209_3_1-49378_4_1-...">
         ├─ <input type="hidden" id="deck_tool" value="41126_2_1">
         ├─ <input type="hidden" id="deck_sup" value="48253_3_1-38821_3_1-...">
         ├─ <input type="hidden" id="deck_sta" value="47796_2_1">
         └─ <input type="hidden" id="deck_ene" value="47909_9_1">
```

### カテゴリと要素IDの対応

| 要素ID | カテゴリ | 説明 |
|--------|---------|------|
| `deck_pke` | ポケモン | たねポケモン、進化ポケモンを含む |
| `deck_gds` | グッズ | トレーナーズカード（グッズ） |
| `deck_tool` | ポケモンのどうぐ | ポケモンに装備するアイテム |
| `deck_sup` | サポート | サポートカード |
| `deck_sta` | スタジアム | スタジアムカード |
| `deck_ene` | エネルギー | 基本エネルギー、特殊エネルギー |

### データ形式の解析

各hidden inputの値は、以下の形式でカード情報を保持しています：

```
カードID_枚数_メインフラグ-カードID_枚数_メインフラグ-...
```

- **カードID**: 5桁の数字（例: `48624`）
- **枚数**: デッキ内の枚数（例: `4`）
- **メインフラグ**: メインポケモンかどうかのフラグ（`1`または`9`）
- **区切り文字**: カード間は `-` で区切られる

### 実際の解析例

`deck_pke` の値 `"48397_3_1-48396_4_1-48436_1_1"` を解析すると：

```
48397_3_1  → カードID: 48397, 枚数: 3, メインフラグ: 1
48396_4_1  → カードID: 48396, 枚数: 4, メインフラグ: 1
48436_1_1  → カードID: 48436, 枚数: 1, メインフラグ: 1
```

### メインフラグの意味

メインフラグは、デッキ構築時に「メイン」として設定されたポケモンを識別するための値です：

- **`1`**: 通常のポケモン（グレー表示）
- **`9`**: メインポケモン（赤色表示）

ただし、このフラグは表示上の区別であり、カードの種類や強さとは直接関係ありません。

## 2. JavaScript PCGDECKオブジェクトからのデータ取得

### PCGDECKオブジェクトの構造

ページ内のJavaScriptには、`window.PCGDECK` というグローバルオブジェクトが定義されており、カードの詳細情報が格納されています。

**デベロッパーツールでの確認方法：**
1. デッキ表示ページを開く
2. F12キーを押してデベロッパーツールを開く
3. 「Console」タブ（または「コンソール」タブ）を選択
4. `window.PCGDECK` と入力してEnterキーを押す
5. オブジェクトの構造が展開表示される

**コンソールでの表示例：**

```javascript
> window.PCGDECK
{
  searchItemName: {48397: "ストリンダー(M2 057/080)", 48396: "エレズン(M2 056/080)", ...},
  searchItemNameAlt: {48397: "ストリンダー", 48396: "エレズン", ...},
  searchItemCardPict: {48397: "/assets/images/card_images/large/M2/048397_P_SUTORINDA.jpg", ...}
}
```

```javascript
window.PCGDECK = {
  searchItemName: {
    48397: 'ストリンダー(M2 057/080)',
    48396: 'エレズン(M2 056/080)',
    48436: 'メガアブソルex(M1L 079/063)',
    // ... 他のカード情報
  },
  searchItemNameAlt: {
    48397: 'ストリンダー',
    48396: 'エレズン',
    48436: 'メガアブソルex',
    // ... 他のカード情報
  },
  searchItemCardPict: {
    48397: '/assets/images/card_images/large/M2/048397_P_SUTORINDA.jpg',
    48396: '/assets/images/card_images/large/M2/048396_P_EREZUN.jpg',
    48436: '/assets/images/card_images/large/M1L/048436_P_MABUSORUEX.jpg',
    // ... 他のカード画像URL
  }
};
```

### PCGDECKオブジェクトの各プロパティ

| プロパティ | 説明 | 例 |
|----------|------|-----|
| `searchItemName` | セット情報を含む正式名称 | `ストリンダー(M2 057/080)` |
| `searchItemNameAlt` | カードの表示名（短縮版） | `ストリンダー` |
| `searchItemCardPict` | カード画像のパス（相対パス） | `/assets/images/card_images/large/M2/048397_P_SUTORINDA.jpg` |

### 画像URLの完全なURLへの変換

`searchItemCardPict` の値は相対パスなので、完全なURLにするにはドメインを付与する必要があります：

```javascript
const imageUrl = `https://www.pokemon-card.com${window.PCGDECK.searchItemCardPict[cardId]}`;
```

## 実際の解析結果の例

実際のデッキコード `bFkVkd-lnUMIE-FV1VfF` を解析した結果を紹介します。

### デッキ基本情報

- **デッキコード**: `bFkVkd-lnUMIE-FV1VfF`
- **総枚数**: 60枚
- **URL**: https://www.pokemon-card.com/deck/confirm.html/deckID/bFkVkd-lnUMIE-FV1VfF/

### Hidden Input Fieldsの実際の値

#### deck_pke（ポケモン）

```
48397_3_1-48396_4_1-48436_1_1-45762_1_1-46415_1_1-49685_1_1-46067_1_1-45849_3_1-46066_1_1-46662_1_1-47178_1_1
```

解析結果（全カード名称・枚数）：
- カードID `48397`: 3枚（ストリンダー）
- カードID `48396`: 4枚（エレズン）
- カードID `48436`: 1枚（メガアブソルex）
- カードID `45762`: 1枚（アラブルタケ）
- カードID `46415`: 1枚（モモワロウ）
- カードID `49685`: 1枚（イベルタルex）
- カードID `46067`: 1枚（モモワロウex）
- カードID `45849`: 3枚（マシマシラ）
- カードID `46066`: 1枚（キチキギスex）
- カードID `46662`: 1枚（スボミー）
- カードID `47178`: 1枚（シャリタツ）

#### deck_gds（グッズ）

```
45209_3_1-49378_4_1-35140_3_1-42066_1_1-45640_1_1-49356_2_1-46812_2_1
```

解析結果（全カード名称・枚数）：
- カードID `45209`: 3枚（なかよしポフィン）
- カードID `49378`: 4枚（ポケパッド）
- カードID `35140`: 3枚（ハイパーボール）
- カードID `42066`: 1枚（エネルギーつけかえ）
- カードID `45640`: 1枚（アンフェアスタンプ(ACE SPEC)）
- カードID `49356`: 2枚（エネルギーリサイクル）
- カードID `46812`: 2枚（夜のタンカ）

#### deck_tool（ポケモンのどうぐ）

```
41126_2_1
```

解析結果：
- カードID `41126`: 2枚（ふうせん）

#### deck_sup（サポート）

```
48253_3_1-38821_3_1-45215_3_1-47104_2_1-49608_2_1
```

解析結果：
- カードID `48253`: 3枚（リーリエの決心）
- カードID `38821`: 3枚（ボスの指令）
- カードID `45215`: 3枚（マツバの確信）
- カードID `47104`: 2枚（タケシのスカウト）
- カードID `49608`: 2枚（ジャッジマン）

#### deck_sta（スタジアム）

```
47796_2_1
```

解析結果：
- カードID `47796`: 2枚（危ない廃墟）

#### deck_ene（エネルギー）

```
47909_9_1
```

解析結果：
- カードID `47909`: 9枚（基本悪エネルギー）

### PCGDECKオブジェクトからの取得例

カードID `48397`（ストリンダー）の場合：

```javascript
// カード名（短縮版）
window.PCGDECK.searchItemNameAlt[48397]
// → "ストリンダー"

// カード名（正式版、セット情報含む）
window.PCGDECK.searchItemName[48397]
// → "ストリンダー(M2 057/080)"

// 画像パス
window.PCGDECK.searchItemCardPict[48397]
// → "/assets/images/card_images/large/M2/048397_P_SUTORINDA.jpg"

// 完全な画像URL
const imageUrl = `https://www.pokemon-card.com${window.PCGDECK.searchItemCardPict[48397]}`;
// → "https://www.pokemon-card.com/assets/images/card_images/large/M2/048397_P_SUTORINDA.jpg"
```

## 取得できる情報の一覧

デッキ表示ページから取得できる情報をまとめます。

| 情報項目 | 取得元 | データ型 | 例 |
|---------|--------|---------|-----|
| カードID | `deck_pke`, `deck_gds` などのhidden input | 文字列（5桁） | `"48624"` |
| 枚数 | hidden inputの値 | 数値 | `4` |
| メインフラグ | hidden inputの値 | 数値（1または9） | `1` |
| カテゴリ | hidden inputの要素ID | 文字列 | `"ポケモン"`, `"グッズ"` など |
| カード名（短縮版） | `PCGDECK.searchItemNameAlt` | 文字列 | `"ストリンダー"` |
| カード名（正式版） | `PCGDECK.searchItemName` | 文字列 | `"ストリンダー(M2 057/080)"` |
| 画像URL | `PCGDECK.searchItemCardPict` | 文字列（相対パス） | `/assets/images/card_images/large/M2/048397_P_SUTORINDA.jpg` |
| デッキコード | `#copyID` 要素 | 文字列 | `"bFkVkd-lnUMIE-FV1VfF"` |
| 総枚数 | ページ内のテキスト | 数値 | `60` |

## 取得できない情報

デッキ表示ページからは、以下の情報は取得できません。

### たねポケモンかどうかの情報

**重要**: デッキ表示ページからは、**たねポケモンかどうか（進化段階）の情報は取得できません**。

- `PCGDECK`オブジェクトには進化段階の情報は含まれていない
- hidden inputの値にも進化段階を示す情報は存在しない

たねポケモンかどうかを判定するには、各カードの詳細ページ（`details.php`）にアクセスして、HTMLから進化段階（「たね」「1進化」「2進化」）の情報を抽出する必要があります。

詳細は別記事「[カード詳細ページからの情報取得](./カード詳細ページからの情報取得.md)」を参照してください。

### その他の取得できない情報

- **ワザ（技）の情報**: 技名、ダメージ、必要なエネルギーなど
- **HP**: ポケモンのHP
- **弱点・抵抗力**: 弱点倍率、抵抗力の情報
- **にげるコスト**: にげるために必要なエネルギーの数
- **特性**: ポケモンの特性の情報

これらも、カード詳細ページから取得する必要があります。

## データ抽出の実装例

Puppeteerを使用して、デッキ表示ページから情報を抽出する実装例：

```javascript
const deckInfo = await page.evaluate(() => {
  // デッキコードを取得
  const deckCode = document.getElementById('copyID')?.textContent?.trim() || '';
  
  // 総枚数を取得
  const totalCardsText = document.querySelector('.Grid_item')?.textContent || '';
  const totalCardsMatch = totalCardsText.match(/(\d+)枚デッキ/);
  const totalCards = totalCardsMatch ? parseInt(totalCardsMatch[1]) : 0;

  // hidden inputからカード情報を取得する関数
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

  // 各カテゴリのデータを取得
  const deckData = {
    pokemon: parseDeckData(document.getElementById('deck_pke')?.value, 'ポケモン'),
    goods: parseDeckData(document.getElementById('deck_gds')?.value, 'グッズ'),
    tool: parseDeckData(document.getElementById('deck_tool')?.value, 'ポケモンのどうぐ'),
    support: parseDeckData(document.getElementById('deck_sup')?.value, 'サポート'),
    stadium: parseDeckData(document.getElementById('deck_sta')?.value, 'スタジアム'),
    energy: parseDeckData(document.getElementById('deck_ene')?.value, 'エネルギー')
  };

  // PCGDECKオブジェクトからカード名と画像URLを取得
  const allCards = [];
  
  [...deckData.pokemon, ...deckData.goods, ...deckData.tool, 
   ...deckData.support, ...deckData.stadium, ...deckData.energy].forEach(card => {
    const cardId = card.cardId;
    if (window.PCGDECK && window.PCGDECK.searchItemNameAlt && 
        window.PCGDECK.searchItemNameAlt[cardId]) {
      allCards.push({
        cardId: cardId,
        name: window.PCGDECK.searchItemNameAlt[cardId],
        fullName: window.PCGDECK.searchItemName[cardId] || 
                  window.PCGDECK.searchItemNameAlt[cardId],
        count: card.count,
        category: card.category,
        mainFlag: card.mainFlag,
        imageUrl: window.PCGDECK.searchItemCardPict && 
                  window.PCGDECK.searchItemCardPict[cardId] ? 
                  `https://www.pokemon-card.com${window.PCGDECK.searchItemCardPict[cardId]}` : null,
        detailUrl: `https://www.pokemon-card.com/card-search/details.php/card/${cardId}/`
      });
    }
  });

  return {
    deckCode: deckCode,
    totalCards: totalCards,
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
```

## 取得データの構造化例

実際に取得したデータをJSON形式で構造化すると、以下のようになります：

```json
{
  "deckCode": "bFkVkd-lnUMIE-FV1VfF",
  "totalCards": 60,
  "summary": {
    "pokemon": 11,
    "goods": 7,
    "tool": 1,
    "support": 5,
    "stadium": 1,
    "energy": 1,
    "totalCardTypes": 26
  },
  "cards": [
    {
      "cardId": "48397",
      "name": "ストリンダー",
      "fullName": "ストリンダー(M2 057/080)",
      "count": 3,
      "category": "ポケモン",
      "mainFlag": 1,
      "imageUrl": "https://www.pokemon-card.com/assets/images/card_images/large/M2/048397_P_SUTORINDA.jpg",
      "detailUrl": "https://www.pokemon-card.com/card-search/details.php/card/48397/"
    },
    {
      "cardId": "48396",
      "name": "エレズン",
      "fullName": "エレズン(M2 056/080)",
      "count": 4,
      "category": "ポケモン",
      "mainFlag": 1,
      "imageUrl": "https://www.pokemon-card.com/assets/images/card_images/large/M2/048396_P_EREZUN.jpg",
      "detailUrl": "https://www.pokemon-card.com/card-search/details.php/card/48396/"
    }
    // ... 他のカード情報
  ]
}
```

## 技術的な注意点

### 1. ページ読み込みの待機

デッキ表示ページは、JavaScriptによって動的にコンテンツが生成されるため、適切な待機処理が必要です：

```javascript
// ページにアクセス
await page.goto(url, {
  waitUntil: 'networkidle2',  // ネットワーク接続が2つ以下になるまで待機
  timeout: 30000
});

// 特定の要素が表示されるまで待機
await page.waitForSelector('#copyID', { timeout: 8000 });
```

### 2. データの存在確認

`PCGDECK`オブジェクトやhidden inputの値が存在しない場合に備え、nullチェックを実施します：

```javascript
const cardName = window.PCGDECK?.searchItemNameAlt?.[cardId] || null;
```

### 3. サーバー負荷への配慮

公式サイトに過度な負荷をかけないよう、以下の点に注意します：

- リクエスト間隔を適切に設定（1秒以上推奨）
- 一度取得したデッキ情報はキャッシュして再利用
- User-Agentを適切に設定してBotであることを明示

## まとめ

ポケモンカード公式サイトのデッキ表示ページ（`confirm.html` または `result.html`）からは、以下の情報を取得できます：

1. **Hidden Input Fields**から：
   - カードID、枚数、メインフラグ、カテゴリ

2. **JavaScript PCGDECKオブジェクト**から：
   - カード名（短縮版・正式版）、画像URL

3. **ページ要素**から：
   - デッキコード、総枚数

一方で、**たねポケモンかどうか**や**ワザの情報**などは、デッキ表示ページからは取得できず、各カードの詳細ページから取得する必要があります。

この解析結果を活用することで、デッキコードから自動的にデッキ情報を取得し、デッキ分析ツールやデッキ管理アプリケーションを開発することができます。

---

**関連記事**

- [デッキコードからデッキ情報を取得する解析の流れ](./note_article_deck_parsing_flow.md)
- [デッキコード解析機能の分析結果まとめ](./note_article_deck_analysis.md)
- [カード詳細ページからの情報取得](./カード詳細ページからの情報取得.md)
