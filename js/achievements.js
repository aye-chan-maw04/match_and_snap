// ========== ACHIEVEMENTS SOUND SYSTEM ==========
let achievementAudioCtx = null;
let achievementSoundEnabled = true;

function initAchievementAudio() {
    if (!achievementAudioCtx) {
        achievementAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playAchievementSound(type) {
    if (!achievementSoundEnabled) return;
    
    initAchievementAudio();
    if (achievementAudioCtx.state === 'suspended') {
        achievementAudioCtx.resume();
    }
    
    const osc = achievementAudioCtx.createOscillator();
    const gain = achievementAudioCtx.createGain();
    
    switch(type) {
        case 'unlock':
            // Fanfare sound
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.15, achievementAudioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, achievementAudioCtx.currentTime + 0.4);
            setTimeout(() => {
                const osc2 = achievementAudioCtx.createOscillator();
                const gain2 = achievementAudioCtx.createGain();
                osc2.frequency.value = 1000;
                gain2.gain.setValueAtTime(0.12, achievementAudioCtx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, achievementAudioCtx.currentTime + 0.3);
                osc2.connect(gain2);
                gain2.connect(achievementAudioCtx.destination);
                osc2.start();
                osc2.stop(achievementAudioCtx.currentTime + 0.3);
            }, 150);
            break;
        case 'click':
            osc.frequency.value = 500;
            gain.gain.setValueAtTime(0.1, achievementAudioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, achievementAudioCtx.currentTime + 0.1);
            break;
        default:
            osc.frequency.value = 600;
            gain.gain.setValueAtTime(0.1, achievementAudioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, achievementAudioCtx.currentTime + 0.15);
    }
    
    osc.connect(gain);
    gain.connect(achievementAudioCtx.destination);
    osc.start();
    osc.stop(achievementAudioCtx.currentTime + 0.3);
}

function toggleAchievementSound() {
    achievementSoundEnabled = !achievementSoundEnabled;
    const btn = document.getElementById('achievement-sound-toggle');
    if (btn) {
        btn.innerHTML = achievementSoundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
    }
    playAchievementSound('click');
}

// ========== ACHIEVEMENTS DATABASE ==========
const achievementsData = [
    {
        id: 'firstMatch',
        name: 'First Steps',
        description: 'Make your first match',
        icon: '🎯',
        reward: 20,
        condition: (stats) => stats.matches >= 1
    },
    {
        id: 'gameMaster',
        name: 'Game Master',
        description: 'Complete 10 games',
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
        description: 'Earn 500 coins',
        icon: '💰',
        reward: 100,
        condition: (stats) => stats.totalCoinsEarned >= 500
    },
    {
        id: 'collector',
        name: 'Collector',
        description: 'Unlock 10 items',
        icon: '🔓',
        reward: 300,
        condition: (stats) => stats.itemsUnlocked >= 10
    },
    {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Perfect game (0 mistakes)',
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
        description: 'Share a photo',
        icon: '🦋',
        reward: 50,
        condition: (stats) => stats.photosShared >= 1
    },
    {
        id: 'dailyPlayer',
        name: 'Dedicated Fan',
        description: '7 day streak',
        icon: '📅',
        reward: 200,
        condition: (stats) => stats.streak >= 7
    },
    {
        id: 'speedRunner',
        name: 'Speed Runner',
        description: 'Win in under 30 moves',
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
        
        // Initialize audio on first user interaction
        document.body.addEventListener('click', function initAudio() {
            if (achievementAudioCtx && achievementAudioCtx.state === 'suspended') {
                achievementAudioCtx.resume();
            }
            document.body.removeEventListener('click', initAudio);
        });
    }
});

function loadStats() {
    playerStats.matches = gameState.achievements?.matches || 0;
    playerStats.gamesCompleted = gameState.achievements?.gamesCompleted || 0;
    playerStats.photosTaken = gameState.photos?.length || 0;
    playerStats.totalCoinsEarned = gameState.coins + (gameState.achievements?.totalSpent || 0);
    playerStats.itemsUnlocked = gameState.unlockedItems?.length || 0;
    playerStats.filtersUsed = countFiltersUsed();
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
        // Already played today
    } else if (lastPlayed === new Date(Date.now() - 86400000).toDateString()) {
        playerStats.streak++;
    } else {
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
                        <i class="fas fa-star"></i> ${ach.reward}
                    </div>
                    ${!isUnlocked ? `
                        <div class="achievement-progress">
                            <div class="progress-bar-small">
                                <div class="progress-fill-small" style="width: ${progress}%;"></div>
                            </div>
                            <div class="progress-text">${Math.round(progress)}% complete</div>
                        </div>
                    ` : `
                        <div class="completed-badge">
                            <i class="fas fa-check-circle"></i> Completed
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
            <div class="badge ${isUnlocked ? 'unlocked' : 'locked'}">
                ${badge.icon}
                <div class="badge-tooltip">${badge.name}</div>
            </div>
        `;
    }).join('');
}

function checkBadgeCondition(badge) {
    switch(badge.id) {
        case 'badge1': return playerStats.matches >= 1;
        case 'badge2': return playerStats.photosTaken >= 3;
        case 'badge3': return playerStats.itemsUnlocked >= 5;
        case 'badge4': return playerStats.gamesCompleted >= 20;
        case 'badge5': return playerStats.filtersUsed >= 3;
        default: return false;
    }
}

function calculateProgress(achievement) {
    switch(achievement.id) {
        case 'firstMatch': return Math.min(100, (playerStats.matches / 1) * 100);
        case 'gameMaster': return Math.min(100, (playerStats.gamesCompleted / 10) * 100);
        case 'photoAddict': return Math.min(100, (playerStats.photosTaken / 5) * 100);
        case 'millionaire': return Math.min(100, (playerStats.totalCoinsEarned / 500) * 100);
        case 'collector': return Math.min(100, (playerStats.itemsUnlocked / 10) * 100);
        case 'perfectionist': return Math.min(100, (playerStats.perfectGames / 1) * 100);
        case 'artist': return Math.min(100, (playerStats.filtersUsed / 5) * 100);
        case 'social': return Math.min(100, (playerStats.photosShared / 1) * 100);
        case 'dailyPlayer': return Math.min(100, (playerStats.streak / 7) * 100);
        case 'speedRunner': return Math.min(100, (playerStats.fastGames / 1) * 100);
        default: return 0;
    }
}

function updateProgressOverview() {
    const completedSpan = document.getElementById('achievements-completed');
    const totalRewardsSpan = document.getElementById('total-rewards');
    const completionRateSpan = document.getElementById('completion-rate');
    const overallPercentSpan = document.getElementById('overall-percent');
    const overallProgressBar = document.getElementById('overall-progress');
    
    const unlockedCount = achievementsData.filter(ach => gameState.achievements?.[ach.id]).length;
    const totalCount = achievementsData.length;
    const rate = (unlockedCount / totalCount) * 100;
    const rewards = achievementsData
        .filter(ach => gameState.achievements?.[ach.id])
        .reduce((sum, ach) => sum + ach.reward, 0);
    
    if (completedSpan) completedSpan.textContent = `${unlockedCount}/${totalCount}`;
    if (totalRewardsSpan) totalRewardsSpan.textContent = rewards;
    if (completionRateSpan) completionRateSpan.textContent = `${Math.round(rate)}%`;
    if (overallPercentSpan) overallPercentSpan.textContent = `${Math.round(rate)}%`;
    if (overallProgressBar) overallProgressBar.style.width = `${rate}%`;
}

function checkAchievement(achievementId) {
    if (gameState.achievements?.[achievementId]) return;
    
    const achievement = achievementsData.find(a => a.id === achievementId);
    if (!achievement) return;
    
    if (achievementId === 'firstMatch') {
        playerStats.matches++;
        if (!gameState.achievements) gameState.achievements = {};
        gameState.achievements.matches = playerStats.matches;
    }
    
    if (achievement.condition(playerStats)) {
        if (!gameState.achievements) gameState.achievements = {};
        gameState.achievements[achievementId] = true;
        
        addCoins(achievement.reward);
        playerStats.totalCoinsEarned += achievement.reward;
        
        showToast(`🏆 Achievement Unlocked: ${achievement.name}! +${achievement.reward} coins`, 'success');
        playAchievementSound('unlock');
        createConfetti();
        
        saveProgress();
        renderAchievements();
        renderBadges();
        updateProgressOverview();
    }
}

function resetAchievements() {
    if (confirm('Reset all achievement progress? This cannot be undone.')) {
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
        
        showToast('Achievements reset', 'warning');
        playAchievementSound('click');
    }
}

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

const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confettiFall {
        to { transform: translateY(100vh) rotate(720deg); }
    }
`;
document.head.appendChild(confettiStyle);

// Event listeners
document.addEventListener('gameComplete', function(e) {
    playerStats.gamesCompleted++;
    if (gameState.achievements) gameState.achievements.gamesCompleted = playerStats.gamesCompleted;
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

document.addEventListener('filterUsed', function() {
    const filters = new Set();
    gameState.photos?.forEach(p => filters.add(p.filter));
    playerStats.filtersUsed = filters.size;
    checkAchievement('artist');
});