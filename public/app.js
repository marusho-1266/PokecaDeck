// DOM要素の取得
const deckCodeInput = document.getElementById('deckCode');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const resultDiv = document.getElementById('result');
const resultDeckCode = document.getElementById('resultDeckCode');
const resultTotalCards = document.getElementById('resultTotalCards');
const summaryGrid = document.getElementById('summaryGrid');
const cardsContainer = document.getElementById('cardsContainer');
const drawHandBtn = document.getElementById('drawHandBtn');
const resetHandBtn = document.getElementById('resetHandBtn');
const openingHandContainer = document.getElementById('openingHandContainer');
const deckCount = document.getElementById('deckCount');

// デッキ情報とゲーム状態
let currentDeckData = null;
let deck = []; // 山札（カードの配列）
let hand = []; // 手札（7枚）

// カテゴリ名の日本語マッピング
const categoryNames = {
    'ポケモン': 'ポケモン',
    'グッズ': 'グッズ',
    'ポケモンのどうぐ': 'ポケモンのどうぐ',
    'サポート': 'サポート',
    'スタジアム': 'スタジアム',
    'エネルギー': 'エネルギー'
};

// エンターキーで解析
deckCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        analyzeDeck();
    }
});

// 解析ボタンのクリックイベント
analyzeBtn.addEventListener('click', analyzeDeck);

// デッキ解析関数
async function analyzeDeck() {
    const deckCode = deckCodeInput.value.trim();

    // バリデーション
    if (!deckCode) {
        showError('デッキコードを入力してください');
        return;
    }

    // デッキコードの形式チェック
    const deckCodePattern = /^[A-Za-z0-9]{6}-[A-Za-z0-9]{6}-[A-Za-z0-9]{6}$/;
    if (!deckCodePattern.test(deckCode)) {
        showError('無効なデッキコード形式です。形式: XXXXXX-XXXXXX-XXXXXX');
        return;
    }

    // UI状態の更新
    hideError();
    hideResult();
    showLoading();
    analyzeBtn.disabled = true;

    try {
        const response = await fetch('/api/deck', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ deckCode })
        });

        // レスポンスのContent-Typeを確認
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('非JSONレスポンス:', text);
            throw new Error('サーバーから無効なレスポンスが返されました');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'デッキ情報の取得に失敗しました');
        }

        if (data.success && data.data) {
            displayResult(data.data);
        } else {
            throw new Error('デッキ情報が取得できませんでした');
        }

    } catch (error) {
        console.error('エラー:', error);
        // エラーメッセージがJSONパースエラーの場合は、より分かりやすいメッセージに変更
        if (error.message.includes('JSON') || error.message.includes('Unexpected token')) {
            showError('サーバーエラーが発生しました。しばらく待ってから再度お試しください。');
        } else {
            showError(error.message || 'デッキ情報の取得中にエラーが発生しました');
        }
    } finally {
        hideLoading();
        analyzeBtn.disabled = false;
    }
}

// 結果を表示
function displayResult(deckData) {
    // 基本情報
    resultDeckCode.textContent = deckData.deckCode;
    resultTotalCards.textContent = deckData.totalCards;

    // デッキ情報を保存
    currentDeckData = deckData;
    initializeDeck(deckData);

    // サマリー表示
    displaySummary(deckData);

    // カード一覧表示
    displayCards(deckData.cards);

    showResult();
}

// デッキを初期化（カードを枚数分展開して配列に）
function initializeDeck(deckData) {
    deck = [];
    hand = [];
    
    // 各カードを枚数分展開して山札に追加
    deckData.cards.forEach(card => {
        for (let i = 0; i < card.count; i++) {
            deck.push({
                ...card,
                uniqueId: `${card.cardId}-${i}` // 一意のIDを付与
            });
        }
    });
    
    // 山札をシャッフル
    shuffleDeck();
    
    // UI更新
    updateDeckCount();
    resetHandDisplay();
}

// Fisher-Yatesアルゴリズムでシャッフル
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// 初手を引く
function drawOpeningHand() {
    if (deck.length < 7) {
        showError('山札が7枚未満です');
        return;
    }
    
    // 手札をクリア
    hand = [];
    
    // 7枚引く
    for (let i = 0; i < 7; i++) {
        if (deck.length > 0) {
            hand.push(deck.pop());
        }
    }
    
    // UI更新
    displayHand();
    updateDeckCount();
    
    // ボタンの表示切り替え
    drawHandBtn.classList.add('hidden');
    resetHandBtn.classList.remove('hidden');
}

// 手札を表示
function displayHand() {
    openingHandContainer.innerHTML = '';
    openingHandContainer.classList.remove('hidden');
    
    if (hand.length === 0) {
        return;
    }
    
    // 7枚を横並びで表示
    const cardsGrid = document.createElement('div');
    cardsGrid.className = 'hand-cards-grid';
    
    hand.forEach(card => {
        const cardElement = createHandCardElement(card);
        cardsGrid.appendChild(cardElement);
    });
    
    openingHandContainer.appendChild(cardsGrid);
}

// 手札のカード要素を作成
function createHandCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'hand-card';
    
    const imageHtml = card.imageUrl 
        ? `<img src="${card.imageUrl}" alt="${card.name}" class="hand-card-image" onerror="this.style.display='none'">`
        : '<div class="hand-card-image" style="display: flex; align-items: center; justify-content: center; color: #999; font-size: 0.8rem;">画像なし</div>';
    
    cardDiv.innerHTML = `
        ${imageHtml}
        <div class="hand-card-info">
            <div class="hand-card-name">${card.name}</div>
            <div class="hand-card-category">${categoryNames[card.category] || card.category}</div>
        </div>
    `;
    
    return cardDiv;
}

// 手札をリセット
function resetHand() {
    // 手札を山札に戻す
    deck.push(...hand);
    hand = [];
    
    // 山札をシャッフル
    shuffleDeck();
    
    // UI更新
    resetHandDisplay();
    updateDeckCount();
    
    // ボタンの表示切り替え
    drawHandBtn.classList.remove('hidden');
    resetHandBtn.classList.add('hidden');
}

// 手札表示をリセット
function resetHandDisplay() {
    openingHandContainer.innerHTML = '';
    openingHandContainer.classList.add('hidden');
}

// 山札の枚数を更新
function updateDeckCount() {
    deckCount.textContent = deck.length;
}

// イベントリスナー
drawHandBtn.addEventListener('click', drawOpeningHand);
resetHandBtn.addEventListener('click', resetHand);

// サマリー表示
function displaySummary(deckData) {
    const summary = deckData.summary;
    
    // カテゴリごとの枚数を計算
    const categoryCounts = {};
    deckData.cards.forEach(card => {
        if (!categoryCounts[card.category]) {
            categoryCounts[card.category] = 0;
        }
        categoryCounts[card.category] += card.count;
    });

    summaryGrid.innerHTML = '';

    // 各カテゴリのサマリーカードを作成
    Object.keys(categoryCounts).forEach(category => {
        const count = categoryCounts[category];
        const typeCount = deckData.cards.filter(c => c.category === category).length;
        
        const summaryCard = document.createElement('div');
        summaryCard.className = 'summary-card';
        summaryCard.innerHTML = `
            <div class="category">${categoryNames[category] || category}</div>
            <div class="count">${count}枚</div>
            <div class="types">${typeCount}種類</div>
        `;
        summaryGrid.appendChild(summaryCard);
    });

    // 合計カード
    const totalCard = document.createElement('div');
    totalCard.className = 'summary-card';
    totalCard.style.borderLeftColor = '#764ba2';
    totalCard.innerHTML = `
        <div class="category">合計</div>
        <div class="count">${deckData.totalCards}枚</div>
        <div class="types">${summary.totalCardTypes}種類</div>
    `;
    summaryGrid.appendChild(totalCard);
}

// カード一覧表示
function displayCards(cards) {
    cardsContainer.innerHTML = '';

    // カテゴリごとにグループ化
    const cardsByCategory = {};
    cards.forEach(card => {
        if (!cardsByCategory[card.category]) {
            cardsByCategory[card.category] = [];
        }
        cardsByCategory[card.category].push(card);
    });

    // カテゴリごとに表示
    Object.keys(cardsByCategory).forEach(category => {
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';

        const categoryTitle = document.createElement('h4');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = `${categoryNames[category] || category} (${cardsByCategory[category].reduce((sum, c) => sum + c.count, 0)}枚)`;
        categorySection.appendChild(categoryTitle);

        const categoryCards = document.createElement('div');
        categoryCards.className = 'cards-container';

        cardsByCategory[category].forEach(card => {
            const cardItem = document.createElement('div');
            cardItem.className = 'card-item';
            
            const imageHtml = card.imageUrl 
                ? `<img src="${card.imageUrl}" alt="${card.name}" class="card-image" onerror="this.style.display='none'">`
                : '<div class="card-image" style="display: flex; align-items: center; justify-content: center; color: #999;">画像なし</div>';

            cardItem.innerHTML = `
                ${imageHtml}
                <div class="card-info">
                    <div class="card-name">${card.name}</div>
                    <div class="card-meta">
                        <span class="card-count">${card.count}枚</span>
                        <span class="card-category">${categoryNames[card.category] || card.category}</span>
                    </div>
                    ${card.fullName && card.fullName !== card.name ? `<div style="font-size: 0.85rem; color: #666; margin-top: 4px;">${card.fullName}</div>` : ''}
                    <a href="${card.detailUrl}" target="_blank" class="card-detail-link">詳細を見る →</a>
                </div>
            `;
            categoryCards.appendChild(cardItem);
        });

        categorySection.appendChild(categoryCards);
        cardsContainer.appendChild(categorySection);
    });
}

// UI状態管理関数
function showLoading() {
    loadingDiv.classList.remove('hidden');
}

function hideLoading() {
    loadingDiv.classList.add('hidden');
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}

function showResult() {
    resultDiv.classList.remove('hidden');
    // 結果セクションまでスクロール
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideResult() {
    resultDiv.classList.add('hidden');
}
