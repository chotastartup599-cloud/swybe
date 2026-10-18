// ==========================================
// 🎬 REELS MODULE (Modern & Smooth)
// ==========================================

let activeVideoId = "";
let currentReelData = {}; 

const ICONS = {
    heart: `<svg viewBox="0 0 24 24" class="action-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    comment: `<svg viewBox="0 0 24 24" class="action-icon"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
    share: `<svg viewBox="0 0 24 24" class="action-icon"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`,
    save: `<svg viewBox="0 0 24 24" class="action-icon"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`,
    bigHeart: `<svg viewBox="0 0 24 24" class="double-tap-heart"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    smallHeart: `<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`
};

window.loadReels = async function() {
    // Top bar aur Nav bar transparent karne ke liye class add karo
    document.body.classList.add('reels-active');

    const feedContainer = document.getElementById("peerTubeFeed");
    feedContainer.innerHTML = `<div style="color:#fff; text-align:center; padding-top:50px;">Loading Reels...</div>`;

    try {
        const res = await fetch(CONFIG.backend.scriptUrl + "?action=getPosts");
        const posts = await res.json();
        const reels = posts.filter(p => p.status === 'approved' && p.type === 'reel');

        feedContainer.innerHTML = "";
        if (reels.length === 0) return feedContainer.innerHTML = `<div style="color:#fff; text-align:center; padding-top:50px;">No Reels found.</div>`;

        reels.forEach((data) => {
            currentReelData[data.id] = data;

            const card = document.createElement("div");
            card.className = "reel-card";
            const instaHandle = data.creatorEmail ? "@" + data.creatorEmail.split('@')[0] : "@swybe";

            card.innerHTML = `
                <div class="reel-top-gradient"></div>
                
                <!-- Video -->
                <video src="${data.mediaUrl}" loop playsinline preload="metadata" webkit-playsinline></video>
                
                <!-- Big Heart Animation element -->
                ${ICONS.bigHeart}

                <!-- Tap Area for Play/Pause & Double Tap -->
                <div class="video-tap-area" id="tap-${data.id}"></div>

                <div class="reel-bottom-gradient"></div>

                <div class="reel-bottom-info">
                    <div class="reel-user-header">
                        <img src="https://via.placeholder.com/40/FF0055/FFFFFF?text=${data.creatorName.charAt(0)}" class="reel-avatar">
                        <div class="reel-creator-details">
                            <span class="reel-creator-name">${data.creatorName}</span>
                            <button class="reel-follow-btn" onclick="toggleFollow(this)">Follow</button>
                        </div>
                    </div>
                    <div class="reel-title">${data.title}</div>
                    <div class="reel-caption">${data.caption}</div>
                </div>

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
                    <div class="action-btn-box" onclick="showToast('Saved!')">
                        ${ICONS.save}
                    </div>
                </div>
            `;

            const videoEl = card.querySelector("video");
            const tapArea = card.querySelector(`#tap-${data.id}`);
            const bigHeart = card.querySelector(".double-tap-heart");

            // 👇 PERFECT DOUBLE TAP LOGIC 👇
            let lastTap = 0;
            tapArea.addEventListener("click", (e) => {
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;

                if (tapLength < 300 && tapLength > 0) {
                    // Double Tap Detected
                    e.preventDefault();
                    
                    // Show Big Heart Animation
                    bigHeart.classList.remove("animate");
                    void bigHeart.offsetWidth; // trigger reflow
                    bigHeart.classList.add("animate");

                    // Trigger Like
                    const likeBtn = document.getElementById(`like-btn-${data.id}`);
                    if (!likeBtn.classList.contains('liked')) {
                        toggleLikeReel(data.id, likeBtn);
                    }
                } else {
                    // Single Tap - Pause/Play
                    if (videoEl.paused) {
                        videoEl.play();
                    } else {
                        videoEl.pause();
                    }
                }
                lastTap = currentTime;
            });

            feedContainer.appendChild(card);
        });

        // Auto Play Observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.intersectionRatio >= 0.8) {
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

// 🎯 LIKE TOGGLE
window.toggleLikeReel = async function(postId, btnElement) {
    const isLiked = btnElement.classList.contains('liked');
    const label = btnElement.querySelector('.action-label');
    let count = parseInt(label.innerText);

    if (isLiked) {
        btnElement.classList.remove('liked');
        label.innerText = Math.max(0, count - 1);
    } else {
        btnElement.classList.add('liked');
        label.innerText = count + 1;
        await fetch(CONFIG.backend.scriptUrl + "?action=likePost", { method: "POST", body: JSON.stringify({ id: postId, value: 1 }) });
    }
};

window.toggleFollow = function(btn) {
    btn.classList.toggle('following');
    btn.innerText = btn.classList.contains('following') ? "Following" : "Follow";
};

window.shareReel = function(id) {
    const shareUrl = window.location.origin + "?v=" + id;
    if (navigator.share) { navigator.share({ title: 'Swybe Reel', url: shareUrl }); } 
    else { navigator.clipboard.writeText(shareUrl); showToast("🔗 Link copied!"); }
};

// ==========================================
// 💬 INSTAGRAM STYLE COMMENTS
// ==========================================

window.openCommentPopup = function(postId) {
    activeVideoId = postId;
    document.getElementById("commentPopup").classList.add("active");
    document.querySelectorAll('.reel-card video').forEach(v => v.pause());
    loadComments(postId);
};

window.closeCommentPopup = function() {
    document.getElementById("commentPopup").classList.remove("active");
    const activeVideo = document.querySelector('.reel-card video');
    if (activeVideo) activeVideo.play().catch(e=>{});
};

async function loadComments(postId) {
    const list = document.getElementById("commentsList");
    list.innerHTML = "<div style='color:#666; text-align:center; padding:20px;'>Loading comments...</div>";
    
    try {
        const res = await fetch(CONFIG.backend.scriptUrl + "?action=getComments&postId=" + postId);
        const comments = await res.json();
        
        if(comments.length === 0) {
            list.innerHTML = "<div style='color:#666; text-align:center; padding:20px;'>No comments yet.</div>";
        } else {
            // Render comments with LIKE (Heart) button
            list.innerHTML = comments.map(c => `
                <div class="comment-item">
                    <div class="c-avatar">👤</div>
                    <div class="c-content">
                        <div class="c-name">${c.userName}</div>
                        <div>${c.text}</div>
                        <div class="c-actions">
                            <span onclick="replyToComment('${c.userName}')">Reply</span>
                            <span style="color:#555;">Just now</span>
                        </div>
                    </div>
                    <div class="c-like-btn" onclick="this.querySelector('svg').classList.toggle('liked')">
                        ${ICONS.smallHeart}
                    </div>
                </div>
            `).join("");
        }
    } catch(e) { 
        list.innerHTML = "<div style='color:red; text-align:center;'>Error loading comments.</div>"; 
    }
}

// Comment Input Logic
document.addEventListener("DOMContentLoaded", () => {
    const cInput = document.getElementById("cInput");
    const cBtn = document.getElementById("cBtn");

    // Input empty ho toh Post button disable rahe
    if(cInput) {
        cInput.addEventListener("input", () => {
            cBtn.disabled = cInput.value.trim().length === 0;
        });
    }

    if(cBtn) {
        cBtn.addEventListener("click", async () => {
            const txt = cInput.value.trim();
            if (!txt) return;
            
            const userName = currentUser ? currentUser.displayName : "Guest";
            
            document.getElementById("commentsList").innerHTML += `
                <div class="comment-item">
                    <div class="c-avatar">👤</div>
                    <div class="c-content">
                        <div class="c-name">${userName}</div>
                        <div>${txt}</div>
                        <div class="c-actions"><span>Just now</span></div>
                    </div>
                </div>`;
            
            cInput.value = "";
            cBtn.disabled = true;
            
            const list = document.getElementById("commentsList");
            list.scrollTop = list.scrollHeight;

            await fetch(CONFIG.backend.scriptUrl + "?action=addComment", { 
                method: "POST", body: JSON.stringify({ postId: activeVideoId, userName: userName, text: txt }) 
            });
        });
    }
});

window.replyToComment = function(userName) {
    const input = document.getElementById("cInput");
    input.value = `@${userName} `;
    input.focus();
    document.getElementById("cBtn").disabled = false;
};
