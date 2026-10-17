// ==========================================
// 🚀 APP CONTROLLER
// ==========================================

let SOUND_ENABLED = false;

function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // Show target screen
    const targetScreen = document.getElementById('screen-' + screenName);
    if (targetScreen) targetScreen.classList.add('active');
    
    // Update Bottom Nav
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const navItem = document.querySelector(`[data-nav="${screenName}"]`);
    if (navItem) navItem.classList.add('active');

    // Save current screen so refresh keeps you here
    localStorage.setItem("swybe_current_screen", screenName);
    
    // Load modules dynamically
    if (screenName === 'reels' && window.loadReels) window.loadReels();
    if (screenName === 'feed' && window.loadFeed) window.loadFeed();
    if (screenName === 'profile' && window.loadProfile) window.loadProfile();
    if (screenName === 'search' && window.loadSearch) window.loadSearch();
    if (screenName === 'upload' && window.loadUpload) window.loadUpload();
    if (screenName === 'admin' && window.loadAdmin) window.loadAdmin();
}

function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.style.display = "block";
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => { toast.style.display = "none"; }, 2500);
}

// On Page Load
window.addEventListener("DOMContentLoaded", () => {
    // Add click listeners to bottom nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => showScreen(item.dataset.nav));
    });
    
    // Load last opened screen (Default is Feed)
    const lastScreen = localStorage.getItem("swybe_current_screen") || "feed";
    showScreen(lastScreen);
});
