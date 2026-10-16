// ==========================================
// 📖 STORIES MODULE - Auto-advance + Arrows + Seen Tracking
// ==========================================

const storiesContent = {
    science: [
        { type: "text", title: "Chemical Reaction", text: "Woh process jisme reactants milkar products banate hain.", color: "linear-gradient(135deg, #1A73E8, #4A90E2)" },
        { type: "poll", title: "Quick Poll", question: "Photosynthesis me kya chahiye?", options: ["Sunlight", "Oxygen", "Nitrogen"], votes: [45, 12, 8] },
        { type: "text", title: "Exam Tip", text: "Class 10 Science me 80% marks NCERT se aate hain.", color: "linear-gradient(135deg, #2E7D32, #4CAF50)" }
    ],
    maths: [
        { type: "text", title: "Real Numbers", text: "HCF aur LCM ka connection: HCF × LCM = Product of Numbers", color: "linear-gradient(135deg, #FF0055, #FF4D88)" },
        { type: "text", title: "Trigonometry", text: "sin²θ + cos²θ = 1 — yeh identity hamesha yaad rakho!", color: "linear-gradient(135deg, #6A1B9A, #9C27B0)" }
    ],
    sst: [
        { type: "text", title: "History Tip", text: "Treaty of Vienna 1815 me hui thi.", color: "linear-gradient(135deg, #6A1B9A, #9C27B0)" }
    ],
    english: [
        { type: "text", title: "Grammar Tip", text: "Subject-Verb Agreement: Singular subject, singular verb.", color: "linear-gradient(135deg, #2E7D32, #4CAF50)" }
    ],
    hindi: [
        { type: "text", title: "Hindi Tip", text: "व्याकरण में संधि और समास को अच्छे से पढ़ें।", color: "linear-gradient(135deg, #E65100, #FF9800)" }
    ],
    current: [
        { type: "text", title: "Aaj Ka News", text: "India ne naya satellite launch kiya.", color: "linear-gradient(135deg, #C62828, #EF5350)" }
    ]
};

let currentStoryIndex = 0;
let storyTimer = null;
let currentStoryArray = [];
let currentStoryId = "";
let isPaused = false;

// ===== OPEN STORY =====
window.openStory = function(storyId) {
    currentStoryArray = storiesContent[storyId] || [];
    if (currentStoryArray.length === 0) return;
    
    currentStoryIndex = 0;
    currentStoryId = storyId;
    
    let viewer = document.getElementById("storyViewer");
    if (!viewer) {
        viewer = document.createElement("div");
        viewer.id = "storyViewer";
        viewer.className = "story-viewer";
        document.getElementById("app").appendChild(viewer);
    }
    
    viewer.style.display = "flex";
    renderStorySlide();
};

// ===== RENDER SLIDE =====
function renderStorySlide() {
    const viewer = document.getElementById("storyViewer");
    const slide = currentStoryArray[currentStoryIndex];
    if (!slide) return closeStory();
    
    let slideHTML = "";
    
    if (slide.type === "poll") {
        slideHTML = `
            <div class="story-slide" style="background: ${slide.color || 'linear-gradient(135deg, #1A73E8, #4A90E2)'};">
                <div class="story-content">
                    <h2 class="story-title">${slide.title}</h2>
                    <p class="story-question">${slide.question}</p>
                    <div class="poll-options">
                        ${slide.options.map((opt, i) => `
                            <button class="poll-btn" onclick="votePoll(${i})">${opt}</button>
                        `).join("")}
                    </div>
                </div>
            </div>
        `;
    } else {
        slideHTML = `
            <div class="story-slide" style="background: ${slide.color || 'linear-gradient(135deg, #1A73E8, #4A90E2)'};">
                <div class="story-content">
                    <h2 class="story-title">${slide.title}</h2>
                    <p class="story-text">${slide.text}</p>
                </div>
            </div>
        `;
    }
    
    viewer.innerHTML = `
        <div class="story-progress">
            ${currentStoryArray.map((_, i) => `
                <div class="progress-bar">
                    <div class="progress-fill" data-index="${i}"></div>
                </div>
            `).join("")}
        </div>
        
        <button class="story-close" onclick="closeStory()">✕</button>
        
        <!-- Arrow Buttons -->
        ${currentStoryIndex > 0 ? `<button class="story-arrow story-arrow-left" onclick="prevStory()">‹</button>` : ''}
        ${currentStoryIndex < currentStoryArray.length - 1 ? `<button class="story-arrow story-arrow-right" onclick="nextStory()">›</button>` : ''}
        
        <div class="story-tap-left" onclick="prevStory()"></div>
        <div class="story-tap-right" onclick="nextStory()"></div>
        
        ${slideHTML}
    `;
    
    // Set previous progress bars to 100%
    document.querySelectorAll('.progress-fill').forEach((fill, i) => {
        if (i < currentStoryIndex) {
            fill.style.width = '100%';
        } else if (i === currentStoryIndex) {
            fill.style.width = '0%';
            // Animate current bar
            setTimeout(() => {
                fill.style.transition = 'width 5s linear';
                fill.style.width = '100%';
            }, 50);
        }
    });
    
    // Auto-advance after 5 sec
    clearTimeout(storyTimer);
    storyTimer = setTimeout(() => nextStory(), 5000);
}

// ===== NEXT STORY =====
window.nextStory = function() {
    clearTimeout(storyTimer);
    currentStoryIndex++;
    if (currentStoryIndex >= currentStoryArray.length) {
        markStoryAsSeen(currentStoryId);
        closeStory();
    } else {
        renderStorySlide();
    }
};

// ===== PREV STORY =====
window.prevStory = function() {
    clearTimeout(storyTimer);
    if (currentStoryIndex > 0) {
        currentStoryIndex--;
        renderStorySlide();
    }
};

// ===== CLOSE =====
window.closeStory = function() {
    clearTimeout(storyTimer);
    markStoryAsSeen(currentStoryId);
    const viewer = document.getElementById("storyViewer");
    if (viewer) viewer.style.display = "none";
};

// ===== MARK AS SEEN =====
function markStoryAsSeen(storyId) {
    if (!storyId) return;
    let seenStories = JSON.parse(localStorage.getItem("seen_stories") || "[]");
    if (!seenStories.includes(storyId)) {
        seenStories.push(storyId);
        localStorage.setItem("seen_stories", JSON.stringify(seenStories));
    }
    // Update ring color
    const storyItem = document.querySelector(`[data-story="${storyId}"] .story-ring`);
    if (storyItem) storyItem.classList.add("seen");
}

// ===== POLL VOTE =====
window.votePoll = function(index) {
    clearTimeout(storyTimer);
    const slide = currentStoryArray[currentStoryIndex];
    if (slide.votes) slide.votes[index]++;
    
    const buttons = document.querySelectorAll('.poll-btn');
    const total = slide.votes.reduce((a, b) => a + b, 0);
    
    buttons.forEach((btn, i) => {
        const percent = Math.round((slide.votes[i] / total) * 100);
        btn.innerHTML = `${slide.options[i]} - ${percent}%`;
        btn.style.background = i === index ? '#FF0055' : 'rgba(255,255,255,0.15)';
        btn.disabled = true;
    });
    
    sendToBackend({
        action: "poll_vote",
        poll_id: slide.title,
        option: slide.options[index],
        user_id: getUserId()
    });
    
    setTimeout(() => nextStory(), 2000);
};
