// ============================================
// MAPA DE EMOÇÕES - Sistema Principal
// ============================================

class EmotionalMap {
  constructor() {
    this.currentStep = 1;
    this.userData = {
      emotionalState: {},
      hobbies: {
        usual: [],
        new: []
      },
      dailyRoutine: {},
      digitalHabits: {},
      goals: []
    };
    
    this.initializeApp();
  }
  
  initializeApp() {
    this.setupEventListeners();
    this.loadEmotionalLevels();
    this.loadHobbies();
    this.loadTimeActivities();
    this.loadPersonalGoals();
    this.loadSavedData();
    this.setupThemeToggle();
  }
  
  setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', this.toggleTheme.bind(this));
    }
    
    // Verifica tema salvo ou preferência do sistema
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }
  
  toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', !isDark);
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
  }
  
  setupEventListeners() {
    // Slider value displays
    document.getElementById('sleep-quality')?.addEventListener('input', (e) => {
      document.getElementById('sleep-value').textContent = e.target.value;
    });
    
    document.getElementById('nutrition-quality')?.addEventListener('input', (e) => {
      document.getElementById('nutrition-value').textContent = e.target.value;
    });
    
    document.getElementById('distraction-level')?.addEventListener('input', (e) => {
      document.getElementById('distraction-value').textContent = e.target.value;
    });
  }
  
  loadEmotionalLevels() {
    const emotions = [
      { id: 'happiness', name: 'Felicidade', icon: '😊', color: '#4CAF50', value: 6 },
      { id: 'anxiety', name: 'Ansiedade', icon: '😰', color: '#FF9800', value: 4 },
      { id: 'stress', name: 'Estresse', icon: '😫', color: '#F44336', value: 5 },
      { id: 'motivation', name: 'Motivação', icon: '💪', color: '#2196F3', value: 7 },
      { id: 'energy', name: 'Energia', icon: '⚡', color: '#FFC107', value: 5 },
      { id: 'focus', name: 'Foco', icon: '🎯', color: '#9C27B0', value: 6 }
    ];
    
    const container = document.getElementById('emotional-levels');
    if (!container) return;
    
    emotions.forEach(emotion => {
      const col = document.createElement('div');
      col.className = 'col-md-6 col-lg-4';
      col.innerHTML = `
        <div class="emotion-level-card">
          <div class="emotion-icon" style="background-color: ${emotion.color}20; color: ${emotion.color}">
            ${emotion.icon}
          </div>
          <h6 class="fw-bold mb-2">${emotion.name}</h6>
          <div class="d-flex align-items-center">
            <input type="range" class="form-range emotion-slider" 
                   min="0" max="10" value="${emotion.value}" 
                   data-emotion="${emotion.id}"
                   style="--track-color: ${emotion.color}">
            <span class="ms-2 fw-bold emotion-value" style="color: ${emotion.color}">${emotion.value}</span>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
    
    // Add slider value update listeners
    document.querySelectorAll('.emotion-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const valueElement = e.target.parentElement.querySelector('.emotion-value');
        valueElement.textContent = e.target.value;
      });
    });
  }
  
  loadHobbies() {
    const usualHobbies = [
      { id: 'reading', name: 'Leitura', icon: '📚', category: 'Cultura' },
      { id: 'movies', name: 'Assistir filmes', icon: '🎬', category: 'Entretenimento' },
      { id: 'music', name: 'Ouvir música', icon: '🎵', category: 'Entretenimento' },
      { id: 'cooking', name: 'Cozinhar', icon: '👨‍🍳', category: 'Habilidades' },
      { id: 'walking', name: 'Caminhar', icon: '🚶', category: 'Exercício' },
      { id: 'gaming', name: 'Jogar games', icon: '🎮', category: 'Entretenimento' }
    ];
    
    const newHobbies = [
      { id: 'painting', name: 'Pintura', icon: '🎨', category: 'Arte' },
      { id: 'gardening', name: 'Jardinagem', icon: '🌱', category: 'Natureza' },
      { id: 'yoga', name: 'Yoga', icon: '🧘', category: 'Bem-estar' },
      { id: 'photography', name: 'Fotografia', icon: '📷', category: 'Arte' },
      { id: 'dancing', name: 'Dança', icon: '💃', category: 'Exercício' },
      { id: 'writing', name: 'Escrita', icon: '✍️', category: 'Criatividade' },
      { id: 'hiking', name: 'Trilha', icon: '🥾', category: 'Natureza' },
      { id: 'meditation', name: 'Meditação', icon: '🧎', category: 'Bem-estar' }
    ];
    
    this.renderHobbies(usualHobbies, 'hobbies-usual');
    this.renderHobbies(newHobbies, 'hobbies-new');
  }
  
  renderHobbies(hobbies, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    hobbies.forEach(hobby => {
      const col = document.createElement('div');
      col.className = 'col-6 col-md-4 col-lg-3';
      col.innerHTML = `
        <div class="hobby-card" data-hobby="${hobby.id}">
          <div class="hobby-icon">
            ${hobby.icon}
          </div>
          <span class="small fw-bold">${hobby.name}</span>
          <span class="d-block small text-muted">${hobby.category}</span>
        </div>
      `;
      container.appendChild(col);
    });
    
    // Add click event listeners
    document.querySelectorAll(`#${containerId} .hobby-card`).forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('selected');
      });
    });
  }
  
  loadTimeActivities() {
    const activities = [
      { id: 'work', name: 'Trabalho', icon: '💼', maxHours: 10 },
      { id: 'study', name: 'Estudo', icon: '📚', maxHours: 8 },
      { id: 'screens', name: 'Telas', icon: '📱', maxHours: 8 },
      { id: 'social', name: 'Social', icon: '👥', maxHours: 6 },
      { id: 'exercise', name: 'Exercício', icon: '🏋️', maxHours: 3 },
      { id: 'hobbies', name: 'Hobbies', icon: '🎨', maxHours: 4 }
    ];
    
    const container = document.getElementById('time-activities');
    if (!container) return;
    
    activities.forEach(activity => {
      const col = document.createElement('div');
      col.className = 'col-md-6';
      col.innerHTML = `
        <div class="time-activity-card">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="d-flex align-items-center">
              <span class="me-2">${activity.icon}</span>
              <span class="fw-bold">${activity.name}</span>
            </div>
            <span class="badge bg-primary">0-${activity.maxHours}h</span>
          </div>
          <div class="d-flex align-items-center">
            <span class="me-2 small">Horas:</span>
            <input type="range" class="form-range" 
                   min="0" max="${activity.maxHours}" value="${Math.floor(activity.maxHours/2)}"
                   data-activity="${activity.id}">
            <span class="ms-2 fw-bold activity-value">${Math.floor(activity.maxHours/2)}</span>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
    
    // Add slider value update listeners
    document.querySelectorAll('#time-activities input[type="range"]').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const valueElement = e.target.parentElement.querySelector('.activity-value');
        valueElement.textContent = e.target.value;
      });
    });
  }
  
  loadPersonalGoals() {
    const goals = [
      { id: 'reduce-screens', text: 'Reduzir tempo em telas' },
      { id: 'more-exercise', text: 'Praticar mais exercícios' },
      { id: 'learn-skill', text: 'Aprender uma nova habilidade' },
      { id: 'social-life', text: 'Melhorar vida social' },
      { id: 'sleep-better', text: 'Dormir melhor' },
      { id: 'read-more', text: 'Ler mais livros' },
      { id: 'healthy-food', text: 'Alimentação mais saudável' },
      { id: 'stress-less', text: 'Reduzir estresse' }
    ];
    
    const container = document.getElementById('personal-goals');
    if (!container) return;
    
    goals.forEach(goal => {
      const col = document.createElement('div');
      col.className = 'col-md-6';
      col.innerHTML = `
        <div class="goal-card">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="${goal.id}" value="${goal.text}">
            <label class="form-check-label" for="${goal.id}">
              ${goal.text}
            </label>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
  }
  
  updateProgressBar() {
    const progress = (this.currentStep / 4) * 100;
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }
  
  collectEmotionalData() {
    const emotions = {};
    document.querySelectorAll('.emotion-slider').forEach(slider => {
      emotions[slider.dataset.emotion] = parseInt(slider.value);
    });
    
    const triggers = {};
    document.querySelectorAll('input[name^="trigger-"]').forEach(checkbox => {
      triggers[checkbox.name] = checkbox.checked;
    });
    
    return { emotions, triggers };
  }
  
  collectHobbiesData() {
    const usual = [];
    const newHobbies = [];
    
    document.querySelectorAll('#hobbies-usual .hobby-card.selected').forEach(card => {
      usual.push(card.dataset.hobby);
    });
    
    document.querySelectorAll('#hobbies-new .hobby-card.selected').forEach(card => {
      newHobbies.push(card.dataset.hobby);
    });
    
    const otherInterests = document.getElementById('other-interests')?.value || '';
    
    return { usual, new: newHobbies, otherInterests };
  }
  
  collectRoutineData() {
    const activities = {};
    document.querySelectorAll('#time-activities input[type="range"]').forEach(slider => {
      activities[slider.dataset.activity] = parseInt(slider.value);
    });
    
    return {
      activities,
      sleepQuality: parseInt(document.getElementById('sleep-quality')?.value || 7),
      nutritionQuality: parseInt(document.getElementById('nutrition-quality')?.value || 6),
      idealRoutine: document.getElementById('routine-description')?.value || ''
    };
  }
  
  collectDigitalData() {
    const goals = [];
    document.querySelectorAll('#personal-goals input:checked').forEach(checkbox => {
      goals.push(checkbox.value);
    });
    
    return {
      screenTime: document.getElementById('screen-time')?.value || '3-4',
      distractionLevel: parseInt(document.getElementById('distraction-level')?.value || 6),
      goals,
      offlineGoal: document.getElementById('offline-goal')?.value || ''
    };
  }
  
  generateEmotionalMap() {
    // Collect all data
    this.userData.emotionalState = this.collectEmotionalData();
    this.userData.hobbies = this.collectHobbiesData();
    this.userData.dailyRoutine = this.collectRoutineData();
    this.userData.digitalHabits = this.collectDigitalData();
    
    // Save to localStorage
    this.saveData();
    
    // Show results
    this.showResults();
  }
  
  showResults() {
    // Hide all steps
    document.querySelectorAll('section[id^="step-"]').forEach(section => {
      section.classList.add('d-none');
    });
    
    // Show results screen
    document.getElementById('results-screen').classList.remove('d-none');
    this.updateProgressBar();
    
    // Generate recommendations
    this.generateRecommendations();
    this.generateActionPlan();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  generateRecommendations() {
    const emotionalState = this.userData.emotionalState.emotions;
    const hobbies = this.userData.hobbies;
    const routine = this.userData.dailyRoutine;
    
    // Emotional summary
    const emotionalSummary = document.getElementById('emotional-summary');
    emotionalSummary.innerHTML = `
      <div class="mb-3">
        <span class="badge ${emotionalState.happiness > 6 ? 'bg-success' : 'bg-warning'} me-2">Felicidade: ${emotionalState.happiness}/10</span>
        <span class="badge ${emotionalState.anxiety < 5 ? 'bg-success' : 'bg-danger'} me-2">Ansiedade: ${emotionalState.anxiety}/10</span>
        <span class="badge ${emotionalState.motivation > 6 ? 'bg-success' : 'bg-warning'}">Motivação: ${emotionalState.motivation}/10</span>
      </div>
      <p class="mb-2">Seu perfil emocional mostra ${emotionalState.happiness > 6 ? 'alta felicidade' : 'felicidade moderada'} 
      e ${emotionalState.anxiety < 5 ? 'baixa ansiedade' : 'ansiedade elevada'}.</p>
      <p>Recomendamos ${emotionalState.stress > 6 ? 'atividades relaxantes' : 'atividades estimulantes'}.</p>
    `;
    
    // Recommendations
    const recommendations = document.getElementById('recommendations');
    let recs = [];
    
    if (emotionalState.anxiety > 6) {
      recs.push('Praticar meditação 10 minutos ao dia');
      recs.push('Caminhada em parque 3x por semana');
    }
    
    if (emotionalState.energy < 5) {
      recs.push('Alongamento matinal diário');
      recs.push('Reduzir cafeína após as 14h');
    }
    
    if (routine.sleepQuality < 6) {
      recs.push('Estabelecer rotina de sono fixa');
      recs.push('Evitar telas 1h antes de dormir');
    }
    
    if (hobbies.new.length > 0) {
      recs.push(`Experimentar ${hobbies.new[0]} como novo hobby`);
    }
    
    if (routine.nutritionQuality < 6) {
      recs.push('Incluir mais frutas e vegetais na dieta');
    }
    
    if (emotionalState.focus < 5) {
      recs.push('Técnica Pomodoro para melhorar concentração');
    }
    
    recommendations.innerHTML = recs.map(rec => `
      <div class="d-flex align-items-center mb-2">
        <i class="bi bi-check-circle-fill text-success me-2"></i>
        <span>${rec}</span>
      </div>
    `).join('');
  }
  
  generateActionPlan() {
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const activities = [
      'Meditação matinal (10min)',
      'Caminhada ao ar livre',
      'Leitura offline (30min)',
      'Hobby criativo',
      'Sem telas após 21h',
      'Exercício físico',
      'Tempo social offline',
      'Reflexão do dia',
      'Alongamento antes de dormir',
      'Preparação de refeições saudáveis'
    ];
    
    const container = document.getElementById('action-plan');
    container.innerHTML = '';
    
    days.forEach((day, index) => {
      const col = document.createElement('div');
      col.className = 'col-md-6 col-lg-4 mb-3';
      col.innerHTML = `
        <div class="action-plan-card">
          <h6 class="fw-bold mb-3">${day}</h6>
          <ul class="list-unstyled mb-0">
            <li class="mb-1"><i class="bi bi-check text-success me-2"></i>${activities[index % activities.length]}</li>
            <li class="mb-1"><i class="bi bi-check text-success me-2"></i>${activities[(index + 2) % activities.length]}</li>
            <li class="mb-1"><i class="bi bi-check text-success me-2"></i>${activities[(index + 4) % activities.length]}</li>
          </ul>
        </div>
      `;
      container.appendChild(col);
    });
  }
  
  saveData() {
    const data = {
      timestamp: new Date().toISOString(),
      ...this.userData
    };
    localStorage.setItem('emotionalMapData', JSON.stringify(data));
  }
  
  loadSavedData() {
    const saved = localStorage.getItem('emotionalMapData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.userData = data;
        console.log('Dados anteriores carregados:', data);
      } catch (e) {
        console.error('Erro ao carregar dados salvos:', e);
      }
    }
  }
  
  getJsonData() {
    return {
      id: `EMOTION-MAP-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...this.userData,
      recommendations: {
        weeklyPlan: this.generateWeeklyPlan(),
        priorityAreas: this.getPriorityAreas(),
        suggestedActivities: this.getSuggestedActivities()
      }
    };
  }
  
  generateWeeklyPlan() {
    return Array.from({ length: 7 }, (_, i) => ({
      day: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'][i],
      activities: [
        'Atividade física leve',
        'Tempo offline (1h)',
        'Hobby criativo'
      ],
      focus: i % 2 === 0 ? 'Relaxamento' : 'Produtividade'
    }));
  }
  
  getPriorityAreas() {
    const areas = [];
    const emotions = this.userData.emotionalState?.emotions || {};
    
    if (emotions.anxiety && emotions.anxiety > 6) areas.push('Gerenciamento de ansiedade');
    if (emotions.stress && emotions.stress > 6) areas.push('Controle do estresse');
    if (emotions.energy && emotions.energy < 5) areas.push('Aumento de energia');
    if (emotions.focus && emotions.focus < 5) areas.push('Melhora do foco');
    
    return areas.length > 0 ? areas : ['Equilíbrio emocional geral'];
  }
  
  getSuggestedActivities() {
    const suggestions = [];
    const hobbies = this.userData.hobbies?.new || [];
    
    hobbies.forEach(hobby => {
      suggestions.push(`Experimentar ${hobby} como atividade nova`);
    });
    
    if (hobbies.length === 0) {
      suggestions.push('Explorar workshops ou cursos locais');
      suggestions.push('Participar de grupos de interesse na comunidade');
    }
    
    return suggestions;
  }
}

// ============================================
// FUNÇÕES DE NAVEGAÇÃO GLOBAIS
// ============================================

let app;

function startEmotionalMapping() {
  document.getElementById('welcome-screen').classList.add('d-none');
  document.getElementById('step-emotional-state').classList.remove('d-none');
  app.currentStep = 1;
  app.updateProgressBar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToStep2() {
  document.getElementById('step-emotional-state').classList.add('d-none');
  document.getElementById('step-hobbies-interests').classList.remove('d-none');
  app.currentStep = 2;
  app.updateProgressBar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToStep3() {
  document.getElementById('step-hobbies-interests').classList.add('d-none');
  document.getElementById('step-daily-routine').classList.remove('d-none');
  app.currentStep = 3;
  app.updateProgressBar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToStep4() {
  document.getElementById('step-daily-routine').classList.add('d-none');
  document.getElementById('step-digital-goals').classList.remove('d-none');
  app.currentStep = 4;
  app.updateProgressBar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToStep1() {
  document.getElementById('step-hobbies-interests').classList.add('d-none');
  document.getElementById('step-emotional-state').classList.remove('d-none');
  app.currentStep = 1;
  app.updateProgressBar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showWelcomeScreen() {
  document.querySelectorAll('section[id^="step-"], #results-screen').forEach(section => {
    section.classList.add('d-none');
  });
  document.getElementById('welcome-screen').classList.remove('d-none');
  app.currentStep = 1;
  app.updateProgressBar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function generateEmotionalMap() {
  app.generateEmotionalMap();
}

function downloadResults() {
  const data = app.getJsonData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mapa-emocional-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  // Feedback visual
  const btn = event.target.closest('button');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Relatório Baixado!';
  setTimeout(() => {
    btn.innerHTML = originalText;
  }, 2000);
}

function viewJsonData() {
  const jsonData = app.getJsonData();
  document.getElementById('json-preview').textContent = JSON.stringify(jsonData, null, 2);
  const modal = new bootstrap.Modal(document.getElementById('jsonModal'));
  modal.show();
}

function copyJsonData() {
  const jsonText = document.getElementById('json-preview').textContent;
  navigator.clipboard.writeText(jsonText).then(() => {
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Copiado!';
    setTimeout(() => {
      btn.innerHTML = originalText;
    }, 2000);
  });
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  app = new EmotionalMap();
  
  // Prevenir envio de formulários
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => e.preventDefault());
  });
});