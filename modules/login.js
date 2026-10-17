// ==========================================
// 🔐 LOGIN MODULE - Appwrite (Google + Guest)
// ==========================================

let currentUser = null;
let isGuest = false;

// ===== INITIALIZE LOGIN (Page Load par chalta hai) =====
async function initLogin() {
    try {
        // Check if user is already logged in (Google or Guest)
        currentUser = await account.get();
        
        // Check karo ki yeh Guest user hai ya real user (Anonymous users ke paas email nahi hoti)
        isGuest = !currentUser.email; 
        
        updateAuthUI(currentUser, isGuest);
    } catch (error) {
        // Agar koi session nahi hai, toh Login button dikhao
        currentUser = null;
        updateAuthUI(null, false);
    }
}

// ===== UPDATE UI (Top Bar Me Naam/Photo Dikhana) =====
function updateAuthUI(user, guest) {
    const authArea = document.getElementById("authArea");
    if (!authArea) return;
    
    if (user) {
        // User logged in hai
        const displayName = guest ? 'Guest' : user.name.split(" ")[0];
        
        // Agar Google user hai toh photo dikhao, warna Emoji
        const avatarHTML = user.prefs && user.prefs.photoUrl 
            ? `<img src="${user.prefs.photoUrl}" class="user-avatar" style="border:2px solid #FF0055;">`
            : `<div class="user-avatar" style="background:#FF0055; display:flex; justify-content:center; align-items:center; font-size:14px;">👤</div>`;

        authArea.innerHTML = `
            <div class="user-info" onclick="showScreen('profile')">
                ${avatarHTML}
                <span class="user-name">${displayName}</span>
            </div>
        `;
    } else {
        // User logged out hai
        authArea.innerHTML = `<button class="login-btn" id="loginBtn" onclick="openLoginModal()">Login</button>`;
    }
}

// ===== OPEN LOGIN MODAL =====
window.openLoginModal = function() {
    let modal = document.getElementById("loginModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "loginModal";
        modal.className = "login-modal";
        document.getElementById("app").appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="login-box">
            <button class="login-close" onclick="closeLoginModal()">✕</button>
            <h2 class="login-title">Welcome to Swybe</h2>
            <p class="login-subtitle">Apni padhai shuru karne ke liye login karein</p>
            
            <button class="login-option google-btn" onclick="signInWithGoogle()">
                <span class="google-icon">🔵</span>
                <span>Continue with Google</span>
            </button>
            
            <button class="login-option guest-btn" onclick="continueAsGuest()">
                <span class="guest-icon">👤</span>
                <span>Continue as Guest</span>
            </button>
            
            <p class="login-note">Guest mode me aap videos dekh sakte hain, par upload aur save karne ke liye login zaroori hai.</p>
        </div>
    `;
    
    modal.style.display = "flex";
};

// ===== CLOSE LOGIN MODAL =====
window.closeLoginModal = function() {
    const modal = document.getElementById("loginModal");
    if (modal) modal.style.display = "none";
};

// ===== 1. GOOGLE LOGIN =====
window.signInWithGoogle = function() {
    // Appwrite Redirect method
    account.createOAuth2Session(
        'google',
        window.location.href, // Success ke baad wapas isi page par aayega
        window.location.href  // Fail hone par bhi isi page par
    );
};

// ===== 2. GUEST LOGIN =====
window.continueAsGuest = async function() {
    try {
        await account.createAnonymousSession();
        currentUser = await account.get();
        isGuest = true;
        closeLoginModal();
        updateAuthUI(currentUser, true);
        showToast("👤 Guest mode activated");
    } catch (error) {
        console.error("Guest Login Error:", error);
        showToast("❌ Guest login failed.");
    }
};

// ===== 3. LOGOUT =====
window.logout = async function() {
    try {
        await account.deleteSession('current');
        currentUser = null;
        isGuest = false;
        updateAuthUI(null, false);
        showToast("Logged out successfully");
        showScreen('feed'); // Wapas home bhejo
    } catch (error) {
        console.error("Logout error:", error);
        showToast("Logout failed");
    }
};

// ===== AUTO START ON PAGE LOAD =====
document.addEventListener("DOMContentLoaded", () => {
    // Thoda delay taaki Appwrite SDK load ho jaye
    setTimeout(initLogin, 500);
});
