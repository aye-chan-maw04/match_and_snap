// ========== ACHIEVEMENTS DATABASE ==========
const achievementsData = [
    {
        id: 'firstMatch',
        name: 'First Steps',
        description: 'Make your first match in the memory game',
        icon: '🎯',
        reward: 20,
        condition: (stats) => stats.matches >= 1
    },
    {
        id: 'gameMaster',
        name: 'Game Master',
        description: 'Complete 10 memory games',
        icon: '👑',
        reward: 200,
        condition: (stats) => stats.gamesCompleted >= 10
    },
    {
        id: 'photoAddict',
        name: 'Photo Addict',
        description: 'Create 5 photo strips',
        icon: '📸',
        reward: 150,
        condition: (stats) => stats.photosTaken >= 5
    },
    {
        id: 'millionaire',
        name: 'Rich!',
        description: 'Earn 500 coins total',
        icon: '💰',
        reward: 100,
        condition: (stats) => stats.totalCoinsEarned >= 500
    },
    {
        id: 'collector',
        name: 'Collector',
        description: 'Unlock 10 items from the shop',
        icon: '🔓',
        reward: 300,
        condition: (stats) => stats.itemsUnlocked >= 10
    },
    {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Complete a game with 0 mistakes',
        icon: '✨',
        reward: 100,
        condition: (stats) => stats.perfectGames >= 1
    },
    {
        id: 'artist',
        name: 'Photo Artist',
        description: 'Use 5 different filters',
        icon: '🎨',
        reward: 150,
        condition: (stats) => stats.filtersUsed >= 5
    },
    {
        id: 'social',
        name: 'Social Butterfly',
        description: 'Share a photo strip',
        icon: '🦋',
        reward: 50,
        condition: (stats) => stats.photosShared >= 1
    },
    {
        id: 'dailyPlayer',
        name: 'Dedicated Fan',
        description: 'Play for 7 days in a row',
        icon: '📅',
        reward: 200,
        condition: (stats) => stats.streak >= 7
    },
    {
        id: 'speedRunner',
        name: 'Speed Runner',
        description: 'Complete a game in under 30 moves',
        icon: '⚡',
        reward: 150,
        condition: (stats) => stats.fastGames >= 1
    }
];

// Badges data
const badgesData = [
    { id: 'badge1', name: 'Newbie', icon: '🌟', condition: (stats) => stats.matches >= 1 },
    { id: 'badge2', name: 'Photo Lover', icon: '📷', condition: (stats) => stats.photosTaken >= 3 },
    { id: 'badge3', name: 'Shopaholic', icon: '🛍️', condition: (stats) => stats.itemsUnlocked >= 5 },
    { id: 'badge4', name: 'Legend', icon: '🏆', condition: (stats) => stats.gamesCompleted >= 20 },
    { id: 'badge5', name: 'Artist', icon: '🎨', condition: (stats) => stats.filtersUsed >= 3 }
];

// Player statistics
let playerStats = {
    matches: 0,
    gamesCompleted: 0,
    photosTaken: 0,
    totalCoinsEarned: 0,
    itemsUnlocked: 0,
    perfectGames: 0,
    filtersUsed: 0,
    photosShared: 0,
    streak: 0,
    fastGames: 0,
    lastPlayed: null
};

// ========== INITIALIZE ACHIEVEMENTS ==========
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('achievements-grid')) {
        loadStats();
        renderAchievements();
        renderBadges();
        updateProgressOverview();
    }
});

function loadStats() {
    // Calculate stats from gameState
    playerStats.matches = gameState.achievements?.matches || 0;
    playerStats.gamesCompleted = gameState.achievements?.gamesCompleted || 0;
    playerStats.photosTaken = gameState.photos?.length || 0;
    playerStats.totalCoinsEarned = gameState.coins + (gameState.achievements?.totalSpent || 0);
    playerStats.itemsUnlocked = gameState.unlockedItems?.length || 0;
    playerStats.filtersUsed = countFiltersUsed();
    
    // Update streak
    updateStreak();
}

function countFiltersUsed() {
    const filters = new Set();
    gameState.photos?.forEach(photo => {
        if (photo.filter) filters.add(photo.filter);
    });
    return filters.size;
}

function updateStreak() {
    const today = new Date().toDateString();
    const lastPlayed = localStorage.getItem('lastPlayed');
    
    if (lastPlayed === today) {
        // Already played today, streak maintained
    } else if (lastPlayed === new Date(Date.now() - 86400000).toDateString()) {
        // Played yesterday, increment streak
        playerStats.streak++;
    } else {
        // Streak broken
        playerStats.streak = 1;
    }
    
    localStorage.setItem('lastPlayed', today);
}

function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    
    grid.innerHTML = achievementsData.map(ach => {
        const isUnlocked = gameState.achievements?.[ach.id] || false;
        const progress = calculateProgress(ach);
        
        return `
            <div class="achievement-card ${isUnlocked ? 'unlocked' : ''}">
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${ach.name}</div>
                    <div class="achievement-desc">${ach.description}</div>
                    <div class="achievement-reward">
                        <i class="fas fa-star"></i> ${ach.reward} coins
                    </div>
                    ${!isUnlocked ? `
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%;"></div>
                        </div>
                        <div style="font-size: 0.8em; color: #6b4e5e;">${progress}%</div>
                    ` : `
                        <div style="color: #4caf50; margin-top: 10px;">
                            <i class="fas fa-check-circle"></i> Completed!
                        </div>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function renderBadges() {
    const container = document.getElementById('badge-container');
    if (!container) return;
    
    container.innerHTML = badgesData.map(badge => {
        const isUnlocked = checkBadgeCondition(badge);
        return `
            <div class="badge ${isUnlocked ? 'unlocked' : ''}" title="${badge.name}">
                ${badge.icon}
            </div>
        `;
    }).join('');
}

function checkBadgeCondition(badge) {
    switch(badge.id) {
        case 'badge1':
            return playerStats.matches >= 1;
        case 'badge2':
            return playerStats.photosTaken >= 3;
        case 'badge3':
            return playerStats.itemsUnlocked >= 5;
        case 'badge4':
            return playerStats.gamesCompleted >= 20;
        case 'badge5':
            return playerStats.filtersUsed >= 3;
        default:
            return false;
    }
}

function calculateProgress(achievement) {
    switch(achievement.id) {
        case 'firstMatch':
            return Math.min(100, (playerStats.matches / 1) * 100);
        case 'gameMaster':
            return Math.min(100, (playerStats.gamesCompleted / 10) * 100);
        case 'photoAddict':
            return Math.min(100, (playerStats.photosTaken / 5) * 100);
        case 'millionaire':
            return Math.min(100, (playerStats.totalCoinsEarned / 500) * 100);
        case 'collector':
            return Math.min(100, (playerStats.itemsUnlocked / 10) * 100);
        case 'perfectionist':
            return Math.min(100, (playerStats.perfectGames / 1) * 100);
        case 'artist':
            return Math.min(100, (playerStats.filtersUsed / 5) * 100);
        case 'social':
            return Math.min(100, (playerStats.photosShared / 1) * 100);
        case 'dailyPlayer':
            return Math.min(100, (playerStats.streak / 7) * 100);
        case 'speedRunner':
            return Math.min(100, (playerStats.fastGames / 1) * 100);
        default:
            return 0;
    }
}

function updateProgressOverview() {
    const completed = document.getElementById('achievements-completed');
    const totalRewards = document.getElementById('total-rewards');
    const completionRate = document.getElementById('completion-rate');
    const overallProgress = document.getElementById('overall-progress');
    
    if (completed) {
        const unlockedCount = achievementsData.filter(ach => gameState.achievements?.[ach.id]).length;
        completed.textContent = `${unlockedCount}/${achievementsData.length}`;
    }
    
    if (totalRewards) {
        const rewards = achievementsData
            .filter(ach => gameState.achievements?.[ach.id])
            .reduce((sum, ach) => sum + ach.reward, 0);
        totalRewards.textContent = rewards;
    }
    
    if (completionRate) {
        const rate = (achievementsData.filter(ach => gameState.achievements?.[ach.id]).length / achievementsData.length) * 100;
        completionRate.textContent = `${Math.round(rate)}%`;
    }
    
    if (overallProgress) {
        const progress = (achievementsData.filter(ach => gameState.achievements?.[ach.id]).length / achievementsData.length) * 100;
        overallProgress.style.width = `${progress}%`;
    }
}

// Function to check and unlock achievements
function checkAchievement(achievementId) {
    if (gameState.achievements?.[achievementId]) return;
    
    const achievement = achievementsData.find(a => a.id === achievementId);
    if (!achievement) return;
    
    // Update stats based on achievement
    if (achievementId === 'firstMatch') {
        playerStats.matches++;
        gameState.achievements.matches = playerStats.matches;
    }
    
    if (achievement.condition(playerStats)) {
        // Unlock achievement
        if (!gameState.achievements) gameState.achievements = {};
        gameState.achievements[achievementId] = true;
        
        // Give reward
        addCoins(achievement.reward);
        
        // Update stats
        playerStats.totalCoinsEarned += achievement.reward;
        
        // Show celebration
        showToast(`🏆 Achievement Unlocked: ${achievement.name}! +${achievement.reward} coins`, 'success');
        createConfetti();
        
        // Save and refresh
        saveProgress();
        renderAchievements();
        renderBadges();
        updateProgressOverview();
    }
}

// Function to reset achievements (for testing)
function resetAchievements() {
    if (confirm('⚠️ Reset all achievement progress? This cannot be undone!')) {
        gameState.achievements = {};
        playerStats = {
            matches: 0,
            gamesCompleted: 0,
            photosTaken: 0,
            totalCoinsEarned: 0,
            itemsUnlocked: 0,
            perfectGames: 0,
            filtersUsed: 0,
            photosShared: 0,
            streak: 0,
            fastGames: 0
        };
        
        saveProgress();
        renderAchievements();
        renderBadges();
        updateProgressOverview();
        
        showToast('🔄 Achievements reset', 'warning');
    }
}

// Listen for game events to update achievements
document.addEventListener('gameComplete', function(e) {
    playerStats.gamesCompleted++;
    gameState.achievements.gamesCompleted = playerStats.gamesCompleted;
    
    if (e.detail?.moves < 30) {
        playerStats.fastGames++;
        checkAchievement('speedRunner');
    }
    
    if (e.detail?.perfect) {
        playerStats.perfectGames++;
        checkAchievement('perfectionist');
    }
    
    checkAchievement('gameMaster');
});

document.addEventListener('photoTaken', function() {
    playerStats.photosTaken++;
    checkAchievement('photoAddict');
});

document.addEventListener('itemPurchased', function() {
    playerStats.itemsUnlocked = gameState.unlockedItems.length;
    checkAchievement('collector');
});

document.addEventListener('filterUsed', function(filter) {
    const filters = new Set();
    gameState.photos?.forEach(p => filters.add(p.filter));
    playerStats.filtersUsed = filters.size;
    checkAchievement('artist');
});