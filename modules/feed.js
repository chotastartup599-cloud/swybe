// ==========================================
// 🏠 FEED MODULE (Instagram Style)
// ==========================================

window.loadFeed = async function() {
    const feedScreen = document.getElementById("screen-feed");
    feedScreen.innerHTML = `<div style="text-align:center; padding:50px; color:#666;">Loading Feed...</div>`;

    try {
        const res = await fetch(CONFIG.backend.scriptUrl + "?action=getPosts");
        const posts = await res.json();
        const approvedPosts = posts.filter(p => p.status === 'approved' && p.type !== 'story');

        let postsHTML = "";
        if (approvedPosts.length === 0) {
            postsHTML = `<div style="text-align:center; padding:50px; color:#888;">Abhi koi post nahi hai.</div>`;
        } else {
            postsHTML = approvedPosts.map((p, index) => {
                let mediaHTML = "";
                if (p.mediaUrl) {
                    if (p.type === 'reel' || p.mediaUrl.includes('.mp4')) {
                        mediaHTML = `
                            <div class="post-video-preview" onclick="toggleFeedVideo(this)">
                                <video src="${p.mediaUrl}" muted loop playsinline class="feed-video"></video>
                            </div>`;
                    } else {
                        mediaHTML = `<div class="post-image-preview"><img src="${p.mediaUrl}" style="width:100%;"></div>`;
                    }
                }

                return `
                    <div class="feed-post">
                        <div class="post-header">
                            <div class="post-avatar">👤</div>
                            <div class="post-info">
                                <div class="post-creator">${p.creatorName}</div>
                                <div class="post-insta">${p.type.toUpperCase()}</div>
                            </div>
                        </div>
                        ${mediaHTML}
                        
                        <div class="post-actions">
                            <div class="action-left">
                                <button class="action-btn id-like" onclick="likeFeedPost('${p.id}', this)">🤍</button>
                                <button class="action-btn" onclick="openCommentPopup('${p.id}')">💬</button>
                                <button class="action-btn">📤</button>
                            </div>
                            <button class="action-btn">🔖</button>
                        </div>
                        
                        <div class="post-stats" id="stats-${p.id}">
                            ${p.likes || 0} likes • ${p.comments || 0} comments
                        </div>
                        <div class="post-caption" style="padding:0 15px 15px;">
                            <b>${p.creatorName}</b> ${p.caption}
                        </div>
                    </div>
                `;
            }).join("");
        }

        feedScreen.innerHTML = `
            <div class="stories-bar" style="border-bottom:1px solid #222; padding:15px 10px; display:flex; gap:15px; overflow-x:auto;">
                <!-- Dummy Stories for now -->
                <div class="story-item"><div class="story-ring"><div class="story-inner"><div class="story-emoji" style="background: #1A73E8;">🔬</div></div></div><div class="story-label">Science</div></div>
                <div class="story-item"><div class="story-ring"><div class="story-inner"><div class="story-emoji" style="background: #FF0055;">📐</div></div></div><div class="story-label">Maths</div></div>
            </div>
            <div id="postsContainer" style="padding-top:10px;">${postsHTML}</div>
        `;

        // Auto Play Logic
        const feedObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const vid = entry.target;
                if (entry.intersectionRatio >= 0.5) {
                    vid.muted = !SOUND_ENABLED;
                    vid.play().catch(e=>{});
                } else {
                    vid.pause();
                }
            });
        }, { threshold: [0.5] });
        document.querySelectorAll('.feed-video').forEach(v => feedObserver.observe(v));

    } catch (error) {
        feedScreen.innerHTML = `<div style="color:red; text-align:center;">Failed to load feed.</div>`;
    }
};

// Play/Pause Video on Click
window.toggleFeedVideo = function(container) {
    const vid = container.querySelector('video');
    if (vid.paused) {
        vid.play();
    } else {
        vid.pause();
    }
};

// Like Post in Feed
window.likeFeedPost = async function(postId, btn) {
    btn.innerText = "❤️"; // Change icon instantly
    const stats = document.getElementById(`stats-${postId}`);
    let text = stats.innerText;
    let likes = parseInt(text.split(' ')[0]) + 1;
    stats.innerText = `${likes} likes • ${text.split('•')[1].trim()}`;
    
    await fetch(CONFIG.backend.scriptUrl + "?action=likePost", { 
        method: "POST", body: JSON.stringify({ id: postId, value: 1 }) 
    });
};
