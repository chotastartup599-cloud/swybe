// ==========================================
// 👤 PROFILE MODULE
// ==========================================

window.loadProfile = async function() {
    const screen = document.getElementById("screen-profile");
    screen.innerHTML = `<div style="text-align:center; padding:50px; color:#666;">Loading Profile...</div>`;

    const isGuest = localStorage.getItem("swybe_guest") === "true";
    const userName = currentUser ? currentUser.displayName : (isGuest ? "Guest User" : "Not Logged In");
    const userEmail = currentUser ? currentUser.email : "";

    // Admin Email Check
    const ADMIN_EMAIL = "chotastartup599@gmail.com"; // Tumhara email
    const isAdmin = (userEmail === ADMIN_EMAIL);

    try {
        // User ke posts fetch karo (Agar user logged in hai)
        const res = await fetch(CONFIG.backend.scriptUrl + "?action=getPosts");
        const allPosts = await res.json();
        
        // Filter posts by this user
        let myPosts = allPosts.filter(p => p.creatorEmail === userEmail || (isGuest && p.creatorName === "Guest User"));

        screen.innerHTML = `
            <div class="profile-container">
                <div class="profile-header">
                    <div class="profile-avatar">${userName.charAt(0)}</div>
                    <div class="profile-stats">
                        <div class="stat-item"><strong>${myPosts.length}</strong><span>Posts</span></div>
                        <div class="stat-item"><strong>0</strong><span>Followers</span></div>
                        <div class="stat-item"><strong>0</strong><span>Following</span></div>
                    </div>
                </div>
                <div class="profile-info">
                    <h2>${userName}</h2>
                    <p>${userEmail || 'Student at Swybe'}</p>
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <button class="edit-profile-btn" onclick="logout()">Logout</button>
                        ${isAdmin ? `<button class="edit-profile-btn" style="background:#FF0055; color:#fff;" onclick="showScreen('admin')">🛡️ Admin Panel</button>` : ''}
                    </div>
                </div>
                <div class="profile-tabs">
                    <button class="tab-btn active">My Posts</button>
                </div>
                <div class="profile-content" id="profileContent">
                    ${myPosts.length === 0 ? '<p style="text-align:center; color:#666;">No posts yet.</p>' : 
                        `<div class="profile-grid">
                            ${myPosts.map(p => `<div class="grid-item">${p.mediaUrl ? `<img src="${p.mediaUrl}" style="width:100%; height:100%; object-fit:cover;">` : '📝'}</div>`).join("")}
                        </div>`
                    }
                </div>
            </div>
        `;
    } catch (e) {
        screen.innerHTML = `<div style="color:red; text-align:center;">Error loading profile.</div>`;
    }
};
