// ==========================================
// 📖 STORIES MODULE - Dynamic Appwrite Data
// ==========================================

let currentStoryIndex = 0;
let storyTimer = null;
let currentStoryArray = [];
let currentStoryId = "";

// ===== OPEN STORY FROM APPWRITE =====
window.openAppwriteStory = async function(storyId) {
    try {
        // Appwrite se us story ki detail fetch karo
        const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, storyId);
        
        // Array format me set karo (kyunki humne pehle multi-slide ka logic banaya tha)
        currentStoryArray = [{
            type: 'image',
            url: doc.mediaUrl,
            title: doc.title,
            text: doc.caption,
            color: "linear-gradient(135deg, #FF0055, #FF4D88)"
        }];
        
        currentStoryIndex = 0;
        currentStoryId = storyId;

        // Viewer UI render karo
        let viewer = document.getElementById("storyViewer");
        if (!viewer) {
            viewer = document.createElement("div");
            viewer.id = "storyViewer";
            viewer.className = "story-viewer";
            document.getElementById("app").appendChild(viewer);
        }
        
        viewer.style.display = "flex";
        renderStorySlide();

    } catch (error) {
        console.error("Story fetch error:", error);
        showToast("❌ Story load nahi hui.");
    }
};

// ===== RENDER SLIDE =====
function renderStorySlide() {
    const viewer = document.getElementById("storyViewer");
    const slide = currentStoryArray[currentStoryIndex];
    if (!slide) return closeStory();
    
    viewer.innerHTML = `
        <div class="story-progress">
            <div class="progress-bar">
                <div class="progress-fill" id="storyProgressFill"></div>
            </div>
        </div>
        
        <button class="story-close" onclick="closeStory()">✕</button>
        
        <div class="story-slide" style="background: #000;">
            <img src="${slide.url}" style="width: 100%; height: 100%; object-fit: contain; position: absolute; top: 0; left: 0;">
            
            <div class="story-content" style="position: absolute; bottom: 40px; left: 20px; right: 20px; background: rgba(0,0,0,0.6); padding: 15px; border-radius: 12px;">
                <h2 class="story-title" style="font-size: 20px; margin-bottom: 5px;">${slide.title}</h2>
                <p class="story-text" style="font-size: 14px; margin: 0;">${slide.text}</p>
            </div>
        </div>
    `;
    
    // Auto-advance 5 sec
    clearTimeout(storyTimer);
    storyTimer = setTimeout(() => nextStory(), 5000);
    
    // Animate progress bar
    setTimeout(() => {
        const fill = document.getElementById('storyProgressFill');
        if (fill) {
            fill.style.transition = 'width 5s linear';
            fill.style.width = '100%';
        }
    }, 50);
}

// ===== NEXT STORY =====
window.nextStory = function() {
    clearTimeout(storyTimer);
    currentStoryIndex++;
    if (currentStoryIndex >= currentStoryArray.length) {
        closeStory();
    } else {
        renderStorySlide();
    }
};

// ===== PREV STORY =====
window.prevStory = function() {
    clearTimeout(storyTimer);
    if (currentStoryIndex > 0) {
        currentStoryIndex--;
        renderStorySlide();
    }
};

// ===== CLOSE =====
window.closeStory = function() {
    clearTimeout(storyTimer);
    const viewer = document.getElementById("storyViewer");
    if (viewer) viewer.style.display = "none";
};
