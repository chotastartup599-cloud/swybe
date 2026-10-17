// ==========================================
// 👤 PROFILE MODULE - Stats + Saved + Posts
// ==========================================

window.loadProfile = function() {
    const screen = document.getElementById("screen-profile");
    
    // Set up basic UI structure
    screen.innerHTML = `
        <div class="profile-container">
            <div class="profile-header">
                <div class="profile-avatar" id="profileAvatar">👤</div>
                <div class="profile-stats">
                    <div class="stat-item"><strong id="statPosts">0</strong><span>Posts</span></div>
                    <div class="stat-item"><strong id="statFollowers">0</strong><span>Followers</span></div>
                    <div class="stat-item"><strong id="statFollowing">0</strong><span>Following</span></div>
                </div>
            </div>
            
            <div class="profile-info">
                <h2 id="profileName">User Name</h2>
                <p id="profileBio">Student at Swybe</p>
                <button class="edit-profile-btn" onclick="openLoginModal()">Edit Profile</button>
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
    
    // Check Auth Status
    const user = currentUser;
    
    if (user) {
        // Logged in
        document.getElementById('profileName').innerText = user.displayName || "User";
        document.getElementById('profileAvatar').innerHTML = `<img src="${user.photoURL}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        document.querySelector('.edit-profile-btn').innerText = "Logout";
        document.querySelector('.edit-profile-btn').setAttribute('onclick', 'logout()');
        
        // Fetch from Firestore (Future step)
        document.getElementById('statPosts').innerText = "0"; 
    } else {
        // Guest
        document.getElementById('profileName').innerText = "Guest User";
        document.getElementById('profileAvatar').innerHTML = "👤";
        document.getElementById('profileBio').innerText = "Login to save your progress.";
        document.querySelector('.edit-profile-btn').innerText = "Login";
    }
    
    // Default Tab
    switchProfileTab('saved');
};

// ===== TAB SWITCHER =====
window.switchProfileTab = function(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) btn.classList.add('active');
    });
    
    const content = document.getElementById('profileContent');
    content.innerHTML = "";
    
    if (tabName === 'saved') {
        loadSavedPosts(content);
    } else {
        // My Posts (Agar user logged in hai, toh Firebase se aayenge, abhi empty hai)
        content.innerHTML = `<div class="empty-state">No posts yet.</div>`;
    }
};

// ===== LOAD SAVED POSTS (LocalStorage se) =====
function loadSavedPosts(container) {
    const savedVideos = JSON.parse(localStorage.getItem("pt_saved_videos") || "[]");
    
    if (savedVideos.length === 0) {
        container.innerHTML = `<div class="empty-state">🔖 Koi saved video nahi hai.</div>`;
        return;
    }
    
    // Create Grid
    const grid = document.createElement('div');
    grid.className = "profile-grid";
    
    savedVideos.forEach(v => {
        const item = document.createElement('div');
        item.className = "grid-item";
        item.innerHTML = `
            <div class="grid-placeholder">▶</div>
        `;
        item.onclick = () => goToVideo(v.videoFile);
        grid.appendChild(item);
    });
    
    container.appendChild(grid);
}
