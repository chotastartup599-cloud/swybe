// ==========================================
// 🔍 SEARCH MODULE - Discover Content
// ==========================================

window.loadSearch = function() {
    const screen = document.getElementById("screen-search");
    
    // Agar pehle se load hai toh dobara mat karo
    if (screen.dataset.loaded === "true") return;
    screen.dataset.loaded = "true";

    screen.innerHTML = `
        <div class="search-container">
            <!-- Search Bar -->
            <div class="search-bar-wrapper">
                <span class="search-icon">🔍</span>
                <input type="text" id="searchInput" placeholder="Search reels, notes, or creators..." onkeyup="performSearch()">
                <button class="clear-btn" id="clearSearch" onclick="clearSearch()" style="display:none;">✕</button>
            </div>

            <!-- Filter Chips -->
            <div class="filter-chips" id="filterChips">
                <button class="chip active" onclick="filterByCategory('all', this)">All</button>
                <button class="chip" onclick="filterByCategory('Current Affairs', this)">Current Affairs</button>
                <button class="chip" onclick="filterByCategory('Grammar', this)">Grammar</button>
                <button class="chip" onclick="filterByCategory('Maths', this)">Maths</button>
                <button class="chip" onclick="filterByCategory('Science', this)">Science</button>
            </div>

            <!-- Results Container -->
            <div class="search-results" id="searchResults">
                <!-- Results will load here -->
            </div>
        </div>
    `;

    // Initially show all data
    renderResults(videoDatabase);
};

// ===== PERFORM SEARCH (TEXT) =====
window.performSearch = function() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const clearBtn = document.getElementById("clearSearch");
    
    if (query.length > 0) {
        clearBtn.style.display = "block";
    } else {
        clearBtn.style.display = "none";
    }

    const filteredData = videoDatabase.filter(item => {
        return (
            item.creatorName.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            (item.hashtags && item.hashtags.toLowerCase().includes(query))
        );
    });

    renderResults(filteredData);
};

// ===== FILTER BY CATEGORY =====
window.filterByCategory = function(category, btnElement) {
    // Update active chip UI
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    btnElement.classList.add('active');

    // Clear search text
    document.getElementById("searchInput").value = "";
    document.getElementById("clearSearch").style.display = "none";

    if (category === 'all') {
        renderResults(videoDatabase);
        return;
    }

    const filteredData = videoDatabase.filter(item => item.category === category);
    renderResults(filteredData);
};

// ===== CLEAR SEARCH =====
window.clearSearch = function() {
    document.getElementById("searchInput").value = "";
    document.getElementById("clearSearch").style.display = "none";
    renderResults(videoDatabase);
};

// ===== RENDER RESULTS =====
function renderResults(data) {
    const container = document.getElementById("searchResults");
    
    if (data.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <span style="font-size: 40px;">🔍</span>
                <h3>No results found</h3>
                <p>Try searching for something else.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = data.map(item => `
        <div class="search-result-item" onclick="openReelFromFeed('${item.videoFile}')">
            <div class="result-thumbnail">
                <span>🎬</span>
            </div>
            <div class="result-info">
                <h4>${item.creatorName}</h4>
                <p>${item.description}</p>
                <span class="result-category">${item.category}</span>
            </div>
        </div>
    `).join("");
}
