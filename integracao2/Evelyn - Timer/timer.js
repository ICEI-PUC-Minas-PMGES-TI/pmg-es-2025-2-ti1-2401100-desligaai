// ============================================
// GERENCIAMENTO DE TEMA (Dark/Light)
// ============================================
function initTheme() {
  // Verifica se há tema salvo no localStorage
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Define o tema inicial
  if (savedTheme) {
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  } else {
    document.documentElement.classList.toggle('dark', prefersDark);
  }
  
  // Event listener para o botão de alternar tema
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

// Função para alternar tema
function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark', !isDark);
  localStorage.setItem('theme', !isDark ? 'dark' : 'light');
}

// ============================================
// BOTÃO DE PERFIL
// ============================================
function initProfileButton() {
  const profileBtn = document.getElementById('profileBtn');
  const profileImg = document.getElementById('profileImg');
  const profileIcon = document.getElementById('profileIcon');
  
  if (!profileBtn) return;
  
  const currentUserKey = 'desligaAI_currentUser';
  const currentUserData = localStorage.getItem(currentUserKey);
  
  if (currentUserData) {
    try {
      const user = JSON.parse(currentUserData);
      profileBtn.classList.remove('d-none');
      
      if (user.photo && profileImg) {
        profileImg.src = user.photo;
        profileImg.classList.remove('d-none');
        if (profileIcon) profileIcon.classList.add('d-none');
      } else {
        if (profileImg) profileImg.classList.add('d-none');
        if (profileIcon) profileIcon.classList.remove('d-none');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      profileBtn.classList.add('d-none');
    }
  } else {
    profileBtn.classList.add('d-none');
  }
}

function goToProfile() {
  window.location.href = '../gabriel/perfil_usuario/perfil.html';
}

// ============================================
// PÁGINA: TIMER DE DESAFIO (POMODORO COMPLETO)
// ============================================
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

// ===== PERSISTÊNCIA DO TIMER =====
const TIMER_STATE_KEY = 'desligaAI_timerState';

function saveTimerState() {
  const state = {
    totalTime,
    remainingTime,
    isPaused,
    currentCycle,
    totalCycles,
    onBreak,
    prepPhase,
    isRunning: timerInterval !== null,
    focusTime: parseInt(focusInput?.value || 25),
    breakTime: parseInt(breakInput?.value || 5),
    timestamp: Date.now()
  };
  localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
  console.log('Timer salvo:', state);
}

function loadTimerState() {
  const saved = localStorage.getItem(TIMER_STATE_KEY);
  if (!saved) return null;
  
  try {
    const state = JSON.parse(saved);
    const elapsed = (Date.now() - state.timestamp) / 1000; // segundos decorridos
    
    console.log('Estado carregado. Tempo decorrido:', elapsed, 'segundos');
    
    // Se passou mais de 24h, descarta o estado
    if (elapsed > 86400) {
      localStorage.removeItem(TIMER_STATE_KEY);
      return null;
    }
    
    // Atualiza remainingTime baseado no tempo decorrido
    if (state.isRunning && !state.isPaused) {
      state.remainingTime = Math.max(0, state.remainingTime - Math.floor(elapsed));
      
      console.log('Timer estava rodando. Tempo restante atualizado:', state.remainingTime);
      
      // Se o timer terminou enquanto fora da página
      if (state.remainingTime <= 0) {
        localStorage.removeItem(TIMER_STATE_KEY);
        return null;
      }
    }
    
    return state;
  } catch (e) {
    console.error('Erro ao carregar estado do timer:', e);
    return null;
  }
}

function restoreTimerState(state) {
  totalTime = state.totalTime;
  remainingTime = state.remainingTime;
  isPaused = state.isPaused;
  currentCycle = state.currentCycle;
  totalCycles = state.totalCycles;
  onBreak = state.onBreak;
  prepPhase = state.prepPhase;
  
  // Restaura valores dos inputs
  if (focusInput) focusInput.value = state.focusTime;
  if (breakInput) breakInput.value = state.breakTime;
  if (cyclesInput) cyclesInput.value = state.totalCycles;
  
  // Atualiza display
  if (timeDisplay) timeDisplay.textContent = formatTime(remainingTime);
  updateCircle();
  
  console.log('Timer restaurado. isRunning:', state.isRunning, 'isPaused:', isPaused);
  
  // Restaura estado dos botões
  if (state.isRunning) {
    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = false;
    if (resetBtn) resetBtn.disabled = false;
    
    // Se não estava pausado, retoma o timer imediatamente
    if (!isPaused) {
      console.log('Retomando timer...');
      startCountdown();
    }
  }
}
let timeDisplay, startBtn, pauseBtn, resetBtn;
let focusInput, breakInput, cyclesInput;
let timerOptions, timerCircle, intervalTypeDisplay, cycleDisplay;

const API_URL = 'http://localhost:3000';

// ===== FORMATAÇÃO =====
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}

// ===== SOM =====
function playAlarmSound() {
  // Tenta tocar som, mas não falha se não existir
  try {
    const audio = new Audio('alarm2.wav');
    audio.play().catch(() => {
      // Ignora erros de áudio
    });
  } catch (e) {
    // Ignora erros
  }
}

// ===== VALIDAÇÃO DE INPUTS =====
function validateInputs() {
  if (!focusInput || !breakInput || !cyclesInput) return false;
  const focusTime = parseInt(focusInput.value);
  const breakTime = parseInt(breakInput.value);
  const cycles = parseInt(cyclesInput.value);
  return !(isNaN(focusTime) || focusTime <= 0 || isNaN(breakTime) || breakTime <= 0 || isNaN(cycles) || cycles <= 0);
}

function toggleStartButton() {
  if (startBtn) {
    startBtn.disabled = !validateInputs();
  }
}

// ===== TIMER =====
function startTimer() {
  if (!validateInputs()) {
    alert("Insira valores válidos!");
    return;
  }

  totalCycles = parseInt(cyclesInput.value);
  currentCycle = 0;
  onBreak = false;
  remainingTime = parseInt(focusInput.value) * 60;
  totalTime = remainingTime;
  isPaused = false;

  if (startBtn) startBtn.disabled = true;
  if (pauseBtn) pauseBtn.disabled = false;
  if (resetBtn) resetBtn.disabled = false;

  saveTimerState();
  prepCountdown();
}

function startCountdown() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!isPaused) {
      remainingTime--;
      if (timeDisplay) timeDisplay.textContent = formatTime(remainingTime);
      updateCircle();
      saveTimerState(); // Salva o estado a cada segundo

      if (!prepPhase && remainingTime === 5) playAlarmSound();

      if (remainingTime <= 0) {
        clearInterval(timerInterval);

        if (!onBreak) {
          addPoints(pointsPerCycle); // pontuação
          addSessionToHistory('FOCO', parseInt(focusInput.value)); // histórico persistente
          
          // Atualiza estatística de sessões de timer para conquistas
          try {
            if (typeof updateAchievementStat === 'function') {
              updateAchievementStat('timerSessions', 1);
            }
          } catch (e) {
            console.log('Achievement tracking not available');
          }
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
  if (timeDisplay) timeDisplay.textContent = prepTime;
  playAlarmSound();

  const prepInterval = setInterval(() => {
    prepTime--;
    if (timeDisplay) timeDisplay.textContent = prepTime;

    if (prepTime <= 0) {
      clearInterval(prepInterval);
      prepPhase = false;
      if (timeDisplay) timeDisplay.textContent = formatTime(remainingTime);
      startCountdown();
    }
  }, 1000);
}

function pauseTimer() {
  isPaused = !isPaused;
  if (pauseBtn) {
    pauseBtn.textContent = isPaused ? '▶️ Continuar' : '⏸ Pausar';
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isPaused = false;
  currentCycle = 0;
  onBreak = false;
  prepPhase = false;
  localStorage.removeItem(TIMER_STATE_KEY); // Remove estado salvo
  if (focusInput) {
    totalTime = parseInt(focusInput.value) * 60;
    remainingTime = totalTime;
  }
  if (timeDisplay) timeDisplay.textContent = formatTime(remainingTime);
  updateCircle();
  if (startBtn) startBtn.disabled = false;
  if (pauseBtn) pauseBtn.disabled = true;
  if (resetBtn) resetBtn.disabled = true;
  if (pauseBtn) pauseBtn.textContent = '⏸ Pausar';
}

function updateCircle() {
  if (!timerCircle) return;
  
  const progress = totalTime > 0 ? (totalTime - remainingTime) / totalTime : 0;
  const degree = progress * 360;

  if (prepPhase) {
    timerCircle.style.background = `conic-gradient(hsl(25 95% 53%) ${degree}deg, hsl(var(--muted)) ${degree}deg)`;
    if (intervalTypeDisplay) {
      intervalTypeDisplay.textContent = 'PRÉ';
      intervalTypeDisplay.style.color = 'hsl(25 95% 53%)';
    }
  } else if (onBreak) {
    timerCircle.style.background = `conic-gradient(hsl(263 70% 50%) ${degree}deg, hsl(var(--muted)) ${degree}deg)`;
    if (intervalTypeDisplay) {
      intervalTypeDisplay.textContent = 'PAUSA';
      intervalTypeDisplay.style.color = 'hsl(263 70% 50%)';
    }
  } else {
    timerCircle.style.background = `conic-gradient(hsl(263 70% 50%) ${degree}deg, hsl(var(--muted)) ${degree}deg)`;
    if (intervalTypeDisplay) {
      intervalTypeDisplay.textContent = 'FOCO';
      intervalTypeDisplay.style.color = 'hsl(263 70% 50%)';
    }
  }

  if (cycleDisplay) {
    cycleDisplay.textContent = `Ciclo ${currentCycle + 1}/${totalCycles}`;
  }
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
    .catch(err => {
      console.error('Erro ao atualizar score:', err);
      // Continua funcionando mesmo sem API
    });
}

function loadScoreDisplay() {
  fetch(`${API_URL}/score`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#scoresTable tbody');
      if (!tbody) return;
      tbody.innerHTML = '';
      const score = data[0]?.score || 0;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${score}</td><td></td>`;
      tbody.appendChild(tr);
    })
    .catch(err => {
      console.error('Erro ao carregar score:', err);
      // Continua funcionando mesmo sem API
    });
}

// ===== HISTÓRICO DE SESSÕES =====
function addSessionToHistory(type, duration) {
  const now = new Date();
  const dateStr = now.toLocaleString('pt-BR');

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
  .catch(err => {
    console.error('Erro ao salvar histórico:', err);
    // Continua funcionando mesmo sem API
  });
}

function loadHistory() {
  fetch(`${API_URL}/history`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector('#historyTable tbody');
      if (!tbody) return;
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
    .catch(err => {
      console.error('Erro ao carregar histórico:', err);
      // Continua funcionando mesmo sem API
    });
}

function deleteSession(id) {
  fetch(`${API_URL}/history/${id}`, { method: 'DELETE' })
    .then(() => loadHistory())
    .catch(err => {
      console.error('Erro ao deletar sessão:', err);
      // Continua funcionando mesmo sem API
    });
}

// ===== INICIALIZAÇÃO =====
function initTimer() {
  // Inicializa elementos do DOM
  timeDisplay = document.getElementById('time-display');
  startBtn = document.getElementById('start-timer');
  pauseBtn = document.getElementById('pauseBtn');
  resetBtn = document.getElementById('resetBtn');
  focusInput = document.getElementById('focusTime');
  breakInput = document.getElementById('breakTime');
  cyclesInput = document.getElementById('cycles');
  timerOptions = document.querySelectorAll('.timer-options button');
  timerCircle = document.querySelector('.timer-circle');
  intervalTypeDisplay = document.getElementById('intervalType');
  cycleDisplay = document.getElementById('cycleDisplay');

  // Validação de inputs
  if (focusInput) focusInput.addEventListener('input', toggleStartButton);
  if (breakInput) breakInput.addEventListener('input', toggleStartButton);
  if (cyclesInput) cyclesInput.addEventListener('input', toggleStartButton);

  // Eventos do formulário
  const timerForm = document.getElementById('timerForm');
  if (timerForm) {
    timerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      startTimer();
    });
  }

  // Eventos dos botões
  if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
  if (resetBtn) resetBtn.addEventListener('click', resetTimer);

  // Botões de tempo rápido
  if (timerOptions) {
    timerOptions.forEach(button => {
      button.addEventListener('click', () => {
        if (focusInput) focusInput.value = button.dataset.time;
        remainingTime = parseInt(button.dataset.time) * 60;
        totalTime = remainingTime;
        currentCycle = 0;
        onBreak = false;
        prepPhase = false;
        if (timeDisplay) timeDisplay.textContent = formatTime(remainingTime);
        updateCircle();
        startTimer();
      });
    });
  }

  // Formulário de score
  const scoreForm = document.getElementById('scoreForm');
  if (scoreForm) {
    scoreForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const scoreInput = document.getElementById('playerScore');
      const score = parseInt(scoreInput.value);
      if (!isNaN(score) && score >= 0) {
        // Atualiza o score diretamente
        fetch(`${API_URL}/score`)
          .then(res => res.json())
          .then(data => {
            if (data[0]?.id) {
              fetch(`${API_URL}/score/${data[0].id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score: score })
              })
              .then(() => {
                loadScoreDisplay();
                scoreInput.value = '';
              });
            } else {
              fetch(`${API_URL}/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score: score })
              })
              .then(() => {
                loadScoreDisplay();
                scoreInput.value = '';
              });
            }
          })
          .catch(err => {
            console.error('Erro ao salvar score:', err);
            alert('Erro ao salvar score. Verifique se o json-server está rodando.');
          });
      }
    });
  }

  // Carrega dados iniciais
  const savedState = loadTimerState();
  if (savedState) {
    restoreTimerState(savedState);
  } else {
    resetTimer();
  }
  loadScoreDisplay();
  loadHistory();
}

// Disponibiliza funções globalmente
window.deleteSession = deleteSession;

// ============================================
// INICIALIZAÇÃO GERAL
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  initProfileButton();
  initTimer();
});


