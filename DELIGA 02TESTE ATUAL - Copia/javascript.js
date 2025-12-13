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
  const themeToggle = $$('themeToggle');
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
  const element = $$(id);
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
  const emotionsGrid = $$('emotionsGrid');
  const emotionSuggestions = $$('emotionSuggestions');
  const emotionIcon = $$('emotionIcon');
  const emotionLabel = $$('emotionLabel');
  const suggestionsList = $$('suggestionsList');
  
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
  const expandedGrid = $$('expandedEmotionsGrid');
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
  const quizContent = $$('quizContent');
  const quizResult = $$('quizResult');
  const quizQuestion = $$('quizQuestion');
  const quizOptions = $$('quizOptions');
  const quizBadge = $$('quizBadge');
  const quizProgress = $('#quizProgress .progress-bar');
  
  if (!quizContent || !quizResult) return;
  
  if (showResult) {
    // Mostra resultado
    quizContent.classList.add('d-none');
    quizResult.classList.remove('d-none');
    
    const totalPoints = answers.reduce((sum, points) => sum + points, 0);
    const result = results.find(r => totalPoints >= r.range[0] && totalPoints <= r.range[1]);
    
    if (result) {
      $$('resultTitle').textContent = result.title;
      $$('resultDescription').textContent = result.description;
      $$('resultBadge').textContent = `Pontuação: ${totalPoints}/16`;
      
      const resultTips = $$('resultTips');
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
// VERIFICAÇÃO DE AUTENTICAÇÃO
// ============================================
function isUserLoggedIn() {
  const userData = localStorage.getItem('user');
  return userData !== null && userData !== undefined;
}

// ============================================
// SISTEMA DE NOTIFICAÇÕES
// ============================================
function showNotification(message, type = 'info', duration = 5000) {
  // Remove notificação existente se houver
  const existingNotification = document.querySelector('.custom-notification');
  if (existingNotification) {
    existingNotification.classList.remove('show');
    setTimeout(() => {
      if (existingNotification.parentElement) {
        existingNotification.remove();
      }
    }, 300);
  }

  // Aguarda um pouco antes de criar nova notificação se havia uma anterior
  setTimeout(() => {
    // Cria elemento de notificação
    const notification = document.createElement('div');
    notification.className = `custom-notification custom-notification-${type}`;
    notification.innerHTML = `
      <div class="custom-notification-content">
        <i class="bi ${type === 'warning' ? 'bi-exclamation-triangle-fill' : type === 'success' ? 'bi-check-circle-fill' : 'bi-info-circle-fill'} me-2"></i>
        <span>${message}</span>
        <button class="custom-notification-close" onclick="this.parentElement.parentElement.classList.remove('show'); setTimeout(() => { if (this.parentElement.parentElement.parentElement) { this.parentElement.parentElement.remove(); } }, 300);">
          <i class="bi bi-x"></i>
        </button>
      </div>
    `;

    // Adiciona ao body
    document.body.appendChild(notification);

    // Força reflow para garantir que a animação funcione
    void notification.offsetHeight;

    // Anima entrada - usa requestAnimationFrame para garantir que o navegador renderize
    requestAnimationFrame(() => {
      setTimeout(() => {
        notification.classList.add('show');
      }, 10);
    });

    // Remove automaticamente após duração
    if (duration > 0) {
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 300);
      }, duration);
    }
  }, existingNotification ? 350 : 0);
}

// Disponibiliza globalmente
window.showNotification = showNotification;

// ============================================
// SISTEMA DE TOOLTIP DE LOGIN
// ============================================
function showLoginTooltip(event, message = 'Faça login ou cadastro para acessar esta ferramenta') {
  // Remove tooltip existente se houver
  const existingTooltip = document.querySelector('.login-tooltip');
  if (existingTooltip) {
    existingTooltip.classList.remove('show');
    setTimeout(() => {
      if (existingTooltip.parentElement) {
        existingTooltip.remove();
      }
    }, 300);
  }

  // Obtém posição do mouse
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  // Obtém dimensões do footer para calcular posição inicial
  const footer = document.querySelector('footer');
  const footerRect = footer ? footer.getBoundingClientRect() : null;
  const startY = footerRect ? footerRect.top : window.innerHeight;

  // Cria elemento tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'login-tooltip';
  tooltip.innerHTML = `
    <div class="login-tooltip-content">
      <i class="bi bi-lock-fill me-2"></i>
      <span>${message}</span>
    </div>
  `;

  // Posiciona inicialmente no rodapé (fora da tela visível)
  tooltip.style.position = 'fixed';
  tooltip.style.left = `${mouseX}px`;
  tooltip.style.top = `${startY}px`;
  tooltip.style.transform = 'translate(-50%, 0)';
  tooltip.style.opacity = '0';
  tooltip.style.zIndex = '99999';

  // Adiciona ao body
  document.body.appendChild(tooltip);

  // Força reflow
  void tooltip.offsetHeight;

  // Calcula dimensões do tooltip
  const tooltipRect = tooltip.getBoundingClientRect();
  const tooltipWidth = tooltipRect.width;
  const tooltipHeight = tooltipRect.height;
  
  // Calcula posição final (acima do mouse)
  let finalX = mouseX;
  let finalY = mouseY - tooltipHeight - 15; // 15px acima do mouse
  
  // Ajusta posição horizontal se tooltip sair da tela
  const padding = 10;
  if (finalX - tooltipWidth / 2 < padding) {
    finalX = tooltipWidth / 2 + padding;
  } else if (finalX + tooltipWidth / 2 > window.innerWidth - padding) {
    finalX = window.innerWidth - tooltipWidth / 2 - padding;
  }
  
  // Ajusta posição vertical se tooltip sair da tela no topo
  if (finalY < padding) {
    finalY = mouseY + 30; // Mostra abaixo do mouse se não couber acima
  }

  // Anima do rodapé até acima do mouse
  requestAnimationFrame(() => {
    setTimeout(() => {
      tooltip.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      tooltip.style.left = `${finalX}px`;
      tooltip.style.top = `${finalY}px`;
      tooltip.style.opacity = '1';
      tooltip.classList.add('show');
    }, 10);
  });

  // Remove automaticamente após 4 segundos
  setTimeout(() => {
    tooltip.style.opacity = '0';
    tooltip.style.transform = 'translate(-50%, -20px)';
    setTimeout(() => {
      if (tooltip.parentElement) {
        tooltip.remove();
      }
    }, 400);
  }, 4000);
}

// Disponibiliza globalmente
window.showLoginTooltip = showLoginTooltip;

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
  const toolsGrid = $$('toolsGrid');
  if (!toolsGrid) return;
  
  const routeMap = {
    'timer': 'timer-desafio',
    'progress': 'progresso-diario',
    'activities': 'atividades-offline',
    'achievements': 'mural-conquistas',
    'checklist': 'checklist-diario',
    'share': 'compartilhar-progresso'
  };

  // Cards que requerem login
  const protectedTools = ['timer', 'progress', 'activities', 'achievements', 'checklist', 'share'];
  
  tools.forEach((tool, index) => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.style.animationDelay = `${index * 0.1}s`;
    
    const card = document.createElement('div');
    card.className = 'card harm-card shadow-sm h-100';
    card.setAttribute('data-tool-id', tool.id);
    card.style.cursor = 'pointer';
    
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardBody.innerHTML = `
      <i class="bi ${tool.icon} ${tool.color} harm-icon"></i>
      <h5 class="card-title">${tool.title}</h5>
      <p class="card-text text-muted small">${tool.description}</p>
    `;
    
    card.appendChild(cardBody);
    
    card.addEventListener('click', (event) => {
      const requiresLogin = protectedTools.includes(tool.id);
      
      if (requiresLogin && !isUserLoggedIn()) {
        // Previne navegação
        event.preventDefault();
        event.stopPropagation();
        
        // Mostra tooltip acima do mouse
        showLoginTooltip(event, 'Faça login ou cadastro para acessar esta ferramenta');
        
        return false;
      }
      
      // Se estiver logado ou não precisar de login, navega normalmente
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
  const harmsGrid = $$('harmsGrid');
  if (!harmsGrid) return;
  
  harms.forEach((harm, index) => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.style.animationDelay = `${index * 0.1}s`;
    
    const card = document.createElement('div');
    card.className = 'card harm-card shadow-sm h-100';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div class="card-body">
        <i class="bi ${harm.icon} ${harm.color} harm-icon"></i>
        <h5 class="card-title">${harm.title}</h5>
        <p class="card-text text-muted small">${harm.description}</p>
      </div>
    `;
    
    // Adiciona event listener para bloquear acesso quando não logado
    card.addEventListener('click', (event) => {
      if (!isUserLoggedIn()) {
        // Previne qualquer ação padrão
        event.preventDefault();
        event.stopPropagation();
        
        // Mostra tooltip acima do mouse
        showLoginTooltip(event, 'Faça login para ter acesso completo');
        
        return false;
      }
      // Se estiver logado, permite interação normal (se houver alguma ação futura)
    });
    
    col.appendChild(card);
    harmsGrid.appendChild(col);
  });
}

// ============================================
// SOLUÇÕES
// ============================================
function initSolutions() {
  const solutionsGrid = $$('solutionsGrid');
  if (!solutionsGrid) return;
  
  // Limpa o grid
  solutionsGrid.innerHTML = '';
  
  // Cria um único card centralizado
  const col = document.createElement('div');
  col.className = 'col-lg-10 mx-auto';
  col.style.animationDelay = '0.1s';
  
  const card = document.createElement('div');
  card.className = 'card solution-card shadow-sm';
  card.innerHTML = `
    <div class="card-body p-5">
      <div class="text-content" style="line-height: 1.8; font-size: 1.1rem;">
        <p class="mb-4">
          O <strong>Desliga Aí</strong> é um compromisso de 30 dias para você retomar o controle do seu tempo e da sua atenção. Vídeos curtos não roubam só minutos — roubam foco, energia e presença. E isso não é fraqueza, é como eles foram feitos para funcionar.
        </p>
        <p class="mb-4">
          Não prometemos milagres. A mudança começa com você. O primeiro passo é decidir parar de ser controlado. A partir daí, o <strong>Desliga Aí</strong> caminha ao seu lado, ajudando você a quebrar o ciclo e reconstruir hábitos mais conscientes.
        </p>
        <p class="mb-4 fw-semibold" style="font-size: 1.15rem;">
          Não é sobre abandonar a tecnologia.<br>
          É sobre assumir o controle da sua vida.
        </p>
        <p class="mb-0 text-center" style="font-size: 1.2rem; font-weight: 600;">
          <strong class="text-gradient">O PRIMEIRO PASSO E SEU!!!</strong>
        </p>
      </div>
    </div>
  `;
  
  col.appendChild(card);
  solutionsGrid.appendChild(col);
  
  // Adiciona botão "Vamos lá" abaixo do card
  const buttonCol = document.createElement('div');
  buttonCol.className = 'col-lg-10 mx-auto mt-4';
  buttonCol.style.animationDelay = '0.2s';
  buttonCol.innerHTML = `
    <div class="text-center">
      <button class="btn btn-primary btn-lg px-5 py-3" onclick="goToAuth()" style="font-size: 1.1rem;">
        <i class="bi bi-rocket-takeoff me-2"></i>Vamos lá
      </button>
    </div>
  `;
  solutionsGrid.appendChild(buttonCol);
}

// Função para navegar para telas de autenticação
function goToAuth() {
  // Redireciona diretamente para a página de login
  window.location.href = 'Cadastro/login.html';
}

// Disponibiliza globalmente
window.goToAuth = goToAuth;

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
  // Toca som de notificação do sistema (não requer arquivo externo)
  try {
    // Usa Web Audio API para gerar um beep simples
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    // Ignora erros se Web Audio API não estiver disponível
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
      const tbody = $('#scoresTable tbody');
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
      const tbody = $('#historyTable tbody');
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

// ===== CACHE DE SELETORES =====
const $ = (selector, all = false) => {
  return all ? document.querySelectorAll(selector) : document.querySelector(selector);
};

const $$ = (id) => document.getElementById(id);

// ===== INICIALIZAÇÃO =====
function initTimer() {
  // Inicializa elementos do DOM (com cache)
  timeDisplay = $$('time-display');
  startBtn = $$('start-timer');
  pauseBtn = $$('pauseBtn');
  resetBtn = $$('resetBtn');
  focusInput = $$('focusTime');
  breakInput = $$('breakTime');
  cyclesInput = $$('cycles');
  timerOptions = $('.timer-options button', true);
  timerCircle = $('.timer-circle');
  intervalTypeDisplay = $$('intervalType');
  cycleDisplay = $$('cycleDisplay');

  // Validação de inputs
  if (focusInput) focusInput.addEventListener('input', toggleStartButton);
  if (breakInput) breakInput.addEventListener('input', toggleStartButton);
  if (cyclesInput) cyclesInput.addEventListener('input', toggleStartButton);

  // Eventos do formulário
  const timerForm = $$('timerForm');
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
  const scoreForm = $$('scoreForm');
  if (scoreForm) {
    scoreForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const scoreInput = $$('playerScore');
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
  const mediaEl = $$('mediaDiaria');
  if (mediaEl) {
    mediaEl.textContent = `${media} min`;
  }
  
  // Renderiza gráfico
  const chartEl = $$('weeklyChart');
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
  const grid = $$('activitiesGrid');
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
  const emojiEl = $$('selectedActivityEmoji');
  const titleEl = $$('selectedActivityTitle');
  const descEl = $$('selectedActivityDesc');
  
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
  const grid = $$('achievementsGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  const unlocked = achievements.filter(a => a.unlocked).length;
  const progressEl = $$('achievementsProgress');
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
const TASKS_STORAGE_KEY = 'desliga_checklist_tasks_v1';
let tasks = [];
let taskIdCounter = 1;

// ============================================
// SISTEMA DE REGISTRO DE PROGRESSO DIÁRIO
// ============================================
const ENTRIES_STORAGE_KEY = 'desliga_progress_entries_v1';
let entries = [];
let editingId = null;

function initChecklist() {
  // Inicializa o sistema de registro
  loadEntries();
  initEntryForm();
  renderEntries();
  
  // Inicializa o checklist
  loadTasks();
  renderTasks();
  updateTaskPercentage();
  
  // Adiciona evento de Enter no input
  const input = $$('newTaskInput');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTask();
      }
    });
  }
  
  // Inicializa data com hoje
  const dateInput = $$('date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }
  
  // Redimensiona gráfico quando necessário (com debounce para performance)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => drawChart(), 250);
  });
  
  // Desenha gráfico após um pequeno delay para garantir que o canvas esteja renderizado
  setTimeout(() => drawChart(), 100);
}

function loadEntries() {
  try {
    const saved = localStorage.getItem(ENTRIES_STORAGE_KEY);
    if (saved) {
      entries = JSON.parse(saved);
      entries.sort((a, b) => b.date.localeCompare(a.date));
    }
  } catch (e) {
    console.error('Erro ao carregar entradas:', e);
    entries = [];
  }
}

function saveEntries() {
  try {
    localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(entries));
    renderEntries();
  } catch (e) {
    console.error('Erro ao salvar entradas:', e);
  }
}

function initEntryForm() {
  const form = $$('entryForm');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const dateInput = $$('date');
    const minutesInput = $$('minutes');
    const cravingInput = $$('craving');
    const moodInput = $$('mood');
    const notesInput = $$('notes');
    
    if (!dateInput || !minutesInput) return;
    
    const date = dateInput.value;
    const minutes = Number(minutesInput.value) || 0;
    const craving = Number(cravingInput?.value) || 0;
    const mood = moodInput?.value.trim() || '';
    const notes = notesInput?.value.trim() || '';
    
    if (!date) {
      alert('Escolha uma data');
      return;
    }
    
    const entry = {
      id: editingId || 'id_' + Date.now(),
      date,
      minutes,
      craving,
      mood,
      notes,
      createdAt: new Date().toISOString()
    };
    
    addOrUpdateEntry(entry);
    
    // Reset form
    form.reset();
    if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);
    if (minutesInput) minutesInput.value = '';
    if (cravingInput) cravingInput.value = '0';
    if (moodInput) moodInput.value = '';
    if (notesInput) notesInput.value = '';
    editingId = null;
  });
  
  // Botão limpar tudo
  const clearAllBtn = $$('clearAll');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (confirm('Apagar todas as entradas? Isso não pode ser desfeito.')) {
        entries = [];
        tasks = [];
        localStorage.removeItem(ENTRIES_STORAGE_KEY);
        localStorage.removeItem(TASKS_STORAGE_KEY);
        renderEntries();
        renderTasks();
        updateTaskPercentage();
      }
    });
  }
}

function addOrUpdateEntry(entry) {
  if (editingId) {
    const idx = entries.findIndex(e => e.id === editingId);
    if (idx > -1) {
      entries[idx] = { ...entries[idx], ...entry };
    }
    editingId = null;
  } else {
    entries.push(entry);
  }
  entries.sort((a, b) => b.date.localeCompare(a.date));
  saveEntries();
}

function removeEntry(id) {
  entries = entries.filter(e => e.id !== id);
  saveEntries();
}

function startEdit(id) {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;
  
  editingId = id;
  const dateInput = $$('date');
  const minutesInput = $$('minutes');
  const cravingInput = $$('craving');
  const moodInput = $$('mood');
  const notesInput = $$('notes');
  
  if (dateInput) dateInput.value = entry.date;
  if (minutesInput) minutesInput.value = entry.minutes;
  if (cravingInput) cravingInput.value = entry.craving;
  if (moodInput) moodInput.value = entry.mood || '';
  if (notesInput) notesInput.value = entry.notes || '';
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderEntries() {
  const list = $$('entriesList');
  if (!list) return;
  
  list.innerHTML = '';
  
  if (entries.length === 0) {
    list.innerHTML = '<div class="text-center text-muted p-3">Nenhuma entrada ainda. Registre seu primeiro dia acima!</div>';
    updateStats();
    drawChart();
    return;
  }
  
  entries.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'card mb-2';
    div.innerHTML = `
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div class="fw-bold">${entry.date}</div>
            <small class="text-muted">${entry.minutes} min • desejo ${entry.craving} • ${entry.mood || '—'}</small>
          </div>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary btn-sm" data-action="edit" data-id="${entry.id}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger btn-sm" data-action="del" data-id="${entry.id}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
        ${entry.notes ? `<div class="small text-muted mt-2">${entry.notes.replace(/\n/g, '<br>')}</div>` : ''}
      </div>
    `;
    list.appendChild(div);
  });
  
  // Attach event listeners
  list.querySelectorAll("[data-action='edit']").forEach(btn => {
    btn.addEventListener('click', () => startEdit(btn.dataset.id));
  });
  
  list.querySelectorAll("[data-action='del']").forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Remover este registro?')) {
        removeEntry(btn.dataset.id);
      }
    });
  });
  
  updateStats();
  drawChart();
}

function updateStats() {
  const totalDays = entries.length;
  const totalMinutes = entries.reduce((sum, e) => sum + (Number(e.minutes) || 0), 0);
  const avgMinutes = totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0;
  const bestStreak = calcBestStreak();
  
  const totalDaysEl = $$('totalDays');
  const totalMinutesEl = $$('totalMinutes');
  const avgMinutesEl = $$('avgMinutes');
  const bestStreakEl = $$('bestStreak');
  
  if (totalDaysEl) totalDaysEl.textContent = totalDays;
  if (totalMinutesEl) totalMinutesEl.textContent = totalMinutes;
  if (avgMinutesEl) avgMinutesEl.textContent = avgMinutes;
  if (bestStreakEl) bestStreakEl.textContent = bestStreak;
}

function calcBestStreak() {
  if (entries.length === 0) return 0;
  
  const set = new Set(entries.filter(e => Number(e.minutes) > 0).map(e => e.date));
  const dates = Array.from(new Set(entries.map(e => e.date))).sort();
  
  let best = 0;
  let cur = 0;
  let prev = null;
  
  dates.forEach(d => {
    if (!prev) {
      prev = d;
      cur = set.has(d) ? 1 : 0;
      best = Math.max(best, cur);
      return;
    }
    
    const pd = new Date(prev);
    const cd = new Date(d);
    const diff = (cd - pd) / (1000 * 60 * 60 * 24);
    
    if (diff === 1 && set.has(d)) {
      cur += 1;
    } else {
      cur = set.has(d) ? 1 : 0;
    }
    
    best = Math.max(best, cur);
    prev = d;
  });
  
  return best;
}

function drawChart() {
  const chart = $$('chart');
  if (!chart) return;
  
  const ctx = chart.getContext('2d');
  const rect = chart.getBoundingClientRect();
  const w = chart.width = rect.width * (window.devicePixelRatio || 1);
  const h = chart.height = 120 * (window.devicePixelRatio || 1);
  
  ctx.clearRect(0, 0, w, h);
  
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = entries.find(e => e.date === key);
    last7.push({ date: key, minutes: entry ? Number(entry.minutes) || 0 : 0 });
  }
  
  const max = Math.max(...last7.map(x => x.minutes), 1);
  const pad = 20 * (window.devicePixelRatio || 1);
  const areaW = w - pad * 2;
  const barW = areaW / 7 * 0.7;
  
  last7.forEach((d, i) => {
    const x = pad + i * (areaW / 7) + (areaW / 7 - barW) / 2;
    const barH = (d.minutes / max) * (h - pad * 2);
    const y = h - pad - barH;
    
    // Cor do gráfico adaptável ao tema - melhorado para modo escuro
    const isDark = document.documentElement.classList.contains('dark');
    
    // Barras do gráfico - mais brilhantes no modo escuro
    if (isDark) {
      ctx.fillStyle = 'rgba(96, 165, 250, 1)'; // Azul mais brilhante
      ctx.shadowColor = 'rgba(96, 165, 250, 0.5)';
      ctx.shadowBlur = 4;
    } else {
      ctx.fillStyle = 'rgba(96, 165, 250, 0.9)';
      ctx.shadowBlur = 0;
    }
    
    ctx.fillRect(x, y, barW, barH);
    ctx.shadowBlur = 0; // Reset shadow
    
    // Texto das datas - mais visível no modo escuro
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 0.7)';
    ctx.font = 'bold ' + (11 * (window.devicePixelRatio || 1)) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(d.date.slice(5), x + barW / 2, h - pad / 2);
  });
}

function loadTasks() {
  try {
    const saved = localStorage.getItem(TASKS_STORAGE_KEY);
    if (saved) {
      tasks = JSON.parse(saved);
      taskIdCounter = Math.max(...tasks.map(t => t.id || 0), 0) + 1;
    } else {
      // Tarefas padrão iniciais
      tasks = [
        { id: 1, text: 'Meditar por 10 minutos', completed: false },
        { id: 2, text: 'Ler 30 páginas de um livro', completed: false },
        { id: 3, text: 'Fazer exercícios físicos', completed: false },
        { id: 4, text: 'Conversar com alguém pessoalmente', completed: false }
      ];
      taskIdCounter = 5;
      saveTasks();
    }
  } catch (e) {
    console.error('Erro ao carregar tarefas:', e);
    tasks = [];
    taskIdCounter = 1;
  }
}

function saveTasks() {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Erro ao salvar tarefas:', e);
  }
}

function addTask() {
  const input = $$('newTaskInput');
  if (!input || !input.value.trim()) return;
  
  tasks.push({
    id: taskIdCounter++,
    text: input.value.trim(),
    completed: false
  });
  
  input.value = '';
  saveTasks();
  renderTasks();
  updateTaskPercentage();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateTaskPercentage();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  updateTaskPercentage();
}

function renderTasks() {
  const list = $$('tasksList');
  if (!list) return;
  
  list.innerHTML = '';
  
  if (tasks.length === 0) {
    list.innerHTML = '<li class="list-group-item text-center text-muted">Nenhuma tarefa ainda. Adicione uma nova tarefa acima!</li>';
    return;
  }
  
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `list-group-item checklist-item ${task.completed ? 'completed' : ''}`;
    li.style.cursor = 'pointer';
    li.style.transition = 'background-color 0.2s ease';
    
    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.text;
    if (task.completed) {
      taskText.style.textDecoration = 'line-through';
      taskText.style.opacity = '0.6';
    }
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-outline-danger';
    deleteBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
    deleteBtn.title = 'Remover tarefa';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'form-check-input me-2';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));
    
    li.appendChild(checkbox);
    li.appendChild(taskText);
    actionsDiv.appendChild(deleteBtn);
    li.appendChild(actionsDiv);
    
    list.appendChild(li);
  });
}

function updateTaskPercentage() {
  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const percentageEl = $$('checklistPercentage');
  const progressBar = $$('checklistProgressBar');
  
  if (percentageEl) {
    percentageEl.textContent = `${percentage}%`;
  }
  
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${percentage}%`;
    progressBar.setAttribute('aria-valuenow', percentage);
    progressBar.setAttribute('aria-valuemin', 0);
    progressBar.setAttribute('aria-valuemax', 100);
  }
}

window.addTask = addTask;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// ============================================
// PÁGINA: COMPARTILHAR PROGRESSO
// ============================================
function shareTo(platform) {
  const text = $$('shareText').value;
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
  const textarea = $$('shareText');
  textarea.select();
  document.execCommand('copy');
  
  const successDiv = $$('copySuccess');
  if (successDiv) {
    successDiv.classList.remove('d-none');
    setTimeout(() => {
      successDiv.classList.add('d-none');
    }, 3000);
  }
}

window.shareTo = shareTo;
window.copyShareText = copyShareText;


