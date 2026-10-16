// ==========================================
// 🔐 LOGIN MODULE - Google Auth + Guest Mode
// ==========================================

let currentUser = null;
let isGuest = false;

// ===== INIT LOGIN =====
function initLogin() {
    if (!CONFIG.firebase.enabled) return;
    
    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();
    
    // Check existing auth
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            isGuest = false;
            updateAuthUI(user);
            saveUserToFirestore(user);
        } else {
            currentUser = null;
            if (localStorage.getItem("swybe_guest") === "true") {
                isGuest = true;
                updateAuthUI(null, true);
            } else {
                updateAuthUI(null, false);
            }
        }
    });
    
    // Login button
    document.addEventListener("click", (e) => {
        if (e.target.id === "loginBtn" || e.target.closest("#loginBtn")) {
            openLoginModal();
        }
    });
}

// ===== OPEN LOGIN MODAL =====
function openLoginModal() {
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
            <p class="login-subtitle">Login karo apni padhai shuru karne ke liye</p>
            
            <button class="login-option google-btn" onclick="signInWithGoogle()">
                <span class="google-icon">🔵</span>
                <span>Continue with Google</span>
            </button>
            
            <button class="login-option guest-btn" onclick="continueAsGuest()">
                <span class="guest-icon">👤</span>
                <span>Continue as Guest</span>
            </button>
            
            <p class="login-note">Guest mode me tum dekh sakte ho, lekin like/save ke liye login zaroori hai.</p>
        </div>
    `;
    
    modal.style.display = "flex";
}

// ===== CLOSE LOGIN MODAL =====
window.closeLoginModal = function() {
    const modal = document.getElementById("loginModal");
    if (modal) modal.style.display = "none";
};

// ===== SIGN IN WITH GOOGLE =====
window.signInWithGoogle = function() {
    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(provider)
        .then((result) => {
            closeLoginModal();
            showToast("✅ Welcome " + result.user.displayName);
            // Ask class after login
            setTimeout(() => openClassModal(), 800);
        })
        .catch((err) => {
            showToast("⚠️ Login failed: " + err.message);
        });
};

// ===== CONTINUE AS GUEST =====
window.continueAsGuest = function() {
    isGuest = true;
    localStorage.setItem("swybe_guest", "true");
    closeLoginModal();
    updateAuthUI(null, true);
    showToast("👤 Guest mode activated");
};

// ===== UPDATE AUTH UI =====
function updateAuthUI(user, guest) {
    const authArea = document.getElementById("authArea");
    if (!authArea) return;
    
    if (user) {
        // Logged in user
        authArea.innerHTML = `
            <div class="user-info" onclick="openProfileFromTop()">
                <img src="${user.photoURL || 'https://via.placeholder.com/32'}" class="user-avatar" referrerpolicy="no-referrer" alt="User">
                <span class="user-name">${(user.displayName || "User").split(" ")[0]}</span>
            </div>
        `;
    } else if (guest) {
        // Guest mode
        authArea.innerHTML = `
            <button class="login-btn" id="loginBtn">Login</button>
        `;
    } else {
        // Not logged in
        authArea.innerHTML = `
            <button class="login-btn" id="loginBtn">Login</button>
        `;
    }
}

// ===== OPEN PROFILE FROM TOP =====
window.openProfileFromTop = function() {
    showScreen('profile');
};

// ===== SAVE USER TO FIRESTORE =====
function saveUserToFirestore(user) {
    if (!window.db) return;
    
    const userRef = db.collection("users").doc(user.uid);
    userRef.get().then(doc => {
        if (!doc.exists) {
            // New user - create document
            userRef.set({
                name: user.displayName || "User",
                email: user.email || "",
                photo: user.photoURL || "",
                instagramId: "",
                bio: "",
                class: [],
                subjects: [],
                role: "audience",
                followers: 0,
                following: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Existing user - just update last login
            userRef.update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }).catch(err => console.log("Firestore error:", err));
}

// ===== OPEN CLASS MODAL (After Login) =====
window.openClassModal = function() {
    let modal = document.getElementById("classModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "classModal";
        modal.className = "login-modal";
        document.getElementById("app").appendChild(modal);
    }
    
    const classes = [6, 7, 8, 9, 10, 11, 12];
    
    modal.innerHTML = `
        <div class="login-box">
            <h2 class="login-title">Tumhari Class?</h2>
            <p class="login-subtitle">Multiple select kar sakte ho</p>
            
            <div class="class-grid">
                ${classes.map(c => `
                    <button class="class-btn" data-class="${c}">Class ${c}</button>
                `).join("")}
            </div>
            
            <button class="save-class-btn" onclick="saveClasses()">Save & Continue</button>
        </div>
    `;
    
    modal.style.display = "flex";
    
    // Class selection toggle
    modal.querySelectorAll(".class-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            btn.classList.toggle("selected");
        });
    });
};

// ===== SAVE CLASSES =====
window.saveClasses = function() {
    const selected = [];
    document.querySelectorAll(".class-btn.selected").forEach(btn => {
        selected.push(Number(btn.dataset.class));
    });
    
    if (selected.length === 0) {
        showToast("⚠️ Kam se kam 1 class select karo");
        return;
    }
    
    localStorage.setItem("swybe_classes", JSON.stringify(selected));
    
    // Save to Firestore
    if (currentUser && window.db) {
        db.collection("users").doc(currentUser.uid).update({
            class: selected
        }).catch(err => console.log("Save class error:", err));
    }
    
    const modal = document.getElementById("classModal");
    if (modal) modal.style.display = "none";
    
    showToast("✅ Classes saved!");
};

// ===== LOGOUT =====
window.logout = function() {
    if (isGuest) {
        isGuest = false;
        localStorage.removeItem("swybe_guest");
        updateAuthUI(null, false);
        showToast("Logged out");
        return;
    }
    
    firebase.auth().signOut().then(() => {
        localStorage.removeItem("swybe_guest");
        updateAuthUI(null, false);
        showToast("Logged out");
    });
};

// ===== INIT ON LOAD =====
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initLogin, 500);
});
