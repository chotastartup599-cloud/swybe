// ==========================================
// ➕ UPLOAD MODULE (Cloudinary + Google Sheets)
// ==========================================

window.loadUpload = function() {
    const screen = document.getElementById("screen-upload");
    
    // Check if user is logged in (Firebase or Guest)
    const isGuest = localStorage.getItem("swybe_guest") === "true";
    if (!currentUser && !isGuest) {
        screen.innerHTML = `
            <div class="placeholder">
                <div class="icon">🔒</div>
                <h2>Login Required</h2>
                <p>Content upload karne ke liye login karna zaroori hai.</p>
                <button class="login-btn" style="margin-top: 20px;" onclick="openLoginModal()">Login Now</button>
            </div>
        `;
        return;
    }
    
    // Main Upload Dashboard (Reel, Story, Test ka UI)
    screen.innerHTML = `
        <div class="upload-container">
            <div class="upload-header">
                <h2>Create New Post</h2>
                <p>Choose the type of content you want to publish</p>
            </div>
            <div class="upload-grid">
                <div class="upload-card" onclick="openUploadForm('reel')">
                    <div class="card-icon">🎬</div>
                    <div class="card-content"><h3>Reel</h3><p>Short vertical video</p></div>
                </div>
                <div class="upload-card" onclick="openUploadForm('story')">
                    <div class="card-icon">📖</div>
                    <div class="card-content"><h3>Story</h3><p>Image + Text</p></div>
                </div>
                <div class="upload-card" onclick="openUploadForm('test')">
                    <div class="card-icon">🧪</div>
                    <div class="card-content"><h3>Mock Test</h3><p>MCQ based quiz</p></div>
                </div>
            </div>
        </div>
    `;
};

window.openUploadForm = function(type) {
    const screen = document.getElementById("screen-upload");
    let fileInput = (type === 'reel' || type === 'story') ? `
        <div class="form-group">
            <label>Upload Media (Required)</label>
            <div class="file-upload-box">
                <input type="file" id="uploadFile" accept="${type === 'reel' ? 'video/*' : 'image/*'}">
            </div>
        </div>` : '';

    screen.innerHTML = `
        <div class="upload-form-container">
            <div class="form-header">
                <button class="back-btn" onclick="loadUpload()">←</button>
                <h2>New ${type.toUpperCase()}</h2>
            </div>
            <div class="form-section">
                ${fileInput}
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="uploadTitle" placeholder="Enter title...">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="uploadCaption" placeholder="Write details..." rows="3"></textarea>
                </div>
            </div>
            <button class="publish-btn" onclick="submitContent('${type}')">
                <span class="btn-text">Publish ${type.toUpperCase()}</span>
            </button>
        </div>
    `;
};

// ===== SUBMIT TO CLOUDINARY + GOOGLE SHEETS =====
window.submitContent = async function(type) {
    const title = document.getElementById("uploadTitle").value;
    const caption = document.getElementById("uploadCaption").value;
    const file = document.getElementById("uploadFile")?.files[0];
    
    if (!title || !caption) return showToast("⚠️ Title/Caption zaroori hai!");
    if ((type === 'reel' || type === 'story') && !file) return showToast("⚠️ File select karo!");

    const btn = document.querySelector('.publish-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="btn-text">Uploading Media...</span>`;
    btn.disabled = true;

    try {
        // 1. Cloudinary Upload
        let mediaUrl = "";
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'swybe_upload'); // Cloudinary preset
            // Note: Agar 'auto' kaam na kare toh 'video' ya 'image' use karna
            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/okuevkuf/auto/upload`, { method: 'POST', body: formData });
            const cloudData = await cloudRes.json();
            mediaUrl = cloudData.secure_url;
        }

        // 2. Google Sheet me save karo
        btn.innerHTML = `<span class="btn-text">Saving Data...</span>`;
        const payload = {
            type: type, title: title, caption: caption, mediaUrl: mediaUrl,
            creatorName: currentUser ? currentUser.displayName : "Guest User",
            creatorEmail: currentUser ? currentUser.email : "guest@swybe.com"
        };

        await fetch(CONFIG.backend.scriptUrl + "?action=uploadPost", {
            method: "POST", body: JSON.stringify(payload)
        });

        showToast("✅ Uploaded! Waiting for Admin Approval.");
        loadUpload(); // Reset UI

    } catch (error) {
        console.error(error);
        showToast("❌ Upload failed: " + error.message);
    } finally {
        btn.disabled = false; 
        btn.innerHTML = originalText;
    }
};
