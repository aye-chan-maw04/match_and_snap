// ========== SOUND MANAGER ==========
class SoundManager {
    constructor() {
        this.muted = localStorage.getItem('soundMuted') === 'true';
        this.initAudio();
    }

    initAudio() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {
            match: { freq: 800, duration: 0.1 },
            coin: { freq: 1200, duration: 0.15 },
            win: { freq: [600, 800, 1000], duration: 0.3 },
            click: { freq: 500, duration: 0.05 },
            flip: { freq: 400, duration: 0.05 },
            snap: { freq: 200, duration: 0.1 },
            countdown: { freq: 600, duration: 0.2 },
            shutter: { freq: 100, duration: 0.3 },
            unlock: { freq: [400, 600, 800], duration: 0.4 },
            error: { freq: 200, duration: 0.2 }
        };
    }

    play(soundName) {
        if (this.muted) return;
        
        const sound = this.sounds[soundName];
        if (!sound) return;

        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        if (Array.isArray(sound.freq)) {
            sound.freq.forEach((freq, i) => {
                setTimeout(() => this.playTone(freq, sound.duration), i * 50);
            });
        } else {
            this.playTone(sound.freq, sound.duration);
        }
    }

    playTone(freq, duration) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('soundMuted', this.muted);
        return this.muted;
    }
}

// ========== CARD IMAGES - REPLACE THESE WITH YOUR OWN IMAGES ==========
const cardImages = {
    animals: [
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200', // Dog
        'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200', // Cat
        'https://images.unsplash.com/photo-1555169062-013468b47731?w=200', // Bird
        'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=200', // Puppy
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200', // Kitten
        'https://images.unsplash.com/photo-1557180295-76aea20b0b87?w=200', // Rabbit
        'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200', // Fox
        'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=200'  // Bear
    ],
    food: [
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200', // Pizza
        'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200', // Burger
        'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200', // Pasta
        'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=200', // Sushi
        'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=200', // Tacos
        'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200', // Donut
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200', // Cake
        'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200'  // Ice Cream
    ],
    nature: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200', // Forest
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200', // Mountain
        'https://images.unsplash.com/photo-1502083896352-259ab9e342d7?w=200', // Flower
        'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=200', // Beach
        'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=200', // Sunset
        'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=200', // River
        'https://images.unsplash.com/photo-1507525425510-56a2e8b7f8b5?w=200', // Ocean
        'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=200'  // Waterfall
    ],
    space: [
        'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=200', // Galaxy
        'https://images.unsplash.com/photo-1543722530-d2c3201371e5?w=200', // Earth
        'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=200', // Moon
        'https://images.unsplash.com/photo-1614313913007-2d4d5b2ffee8?w=200', // Mars
        'https://images.unsplash.com/photo-1419242902214-272b7f0d77b7?w=200', // Stars
        'https://images.unsplash.com/photo-1537420327992-d6e192287183?w=200', // Rocket
        'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=200', // Saturn
        'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=200'  // Nebula
    ]
};

// ========== GLOBAL STATE ==========
let gameState = {
    coins: 0,
    unlockedItems: ['normal', 'none'],
    photos: [],
    currentGame: {
        cards: [],
        flippedCards: [],
        moves: 0,
        matches: 0,
        difficulty: 'easy',
        canFlip: true
    },
    currentFilter: 'normal',
    currentFrame: 'none',
    cameraStream: null,
    lastPhoto: null,
    avatar: '😊',
    achievements: {},
    editingTools: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        stickers: []
    }
};

let photoStrip = {
    photos: [],
    currentSlot: 0,
    capturing: false
};

let currentImageSet = 'animals';

// Shop items
const shopItems = {
    filters: [
        { id: 'grayscale', name: 'Grayscale', cost: 50, icon: '⚫' },
        { id: 'sepia', name: 'Sepia', cost: 50, icon: '🟫' },
        { id: 'vintage', name: 'Vintage', cost: 75, icon: '📻' }
    ],
    frames: [
        { id: 'polaroid', name: 'Polaroid', cost: 75, icon: '📸' },
        { id: 'film', name: 'Film Strip', cost: 100, icon: '🎞️' },
        { id: 'hearts', name: 'Hearts', cost: 75, icon: '❤️' }
    ]
};

// Achievements
const achievements = [
    { id: 'firstMatch', name: 'First Steps', desc: 'Make your first match', reward: 20, icon: '🎯' },
    { id: 'gameMaster', name: 'Game Master', desc: 'Complete 10 games', reward: 200, icon: '👑' },
    { id: 'photoAddict', name: 'Photo Addict', desc: 'Take 4 photo strips', reward: 150, icon: '📸' },
    { id: 'millionaire', name: 'Rich!', desc: 'Earn 500 coins', reward: 100, icon: '💰' },
    { id: 'collector', name: 'Collector', desc: 'Unlock all filters', reward: 300, icon: '🔓' }
];

// Initialize sound
const sound = new SoundManager();

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    loadProgress();
    updateCoinDisplay();
    renderShop();
    initGame();
    initTheme();
    renderAchievements();
    preloadImages();
    startCamera();
    checkDailyBonus();
    
    // Set up game board data attribute
    document.querySelector('.game-board').setAttribute('data-difficulty', 'easy');
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
        }, 500);
    }, 1000);
    
    // Welcome message for first time
    if (!localStorage.getItem('visited')) {
        setTimeout(() => {
            showToast('👋 Welcome! Here\'s 50 coins to start!', 'success');
            addCoins(50);
            localStorage.setItem('visited', 'true');
            sound.play('unlock');
        }, 1500);
    }
});

// ========== IMAGE PRELOADING ==========
function preloadImages() {
    Object.values(cardImages).flat().forEach(url => {
        const img = new Image();
        img.src = url;
        img.onerror = () => console.log('Failed to load image:', url);
    });
}

// ========== IMAGE ERROR HANDLING ==========
function handleImageError(img) {
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
    img.onerror = null;
}

// Error handling for all images
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        handleImageError(e.target);
    }
}, true);

// ========== TAB NAVIGATION ==========
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'gallery') renderGallery();
    sound.play('click');
}

// ========== MEMORY GAME ==========
function setImageSet(setName) {
    currentImageSet = setName;
    
    document.querySelectorAll('.image-set-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    event.target.setAttribute('data-set', setName);
    
    resetGame();
    showToast(`🖼️ Switched to ${setName} images!`, 'success');
}

function initGame() {
    const images = cardImages[currentImageSet];
    let gameImages = [...images];
    
    if (gameState.currentGame.difficulty === 'medium') {
        gameImages = [...images, ...images.slice(0, 4)];
    } else if (gameState.currentGame.difficulty === 'hard') {
        gameImages = [...images, ...images];
    }
    
    gameState.currentGame.cards = shuffleArray([...gameImages, ...gameImages]);
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
    board.innerHTML = '';
    board.setAttribute('data-difficulty', gameState.currentGame.difficulty);
    
    gameState.currentGame.cards.forEach((imageUrl, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.image = imageUrl;
        card.dataset.matched = 'false';
        
        card.innerHTML = `
            <div class="card-front">
                <img src="${imageUrl}" alt="card image" loading="lazy">
            </div>
            <div class="card-back">
                <span style="font-size: 3em;">❓</span>
            </div>
        `;
        
        card.addEventListener('click', () => flipCard(index));
        card.addEventListener('mouseenter', () => sound.play('flip'));
        board.appendChild(card);
    });
}

function flipCard(index) {
    if (!gameState.currentGame.canFlip) return;
    
    const card = document.querySelector(`.card[data-index="${index}"]`);
    if (card.classList.contains('flipped') || card.dataset.matched === 'true') return;
    if (gameState.currentGame.flippedCards.length >= 2) return;
    
    card.classList.add('flipped');
    gameState.currentGame.flippedCards.push({
        index: index,
        image: card.dataset.image,
        element: card
    });
    
    if (gameState.currentGame.flippedCards.length === 2) {
        gameState.currentGame.moves++;
        document.getElementById('moves').textContent = gameState.currentGame.moves;
        checkForMatch();
    }
}

function checkForMatch() {
    const [card1, card2] = gameState.currentGame.flippedCards;
    
    if (card1.image === card2.image) {
        // Match found
        card1.element.dataset.matched = 'true';
        card2.element.dataset.matched = 'true';
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
        
        card1.element.querySelector('img').style.animation = 'bounce 0.5s ease';
        card2.element.querySelector('img').style.animation = 'bounce 0.5s ease';
        
        gameState.currentGame.matches++;
        document.getElementById('matches').textContent = gameState.currentGame.matches;
        
        addCoins(10);
        showToast('🎉 Match! +10 coins', 'success');
        sound.play('match');
        
        checkAchievement('firstMatch');
        
        const totalPairs = gameState.currentGame.cards.length / 2;
        if (gameState.currentGame.matches === totalPairs) {
            addCoins(50);
            createConfetti();
            showToast('🏆 Game Complete! +50 coins!', 'success');
            sound.play('win');
            checkAchievement('gameMaster');
        }
        
        gameState.currentGame.flippedCards = [];
    } else {
        gameState.currentGame.canFlip = false;
        sound.play('error');
        
        setTimeout(() => {
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
            gameState.currentGame.flippedCards = [];
            gameState.currentGame.canFlip = true;
        }, 1000);
    }
    
    saveProgress();
}

function resetGame() {
    gameState.currentGame.moves = 0;
    gameState.currentGame.matches = 0;
    gameState.currentGame.flippedCards = [];
    gameState.currentGame.canFlip = true;
    
    document.getElementById('moves').textContent = '0';
    document.getElementById('matches').textContent = '0';
    
    initGame();
    sound.play('click');
}

function setDifficulty(level) {
    gameState.currentGame.difficulty = level;
    
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    resetGame();
}

// ========== COIN SYSTEM ==========
function addCoins(amount) {
    gameState.coins += amount;
    updateCoinDisplay();
    saveProgress();
    
    const coinDisplay = document.querySelector('.coin-display');
    coinDisplay.style.animation = 'none';
    coinDisplay.offsetHeight;
    coinDisplay.style.animation = 'heartbeat 0.5s ease';
    
    sound.play('coin');
    
    if (gameState.coins >= 500) checkAchievement('millionaire');
}

function spendCoins(amount, itemId) {
    if (gameState.coins >= amount) {
        gameState.coins -= amount;
        gameState.unlockedItems.push(itemId);
        updateCoinDisplay();
        renderShop();
        saveProgress();
        
        showToast(`✅ Purchased!`, 'success');
        sound.play('unlock');
        createConfetti();
        
        if (gameState.unlockedItems.length >= 5) checkAchievement('collector');
        return true;
    } else {
        showToast('❌ Not enough coins!', 'error');
        sound.play('error');
        return false;
    }
}

function updateCoinDisplay() {
    document.getElementById('coin-counter').textContent = gameState.coins;
}

// ========== SHOP ==========
function renderShop() {
    const filterDiv = document.getElementById('shop-filters');
    if (filterDiv) {
        filterDiv.innerHTML = shopItems.filters.map(item => {
            const unlocked = gameState.unlockedItems.includes(item.id);
            return `
                <div class="shop-item ${unlocked ? 'unlocked' : ''}" onclick="${unlocked ? '' : `purchaseItem('${item.id}', ${item.cost})`}">
                    <h3>${item.icon} ${item.name}</h3>
                    <p>${unlocked ? '✅ Owned' : `${item.cost} 🪙`}</p>
                </div>
            `;
        }).join('');
    }
    
    const frameDiv = document.getElementById('shop-frames');
    if (frameDiv) {
        frameDiv.innerHTML = shopItems.frames.map(item => {
            const unlocked = gameState.unlockedItems.includes(item.id);
            return `
                <div class="shop-item ${unlocked ? 'unlocked' : ''}" onclick="${unlocked ? '' : `purchaseItem('${item.id}', ${item.cost})`}">
                    <h3>${item.icon} ${item.name}</h3>
                    <p>${unlocked ? '✅ Owned' : `${item.cost} 🪙`}</p>
                </div>
            `;
        }).join('');
    }
}

function purchaseItem(itemId, cost) {
    spendCoins(cost, itemId);
}

function purchaseAvatar(avatar) {
    if (gameState.coins >= 50) {
        gameState.coins -= 50;
        gameState.avatar = avatar;
        document.getElementById('player-avatar').textContent = avatar;
        updateCoinDisplay();
        showToast(`✅ Avatar changed!`, 'success');
        sound.play('unlock');
        saveProgress();
    } else {
        showToast('❌ Need 50 coins!', 'error');
    }
}

// ========== CAMERA ==========
async function startCamera() {
    try {
        gameState.cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
        });
        
        document.getElementById('video').srcObject = gameState.cameraStream;
        document.getElementById('capture-btn').disabled = false;
        document.getElementById('camera-status').textContent = '📸 Camera ready!';
        showToast('✅ Camera started!', 'success');
    } catch (err) {
        document.getElementById('camera-status').textContent = '❌ Camera denied';
        showToast('❌ Please allow camera access!', 'error');
    }
}

function stopCamera() {
    if (gameState.cameraStream) {
        gameState.cameraStream.getTracks().forEach(t => t.stop());
        document.getElementById('video').srcObject = null;
        document.getElementById('capture-btn').disabled = true;
        document.getElementById('camera-status').textContent = '⏹️ Camera stopped';
    }
}

// ========== FILTERS & FRAMES ==========
function checkAndApplyFilter(filterId) {
    if (gameState.unlockedItems.includes(filterId)) {
        applyFilter(filterId);
    } else {
        showToast('🔒 Buy this filter first!', 'warning');
        showTab('shop');
    }
}

function checkAndApplyFrame(frameId) {
    if (gameState.unlockedItems.includes(frameId)) {
        applyFrame(frameId);
    } else {
        showToast('🔒 Buy this frame first!', 'warning');
        showTab('shop');
    }
}

function applyFilter(filterId) {
    gameState.currentFilter = filterId;
    
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const btn = document.querySelector(`[data-filter="${filterId}"]`);
    if (btn) btn.classList.add('active');
    
    showToast(`✨ Filter applied!`, 'success');
    sound.play('click');
}

function applyFrame(frameId) {
    gameState.currentFrame = frameId;
    
    document.querySelectorAll('[data-frame]').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const btn = document.querySelector(`[data-frame="${frameId}"]`);
    if (btn) btn.classList.add('active');
    
    showToast(`🖼️ Frame applied!`, 'success');
}

// ========== EDITING TOOLS ==========
function updateEdit(tool, value) {
    gameState.editingTools[tool] = parseInt(value);
    const valSpan = document.getElementById(`${tool}-val`);
    if (valSpan) {
        valSpan.textContent = tool === 'blur' ? value + 'px' : value + '%';
    }
}

function addSticker(emoji) {
    gameState.editingTools.stickers.push({
        emoji: emoji,
        x: Math.random() * 200 + 50,
        y: Math.random() * 200 + 50,
        size: 40
    });
    showToast(`✨ Sticker added!`, 'success');
    sound.play('click');
}

function resetEdits() {
    gameState.editingTools = {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        stickers: []
    };
    
    const brightness = document.getElementById('brightness');
    const contrast = document.getElementById('contrast');
    const saturation = document.getElementById('saturation');
    const blur = document.getElementById('blur');
    
    if (brightness) brightness.value = 100;
    if (contrast) contrast.value = 100;
    if (saturation) saturation.value = 100;
    if (blur) blur.value = 0;
    
    const brightnessVal = document.getElementById('brightness-val');
    const contrastVal = document.getElementById('contrast-val');
    const saturationVal = document.getElementById('saturation-val');
    const blurVal = document.getElementById('blur-val');
    
    if (brightnessVal) brightnessVal.textContent = '100%';
    if (contrastVal) contrastVal.textContent = '100%';
    if (saturationVal) saturationVal.textContent = '100%';
    if (blurVal) blurVal.textContent = '0px';
    
    showToast('✨ Edits reset', 'success');
}

// ========== 4-PHOTO STRIP ==========
function startPhotoStrip() {
    if (!document.getElementById('video').srcObject) {
        showToast('❌ Start camera first!', 'error');
        return;
    }
    
    if (photoStrip.capturing) {
        showToast('⚠️ Already capturing!', 'warning');
        return;
    }
    
    photoStrip = {
        photos: [],
        currentSlot: 0,
        capturing: true
    };
    
    for (let i = 1; i <= 4; i++) {
        const slot = document.getElementById(`slot-${i}`);
        if (slot) {
            slot.innerHTML = i;
            slot.style.backgroundImage = '';
            slot.classList.remove('filled');
        }
    }
    
    document.getElementById('save-strip-btn').disabled = true;
    captureNextPhoto();
}

function captureNextPhoto() {
    if (!photoStrip.capturing) return;
    if (photoStrip.currentSlot >= 4) {
        finishPhotoStrip();
        return;
    }
    
    const countdown = document.getElementById('countdown');
    if (countdown) {
        countdown.style.display = 'flex';
        
        let count = 3;
        countdown.textContent = count;
        sound.play('countdown');
        
        const timer = setInterval(() => {
            count--;
            countdown.textContent = count;
            sound.play('countdown');
            
            if (count === 0) {
                clearInterval(timer);
                countdown.style.display = 'none';
                
                takeStripPhoto();
                
                setTimeout(() => {
                    photoStrip.currentSlot++;
                    captureNextPhoto();
                }, 800);
            }
        }, 1000);
    }
}

function takeStripPhoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    if (!video || !canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    canvas.width = 300;
    canvas.height = 300;
    
    ctx.filter = `
        brightness(${gameState.editingTools.brightness}%)
        contrast(${gameState.editingTools.contrast}%)
        saturate(${gameState.editingTools.saturation}%)
        blur(${gameState.editingTools.blur}px)
    `;
    
    switch(gameState.currentFilter) {
        case 'grayscale': ctx.filter += ' grayscale(100%)'; break;
        case 'sepia': ctx.filter += ' sepia(100%)'; break;
        case 'vintage': ctx.filter += ' sepia(50%) contrast(120%)'; break;
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    gameState.editingTools.stickers.forEach(s => {
        ctx.font = `${s.size}px Arial`;
        ctx.fillText(s.emoji, s.x, s.y);
    });
    
    const imgData = canvas.toDataURL('image/png');
    photoStrip.photos.push(imgData);
    
    const slot = document.getElementById(`slot-${photoStrip.currentSlot + 1}`);
    if (slot) {
        slot.style.backgroundImage = `url(${imgData})`;
        slot.innerHTML = '';
        slot.classList.add('filled');
    }
    
    sound.play('shutter');
    document.querySelector('.video-container').style.animation = 'flash 0.3s ease';
    setTimeout(() => {
        document.querySelector('.video-container').style.animation = '';
    }, 300);
    
    addCoins(3);
}

function finishPhotoStrip() {
    photoStrip.capturing = false;
    createStripImage();
    showToast('🎞️ Photo strip complete!', 'success');
    sound.play('win');
    createConfetti();
    document.getElementById('save-strip-btn').disabled = false;
    checkAchievement('photoAddict');
}

function createStripImage() {
    const stripCanvas = document.getElementById('strip-canvas');
    if (!stripCanvas) return;
    
    const ctx = stripCanvas.getContext('2d');
    
    const photoWidth = 250;
    const photoHeight = 250;
    const padding = 20;
    
    stripCanvas.width = photoWidth + padding * 2;
    stripCanvas.height = (photoHeight * 4) + (padding * 5);
    
    ctx.fillStyle = gameState.currentFrame === 'film' ? '#1a1a1a' : 'white';
    ctx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);
    
    const loadAndDrawImages = async () => {
        for (let i = 0; i < photoStrip.photos.length; i++) {
            const y = padding + (i * (photoHeight + padding));
            
            const img = new Image();
            img.src = photoStrip.photos[i];
            
            await new Promise(resolve => {
                img.onload = () => {
                    ctx.drawImage(img, padding, y, photoWidth, photoHeight);
                    
                    if (gameState.currentFrame === 'polaroid') {
                        ctx.fillStyle = 'white';
                        ctx.fillRect(padding, y + photoHeight, photoWidth, 30);
                        ctx.fillStyle = '#666';
                        ctx.font = '12px Poppins';
                        ctx.fillText('📸 Match & Snap', padding + 10, y + photoHeight + 20);
                    }
                    
                    if (gameState.currentFrame === 'film') {
                        ctx.fillStyle = '#ffd700';
                        for (let h = 0; h < 4; h++) {
                            ctx.beginPath();
                            ctx.arc(padding - 10, y + (h * 60) + 30, 5, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.beginPath();
                            ctx.arc(padding + photoWidth + 10, y + (h * 60) + 30, 5, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                    
                    if (gameState.currentFrame === 'hearts') {
                        ctx.font = '30px Arial';
                        ctx.fillStyle = 'rgba(255,105,180,0.3)';
                        ctx.fillText('❤️', padding + 10, y + 40);
                        ctx.fillText('❤️', padding + photoWidth - 50, y + photoHeight - 20);
                    }
                    
                    resolve();
                };
            });
        }
        
        const stripData = stripCanvas.toDataURL('image/png');
        gameState.lastPhoto = stripData;
        addStripToGallery(stripData);
    };
    
    loadAndDrawImages();
}

function savePhotoStrip() {
    if (!gameState.lastPhoto) return;
    downloadPhoto();
    showToast('💾 Photo strip saved!', 'success');
}

function addStripToGallery(stripData) {
    gameState.photos.unshift({
        id: Date.now(),
        data: stripData,
        filter: gameState.currentFilter,
        frame: gameState.currentFrame,
        date: new Date().toLocaleString(),
        coins: 12
    });
    
    addCoins(12);
    
    if (gameState.photos.length > 20) gameState.photos.pop();
    saveProgress();
    renderGallery();
}

// ========== GALLERY ==========
function renderGallery() {
    const gallery = document.getElementById('photo-gallery');
    if (!gallery) return;
    
    if (gameState.photos.length === 0) {
        gallery.innerHTML = '<p class="text-center">No photo strips yet. Create one in the Photo Booth!</p>';
        return;
    }
    
    gallery.innerHTML = gameState.photos.map(photo => `
        <div class="completed-strip ${photo.frame === 'polaroid' ? 'polaroid-strip' : ''} ${photo.frame === 'film' ? 'film-strip' : ''}" 
             style="--rotate: ${Math.random() * 4 - 2}deg"
             onclick="downloadPhoto('${photo.data}')">
            <img src="${photo.data}" alt="Photo strip" loading="lazy">
            <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); color: white; padding: 5px; border-radius: 5px;">
                🪙 +${photo.coins}
            </div>
        </div>
    `).join('');
}

function downloadPhoto(photoData = null) {
    const data = photoData || gameState.lastPhoto;
    if (!data) {
        showToast('❌ No photo to download!', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.download = `match-snap-${Date.now()}.png`;
    link.href = data;
    link.click();
    showToast('✅ Photo downloaded!', 'success');
}

function clearGallery() {
    if (confirm('Delete all photos?')) {
        gameState.photos = [];
        renderGallery();
        saveProgress();
        showToast('🗑️ Gallery cleared', 'warning');
    }
}

// ========== ACHIEVEMENTS ==========
function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    
    grid.innerHTML = achievements.map(ach => {
        const unlocked = gameState.achievements[ach.id];
        return `
            <div class="achievement-card ${unlocked ? 'unlocked' : ''}">
                <div class="achievement-icon">${ach.icon}</div>
                <div>
                    <h3>${ach.name}</h3>
                    <p>${ach.desc}</p>
                    <p>🎁 ${ach.reward} 🪙</p>
                </div>
            </div>
        `;
    }).join('');
}

function checkAchievement(id) {
    if (gameState.achievements[id]) return;
    
    const ach = achievements.find(a => a.id === id);
    if (ach) {
        gameState.achievements[id] = true;
        addCoins(ach.reward);
        showToast(`🏆 Achievement: ${ach.name}! +${ach.reward} coins`, 'success');
        sound.play('win');
        createConfetti();
        renderAchievements();
        saveProgress();
    }
}

// ========== TOAST ==========
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div>${message}</div>`;
    
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== CONFETTI ==========
function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: hsl(${Math.random() * 360}, 100%, 50%);
            left: ${Math.random() * 100}vw;
            top: -10px;
            animation: confettiFall ${Math.random() * 2 + 1}s linear forwards;
            z-index: 10000;
        `;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

// ========== THEME ==========
function initTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) themeBtn.innerHTML = theme === 'light' ? '🌓' : '☀️';
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    document.getElementById('theme-btn').innerHTML = newTheme === 'light' ? '🌓' : '☀️';
    
    showToast(`🌓 ${newTheme} mode`, 'info');
    sound.play('click');
}

// ========== MUTE ==========
function toggleMute() {
    const muted = sound.toggleMute();
    document.getElementById('mute-btn').innerHTML = muted ? '🔇' : '🔊';
    showToast(muted ? '🔇 Sound off' : '🔊 Sound on', 'info');
}

// ========== DAILY BONUS ==========
function checkDailyBonus() {
    const lastPlayed = localStorage.getItem('lastPlayed');
    const today = new Date().toDateString();
    
    if (lastPlayed !== today) {
        addCoins(100);
        localStorage.setItem('lastPlayed', today);
        showToast('🎁 Daily bonus: +100 coins!', 'success');
        createConfetti();
    }
}

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
        gameState.avatar = data.avatar || '😊';
        gameState.achievements = data.achievements || {};
        
        const avatarEl = document.getElementById('player-avatar');
        if (avatarEl) avatarEl.textContent = gameState.avatar;
    }
}

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.getElementById('photobooth-tab')?.classList.contains('active')) {
        e.preventDefault();
        startPhotoStrip();
    }
    
    if (e.code === 'KeyN' && document.getElementById('game-tab')?.classList.contains('active')) {
        resetGame();
    }
    
    if (e.code === 'KeyM') {
        toggleMute();
    }
});

// ========== PARTICLE CLICK EFFECT ==========
document.addEventListener('click', (e) => {
    for (let i = 0; i < 3; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 5px;
            height: 5px;
            background: hsl(${Math.random() * 360}, 100%, 50%);
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            border-radius: 50%;
            pointer-events: none;
            animation: particleFloat 1s ease-out forwards;
            z-index: 9999;
            --x: ${Math.random() * 2 - 1};
            --y: ${Math.random() * 2 - 1};
        `;
        document.body.appendChild(particle);
        
        setTimeout(() => particle.remove(), 1000);
    }
});

console.log('🎮 Match & Snap - Custom Image Edition Ready!');
console.log('💡 Tip: Replace the image URLs in cardImages with your own!');

// Add this function for daily bonus claiming
function claimDailyBonus() {
    const lastClaimed = localStorage.getItem('dailyBonusClaimed');
    const today = new Date().toDateString();
    
    if (lastClaimed !== today) {
        addCoins(100);
        localStorage.setItem('dailyBonusClaimed', today);
        showToast('🎁 Daily bonus claimed! +100 coins', 'success');
        createConfetti();
    } else {
        showToast('✨ You already claimed today\'s bonus! Come back tomorrow!', 'warning');
    }
}