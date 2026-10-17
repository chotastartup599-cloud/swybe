// ==========================================
// 🔍 SEARCH MODULE (Google Sheets)
// ==========================================

let allSearchPosts = [];

window.loadSearch = async function() {
    const screen = document.getElementById("screen-search");
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
        const res = await fetch(CONFIG.backend.scriptUrl + "?action=getPosts");
        const posts = await res.json();
        
        // Sirf approved posts search me aayen
        allSearchPosts = posts.filter(p => p.status === 'approved');
        renderResults(allSearchPosts);
    } catch (e) {
        document.getElementById("searchResults").innerHTML = `<div style="color:red; text-align:center;">Error loading data.</div>`;
    }
};

window.performSearch = function() {
    const query = document.getElementById("searchInput").value.toLowerCase().trim();
    if (query === "") return renderResults(allSearchPosts);

    const filtered = allSearchPosts.filter(p => {
        const title = (p.title || "").toLowerCase();
        const creator = (p.creatorName || "").toLowerCase();
        return title.includes(query) || creator.includes(query);
    });
    renderResults(filtered);
};

function renderResults(posts) {
    const container = document.getElementById("searchResults");
    if (posts.length === 0) {
        container.innerHTML = `<div class="no-results"><h3>No results found</h3></div>`;
        return;
    }
    container.innerHTML = posts.map(p => `
        <div class="search-result-item">
            <div class="result-thumbnail">${p.type === 'reel' ? '🎬' : '📖'}</div>
            <div class="result-info">
                <h4>${p.title}</h4>
                <p>${p.caption}</p>
                <span class="result-category">${p.creatorName}</span>
            </div>
        </div>
    `).join("");
}
