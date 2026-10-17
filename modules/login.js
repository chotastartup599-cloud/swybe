// ==========================================
// 🔐 LOGIN MODULE (Appwrite - Guest Mode)
// ==========================================

let currentUser = null;
let isGuest = false;

async function initLogin() {
    try {
        // Check if user is already logged in
        currentUser = await account.get();
        updateAuthUI(currentUser, false);
    } catch (error) {
        // No session found, create anonymous session (Guest)
        try {
            await account.createAnonymousSession();
            currentUser = await account.get();
            isGuest = true;
            updateAuthUI(currentUser, true);
            console.log("Anonymous session created");
        } catch (err) {
            console.log("Auth Error:", err);
            updateAuthUI(null, false);
        }
    }
}

function updateAuthUI(user, guest) {
    const authArea = document.getElementById("authArea");
    if (!authArea) return;
    
    if (user) {
        authArea.innerHTML = `
            <div class="user-info">
                <div class="user-avatar" style="background:#FF0055; display:flex; justify-content:center; align-items:center; font-size:16px;">👤</div>
                <span class="user-name">${guest ? 'Guest' : user.name}</span>
            </div>
        `;
    } else {
        authArea.innerHTML = `<button class="login-btn" id="loginBtn" onclick="initLogin()">Login</button>`;
    }
}

// Start checking session on load
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initLogin, 500);
});
// ===== LOGOUT FUNCTION =====
window.logout = async function() {
    try {
        await account.deleteSession('current');
        currentUser = null;
        isGuest = false;
        updateAuthUI(null, false);
        showToast("Logged out successfully");
        showScreen('feed'); // Wapas home par bhejo
    } catch (error) {
        console.error("Logout error:", error);
        showToast("Logout failed");
    }
};
