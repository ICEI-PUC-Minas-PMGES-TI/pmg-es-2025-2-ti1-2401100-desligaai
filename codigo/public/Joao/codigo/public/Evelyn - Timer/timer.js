// ===== VARIÁVEIS =====
let totalTime = 0;
let remainingTime = 0;
let timerInterval = null;
let isPaused = false;
let currentCycle = 0;
let totalCycles = 0;
let onBreak = false;
let prepPhase = false;

const pointsPerCycle = 10; // Pontos por ciclo de foco concluído

// ===== ELEMENTOS DO DOM =====
const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-timer');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

const focusInput = document.getElementById('focusTime');
const breakInput = document.getElementById('breakTime');
const cyclesInput = document.getElementById('cycles');

const timerOptions = document.querySelectorAll('.timer-options button');
const timerCircle = document.querySelector('.timer-circle');
const intervalTypeDisplay = document.getElementById('intervalType');
const cycleDisplay = document.getElementById('cycleDisplay');

const API_URL = 'http://localhost:3000';

// ===== FORMATAÇÃO =====
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}

// ===== SOM =====
function playAlarmSound() {
    const audio = new Audio('alarm2.wav');
    audio.play();
}

// ===== VALIDAÇÃO DE INPUTS =====
function validateInputs() {
    const focusTime = parseInt(focusInput.value);
    const breakTime = parseInt(breakInput.value);
    const cycles = parseInt(cyclesInput.value);
    return !(isNaN(focusTime) || focusTime <= 0 || isNaN(breakTime) || breakTime <= 0 || isNaN(cycles) || cycles <= 0);
}

function toggleStartButton() {
    startBtn.disabled = !validateInputs();
}

focusInput.addEventListener('input', toggleStartButton);
breakInput.addEventListener('input', toggleStartButton);
cyclesInput.addEventListener('input', toggleStartButton);

// ===== TIMER =====
function startTimer() {
    if (!validateInputs()) return alert("Insira valores válidos!");

    totalCycles = parseInt(cyclesInput.value);
    currentCycle = 0;
    onBreak = false;
    remainingTime = parseInt(focusInput.value) * 60;
    totalTime = remainingTime;
    isPaused = false;

    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;

    prepCountdown();
}

function startCountdown() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!isPaused) {
            remainingTime--;
            timeDisplay.textContent = formatTime(remainingTime);
            updateCircle();

            if (!prepPhase && remainingTime === 5) playAlarmSound();

            if (remainingTime <= 0) {
                clearInterval(timerInterval);

                if (!onBreak) {
                    addPoints(pointsPerCycle); // pontuação
                    addSessionToHistory('FOCO', parseInt(focusInput.value)); // histórico persistente
                } else {
                    addSessionToHistory('PAUSA', parseInt(breakInput.value));
                }

                nextPhase();
            }
        }
    }, 1000);
}

function nextPhase() {
    if (!onBreak) {
        onBreak = true;
        remainingTime = parseInt(breakInput.value) * 60;
    } else {
        onBreak = false;
        currentCycle++;
        if (currentCycle >= totalCycles) {
            alert("Todos os ciclos concluídos!");
            resetTimer();
            return;
        }
        remainingTime = parseInt(focusInput.value) * 60;
    }
    totalTime = remainingTime;
    prepCountdown();
}

function prepCountdown() {
    prepPhase = true;
    let prepTime = 5;
    timeDisplay.textContent = prepTime;
    playAlarmSound();

    const prepInterval = setInterval(() => {
        prepTime--;
        timeDisplay.textContent = prepTime;

        if (prepTime <= 0) {
            clearInterval(prepInterval);
            prepPhase = false;
            timeDisplay.textContent = formatTime(remainingTime);
            startCountdown();
        }
    }, 1000);
}

function pauseTimer() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '▶️ Continuar' : '⏸ Pausar';
}

function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isPaused = false;
    currentCycle = 0;
    onBreak = false;
    prepPhase = false;
    totalTime = parseInt(focusInput.value) * 60;
    remainingTime = totalTime;
    timeDisplay.textContent = formatTime(remainingTime);
    updateCircle();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    pauseBtn.textContent = '⏸ Pausar';
}

function updateCircle() {
    const progress = (totalTime - remainingTime) / totalTime;
    const degree = progress * 360;

    if (prepPhase) {
        timerCircle.style.background = `conic-gradient(#ffb74d ${degree}deg, #e0e0e0 ${degree}deg)`;
        intervalTypeDisplay.textContent = 'PRÉ';
        intervalTypeDisplay.style.color = '#ffb74d';
    } else if (onBreak) {
        timerCircle.style.background = `conic-gradient(#3c0a6d ${degree}deg, #e0e0e0 ${degree}deg)`;
        intervalTypeDisplay.textContent = 'PAUSA';
        intervalTypeDisplay.style.color = '#7b2bbe';
    } else {
        timerCircle.style.background = `conic-gradient(#9d4edd ${degree}deg, #e0e0e0 ${degree}deg)`;
        intervalTypeDisplay.textContent = 'FOCO';
        intervalTypeDisplay.style.color = '#9d4edd';
    }

    cycleDisplay.textContent = `Ciclo ${currentCycle + 1}/${totalCycles}`;
}

// ===== SCORE AUTOMÁTICO =====
function addPoints(points) {
    fetch(`${API_URL}/score`)
        .then(res => res.json())
        .then(data => {
            let currentScore = data[0]?.score || 0;
            currentScore += points;

            if (data[0]?.id) {
                fetch(`${API_URL}/score/${data[0].id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ score: currentScore })
                });
            } else {
                fetch(`${API_URL}/score`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ score: currentScore })
                });
            }

            loadScoreDisplay();
        })
        .catch(err => console.error('Erro ao atualizar score:', err));
}

function loadScoreDisplay() {
    fetch(`${API_URL}/score`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('#scoresTable tbody');
            tbody.innerHTML = '';
            const score = data[0]?.score || 0;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${score}</td><td></td>`;
            tbody.appendChild(tr);
        })
        .catch(err => console.error('Erro ao carregar score:', err));
}

// ===== HISTÓRICO DE SESSÕES =====
function addSessionToHistory(type, duration) {
    const now = new Date();
    const dateStr = now.toLocaleString();

    const newSession = {
        id: Date.now(),
        date: dateStr,
        type: type,
        duration: duration,
        details: type === 'FOCO' ? 'Ciclo concluído' : 'Pausa'
    };

    // Salvar no json-server
    fetch(`${API_URL}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
    })
    .then(() => loadHistory())
    .catch(err => console.error('Erro ao salvar histórico:', err));
}

function loadHistory() {
    fetch(`${API_URL}/history`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('#historyTable tbody');
            tbody.innerHTML = '';
            data.forEach(session => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${session.date}</td>
                    <td>${session.type}</td>
                    <td>${session.duration}</td>
                    <td>${session.details}</td>
                    <td><button class="delete" onclick="deleteSession(${session.id})">❌</button></td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error('Erro ao carregar histórico:', err));
}

function deleteSession(id) {
    fetch(`${API_URL}/history/${id}`, { method: 'DELETE' })
        .then(() => loadHistory())
        .catch(err => console.error('Erro ao deletar sessão:', err));
}

// ===== EVENTOS =====
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

timerOptions.forEach(button => {
    button.addEventListener('click', () => {
        focusInput.value = button.dataset.time;
        remainingTime = parseInt(button.dataset.time) * 60;
        totalTime = remainingTime;
        currentCycle = 0;
        onBreak = false;
        prepPhase = false;
        timeDisplay.textContent = formatTime(remainingTime);
        updateCircle();
        startTimer();
    });
});

window.addEventListener('load', () => {
    loadScoreDisplay();
    loadHistory();
});







