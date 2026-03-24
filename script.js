
// App state
let currentSlide = 0;
const totalSlides = 20;
let selectedAnswers = {};
let score = 0;
let matchingGame = {
    selected: null,
    matches: new Set()
};

// Quiz explanations
const explanations = {
    0: { B: "Correct! Always clarify requirements first." },
    1: { C: "Correct! Performance metrics are non-functional requirements." },
    2: { A: "Correct! Quick response time is a latency requirement." },
    3: { B: "Correct! Processing large volume is a throughput requirement." },
    4: { B: "Correct! Banking requires consistency to prevent double-spending." },
    5: { A: "Correct! Social media prioritizes availability over perfect consistency." },
    6: { B: "Correct! LFU keeps frequently accessed URLs cached." },
    7: { C: "Correct! Horizontal scaling + load balancer + queues handle spikes best." },
    8: { D: "Correct! Login needs immediate response, not async processing." }
};

// Initialize
function init() {
    updateProgress();
    setupEventListeners();
    updateButtonStates();
}

// Setup all event listeners
function setupEventListeners() {
    // Navigation buttons
    document.getElementById('prevBtn').addEventListener('click', () => changeSlide(-1));
    document.getElementById('nextBtn').addEventListener('click', () => changeSlide(1));
    
    // Quiz options
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', function() {
            const question = this.closest('.quiz-options').dataset.question;
            selectOption(this, question);
        });
    });

    // Check answer buttons
    document.querySelectorAll('.check-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const question = this.dataset.question;
            const correct = this.dataset.correct;
            checkAnswer(question, correct);
        });
    });

    // Matching game
    document.querySelectorAll('.match-item').forEach(item => {
        item.addEventListener('click', function() {
            handleMatchClick(this);
        });
    });
}

// Change slide
function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    slides[currentSlide].classList.remove('active');
    
    currentSlide += direction;
    if (currentSlide < 0) currentSlide = 0;
    if (currentSlide >= totalSlides) currentSlide = totalSlides - 1;
    
    slides[currentSlide].classList.add('active');
    updateProgress();
    updateButtonStates();
    window.scrollTo(0, 0);
}

// Update progress bar
function updateProgress() {
    const progress = ((currentSlide + 1) / totalSlides) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('slideCounter').textContent = `Slide ${currentSlide + 1} of ${totalSlides}`;
}

// Update button states
function updateButtonStates() {
    document.getElementById('prevBtn').disabled = currentSlide === 0;
    document.getElementById('nextBtn').disabled = currentSlide === totalSlides - 1;
}

// Select quiz option
function selectOption(element, questionId) {
    const options = element.parentElement.querySelectorAll('.quiz-option');
    options.forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    selectedAnswers[questionId] = element.dataset.answer;
}

// Check answer
function checkAnswer(questionId, correctAnswer) {
    const feedback = document.getElementById(`feedback-${questionId}`);
    const userAnswer = selectedAnswers[questionId];
    
    if (!userAnswer) {
        feedback.textContent = 'Please select an answer first!';
        feedback.className = 'quiz-feedback show incorrect';
        return;
    }
    
    const optionsContainer = feedback.previousElementSibling.previousElementSibling;
    const options = optionsContainer.querySelectorAll('.quiz-option');
    
    if (userAnswer === correctAnswer) {
        feedback.textContent = '✅ ' + (explanations[questionId][correctAnswer] || 'Correct!');
        feedback.className = 'quiz-feedback show correct';
        score++;
        
        options.forEach(opt => {
            if (opt.dataset.answer === correctAnswer) {
                opt.classList.add('correct');
            }
        });
    } else {
        const correctExplanation = explanations[questionId][correctAnswer] || 'Try again!';
        feedback.textContent = '❌ ' + correctExplanation;
        feedback.className = 'quiz-feedback show incorrect';
        
        options.forEach(opt => {
            if (opt.dataset.answer === userAnswer) {
                opt.classList.add('incorrect');
            }
            if (opt.dataset.answer === correctAnswer) {
                opt.classList.add('correct');
            }
        });
    }
    
    if (currentSlide === totalSlides - 1) {
        updateFinalScore();
    }
}

// Handle matching game
function handleMatchClick(element) {
    if (element.classList.contains('matched')) return;
    
    const type = element.dataset.type;
    const id = element.dataset.id;
    
    if (!matchingGame.selected) {
        element.classList.add('selected');
        matchingGame.selected = element;
    } else {
        const first = matchingGame.selected;
        
        if (first === element) {
            first.classList.remove('selected');
            matchingGame.selected = null;
            return;
        }
        
        // Check if it's a scenario-architecture pair
        let isCorrect = false;
        if (first.dataset.type === 'scenario' && type === 'arch') {
            isCorrect = first.dataset.correct === id;
        } else if (type === 'scenario' && first.dataset.type === 'arch') {
            isCorrect = element.dataset.correct === first.dataset.id;
        }
        
        const result = document.getElementById('matchResult');
        
        if (isCorrect) {
            first.classList.remove('selected');
            first.classList.add('matched');
            element.classList.add('matched');
            matchingGame.matches.add(first.dataset.id || id);
            
            result.textContent = '✅ Correct match!';
            result.style.background = '#c8e6c9';
            result.style.color = '#2e7d32';
            
            if (matchingGame.matches.size === 4) {
                result.textContent = '🎉 All matched! Great job!';
            }
        } else {
            first.classList.remove('selected');
            result.textContent = '❌ Try again!';
            result.style.background = '#ffcdd2';
            result.style.color = '#c62828';
        }
        
        matchingGame.selected = null;
    }
}

// Update final score
function updateFinalScore() {
    const finalScoreDiv = document.getElementById('finalScore');
    const percentage = Math.round((score / 9) * 100);
    let message = '';
    
    if (percentage >= 90) {
        message = '🌟 Outstanding! Ready for interviews!';
    } else if (percentage >= 70) {
        message = '👍 Great! Review a few concepts.';
    } else if (percentage >= 50) {
        message = '📚 Good effort! Go through slides again.';
    } else {
        message = '💪 Keep practicing!';
    }
    
    finalScoreDiv.innerHTML = `
        <div style="font-size: 1.8em; margin: 15px 0;">${percentage}%</div>
        <div>${message}</div>
        <div style="margin-top: 10px;">Score: ${score} / 9 questions correct</div>
    `;
}

// Start the app
init();
