// ==========================================
// ➕ UPLOAD MODULE - Professional Creator Interface
// ==========================================

window.loadUpload = function() {
    const screen = document.getElementById("screen-upload");
    const user = typeof currentUser !== 'undefined' ? currentUser : null;
    
    if (!user) {
        screen.innerHTML = `
            <div class="placeholder">
                <div class="icon">🔒</div>
                <h2>Login Required</h2>
                <p>Content upload karne ke liye login karna zaroori hai.</p>
                <button class="login-btn" style="margin-top: 20px; padding: 12px 30px;" onclick="openLoginModal()">Login Now</button>
            </div>
        `;
        return;
    }
    
    // Main Upload Dashboard
    screen.innerHTML = `
        <div class="upload-container">
            <div class="upload-header">
                <h2>Create New Post</h2>
                <p>Choose the type of content you want to publish</p>
            </div>
            
            <div class="upload-grid">
                <div class="upload-card reel-card" onclick="openUploadForm('reel')">
                    <div class="card-icon">🎬</div>
                    <div class="card-content">
                        <h3>Reel</h3>
                        <p>Short vertical video (15-60s)</p>
                    </div>
                    <div class="card-arrow">→</div>
                </div>
                
                <div class="upload-card story-card" onclick="openUploadForm('story')">
                    <div class="card-icon">📖</div>
                    <div class="card-content">
                        <h3>Story</h3>
                        <p>Image + Text + Interactive Poll</p>
                    </div>
                    <div class="card-arrow">→</div>
                </div>
                
                <div class="upload-card test-card" onclick="openUploadForm('test')">
                    <div class="card-icon">🧪</div>
                    <div class="card-content">
                        <h3>Mock Test</h3>
                        <p>MCQ based quiz</p>
                    </div>
                    <div class="card-arrow">→</div>
                </div>
            </div>
            
            <div class="info-banner">
                <span>💡</span>
                <p>All uploads go through Admin approval to maintain quality.</p>
            </div>
        </div>
    `;
};

// ===== OPEN FORM =====
window.openUploadForm = function(type) {
    const screen = document.getElementById("screen-upload");
    
    let fileInput = (type === 'reel' || type === 'story') ? `
        <div class="form-group">
            <label>Upload Media (Required)</label>
            <div class="file-upload-box">
                <input type="file" id="uploadFile" accept="${type === 'reel' ? 'video/*' : 'image/*'}">
                <div class="file-msg">Click to browse or drag file here</div>
            </div>
        </div>
    ` : '';

    let formHTML = `
        <div class="upload-form-container">
            <div class="form-header">
                <button class="back-btn" onclick="loadUpload()">←</button>
                <h2>New ${type.charAt(0).toUpperCase() + type.slice(1)}</h2>
            </div>

            <div class="form-section">
                <h3 class="section-title">1. Basic Info</h3>
                ${fileInput}
                
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="uploadTitle" placeholder="e.g., Top 10 Current Affairs of 2026">
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="uploadCaption" placeholder="Write a brief description..." rows="3"></textarea>
                </div>
            </div>

            <div class="form-section">
                <h3 class="section-title">2. Categorization</h3>
                <div class="form-group">
                    <label>Subject</label>
                    <select id="uploadSubject">
                        <option value="Science">Science</option>
                        <option value="Maths">Maths</option>
                        <option value="SST">Social Science (SST)</option>
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Computer">Computer</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
    `;
    
    // Target Audience (Classes + Competitive Exams)
    formHTML += `
                <div class="form-group">
                    <label>Target Audience (Select multiple)</label>
                    <div class="checkbox-grid">
                        <label class="custom-checkbox"><input type="checkbox" value="Class 9"> Class 9</label>
                        <label class="custom-checkbox"><input type="checkbox" value="Class 10"> Class 10</label>
                        <label class="custom-checkbox"><input type="checkbox" value="Class 11"> Class 11</label>
                        <label class="custom-checkbox"><input type="checkbox" value="Class 12"> Class 12</label>
                        <label class="custom-checkbox highlight-exam"><input type="checkbox" value="NDA"> NDA</label>
                        <label class="custom-checkbox highlight-exam"><input type="checkbox" value="UPSC"> UPSC</label>
                        <label class="custom-checkbox highlight-exam"><input type="checkbox" value="JEE/NEET"> JEE/NEET</label>
                        <label class="custom-checkbox highlight-exam"><input type="checkbox" value="SSC"> SSC</label>
                    </div>
                </div>
            </div>
    `;
    
    // Story specific fields
    if (type === 'story') {
        formHTML += `
            <div class="form-section">
                <h3 class="section-title">3. Story Settings</h3>
                <div class="form-group">
                    <label>Story Expiry</label>
                    <select id="storyExpiry">
                        <option value="24h">24 Hours</option>
                        <option value="7d">7 Days</option>
                        <option value="permanent">Permanent</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Add Poll? (Optional)</label>
                    <input type="text" id="pollQuestion" placeholder="Question (e.g., Kaun sa option sahi hai?)">
                    <div style="display:flex; gap:10px; margin-top:8px;">
                        <input type="text" id="pollOpt1" placeholder="Option A">
                        <input type="text" id="pollOpt2" placeholder="Option B">
                    </div>
                </div>
            </div>
        `;
    }
    
    formHTML += `
            <button class="publish-btn" onclick="submitContent('${type}')">
                <span class="btn-text">Publish ${type.charAt(0).toUpperCase() + type.slice(1)}</span>
                <span class="btn-icon">🚀</span>
            </button>
            <p class="approval-note">⚠️ Your post will be reviewed by Admin before going live.</p>
        </div>
    `;
    
    screen.innerHTML = formHTML;
};

// ===== SUBMIT (Real Upload to Appwrite & Cloudinary) =====
window.submitContent = async function(type) {
    const title = document.getElementById("uploadTitle").value;
    const caption = document.getElementById("uploadCaption").value;
    const subject = document.getElementById("uploadSubject").value;
    
    // Get selected classes/exams
    const selectedTargets = [];
    document.querySelectorAll('.custom-checkbox input:checked').forEach(cb => {
        selectedTargets.push(cb.value);
    });

    const fileInput = document.getElementById("uploadFile");
    const file = fileInput ? fileInput.files[0] : null;
    
    if (!title || !caption) {
        return showToast("⚠️ Title aur Description zaroori hai!");
    }

    if ((type === 'reel' || type === 'story') && !file) {
        return showToast("⚠️ File select karo!");
    }

    const btn = document.querySelector('.publish-btn');
    const originalText = btn.innerHTML;
    
    try {
        // UI Update: Loading state
        btn.innerHTML = `<span class="btn-text">Uploading Media...</span><span class="btn-icon">⏳</span>`;
        btn.disabled = true;

        let mediaUrl = null;
        
        // 1. Upload file to Cloudinary
        if (file) {
            mediaUrl = await uploadToCloudinary(file, type === 'reel' ? 'reels' : 'stories');
        }

        btn.innerHTML = `<span class="btn-text">Saving Data...</span><span class="btn-icon">💾</span>`;

        // 2. Save data to Appwrite Database
        const user = await account.get(); 
        
        await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            'unique()', 
            {
                type: type,
                title: title,
                caption: caption,
                mediaUrl: mediaUrl || "",
                creatorName: user.name || "User",
                creatorId: user.$id
            },
            [
                'read("any")',
                'create("any")',
                'update("any")',
                'delete("any")'
            ]
        );

        showToast("✅ " + type.toUpperCase() + " uploaded! Waiting for approval.");
        
        // Reset form
        loadUpload();

    } catch (error) {
        console.error("Upload Error:", error);
        showToast("❌ Upload failed: " + error.message);
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};
