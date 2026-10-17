// ==========================================
// 🔐 LOGIN MODULE (Firebase Auth)
// ==========================================

let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
    // Firebase Init (Agar pehle se init nahi hai)
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Check Login State
    firebase.auth().onAuthStateChanged((user) => {
        currentUser = user;
        updateAuthUI(user);
    });
});

// ===== UPDATE UI (Top Bar) =====
function updateAuthUI(user, isGuest = false) {
    const authArea = document.getElementById("authArea");
    if (!authArea) return;

    if (user) {
        // Google User
        authArea.innerHTML = `
            <div class="user-info" onclick="showScreen('profile')">
                <img src="${user.photoURL || 'https://via.placeholder.com/32'}" class="user-avatar">
                <span class="user-name">${user.displayName.split(" ")[0]}</span>
            </div>`;
    } else if (isGuest || localStorage.getItem("swybe_guest") === "true") {
        // Guest User
        authArea.innerHTML = `
            <div class="user-info" onclick="showScreen('profile')">
                <div class="user-avatar" style="background:#FF0055; display:flex; justify-content:center; align-items:center;">👤</div>
                <span class="user-name">Guest</span>
            </div>`;
    } else {
        // Logged Out
        authArea.innerHTML = `<button class="login-btn" onclick="openLoginModal()">Login</button>`;
    }
}

// ===== OPEN LOGIN MODAL =====
window.openLoginModal = function() {
    let modal = document.getElementById("loginModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "loginModal"; 
        modal.className = "login-modal";
        modal.innerHTML = `
            <div class="login-box">
                <button class="login-close" onclick="closeLoginModal()">✕</button>
                <h2 class="login-title">Welcome to Swybe</h2>
                <p class="login-subtitle">Padhai shuru karne ke liye login karein</p>
                <button class="login-option google-btn" id="googleLoginBtn">🔵 Continue with Google</button>
                <button class="login-option guest-btn" id="guestLoginBtn">👤 Continue as Guest</button>
            </div>`;
        document.getElementById("app").appendChild(modal);
        
        // Google Login Click
        document.getElementById("googleLoginBtn").onclick = () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider)
                .then((res) => { 
                    closeLoginModal(); 
                    showToast("✅ Welcome " + res.user.displayName); 
                })
                .catch((err) => showToast("❌ Login failed: " + err.message));
        };
        
        // Guest Login Click
        document.getElementById("guestLoginBtn").onclick = () => {
            localStorage.setItem("swybe_guest", "true"); 
            closeLoginModal(); 
            updateAuthUI(null, true);
            showToast("👤 Guest mode activated");
        };
    }
    modal.style.display = "flex";
};

window.closeLoginModal = function() { 
    document.getElementById("loginModal").style.display = "none"; 
};

window.logout = function() { 
    firebase.auth().signOut(); 
    localStorage.removeItem("swybe_guest"); 
    window.location.reload(); 
};
