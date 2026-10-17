// ==========================================
// 🧪 TESTS MODULE - MCQ Engine
// ==========================================

// Dummy Test Data (Baad me Firebase se aayega)
const dummyTests = [
    {
        id: "test1",
        title: "Class 10 Science - Chapter 1",
        subject: "Science",
        questions: [
            { q: "What is a chemical reaction?", options: ["Mixing two things", "Process where reactants convert to products", "Boiling water", "Melting ice"], correct: 1 },
            { q: "Which of these is an exothermic reaction?", options: ["Photosynthesis", "Respiration", "Melting ice", "Electrolysis"], correct: 1 },
            { q: "What is the chemical formula for rust?", options: ["FeO", "Fe2O3", "Fe3O4", "Fe(OH)2"], correct: 1 }
        ]
    },
    {
        id: "test2",
        title: "Basic Maths Quiz",
        subject: "Maths",
        questions: [
            { q: "What is the HCF of 12 and 18?", options: ["2", "6", "12", "36"], correct: 1 },
            { q: "If x + 5 = 12, what is x?", options: ["5", "6", "7", "8"], correct: 2 }
        ]
    }
];

let currentTest = null;
let currentQIndex = 0;
let userAnswers = [];

// ===== LOAD TESTS LIST =====
window.loadTests = function() {
    const screen = document.getElementById("screen-tests");
    
    screen.innerHTML = `
        <div class="tests-container">
            <h2 class="page-title">🧪 Available Tests</h2>
            <p class="page-subtitle">Practice and improve your score</p>
            
            <div class="tests-list">
                ${dummyTests.map(test => `
                    <div class="test-card" onclick="startTest('${test.id}')">
                        <div class="test-icon">📝</div>
                        <div class="test-info">
                            <h3>${test.title}</h3>
                            <p>${test.subject} • ${test.questions.length} Questions</p>
                        </div>
                        <div class="test-arrow">→</div>
                    </div>
                `).join("")}
            </div>
        </div>
    `;
};

// ===== START TEST =====
window.startTest = function(testId) {
    currentTest = dummyTests.find(t => t.id === testId);
    if (!currentTest) return;
    
    currentQIndex = 0;
    userAnswers = new Array(currentTest.questions.length).fill(null);
    
    renderTestQuestion();
};

// ===== RENDER QUESTION =====
function renderTestQuestion() {
    const screen = document.getElementById("screen-tests");
    const q = currentTest.questions[currentQIndex];
    
    screen.innerHTML = `
        <div class="test-engine">
            <div class="test-header">
                <button class="back-btn" onclick="loadTests()">✕</button>
                <div class="test-progress-text">Q ${currentQIndex + 1}/${currentTest.questions.length}</div>
                <div class="test-timer">⏱️</div>
            </div>
            
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${((currentQIndex + 1) / currentTest.questions.length) * 100}%"></div>
            </div>
            
            <div class="question-area">
                <h2 class="question-text">${q.q}</h2>
                
                <div class="options-list">
                    ${q.options.map((opt, i) => `
                        <button class="option-btn ${userAnswers[currentQIndex] === i ? 'selected' : ''}" 
                                onclick="selectOption(${i})">
                            <span class="option-letter">${String.fromCharCode(65 + i)}</span>
                            ${opt}
                        </button>
                    `).join("")}
                </div>
            </div>
            
            <div class="test-footer">
                ${currentQIndex > 0 ? `<button class="nav-btn prev" onclick="prevQuestion()">Previous</button>` : `<div></div>`}
                
                ${currentQIndex === currentTest.questions.length - 1 
                    ? `<button class="nav-btn submit" onclick="finishTest()">Submit Test</button>`
                    : `<button class="nav-btn next" onclick="nextQuestion()">Next</button>`
                }
            </div>
        </div>
    `;
}

// ===== SELECT OPTION =====
window.selectOption = function(optionIndex) {
    userAnswers[currentQIndex] = optionIndex;
    // Re-render to show selected state
    renderTestQuestion();
};

// ===== NAVIGATION =====
window.nextQuestion = function() {
    if (currentQIndex < currentTest.questions.length - 1) {
        currentQIndex++;
        renderTestQuestion();
    }
};

window.prevQuestion = function() {
    if (currentQIndex > 0) {
        currentQIndex--;
        renderTestQuestion();
    }
};

// ===== FINISH TEST =====
window.finishTest = function() {
    let score = 0;
    currentTest.questions.forEach((q, i) => {
        if (userAnswers[i] === q.correct) score++;
    });
    
    const percentage = Math.round((score / currentTest.questions.length) * 100);
    const screen = document.getElementById("screen-tests");
    
    screen.innerHTML = `
        <div class="result-container">
            <div class="result-card">
                <div class="result-icon">${percentage >= 80 ? '🏆' : percentage >= 50 ? '🎯' : '📚'}</div>
                <h2 class="result-title">Test Completed!</h2>
                
                <div class="score-circle">
                    <div class="score-value">${score}/${currentTest.questions.length}</div>
                    <div class="score-percent">${percentage}%</div>
                </div>
                
                <div class="result-stats">
                    <div class="r-stat">
                        <span class="r-label">Correct</span>
                        <span class="r-val" style="color: #4CAF50;">${score}</span>
                    </div>
                    <div class="r-stat">
                        <span class="r-label">Wrong</span>
                        <span class="r-val" style="color: #FF0055;">${currentTest.questions.length - score}</span>
                    </div>
                </div>
                
                <button class="submit-btn" onclick="loadTests()">Take Another Test</button>
            </div>
        </div>
    `;
    
    showToast("✅ Test submitted!");
};
