// ========== SHOP ITEMS DATABASE ==========
const shopItems = {
    filters: [
        { id: 'grayscale', name: 'Soft Gray', icon: '⚫', cost: 50, description: 'Classic black and white filter' },
        { id: 'sepia', name: 'Vintage', icon: '📜', cost: 50, description: 'Warm vintage tones' },
        { id: 'pink', name: 'Pink Dream', icon: '🌸', cost: 75, description: 'Cute pink tint' },
        { id: 'purple', name: 'Lavender', icon: '💜', cost: 75, description: 'Soft purple dream' },
        { id: 'warm', name: 'Warm Glow', icon: '☀️', cost: 100, description: 'Golden hour glow' }
    ],
    
    frames: [
        { id: 'polaroid', name: 'Polaroid', icon: '📸', cost: 75, description: 'Classic polaroid frame' },
        { id: 'film', name: 'Film Strip', icon: '🎞️', cost: 100, description: 'Retro film strip' },
        { id: 'hearts', name: 'Hearts', icon: '❤️', cost: 75, description: 'Cute heart decorations' },
        { id: 'flowers', name: 'Flowers', icon: '🌸', cost: 75, description: 'Pretty flower borders' },
        { id: 'stars', name: 'Stars', icon: '⭐', cost: 100, description: 'Sparkling stars' }
    ],
    
    avatars: [
        { id: 'avatar1', name: 'Cute Girl', icon: '👧', cost: 50, description: 'Adorable girl avatar' },
        { id: 'avatar2', name: 'Fairy', icon: '🧚', cost: 75, description: 'Magical fairy' },
        { id: 'avatar3', name: 'Princess', icon: '👸', cost: 100, description: 'Royal princess' },
        { id: 'avatar4', name: 'Unicorn', icon: '🦄', cost: 150, description: 'Magical unicorn' },
        { id: 'avatar5', name: 'Mermaid', icon: '🧜‍♀️', cost: 150, description: 'Ocean mermaid' }
    ],
    
    stickers: [
        { id: 'sticker1', name: 'Flower Pack', icon: '🌸', cost: 50, description: 'Cute flower stickers' },
        { id: 'sticker2', name: 'Heart Pack', icon: '💖', cost: 50, description: 'Love heart stickers' },
        { id: 'sticker3', name: 'Star Pack', icon: '⭐', cost: 50, description: 'Sparkly star stickers' },
        { id: 'sticker4', name: 'Animal Pack', icon: '🐶', cost: 75, description: 'Cute animal stickers' },
        { id: 'sticker5', name: 'Food Pack', icon: '🍭', cost: 75, description: 'Yummy food stickers' }
    ]
};

// ========== INITIALIZE SHOP ==========
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('filters-grid')) {
        renderShop();
        updateShopCoins();
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
    
    grid.innerHTML = shopItems.filters.map(item => {
        const isUnlocked = gameState.unlockedItems.includes(item.id);
        return `
            <div class="shop-item ${isUnlocked ? 'unlocked' : ''}">
                <div class="item-icon">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-description" style="color: #6b4e5e; font-size: 0.9em; margin: 10px 0;">${item.description}</div>
                ${isUnlocked ? 
                    '<span class="owned-badge"><i class="fas fa-check"></i> Owned</span>' : 
                    `<div class="item-price"><i class="fas fa-star"></i> ${item.cost}</div>
                     <button class="buy-btn" onclick="purchaseItem('${item.id}', ${item.cost}, 'filter')">
                        <i class="fas fa-shopping-cart"></i> Buy
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
                <div class="item-description" style="color: #6b4e5e; font-size: 0.9em; margin: 10px 0;">${item.description}</div>
                ${isUnlocked ? 
                    '<span class="owned-badge"><i class="fas fa-check"></i> Owned</span>' : 
                    `<div class="item-price"><i class="fas fa-star"></i> ${item.cost}</div>
                     <button class="buy-btn" onclick="purchaseItem('${item.id}', ${item.cost}, 'frame')">
                        <i class="fas fa-shopping-cart"></i> Buy
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
                <div class="item-description" style="color: #6b4e5e; font-size: 0.9em; margin: 10px 0;">${item.description}</div>
                ${isUnlocked ? 
                    '<span class="owned-badge"><i class="fas fa-check"></i> Owned</span>' : 
                    `<div class="item-price"><i class="fas fa-star"></i> ${item.cost}</div>
                     <button class="buy-btn" onclick="purchaseItem('${item.id}', ${item.cost}, 'avatar')">
                        <i class="fas fa-shopping-cart"></i> Buy
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
                <div class="item-description" style="color: #6b4e5e; font-size: 0.9em; margin: 10px 0;">${item.description}</div>
                ${isUnlocked ? 
                    '<span class="owned-badge"><i class="fas fa-check"></i> Owned</span>' : 
                    `<div class="item-price"><i class="fas fa-star"></i> ${item.cost}</div>
                     <button class="buy-btn" onclick="purchaseItem('${item.id}', ${item.cost}, 'sticker')">
                        <i class="fas fa-shopping-cart"></i> Buy
                     </button>`
                }
            </div>
        `;
    }).join('');
}

function purchaseItem(itemId, cost, type) {
    if (spendCoins(cost)) {
        gameState.unlockedItems.push(itemId);
        
        // If it's an avatar, update current avatar
        if (type === 'avatar') {
            const avatarItem = shopItems.avatars.find(a => a.id === itemId);
            if (avatarItem) {
                gameState.avatar = avatarItem.icon;
                document.getElementById('avatar-display').textContent = avatarItem.icon;
            }
        }
        
        saveProgress();
        renderShop();
        updateShopCoins();
        
        showToast(`✅ Purchased ${getItemName(itemId)}!`, 'success');
        createConfetti();
        
        // Check achievement for collecting items
        if (gameState.unlockedItems.length >= 10) {
            checkAchievement('collector');
        }
    } else {
        showToast('❌ Not enough coins! Play the memory game to earn more!', 'error');
    }
}

function getItemName(itemId) {
    // Search in all categories
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