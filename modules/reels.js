// ==========================================
// 🎬 REELS MODULE - Appwrite Data & Interactions
// ==========================================

let activeCreator = "";

window.loadReels = async function() {
    const feedContainer = document.getElementById("peerTubeFeed");
    feedContainer.innerHTML = `<div style="color:#fff; text-align:center; padding-top:50px;">Loading Reels...</div>`;
    feedContainer.dataset.loaded = "true";

    try {
        // Sirf Approved Reels Fetch karo
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Appwrite.Query.equal('type', 'reel'),       
                Appwrite.Query.equal('status', 'approved'), 
                Appwrite.Query.orderDesc('$createdAt')
            ]
        );

        const reels = response.documents;
        feedContainer.innerHTML = ""; 

        if (reels.length === 0) {
            feedContainer.innerHTML = `<div style="color:#fff; text-align:center; padding-top:50px;">Koi Reel nahi mili. Admin approve karega tab dikhegi.</div>`;
            return;
        }

        reels.forEach((data, index) => {
            const card = document.createElement("div");
            card.className = "reel-card";
            card.dataset.videoFile = data.mediaUrl; 
            
            // Check if user liked this before (LocalStorage)
            const likedKey = "liked_" + data.$id;
            const isLiked = localStorage.getItem(likedKey) === "true";
            
            card.innerHTML = `
                <video src="${data.mediaUrl}" muted loop playsinline preload="metadata" webkit-playsinline></video>
                <button class="sound-btn" data-video-id="${index}">🔇</button>
                
                <div class="instagram-style-overlay">
                    <div class="user-header">
                        <div class="user-avatar-small" style="background:#FF0055; display:flex; justify-content:center; align-items:center;">👤</div>
                        <div class="user-info-block">
                            <span class="user-name-reel">${data.creatorName || "User"}</span>
                            <span class="user-insta-reel">@swybe</span>
                        </div>
                        <button class="follow-btn">Follow</button>
                    </div>
                    <div class="video-desc"><b>${data.title}</b><br>${data.caption}</div>
                </div>
                
                <div class="social-sidebar">
                    <div class="btn-box id-like">
                        <div class="circle-btn ${isLiked ? 'liked' : ''}">❤️</div>
                        <span class="btn-label" id="likes-${index}">${data.likes || 0}</span>
                    </div>
                    <div class="btn-box id-comment">
                        <div class="circle-btn">💬</div>
                        <span class="btn-label" id="comments-${index}">0</span>
                    </div>
                    <div class="btn-box id-share">
                        <div class="circle-btn">📤</div>
                        <span class="btn-label">Share</span>
                    </div>
                </div>
            `;

            // ===== SOUND BUTTON =====
            const videoEl = card.querySelector("video");
            const soundBtn = card.querySelector(".sound-btn");
            soundBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                SOUND_ENABLED = !SOUND_ENABLED;
                document.querySelectorAll(".reel-card video").forEach(v => {
                    const rect = v.getBoundingClientRect();
                    const isVisible = rect.top >= -50 && rect.top < window.innerHeight * 0.7;
                    v.muted = !(SOUND_ENABLED && isVisible);
                });
                document.querySelectorAll(".sound-btn").forEach(b => {
                    b.innerText = SOUND_ENABLED ? "🔊" : "🔇";
                });
            });

            // ===== LIKE BUTTON LOGIC =====
            const likeBtn = card.querySelector(".id-like");
            const heart = likeBtn.querySelector(".circle-btn");
            const likeLabel = card.querySelector(`#likes-${index}`);
            
            likeBtn.addEventListener("click", async () => {
                const nowLiked = heart.classList.toggle("liked");
                localStorage.setItem(likedKey, nowLiked);
                
                let currentLikes = parseInt(data.likes) || 0;
                let newLikes = nowLiked ? currentLikes + 1 : currentLikes - 1;
                if (newLikes < 0) newLikes = 0;
                
                likeLabel.innerText = newLikes;
                data.likes = newLikes; // Update local object

                try {
                    await databases.updateDocument(
                        DATABASE_ID, COLLECTION_ID, data.$id, { likes: newLikes }
                    );
                } catch (error) {
                    console.error("Like error:", error);
                    showToast("❌ Like save nahi hua");
                    heart.classList.toggle("liked"); 
                    likeLabel.innerText = currentLikes;
                    data.likes = currentLikes;
                }
            });

            // ===== COMMENT BUTTON TRIGGER =====
            card.querySelector(".id-comment").addEventListener("click", () => {
                activeVideoId = data.$id; 
                activeCreator = data.creatorName;
                document.getElementById("commentPopup").style.display = "flex";
                loadComments(data.$id); 
            });

            // ===== SHARE BUTTON =====
            card.querySelector(".id-share").addEventListener("click", () => {
                const shareUrl = window.location.origin + window.location.pathname + "?v=" + data.$id;
                if (navigator.share) {
                    navigator.share({
                        title: "Swybe - " + data.creatorName,
                        text: data.title,
                        url: shareUrl
                    }).catch(() => {});
                } else {
                    navigator.clipboard.writeText(shareUrl);
                    showToast("🔗 Link copy ho gaya!");
                }
            });

            feedContainer.appendChild(card);
        });

        // ===== AUTO PLAY LOGIC =====
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.intersectionRatio >= 0.6) {
                    video.muted = !SOUND_ENABLED;
                    const playPromise = video.play();
                    if (playPromise !== undefined) playPromise.catch(err => {});
                } else {
                    if (!video.paused) video.pause();
                    video.muted = true;
                }
            });
        }, { root: feedContainer, threshold: [0, 0.3, 0.6, 0.9] });

        document.querySelectorAll('.reel-card video').forEach(v => videoObserver.observe(v));

    } catch (error) {
        console.error("Reels Error:", error);
        feedContainer.innerHTML = `<div style="color:#FF0055; text-align:center; padding-top:50px;">Error loading reels.</div>`;
    }
};

// ==========================================
// 💬 LOAD COMMENTS (Appwrite se)
// ==========================================
async function loadComments(postId) {
    const list = document.getElementById("commentsList");
    list.innerHTML = "<div style='color:#666; font-size:13px; text-align:center;'>Loading comments...</div>";
    
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            'comments', // Nayi table
            [
                Appwrite.Query.equal('postId', postId),
                Appwrite.Query.orderDesc('$createdAt')
            ]
        );

        list.innerHTML = "";
        if (response.documents.length === 0) {
            list.innerHTML = "<div style='color:#666; font-size:13px; text-align:center; margin-top:20px;'>No comments yet. Start the conversation!</div>";
        } else {
            response.documents.forEach(c => {
                const item = document.createElement("div");
                item.className = "comment-item";
                item.innerHTML = `
                    <div class="c-avatar">👤</div>
                    <div class="c-content">
                        <div class="c-name">${c.userName}</div>
                        <div>${c.text}</div>
                    </div>
                `;
                list.appendChild(item);
            });
        }
    } catch (error) {
        console.error("Error loading comments:", error);
        list.innerHTML = "<div style='color:#FF0055; text-align:center;'>Error loading comments.</div>";
    }
}

// ==========================================
// 🚀 SEND COMMENT
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Close Popup
    const closePopup = document.getElementById("closePopup");
    if (closePopup) closePopup.addEventListener("click", () => {
        document.getElementById("commentPopup").style.display = "none";
    });

    // Send Comment
    const cBtn = document.getElementById("cBtn");
    if (cBtn) {
        cBtn.addEventListener("click", async () => {
            const txt = document.getElementById("cInput").value.trim();
            if (!txt) return showToast("⚠️ Comment likho!");
            
            let userName = "Guest User";
            try {
                const user = await account.get();
                userName = user.name || "Guest User";
            } catch(e) {}
            
            const item = document.createElement("div");
            item.className = "comment-item";
            item.innerHTML = `
                <div class="c-avatar">👤</div>
                <div class="c-content">
                    <div class="c-name">${userName}</div>
                    <div>${txt}</div>
                </div>
            `;
            document.getElementById("commentsList").appendChild(item);
            document.getElementById("cInput").value = "";
            
            try {
                await databases.createDocument(
                    DATABASE_ID,
                    'comments',
                    'unique()',
                    {
                        postId: activeVideoId,
                        userName: userName,
                        text: txt
                    },
                    ['read("any")', 'write("any")']
                );
                showToast("✅ Comment added!");
            } catch (error) {
                console.error("Comment save error:", error);
                showToast("❌ Comment save nahi hua.");
            }
        });
    }
});
