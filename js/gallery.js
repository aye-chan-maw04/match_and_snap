// ========== GALLERY STATE ==========
let currentPhotoIndex = null;

// ========== INITIALIZE GALLERY ==========
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('gallery-grid')) {
        renderGallery();
        updateGalleryStats();
    }
});

function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    
    if (!gameState.photos || gameState.photos.length === 0) {
        grid.innerHTML = `
            <div class="empty-gallery">
                <div class="empty-icon">📸</div>
                <h3 style="margin-bottom: 15px;">No photos yet!</h3>
                <p style="margin-bottom: 20px;">Go to the Photo Booth and create your first cute photo strip!</p>
                <a href="photobooth.html" class="btn btn-primary">
                    <i class="fas fa-camera"></i> Take Photos
                </a>
            </div>
        `;
        updateGalleryStats();
        return;
    }
    
    grid.innerHTML = gameState.photos.map((photo, index) => {
        const rotation = Math.random() * 4 - 2;
        return `
            <div class="gallery-item" onclick="openPhoto(${index})" style="transform: rotate(${rotation}deg);">
                <img src="${photo.data}" alt="Photo strip" loading="lazy">
                <div class="photo-coins">+${photo.coins || 12} 🪙</div>
                <div class="gallery-item-info">
                    <div class="photo-date">
                        <i class="far fa-calendar-alt"></i> ${photo.date || new Date().toLocaleString()}
                    </div>
                    <div class="photo-tags">
                        <span class="photo-tag">🎨 ${photo.filter || 'normal'}</span>
                        <span class="photo-tag">🖼️ ${photo.frame || 'none'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    updateGalleryStats();
}

function updateGalleryStats() {
    const totalPhotos = document.getElementById('total-photos');
    const totalCoins = document.getElementById('total-coins-earned');
    const favFilter = document.getElementById('favorite-filter');
    
    if (totalPhotos) {
        totalPhotos.textContent = gameState.photos ? gameState.photos.length : 0;
    }
    
    if (totalCoins) {
        const coinsEarned = gameState.photos ? gameState.photos.reduce((sum, photo) => sum + (photo.coins || 12), 0) : 0;
        totalCoins.textContent = coinsEarned;
    }
    
    if (favFilter && gameState.photos && gameState.photos.length > 0) {
        const filterCount = {};
        gameState.photos.forEach(photo => {
            const filter = photo.filter || 'normal';
            filterCount[filter] = (filterCount[filter] || 0) + 1;
        });
        
        let favorite = 'normal';
        let maxCount = 0;
        for (const [filter, count] of Object.entries(filterCount)) {
            if (count > maxCount) {
                maxCount = count;
                favorite = filter;
            }
        }
        
        const filterNames = {
            'normal': 'Normal',
            'grayscale': 'Soft Gray',
            'sepia': 'Vintage',
            'pink': 'Pink Dream',
            'purple': 'Lavender',
            'warm': 'Warm Glow'
        };
        
        favFilter.textContent = filterNames[favorite] || favorite;
    } else if (favFilter) {
        favFilter.textContent = '-';
    }
}

function openPhoto(index) {
    if (!gameState.photos || !gameState.photos[index]) return;
    
    currentPhotoIndex = index;
    const photo = gameState.photos[index];
    
    const modal = document.getElementById('photo-modal');
    const modalImg = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    
    if (modal && modalImg) {
        modalImg.src = photo.data;
        modalTitle.textContent = `Photo Strip ${index + 1}`;
        modalDate.innerHTML = `<i class="far fa-calendar-alt"></i> ${photo.date || new Date().toLocaleString()}<br>
                               <i class="fas fa-palette"></i> Filter: ${photo.filter || 'normal'}<br>
                               <i class="fas fa-frame"></i> Frame: ${photo.frame || 'none'}<br>
                               <i class="fas fa-star"></i> Coins: +${photo.coins || 12}`;
        modal.classList.add('active');
    }
}

function closeModal() {
    const modal = document.getElementById('photo-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function downloadCurrentPhoto() {
    if (currentPhotoIndex !== null && gameState.photos && gameState.photos[currentPhotoIndex]) {
        const photo = gameState.photos[currentPhotoIndex];
        const link = document.createElement('a');
        link.download = `match-snap-${Date.now()}.png`;
        link.href = photo.data;
        link.click();
        showToast('✅ Photo downloaded!', 'success');
    }
}

function refreshGallery() {
    loadProgress();
    renderGallery();
    showToast('✨ Gallery refreshed!', 'success');
}

function clearGallery() {
    if (confirm('💖 Are you sure you want to delete all your precious photos? This cannot be undone!')) {
        gameState.photos = [];
        saveProgress();
        renderGallery();
        updateGalleryStats();
        showToast('🗑️ Gallery cleared', 'warning');
    }
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
    
    if (e.key === 'ArrowLeft' && currentPhotoIndex !== null && gameState.photos && currentPhotoIndex > 0) {
        openPhoto(currentPhotoIndex - 1);
    }
    
    if (e.key === 'ArrowRight' && currentPhotoIndex !== null && gameState.photos && currentPhotoIndex < gameState.photos.length - 1) {
        openPhoto(currentPhotoIndex + 1);
    }
});

// Click outside modal to close
window.addEventListener('click', function(e) {
    const modal = document.getElementById('photo-modal');
    if (e.target === modal) {
        closeModal();
    }
});

// Listen for storage events from other pages
window.addEventListener('storage', function(e) {
    if (e.key === 'matchAndSnap') {
        loadProgress();
        renderGallery();
        updateGalleryStats();
    }
});