// ==========================================
// ➕ UPLOAD MODULE (With File Preview & Validation)
// ==========================================

window.loadUpload = function() {
    const screen = document.getElementById("screen-upload");
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
    
    screen.innerHTML = `
        <div class="upload-container">
            <div class="upload-header">
                <h2>Create New Post</h2>
                <p>Choose the type of content</p>
            </div>
            <div class="upload-grid">
                <div class="upload-card reel-card" onclick="openUploadForm('reel')">
                    <div class="card-icon">🎬</div>
                    <div class="card-content"><h3>Reel</h3><p>Short video</p></div>
                </div>
                <div class="upload-card story-card" onclick="openUploadForm('story')">
                    <div class="card-icon">📖</div>
                    <div class="card-content"><h3>Story</h3><p>Image + Text</p></div>
                </div>
            </div>
        </div>
    `;
};

// ===== FILE PREVIEW LOGIC (Naya) =====
window.previewFile = function(input) {
    const display = document.getElementById('fileNameDisplay');
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        display.innerHTML = `<strong style="color:#4CAF50;">✅ ${file.name}</strong><br><span style="font-size:12px; color:#aaa;">(${sizeMB} MB)</span>`;
    } else {
        display.innerText = "Click to browse or drag file here";
    }
};

window.openUploadForm = function(type) {
    const screen = document.getElementById("screen-upload");
    
    let fileInput = (type === 'reel' || type === 'story') ? `
        <div class="form-group">
            <label>Upload Media (Required)</label>
            <div class="file-upload-box" style="border: 2px dashed #444; padding: 20px; text-align: center; border-radius: 10px; cursor: pointer;">
                <input type="file" id="uploadFile" accept="${type === 'reel' ? 'video/*' : 'image/*'}" onchange="previewFile(this)" style="opacity: 0; position: absolute; width: 100%; height: 100%; left: 0; top: 0; cursor: pointer;">
                <div class="file-msg" id="fileNameDisplay">Click to browse file</div>
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
                    <input type="text" id="uploadTitle" placeholder="e.g., Top 10 Current Affairs">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="uploadCaption" placeholder="Write details..." rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>Target Audience</label>
                    <div class="checkbox-grid">
                        <label class="custom-checkbox"><input type="checkbox" value="Class 10"> Class 10</label>
                        <label class="custom-checkbox"><input type="checkbox" value="Class 12"> Class 12</label>
                        <label class="custom-checkbox highlight-exam"><input type="checkbox" value="NDA"> NDA</label>
                        <label class="custom-checkbox highlight-exam"><input type="checkbox" value="UPSC"> UPSC</label>
                    </div>
                </div>
            </div>
            
            <button class="publish-btn" onclick="submitContent('${type}')">
                <span class="btn-text">Publish ${type.toUpperCase()}</span>
            </button>
        </div>
    `;
};

window.submitContent = async function(type) {
    const title = document.getElementById("uploadTitle").value;
    const caption = document.getElementById("uploadCaption").value;
    const fileInput = document.getElementById("uploadFile");
    const file = fileInput?.files[0];
    
    const selectedTargets = [];
    document.querySelectorAll('.custom-checkbox input:checked').forEach(cb => {
        selectedTargets.push(cb.value);
    });

    // Validation
    if (!title || !caption) return showToast("⚠️ Title aur Description zaroori hai!");
    if ((type === 'reel' || type === 'story') && !file) return showToast("⚠️ File select karo!");

    const btn = document.querySelector('.publish-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="btn-text">Uploading (0%)...</span>`;
    btn.disabled = true;

    try {
        let mediaUrl = "";
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'swybe_upload'); 
            
            const endpoint = type === 'reel' ? 'video' : 'image';
            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/okuevkuf/${endpoint}/upload`, { 
                method: 'POST', body: formData 
            });
            
            const cloudData = await cloudRes.json();
            if (cloudData.error) throw new Error(cloudData.error.message);
            mediaUrl = cloudData.secure_url;
        }

        btn.innerHTML = `<span class="btn-text">Saving Data...</span>`;
        const payload = {
            type: type, 
            title: title, 
            caption: caption, 
            mediaUrl: mediaUrl,
            creatorName: currentUser ? currentUser.displayName : "Guest User",
            creatorEmail: currentUser ? currentUser.email : "guest@swybe.com",
            targets: selectedTargets.join(", ")
        };

        await fetch(CONFIG.backend.scriptUrl + "?action=uploadPost", {
            method: "POST", body: JSON.stringify(payload)
        });

        showToast("✅ Uploaded! Waiting for Admin Approval.");
        loadUpload();

    } catch (error) {
        console.error("Upload Error:", error);
        showToast("❌ Upload failed: " + error.message);
    } finally {
        btn.disabled = false; 
        btn.innerHTML = originalText;
    }
};
