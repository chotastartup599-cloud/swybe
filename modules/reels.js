// ==========================================
// 🎬 REELS MODULE (Google Sheets)
// ==========================================

let activeVideoId = "";

window.loadReels = async function() {
    const feedContainer = document.getElementById("peerTubeFeed");
    feedContainer.innerHTML = `<div style="color:#fff; text-align:center; padding-top:50px;">Loading Reels...</div>`;

    try {
        const res = await fetch(CONFIG.backend.scriptUrl + "?action=getPosts");
        const posts = await res.json();
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

            // Sound Button
            const soundBtn = card.querySelector(".sound-btn");
            soundBtn.onclick = (e) => {
                e.stopPropagation();
                SOUND_ENABLED = !SOUND_ENABLED;
                document.querySelectorAll(".reel-card video").forEach(v => {
                    v.muted = !SOUND_ENABLED;
                });
                document.querySelectorAll(".sound-btn").forEach(b => {
                    b.innerText = SOUND_ENABLED ? "🔊" : "🔇";
                });
            };

            // Like Button
            const likeLabel = card.querySelector(`#likes-${index}`);
            card.querySelector(".id-like").onclick = async () => {
                likeLabel.innerText = Number(data.likes) + 1;
                data.likes++;
                await fetch(CONFIG.backend.scriptUrl + "?action=likePost", {
                    method: "POST", 
                    body: JSON.stringify({ id: data.id, value: 1 })
                });
            };

            // Comment Button
            card.querySelector(".id-comment").onclick = () => {
                activeVideoId = data.id;
                activeCreator = data.creatorName;
                document.getElementById("commentPopup").style.display = "flex";
                loadComments(data.id);
            };

            feedContainer.appendChild(card);
        });

        // Auto-Play Logic
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.intersectionRatio >= 0.6) {
                    entry.target.play();
                } else {
                    entry.target.pause();
                }
            });
        }, { root: feedContainer, threshold: [0.6] });
        
        document.querySelectorAll('.reel-card video').forEach(v => observer.observe(v));

    } catch (error) {
        console.error(error);
        feedContainer.innerHTML = `<div style="color:red; text-align:center;">Error loading reels</div>`;
    }
};

// ===== COMMENTS LOGIC =====
async function loadComments(postId) {
    const list = document.getElementById("commentsList");
    list.innerHTML = "<div style='color:#666;'>Loading...</div>";
    try {
        const res = await fetch(CONFIG.backend.scriptUrl + "?action=getComments&postId=" + postId);
        const comments = await res.json();
        list.innerHTML = comments.length === 0 ? "<div style='color:#666;'>No comments yet.</div>" : 
            comments.map(c => `
                <div class="comment-item">
                    <div class="c-avatar">👤</div>
                    <div class="c-content"><div class="c-name">${c.userName}</div><div>${c.text}</div></div>
                </div>
            `).join("");
    } catch(e) { list.innerHTML = "Error loading."; }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("closePopup")?.addEventListener("click", () => {
        document.getElementById("commentPopup").style.display = "none";
    });

    document.getElementById("cBtn")?.addEventListener("click", async () => {
        const txt = document.getElementById("cInput").value.trim();
        if (!txt) return showToast("⚠️ Comment likho!");
        
        const userName = currentUser ? currentUser.displayName : "Guest";
        
        // Optimistic UI update
        const list = document.getElementById("commentsList");
        list.innerHTML += `<div class="comment-item"><div class="c-avatar">👤</div><div class="c-content"><div class="c-name">${userName}</div><div>${txt}</div></div></div>`;
        document.getElementById("cInput").value = "";

        await fetch(CONFIG.backend.scriptUrl + "?action=addComment", {
            method: "POST",
            body: JSON.stringify({ postId: activeVideoId, userName: userName, text: txt })
        });
        showToast("✅ Comment added!");
    });
});
