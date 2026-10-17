// ==========================================
// 🚀 APP CONTROLLER
// ==========================================

// ===== FIREBASE INIT =====
if (typeof CONFIG !== 'undefined' && CONFIG.firebase && CONFIG.firebase.enabled) {
    if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
}

// ===== GLOBAL STATE =====
let SOUND_ENABLED = false;
let activeVideo = "";
let activeCreator = "";

// ===== SCREEN SWITCHER =====
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    const targetScreen = document.getElementById('screen-' + screenName);
    if (targetScreen) targetScreen.classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const navItem = document.querySelector(`[data-nav="${screenName}"]`);
    if (navItem) navItem.classList.add('active');
    
    // Save current screen
    localStorage.setItem("swybe_current_screen", screenName);
    
    // Load module content
    if (screenName === 'reels' && window.loadReels) window.loadReels();
    if (screenName === 'feed' && window.loadFeed) window.loadFeed();
    if (screenName === 'profile' && window.loadProfile) window.loadProfile();
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
    if (ref.includes("facebook")) return "facebook";
    if (ref === "") return "direct";
    return "other";
}

function getSessionId() {
    let sid = localStorage.getItem("pt_session_id");
    if (!sid) {
        sid = "sess_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("pt_session_id", sid);
    }
    return sid;
}

function getUserId() {
    let uid = localStorage.getItem("pt_user_id");
    if (!uid) {
        uid = "user_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("pt_user_id", uid);
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

function sendToBackend(params) {
    if (!CONFIG || !CONFIG.backend) return;
    const url = CONFIG.backend.scriptUrl + "?" + new URLSearchParams(params).toString();
    fetch(url).catch(err => console.log("Backend error:", err));
}

function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
}

// ===== SORT BY DATE =====
function sortByDate(items) {
    return items.sort((a, b) => {
        const dateA = a.createdAt || 0;
        const dateB = b.createdAt || 0;
        return dateB - dateA;
    });
}

// ===== INIT =====
window.addEventListener("DOMContentLoaded", () => {
    // Sort videos by date
    if (typeof videoDatabase !== 'undefined') {
        sortByDate(videoDatabase);
    }
    
    // Bottom nav handlers
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            showScreen(item.dataset.nav);
        });
    });
    
    // Load last opened screen
    const lastScreen = localStorage.getItem("swybe_current_screen") || "feed";
    showScreen(lastScreen);
    
    // Auto-fill comment name
    if (localStorage.getItem("pt_name")) {
        const el = document.getElementById("cName");
        if (el) el.value = localStorage.getItem("pt_name");
    }
    if (localStorage.getItem("pt_insta")) {
        const el = document.getElementById("cInsta");
        if (el) el.value = localStorage.getItem("pt_insta");
    }
});
