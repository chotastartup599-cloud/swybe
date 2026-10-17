// ==========================================
// 🛡️ ADMIN DASHBOARD MODULE
// ==========================================

window.loadAdmin = async function() {
    const screen = document.getElementById("screen-admin");
    screen.innerHTML = `<div style="text-align:center; padding:50px; color:#fff;">Loading...</div>`;

    try {
        const res = await fetch(CONFIG.backend.scriptUrl + "?action=getPosts");
        const posts = await res.json();

        let html = `<div style="padding: 20px;">
            <h2 style="color: #FF0055; font-size: 24px; margin-bottom: 15px;">Admin Dashboard</h2>
            <div style="display:flex; flex-direction:column; gap:10px;">`;

        if (posts.length === 0) {
            html += `<p style="color:#888;">No posts available.</p>`;
        } else {
            posts.forEach(p => {
                const isApproved = p.status === 'approved';
                html += `
                    <div style="background:#1a1a1a; padding:15px; border-radius:12px; border-left: 4px solid ${isApproved ? '#4CAF50' : '#FF9800'};">
                        <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                            <span style="color:${isApproved ? '#4CAF50' : '#FF9800'}; font-size:12px; font-weight:bold;">● ${p.status.toUpperCase()}</span>
                            <span style="color:#888; font-size:12px;">${p.type.toUpperCase()}</span>
                        </div>
                        <h4 style="color:#fff; margin:0 0 5px 0;">${p.title}</h4>
                        <div style="display:flex; gap:10px; margin-top:10px;">
                            ${!isApproved ? `<button onclick="approvePost('${p.id}')" style="background:#4CAF50; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-weight:bold; cursor:pointer;">Approve</button>` : ''}
                            <button onclick="deletePostAdmin('${p.id}')" style="background:#FF0055; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-weight:bold; cursor:pointer;">Delete</button>
                        </div>
                    </div>`;
            });
        }
        html += `</div></div>`;
        screen.innerHTML = html;

    } catch (e) {
        screen.innerHTML = `<div style="color:red; padding:20px;">Error loading admin data.</div>`;
    }
};

window.approvePost = async function(postId) {
    await fetch(CONFIG.backend.scriptUrl + "?action=approvePost", {
        method: "POST", body: JSON.stringify({ id: postId })
    });
    showToast("✅ Approved!");
    loadAdmin();
};

window.deletePostAdmin = async function(postId) {
    if(!confirm("Delete this post?")) return;
    await fetch(CONFIG.backend.scriptUrl + "?action=deletePost", {
        method: "POST", body: JSON.stringify({ id: postId })
    });
    showToast("🗑️ Deleted!");
    loadAdmin();
};
