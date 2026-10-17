// ==========================================
// ➕ UPLOAD MODULE - Creator Interface
// ==========================================

window.loadUpload = function() {
    const screen = document.getElementById("screen-upload");
    const user = firebase.auth().currentUser;
    
    if (!user) {
        // Login nahi hai toh login screen dikhao
        screen.innerHTML = `
            <div class="placeholder">
                <div class="icon">🔒</div>
                <h2>Login Required</h2>
                <p>Content upload karne ke liye login karna zaroori hai.</p>
                <button class="login-btn" style="margin-top: 20px;" onclick="openLoginModal()">Login</button>
            </div>
        `;
        return;
    }
    
    // Main Upload UI
    screen.innerHTML = `
        <div class="upload-container">
            <h2 class="upload-title">Create New Post</h2>
            <p class="upload-subtitle">Choose what you want to upload</p>
            
            <div class="upload-grid">
                <div class="upload-card" onclick="openUploadForm('reel')">
                    <div class="upload-icon">🎬</div>
                    <h3>Reel</h3>
                    <p>Short video content</p>
                </div>
                
                <div class="upload-card" onclick="openUploadForm('story')">
                    <div class="upload-icon">📖</div>
                    <h3>Story</h3>
                    <p>Image + Text + Poll</p>
                </div>
                
                <div class="upload-card" onclick="openUploadForm('test')">
                    <div class="upload-icon">🧪</div>
                    <h3>Test</h3>
                    <p>MCQ Questions</p>
                </div>
            </div>
        </div>
    `;
};

// ===== OPEN FORM =====
window.openUploadForm = function(type) {
    const screen = document.getElementById("screen-upload");
    
    let formHTML = `
        <div class="upload-form-container">
            <div class="form-header">
                <button class="back-btn" onclick="loadUpload()">← Back</button>
                <h2>Upload ${type.charAt(0).toUpperCase() + type.slice(1)}</h2>
            </div>
    `;
    
    if (type === 'reel' || type === 'story') {
        formHTML += `
            <div class="form-group">
                <label>Select File (Video/Image)</label>
                <input type="file" id="uploadFile" accept="${type === 'reel' ? 'video/*' : 'image/*'}">
            </div>
        `;
    }
    
    formHTML += `
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="uploadTitle" placeholder="Enter title...">
            </div>
            
            <div class="form-group">
                <label>Description / Caption</label>
                <textarea id="uploadCaption" placeholder="Write details here..." rows="3"></textarea>
            </div>
            
            <div class="form-group">
                <label>Subject</label>
                <select id="uploadSubject">
                    <option value="Science">Science</option>
                    <option value="Maths">Maths</option>
                    <option value="SST">SST</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                </select>
            </div>
    `;
    
    // Agar Story hai, toh Class selection dikhao
    if (type === 'story') {
        formHTML += `
            <div class="form-group">
                <label>Target Classes (Multiple allowed)</label>
                <div class="class-checkbox-group">
                    <label><input type="checkbox" value="10"> Class 10</label>
                    <label><input type="checkbox" value="11"> Class 11</label>
                    <label><input type="checkbox" value="12"> Class 12</label>
                </div>
            </div>
        `;
    }
    
    formHTML += `
            <button class="submit-btn" onclick="submitContent('${type}')">Publish ${type.charAt(0).toUpperCase() + type.slice(1)}</button>
        </div>
    `;
    
    screen.innerHTML = formHTML;
};

// ===== SUBMIT (Mock) =====
window.submitContent = function(type) {
    const title = document.getElementById("uploadTitle").value;
    const caption = document.getElementById("uploadCaption").value;
    const file = document.getElementById("uploadFile")?.files[0];
    
    if (!title || !caption) {
        return showToast("⚠️ Title aur Description zaroori hai!");
    }
    
    if ((type === 'reel' || type === 'story') && !file) {
        return showToast("⚠️ File select karo!");
    }
    
    showToast("⏳ Uploading... (Mock)");
    
    // Abhi ke liye sirf 2 second baad success dikhayenge
    setTimeout(() => {
        showToast("✅ " + type.toUpperCase() + " Published Successfully!");
        loadUpload(); // Wapas main screen par
    }, 2000);
};
