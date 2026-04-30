// ========== PHOTO BOOTH STATE ==========
let photoBoothState = {
    currentFilter: 'normal',
    currentFrame: 'none',
    photos: [],
    photosWithStickers: [],
    capturing: false,
    currentSlot: 0,
    selectedPhotoIndex: -1,
    quality: 'medium', // low, medium, high
    editingTools: {
        brightness: 100,
        contrast: 100,
        sharpness: 100,
        blur: 0
    },
    stickers: [[], [], [], []]
};

// Quality settings (resolution for photos)
const qualitySettings = {
    low: { width: 320, height: 320, label: 'Low (480p)' },
    medium: { width: 640, height: 640, label: 'Medium (720p)' },
    high: { width: 1080, height: 1080, label: 'High (1080p)' }
};

// Image stickers
const imageStickersList = [
    { id: 'heart', name: 'Heart', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red"%3E%3Cpath d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"%3E%3C/path%3E%3C/svg%3E' },
    { id: 'star', name: 'Star', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gold"%3E%3Cpath d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"%3E%3C/path%3E%3C/svg%3E' },
    { id: 'flower', name: 'Flower', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="pink"%3E%3Cpath d="M12,2C9,2 6.5,4.5 6.5,7.5C6.5,9.5 7.5,11 9,12C7.5,13 6.5,14.5 6.5,16.5C6.5,19.5 9,22 12,22C15,22 17.5,19.5 17.5,16.5C17.5,14.5 16.5,13 15,12C16.5,11 17.5,9.5 17.5,7.5C17.5,4.5 15,2 12,2Z"%3E%3C/path%3E%3C/svg%3E' },
    { id: 'crown', name: 'Crown', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gold"%3E%3Cpath d="M5,16L3,5L8.5,10L12,4L15.5,10L21,5L19,16H5Z"%3E%3C/path%3E%3C/svg%3E' }
];

// ========== QUALITY SETTINGS ==========
function setQuality(level) {
    photoBoothState.quality = level;
    
    document.querySelectorAll('.quality-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    showToast(`📷 Quality set to ${qualitySettings[level].label}`, 'success');
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('video')) {
        startCamera();
        loadImageStickers();
    }
});

function loadImageStickers() {
    const grid = document.getElementById('image-sticker-grid');
    if (!grid) return;
    
    grid.innerHTML = imageStickersList.map(sticker => `
        <button class="image-sticker-btn" onclick="addImageSticker('${sticker.url}')" title="${sticker.name}">
            <img src="${sticker.url}" alt="${sticker.name}">
        </button>
    `).join('');
}

function addImageSticker(imageUrl) {
    if (photoBoothState.selectedPhotoIndex === -1) {
        showToast('⚠️ Click on a photo first to add stickers!', 'warning');
        return;
    }
    
    if (!photoBoothState.photos[photoBoothState.selectedPhotoIndex]) {
        showToast('⚠️ No photo in this slot! Take photos first.', 'warning');
        return;
    }
    
    photoBoothState.stickers[photoBoothState.selectedPhotoIndex].push({
        type: 'image',
        url: imageUrl,
        x: Math.random() * 150 + 20,
        y: Math.random() * 150 + 20,
        size: 45,
        rotation: Math.random() * 30 - 15
    });
    
    updatePhotoWithStickers();
    showToast('✨ Image sticker added!', 'success');
}

// ========== FILTER FUNCTIONS ==========
function checkAndApplyFilter(filterId) {
    if (gameState.unlockedItems && gameState.unlockedItems.includes(filterId)) {
        applyFilter(filterId);
    } else {
        showToast('🔒 Buy this filter in the shop first! (50-100 coins)', 'warning');
    }
}

function applyFilter(filterId) {
    photoBoothState.currentFilter = filterId;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`.filter-btn[data-filter="${filterId}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    showToast(`✨ ${getFilterName(filterId)} filter applied!`, 'success');
}

function getFilterName(filterId) {
    const names = {
        'normal': 'Normal',
        'grayscale': 'Grayscale',
        'sepia': 'Sepia',
        'pink': 'Pink Dream',
        'purple': 'Lavender',
        'warm': 'Warm Glow'
    };
    return names[filterId] || filterId;
}

// ========== FRAME FUNCTIONS ==========
function checkAndApplyFrame(frameId) {
    if (gameState.unlockedItems && gameState.unlockedItems.includes(frameId)) {
        applyFrame(frameId);
    } else {
        showToast('🔒 Buy this frame in the shop first! (75-100 coins)', 'warning');
    }
}

function applyFrame(frameId) {
    photoBoothState.currentFrame = frameId;
    
    document.querySelectorAll('.frame-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`.frame-btn[data-frame="${frameId}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    const stripDiv = document.getElementById('strip-container');
    if (stripDiv) {
        stripDiv.classList.remove('polaroid', 'film', 'hearts', 'flowers', 'stars');
        if (frameId !== 'none') {
            stripDiv.classList.add(frameId);
        }
    }
    
    showToast(`🖼️ ${getFrameName(frameId)} frame applied to strip!`, 'success');
}

function getFrameName(frameId) {
    const names = {
        'none': 'No Frame',
        'polaroid': 'Polaroid',
        'film': 'Film Strip',
        'hearts': 'Hearts',
        'flowers': 'Flowers',
        'stars': 'Stars'
    };
    return names[frameId] || frameId;
}

// ========== EDITING TOOLS ==========
function updateEdit(tool, value) {
    photoBoothState.editingTools[tool] = parseInt(value);
    const valSpan = document.getElementById(`${tool}-val`);
    if (valSpan) {
        valSpan.textContent = tool === 'blur' ? value + 'px' : value + '%';
    }
}

function resetEdits() {
    photoBoothState.editingTools = {
        brightness: 100,
        contrast: 100,
        sharpness: 100,
        blur: 0
    };
    
    const brightness = document.getElementById('brightness');
    const contrast = document.getElementById('contrast');
    const sharpness = document.getElementById('sharpness');
    const blur = document.getElementById('blur');
    
    if (brightness) brightness.value = 100;
    if (contrast) contrast.value = 100;
    if (sharpness) sharpness.value = 100;
    if (blur) blur.value = 0;
    
    const brightnessVal = document.getElementById('brightness-val');
    const contrastVal = document.getElementById('contrast-val');
    const sharpnessVal = document.getElementById('sharpness-val');
    const blurVal = document.getElementById('blur-val');
    
    if (brightnessVal) brightnessVal.textContent = '100%';
    if (contrastVal) contrastVal.textContent = '100%';
    if (sharpnessVal) sharpnessVal.textContent = '100%';
    if (blurVal) blurVal.textContent = '0px';
    
    showToast('✨ Edits reset', 'success');
}

// ========== STICKER FUNCTIONS ==========
function selectPhotoForEditing(photoIndex) {
    if (!photoBoothState.photos[photoIndex]) {
        showToast('⚠️ No photo in this slot yet! Take photos first.', 'warning');
        return;
    }
    
    photoBoothState.selectedPhotoIndex = photoIndex;
    
    for (let i = 0; i < 4; i++) {
        const photoDiv = document.getElementById(`strip-photo-${i}`);
        if (photoDiv) {
            if (i === photoIndex) {
                photoDiv.style.boxShadow = '0 0 0 3px #ffb8d1, 0 0 0 6px white';
                photoDiv.style.transform = 'scale(1.02)';
                photoDiv.style.transition = 'all 0.3s ease';
            } else {
                photoDiv.style.boxShadow = '';
                photoDiv.style.transform = '';
            }
        }
    }
    
    const infoDiv = document.getElementById('selected-photo-info');
    if (infoDiv) {
        infoDiv.innerHTML = `<span class="selected-photo-indicator">✨ Editing Photo ${photoIndex + 1} - Click stickers to add! ✨</span>`;
    }
    
    showToast(`📸 Selected Photo ${photoIndex + 1} for editing`, 'success');
}

function addSticker(emoji) {
    if (photoBoothState.selectedPhotoIndex === -1) {
        showToast('⚠️ Click on a photo first to add stickers!', 'warning');
        return;
    }
    
    if (!photoBoothState.photos[photoBoothState.selectedPhotoIndex]) {
        showToast('⚠️ No photo in this slot! Take photos first.', 'warning');
        return;
    }
    
    photoBoothState.stickers[photoBoothState.selectedPhotoIndex].push({
        type: 'emoji',
        emoji: emoji,
        x: Math.random() * 150 + 20,
        y: Math.random() * 150 + 20,
        size: 40,
        rotation: Math.random() * 30 - 15
    });
    
    updatePhotoWithStickers();
    showToast(`✨ Sticker ${emoji} added to Photo ${photoBoothState.selectedPhotoIndex + 1}!`, 'success');
}

function updatePhotoWithStickers() {
    if (photoBoothState.selectedPhotoIndex === -1) return;
    if (!photoBoothState.photos[photoBoothState.selectedPhotoIndex]) return;
    
    const canvas = document.createElement('canvas');
    const quality = qualitySettings[photoBoothState.quality];
    canvas.width = quality.width;
    canvas.height = quality.height;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = () => {
        // Draw image with mirror effect (flip back because camera already mirrors)
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(img, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
        
        // Apply stickers
        photoBoothState.stickers[photoBoothState.selectedPhotoIndex].forEach(sticker => {
            ctx.save();
            ctx.translate(sticker.x, sticker.y);
            ctx.rotate(sticker.rotation * Math.PI / 180);
            
            if (sticker.type === 'emoji') {
                ctx.font = `${sticker.size}px "Segoe UI Emoji", "Apple Color Emoji"`;
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#000';
                ctx.fillText(sticker.emoji, -sticker.size/2, sticker.size/2);
                ctx.fillStyle = '#fff';
                ctx.fillText(sticker.emoji, -sticker.size/2 - 1, sticker.size/2 - 1);
            } else if (sticker.type === 'image') {
                const stickerImg = new Image();
                stickerImg.src = sticker.url;
                ctx.drawImage(stickerImg, -sticker.size/2, -sticker.size/2, sticker.size, sticker.size);
            }
            
            ctx.restore();
        });
        
        // Update preview
        const slot = document.getElementById(`strip-photo-${photoBoothState.selectedPhotoIndex}`);
        if (slot) {
            slot.style.backgroundImage = `url(${canvas.toDataURL('image/jpeg', 0.95)})`;
            slot.style.backgroundSize = 'cover';
            slot.style.backgroundPosition = 'center';
        }
        
        photoBoothState.photosWithStickers[photoBoothState.selectedPhotoIndex] = canvas.toDataURL('image/jpeg', 0.95);
    };
    img.src = photoBoothState.photos[photoBoothState.selectedPhotoIndex];
}

function clearStickersOnSelectedPhoto() {
    if (photoBoothState.selectedPhotoIndex === -1) {
        showToast('⚠️ Select a photo first', 'warning');
        return;
    }
    
    photoBoothState.stickers[photoBoothState.selectedPhotoIndex] = [];
    
    if (photoBoothState.photos[photoBoothState.selectedPhotoIndex]) {
        const slot = document.getElementById(`strip-photo-${photoBoothState.selectedPhotoIndex}`);
        if (slot) {
            slot.style.backgroundImage = `url(${photoBoothState.photos[photoBoothState.selectedPhotoIndex]})`;
            slot.style.backgroundSize = 'cover';
            slot.style.backgroundPosition = 'center';
        }
        photoBoothState.photosWithStickers[photoBoothState.selectedPhotoIndex] = photoBoothState.photos[photoBoothState.selectedPhotoIndex];
    }
    
    showToast(`🗑️ All stickers cleared from Photo ${photoBoothState.selectedPhotoIndex + 1}`, 'success');
}

// ========== CAMERA FUNCTIONS ==========
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                facingMode: 'user'
            } 
        });
        
        const video = document.getElementById('video');
        video.srcObject = stream;
        
        video.onloadedmetadata = () => {
            video.play();
            const statusEl = document.getElementById('camera-status');
            if (statusEl) {
                statusEl.textContent = '📸 Camera ready! (Mirror view enabled)';
                statusEl.style.background = 'rgba(255, 184, 209, 0.9)';
            }
            const captureBtn = document.getElementById('capture-btn');
            if (captureBtn) captureBtn.disabled = false;
            showToast('✅ Camera started! Mirror view enabled.', 'success');
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

// ========== PHOTO STRIP FUNCTIONS ==========
function startPhotoStrip() {
    const video = document.getElementById('video');
    if (!video || !video.srcObject) {
        showToast('❌ Start camera first!', 'error');
        return;
    }
    
    if (photoBoothState.capturing) {
        showToast('⚠️ Already capturing!', 'warning');
        return;
    }
    
    photoBoothState = {
        ...photoBoothState,
        photos: [],
        photosWithStickers: [],
        stickers: [[], [], [], []],
        capturing: true,
        currentSlot: 0,
        selectedPhotoIndex: -1
    };
    
    for (let i = 0; i < 4; i++) {
        const slot = document.getElementById(`strip-photo-${i}`);
        if (slot) {
            slot.style.backgroundImage = '';
            slot.style.backgroundColor = '#f5f5f5';
            slot.innerHTML = `📸 Photo ${i + 1}`;
            slot.classList.remove('filled');
            slot.classList.add('empty');
            slot.style.boxShadow = '';
            slot.style.transform = '';
        }
    }
    
    const infoDiv = document.getElementById('selected-photo-info');
    if (infoDiv) {
        infoDiv.innerHTML = `<span class="selected-photo-indicator">📸 Taking photos... Click any photo after to add stickers!</span>`;
    }
    
    const saveBtn = document.getElementById('save-strip-btn');
    if (saveBtn) saveBtn.disabled = true;
    
    captureNextPhoto();
}

function captureNextPhoto() {
    if (!photoBoothState.capturing) return;
    if (photoBoothState.currentSlot >= 4) {
        finishPhotoStrip();
        return;
    }
    
    const countdown = document.getElementById('countdown');
    if (!countdown) return;
    
    countdown.style.display = 'flex';
    
    let count = 3;
    countdown.textContent = count;
    
    const timer = setInterval(() => {
        count--;
        countdown.textContent = count;
        
        if (count === 0) {
            clearInterval(timer);
            countdown.style.display = 'none';
            
            takeStripPhoto();
            
            setTimeout(() => {
                photoBoothState.currentSlot++;
                captureNextPhoto();
            }, 800);
        }
    }, 1000);
}

function takeStripPhoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    if (!video || !canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Use quality settings for resolution
    const quality = qualitySettings[photoBoothState.quality];
    canvas.width = quality.width;
    canvas.height = quality.height;
    
    // Build filter string
    let filterString = '';
    filterString += `brightness(${photoBoothState.editingTools.brightness}%) `;
    filterString += `contrast(${photoBoothState.editingTools.contrast}%) `;
    
    // Sharpness simulation using convolution (simple contrast enhancement)
    if (photoBoothState.editingTools.sharpness > 100) {
        filterString += `contrast(${photoBoothState.editingTools.sharpness}%) `;
    }
    filterString += `blur(${photoBoothState.editingTools.blur}px) `;
    
    // Apply selected filter
    switch(photoBoothState.currentFilter) {
        case 'grayscale':
            filterString += 'grayscale(100%)';
            break;
        case 'sepia':
            filterString += 'sepia(100%)';
            break;
        case 'pink':
            filterString += 'hue-rotate(320deg) saturate(150%) brightness(105%)';
            break;
        case 'purple':
            filterString += 'hue-rotate(280deg) saturate(150%) brightness(105%)';
            break;
        case 'warm':
            filterString += 'sepia(30%) brightness(110%) contrast(105%)';
            break;
        default:
            break;
    }
    
    ctx.filter = filterString;
    
    // Draw video frame with MIRROR effect (flip horizontally to match preview)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // Save with high quality JPEG
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    photoBoothState.photos.push(imgData);
    photoBoothState.photosWithStickers.push(imgData);
    
    // Update slot preview
    const slot = document.getElementById(`strip-photo-${photoBoothState.currentSlot}`);
    if (slot) {
        slot.style.backgroundImage = `url(${imgData})`;
        slot.style.backgroundSize = 'cover';
        slot.style.backgroundPosition = 'center';
        slot.innerHTML = '';
        slot.classList.remove('empty');
        slot.classList.add('filled');
        
        slot.onclick = (function(index) {
            return function() { selectPhotoForEditing(index); };
        })(photoBoothState.currentSlot);
    }
    
    // Flash effect
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
        videoContainer.style.animation = 'cameraFlash 0.3s ease';
        setTimeout(() => {
            videoContainer.style.animation = '';
        }, 300);
    }
    
    addCoins(3);
}

function finishPhotoStrip() {
    photoBoothState.capturing = false;
    
    const saveBtn = document.getElementById('save-strip-btn');
    if (saveBtn) saveBtn.disabled = false;
    
    const infoDiv = document.getElementById('selected-photo-info');
    if (infoDiv) {
        infoDiv.innerHTML = `<span class="selected-photo-indicator">🎉 4 photos taken! Click any photo to add stickers, then click Save to Gallery!</span>`;
    }
    
    showToast('🎞️ 4 photos taken! Click any photo to add stickers, then Save to Gallery!', 'success');
    createConfetti();
}

function savePhotoStrip() {
    if (photoBoothState.photos.length === 0) {
        showToast('❌ No photos to save! Take photos first!', 'error');
        return;
    }
    
    createAndSaveFinalStrip();
}

function createAndSaveFinalStrip() {
    const stripCanvas = document.getElementById('strip-canvas');
    if (!stripCanvas) return;
    
    const ctx = stripCanvas.getContext('2d');
    
    // 2 inches wide = 192px, 6 inches tall = 576px (at 96 DPI)
    // Using high quality - 2x size for better resolution (384x1152)
    const photoSize = 384;  // 4 inches at 96 DPI
    const padding = 16;
    
    stripCanvas.width = photoSize + padding * 2;
    stripCanvas.height = (photoSize * 4) + (padding * 5);
    
    // Background
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);
    
    const finalPhotos = [];
    let loadCount = 0;
    
    for (let i = 0; i < 4; i++) {
        const sourcePhoto = photoBoothState.photosWithStickers[i] || photoBoothState.photos[i];
        if (sourcePhoto) {
            finalPhotos.push(sourcePhoto);
        }
    }
    
    finalPhotos.forEach((photo, index) => {
        const img = new Image();
        img.onload = () => {
            const y = padding + (index * (photoSize + padding));
            ctx.drawImage(img, padding, y, photoSize, photoSize);
            loadCount++;
            
            if (loadCount === finalPhotos.length) {
                applyFrameToStrip(ctx, stripCanvas.width, stripCanvas.height, photoSize, padding);
                
                const finalImage = stripCanvas.toDataURL('image/png');
                gameState.lastPhoto = finalImage;
                
                if (!gameState.photos) {
                    gameState.photos = [];
                }
                
                const newPhoto = {
                    id: Date.now(),
                    data: finalImage,
                    filter: photoBoothState.currentFilter,
                    frame: photoBoothState.currentFrame,
                    date: new Date().toLocaleString(),
                    coins: 12,
                    quality: photoBoothState.quality
                };
                
                gameState.photos.unshift(newPhoto);
                
                if (gameState.photos.length > 20) {
                    gameState.photos.pop();
                }
                
                addCoins(12);
                saveProgress();
                
                showToast('✅ Photo strip saved to gallery! High quality saved!', 'success');
                
                // Reset for next session
                photoBoothState.photos = [];
                photoBoothState.photosWithStickers = [];
                photoBoothState.stickers = [[], [], [], []];
                photoBoothState.selectedPhotoIndex = -1;
            }
        };
        img.src = photo;
    });
}

function applyFrameToStrip(ctx, width, height, photoSize, padding) {
    switch(photoBoothState.currentFrame) {
        case 'polaroid':
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.fillRect(0, 0, width, height);
            break;
        case 'film':
            ctx.fillStyle = '#ffd700';
            for (let i = 0; i < 20; i++) {
                ctx.beginPath();
                ctx.arc(padding - 8, 15 + i * 60, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(padding + photoSize + 8, 15 + i * 60, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        case 'hearts':
            ctx.font = '28px "Segoe UI Emoji"';
            ctx.fillStyle = '#ff6b8a';
            ctx.fillText('❤️', 10, 35);
            ctx.fillText('❤️', width - 45, 35);
            ctx.fillText('❤️', 10, height - 20);
            ctx.fillText('❤️', width - 45, height - 20);
            break;
        case 'flowers':
            ctx.font = '28px "Segoe UI Emoji"';
            ctx.fillStyle = '#ffb8d1';
            ctx.fillText('🌸', 10, 35);
            ctx.fillText('🌸', width - 45, 35);
            ctx.fillText('🌸', 10, height - 20);
            ctx.fillText('🌸', width - 45, height - 20);
            break;
        case 'stars':
            ctx.font = '28px "Segoe UI Emoji"';
            ctx.fillStyle = '#ffd700';
            ctx.fillText('⭐', 10, 35);
            ctx.fillText('⭐', width - 45, 35);
            ctx.fillText('⭐', 10, height - 20);
            ctx.fillText('⭐', width - 45, height - 20);
            break;
    }
}

// Add camera flash animation
const flashStyle = document.createElement('style');
flashStyle.textContent = `
    @keyframes cameraFlash {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; background: white; }
    }
`;
document.head.appendChild(flashStyle);