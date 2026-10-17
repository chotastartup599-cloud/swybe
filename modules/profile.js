// ==========================================
// 👤 PROFILE MODULE - Appwrite Version
// ==========================================

window.loadProfile = async function() {
    const screen = document.getElementById("screen-profile");
    
    // Loading state
    screen.innerHTML = `<div style="text-align:center; padding:50px; color:#666;">Loading Profile...</div>`;

    try {
        const user = await account.get();
        let userPosts = [];
        
        try {
            // User ke khud ke posts fetch karo
            const postsRes = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [
                    Appwrite.Query.equal('creatorId', user.$id),
                    Appwrite.Query.orderDesc('$createdAt')
                ]
            );
            userPosts = postsRes.documents;
        } catch(e) {
            console.log("No posts found or error fetching");
        }

        // ⚠️ APNA ADMIN EMAIL YAHAN DAALO
        const ADMIN_EMAIL = "chotastartup599@gmail.com"; 
        // Appwrite me email check (Guest user ke paas email nahi hoti abhi)
        const isAdmin = (user.email === ADMIN_EMAIL) || true; // Abhi testing ke liye sabko admin dikha rahe hain

        // Render UI
        screen.innerHTML = `
            <div class="profile-container">
                <div class="profile-header">
                    <div class="profile-avatar">
                        ${user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                    </div>
                    <div class="profile-stats">
                        <div class="stat-item"><strong>${userPosts.length}</strong><span>Posts</span></div>
                        <div class="stat-item"><strong>0</strong><span>Followers</span></div>
                        <div class="stat-item"><strong>0</strong><span>Following</span></div>
                    </div>
                </div>
                
                <div class="profile-info">
                    <h2>${user.name || 'Guest User'}</h2>
                    <p>${user.email || 'Student at Swybe'}</p>
                    
                    <div style="display:flex; gap:10px; margin-top:10px;">
                        <button class="edit-profile-btn" onclick="logout()">Logout</button>
                        ${isAdmin ? `<button class="edit-profile-btn" style="background:#FF0055; color:#fff;" onclick="showScreen('admin')">🛡️ Admin Panel</button>` : ''}
                    </div>
                </div>
                
                <div class="profile-tabs">
                    <button class="tab-btn active" data-tab="posts" onclick="switchProfileTab('posts')">My Posts</button>
                    <button class="tab-btn" data-tab="saved" onclick="switchProfileTab('saved')">Saved 🔖</button>
                </div>
                
                <div class="profile-content" id="profileContent">
                    <!-- Grid will load here -->
                </div>
            </div>
        `;
        
        // Default Tab: My Posts
        window.switchProfileTab('posts', userPosts);

    } catch (error) {
        console.error("Profile Error:", error);
        // Agar login nahi hai
        screen.innerHTML = `
            <div class="placeholder">
                <div class="icon">🔒</div>
                <h2>Not Logged In</h2>
                <p>Please login to see your profile.</p>
                <button class="login-btn" style="margin-top:20px;" onclick="initLogin()">Login</button>
            </div>
        `;
    }
};

// ===== TAB SWITCHER =====
window.switchProfileTab = async function(tabName, postsData = null) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) btn.classList.add('active');
    });
    
    const content = document.getElementById('profileContent');
    content.innerHTML = "";
    
    if (tabName === 'saved') {
        content.innerHTML = `<div style="text-align:center; color:#666; margin-top:30px;">Saved section coming soon!</div>`;
        return;
    }

    // Load Posts Grid
    if (!postsData) {
        try {
            const user = await account.get();
            const postsRes = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
                Appwrite.Query.equal('creatorId', user.$id)
            ]);
            postsData = postsRes.documents;
        } catch(e) { postsData = []; }
    }

    if (postsData.length === 0) {
        content.innerHTML = `<div style="text-align:center; color:#666; margin-top:30px;">No posts yet. Upload something!</div>`;
        return;
    }

    const grid = document.createElement('div');
    grid.className = "profile-grid";
    
    postsData.forEach(p => {
        const item = document.createElement('div');
        item.className = "grid-item";
        // Agar video hai toh play icon, image hai toh image thumbnail
        item.innerHTML = p.mediaUrl ? `<img src="${p.mediaUrl}" style="width:100%; height:100%; object-fit:cover;">` : `<div class="grid-placeholder">📝</div>`;
        grid.appendChild(item);
    });
    
    content.appendChild(grid);
};
