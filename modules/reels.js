// ==========================================
// 🎬 REELS MODULE (Instagram Style)
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
        if (reels.length === 0) return feedContainer.innerHTML = `<div style="color:#fff; text-align:center; padding-top:50px;">No Reels found.</div>`;

        reels.forEach((data, index) => {
            const card = document.createElement("div");
            card.className = "reel-card";
            const isSaved = localStorage.getItem("saved_" + data.id) === "true";
            
            card.innerHTML = `
                <video src="${data.mediaUrl}" muted loop playsinline preload="metadata" webkit-playsinline></video>
                <button class="sound-btn">${SOUND_ENABLED ? '🔊' : '🔇'}</button>
                
                <div class="instagram-style-overlay">
                    <div class="user-header">
                        <div class="user-avatar-small" style="background:#FF0055; display:flex; justify-content:center; align-items:center;">👤</div>
                        <div class="user-info-block">
                            <span class="user-name-reel">${data.creatorName}</span>
                        </div>
                        <button class="follow-btn">Follow</button>
                    </div>
                    <div class="video-desc"><b>${data.title}</b><br>${data.caption} <span style="color:#1A73E8;">${data.tags || ''}</span></div>
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
                    <div class="btn-box id-save">
                        <div class="circle-btn ${isSaved ? 'bookmarked' : ''}">🔖</div>
                        <span class="btn-label">Save</span>
                    </div>
                </div>
            `;

            const videoEl = card.querySelector("video");
            
            // Sound Logic
            card.querySelector(".sound-btn").onclick = (e) => {
                e.stopPropagation();
                SOUND_ENABLED = !SOUND_ENABLED;
                document.querySelectorAll(".reel-card video").forEach(v => v.muted = !SOUND_ENABLED);
                document.querySelectorAll(".sound-btn").forEach(b => b.innerText = SOUND_ENABLED ? "🔊" : "🔇");
            };

            // Like
            const likeLabel = card.querySelector(`#likes-${index}`);
            card.querySelector(".id-like").onclick = async () => {
                likeLabel.innerText = Number(likeLabel.innerText) + 1;
                await fetch(CONFIG.backend.scriptUrl + "?action=likePost", { method: "POST", body: JSON.stringify({ id: data.id, value: 1 }) });
            };

            // Save
            const saveBtn = card.querySelector(".id-save .circle-btn");
            card.querySelector(".id-save").onclick = () => {
                const nowSaved = saveBtn.classList.toggle("bookmarked");
                localStorage.setItem("saved_" + data.id, nowSaved);
                showToast(nowSaved ? "🔖 Saved!" : "Removed");
            };

            // Comment
            card.querySelector(".id-comment").onclick = () => {
                activeVideoId = data.id;
                document.getElementById("commentPopup").style.display = "flex";
                loadComments(data.id);
            };

            feedContainer.appendChild(card);
        });

        // Auto Play (Intersection Observer)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const vid = entry.target;
                if (entry.intersectionRatio >= 0.6) {
                    vid.muted = !SOUND_ENABLED;
                    vid.play().catch(e=>{});
                } else {
                    vid.pause();
                }
            });
        }, { root: feedContainer, threshold: [0.6] });
        document.querySelectorAll('.reel-card video').forEach(v => observer.observe(v));

    } catch (error) {
        feedContainer.innerHTML = `<div style="color:red; text-align:center;">Error loading reels</div>`;
    }
};

// Comments (Modern)
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
                    <div class="c-content">
                        <div class="c-name">${c.userName}</div>
                        <div>${c.text}</div>
                        <div class="c-actions"><span>Reply</span></div>
                    </div>
                </div>
            `).join("");
    } catch(e) { list.innerHTML = "Error."; }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("closePopup")?.addEventListener("click", () => document.getElementById("commentPopup").style.display = "none");

    document.getElementById("cBtn")?.addEventListener("click", async () => {
        const txt = document.getElementById("cInput").value.trim();
        if (!txt) return;
        
        const userName = currentUser ? currentUser.displayName : "Guest";
        document.getElementById("commentsList").innerHTML += `<div class="comment-item"><div class="c-avatar">👤</div><div class="c-content"><div class="c-name">${userName}</div><div>${txt}</div></div></div>`;
        document.getElementById("cInput").value = "";

        await fetch(CONFIG.backend.scriptUrl + "?action=addComment", { method: "POST", body: JSON.stringify({ postId: activeVideoId, userName: userName, text: txt }) });
        showToast("✅ Comment added!");
    });
});
