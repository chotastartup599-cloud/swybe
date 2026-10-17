// ==========================================
// 🏠 FEED MODULE (Google Sheets)
// ==========================================

window.loadFeed = async function() {
    const feedScreen = document.getElementById("screen-feed");
    feedScreen.innerHTML = `<div style="text-align:center; padding:50px; color:#666;">Loading Feed...</div>`;

    try {
        const res = await fetch(CONFIG.backend.scriptUrl + "?action=getPosts");
        const posts = await res.json();

        // Sirf approved posts (Story ko chhod kar)
        const approvedPosts = posts.filter(p => p.status === 'approved' && p.type !== 'story');

        // Dummy Stories (Baad me dynamic karenge)
        const storiesData = [
            { id: "science", label: "Science", emoji: "🔬", color: "linear-gradient(135deg, #1A73E8, #4A90E2)" },
            { id: "maths", label: "Maths", emoji: "📐", color: "linear-gradient(135deg, #FF0055, #FF4D88)" },
            { id: "sst", label: "SST", emoji: "🌍", color: "linear-gradient(135deg, #6A1B9A, #9C27B0)" }
        ];

        let postsHTML = "";
        if (approvedPosts.length === 0) {
            postsHTML = `<div style="text-align:center; padding:50px; color:#888;">Abhi koi approved post nahi hai.</div>`;
        } else {
            postsHTML = approvedPosts.map(p => {
                let mediaHTML = "";
                if (p.mediaUrl) {
                    if (p.type === 'reel' || p.mediaUrl.includes('.mp4')) {
                        mediaHTML = `<div class="post-video-preview" style="background:#000; height:300px; display:flex; align-items:center; justify-content:center;"><video src="${p.mediaUrl}" style="width:100%; height:100%; object-fit:contain;" controls></video></div>`;
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
                    </div>
                `;
            }).join("");
        }

        feedScreen.innerHTML = `
            <div class="stories-bar">
                ${storiesData.map(s => `
                    <div class="story-item">
                        <div class="story-ring"><div class="story-inner"><div class="story-emoji" style="background: ${s.color};">${s.emoji}</div></div></div>
                        <div class="story-label">${s.label}</div>
                    </div>
                `).join("")}
            </div>
            <div id="postsContainer">${postsHTML}</div>
        `;

    } catch (error) {
        console.error("Feed Error:", error);
        feedScreen.innerHTML = `<div style="color:#FF0055; text-align:center; padding:50px;">Failed to load feed.</div>`;
    }
};
