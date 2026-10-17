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
                        // Feed me bhi video autoplay hoga
                        mediaHTML = `
                            <div class="post-video-preview" style="background:#000; height:300px;">
                                <video src="${p.mediaUrl}" muted loop playsinline class="feed-video"></video>
                            </div>`;
                    } else {
                        mediaHTML = `<div class="post-image-preview"><img src="${p.mediaUrl}" style="width:100%; border-radius:10px;"></div>`;
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
                        <div class="post-caption">
                            <b>${p.title}</b><br>${p.caption}
                        </div>
                        <div class="post-stats" style="color:#aaa; font-size:13px; padding:10px;">
                            ❤️ ${p.likes || 0} likes &nbsp; 💬 ${p.comments || 0} comments
                        </div>
                    </div>
                `;
            }).join("");
        }

        feedScreen.innerHTML = `
            <div class="stories-bar">
                <div class="story-item"><div class="story-ring"><div class="story-inner"><div class="story-emoji" style="background: #1A73E8;">🔬</div></div></div><div class="story-label">Science</div></div>
                <div class="story-item"><div class="story-ring"><div class="story-inner"><div class="story-emoji" style="background: #FF0055;">📐</div></div></div><div class="story-label">Maths</div></div>
            </div>
            <div id="postsContainer">${postsHTML}</div>
        `;

        // Feed me Video Auto-play Logic
        const feedObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const vid = entry.target;
                if (entry.intersectionRatio >= 0.5) {
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
