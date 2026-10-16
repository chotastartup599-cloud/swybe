// ==========================================
// 🎬 REELS MODULE - With User Info + Follow
// ==========================================

window.loadReels = function() {
    const feedContainer = document.getElementById("peerTubeFeed");
    
    // Agar already load ho chuka hai, dobara mat karo
    if (feedContainer.dataset.loaded === "true") return;
    feedContainer.dataset.loaded = "true";
    
    // Videos ko date ke hisaab se sort karo (newest first)
    if (typeof videoDatabase !== 'undefined') {
        videoDatabase.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    
    videoDatabase.forEach((data, index) => {
        const card = document.createElement("div");
        card.className = "reel-card";
        card.dataset.videoFile = data.videoFile;
        
        const videoSrc = CONFIG.video.baseUrl + data.videoFile;
        const isFollowed = localStorage.getItem("followed_" + data.instagramID) === "true";
        
        card.innerHTML = `
    <video src="${videoSrc}" muted loop playsinline preload="metadata" webkit-playsinline></video>
    <button class="sound-btn" data-video-id="${index}">🔇</button>
    
    <div class="instagram-style-overlay">
        <div class="user-header">
            <img src="${data.creatorPhoto || 'https://via.placeholder.com/40'}" class="user-avatar-small" alt="${data.creatorName}">
            <div class="user-info-block">
                <span class="user-name-reel">${data.creatorName}</span>
                <span class="user-insta-reel">${data.instagramID}</span>
            </div>
            <button class="follow-btn ${isFollowed ? 'following' : ''}" data-creator="${data.instagramID}">
                ${isFollowed ? 'Following' : 'Follow'}
            </button>
        </div>
        <div class="video-desc">${data.description} <b>${data.hashtags}</b></div>
        <div class="upload-date">📅 ${data.uploadDate || ''}</div>
    </div>
    
    <div class="social-sidebar">
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
        <div class="btn-box id-bookmark">
            <div class="circle-btn">🔖</div>
            <span class="btn-label" id="bookmarks-${index}">0</span>
        </div>
    </div>
`;
        
        const videoEl = card.querySelector("video");
        const soundBtn = card.querySelector(".sound-btn");
        const followBtn = card.querySelector(".follow-btn");
        
        // ===== FOLLOW BUTTON =====
        followBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const creatorId = followBtn.dataset.creator;
            const isCurrentlyFollowed = followBtn.classList.contains("following");
            
            if (isCurrentlyFollowed) {
                followBtn.classList.remove("following");
                followBtn.textContent = "Follow";
                localStorage.setItem("followed_" + creatorId, "false");
                showToast("Unfollowed " + creatorId);
            } else {
                followBtn.classList.add("following");
                followBtn.textContent = "Following";
                localStorage.setItem("followed_" + creatorId, "true");
                showToast("✅ Followed " + creatorId);
            }
            
            // Backend me follow track karo
            sendToBackend({
                video: data.videoFile,
                creator: data.creatorName,
                action: isCurrentlyFollowed ? "unfollow" : "follow",
                user_id: getUserId()
            });
        });
        
        // ===== SOUND BUTTON =====
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
        
        // ===== LIKE =====
        const likeBtn = card.querySelector(".id-like");
        const heart = likeBtn.querySelector(".circle-btn");
        const likedKey = "liked_" + data.videoFile;
        if (localStorage.getItem(likedKey) === "true") heart.classList.add("liked");
        
        likeBtn.addEventListener("click", () => {
            const isLiked = heart.classList.toggle("liked");
            localStorage.setItem(likedKey, isLiked);
            
            const likeLabel = document.getElementById(`likes-${index}`);
            let currentLikes = parseInt(likeLabel.dataset.count || likeLabel.innerText) || 0;
            likeLabel.innerText = formatNumber(currentLikes + (isLiked ? 1 : -1));
            likeLabel.dataset.count = currentLikes + (isLiked ? 1 : -1);
            
            sendToBackend({
                video: data.videoFile,
                creator: data.creatorName,
                action: isLiked ? "like" : "unlike",
                user_id: getUserId()
            });
            showToast(isLiked ? "❤️ Liked!" : "Unliked");
        });
        
        // ===== BOOKMARK =====
        const bookmarkBtn = card.querySelector(".id-bookmark");
        const bookmarkIcon = bookmarkBtn.querySelector(".circle-btn");
        const bookmarkKey = "bookmark_" + data.videoFile;
        if (localStorage.getItem(bookmarkKey) === "true") bookmarkIcon.classList.add("bookmarked");
        
        bookmarkBtn.addEventListener("click", () => {
            const isSaved = bookmarkIcon.classList.toggle("bookmarked");
            localStorage.setItem(bookmarkKey, isSaved);
            
            let savedVideos = JSON.parse(localStorage.getItem("pt_saved_videos") || "[]");
            if (isSaved) {
                if (!savedVideos.find(v => v.videoFile === data.videoFile)) savedVideos.push(data);
            } else {
                savedVideos = savedVideos.filter(v => v.videoFile !== data.videoFile);
            }
            localStorage.setItem("pt_saved_videos", JSON.stringify(savedVideos));
            
            const bookmarkLabel = document.getElementById(`bookmarks-${index}`);
            let currentBookmarks = parseInt(bookmarkLabel.dataset.count || bookmarkLabel.innerText) || 0;
            bookmarkLabel.innerText = formatNumber(currentBookmarks + (isSaved ? 1 : -1));
            bookmarkLabel.dataset.count = currentBookmarks + (isSaved ? 1 : -1);
            
            sendToBackend({
                video: data.videoFile,
                creator: data.creatorName,
                action: "bookmark",
                user_id: getUserId()
            });
            showToast(isSaved ? "🔖 Saved!" : "Removed");
        });
        
        // ===== SHARE =====
        card.querySelector(".id-share").addEventListener("click", () => {
            const shareUrl = window.location.origin + window.location.pathname + "?v=" + data.videoFile;
            if (navigator.share) {
                navigator.share({
                    title: "Swybe - " + data.creatorName,
                    text: data.description,
                    url: shareUrl
                }).catch(() => {});
            } else {
                navigator.clipboard.writeText(shareUrl);
                showToast("🔗 Link copy ho gaya!");
            }
            
            const shareLabel = document.getElementById(`shares-${index}`);
            let currentShares = parseInt(shareLabel.dataset.count || shareLabel.innerText) || 0;
            shareLabel.innerText = formatNumber(currentShares + 1);
            shareLabel.dataset.count = currentShares + 1;
            
            sendToBackend({
                video: data.videoFile,
                creator: data.creatorName,
                action: "share",
                user_id: getUserId()
            });
        });
        
        // ===== COMMENT =====
        card.querySelector(".id-comment").addEventListener("click", () => {
            activeVideo = data.videoFile;
            activeCreator = data.creatorName;
            document.getElementById("commentPopup").style.display = "flex";
            loadComments(data.videoFile);
        });
        
        feedContainer.appendChild(card);
    });
    
    // ===== INTERSECTION OBSERVER =====
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.intersectionRatio >= 0.6) {
                video.muted = !SOUND_ENABLED;
                const playPromise = video.play();
                if (playPromise !== undefined) playPromise.catch(err => {});
                
                const card = video.closest('.reel-card');
                if (card && card.dataset.viewTracked !== "true") {
                    card.dataset.viewTracked = "true";
                    const data = videoDatabase.find(v => v.videoFile === card.dataset.videoFile);
                    if (data) {
                        setTimeout(() => {
                            if (!video.paused) {
                                const user = CONFIG.firebase.enabled ? firebase.auth().currentUser : null;
                                sendToBackend({
                                    video: data.videoFile,
                                    creator: data.creatorName,
                                    action: "view",
                                    watch_time: Math.floor(video.currentTime),
                                    source: getTrafficSource(),
                                    device: getDeviceType(),
                                    session_id: getSessionId(),
                                    user_id: user ? user.uid : getUserId(),
                                    category: data.category,
                                    language: data.language,
                                    duration: data.duration,
                                    instagram_id: data.instagramID,
                                    description: data.description,
                                    hashtags: data.hashtags,
                                    is_logged_in: user ? "true" : "false",
                                    firebase_uid: user ? user.uid : ""
                                });
                            }
                        }, CONFIG.video.minWatchTimeForView * 1000);
                    }
                }
            } else {
                if (!video.paused) video.pause();
                video.muted = true;
            }
        });
    }, {
        root: feedContainer,
        threshold: [0, 0.3, 0.6, 0.9]
    });
    
    document.querySelectorAll('.reel-card video').forEach(v => videoObserver.observe(v));
    
    // ===== LOAD STATS =====
    setTimeout(loadAllStats, 1200);
};

// ===== LOAD STATS =====
function loadAllStats() {
    videoDatabase.forEach((data, index) => {
        fetch(CONFIG.backend.scriptUrl + "?action=getVideoStats&video=" + encodeURIComponent(data.videoFile))
            .then(res => res.json())
            .then(stats => {
                const likeLabel = document.getElementById(`likes-${index}`);
                const commentLabel = document.getElementById(`comments-${index}`);
                const shareLabel = document.getElementById(`shares-${index}`);
                const bookmarkLabel = document.getElementById(`bookmarks-${index}`);
                
                if (likeLabel) { likeLabel.innerText = formatNumber(stats.likes); likeLabel.dataset.count = stats.likes; }
                if (commentLabel) { commentLabel.innerText = formatNumber(stats.comments); commentLabel.dataset.count = stats.comments; }
                if (shareLabel) { shareLabel.innerText = formatNumber(stats.shares); shareLabel.dataset.count = stats.shares; }
                if (bookmarkLabel) { bookmarkLabel.innerText = formatNumber(stats.bookmarks); bookmarkLabel.dataset.count = stats.bookmarks; }
            })
            .catch(err => console.log("Stats error:", err));
    });
}

// ===== COMMENTS =====
function loadComments(videoFile) {
    const list = document.getElementById("commentsList");
    list.innerHTML = "<div class='comment-item'>Loading...</div>";
    
    fetch(CONFIG.backend.scriptUrl + "?action=getComments&video=" + encodeURIComponent(videoFile))
        .then(res => res.json())
        .then(comments => {
            list.innerHTML = "";
            if (comments.length === 0) {
                list.innerHTML = "<div class='comment-item'>No comments yet. Pehla comment tum karo!</div>";
            } else {
                comments.forEach(c => {
                    const item = document.createElement("div");
                    item.className = "comment-item";
                    item.innerText = c;
                    list.appendChild(item);
                });
            }
        })
        .catch(() => { list.innerHTML = "<div class='comment-item'>Error loading.</div>"; });
}

// ===== SEND COMMENT =====
document.addEventListener("DOMContentLoaded", () => {
    const cBtn = document.getElementById("cBtn");
    if (cBtn) {
        cBtn.addEventListener("click", () => {
            const name = document.getElementById("cName").value.trim();
            const insta = document.getElementById("cInsta").value.trim();
            const txt = document.getElementById("cInput").value.trim();
            
            if (!name || !insta || !txt) return showToast("⚠️ Saare fields bharo!");
            
            localStorage.setItem("pt_name", name);
            localStorage.setItem("pt_insta", insta);
            
            const fullComment = `Name: ${name} | Insta: ${insta} | Msg: ${txt}`;
            sendToBackend({
                video: activeVideo,
                creator: activeCreator,
                action: "comment",
                comment: fullComment,
                user_id: getUserId()
            });
            
            const item = document.createElement("div");
            item.className = "comment-item";
            item.innerHTML = `<b>${name} (${insta}):</b> ${txt}`;
            document.getElementById("commentsList").appendChild(item);
            document.getElementById("cInput").value = "";
            showToast("✅ Comment bhej diya");
        });
    }
    
    const closePopup = document.getElementById("closePopup");
    if (closePopup) closePopup.addEventListener("click", () => {
        document.getElementById("commentPopup").style.display = "none";
    });
    
    const savesBtn = document.getElementById("savesBtn");
    if (savesBtn) savesBtn.addEventListener("click", () => {
        document.getElementById("savesPopup").style.display = "flex";
        renderSaves();
    });
    
    const closeSaves = document.getElementById("closeSaves");
    if (closeSaves) closeSaves.addEventListener("click", () => {
        document.getElementById("savesPopup").style.display = "none";
    });
});

function renderSaves() {
    const list = document.getElementById("savesList");
    const savedVideos = JSON.parse(localStorage.getItem("pt_saved_videos") || "[]");
    
    if (savedVideos.length === 0) {
        list.innerHTML = "<div class='empty-saves'>🔖 Koi saved video nahi hai.<br>Videos par 🔖 dabao.</div>";
        return;
    }
    
    list.innerHTML = savedVideos.map(v => `
        <div class="saved-item" onclick="goToVideo('${v.videoFile}')">
            <div class="creator">${v.creatorName} • ${v.instagramID}</div>
            <div class="desc">${v.description}</div>
        </div>
    `).join("");
}

window.goToVideo = function(videoFile) {
    document.getElementById("savesPopup").style.display = "none";
    showScreen('reels');
    setTimeout(() => {
        const target = document.querySelector(`[data-video-file="${videoFile}"]`);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
};
