// ==========================================
// 🏠 FEED MODULE - Appwrite Data (Posts + Stories)
// ==========================================

window.loadFeed = async function() {
    const feedScreen = document.getElementById("screen-feed");
    feedScreen.innerHTML = `<div style="text-align:center; padding:50px; color:#666;">Loading Feed...</div>`;

    try {
        // ==========================================
        // 1. POSTS FETCH KARO (Approved Only)
        // ==========================================
        const postsResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Appwrite.Query.equal('status', 'approved'), 
                Appwrite.Query.orderDesc('$createdAt')
            ]
        );
        const posts = postsResponse.documents;

        // ==========================================
        // 2. STORIES FETCH KARO (Approved Only)
        // ==========================================
        const storiesResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Appwrite.Query.equal('type', 'story'),
                Appwrite.Query.equal('status', 'approved'),
                Appwrite.Query.orderDesc('$createdAt')
            ]
        );
        const dbStories = storiesResponse.documents;

        // ==========================================
        // 3. STORIES BAR DATA READY KARO
        // ==========================================
        // Default dummy stories (hamesha dikhengi)
        let storiesData = [
            { id: "science", label: "Science", emoji: "🔬", color: "linear-gradient(135deg, #1A73E8, #4A90E2)", isDb: false },
            { id: "maths", label: "Maths", emoji: "📐", color: "linear-gradient(135deg, #FF0055, #FF4D88)", isDb: false },
            { id: "sst", label: "SST", emoji: "🌍", color: "linear-gradient(135deg, #6A1B9A, #9C27B0)", isDb: false }
        ];

        // Agar Appwrite me stories mili, toh unhe default ke aage lagao
        if (dbStories.length > 0) {
            const dynamicStories = dbStories.map(s => ({
                id: s.$id,
                label: s.creatorName || "User",
                emoji: "📸",
                color: "linear-gradient(135deg, #FF9800, #FF0055)",
                imageUrl: s.mediaUrl,
                isDb: true
            }));
            storiesData = [...dynamicStories, ...storiesData];
        }

        // ==========================================
        // 4. POSTS HTML BANAO
        // ==========================================
        let postsHTML = "";
        
        if (posts.length === 0) {
            postsHTML = `<div style="text-align:center; padding:50px; color:#888;">Abhi koi approved post nahi hai.</div>`;
        } else {
            // Sirf 'reel' aur 'test' types ko feed me dikhana hai (story nahi)
            const feedPosts = posts.filter(p => p.type !== 'story');

            postsHTML = feedPosts.map(p => {
                let mediaHTML = "";
                
                // Agar mediaUrl hai toh video ya image check karo
                if (p.mediaUrl) {
                    if (p.type === 'reel' || p.mediaUrl.includes('.mp4') || p.mediaUrl.includes('video')) {
                        mediaHTML = `
                            <div class="post-video-preview" style="background:#000; display:flex; align-items:center; justify-content:center; height:300px;">
                                <video src="${p.mediaUrl}" style="width:100%; height:100%; object-fit:contain;" controls></video>
                            </div>
                        `;
                    } else {
                        mediaHTML = `
                            <div class="post-image-preview">
                                <img src="${p.mediaUrl}" alt="${p.title}" style="width:100%; border-radius:10px;">
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

        // ==========================================
        // 5. FINAL UI RENDER
        // ==========================================
        feedScreen.innerHTML = `
            <div class="stories-bar" id="storiesBar">
                ${storiesData.map(s => `
                    <div class="story-item" onclick="${s.isDb ? `openAppwriteStory('${s.id}')` : `openStory('${s.id}')`}">
                        <div class="story-ring">
                            <div class="story-inner">
                                ${s.imageUrl 
                                    ? `<div class="story-emoji" style="background: url('${s.imageUrl}') center/cover; border-radius: 50%;"></div>` 
                                    : `<div class="story-emoji" style="background: ${s.color};">${s.emoji}</div>`
                                }
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
        feedScreen.innerHTML = `<div style="text-align:center; padding:50px; color:#FF0055;">Failed to load feed. Check console for errors.</div>`;
    }
};
