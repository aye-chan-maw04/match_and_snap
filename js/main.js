// ========== GLOBAL STATE ==========
let gameState = {
    coins: 0,
    unlockedItems: ['normal', 'none'],
    photos: [],
    avatar: '👧',
    achievements: {},
    currentCharacterSet: 'set1',
    lastPhoto: null
};

// Character image sets - REPLACE WITH YOUR HIRONO IMAGES
const characterSets = {
    set1: [
        'images/characters/hirono1.jpg',
        'images/characters/hirono2.jpg',
        'images/characters/hirono3.jpg',
        'images/characters/hirono4.jpg',
        'images/characters/hirono5.jpg',
        'images/characters/hirono6.jpg',
        'images/characters/hirono7.jpg',
        'images/characters/hirono8.jpg'
    ],
    set2: [
        'images/characters/hirono9.jpg',
        'images/characters/hirono10.jpg',
        'images/characters/hirono11.jpg',
        'images/characters/hirono12.jpg',
        'images/characters/hirono13.jpg',
        'images/characters/hirono14.jpg',
        'images/characters/hirono15.jpg',
        'images/characters/hirono16.jpg'
    ],
    set3: [
        'images/characters/hirono17.jpg',
        'images/characters/hirono18.jpg',
        'images/characters/hirono19.jpg',
        'images/characters/hirono20.jpg',
        'images/characters/hirono21.jpg',
        'images/characters/hirono22.jpg',
        'images/characters/hirono23.jpg',
        'images/characters/hirono24.jpg'
    ],
    set4: [
        'images/characters/hirono25.jpg',
        'images/characters/hirono26.jpg',
        'images/characters/hirono27.jpg',
        'images/characters/hirono28.jpg',
        'images/characters/hirono29.jpg',
        'images/characters/hirono30.jpg',
        'images/characters/hirono31.jpg',
        'images/characters/hirono32.jpg'
    ]
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
    updateCoinDisplay();
    
    // Update avatar display
    const avatarEl = document.getElementById('avatar-display');
    if (avatarEl) {
        avatarEl.textContent = gameState.avatar;
    }
    
    // Initialize camera if on photobooth page
    if (document.getElementById('video')) {
        initCamera();
    }
});

// ========== COIN SYSTEM ==========
function addCoins(amount) {
    gameState.coins += amount;
    updateCoinDisplay();
    saveProgress();
    showToast(`+${amount} coins!`, 'success');
}

function spendCoins(amount) {
    if (gameState.coins >= amount) {
        gameState.coins -= amount;
        updateCoinDisplay();
        saveProgress();
        return true;
    }
    return false;
}

function updateCoinDisplay() {
    const coinElements = document.querySelectorAll('#coin-counter, #shop-coins, #game-coins');
    coinElements.forEach(el => {
        if (el) el.textContent = gameState.coins;
    });
}

// ========== TOAST NOTIFICATIONS ==========
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== DAILY BONUS ==========
function claimDailyBonus() {
    const lastClaimed = localStorage.getItem('dailyBonus');
    const today = new Date().toDateString();
    
    if (lastClaimed !== today) {
        addCoins(100);
        localStorage.setItem('dailyBonus', today);
        showToast('🎁 Daily bonus claimed! +100 coins', 'success');
        createConfetti();
    } else {
        showToast('✨ Already claimed today!', 'warning');
    }
}

// ========== CONFETTI ==========
function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: hsl(${Math.random() * 360}, 100%, 70%);
            left: ${Math.random() * 100}vw;
            top: -10px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: confettiFall ${Math.random() * 2 + 1}s linear forwards;
        `;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

// Add confetti animation
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(720deg);
        }
    }
`;
document.head.appendChild(style);

// ========== SAVE/LOAD ==========
function saveProgress() {
    localStorage.setItem('matchAndSnap', JSON.stringify({
        coins: gameState.coins,
        unlockedItems: gameState.unlockedItems,
        photos: gameState.photos,
        avatar: gameState.avatar,
        achievements: gameState.achievements
    }));
}

function loadProgress() {
    const saved = localStorage.getItem('matchAndSnap');
    if (saved) {
        const data = JSON.parse(saved);
        gameState.coins = data.coins || 0;
        gameState.unlockedItems = data.unlockedItems || ['normal', 'none'];
        gameState.photos = data.photos || [];
        gameState.avatar = data.avatar || '👧';
        gameState.achievements = data.achievements || {};
    }
}

// ========== CAMERA FUNCTIONS ==========
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            } 
        });
        
        const video = document.getElementById('video');
        video.srcObject = stream;
        
        video.onloadedmetadata = () => {
            video.play();
            const statusEl = document.getElementById('camera-status');
            if (statusEl) {
                statusEl.textContent = '📸 Camera ready!';
                statusEl.style.background = 'rgba(255, 184, 209, 0.9)';
            }
            const captureBtn = document.getElementById('capture-btn');
            if (captureBtn) captureBtn.disabled = false;
            showToast('✅ Camera started!', 'success');
        };
    } catch (err) {
        console.error('Camera error:', err);
        const statusEl = document.getElementById('camera-status');
        if (statusEl) {
            statusEl.textContent = '❌ Camera access denied';
            statusEl.style.background = 'rgba(255, 107, 107, 0.9)';
        }
        showToast('❌ Please allow camera access!', 'error');
    }
}

function startCamera() {
    initCamera();
}

function stopCamera() {
    const video = document.getElementById('video');
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
        const statusEl = document.getElementById('camera-status');
        if (statusEl) {
            statusEl.textContent = '⏹️ Camera stopped';
            statusEl.style.background = 'rgba(0, 0, 0, 0.5)';
        }
        const captureBtn = document.getElementById('capture-btn');
        if (captureBtn) captureBtn.disabled = true;
        showToast('⏹️ Camera stopped', 'info');
    }
}