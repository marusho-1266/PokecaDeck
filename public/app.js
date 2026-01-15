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
        showError(error.message || 'デッキ情報の取得中にエラーが発生しました');
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

    // サマリー表示
    displaySummary(deckData);

    // カード一覧表示
    displayCards(deckData.cards);

    showResult();
}

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
