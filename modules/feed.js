// ==========================================
// 🏠 FEED MODULE - Appwrite Data (Approved Only)
// ==========================================

window.loadFeed = async function() {
    const feedScreen = document.getElementById("screen-feed");
    feedScreen.innerHTML = `<div style="text-align:center; padding:50px; color:#666;">Loading Feed...</div>`;

    try {
        // Sirf Approved Posts Fetch karo
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Appwrite.Query.equal('status', 'approved'), // 👈 Sirf Approved
                Appwrite.Query.orderDesc('$createdAt')
            ]
        );

        const posts = response.documents;

        // Stories Data (Hardcoded for now)
        const storiesData = [
            { id: "science", label: "Science", emoji: "🔬", color: "linear-gradient(135deg, #1A73E8, #4A90E2)" },
            { id: "maths", label: "Maths", emoji: "📐", color: "linear-gradient(135deg, #FF0055, #FF4D88)" },
            { id: "sst", label: "SST", emoji: "🌍", color: "linear-gradient(135deg, #6A1B9A, #9C27B0)" },
            { id: "english", label: "English", emoji: "📖", color: "linear-gradient(135deg, #2E7D32, #4CAF50)" }
        ];

        let postsHTML = "";
        
        if (posts.length === 0) {
            postsHTML = `<div style="text-align:center; padding:50px; color:#888;">Abhi koi approved post nahi hai.</div>`;
        } else {
            postsHTML = posts.map(p => {
                let mediaHTML = "";
                if (p.type === 'reel' || p.mediaUrl) {
                    // Agar video hai
                    if (p.mediaUrl && (p.mediaUrl.includes('.mp4') || p.mediaUrl.includes('video'))) {
                        mediaHTML = `
                            <div class="post-video-preview" style="background:#000; display:flex; align-items:center; justify-content:center; height:300px;">
                                <video src="${p.mediaUrl}" style="width:100%; height:100%; object-fit:contain;" controls></video>
                            </div>
                        `;
                    } else {
                        // Agar image hai
                        mediaHTML = `
                            <div class="post-image-preview">
                                <img src="${p.mediaUrl || 'https://via.placeholder.com/400'}" alt="${p.title}" style="width:100%; border-radius:10px;">
                            </div>
                        `;
                    }
                }

                return `
                    <div class="feed-post">
                        <div class="post-header">
                            <div class="post-avatar">👤</div>
                            <div class="post-info">
                                <div class="post-creator">${p.creatorName || "User"}</div>
                                <div class="post-insta">${p.type ? p.type.toUpperCase() : 'POST'}</div>
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
            <div class="stories-bar" id="storiesBar">
                ${storiesData.map(s => `
                    <div class="story-item" onclick="openStory('${s.id}')">
                        <div class="story-ring">
                            <div class="story-inner">
                                <div class="story-emoji" style="background: ${s.color};">${s.emoji}</div>
                            </div>
                        </div>
                        <div class="story-label">${s.label}</div>
                    </div>
                `).join("")}
            </div>
            <div id="postsContainer">
                ${postsHTML}
            </div>
        `;

    } catch (error) {
        console.error("Feed Error:", error);
        feedScreen.innerHTML = `<div style="text-align:center; padding:50px; color:#FF0055;">Failed to load feed.</div>`;
    }
};
