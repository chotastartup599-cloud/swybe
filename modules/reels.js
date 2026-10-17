// ==========================================
// 🎬 REELS MODULE - Appwrite Data (Approved Only)
// ==========================================

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
                Appwrite.Query.equal('type', 'reel'),       // Sirf Reels
                Appwrite.Query.equal('status', 'approved'), // 👈 Sirf Approved
                Appwrite.Query.orderDesc('$createdAt')
            ]
        );

        const reels = response.documents;
        feedContainer.innerHTML = ""; 

        if (reels.length === 0) {
            feedContainer.innerHTML = `<div style="color:#fff; text-align:center; padding-top:50px;">Koi Reel nahi mili.</div>`;
            return;
        }

        reels.forEach((data, index) => {
            const card = document.createElement("div");
            card.className = "reel-card";
            card.dataset.videoFile = data.mediaUrl; 
            
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
                            // ===== LIKE BUTTON LOGIC =====
            const likeBtn = card.querySelector(".id-like");
            const heart = likeBtn.querySelector(".circle-btn");
            const likeLabel = card.querySelector(`#likes-${index}`);
            
            // Check if user already liked (localStorage se)
            const likedKey = "liked_" + data.$id; 
            if (localStorage.getItem(likedKey) === "true") {
                heart.classList.add("liked");
            }

            // Set initial like count from database
            if (data.likes) {
                likeLabel.innerText = data.likes;
            }

            likeBtn.addEventListener("click", async () => {
                const isLiked = heart.classList.toggle("liked");
                localStorage.setItem(likedKey, isLiked);
                
                let currentLikes = parseInt(data.likes) || 0;
                let newLikes = isLiked ? currentLikes + 1 : currentLikes - 1;
                if (newLikes < 0) newLikes = 0;
                
                // Update UI instantly
                likeLabel.innerText = newLikes;
                data.likes = newLikes; // Update local data

                try {
                    // Save to Appwrite Database
                    await databases.updateDocument(
                        DATABASE_ID,
                        COLLECTION_ID,
                        data.$id, // Post ID
                        { likes: newLikes }
                    );
                } catch (error) {
                    console.error("Like error:", error);
                    showToast("❌ Like save nahi hua");
                    // Revert if error
                    heart.classList.toggle("liked"); 
                    likeLabel.innerText = currentLikes;
                    data.likes = currentLikes;
                }
            });

            feedContainer.appendChild(card);
        });
                    <div class="btn-box id-like">
                        <div class="circle-btn">❤️</div>
                        <span class="btn-label" id="likes-${index}">0</span>
                    </div>
                    <div class="btn-box id-comment">
                        <div class="circle-btn">💬</div>
                        <span class="btn-label" id="comments-${index}">0</span>
                    </div>
                    <div class="btn-box id-share">
                        <div class="circle-btn">📤</div>
                        <span class="btn-label" id="shares-${index}">0</span>
                    </div>
                </div>
            `;

            // Sound button logic
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

            feedContainer.appendChild(card);
        });

        // Auto Play Logic
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
