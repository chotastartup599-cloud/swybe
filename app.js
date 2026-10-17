// ==========================================
// 🚀 APP CONTROLLER
// ==========================================

// Global Variables
let SOUND_ENABLED = false;
let activeVideo = "";
let activeCreator = "";

// ===== SCREEN SWITCHER =====
function showScreen(screenName) {
    // Saare screens hide karo
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // Naya screen show karo
    const targetScreen = document.getElementById('screen-' + screenName);
    if (targetScreen) targetScreen.classList.add('active');
    
    // Bottom Nav update karo
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const navItem = document.querySelector(`[data-nav="${screenName}"]`);
    if (navItem) navItem.classList.add('active');
    
    // Screen ke hisaab se module load karo
    if (screenName === 'reels' && window.loadReels) window.loadReels();
    if (screenName === 'feed' && window.loadFeed) window.loadFeed();
    if (screenName === 'profile' && window.loadProfile) window.loadProfile();
    if (screenName === 'search' && window.loadSearch) window.loadSearch();
    if (screenName === 'upload' && window.loadUpload) window.loadUpload();
    if (screenName === 'tests' && window.loadTests) window.loadTests();
    if (screenName === 'admin' && window.loadAdmin) window.loadAdmin();
}

// ===== HELPER FUNCTIONS =====
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "tablet";
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle/i.test(ua)) return "mobile";
    return "desktop";
}

function getTrafficSource() {
    const ref = document.referrer.toLowerCase();
    if (ref.includes("blogger") || ref.includes("blogspot")) return "blogger";
    if (ref.includes("instagram")) return "instagram";
    if (ref.includes("whatsapp")) return "whatsapp";
    if (ref === "") return "direct";
    return "other";
}

function getUserId() {
    let uid = localStorage.getItem("swybe_uid");
    if (!uid) {
        uid = "user_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("swybe_uid", uid);
    }
    return uid;
}

function showToast(msg) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerText = msg;
    toast.style.display = "block";
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => { toast.style.display = "none"; }, 2500);
}

function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
}

// ===== INITIALIZE ON PAGE LOAD =====
window.addEventListener("DOMContentLoaded", () => {
    // Bottom nav par click events
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            showScreen(item.dataset.nav);
        });
    });
    
    // Default screen load karo
    showScreen('reels');
});
