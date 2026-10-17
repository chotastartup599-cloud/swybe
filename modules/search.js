// ==========================================
// 🔍 SEARCH MODULE - Appwrite Data
// ==========================================

let allSearchPosts = []; // Saara data yahan save hoga

window.loadSearch = async function() {
    const screen = document.getElementById("screen-search");
    
    // Loading UI
    screen.innerHTML = `
        <div class="search-container">
            <div class="search-bar-wrapper">
                <span class="search-icon">🔍</span>
                <input type="text" id="searchInput" placeholder="Search reels or creators..." onkeyup="performSearch()">
            </div>
            <div class="search-results" id="searchResults">
                <div style="text-align:center; padding:50px; color:#666;">Loading Data...</div>
            </div>
        </div>
    `;

    try {
        // Appwrite se saare approved posts fetch karo
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [
                Appwrite.Query.equal('status', 'approved'),
                Appwrite.Query.orderDesc('$createdAt')
            ]
        );

        allSearchPosts = response.documents;
        renderResults(allSearchPosts); // Initially sab dikhao

    } catch (error) {
        console.error("Search Load Error:", error);
        document.getElementById("searchResults").innerHTML = `<div style="color:#FF0055; text-align:center;">Error loading data.</div>`;
    }
};

// ===== SEARCH LOGIC =====
window.performSearch = function() {
    const query = document.getElementById("searchInput").value.toLowerCase().trim();
    
    if (query === "") {
        renderResults(allSearchPosts); // Agar khali hai toh sab dikhao
        return;
    }

    // Title, Caption, ya Creator Name me se kisi me bhi match karo
    const filtered = allSearchPosts.filter(post => {
        const title = (post.title || "").toLowerCase();
        const caption = (post.caption || "").toLowerCase();
        const creator = (post.creatorName || "").toLowerCase();
        
        return title.includes(query) || caption.includes(query) || creator.includes(query);
    });

    renderResults(filtered);
};

// ===== RENDER RESULTS =====
function renderResults(posts) {
    const container = document.getElementById("searchResults");
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <span style="font-size: 40px;">🔍</span>
                <h3>No results found</h3>
                <p>Try searching for something else.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = posts.map(p => `
        <div class="search-result-item" onclick="openSearchResult('${p.type}', '${p.$id}')">
            <div class="result-thumbnail">
                ${p.type === 'reel' ? '🎬' : p.type === 'story' ? '📖' : '🧪'}
            </div>
            <div class="result-info">
                <h4>${p.title}</h4>
                <p>${p.caption}</p>
                <span class="result-category">${p.creatorName || 'User'}</span>
            </div>
        </div>
    `).join("");
}

// ===== CLICK PAR KYA HONA CHAHIYE =====
window.openSearchResult = function(type, postId) {
    // Abhi ke liye hum sirf reels tab par bhej rahe hain
    // Agar reel hai toh Reels screen par jao
    if (type === 'reel') {
        showScreen('reels');
        // Aur scroll karke us video par le jao (baad me add karenge)
    } else {
        showToast("🚧 " + type.toUpperCase() + " page coming soon!");
    }
};
