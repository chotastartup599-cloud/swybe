// ==========================================
// 🏠 FEED MODULE - With Stories Bar
// ==========================================

window.loadFeed = function() {
    const feedScreen = document.getElementById("screen-feed");
    
    if (feedScreen.dataset.loaded === "true") return;
    feedScreen.dataset.loaded = "true";
    
    // Stories data (baad me Firebase se aayega)
    const storiesData = [
        { id: "science", label: "Science", emoji: "🔬", color: "linear-gradient(135deg, #1A73E8, #4A90E2)" },
        { id: "maths", label: "Maths", emoji: "📐", color: "linear-gradient(135deg, #FF0055, #FF4D88)" },
        { id: "sst", label: "SST", emoji: "🌍", color: "linear-gradient(135deg, #6A1B9A, #9C27B0)" },
        { id: "english", label: "English", emoji: "📖", color: "linear-gradient(135deg, #2E7D32, #4CAF50)" },
        { id: "hindi", label: "Hindi", emoji: "🇮🇳", color: "linear-gradient(135deg, #E65100, #FF9800)" },
        { id: "current", label: "Current", emoji: "📰", color: "linear-gradient(135deg, #C62828, #EF5350)" }
    ];
    
    // Posts data (baad me Firebase se)
    const postsData = [
        {
            type: "reel",
            videoFile: "news3.mp4",
            creator: "Deep Jyoti Coaching",
            insta: "@deep_jyoti",
            description: "📚 9 Oct 2026 - Top 10 Current Affairs",
            hashtags: "#nda #upsc",
            likes: 1247,
            comments: 89
        },
        {
            type: "note",
            title: "Class 10 Science - Chapter 1 Notes",
            description: "Chemical Reactions and Equations ke complete notes",
            link: "/p/class-10-science.html",
            thumbnail: "🧪"
        },
        {
            type: "reel",
            videoFile: "news2.mp4",
            creator: "Deep Jyoti Coaching",
            insta: "@deep_jyoti",
            description: "8 Oct 2026 - Daily Current Affairs",
            hashtags: "#currentaffairs",
            likes: 892,
            comments: 45
        },
        {
            type: "note",
            title: "Class 10 Maths - Real Numbers",
            description: "Euclid's Division Lemma, HCF, LCM ke notes",
            link: "/p/class-10-maths.html",
            thumbnail: "📐"
        }
    ];
    
    // ===== RENDER =====
    feedScreen.innerHTML = `
        <!-- STORIES BAR -->
        <div class="stories-bar" id="storiesBar">
            ${storiesData.map(s => `
                <div class="story-item" data-story="${s.id}">
                    <div class="story-ring">
                        <div class="story-inner">
                            <div class="story-emoji" style="background: ${s.color};">${s.emoji}</div>
                        </div>
                    </div>
                    <div class="story-label">${s.label}</div>
                </div>
            `).join("")}
        </div>
        
        <!-- POSTS FEED -->
        <div id="postsContainer">
            ${postsData.map(p => renderPost(p)).join("")}
        </div>
    `;
    
    // Story click handlers
    document.querySelectorAll('.story-item').forEach(item => {
        item.addEventListener('click', () => {
            const storyId = item.dataset.story;
            if (window.openStory) window.openStory(storyId);
        });
    });
    
    // Post click handlers
    document.querySelectorAll('.feed-post').forEach(post => {
        post.addEventListener('click', () => {
            const link = post.dataset.link;
            if (link) window.open(link, '_blank');
        });
    });
};

// ===== RENDER POST =====
function renderPost(post) {
    if (post.type === "reel") {
        return `
            <div class="feed-post" data-video="${post.videoFile}">
                <div class="post-header">
                    <div class="post-avatar">📹</div>
                    <div class="post-info">
                        <div class="post-creator">${post.creator}</div>
                        <div class="post-insta">${post.insta}</div>
                    </div>
                </div>
                <div class="post-video-preview" onclick="openReelFromFeed('${post.videoFile}')">
                    <div class="play-icon">▶</div>
                </div>
                <div class="post-caption">
                    ${post.description} <b>${post.hashtags || ''}</b>
                </div>
                <div class="post-stats">
                    ❤️ ${formatNumber(post.likes)} &nbsp; 💬 ${post.comments}
                </div>
            </div>
        `;
    } else {
        return `
            <div class="feed-post" data-link="${post.link}">
                <div class="post-header">
                    <div class="post-avatar">📖</div>
                    <div class="post-info">
                        <div class="post-creator">${post.title}</div>
                        <div class="post-insta">Study Material</div>
                    </div>
                </div>
                <div class="post-note-preview">
                    <div class="note-icon">${post.thumbnail}</div>
                </div>
                <div class="post-caption">${post.description}</div>
                <div class="post-stats">
                    📚 Tap to read full notes →
                </div>
            </div>
        `;
    }
}

// ===== OPEN REEL FROM FEED =====
window.openReelFromFeed = function(videoFile) {
    showScreen('reels');
    setTimeout(() => {
        const target = document.querySelector(`[data-video-file="${videoFile}"]`);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
};
