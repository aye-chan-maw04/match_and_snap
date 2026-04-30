// ========== GALLERY STATE ==========
let currentPhotoIndex = null;

// ========== INITIALIZE GALLERY ==========
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('gallery-grid')) {
        loadGalleryFromStorage();
        renderGallery();
        updateGalleryStats();
    }
});

function loadGalleryFromStorage() {
    // Try to load from main storage
    const saved = localStorage.getItem('matchAndSnap');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.photos && Array.isArray(data.photos)) {
                gameState.photos = data.photos;
                console.log('Loaded photos from main storage:', gameState.photos.length);
            } else {
                // Try backup storage
                const backupPhotos = localStorage.getItem('matchAndSnap_photos');
                if (backupPhotos) {
                    gameState.photos = JSON.parse(backupPhotos);
                    console.log('Loaded photos from backup:', gameState.photos.length);
                } else {
                    gameState.photos = [];
                }
            }
            
            if (data.coins !== undefined) {
                gameState.coins = data.coins;
            }
            if (data.unlockedItems) {
                gameState.unlockedItems = data.unlockedItems;
            }
            if (data.avatar) {
                gameState.avatar = data.avatar;
            }
            if (data.achievements) {
                gameState.achievements = data.achievements;
            }
        } catch (e) {
            console.error('Error loading saved data:', e);
            gameState.photos = [];
        }
    } else {
        // Check backup
        const backupPhotos = localStorage.getItem('matchAndSnap_photos');
        if (backupPhotos) {
            gameState.photos = JSON.parse(backupPhotos);
            console.log('Loaded photos from backup only:', gameState.photos.length);
        } else {
            gameState.photos = [];
        }
    }
    
    // Update coin display if function exists
    if (typeof updateCoinDisplay === 'function') {
        updateCoinDisplay();
    }
}

function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    
    // Reload latest data before rendering
    loadGalleryFromStorage();
    
    if (!gameState.photos || gameState.photos.length === 0) {
        grid.innerHTML = `
            <div class="empty-gallery">
                <div class="empty-icon">📸</div>
                <h3>No photos yet</h3>
                <p style="margin-bottom: 25px; color: #a08a94;">Visit the Photo Booth to create your first memory</p>
                <a href="photobooth.html" class="btn btn-primary">
                    <i class="fas fa-camera"></i> Take Photos
                </a>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = gameState.photos.map((photo, index) => {
        const isLatest = index === 0;
        
        return `
            <div class="gallery-item" data-index="${index}" onclick="openPhoto(${index})">
                ${isLatest ? '<div class="new-badge">NEW</div>' : ''}
                <div class="photo-coins">
                    <i class="fas fa-star"></i> ${photo.coins || 0}
                </div>
                <div class="gallery-image-container">
                    <img src="${photo.data}" alt="Photo strip" loading="lazy">
                    <div class="photo-overlay">
                        <button class="photo-action-btn" onclick="event.stopPropagation(); downloadPhoto(${index})" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="photo-action-btn" onclick="event.stopPropagation(); deletePhoto(${index})" title="Delete">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="gallery-item-info">
                    <div class="photo-date">
                        <i class="far fa-calendar-alt"></i> ${photo.date || new Date().toLocaleString()}
                    </div>
                    <div class="photo-tags">
                        <span class="photo-tag">🎨 ${getFilterDisplayName(photo.filter || 'normal')}</span>
                        <span class="photo-tag">🖼️ ${getFrameDisplayName(photo.frame || 'none')}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getFilterDisplayName(filter) {
    const names = {
        'normal': 'Natural',
        'grayscale': 'Monochrome',
        'sepia': 'Vintage',
        'pink': 'Rose',
        'purple': 'Lavender',
        'warm': 'Amber'
    };
    return names[filter] || filter;
}

function getFrameDisplayName(frame) {
    const names = {
        'none': 'Classic',
        'polaroid': 'Polaroid',
        'film': 'Cinema',
        'hearts': 'Love',
        'flowers': 'Botanical',
        'stars': 'Stellar'
    };
    return names[frame] || frame;
}

function updateGalleryStats() {
    const totalPhotos = document.getElementById('total-photos');
    const totalCoins = document.getElementById('total-coins-earned');
    const favFilter = document.getElementById('favorite-filter');
    const latestPhoto = document.getElementById('latest-photo');
    
    if (totalPhotos) {
        totalPhotos.textContent = gameState.photos?.length || 0;
    }
    
    if (totalCoins && gameState.photos) {
        const coinsEarned = gameState.photos.reduce((sum, photo) => sum + (photo.coins || 0), 0);
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
        
        favFilter.textContent = getFilterDisplayName(favorite);
    }
    
    if (latestPhoto && gameState.photos && gameState.photos.length > 0) {
        const latest = gameState.photos[0];
        latestPhoto.textContent = latest.date ? new Date(latest.date).toLocaleDateString() : 'Today';
    }
}

function openPhoto(index) {
    currentPhotoIndex = index;
    const photo = gameState.photos[index];
    if (!photo) return;
    
    const modal = document.getElementById('photo-modal');
    const modalImg = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    const modalDetails = document.getElementById('modal-details');
    
    if (modal && modalImg) {
        modalImg.src = photo.data;
        modalTitle.textContent = `Memory ${index + 1}`;
        modalDate.innerHTML = `<i class="far fa-calendar-alt"></i> ${photo.date || new Date().toLocaleString()}`;
        modalDetails.innerHTML = `
            <i class="fas fa-palette"></i> ${getFilterDisplayName(photo.filter || 'normal')} · 
            <i class="fas fa-frame"></i> ${getFrameDisplayName(photo.frame || 'none')}
        `;
        modal.classList.add('active');
        
        const selectedItem = document.querySelector(`.gallery-item[data-index="${index}"]`);
        if (selectedItem) {
            selectedItem.style.transition = 'all 0.3s ease';
            selectedItem.style.transform = 'scale(1.02)';
            setTimeout(() => {
                selectedItem.style.transform = '';
            }, 300);
        }
    }
}

function closeModal() {
    const modal = document.getElementById('photo-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentPhotoIndex = null;
}

function downloadPhoto(index) {
    const photo = gameState.photos[index];
    if (!photo) {
        showToast('❌ Photo not found!', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.download = `match-snap-memory-${Date.now()}.png`;
    link.href = photo.data;
    link.click();
    showToast('✅ Photo downloaded!', 'success');
}

function downloadCurrentPhoto() {
    if (currentPhotoIndex !== null && gameState.photos[currentPhotoIndex]) {
        downloadPhoto(currentPhotoIndex);
    } else {
        showToast('❌ No photo selected!', 'error');
    }
}

function deletePhoto(index) {
    if (confirm('Are you sure you want to delete this memory?')) {
        gameState.photos.splice(index, 1);
        saveGalleryToStorage();
        renderGallery();
        updateGalleryStats();
        showToast('Photo deleted', 'warning');
        
        if (currentPhotoIndex === index) {
            closeModal();
        } else if (currentPhotoIndex !== null && currentPhotoIndex > index) {
            currentPhotoIndex--;
        }
    }
}

function deleteCurrentPhoto() {
    if (currentPhotoIndex !== null) {
        deletePhoto(currentPhotoIndex);
        closeModal();
    }
}

function refreshGallery() {
    loadGalleryFromStorage();
    renderGallery();
    updateGalleryStats();
    showToast(`Gallery refreshed - ${gameState.photos?.length || 0} photos found`, 'success');
}

function clearGallery() {
    if (confirm('Delete all photos? This cannot be undone.')) {
        gameState.photos = [];
        saveGalleryToStorage();
        renderGallery();
        updateGalleryStats();
        showToast('All photos cleared', 'warning');
        closeModal();
    }
}

function saveGalleryToStorage() {
    const saveData = {
        coins: gameState.coins,
        unlockedItems: gameState.unlockedItems || ['normal', 'none'],
        photos: gameState.photos,
        avatar: gameState.avatar || '👧',
        achievements: gameState.achievements || {}
    };
    
    localStorage.setItem('matchAndSnap', JSON.stringify(saveData));
    localStorage.setItem('matchAndSnap_photos', JSON.stringify(gameState.photos));
    
    console.log('Gallery saved:', gameState.photos.length, 'photos');
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
    
    if (e.key === 'ArrowLeft' && currentPhotoIndex !== null && gameState.photos) {
        if (currentPhotoIndex > 0) {
            openPhoto(currentPhotoIndex - 1);
        }
    }
    
    if (e.key === 'ArrowRight' && currentPhotoIndex !== null && gameState.photos) {
        if (currentPhotoIndex < gameState.photos.length - 1) {
            openPhoto(currentPhotoIndex + 1);
        }
    }
});

// Click outside modal to close
window.addEventListener('click', function(e) {
    const modal = document.getElementById('photo-modal');
    if (e.target === modal) {
        closeModal();
    }
});

// Toast function
if (typeof showToast !== 'function') {
    window.showToast = function(message, type = 'info') {
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
    };
}

// Log for debugging
console.log('Gallery.js loaded - ready to display photos');