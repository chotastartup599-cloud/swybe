// ==========================================
// 🎬 REELS MODULE (Perfect Version)
// ==========================================

let activeVideoId = "";

window.loadReels = async function() {
    const feedContainer = document.getElementById("peerTubeFeed");
    feedContainer.innerHTML = `<div style="color:#fff; text-align:center; padding-top:50px;">Loading Reels...</div>`;

    try {
        const res = await fetch(CONFIG.backend.scriptUrl + "?action=getPosts");
        const posts = await res.json();
        
        // Sirf Reels jo Approved hain
        const reels = posts.filter(p => p.status === 'approved' && p.type === 'reel');

        feedContainer.innerHTML = "";
        if (reels.length === 0) {
            feedContainer.innerHTML = `<div style="color:#fff; text-align:center; padding-top:50px;">Koi Reel nahi mili.</div>`;
            return;
        }

        reels.forEach((data, index) => {
            const card = document.createElement("div");
            card.className = "reel-card";
            
            card.innerHTML = `
                <video src="${data.mediaUrl}" muted loop playsinline preload="metadata" webkit-playsinline></video>
                <button class="sound-btn">🔇</button>
                
                <div class="instagram-style-overlay">
                    <div class="user-header">
                        <div class="user-avatar-small" style="background:#FF0055; display:flex; justify-content:center; align-items:center;">👤</div>
                        <div class="user-info-block">
                            <span class="user-name-reel">${data.creatorName}</span>
                            <span class="user-insta-reel">@swybe</span>
                        </div>
                    </div>
                    <div class="video-desc"><b>${data.title}</b><br>${data.caption}</div>
                </div>
                
                <div class="social-sidebar">
                    <div class="btn-box id-like">
                        <div class="circle-btn">❤️</div>
                        <span class="btn-label" id="likes-${index}">${data.likes || 0}</span>
                    </div>
                    <div class="btn-box id-comment">
                        <div class="circle-btn">💬</div>
                        <span class="btn-label" id="comments-${index}">${data.comments || 0}</span>
                    </div>
                </div>
            `;

            // 1. SOUND BUTTON
            const videoEl = card.querySelector("video");
            card.querySelector(".sound-btn").onclick = (e) => {
                e.stopPropagation();
                SOUND_ENABLED = !SOUND_ENABLED;
                document.querySelectorAll(".reel-card video").forEach(v => v.muted = !SOUND_ENABLED);
                document.querySelectorAll(".sound-btn").forEach(b => b.innerText = SOUND_ENABLED ? "🔊" : "🔇");
            };

            // 2. LIKE BUTTON
            const likeLabel = card.querySelector(`#likes-${index}`);
            card.querySelector(".id-like").onclick = async () => {
                likeLabel.innerText = Number(likeLabel.innerText) + 1;
                await fetch(CONFIG.backend.scriptUrl + "?action=likePost", {
                    method: "POST", body: JSON.stringify({ id: data.id, value: 1 })
                });
            };

            // 3. COMMENT BUTTON
            card.querySelector(".id-comment").onclick = () => {
                activeVideoId = data.id;
                document.getElementById("commentPopup").style.display = "flex";
                loadComments(data.id);
            };

            // 4. VIEW TRACKING (Naya)
            videoEl.addEventListener("play", () => {
                if (card.dataset.viewed === "true") return;
                card.dataset.viewed = "true";
                setTimeout(async () => {
                    if (!videoEl.paused) {
                        await fetch(CONFIG.backend.scriptUrl + "?action=addView", {
                            method: "POST", body: JSON.stringify({ id: data.id })
                        });
                    }
                }, 3000); // 3 second baad view count hoga
            });

            feedContainer.appendChild(card);
        });

        // 5. AUTO PLAY
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.intersectionRatio >= 0.6) entry.target.play().catch(e=>{});
                else entry.target.pause();
            });
        }, { root: feedContainer, threshold: [0.6] });
        document.querySelectorAll('.reel-card video').forEach(v => observer.observe(v));

    } catch (error) {
        console.error(error);
        feedContainer.innerHTML = `<div style="color:red; text-align:center;">Error loading reels</div>`;
    }
};

// ===== COMMENTS LOAD & SEND =====
async function loadComments(postId) {
    const list = document.getElementById("commentsList");
    list.innerHTML = "<div style='color:#666;'>Loading...</div>";
    try {
        const res = await fetch(CONFIG.backend.scriptUrl + "?action=getComments&postId=" + postId);
        const comments = await res.json();
        list.innerHTML = comments.length === 0 ? "<div style='color:#666;'>No comments yet.</div>" : 
            comments.map(c => `<div class="comment-item"><b>${c.userName}</b><br>${c.text}</div>`).join("");
    } catch(e) { list.innerHTML = "Error."; }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("closePopup")?.addEventListener("click", () => document.getElementById("commentPopup").style.display = "none");

    document.getElementById("cBtn")?.addEventListener("click", async () => {
        const txt = document.getElementById("cInput").value.trim();
        if (!txt) return showToast("⚠️ Likho kuch!");
        
        const userName = currentUser ? currentUser.displayName : "Guest";
        document.getElementById("commentsList").innerHTML += `<div class="comment-item"><b>${userName}</b><br>${txt}</div>`;
        document.getElementById("cInput").value = "";

        await fetch(CONFIG.backend.scriptUrl + "?action=addComment", {
            method: "POST", body: JSON.stringify({ postId: activeVideoId, userName: userName, text: txt })
        });
        showToast("✅ Comment added!");
    });
});
