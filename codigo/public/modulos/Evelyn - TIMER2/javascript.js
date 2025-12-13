// ============================================
// DSON.JS - Lógica Principal do Site
// ============================================

// ============================================
// INICIALIZAÇÃO
// ============================================
// ============================================
// SISTEMA DE NAVEGAÇÃO ENTRE PÁGINAS (definido antes do DOMContentLoaded)
// ============================================
function navigateToPage(pageName) {
  // Esconde todas as páginas
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.add('d-none');
  });
  
  // Esconde seções da home
  const homeSections = document.querySelectorAll('section:not(.page-section)');
  homeSections.forEach(section => {
    section.classList.add('d-none');
  });
  
  // Mostra a página solicitada
  const pageMap = {
    'home': null, // Home não é page-section
    'timer-desafio': 'page-timer-desafio',
    'progresso-diario': 'page-progresso-diario',
    'atividades-offline': 'page-atividades-offline',
    'mural-conquistas': 'page-mural-conquistas',
    'checklist-diario': 'page-checklist-diario',
    'compartilhar-progresso': 'page-compartilhar-progresso',
    'mapa-emocoes-expandido': 'page-mapa-emocoes-expandido',
    'not-found': 'page-not-found'
  };
  
  if (pageName === 'home') {
    // Mostra todas as seções da home
    homeSections.forEach(section => {
      section.classList.remove('d-none');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    const pageId = pageMap[pageName];
    if (pageId) {
      const page = document.getElementById(pageId);
      if (page) {
        page.classList.remove('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Inicializa a página se necessário
        initPage(pageName);
      }
    } else {
      navigateToPage('not-found');
    }
  }
}

// Função para inicializar páginas específicas
function initPage(pageName) {
  switch(pageName) {
    case 'timer-desafio':
      initTimer();
      break;
    case 'progresso-diario':
      initProgresso();
      break;
    case 'atividades-offline':
      initAtividades();
      break;
    case 'mural-conquistas':
      initConquistas();
      break;
    case 'checklist-diario':
      initChecklist();
      break;
    case 'compartilhar-progresso':
      // Já está inicializado no HTML
      break;
    case 'mapa-emocoes-expandido':
      initExpandedEmotionMap();
      break;
  }
}

// Disponibiliza globalmente
window.navigateToPage = navigateToPage;

document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  initEmotionMap();
  initQuiz();
  initTools();
  initHarms();
  initSolutions();
  
  // Verifica se há hash na URL para navegação inicial
  const hash = window.location.hash.substring(1);
  if (hash) {
    const pageMap = {
      'timer-desafio': 'timer-desafio',
      'progresso-diario': 'progresso-diario',
      'atividades-offline': 'atividades-offline',
      'mural-conquistas': 'mural-conquistas',
      'checklist-diario': 'checklist-diario',
      'compartilhar-progresso': 'compartilhar-progresso',
      'mapa-emocoes-expandido': 'mapa-emocoes-expandido'
    };
    if (pageMap[hash]) {
      navigateToPage(pageMap[hash]);
    }
  }
});

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
// ROLAGEM SUAVE
// ============================================
function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Disponibiliza globalmente para uso nos botões
window.scrollToSection = scrollToSection;

// ============================================
// MAPA DE EMOÇÕES
// ============================================
const emotions = [
  { 
    id: 'happy', 
    icon: 'bi-emoji-smile-fill', 
    label: 'Feliz', 
    color: 'text-info',
    suggestions: [
      'Continue assim! Aproveite para ler um livro que estava na lista',
      'Que tal compartilhar essa energia positiva com um amigo?',
      'Momento perfeito para praticar um hobby que você ama'
    ]
  },
  { 
    id: 'motivated', 
    icon: 'bi-heart-fill', 
    label: 'Motivado', 
    color: 'text-primary',
    suggestions: [
      'Use essa energia para começar aquele projeto que você adia',
      'Faça exercícios físicos e potencialize sua motivação',
      'Defina metas claras para os próximos dias'
    ]
  },
  { 
    id: 'bored', 
    icon: 'bi-emoji-neutral-fill', 
    label: 'Entediado', 
    color: 'text-muted',
    suggestions: [
      'Experimente uma nova receita na cozinha',
      'Comece a aprender algo novo: instrumento, idioma, desenho...',
      'Organize um espaço da sua casa que está bagunçado'
    ]
  },
  { 
    id: 'anxious', 
    icon: 'bi-emoji-frown-fill', 
    label: 'Ansioso', 
    color: 'text-warning',
    suggestions: [
      'Pratique 5 minutos de respiração profunda',
      'Faça uma caminhada ao ar livre sem celular',
      'Escreva seus pensamentos em um diário'
    ]
  },
  { 
    id: 'stressed', 
    icon: 'bi-lightning-charge-fill', 
    label: 'Estressado', 
    color: 'text-danger',
    suggestions: [
      'Tome um banho relaxante e ouça música calma',
      'Pratique meditação guiada por 10 minutos',
      'Converse com alguém de confiança sobre o que está sentindo'
    ]
  },
  { 
    id: 'tired', 
    icon: 'bi-cup-hot-fill', 
    label: 'Cansado', 
    color: 'text-muted',
    suggestions: [
      'Que tal um cochilo de 20 minutos?',
      'Beba água e faça alongamentos leves',
      'Priorize descanso: deixe as redes sociais para depois'
    ]
  }
];

function initEmotionMap() {
  const emotionsGrid = document.getElementById('emotionsGrid');
  const emotionSuggestions = document.getElementById('emotionSuggestions');
  const emotionIcon = document.getElementById('emotionIcon');
  const emotionLabel = document.getElementById('emotionLabel');
  const suggestionsList = document.getElementById('suggestionsList');
  
  if (!emotionsGrid) return;
  
  // Cria os botões de emoções
  emotions.forEach(emotion => {
    const col = document.createElement('div');
    col.className = 'col-6 col-md-4';
    
    const button = document.createElement('button');
    button.className = 'emotion-btn w-100';
    button.setAttribute('data-emotion-id', emotion.id);
    button.innerHTML = `
      <i class="bi ${emotion.icon} ${emotion.color}" style="font-size: 2rem;"></i>
      <span>${emotion.label}</span>
    `;
    
    button.addEventListener('click', () => {
      // Remove classe active de todos os botões
      document.querySelectorAll('.emotion-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Adiciona classe active ao botão clicado
      button.classList.add('active');
      
      // Mostra as sugestões
      const selected = emotions.find(e => e.id === emotion.id);
      if (selected) {
        emotionIcon.className = `bi ${selected.icon} ${selected.color}`;
        emotionLabel.textContent = selected.label.toLowerCase();
        
        suggestionsList.innerHTML = '';
        selected.suggestions.forEach(suggestion => {
          const li = document.createElement('li');
          li.textContent = suggestion;
          suggestionsList.appendChild(li);
        });
        
        emotionSuggestions.classList.remove('d-none');
      }
    });
    
    col.appendChild(button);
    emotionsGrid.appendChild(col);
  });
}

// ============================================
// MAPA DE EMOÇÕES EXPANDIDO
// ============================================
function initExpandedEmotionMap() {
  const expandedGrid = document.getElementById('expandedEmotionsGrid');
  if (!expandedGrid) return;
  
  expandedGrid.innerHTML = '';
  
  emotions.forEach((emotion, index) => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.style.animationDelay = `${index * 0.1}s`;
    
    const card = document.createElement('div');
    card.className = 'card harm-card shadow-sm h-100';
    card.innerHTML = `
      <div class="card-body">
        <div class="text-center mb-3">
          <i class="bi ${emotion.icon} ${emotion.color}" style="font-size: 3rem;"></i>
        </div>
        <h4 class="card-title text-center mb-3">${emotion.label}</h4>
        <h6 class="text-muted mb-3">Sugestões de atividades:</h6>
        <ul class="list-unstyled">
          ${emotion.suggestions.map((suggestion, i) => `
            <li class="d-flex align-items-start gap-2 mb-2">
              <span class="text-primary fw-bold mt-1">${i + 1}.</span>
              <span class="text-muted small">${suggestion}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    
    col.appendChild(card);
    expandedGrid.appendChild(col);
  });
}

// ============================================
// QUIZ DE HÁBITOS DIGITAIS
// ============================================
const questions = [
  {
    id: 1,
    question: 'Quanto tempo você passa diariamente em redes sociais/vídeos curtos?',
    options: [
      { text: 'Menos de 30 minutos', points: 1 },
      { text: 'Entre 30 minutos e 2 horas', points: 2 },
      { text: 'Entre 2 e 4 horas', points: 3 },
      { text: 'Mais de 4 horas', points: 4 }
    ]
  },
  {
    id: 2,
    question: 'Com que frequência você checa seu celular logo ao acordar?',
    options: [
      { text: 'Raramente', points: 1 },
      { text: 'Algumas vezes por semana', points: 2 },
      { text: 'Quase todos os dias', points: 3 },
      { text: 'Sempre', points: 4 }
    ]
  },
  {
    id: 3,
    question: 'Você consegue ficar sem o celular por 1 hora?',
    options: [
      { text: 'Sim, facilmente', points: 1 },
      { text: 'Sim, mas penso nele', points: 2 },
      { text: 'Com dificuldade', points: 3 },
      { text: 'Não consigo', points: 4 }
    ]
  },
  {
    id: 4,
    question: 'Com que frequência você abre apps de redes sociais automaticamente?',
    options: [
      { text: 'Raramente', points: 1 },
      { text: 'Às vezes', points: 2 },
      { text: 'Frequentemente', points: 3 },
      { text: 'Constantemente', points: 4 }
    ]
  }
];

const results = [
  {
    range: [4, 6],
    title: 'Uso Saudável 🎉',
    description: 'Parabéns! Você tem um relacionamento equilibrado com a tecnologia.',
    tips: [
      'Continue mantendo limites claros',
      'Inspire outras pessoas com seus hábitos',
      'Use o tempo livre para desenvolver hobbies'
    ]
  },
  {
    range: [7, 10],
    title: 'Uso Moderado ⚠️',
    description: 'Atenção! Você está no limite entre uso saudável e excessivo.',
    tips: [
      'Defina horários específicos para redes sociais',
      'Use ferramentas de controle de tempo',
      'Substitua alguns momentos digitais por atividades offline'
    ]
  },
  {
    range: [11, 14],
    title: 'Uso Excessivo 🚨',
    description: 'Alerta! Seu uso está impactando negativamente sua vida.',
    tips: [
      'Comece reduzindo 30 minutos por dia',
      'Ative modo foco durante trabalho/estudos',
      'Busque ajuda de amigos e familiares'
    ]
  },
  {
    range: [15, 16],
    title: 'Possível Dependência ⛔',
    description: 'Atenção máxima! Você pode estar desenvolvendo dependência digital.',
    tips: [
      'Considere ajuda profissional',
      'Faça um detox digital de fim de semana',
      'Use todas as ferramentas disponíveis no Desliga AI'
    ]
  }
];

let currentQuestion = 0;
let answers = [];
let showResult = false;

function initQuiz() {
  renderQuiz();
}

function renderQuiz() {
  const quizContent = document.getElementById('quizContent');
  const quizResult = document.getElementById('quizResult');
  const quizQuestion = document.getElementById('quizQuestion');
  const quizOptions = document.getElementById('quizOptions');
  const quizBadge = document.getElementById('quizBadge');
  const quizProgress = document.querySelector('#quizProgress .progress-bar');
  
  if (!quizContent || !quizResult) return;
  
  if (showResult) {
    // Mostra resultado
    quizContent.classList.add('d-none');
    quizResult.classList.remove('d-none');
    
    const totalPoints = answers.reduce((sum, points) => sum + points, 0);
    const result = results.find(r => totalPoints >= r.range[0] && totalPoints <= r.range[1]);
    
    if (result) {
      document.getElementById('resultTitle').textContent = result.title;
      document.getElementById('resultDescription').textContent = result.description;
      document.getElementById('resultBadge').textContent = `Pontuação: ${totalPoints}/16`;
      
      const resultTips = document.getElementById('resultTips');
      resultTips.innerHTML = '';
      result.tips.forEach(tip => {
        const li = document.createElement('li');
        li.className = 'd-flex align-items-start gap-2 mb-2';
        li.innerHTML = `
          <span class="text-primary fw-bold mt-1">•</span>
          <span class="small text-muted">${tip}</span>
        `;
        resultTips.appendChild(li);
      });
    }
  } else {
    // Mostra pergunta
    quizContent.classList.remove('d-none');
    quizResult.classList.add('d-none');
    
    const question = questions[currentQuestion];
    quizQuestion.textContent = question.question;
    
    if (quizBadge) {
      quizBadge.textContent = `${currentQuestion + 1} de ${questions.length}`;
    }
    
    if (quizProgress) {
      const progress = ((currentQuestion + 1) / questions.length) * 100;
      quizProgress.style.width = `${progress}%`;
    }
    
    quizOptions.innerHTML = '';
    question.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.className = 'btn btn-outline-primary';
      button.textContent = option.text;
      button.addEventListener('click', () => handleAnswer(option.points));
      quizOptions.appendChild(button);
    });
  }
}

function handleAnswer(points) {
  answers.push(points);
  
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    renderQuiz();
  } else {
    showResult = true;
    renderQuiz();
  }
}

function resetQuiz() {
  currentQuestion = 0;
  answers = [];
  showResult = false;
  renderQuiz();
}

// Disponibiliza globalmente
window.resetQuiz = resetQuiz;

// ============================================
// FERRAMENTAS
// ============================================
const tools = [
  {
    id: 'timer',
    title: 'Timer de Desafio',
    description: 'Desafie-se a ficar longe das redes por períodos definidos',
    icon: 'bi-stopwatch-fill',
    color: 'text-primary',
    route: '/timer-desafio'
  },
  {
    id: 'progress',
    title: 'Progresso Diário',
    description: 'Acompanhe seu tempo de uso e evolução semanal',
    icon: 'bi-graph-up-arrow',
    color: 'text-info',
    route: '/progresso-diario'
  },
  {
    id: 'activities',
    title: 'Atividades Offline',
    description: 'Descubra alternativas interessantes para fazer sem telas',
    icon: 'bi-lightbulb-fill',
    color: 'text-warning',
    route: '/atividades-offline'
  },
  {
    id: 'achievements',
    title: 'Mural de Conquistas',
    description: 'Desbloqueie badges e celebre suas vitórias',
    icon: 'bi-trophy-fill',
    color: 'text-primary',
    route: '/mural-conquistas'
  },
  {
    id: 'checklist',
    title: 'Checklist Diário',
    description: 'Mantenha o foco em atividades produtivas do dia',
    icon: 'bi-check-square-fill',
    color: 'text-info',
    route: '/checklist-diario'
  },
  {
    id: 'share',
    title: 'Compartilhar Progresso',
    description: 'Inspire outros compartilhando suas conquistas',
    icon: 'bi-share-fill',
    color: 'text-warning',
    route: '/compartilhar-progresso'
  }
];

function initTools() {
  const toolsGrid = document.getElementById('toolsGrid');
  if (!toolsGrid) return;
  
  const routeMap = {
    'timer': 'timer-desafio',
    'progress': 'progresso-diario',
    'activities': 'atividades-offline',
    'achievements': 'mural-conquistas',
    'checklist': 'checklist-diario',
    'share': 'compartilhar-progresso'
  };
  
  tools.forEach((tool, index) => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.style.animationDelay = `${index * 0.1}s`;
    
    const card = document.createElement('div');
    card.className = 'card harm-card shadow-sm h-100';
    card.setAttribute('data-tool-id', tool.id);
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div class="card-body">
        <i class="bi ${tool.icon} ${tool.color} harm-icon"></i>
        <h5 class="card-title">${tool.title}</h5>
        <p class="card-text text-muted small">${tool.description}</p>
      </div>
    `;
    
    card.addEventListener('click', () => {
      navigateToPage(routeMap[tool.id] || 'not-found');
    });
    
    col.appendChild(card);
    toolsGrid.appendChild(col);
  });
}

// ============================================
// MALEFÍCIOS
// ============================================
const harms = [
  {
    icon: 'bi-cpu-fill',
    title: 'Danos Cognitivos',
    description: 'Redução da capacidade de concentração, memória e pensamento crítico. O cérebro se acostuma com estímulos rápidos e perde a habilidade de foco profundo.',
    color: 'text-danger'
  },
  {
    icon: 'bi-clock-fill',
    title: 'Perda de Tempo',
    description: 'Horas valiosas desperdiçadas em conteúdo efêmero. Tempo que poderia ser usado para crescimento pessoal, relacionamentos e projetos importantes.',
    color: 'text-warning'
  },
  {
    icon: 'bi-eye-fill',
    title: 'Fadiga Visual',
    description: 'Cansaço ocular, visão embaçada e dores de cabeça frequentes causados pelo uso excessivo de telas e movimentos rápidos dos vídeos.',
    color: 'text-info'
  },
  {
    icon: 'bi-heart-fill',
    title: 'Saúde Mental',
    description: 'Aumento de ansiedade, depressão e baixa autoestima. Comparações constantes e FOMO (Fear of Missing Out) afetam o bem-estar emocional.',
    color: 'text-danger'
  },
  {
    icon: 'bi-people-fill',
    title: 'Isolamento Social',
    description: 'Menos interações reais e profundas. O tempo digital substitui conexões humanas genuínas, afetando relacionamentos e habilidades sociais.',
    color: 'text-primary'
  },
  {
    icon: 'bi-lightning-charge-fill',
    title: 'Produtividade Zero',
    description: 'Procrastinação constante e dificuldade em completar tarefas. O cérebro busca recompensas rápidas ao invés de trabalho profundo e significativo.',
    color: 'text-warning'
  }
];

function initHarms() {
  const harmsGrid = document.getElementById('harmsGrid');
  if (!harmsGrid) return;
  
  harms.forEach((harm, index) => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.style.animationDelay = `${index * 0.1}s`;
    
    const card = document.createElement('div');
    card.className = 'card harm-card shadow-sm h-100';
    card.innerHTML = `
      <div class="card-body">
        <i class="bi ${harm.icon} ${harm.color} harm-icon"></i>
        <h5 class="card-title">${harm.title}</h5>
        <p class="card-text text-muted small">${harm.description}</p>
      </div>
    `;
    
    col.appendChild(card);
    harmsGrid.appendChild(col);
  });
}

// ============================================
// SOLUÇÕES
// ============================================
const solutions = [
  {
    icon: 'bi-bullseye',
    title: 'Defina Limites Claros',
    steps: [
      'Estabeleça horários específicos para uso de redes sociais',
      'Use temporizadores e apps de controle de tempo',
      'Crie zonas livres de celular (quarto, refeições)',
      'Defina metas diárias de tempo máximo'
    ]
  },
  {
    icon: 'bi-shield-check',
    title: 'Crie Barreiras Físicas',
    steps: [
      'Deixe o celular em outro cômodo durante trabalho',
      'Desative notificações de apps não essenciais',
      'Use modo avião ou não perturbe com frequência',
      'Mantenha o celular longe da cama ao dormir'
    ]
  },
  {
    icon: 'bi-trophy-fill',
    title: 'Substitua o Hábito',
    steps: [
      'Liste atividades que você realmente gosta',
      'Tenha sempre um livro ou hobby à mão',
      'Pratique exercícios físicos regularmente',
      'Invista em encontros presenciais com amigos'
    ]
  },
  {
    icon: 'bi-check-circle-fill',
    title: 'Mantenha-se Firme',
    steps: [
      'Monitore seu progresso diariamente',
      'Celebre pequenas vitórias',
      'Não desista após recaídas, são parte do processo',
      'Busque apoio de amigos e família'
    ]
  }
];

function initSolutions() {
  const solutionsGrid = document.getElementById('solutionsGrid');
  if (!solutionsGrid) return;
  
  solutions.forEach((solution, index) => {
    const col = document.createElement('div');
    col.className = 'col-md-6';
    col.style.animationDelay = `${index * 0.1}s`;
    
    const card = document.createElement('div');
    card.className = 'card solution-card shadow-sm h-100';
    card.innerHTML = `
      <div class="card-body">
        <i class="bi ${solution.icon} text-primary solution-icon"></i>
        <h4 class="card-title">${solution.title}</h4>
        <ul class="list-unstyled">
          ${solution.steps.map((step, i) => `
            <li class="d-flex align-items-start gap-2 mb-3">
              <span class="text-primary fw-bold mt-1">${i + 1}.</span>
              <span class="text-muted">${step}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    
    col.appendChild(card);
    solutionsGrid.appendChild(col);
  });
}

// ============================================
// ANIMAÇÃO DE DECOLAGEM
// ============================================
function launchRocket() {
  // Função removida - seção "Pronto para Decolar" foi removida
}

// Disponibiliza globalmente
window.launchRocket = launchRocket;


// ============================================
// PÁGINA: CADASTRO
// ============================================
function initCadastro() {
  const form = document.getElementById('cadastroForm');
  if (!form) return;
  
  const errorDiv = document.getElementById('formError');
  const successDiv = document.getElementById('formSuccess');
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    
    errorDiv.classList.add('d-none');
    successDiv.classList.add('d-none');
    
    if (!nome || !email || !senha || !confirmarSenha) {
      errorDiv.textContent = 'Por favor, preencha todos os campos.';
      errorDiv.classList.remove('d-none');
      return;
    }
    
    if (senha.length < 6) {
      errorDiv.textContent = 'A senha deve ter no mínimo 6 caracteres.';
      errorDiv.classList.remove('d-none');
      return;
    }
    
    if (senha !== confirmarSenha) {
      errorDiv.textContent = 'As senhas não coincidem.';
      errorDiv.classList.remove('d-none');
      return;
    }
    
    successDiv.classList.remove('d-none');
    
    const userData = {
      nome: nome,
      email: email,
      dataCadastro: new Date().toISOString()
    };
    localStorage.setItem('user', JSON.stringify(userData));
    
    setTimeout(() => {
      navigateToPage('home');
    }, 2000);
  });
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

// ===== ELEMENTOS DO DOM =====
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

  prepCountdown();
}

function startCountdown() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!isPaused) {
      remainingTime--;
      if (timeDisplay) timeDisplay.textContent = formatTime(remainingTime);
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
  resetTimer();
  loadScoreDisplay();
  loadHistory();
}

// Disponibiliza funções globalmente
window.deleteSession = deleteSession;

// ============================================
// PÁGINA: PROGRESSO DIÁRIO
// ============================================
const weeklyData = [
  { day: 'Seg', minutes: 150, goal: 120 },
  { day: 'Ter', minutes: 90, goal: 120 },
  { day: 'Qua', minutes: 110, goal: 120 },
  { day: 'Qui', minutes: 85, goal: 120 },
  { day: 'Sex', minutes: 140, goal: 120 },
  { day: 'Sáb', minutes: 95, goal: 120 },
  { day: 'Dom', minutes: 100, goal: 120 }
];

function initProgresso() {
  // Calcula média
  const total = weeklyData.reduce((sum, d) => sum + d.minutes, 0);
  const media = Math.round(total / weeklyData.length);
  const mediaEl = document.getElementById('mediaDiaria');
  if (mediaEl) {
    mediaEl.textContent = `${media} min`;
  }
  
  // Renderiza gráfico
  const chartEl = document.getElementById('weeklyChart');
  if (chartEl) {
    chartEl.innerHTML = '';
    const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 120);
    
    weeklyData.forEach(data => {
      const height = (data.minutes / maxMinutes) * 100;
      const color = data.minutes <= data.goal ? 'bg-success' : 'bg-danger';
      const col = document.createElement('div');
      col.className = 'flex-fill d-flex flex-column align-items-center';
      col.innerHTML = `
        <div class="flex-fill d-flex align-items-end w-100">
          <div class="w-100 ${color} rounded-top" style="height: ${height}%; min-height: 10px;"></div>
        </div>
        <small class="mt-2 fw-bold">${data.day}</small>
        <small class="text-muted">${data.minutes}min</small>
      `;
      chartEl.appendChild(col);
    });
  }
}

// ============================================
// PÁGINA: ATIVIDADES OFFLINE
// ============================================
const activities = [
  { emoji: '🚶', title: 'Caminhar ao ar livre', desc: 'Uma caminhada pode renovar sua energia e clarear sua mente' },
  { emoji: '📚', title: 'Ler um livro', desc: 'Explore novos mundos através da leitura' },
  { emoji: '🧘', title: 'Meditar', desc: 'Conecte-se com seu interior e encontre paz' },
  { emoji: '🏃', title: 'Fazer exercícios', desc: 'Movimente o corpo e libere endorfinas' },
  { emoji: '🍳', title: 'Cozinhar algo novo', desc: 'Experimente receitas e descubra sabores' },
  { emoji: '🎨', title: 'Desenhar ou pintar', desc: 'Expresse sua criatividade através da arte' },
  { emoji: '🧹', title: 'Organizar um espaço', desc: 'Um ambiente organizado traz clareza mental' },
  { emoji: '📞', title: 'Ligar para alguém', desc: 'Conecte-se com pessoas queridas' },
  { emoji: '✍️', title: 'Escrever no diário', desc: 'Registre seus pensamentos e sentimentos' },
  { emoji: '🎸', title: 'Tocar um instrumento', desc: 'A música é uma forma de expressão única' },
  { emoji: '🌱', title: 'Fazer jardinagem', desc: 'Conecte-se com a natureza' },
  { emoji: '🌅', title: 'Assistir o pôr do sol', desc: 'Aprecie a beleza da natureza' }
];

let selectedActivity = activities[0];

function initAtividades() {
  // Renderiza grid de atividades
  const grid = document.getElementById('activitiesGrid');
  if (grid) {
    grid.innerHTML = '';
    activities.forEach(activity => {
      const col = document.createElement('div');
      col.className = 'col-6 col-md-4 col-lg-3';
      const card = document.createElement('div');
      card.className = 'card h-100 cursor-pointer';
      card.style.cursor = 'pointer';
      card.onclick = () => selectActivity(activity);
      card.innerHTML = `
        <div class="card-body text-center">
          <div class="display-4 mb-2">${activity.emoji}</div>
          <h6 class="card-title">${activity.title}</h6>
        </div>
      `;
      col.appendChild(card);
      grid.appendChild(col);
    });
  }
  
  updateSelectedActivity();
}

function selectActivity(activity) {
  selectedActivity = activity;
  updateSelectedActivity();
}

function shuffleActivity() {
  const random = activities[Math.floor(Math.random() * activities.length)];
  selectActivity(random);
}

function updateSelectedActivity() {
  const emojiEl = document.getElementById('selectedActivityEmoji');
  const titleEl = document.getElementById('selectedActivityTitle');
  const descEl = document.getElementById('selectedActivityDesc');
  
  if (emojiEl) emojiEl.textContent = selectedActivity.emoji;
  if (titleEl) titleEl.textContent = selectedActivity.title;
  if (descEl) descEl.textContent = selectedActivity.desc;
}

window.shuffleActivity = shuffleActivity;

// ============================================
// PÁGINA: MURAL DE CONQUISTAS
// ============================================
const achievements = [
  { id: 1, emoji: '🎯', title: 'Primeiro Passo', desc: 'Complete seu primeiro desafio', unlocked: true, date: '2025-01-15' },
  { id: 2, emoji: '⚔️', title: 'Guerreiro Digital', desc: 'Fique 3 dias sem redes sociais', unlocked: true, date: '2025-01-18' },
  { id: 3, emoji: '🎖️', title: 'Foco Total', desc: 'Complete 10 sessões de modo foco', unlocked: true, date: '2025-01-20' },
  { id: 4, emoji: '📅', title: 'Semana Consciente', desc: 'Use menos de 2h/dia por 7 dias', unlocked: false },
  { id: 5, emoji: '⏰', title: 'Mestre do Tempo', desc: 'Economize 1000 minutos', unlocked: false },
  { id: 6, emoji: '🧭', title: 'Explorador Offline', desc: 'Complete 20 atividades offline', unlocked: false },
  { id: 7, emoji: '🏆', title: 'Vencedor de 30 Dias', desc: 'Mantenha o hábito por 30 dias', unlocked: false },
  { id: 8, emoji: '✨', title: 'Inspirador', desc: 'Compartilhe seu progresso 5 vezes', unlocked: false },
  { id: 9, emoji: '🧘', title: 'Zen Digital', desc: 'Complete 50 sessões de meditação', unlocked: false }
];

function initConquistas() {
  const grid = document.getElementById('achievementsGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  const unlocked = achievements.filter(a => a.unlocked).length;
  const progressEl = document.getElementById('achievementsProgress');
  if (progressEl) {
    progressEl.textContent = `${unlocked}/${achievements.length}`;
  }
  
  achievements.forEach(achievement => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    const card = document.createElement('div');
    card.className = `card h-100 ${achievement.unlocked ? 'border-primary' : 'opacity-75'}`;
    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex align-items-start mb-3">
          <div class="display-4 me-3">${achievement.emoji}</div>
          <div class="flex-grow-1">
            <h5 class="card-title mb-1">${achievement.title}</h5>
            <p class="card-text text-muted small mb-2">${achievement.desc}</p>
            ${achievement.unlocked ? 
              `<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Desbloqueada</span>
               <small class="d-block text-muted mt-1">${new Date(achievement.date).toLocaleDateString('pt-BR')}</span>` :
              `<span class="badge bg-secondary">Bloqueada</span>`
            }
          </div>
        </div>
      </div>
    `;
    col.appendChild(card);
    grid.appendChild(col);
  });
}

// ============================================
// PÁGINA: CHECKLIST DIÁRIO
// ============================================
let tasks = [
  { id: 1, text: 'Meditar por 10 minutos', completed: false },
  { id: 2, text: 'Ler 30 páginas de um livro', completed: true },
  { id: 3, text: 'Fazer exercícios físicos', completed: false },
  { id: 4, text: 'Conversar com alguém pessoalmente', completed: false }
];

let taskIdCounter = 5;

function initChecklist() {
  loadTasks();
  renderTasks();
  updateProgress();
}

function loadTasks() {
  const saved = localStorage.getItem('tasks');
  if (saved) {
    tasks = JSON.parse(saved);
    taskIdCounter = Math.max(...tasks.map(t => t.id), 0) + 1;
  }
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
  const input = document.getElementById('newTaskInput');
  if (!input || !input.value.trim()) return;
  
  tasks.push({
    id: taskIdCounter++,
    text: input.value.trim(),
    completed: false
  });
  
  input.value = '';
  saveTasks();
  renderTasks();
  updateProgress();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateProgress();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  updateProgress();
}

function renderTasks() {
  const list = document.getElementById('tasksList');
  if (!list) return;
  
  list.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `list-group-item d-flex justify-content-between align-items-center ${task.completed ? 'text-decoration-line-through text-muted' : ''}`;
    li.innerHTML = `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" ${task.completed ? 'checked' : ''} 
               onchange="toggleTask(${task.id})" id="task${task.id}">
        <label class="form-check-label" for="task${task.id}">
          ${task.text}
        </label>
      </div>
      <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${task.id})">
        <i class="bi bi-trash"></i>
      </button>
    `;
    list.appendChild(li);
  });
}

function updateProgress() {
  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const progressEl = document.getElementById('checklistProgress');
  const progressBar = document.getElementById('checklistProgressBar');
  
  if (progressEl) progressEl.textContent = `${completed}/${total}`;
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${percentage}%`;
  }
}

window.addTask = addTask;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// ============================================
// PÁGINA: COMPARTILHAR PROGRESSO
// ============================================
function shareTo(platform) {
  const text = document.getElementById('shareText').value;
  const url = encodeURIComponent('https://desligaai.com');
  const shareText = encodeURIComponent(text);
  
  let shareUrl = '';
  switch(platform) {
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${shareText}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      break;
    case 'whatsapp':
      shareUrl = `https://wa.me/?text=${shareText}`;
      break;
    case 'telegram':
      shareUrl = `https://t.me/share/url?url=${url}&text=${shareText}`;
      break;
  }
  
  if (shareUrl) {
    window.open(shareUrl, '_blank');
  }
}

function copyShareText() {
  const textarea = document.getElementById('shareText');
  textarea.select();
  document.execCommand('copy');
  
  const successDiv = document.getElementById('copySuccess');
  if (successDiv) {
    successDiv.classList.remove('d-none');
    setTimeout(() => {
      successDiv.classList.add('d-none');
    }, 3000);
  }
}

window.shareTo = shareTo;
window.copyShareText = copyShareText;

// ============================================
// PÁGINA: MODO FOCO
// ============================================
let focusTimerInterval = null;
let focusTimerSeconds = 30 * 60;
let focusTimerRunning = false;
let focusTimerTotal = 30 * 60;
let focusModeActive = false;

function startFocusMode() {
  const duration = document.querySelector('input[name="focoDuration"]:checked').value;
  focusTimerTotal = parseInt(duration) * 60;
  focusTimerSeconds = focusTimerTotal;
  
  const config = document.getElementById('focoConfig');
  const active = document.getElementById('focoActive');
  
  if (config) config.classList.add('d-none');
  if (active) {
    active.classList.remove('d-none');
    focusModeActive = true;
    updateFocusTimerDisplay();
    updateFocusSettings();
    startFocusTimer();
  }
}

function endFocusMode() {
  pauseFocusTimer();
  focusModeActive = false;
  const config = document.getElementById('focoConfig');
  const active = document.getElementById('focoActive');
  if (config) config.classList.remove('d-none');
  if (active) active.classList.add('d-none');
  focusTimerSeconds = focusTimerTotal;
  updateFocusTimerDisplay();
}

function toggleFocusTimer() {
  if (focusTimerRunning) {
    pauseFocusTimer();
  } else {
    startFocusTimer();
  }
}

function startFocusTimer() {
  focusTimerRunning = true;
  const btn = document.getElementById('focoPlayPause');
  if (btn) {
    btn.innerHTML = '<i class="bi bi-pause-fill me-2"></i>Pausar';
  }
  
  focusTimerInterval = setInterval(() => {
    focusTimerSeconds--;
    updateFocusTimerDisplay();
    
    if (focusTimerSeconds <= 0) {
      completeFocusMode();
    }
  }, 1000);
}

function pauseFocusTimer() {
  focusTimerRunning = false;
  if (focusTimerInterval) {
    clearInterval(focusTimerInterval);
  }
  const btn = document.getElementById('focoPlayPause');
  if (btn) {
    btn.innerHTML = '<i class="bi bi-play-fill me-2"></i>Retomar';
  }
}

function updateFocusTimerDisplay() {
  const minutes = Math.floor(focusTimerSeconds / 60);
  const seconds = focusTimerSeconds % 60;
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const displayEl = document.getElementById('focoTimerDisplay');
  if (displayEl) {
    displayEl.textContent = display;
  }
  
  const progress = ((focusTimerTotal - focusTimerSeconds) / focusTimerTotal) * 100;
  const progressBar = document.getElementById('focoProgressBar');
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
}

function updateFocusSettings() {
  const settingsEl = document.getElementById('focoSettings');
  if (!settingsEl) return;
  
  const settings = [];
  if (document.getElementById('blockNotifications').checked) {
    settings.push('<i class="bi bi-check-circle text-success me-2"></i>Notificações bloqueadas');
  }
  if (document.getElementById('hideDistractions').checked) {
    settings.push('<i class="bi bi-check-circle text-success me-2"></i>Distrações escondidas');
  }
  if (document.getElementById('soundAlerts').checked) {
    settings.push('<i class="bi bi-check-circle text-success me-2"></i>Alertas sonoros ativos');
  }
  
  settingsEl.innerHTML = settings.length > 0 ? 
    `<div class="small text-muted">${settings.join('<br>')}</div>` : '';
}

function completeFocusMode() {
  pauseFocusTimer();
  alert('🎉 Modo Foco concluído! Parabéns por manter o foco!');
  endFocusMode();
}

window.startFocusMode = startFocusMode;
window.endFocusMode = endFocusMode;
window.toggleFocusTimer = toggleFocusTimer;

// ============================================
// PÁGINA: DIÁRIO RÁPIDO
// ============================================
let diaryEntries = [];
let selectedMoodValue = '';

function initDiario() {
  loadDiaryEntries();
  renderDiaryEntries();
}

function loadDiaryEntries() {
  const saved = localStorage.getItem('diaryEntries');
  if (saved) {
    diaryEntries = JSON.parse(saved);
  } else {
    // Entradas mock iniciais
    diaryEntries = [
      {
        id: 1,
        mood: '😊',
        text: 'Hoje foi um dia produtivo! Consegui ficar longe das redes sociais por 3 horas seguidas.',
        date: new Date('2025-01-20').toISOString()
      },
      {
        id: 2,
        mood: '💪',
        text: 'Estou me sentindo mais motivado a cada dia. O desafio está funcionando!',
        date: new Date('2025-01-19').toISOString()
      }
    ];
    saveDiaryEntries();
  }
}

function saveDiaryEntries() {
  localStorage.setItem('diaryEntries', JSON.stringify(diaryEntries));
}

function selectMood(mood) {
  selectedMoodValue = mood;
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.mood === mood) {
      btn.classList.add('active');
    }
  });
  document.getElementById('selectedMood').value = mood;
}

function saveDiaryEntry() {
  const mood = selectedMoodValue;
  const text = document.getElementById('diaryText').value.trim();
  const errorDiv = document.getElementById('diaryError');
  const successDiv = document.getElementById('diarySuccess');
  
  errorDiv.classList.add('d-none');
  successDiv.classList.add('d-none');
  
  if (!mood) {
    errorDiv.textContent = 'Por favor, selecione um humor.';
    errorDiv.classList.remove('d-none');
    return;
  }
  
  if (!text) {
    errorDiv.textContent = 'Por favor, escreva sua reflexão.';
    errorDiv.classList.remove('d-none');
    return;
  }
  
  diaryEntries.unshift({
    id: Date.now(),
    mood: mood,
    text: text,
    date: new Date().toISOString()
  });
  
  saveDiaryEntries();
  document.getElementById('diaryText').value = '';
  selectedMoodValue = '';
  document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active'));
  
  successDiv.classList.remove('d-none');
  renderDiaryEntries();
  
  setTimeout(() => {
    successDiv.classList.add('d-none');
  }, 3000);
}

function renderDiaryEntries() {
  const container = document.getElementById('diaryEntries');
  if (!container) return;
  
  container.innerHTML = '';
  diaryEntries.forEach(entry => {
    const col = document.createElement('div');
    col.className = 'col-12';
    const card = document.createElement('div');
    card.className = 'card';
    const date = new Date(entry.date);
    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex align-items-start mb-2">
          <span class="display-6 me-3">${entry.mood}</span>
          <div class="flex-grow-1">
            <small class="text-muted">${date.toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</small>
          </div>
        </div>
        <p class="card-text">${entry.text}</p>
      </div>
    `;
    col.appendChild(card);
    container.appendChild(col);
  });
}

window.selectMood = selectMood;
window.saveDiaryEntry = saveDiaryEntry;


