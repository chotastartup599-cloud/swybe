// ==========================================
// ➕ UPLOAD MODULE (Professional Form)
// ==========================================

window.loadUpload = function() {
    const screen = document.getElementById("screen-upload");
    const isGuest = localStorage.getItem("swybe_guest") === "true";
    
    if (!currentUser && !isGuest) {
        screen.innerHTML = `<div class="placeholder"><h2>Login Required</h2><button class="login-btn" onclick="openLoginModal()">Login</button></div>`;
        return;
    }
    
    screen.innerHTML = `
        <div class="upload-container">
            <div class="upload-header"><h2>Create New Post</h2></div>
            <div class="upload-grid">
                <div class="upload-card" onclick="openUploadForm('reel')">
                    <div class="card-icon">🎬</div><div class="card-content"><h3>Reel</h3></div>
                </div>
                <div class="upload-card" onclick="openUploadForm('story')">
                    <div class="card-icon">📖</div><div class="card-content"><h3>Story</h3></div>
                </div>
            </div>
        </div>
    `;
};

window.previewFile = function(input) {
    const display = document.getElementById('fileNameDisplay');
    if (input.files && input.files[0]) {
        display.innerHTML = `<span style="color:#4CAF50;">✅ ${input.files[0].name}</span>`;
    }
};

window.openUploadForm = function(type) {
    const screen = document.getElementById("screen-upload");
    
    screen.innerHTML = `
        <div class="upload-form-container">
            <div class="form-header">
                <button class="back-btn" onclick="loadUpload()">←</button>
                <h2>New ${type.toUpperCase()}</h2>
            </div>
            
            <div class="form-section">
                <div class="form-group">
                    <label>Upload Media (Required)</label>
                    <div class="file-upload-box">
                        <input type="file" id="uploadFile" accept="${type === 'reel' ? 'video/*' : 'image/*'}" onchange="previewFile(this)">
                        <div class="file-msg" id="fileNameDisplay">Click to browse</div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="uploadTitle" placeholder="e.g., Top 10 Current Affairs">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="uploadCaption" placeholder="Write details..." rows="3"></textarea>
                </div>
                
                <div class="form-group">
                    <label>Subject</label>
                    <select id="uploadSubject" style="width:100%; background:#111; border:1px solid #333; border-radius:8px; padding:12px; color:#fff;">
                        <option value="General">General</option>
                        <option value="Science">Science</option>
                        <option value="Maths">Maths</option>
                        <option value="Social Science">Social Science</option>
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Computer">Computer</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Tags (comma separated)</label>
                    <input type="text" id="uploadTags" placeholder="e.g., #nda, #upsc, #currentaffairs">
                </div>

                <div class="form-group">
                    <label>Target Audience (Multiple)</label>
                    <div class="checkbox-grid">
                        <label class="custom-checkbox"><input type="checkbox" value="Class 6-8"> Class 6-8</label>
                        <label class="custom-checkbox"><input type="checkbox" value="Class 9-10"> Class 9-10</label>
                        <label class="custom-checkbox"><input type="checkbox" value="Class 11-12"> Class 11-12</label>
                        <label class="custom-checkbox highlight-exam"><input type="checkbox" value="NDA"> NDA</label>
                        <label class="custom-checkbox highlight-exam"><input type="checkbox" value="UPSC"> UPSC</label>
                        <label class="custom-checkbox highlight-exam"><input type="checkbox" value="JEE/NEET"> JEE/NEET</label>
                        <label class="custom-checkbox highlight-exam"><input type="checkbox" value="SSC"> SSC</label>
                        <label class="custom-checkbox"><input type="checkbox" value="Other"> Other</label>
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
    const subject = document.getElementById("uploadSubject").value;
    const tags = document.getElementById("uploadTags").value;
    const file = document.getElementById("uploadFile")?.files[0];
    
    const selectedTargets = [];
    document.querySelectorAll('.custom-checkbox input:checked').forEach(cb => {
        selectedTargets.push(cb.value);
    });

    if (!title || !caption) return showToast("⚠️ Title/Caption zaroori hai!");
    if ((type === 'reel' || type === 'story') && !file) return showToast("⚠️ File select karo!");

    const btn = document.querySelector('.publish-btn');
    btn.innerHTML = `<span class="btn-text">Uploading...</span>`; btn.disabled = true;

    try {
        let mediaUrl = "";
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'swybe_upload'); 
            const endpoint = type === 'reel' ? 'video' : 'image';
            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/okuevkuf/${endpoint}/upload`, { method: 'POST', body: formData });
            const cloudData = await cloudRes.json();
            mediaUrl = cloudData.secure_url;
        }

        const payload = {
            type: type, title: title, caption: caption, mediaUrl: mediaUrl,
            creatorName: currentUser ? currentUser.displayName : "Guest",
            creatorEmail: currentUser ? currentUser.email : "guest@swybe.com",
            targets: selectedTargets.join(", "),
            subject: subject,
            tags: tags
        };

        await fetch(CONFIG.backend.scriptUrl + "?action=uploadPost", { method: "POST", body: JSON.stringify(payload) });
        showToast("✅ Uploaded successfully!");
        loadUpload();

    } catch (error) {
        showToast("❌ Upload failed");
    } finally {
        btn.disabled = false;
    }
};
