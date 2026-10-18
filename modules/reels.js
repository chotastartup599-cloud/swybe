// ==========================================
// 🎬 REELS MODULE (Modern & Smooth)
// ==========================================

let activeVideoId = "";
let currentReelData = {}; 

// SVG Icons (Emojis ki jagah)
const ICONS = {
    heart: `<svg viewBox="0 0 24 24" class="action-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    comment: `<svg viewBox="0 0 24 24" class="action-icon"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
    share: `<svg viewBox="0 0 24 24" class="action-icon"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`,
    save: `<svg viewBox="0 0 24 24" class="action-icon"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`,
    bigHeart: `<svg viewBox="0 0 24 24" class="double-tap-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`
};

window.loadReels = async function() {
    const feedContainer = document.getElementById("peerTubeFeed");
    feedContainer.innerHTML = `<div style="color:#fff; text-align:center; padding-top:50px;">Loading Reels...</div>`;

    try {
        const res = await fetch(CONFIG.backend.scriptUrl + "?action=getPosts");
        const posts = await res.json();
        const reels = posts.filter(p => p.status === 'approved' && p.type === 'reel');

        feedContainer.innerHTML = "";
        if (reels.length === 0) {
            return feedContainer.innerHTML = `<div style="color:#fff; text-align:center; padding-top:50px;">No Reels found.</div>`;
        }

        reels.forEach((data, index) => {
            currentReelData[data.id] = data; // Save data for interactions

            const card = document.createElement("div");
            card.className = "reel-card";
            
            // Insta Handle (Email se nikal rahe hain for now)
            const instaHandle = data.creatorEmail ? "@" + data.creatorEmail.split('@')[0] : "@swybe_creator";

            card.innerHTML = `
                <!-- Top Gradient -->
                <div class="reel-top-gradient"></div>
                
                <!-- Video -->
                <video src="${data.mediaUrl}" loop playsinline preload="metadata" webkit-playsinline></video>
                
                <!-- Tap Area for Play/Pause -->
                <div class="video-tap-area" id="tap-${data.id}"></div>

                <!-- Double Tap Big Heart -->
                ${ICONS.bigHeart}

                <!-- Bottom Gradient -->
                <div class="reel-bottom-gradient"></div>

                <!-- Bottom Info: Creator & Desc -->
                <div class="reel-bottom-info">
                    <div class="reel-user-header">
                        <img src="https://via.placeholder.com/40/FF0055/FFFFFF?text=${data.creatorName.charAt(0)}" class="reel-avatar">
                        <div class="reel-creator-details">
                            <div class="reel-creator-name">
                                ${data.creatorName} 
                                <button class="reel-follow-btn" onclick="toggleFollow(this)">Follow</button>
                            </div>
                            <div class="reel-insta-handle">${instaHandle}</div>
                        </div>
                    </div>
                    <div class="reel-title">${data.title}</div>
                    <div class="reel-caption">${data.caption}</div>
                </div>

                <!-- Right Sidebar Actions -->
                <div class="reel-actions-sidebar">
                    <div class="action-btn-box" id="like-btn-${data.id}" onclick="toggleLikeReel('${data.id}', this)">
                        ${ICONS.heart}
                        <span class="action-label" id="likes-${data.id}">${data.likes || 0}</span>
                    </div>
                    
                    <div class="action-btn-box" onclick="openCommentPopup('${data.id}')">
                        ${ICONS.comment}
                        <span class="action-label">${data.comments || 0}</span>
                    </div>
                    
                    <div class="action-btn-box" onclick="shareReel('${data.id}')">
                        ${ICONS.share}
                        <span class="action-label">Share</span>
                    </div>
                    
                    <div class="action-btn-box" id="save-btn-${data.id}" onclick="toggleSaveReel(this)">
                        ${ICONS.save}
                        <span class="action-label">Save</span>
                    </div>
                </div>
            `;

            const videoEl = card.querySelector("video");
            const tapArea = card.querySelector(`#tap-${data.id}`);
            const bigHeart = card.querySelector(".double-tap-heart");

            // Play/Pause on Single Tap & Double Tap Detection
            let tapTimeout;
            tapArea.onclick = (e) => {
                if (tapTimeout) {
                    // Double Tap Detected
                    clearTimeout(tapTimeout);
                    tapTimeout = null;
                    
                    // Show Big Heart Animation
                    bigHeart.classList.add("animate");
                    setTimeout(() => bigHeart.classList.remove("animate"), 800);
                    
                    // Trigger Like
                    const likeBtn = document.getElementById(`like-btn-${data.id}`);
                    if(!likeBtn.classList.contains('liked')) {
                        toggleLikeReel(data.id, likeBtn);
                    }
                } else {
                    // Single Tap - Wait for 300ms to see if it's a double tap
                    tapTimeout = setTimeout(() => {
                        tapTimeout = null;
                        if (videoEl.paused) {
                            videoEl.play();
                        } else {
                            videoEl.pause();
                        }
                    }, 300);
                }
            };

            feedContainer.appendChild(card);
        });

        // Auto Play (Intersection Observer) - Very Strict threshold
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.intersectionRatio >= 0.8) { // 80% visible tabhi play hogi
                    video.muted = !SOUND_ENABLED;
                    video.play().catch(e=>{});
                } else {
                    video.pause();
                }
            });
        }, { root: feedContainer, threshold: [0.8] });
        
        document.querySelectorAll('.reel-card video').forEach(v => observer.observe(v));

    } catch (error) {
        console.error(error);
        feedContainer.innerHTML = `<div style="color:red; text-align:center;">Error loading reels</div>`;
    }
};

// ==========================================
// ❤️ INTERACTIONS
// ==========================================

// Like Toggle
window.toggleLikeReel = async function(postId, btnElement) {
    const isLiked = btnElement.classList.contains('liked');
    const label = btnElement.querySelector('.action-label');
    let count = parseInt(label.innerText);

    if (isLiked) {
        btnElement.classList.remove('liked');
        label.innerText = count - 1;
        // API Call for Unlike (-1) - Backend logic update needed later
    } else {
        btnElement.classList.add('liked');
        label.innerText = count + 1;
        // API Call for Like (+1)
        await fetch(CONFIG.backend.scriptUrl + "?action=likePost", { 
            method: "POST", 
            body: JSON.stringify({ id: postId, value: 1 }) 
        });
    }
};

// Follow Toggle
window.toggleFollow = function(btn) {
    if (btn.classList.contains('following')) {
        btn.classList.remove('following');
        btn.innerText = "Follow";
    } else {
        btn.classList.add('following');
        btn.innerText = "Following";
    }
};

// Save Toggle
window.toggleSaveReel = function(btn) {
    btn.classList.toggle('liked'); // 'liked' class se color change hoga
    showToast(btn.classList.contains('liked') ? "Saved! 🔖" : "Removed! 🗑️");
};

// Share Reel
window.shareReel = function(id) {
    const shareUrl = window.location.origin + "?v=" + id;
    if (navigator.share) {
        navigator.share({ title: 'Swybe Reel', url: shareUrl });
    } else {
        navigator.clipboard.writeText(shareUrl);
        showToast("🔗 Link copied!");
    }
};

// ==========================================
// 💬 MODERN COMMENT BOX LOGIC
// ==========================================

window.openCommentPopup = function(postId) {
    activeVideoId = postId;
    const popup = document.getElementById("commentPopup");
    popup.classList.add("active"); // Slide up animation
    
    // Pause video when comments open
    document.querySelectorAll('.reel-card video').forEach(v => v.pause());

    loadComments(postId);
};

window.closeCommentPopup = function() {
    const popup = document.getElementById("commentPopup");
    popup.classList.remove("active");
    
    // Play the currently visible video again
    const activeVideo = document.querySelector('.reel-card video');
    if(activeVideo) activeVideo.play().catch(e=>{});
};

// Load Comments (Backend)
async function loadComments(postId) {
    const list = document.getElementById("commentsList");
    list.innerHTML = "<div style='color:#666; text-align:center; padding:20px;'>Loading comments...</div>";
    try {
        const res = await fetch(CONFIG.backend.scriptUrl + "?action=getComments&postId=" + postId);
        const comments = await res.json();
        
        if(comments.length === 0) {
            list.innerHTML = "<div style='color:#666; text-align:center; padding:20px;'>No comments yet. Be the first to comment!</div>";
        } else {
            list.innerHTML = comments.map(c => `
                <div class="comment-item">
                    <div class="c-avatar">👤</div>
                    <div class="c-content">
                        <div class="c-name">${c.userName}</div>
                        <div>${c.text}</div>
                        <div class="c-actions">
                            <span onclick="replyToComment('${c.userName}')">Reply</span>
                            <span style="color:#888;">${c.time || 'Just now'}</span>
                        </div>
                    </div>
                </div>
            `).join("");
        }
    } catch(e) { 
        list.innerHTML = "<div style='color:red; text-align:center;'>Error loading comments.</div>"; 
    }
}

// Post Comment
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("cBtn")?.addEventListener("click", async () => {
        const txt = document.getElementById("cInput").value.trim();
        if (!txt) return;
        
        const userName = currentUser ? currentUser.displayName : "Guest";
        
        // Optimistic UI (Instantly add to list)
        document.getElementById("commentsList").innerHTML += `
            <div class="comment-item">
                <div class="c-avatar">👤</div>
                <div class="c-content">
                    <div class="c-name">${userName}</div>
                    <div>${txt}</div>
                    <div class="c-actions"><span>Just now</span></div>
                </div>
            </div>`;
        
        document.getElementById("cInput").value = "";
        
        // Scroll to bottom
        const list = document.getElementById("commentsList");
        list.scrollTop = list.scrollHeight;

        // Send to backend
        await fetch(CONFIG.backend.scriptUrl + "?action=addComment", { 
            method: "POST", 
            body: JSON.stringify({ postId: activeVideoId, userName: userName, text: txt }) 
        });
    });
});

// Reply logic (Auto-fill @username)
window.replyToComment = function(userName) {
    const input = document.getElementById("cInput");
    input.value = `@${userName} `;
    input.focus();
};
