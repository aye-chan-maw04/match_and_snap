// ========== SHOP SOUND SYSTEM ==========
let shopAudioCtx = null;
let shopSoundEnabled = true;

function initShopAudio() {
    if (!shopAudioCtx) {
        shopAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playShopSound(type) {
    if (!shopSoundEnabled) return;
    
    initShopAudio();
    if (shopAudioCtx.state === 'suspended') {
        shopAudioCtx.resume();
    }
    
    const osc = shopAudioCtx.createOscillator();
    const gain = shopAudioCtx.createGain();
    
    switch(type) {
        case 'purchase':
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.15, shopAudioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, shopAudioCtx.currentTime + 0.3);
            // Add second note for coin sound
            setTimeout(() => {
                const osc2 = shopAudioCtx.createOscillator();
                const gain2 = shopAudioCtx.createGain();
                osc2.frequency.value = 1000;
                gain2.gain.setValueAtTime(0.1, shopAudioCtx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, shopAudioCtx.currentTime + 0.2);
                osc2.connect(gain2);
                gain2.connect(shopAudioCtx.destination);
                osc2.start();
                osc2.stop(shopAudioCtx.currentTime + 0.2);
            }, 100);
            break;
        case 'click':
            osc.frequency.value = 500;
            gain.gain.setValueAtTime(0.1, shopAudioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, shopAudioCtx.currentTime + 0.1);
            break;
        case 'error':
            osc.frequency.value = 300;
            gain.gain.setValueAtTime(0.12, shopAudioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, shopAudioCtx.currentTime + 0.2);
            break;
        default:
            osc.frequency.value = 600;
            gain.gain.setValueAtTime(0.1, shopAudioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, shopAudioCtx.currentTime + 0.15);
    }
    
    osc.connect(gain);
    gain.connect(shopAudioCtx.destination);
    osc.start();
    osc.stop(shopAudioCtx.currentTime + 0.3);
}

function toggleShopSound() {
    shopSoundEnabled = !shopSoundEnabled;
    const btn = document.getElementById('shop-sound-toggle');
    if (btn) {
        btn.innerHTML = shopSoundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
    }
    playShopSound('click');
}

// ========== SHOP ITEMS DATABASE ==========
const shopItems = {
    filters: [
        { id: 'grayscale', name: 'Soft Gray', icon: '⚫', cost: 50, description: 'Classic monochrome' },
        { id: 'sepia', name: 'Sepia', icon: '📜', cost: 50, description: 'Warm vintage tones' },
        { id: 'pink', name: 'Pink Dream', icon: '🌸', cost: 75, description: 'Soft pink tint' },
        { id: 'purple', name: 'Lavender', icon: '💜', cost: 75, description: 'Dreamy purple' },
        { id: 'warm', name: 'Warm Glow', icon: '☀️', cost: 100, description: 'Golden hour light' }
    ],
    
    frames: [
        { id: 'polaroid', name: 'Polaroid', icon: '📸', cost: 75, description: 'Classic instant frame' },
        { id: 'film', name: 'Film Strip', icon: '🎞️', cost: 100, description: 'Cinematic vibe' },
        { id: 'hearts', name: 'Hearts', icon: '❤️', cost: 75, description: 'Love border' },
        { id: 'flowers', name: 'Flowers', icon: '🌸', cost: 75, description: 'Floral frame' },
        { id: 'stars', name: 'Stars', icon: '⭐', cost: 100, description: 'Stellar touch' }
    ],
    
    avatars: [
        { id: 'avatar1', name: 'Cute Girl', icon: '👧', cost: 50, description: 'Sweet avatar' },
        { id: 'avatar2', name: 'Fairy', icon: '🧚', cost: 75, description: 'Magical being' },
        { id: 'avatar3', name: 'Princess', icon: '👸', cost: 100, description: 'Royal charm' },
        { id: 'avatar4', name: 'Unicorn', icon: '🦄', cost: 150, description: 'Mythical friend' },
        { id: 'avatar5', name: 'Mermaid', icon: '🧜‍♀️', cost: 150, description: 'Ocean soul' }
    ],
    
    stickers: [
        { id: 'sticker1', name: 'Flowers', icon: '🌸', cost: 50, description: 'Floral pack' },
        { id: 'sticker2', name: 'Hearts', icon: '💖', cost: 50, description: 'Love pack' },
        { id: 'sticker3', name: 'Stars', icon: '⭐', cost: 50, description: 'Sparkle pack' },
        { id: 'sticker4', name: 'Animals', icon: '🐶', cost: 75, description: 'Cute creatures' },
        { id: 'sticker5', name: 'Food', icon: '🍭', cost: 75, description: 'Yummy treats' }
    ]
};

// ========== INITIALIZE SHOP ==========
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('filters-grid')) {
        renderShop();
        updateShopCoins();
        
        // Initialize audio on first user interaction
        document.body.addEventListener('click', function initAudio() {
            if (shopAudioCtx && shopAudioCtx.state === 'suspended') {
                shopAudioCtx.resume();
            }
            document.body.removeEventListener('click', initAudio);
        });
    }
});

function renderShop() {
    renderFilters();
    renderFrames();
    renderAvatars();
    renderStickers();
}

function renderFilters() {
    const grid = document.getElementById('filters-grid');
    if (!grid) return;
    
    if (!gameState.unlockedItems) gameState.unlockedItems = ['normal', 'none'];
    
    grid.innerHTML = shopItems.filters.map(item => {
        const isUnlocked = gameState.unlockedItems.includes(item.id);
        return `
            <div class="shop-item ${isUnlocked ? 'unlocked' : ''}">
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description}</div>
                ${isUnlocked ? 
                    '<span class="owned-badge"><i class="fas fa-check-circle"></i> Owned</span>' : 
                    `<div class="item-price"><i class="fas fa-star"></i> ${item.cost}</div>
                     <button class="buy-btn" onclick="purchaseItem('${item.id}', ${item.cost}, 'filter')">
                        <i class="fas fa-shopping-bag"></i> Purchase
                     </button>`
                }
            </div>
        `;
    }).join('');
}

function renderFrames() {
    const grid = document.getElementById('frames-grid');
    if (!grid) return;
    
    grid.innerHTML = shopItems.frames.map(item => {
        const isUnlocked = gameState.unlockedItems.includes(item.id);
        return `
            <div class="shop-item ${isUnlocked ? 'unlocked' : ''}">
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description}</div>
                ${isUnlocked ? 
                    '<span class="owned-badge"><i class="fas fa-check-circle"></i> Owned</span>' : 
                    `<div class="item-price"><i class="fas fa-star"></i> ${item.cost}</div>
                     <button class="buy-btn" onclick="purchaseItem('${item.id}', ${item.cost}, 'frame')">
                        <i class="fas fa-shopping-bag"></i> Purchase
                     </button>`
                }
            </div>
        `;
    }).join('');
}

function renderAvatars() {
    const grid = document.getElementById('avatars-grid');
    if (!grid) return;
    
    grid.innerHTML = shopItems.avatars.map(item => {
        const isUnlocked = gameState.unlockedItems.includes(item.id);
        return `
            <div class="shop-item ${isUnlocked ? 'unlocked' : ''}">
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description}</div>
                ${isUnlocked ? 
                    '<span class="owned-badge"><i class="fas fa-check-circle"></i> Owned</span>' : 
                    `<div class="item-price"><i class="fas fa-star"></i> ${item.cost}</div>
                     <button class="buy-btn" onclick="purchaseItem('${item.id}', ${item.cost}, 'avatar')">
                        <i class="fas fa-shopping-bag"></i> Purchase
                     </button>`
                }
            </div>
        `;
    }).join('');
}

function renderStickers() {
    const grid = document.getElementById('stickers-grid');
    if (!grid) return;
    
    grid.innerHTML = shopItems.stickers.map(item => {
        const isUnlocked = gameState.unlockedItems.includes(item.id);
        return `
            <div class="shop-item ${isUnlocked ? 'unlocked' : ''}">
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description}</div>
                ${isUnlocked ? 
                    '<span class="owned-badge"><i class="fas fa-check-circle"></i> Owned</span>' : 
                    `<div class="item-price"><i class="fas fa-star"></i> ${item.cost}</div>
                     <button class="buy-btn" onclick="purchaseItem('${item.id}', ${item.cost}, 'sticker')">
                        <i class="fas fa-shopping-bag"></i> Purchase
                     </button>`
                }
            </div>
        `;
    }).join('');
}

function purchaseItem(itemId, cost, type) {
    if (gameState.coins >= cost) {
        gameState.coins -= cost;
        gameState.unlockedItems.push(itemId);
        
        // If it's an avatar, update current avatar
        if (type === 'avatar') {
            const avatarItem = shopItems.avatars.find(a => a.id === itemId);
            if (avatarItem) {
                gameState.avatar = avatarItem.icon;
                const avatarEl = document.getElementById('avatar-display');
                if (avatarEl) avatarEl.textContent = avatarItem.icon;
            }
        }
        
        saveProgress();
        renderShop();
        updateShopCoins();
        
        // Show success toast
        showToast(`✨ Purchased ${getItemName(itemId)}! ✨`, 'success');
        playShopSound('purchase');
        createConfetti();
        
        // Update coin display on all pages
        if (typeof updateCoinDisplay === 'function') updateCoinDisplay();
        
        // Check achievement for collecting items
        if (gameState.unlockedItems.length >= 10 && typeof checkAchievement === 'function') {
            checkAchievement('collector');
        }
    } else {
        showToast(`❌ Not enough coins! Need ${cost} coins. Play the memory game to earn more!`, 'error');
        playShopSound('error');
    }
}

function getItemName(itemId) {
    const allItems = [...shopItems.filters, ...shopItems.frames, ...shopItems.avatars, ...shopItems.stickers];
    const item = allItems.find(i => i.id === itemId);
    return item ? item.name : itemId;
}

function updateShopCoins() {
    const shopCoins = document.getElementById('shop-coins');
    if (shopCoins) {
        shopCoins.textContent = gameState.coins;
    }
}

// Refresh shop when returning to page
window.addEventListener('focus', function() {
    if (window.location.pathname.includes('shop.html')) {
        updateShopCoins();
        renderShop();
    }
});

// Show toast function
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

// Confetti effect
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
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confettiFall {
        to { transform: translateY(100vh) rotate(720deg); }
    }
`;
document.head.appendChild(confettiStyle);