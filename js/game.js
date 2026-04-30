// ========== GAME SOUND SYSTEM ==========
let gameAudioCtx = null;
let gameSoundEnabled = true;

function initGameAudio() {
    if (!gameAudioCtx) {
        gameAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playGameSound(type) {
    if (!gameSoundEnabled) return;
    
    initGameAudio();
    if (gameAudioCtx.state === 'suspended') {
        gameAudioCtx.resume();
    }
    
    const osc = gameAudioCtx.createOscillator();
    const gain = gameAudioCtx.createGain();
    
    switch(type) {
        case 'flip':
            osc.frequency.value = 600;
            gain.gain.setValueAtTime(0.08, gameAudioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, gameAudioCtx.currentTime + 0.1);
            break;
        case 'match':
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.15, gameAudioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, gameAudioCtx.currentTime + 0.3);
            break;
        case 'win':
            // Victory jingle - play 3 notes
            const notes = [523.25, 659.25, 783.99];
            notes.forEach((freq, i) => {
                setTimeout(() => {
                    const noteOsc = gameAudioCtx.createOscillator();
                    const noteGain = gameAudioCtx.createGain();
                    noteOsc.frequency.value = freq;
                    noteGain.gain.setValueAtTime(0.15, gameAudioCtx.currentTime);
                    noteGain.gain.exponentialRampToValueAtTime(0.01, gameAudioCtx.currentTime + 0.3);
                    noteOsc.connect(noteGain);
                    noteGain.connect(gameAudioCtx.destination);
                    noteOsc.start();
                    noteOsc.stop(gameAudioCtx.currentTime + 0.3);
                }, i * 150);
            });
            return;
        case 'coin':
            osc.frequency.value = 1000;
            gain.gain.setValueAtTime(0.12, gameAudioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, gameAudioCtx.currentTime + 0.2);
            break;
        case 'click':
            osc.frequency.value = 500;
            gain.gain.setValueAtTime(0.1, gameAudioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, gameAudioCtx.currentTime + 0.1);
            break;
        default:
            osc.frequency.value = 400;
            gain.gain.setValueAtTime(0.1, gameAudioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, gameAudioCtx.currentTime + 0.15);
    }
    
    osc.connect(gain);
    gain.connect(gameAudioCtx.destination);
    osc.start();
    osc.stop(gameAudioCtx.currentTime + 0.3);
}

function toggleGameSound() {
    gameSoundEnabled = !gameSoundEnabled;
    const btn = document.getElementById('sound-toggle-btn');
    if (btn) {
        btn.innerHTML = gameSoundEnabled ? '<i class="fas fa-volume-up"></i> Sound On' : '<i class="fas fa-volume-mute"></i> Sound Off';
    }
    playGameSound('click');
}

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
                <img src="${imageUrl}" alt="Character">
            </div>
            <div class="card-back">
                <span style="font-size: 2em;"></span>
            </div>
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
    playGameSound('flip');
    
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
        // Match found!
        card1.element.dataset.matched = 'true';
        card2.element.dataset.matched = 'true';
        card1.element.style.animation = 'imagePop 0.3s ease';
        card2.element.style.animation = 'imagePop 0.3s ease';
        
        currentGame.matches++;
        document.getElementById('matches').textContent = currentGame.matches;
        
        addCoins(10);
        playGameSound('match');
        showToast('🎉 Match! +10 coins', 'success');
        
        currentGame.flippedCards = [];
        
        // Check game complete
        const totalPairs = currentGame.cards.length / 2;
        if (currentGame.matches === totalPairs) {
            addCoins(50);
            playGameSound('win');
            createConfetti();
            showToast('🏆 Game Complete! +50 coins! 🏆', 'success');
        }
    } else {
        // No match
        currentGame.canFlip = false;
        
        setTimeout(() => {
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
            currentGame.flippedCards = [];
            currentGame.canFlip = true;
        }, 800);
    }
}

function resetGame() {
    currentGame.moves = 0;
    currentGame.matches = 0;
    currentGame.flippedCards = [];
    currentGame.canFlip = true;
    
    document.getElementById('moves').textContent = '0';
    document.getElementById('matches').textContent = '0';
    
    playGameSound('click');
    initGame();
}

function setDifficulty(difficulty) {
    currentGame.difficulty = difficulty;
    
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    playGameSound('click');
    resetGame();
}

function setCharacterSet(setName) {
    currentSet = setName;
    
    document.querySelectorAll('.set-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    playGameSound('click');
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

// Add this CSS animation if not present
const gameStyle = document.createElement('style');
gameStyle.textContent = `
    @keyframes imagePop {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(gameStyle);

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('game-board')) {
        initGame();
        // Initialize audio on first user interaction
        document.body.addEventListener('click', function initAudioOnClick() {
            if (gameAudioCtx && gameAudioCtx.state === 'suspended') {
                gameAudioCtx.resume();
            }
            document.body.removeEventListener('click', initAudioOnClick);
        });
    }
});