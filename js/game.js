// ========== GAME STATE ==========
let currentGame = {
    cards: [],
    flippedCards: [],
    moves: 0,
    matches: 0,
    difficulty: 'easy',
    canFlip: true
};

let currentSet = 'set1';

// ========== INITIALIZE GAME ==========
function initGame() {
    const images = characterSets[currentSet];
    let gameImages = [...images];
    
    if (currentGame.difficulty === 'medium') {
        gameImages = [...images, ...images.slice(0, 4)];
    } else if (currentGame.difficulty === 'hard') {
        gameImages = [...images, ...images];
    }
    
    currentGame.cards = shuffleArray([...gameImages, ...gameImages]);
    renderGameBoard();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function renderGameBoard() {
    const board = document.getElementById('game-board');
    if (!board) return;
    
    board.innerHTML = '';
    board.className = `game-board ${currentGame.difficulty}`;
    
    currentGame.cards.forEach((imageUrl, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.image = imageUrl;
        card.dataset.matched = 'false';
        
        card.innerHTML = `
            <div class="card-front">
                <img src="${imageUrl}" alt="Hirono character">
            </div>
            <div class="card-back"></div>
        `;
        
        card.addEventListener('click', () => flipCard(index));
        board.appendChild(card);
    });
}

function flipCard(index) {
    if (!currentGame.canFlip) return;
    
    const card = document.querySelector(`.card[data-index="${index}"]`);
    if (card.classList.contains('flipped') || card.dataset.matched === 'true') return;
    if (currentGame.flippedCards.length >= 2) return;
    
    card.classList.add('flipped');
    currentGame.flippedCards.push({
        index: index,
        image: card.dataset.image,
        element: card
    });
    
    if (currentGame.flippedCards.length === 2) {
        currentGame.moves++;
        document.getElementById('moves').textContent = currentGame.moves;
        checkForMatch();
    }
}

function checkForMatch() {
    const [card1, card2] = currentGame.flippedCards;
    
    if (card1.image === card2.image) {
        // Match found
        card1.element.dataset.matched = 'true';
        card2.element.dataset.matched = 'true';
        
        currentGame.matches++;
        document.getElementById('matches').textContent = currentGame.matches;
        
        addCoins(10);
        
        currentGame.flippedCards = [];
        
        // Check game complete
        const totalPairs = currentGame.cards.length / 2;
        if (currentGame.matches === totalPairs) {
            addCoins(50);
            createConfetti();
            showToast('🎉 Game Complete! +50 coins!', 'success');
        }
    } else {
        // No match
        currentGame.canFlip = false;
        
        setTimeout(() => {
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
            currentGame.flippedCards = [];
            currentGame.canFlip = true;
        }, 1000);
    }
}

function resetGame() {
    currentGame.moves = 0;
    currentGame.matches = 0;
    currentGame.flippedCards = [];
    currentGame.canFlip = true;
    
    document.getElementById('moves').textContent = '0';
    document.getElementById('matches').textContent = '0';
    
    initGame();
}

function setDifficulty(difficulty) {
    currentGame.difficulty = difficulty;
    
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    resetGame();
}

function setCharacterSet(setName) {
    currentSet = setName;
    
    document.querySelectorAll('.set-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    resetGame();
}

function adjustCardSize(size) {
    document.getElementById('size-value').textContent = size + 'px';
    
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.style.width = size + 'px';
        card.style.height = size + 'px';
    });
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('game-board')) {
        initGame();
    }
});