// ==========================================
// 🛡️ ADMIN DASHBOARD MODULE
// ==========================================

window.loadAdmin = async function() {
    const screen = document.getElementById("screen-admin");
    screen.innerHTML = `<div style="text-align:center; padding:50px; color:#fff;">Loading Admin Data...</div>`;

    try {
        // Saare posts fetch karo (Latest first)
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Appwrite.Query.orderDesc('$createdAt')]
        );

        const posts = response.documents;
        let html = `
            <div style="padding: 20px;">
                <h2 style="color: #FF0055; font-size: 24px; margin-bottom: 5px;">Admin Dashboard</h2>
                <p style="color: #888; font-size: 14px; margin-bottom: 20px;">Manage all content here.</p>
                <div style="display:flex; flex-direction:column; gap:10px;">
        `;

        if (posts.length === 0) {
            html += `<p style="color:#888;">No posts available.</p>`;
        } else {
            posts.forEach(p => {
                const isApproved = p.status === 'approved';
                const statusColor = isApproved ? '#4CAF50' : '#FF9800';
                const statusText = isApproved ? 'Approved' : 'Pending';
                
                html += `
                    <div style="background:#1a1a1a; padding:15px; border-radius:12px; border-left: 4px solid ${statusColor};">
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <span style="color:${statusColor}; font-size:12px; font-weight:bold;">● ${statusText}</span>
                            <span style="color:#888; font-size:12px;">${p.type.toUpperCase()}</span>
                        </div>
                        <h4 style="color:#fff; margin:0 0 5px 0;">${p.title}</h4>
                        <p style="color:#aaa; font-size:13px; margin:0 0 10px 0;">${p.caption}</p>
                        
                        <div style="display:flex; gap:10px;">
                            ${!isApproved ? `<button onclick="approvePost('${p.$id}')" style="background:#4CAF50; color:#fff; border:none; padding:8px 15px; border-radius:6px; font-weight:bold; cursor:pointer;">Approve</button>` : ''}
                            <button onclick="deletePostAdmin('${p.$id}')" style="background:#FF0055; color:#fff; border:none; padding:8px 15px; border-radius:6px; font-weight:bold; cursor:pointer;">Delete</button>
                        </div>
                    </div>
                `;
            });
        }

        html += `</div></div>`;
        screen.innerHTML = html;

    } catch (error) {
        console.error("Admin Error:", error);
        screen.innerHTML = `<div style="color:#FF0055; padding:20px;">Error loading admin data.</div>`;
    }
};

// ===== APPROVE POST =====
window.approvePost = async function(postId) {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID,
            postId,
            { status: "approved" }
        );
        showToast("✅ Post Approved!");
        loadAdmin(); // Refresh list
    } catch (error) {
        showToast("❌ Error approving post.");
        console.error(error);
    }
};

// ===== DELETE POST =====
window.deletePostAdmin = async function(postId) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    try {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, postId);
        showToast("🗑️ Post Deleted!");
        loadAdmin(); // Refresh list
    } catch (error) {
        showToast("❌ Error deleting post.");
        console.error(error);
    }
};
