// ========== PHOTO BOOTH STATE ==========
let photoBoothState = {
    currentFilter: 'normal',
    currentFrame: 'none',
    photos: [],
    photosWithStickers: [],
    capturing: false,
    currentSlot: 0,
    selectedPhotoIndex: -1,
    sessionPaid: false,
    editingTools: {
        brightness: 100,
        contrast: 100,
        sharpness: 100,
        blur: 0
    },
    stickers: [[], [], [], []]
};

// Image stickers
const imageStickersList = [
    { id: 'heart', name: 'Heart', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red"%3E%3Cpath d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"%3E%3C/path%3E%3C/svg%3E' },
    { id: 'star', name: 'Star', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gold"%3E%3Cpath d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"%3E%3C/path%3E%3C/svg%3E' },
    { id: 'flower', name: 'Flower', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="pink"%3E%3Cpath d="M12,2C9,2 6.5,4.5 6.5,7.5C6.5,9.5 7.5,11 9,12C7.5,13 6.5,14.5 6.5,16.5C6.5,19.5 9,22 12,22C15,22 17.5,19.5 17.5,16.5C17.5,14.5 16.5,13 15,12C16.5,11 17.5,9.5 17.5,7.5C17.5,4.5 15,2 12,2Z"%3E%3C/path%3E%3C/svg%3E' },
    { id: 'crown', name: 'Crown', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gold"%3E%3Cpath d="M5,16L3,5L8.5,10L12,4L15.5,10L21,5L19,16H5Z"%3E%3C/path%3E%3C/svg%3E' }
];

// Photo session cost
const PHOTO_SESSION_COST = 100;

// Initialize gameState if not exists
if (typeof gameState === 'undefined') {
    window.gameState = {
        coins: 0,
        photos: [],
        unlockedItems: ['normal', 'none'],
        avatar: '👧',
        achievements: {}
    };
}

// ========== SOUND EFFECTS ==========
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let soundEnabled = true;

function playSound(type) {
    if (!soundEnabled) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    switch(type) {
        case 'shutter':
            osc.frequency.value = 200;
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            break;
        case 'success':
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
            break;
        case 'click':
            osc.frequency.value = 600;
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            break;
        case 'countdown':
            osc.frequency.value = 700;
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            break;
        default:
            osc.frequency.value = 500;
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    }
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
}

// ========== TOAST NOTIFICATION SYSTEM ==========
let currentProgressToast = null;

function showToast(title, message, type = 'info', duration = 3000) {
    const container = document.getElementById('chic-toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `chic-toast ${type}`;
    
    let icon = '📸';
    switch(type) {
        case 'success': icon = '✓'; break;
        case 'error': icon = '✗'; break;
        case 'warning': icon = '⚠'; break;
        case 'info': icon = '✨'; break;
    }
    
    toast.innerHTML = `
        <div class="chic-toast-icon">${icon}</div>
        <div class="chic-toast-content">
            <div class="chic-toast-title">${title}</div>
            <div class="chic-toast-message">${message}</div>
        </div>
        <div class="chic-toast-close" onclick="this.parentElement.remove()">✕</div>
    `;
    
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, duration);
    
    toast.addEventListener('click', (e) => {
        if (!e.target.classList.contains('chic-toast-close')) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }
    });
    
    playSound('click');
}

function showProgressToast(title, message) {
    if (currentProgressToast) currentProgressToast.remove();
    
    const container = document.getElementById('chic-toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'chic-toast progress';
    toast.innerHTML = `
        <div class="chic-toast-icon">⏳</div>
        <div class="chic-toast-content">
            <div class="chic-toast-title">${title}</div>
            <div class="chic-toast-message">${message}</div>
            <div class="chic-progress-bar">
                <div class="chic-progress-fill" id="progress-fill-toast"></div>
            </div>
        </div>
    `;
    
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    currentProgressToast = toast;
    return toast;
}

function updateProgressToast(percent, text) {
    if (currentProgressToast) {
        const fill = currentProgressToast.querySelector('#progress-fill-toast');
        const msgEl = currentProgressToast.querySelector('.chic-toast-message');
        if (fill) fill.style.width = percent + '%';
        if (msgEl && text) msgEl.innerHTML = text;
    }
}

function closeProgressToast() {
    if (currentProgressToast) {
        currentProgressToast.classList.remove('show');
        setTimeout(() => {
            if (currentProgressToast) currentProgressToast.remove();
            currentProgressToast = null;
        }, 400);
    }
}

// ========== COST CHECK FUNCTION ==========
function checkAndStartPhotoStrip() {
    if (!gameState || gameState.coins < PHOTO_SESSION_COST) {
        showToast('Insufficient Coins', `You need ${PHOTO_SESSION_COST} coins to take photos! Play the Memory Game to earn coins.`, 'warning');
        const insufficientDiv = document.getElementById('insufficient-coins');
        if (insufficientDiv) insufficientDiv.style.display = 'block';
        return;
    }
    
    gameState.coins -= PHOTO_SESSION_COST;
    if (typeof updateCoinDisplay === 'function') updateCoinDisplay();
    if (typeof saveProgress === 'function') saveProgress();
    
    showToast('Payment Received', `✨ Paid ${PHOTO_SESSION_COST} coins! Now take your 4 photos! ✨`, 'success');
    const insufficientDiv = document.getElementById('insufficient-coins');
    if (insufficientDiv) insufficientDiv.style.display = 'none';
    photoBoothState.sessionPaid = true;
    
    startPhotoStrip();
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('video')) {
        startCamera();
        loadImageStickers();
        if (typeof updateCoinDisplay === 'function') updateCoinDisplay();
        
        if (gameState && gameState.coins < PHOTO_SESSION_COST) {
            const insufficientDiv = document.getElementById('insufficient-coins');
            if (insufficientDiv) insufficientDiv.style.display = 'block';
        }
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
        showToast('Select Photo', 'Click on a photo first to add stickers!', 'warning');
        return;
    }
    
    if (!photoBoothState.photos[photoBoothState.selectedPhotoIndex]) {
        showToast('No Photo', 'No photo in this slot! Take photos first.', 'warning');
        return;
    }
    
    photoBoothState.stickers[photoBoothState.selectedPhotoIndex].push({
        type: 'image',
        url: imageUrl,
        x: Math.random() * 700 + 80,
        y: Math.random() * 500 + 70,
        size: 70,
        rotation: Math.random() * 30 - 15
    });
    
    updatePhotoWithStickers();
    showToast('Sticker Added', '✨ Image sticker added to your photo!', 'success');
}

// ========== FILTER FUNCTIONS ==========
function checkAndApplyFilter(filterId) {
    if (gameState.unlockedItems && gameState.unlockedItems.includes(filterId)) {
        applyFilter(filterId);
    } else {
        showToast('Locked', 'Buy this filter in the shop first! (50-100 coins)', 'warning');
    }
}

function applyFilter(filterId) {
    photoBoothState.currentFilter = filterId;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`.filter-btn[data-filter="${filterId}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    showToast('Filter Applied', `✨ ${getFilterName(filterId)} filter applied!`, 'info');
    playSound('click');
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
        showToast('Locked', 'Buy this frame in the shop first! (75-100 coins)', 'warning');
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
    
    showToast('Frame Applied', `🖼️ ${getFrameName(frameId)} frame applied to strip!`, 'info');
    playSound('click');
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
    
    showToast('Edits Reset', '✨ All editing tools have been reset.', 'info');
    playSound('click');
}

// ========== STICKER FUNCTIONS ==========
function selectPhotoForEditing(photoIndex) {
    if (!photoBoothState.photos[photoIndex]) {
        showToast('No Photo', 'No photo in this slot yet! Take photos first.', 'warning');
        return;
    }
    
    photoBoothState.selectedPhotoIndex = photoIndex;
    
    for (let i = 0; i < 4; i++) {
        const photoDiv = document.getElementById(`strip-photo-${i}`);
        if (photoDiv) {
            if (i === photoIndex) {
                photoDiv.style.boxShadow = '0 0 0 3px #ffb8d1, 0 0 0 6px white';
                photoDiv.style.transform = 'scale(1.02)';
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
    
    showToast('Photo Selected', `📸 Selected Photo ${photoIndex + 1} for editing`, 'info');
    playSound('click');
}

function addSticker(emoji) {
    if (photoBoothState.selectedPhotoIndex === -1) {
        showToast('Select Photo', 'Click on a photo first to add stickers!', 'warning');
        return;
    }
    
    if (!photoBoothState.photos[photoBoothState.selectedPhotoIndex]) {
        showToast('No Photo', 'No photo in this slot! Take photos first.', 'warning');
        return;
    }
    
    photoBoothState.stickers[photoBoothState.selectedPhotoIndex].push({
        type: 'emoji',
        emoji: emoji,
        x: Math.random() * 700 + 80,
        y: Math.random() * 500 + 70,
        size: 55,
        rotation: Math.random() * 30 - 15
    });
    
    updatePhotoWithStickers();
    showToast('Sticker Added', `✨ Sticker ${emoji} added to Photo ${photoBoothState.selectedPhotoIndex + 1}!`, 'success');
    playSound('click');
}

function updatePhotoWithStickers() {
    if (photoBoothState.selectedPhotoIndex === -1) return;
    if (!photoBoothState.photos[photoBoothState.selectedPhotoIndex]) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 867;
    canvas.height = 647;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        photoBoothState.stickers[photoBoothState.selectedPhotoIndex].forEach(sticker => {
            ctx.save();
            ctx.translate(sticker.x, sticker.y);
            ctx.rotate(sticker.rotation * Math.PI / 180);
            
            if (sticker.type === 'emoji') {
                ctx.font = `${sticker.size}px "Segoe UI Emoji", "Apple Color Emoji"`;
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
        
        const slot = document.getElementById(`strip-photo-${photoBoothState.selectedPhotoIndex}`);
        if (slot) {
            slot.style.backgroundImage = `url(${canvas.toDataURL('image/jpeg', 0.95)})`;
        }
        
        photoBoothState.photosWithStickers[photoBoothState.selectedPhotoIndex] = canvas.toDataURL('image/jpeg', 0.95);
    };
    img.src = photoBoothState.photos[photoBoothState.selectedPhotoIndex];
}

function clearStickersOnSelectedPhoto() {
    if (photoBoothState.selectedPhotoIndex === -1) {
        showToast('Select Photo', 'Select a photo first', 'warning');
        return;
    }
    
    photoBoothState.stickers[photoBoothState.selectedPhotoIndex] = [];
    
    if (photoBoothState.photos[photoBoothState.selectedPhotoIndex]) {
        const slot = document.getElementById(`strip-photo-${photoBoothState.selectedPhotoIndex}`);
        if (slot) {
            slot.style.backgroundImage = `url(${photoBoothState.photos[photoBoothState.selectedPhotoIndex]})`;
        }
        photoBoothState.photosWithStickers[photoBoothState.selectedPhotoIndex] = photoBoothState.photos[photoBoothState.selectedPhotoIndex];
    }
    
    showToast('Stickers Cleared', `🗑️ All stickers cleared from Photo ${photoBoothState.selectedPhotoIndex + 1}`, 'info');
    playSound('click');
}

// ========== CAMERA FUNCTIONS ==========
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } 
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
            showToast('Camera Ready', 'Camera started! Mirror view enabled.', 'success');
        };
    } catch (err) {
        console.error('Camera error:', err);
        const statusEl = document.getElementById('camera-status');
        if (statusEl) {
            statusEl.textContent = '❌ Camera access denied';
            statusEl.style.background = 'rgba(255, 107, 107, 0.9)';
        }
        showToast('Camera Access', 'Please allow camera access to use the photo booth.', 'error');
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
        showToast('Camera Stopped', 'Camera has been stopped.', 'info');
    }
}

// ========== PHOTO STRIP FUNCTIONS ==========
function startPhotoStrip() {
    const video = document.getElementById('video');
    if (!video || !video.srcObject) {
        showToast('Start Camera', 'Start camera first!', 'error');
        return;
    }
    
    if (photoBoothState.capturing) {
        showToast('Already Capturing', 'Already capturing photos!', 'warning');
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
    playSound('countdown');
    
    const timer = setInterval(() => {
        count--;
        countdown.textContent = count;
        playSound('countdown');
        
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
    
    canvas.width = 867;
    canvas.height = 647;
    
    let filterString = '';
    filterString += `brightness(${photoBoothState.editingTools.brightness}%) `;
    filterString += `contrast(${photoBoothState.editingTools.contrast}%) `;
    
    if (photoBoothState.editingTools.sharpness > 100) {
        filterString += `contrast(${photoBoothState.editingTools.sharpness}%) `;
    }
    filterString += `blur(${photoBoothState.editingTools.blur}px) `;
    
    switch(photoBoothState.currentFilter) {
        case 'grayscale': filterString += 'grayscale(100%)'; break;
        case 'sepia': filterString += 'sepia(100%)'; break;
        case 'pink': filterString += 'hue-rotate(320deg) saturate(150%) brightness(105%)'; break;
        case 'purple': filterString += 'hue-rotate(280deg) saturate(150%) brightness(105%)'; break;
        case 'warm': filterString += 'sepia(30%) brightness(110%) contrast(105%)'; break;
        default: break;
    }
    
    ctx.filter = filterString;
    
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    photoBoothState.photos.push(imgData);
    photoBoothState.photosWithStickers.push(imgData);
    
    const slot = document.getElementById(`strip-photo-${photoBoothState.currentSlot}`);
    if (slot) {
        slot.style.backgroundImage = `url(${imgData})`;
        slot.innerHTML = '';
        slot.classList.remove('empty');
        slot.classList.add('filled');
        
        slot.onclick = (function(index) {
            return function() { selectPhotoForEditing(index); };
        })(photoBoothState.currentSlot);
    }
    
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
        videoContainer.style.animation = 'cameraFlash 0.3s ease';
        setTimeout(() => {
            videoContainer.style.animation = '';
        }, 300);
    }
    
    playSound('shutter');
}

function finishPhotoStrip() {
    photoBoothState.capturing = false;
    
    const saveBtn = document.getElementById('save-strip-btn');
    if (saveBtn) {
        saveBtn.disabled = false;
    }
    
    const infoDiv = document.getElementById('selected-photo-info');
    if (infoDiv) {
        infoDiv.innerHTML = `<span class="selected-photo-indicator">🎉 4 photos taken! Click "Save to Gallery" button below!</span>`;
    }
    
    showToast('Photos Ready', '🎞️ 4 photos taken! Click "Save to Gallery" button!', 'success');
    createConfetti();
    playSound('success');
}

// ========== SAVE PHOTO STRIP ==========
function savePhotoStrip() {
    if (photoBoothState.photos.length === 0) {
        showToast('No Photos', 'Take some photos first before saving!', 'warning');
        return;
    }
    
    if (photoBoothState.photos.length < 4) {
        showToast('Incomplete', `Need 4 photos to save. You have ${photoBoothState.photos.length}.`, 'warning');
        return;
    }
    
    showProgressToast('Saving to Gallery', 'Preparing your photo strip...');
    updateProgressToast(5, 'Starting...');
    
    const saveBtn = document.getElementById('save-strip-btn');
    if (saveBtn) saveBtn.disabled = true;
    
    const stripCanvas = document.getElementById('strip-canvas');
    if (!stripCanvas) {
        showToast('Error', 'Canvas not found. Please refresh.', 'error');
        return;
    }
    
    const ctx = stripCanvas.getContext('2d');
    
    const stripWidth = 1000;
    const stripHeight = 3000;
    const photoWidth = 867;
    const photoHeight = 647;
    const startX = (stripWidth - photoWidth) / 2;
    const startY = 80;
    const spacing = 60;
    
    stripCanvas.width = stripWidth;
    stripCanvas.height = stripHeight;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, stripWidth, stripHeight);
    
    updateProgressToast(15, 'Loading your photos...');
    
    let loadedCount = 0;
    const totalPhotos = photoBoothState.photos.length;
    
    for (let i = 0; i < totalPhotos; i++) {
        const photoData = photoBoothState.photos[i];
        const y = startY + i * (photoHeight + spacing);
        
        const img = new Image();
        img.onload = (function(index, yPos) {
            return function() {
                ctx.drawImage(img, startX, yPos, photoWidth, photoHeight);
                loadedCount++;
                const progress = 15 + Math.floor((loadedCount / totalPhotos) * 45);
                updateProgressToast(progress, `Adding photo ${index + 1} of ${totalPhotos}...`);
                
                if (loadedCount === totalPhotos) {
                    updateProgressToast(65, 'Applying effects...');
                    
                    if (photoBoothState.currentFrame !== 'none') {
                        applySimpleFrame(ctx, stripWidth, stripHeight);
                    }
                    
                    updateProgressToast(75, 'Compressing image...');
                    const finalImage = stripCanvas.toDataURL('image/jpeg', 0.7);
                    
                    updateProgressToast(80, 'Loading your gallery...');
                    
                    let existingPhotos = [];
                    try {
                        const saved = localStorage.getItem('matchAndSnap');
                        if (saved) {
                            const parsed = JSON.parse(saved);
                            if (parsed.photos && Array.isArray(parsed.photos)) {
                                existingPhotos = parsed.photos;
                            }
                        }
                    } catch(e) {}
                    
                    const cleanPhoto = {
                        id: Date.now(),
                        data: finalImage,
                        filter: String(photoBoothState.currentFilter || 'normal'),
                        frame: String(photoBoothState.currentFrame || 'none'),
                        date: new Date().toLocaleString(),
                        coins: 0
                    };
                    
                    existingPhotos.unshift(cleanPhoto);
                    
                    if (existingPhotos.length > 10) {
                        existingPhotos = existingPhotos.slice(0, 10);
                    }
                    
                    const saveData = {
                        coins: (gameState && gameState.coins) ? gameState.coins : 0,
                        unlockedItems: (gameState && gameState.unlockedItems) ? gameState.unlockedItems : ['normal', 'none'],
                        photos: existingPhotos,
                        avatar: (gameState && gameState.avatar) ? gameState.avatar : '👧',
                        achievements: (gameState && gameState.achievements) ? gameState.achievements : {}
                    };
                    
                    updateProgressToast(90, 'Saving to storage...');
                    
                    try {
                        localStorage.setItem('matchAndSnap', JSON.stringify(saveData));
                        
                        if (gameState) gameState.photos = existingPhotos;
                        
                        updateProgressToast(100, 'Complete!');
                        
                        setTimeout(() => {
                            closeProgressToast();
                            showToast('Success!', 'Your photo strip has been saved to the gallery!', 'success', 2500);
                            playSound('success');
                            
                            setTimeout(() => {
                                window.location.href = 'gallery.html';
                            }, 1500);
                        }, 500);
                        
                    } catch(e) {
                        closeProgressToast();
                        showToast('Storage Full', 'Your gallery is full. Please clear some old photos first.', 'error');
                        if (saveBtn) saveBtn.disabled = false;
                    }
                }
            };
        })(i, y);
        
        img.onerror = function() { 
            loadedCount++;
        };
        img.src = photoData;
    }
}

function applySimpleFrame(ctx, width, height) {
    const frameType = photoBoothState.currentFrame;
    
    switch(frameType) {
        case 'polaroid':
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#999';
            ctx.font = 'bold 16px "Quicksand"';
            ctx.fillText('🌸 Match & Snap', width/2 - 80, height - 30);
            break;
        case 'film':
            ctx.fillStyle = '#ffd700';
            for (let i = 0; i < 45; i++) {
                ctx.beginPath();
                ctx.arc(25, 30 + i * 70, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(width - 25, 30 + i * 70, 5, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        case 'hearts':
            ctx.font = '40px "Segoe UI Emoji"';
            ctx.fillStyle = '#ff6b8a';
            ctx.fillText('❤️', 30, 60);
            ctx.fillText('❤️', width - 80, 60);
            ctx.fillText('❤️', 30, height - 40);
            ctx.fillText('❤️', width - 80, height - 40);
            break;
        case 'flowers':
            ctx.font = '40px "Segoe UI Emoji"';
            ctx.fillStyle = '#ffb8d1';
            ctx.fillText('🌸', 30, 60);
            ctx.fillText('🌸', width - 80, 60);
            ctx.fillText('🌸', 30, height - 40);
            ctx.fillText('🌸', width - 80, height - 40);
            break;
        case 'stars':
            ctx.font = '40px "Segoe UI Emoji"';
            ctx.fillStyle = '#ffd700';
            ctx.fillText('⭐', 30, 60);
            ctx.fillText('⭐', width - 80, 60);
            ctx.fillText('⭐', 30, height - 40);
            ctx.fillText('⭐', width - 80, height - 40);
            break;
    }
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

const flashStyle = document.createElement('style');
flashStyle.textContent = `
    @keyframes cameraFlash {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; background: white; }
    }
    @keyframes confettiFall {
        to { transform: translateY(100vh) rotate(720deg); }
    }
`;
document.head.appendChild(flashStyle);

window.savePhotoStrip = savePhotoStrip;