// Dados das emoções
const emotions = [
  {
    id: 'happy',
    icon: '😊',
    title: 'Feliz',
    color: 'text-info',
    description: 'Sentimento de contentamento, alegria e satisfação',
    triggers: [
      'Conquista de um objetivo',
      'Momento de diversão',
      'Reconhecimento',
      'Encontro com amigos'
    ],
    suggestions: [
      {
        icon: '📚',
        title: 'Ler um livro inspirador',
        description: 'Aproveite o bom humor para se dedicar a uma leitura que te motive'
      },
      {
        icon: '🎨',
        title: 'Expressar criatividade',
        description: 'Pinte, desenhe ou crie algo que expresse sua felicidade'
      },
      {
        icon: '🤝',
        title: 'Compartilhar com outros',
        description: 'Conecte-se com pessoas queridas e compartilhe sua alegria'
      },
      {
        icon: '🌱',
        title: 'Planejar novos projetos',
        description: 'Use a energia positiva para traçar metas e planos futuros'
      }
    ]
  },
  {
    id: 'anxious',
    icon: '😰',
    title: 'Ansioso',
    color: 'text-warning',
    description: 'Sentimento de inquietação, preocupação e nervosismo',
    triggers: [
      'Prazos apertados',
      'Situações novas',
      'Incertezas',
      'Excesso de informações'
    ],
    suggestions: [
      {
        icon: '🧘',
        title: 'Praticar respiração',
        description: 'Exercícios de respiração profunda para acalmar a mente'
      },
      {
        icon: '📝',
        title: 'Escrever preocupações',
        description: 'Colocar no papel ajuda a organizar pensamentos'
      },
      {
        icon: '🚶',
        title: 'Caminhar ao ar livre',
        description: 'Movimentar-se em ambiente natural reduz a ansiedade'
      },
      {
        icon: '🎵',
        title: 'Ouvir música calma',
        description: 'Músicas relaxantes podem acalmar o sistema nervoso'
      }
    ]
  },
  {
    id: 'stressed',
    icon: '😫',
    title: 'Estressado',
    color: 'text-danger',
    description: 'Sensação de sobrecarga, pressão e exaustão mental',
    triggers: [
      'Múltiplas tarefas',
      'Conflitos',
      'Falta de tempo',
      'Expectativas altas'
    ],
    suggestions: [
      {
        icon: '💆',
        title: 'Alongamento corporal',
        description: 'Alivie a tensão muscular com exercícios suaves'
      },
      {
        icon: '🛀',
        title: 'Banho relaxante',
        description: 'Água morna ajuda a relaxar corpo e mente'
      },
      {
        icon: '📵',
        title: 'Desconectar digitalmente',
        description: 'Afaste-se das telas por um tempo determinado'
      },
      {
        icon: '🍵',
        title: 'Chá calmante',
        description: 'Bebidas quentes como camomila ou erva-doce acalmam'
      }
    ]
  },
  {
    id: 'bored',
    icon: '😐',
    title: 'Entediado',
    color: 'text-muted',
    description: 'Falta de interesse, motivação ou estímulo',
    triggers: [
      'Rotina monótona',
      'Falta de desafios',
      'Tempo ocioso',
      'Atividades repetitivas'
    ],
    suggestions: [
      {
        icon: '🧩',
        title: 'Aprender algo novo',
        description: 'Curso online, idioma ou habilidade diferente'
      },
      {
        icon: '🧹',
        title: 'Organizar espaços',
        description: 'Ambientes organizados trazem nova energia'
      },
      {
        icon: '📖',
        title: 'Explorar novos interesses',
        description: 'Descubra hobbies ou temas que despertem curiosidade'
      },
      {
        icon: '🎯',
        title: 'Criar pequenos desafios',
        description: 'Metas simples que tragam senso de realização'
      }
    ]
  },
  {
    id: 'sad',
    icon: '😢',
    title: 'Triste',
    color: 'text-info',
    description: 'Sentimento de pesar, desânimo e melancolia',
    triggers: [
      'Perdas ou desilusões',
      'Frustrações',
      'Solidão',
      'Cansaço emocional'
    ],
    suggestions: [
      {
        icon: '🎬',
        title: 'Assistir um filme',
        description: 'Histórias que tragam conforto ou distração'
      },
      {
        icon: '📓',
        title: 'Escrever sentimentos',
        description: 'Externalizar emoções através da escrita'
      },
      {
        icon: '☕',
        title: 'Tomar uma bebida quente',
        description: 'Momento de aconchego e cuidado pessoal'
      },
      {
        icon: '🌳',
        title: 'Contato com a natureza',
        description: 'Observar árvores, pássaros ou o céu pode acalmar'
      }
    ]
  },
  {
    id: 'angry',
    icon: '😠',
    title: 'Irritado',
    color: 'text-warning',
    description: 'Sentimento de raiva, frustração e impaciência',
    triggers: [
      'Injustiças',
      'Falta de controle',
      'Interrupções',
      'Expectativas não atendidas'
    ],
    suggestions: [
      {
        icon: '🥊',
        title: 'Atividade física intensa',
        description: 'Liberar energia acumulada de forma saudável'
      },
      {
        icon: '🧘',
        title: 'Meditação guiada',
        description: 'Técnicas para acalmar a mente e o corpo'
      },
      {
        icon: '🎵',
        title: 'Ouvir música energética',
        description: 'Ritmos que ajudem a liberar emoções'
      },
      {
        icon: '💨',
        title: 'Respiração consciente',
        description: 'Focar na respiração para recuperar o controle'
      }
    ]
  },
  {
    id: 'tired',
    icon: '😴',
    title: 'Cansado',
    color: 'text-muted',
    description: 'Falta de energia, exaustão física ou mental',
    triggers: [
      'Sono insuficiente',
      'Excesso de trabalho',
      'Desgaste emocional',
      'Má alimentação'
    ],
    suggestions: [
      {
        icon: '🛌',
        title: 'Descanso programado',
        description: 'Cochilo breve ou período de repouso'
      },
      {
        icon: '🧘',
        title: 'Alongamento suave',
        description: 'Movimentos que aliviem tensão muscular'
      },
      {
        icon: '💧',
        title: 'Hidratação',
        description: 'Beber água para recuperar energia'
      },
      {
        icon: '🌅',
        title: 'Ar fresco',
        description: 'Respirar ar puro para revitalizar'
      }
    ]
  },
  {
    id: 'motivated',
    icon: '💪',
    title: 'Motivado',
    color: 'text-success',
    description: 'Energia, disposição e vontade de agir',
    triggers: [
      'Conquistas recentes',
      'Inspiração',
      'Novos projetos',
      'Apoio de outras pessoas'
    ],
    suggestions: [
      {
        icon: '🎯',
        title: 'Definir metas claras',
        description: 'Aproveitar a energia para planejar objetivos'
      },
      {
        icon: '📚',
        title: 'Aprender algo desafiador',
        description: 'Usar a motivação para adquirir novas habilidades'
      },
      {
        icon: '🏃',
        title: 'Exercitar-se',
        description: 'Atividade física para canalizar a energia'
      },
      {
        icon: '🤝',
        title: 'Inspirar outros',
        description: 'Compartilhar sua energia positiva com pessoas próximas'
      }
    ]
  }
];

// Variável para armazenar a emoção selecionada
let selectedEmotion = null;

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
  // Atualizar valores dos sliders
  const sliders = document.querySelectorAll('.slider');
  sliders.forEach(slider => {
    const valueElement = document.getElementById(slider.id.replace('slider', 'value'));
    valueElement.textContent = slider.value;
    
    slider.addEventListener('input', function() {
      valueElement.textContent = this.value;
    });
  });
  
  // Enviar formulário
  document.getElementById('emotion-map-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = getFormData();
    
    // Aqui você normalmente enviaria os dados para um servidor
    // Por enquanto, vamos apenas mostrar uma mensagem
    alert('Perfil salvo com sucesso! Suas preferências foram atualizadas.');
    console.log('Dados do formulário:', formData);
  });
  
  // Carregar dados salvos, se existirem
  loadSavedData();
});

// Função para mostrar o grid de emoções
function showEmotionsGrid() {
  document.getElementById('welcome-screen').classList.add('d-none');
  document.getElementById('emotions-screen').classList.remove('d-none');
  document.getElementById('form-screen').classList.add('d-none');
  
  // Renderizar o grid de emoções se ainda não foi renderizado
  if (document.getElementById('emotionsGrid').children.length === 0) {
    renderEmotionsGrid();
  }
}

// Função para mostrar o formulário de personalização
function showPersonalizationForm() {
  document.getElementById('welcome-screen').classList.add('d-none');
  document.getElementById('emotions-screen').classList.add('d-none');
  document.getElementById('form-screen').classList.remove('d-none');
}

// Função para renderizar o grid de emoções
function renderEmotionsGrid() {
  const emotionsGrid = document.getElementById('emotionsGrid');
  
  emotions.forEach(emotion => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-3';
    
    const emotionCard = document.createElement('div');
    emotionCard.className = 'emotion-card card h-100';
    emotionCard.setAttribute('data-emotion-id', emotion.id);
    emotionCard.innerHTML = `
      <div class="card-body text-center">
        <div class="emotion-icon">${emotion.icon}</div>
        <h3 class="emotion-title">${emotion.title}</h3>
        <p class="emotion-description">${emotion.description}</p>
        <div class="emotion-triggers">
          <div class="triggers-title">Gatilhos comuns:</div>
          <ul class="triggers-list">
            ${emotion.triggers.map(trigger => `<li>${trigger}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
    
    emotionCard.addEventListener('click', () => selectEmotion(emotion));
    col.appendChild(emotionCard);
    emotionsGrid.appendChild(col);
  });
}

// Função para selecionar uma emoção
function selectEmotion(emotion) {
  selectedEmotion = emotion;
  
  // Remover a classe 'active' de todos os cards
  document.querySelectorAll('.emotion-card').forEach(card => {
    card.classList.remove('active');
  });
  
  // Adicionar a classe 'active' ao card selecionado
  const selectedCard = document.querySelector(`[data-emotion-id="${emotion.id}"]`);
  if (selectedCard) {
    selectedCard.classList.add('active');
  }
  
  // Atualizar a seção de sugestões
  updateSuggestions(emotion);
  
  // Salvar a seleção no localStorage
  localStorage.setItem('selectedEmotion', emotion.id);
}

// Função para atualizar as sugestões
function updateSuggestions(emotion) {
  const suggestionsContainer = document.getElementById('suggestionsContainer');
  const selectedEmotionIcon = document.getElementById('selectedEmotionIcon');
  const selectedEmotionTitle = document.getElementById('selectedEmotionTitle');
  const selectedEmotionDescription = document.getElementById('selectedEmotionDescription');
  const suggestionsGrid = document.getElementById('suggestionsGrid');
  
  // Atualizar o cabeçalho
  selectedEmotionIcon.textContent = emotion.icon;
  selectedEmotionTitle.textContent = emotion.title;
  selectedEmotionDescription.textContent = `Sugestões de atividades para quando você está se sentindo ${emotion.title.toLowerCase()}`;
  
  // Limpar e preencher o grid de sugestões
  suggestionsGrid.innerHTML = '';
  
  emotion.suggestions.forEach(suggestion => {
    const col = document.createElement('div');
    col.className = 'col-md-6';
    
    const suggestionCard = document.createElement('div');
    suggestionCard.className = 'suggestion-card';
    suggestionCard.innerHTML = `
      <div class="suggestion-icon">${suggestion.icon}</div>
      <h4 class="suggestion-title">${suggestion.title}</h4>
      <p class="suggestion-description">${suggestion.description}</p>
    `;
    col.appendChild(suggestionCard);
    suggestionsGrid.appendChild(col);
  });
  
  // Mostrar a seção de sugestões
  suggestionsContainer.classList.remove('d-none');
  
  // Rolar suavemente para a seção de sugestões
  suggestionsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Função para resetar a seleção
function resetSelection() {
  selectedEmotion = null;
  
  // Remover a classe 'active' de todos os cards
  document.querySelectorAll('.emotion-card').forEach(card => {
    card.classList.remove('active');
  });
  
  // Esconder a seção de sugestões
  const suggestionsContainer = document.getElementById('suggestionsContainer');
  suggestionsContainer.classList.add('d-none');
  
  // Remover a seleção do localStorage
  localStorage.removeItem('selectedEmotion');
  
  // Rolar para o topo
  document.getElementById('emotions-screen').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Função para coletar dados do formulário
function getFormData() {
  // Coletar redes sociais
  const socialNetworks = [];
  if (document.getElementById('social-instagram').checked) socialNetworks.push('Instagram');
  if (document.getElementById('social-tiktok').checked) socialNetworks.push('TikTok');
  if (document.getElementById('social-twitter').checked) socialNetworks.push('Twitter');
  if (document.getElementById('social-facebook').checked) socialNetworks.push('Facebook');
  if (document.getElementById('social-youtube').checked) socialNetworks.push('YouTube');
  if (document.getElementById('social-whatsapp').checked) socialNetworks.push('WhatsApp');
  
  // Coletar gatilhos emocionais
  const emotionalTriggers = [];
  if (document.getElementById('trigger-comparison').checked) emotionalTriggers.push('Comparação com outras pessoas');
  if (document.getElementById('trigger-procrastination').checked) emotionalTriggers.push('Procrastinação');
  if (document.getElementById('trigger-fomo').checked) emotionalTriggers.push('Medo de estar perdendo algo (FOMO)');
  if (document.getElementById('trigger-boredom').checked) emotionalTriggers.push('Tédio');
  if (document.getElementById('trigger-loneliness').checked) emotionalTriggers.push('Solidão');
  if (document.getElementById('trigger-stress').checked) emotionalTriggers.push('Estresse/Ansiedade');
  
  // Coletar interesses
  const interests = [];
  if (document.getElementById('interest-art').checked) interests.push('Arte e Pintura');
  if (document.getElementById('interest-reading').checked) interests.push('Leitura');
  if (document.getElementById('interest-cooking').checked) interests.push('Culinária');
  if (document.getElementById('interest-yoga').checked) interests.push('Yoga/Meditação');
  if (document.getElementById('interest-music').checked) interests.push('Música');
  if (document.getElementById('interest-sports').checked) interests.push('Esportes');
  if (document.getElementById('interest-gaming').checked) interests.push('Jogos');
  if (document.getElementById('interest-nature').checked) interests.push('Natureza');
  
  // Coletar objetivos pessoais
  const personalGoals = document.getElementById('personal-goals').value.split('\n').filter(goal => goal.trim() !== '');
  
  // Criar estrutura de dados
  const formData = {
    "usuario": {
      "id": "USR-" + Date.now(),
      "nome": document.getElementById('user-name').value,
      "idade": parseInt(document.getElementById('user-age').value),
      "profissao": document.getElementById('user-profession').value,
      "cidade": document.getElementById('user-city').value,
      "objetivo_principal": document.getElementById('main-goal').value,
      "tempo_diario_redes_sociais": document.getElementById('social-time').value,
      "redes_sociais_mais_utilizadas": socialNetworks
    },
    "mapa_emoções": {
      "emocao_primaria": document.getElementById('primary-emotion').value,
      "emocao_secundaria": document.getElementById('secondary-emotion').value,
      "gatilhos_emocionais": emotionalTriggers,
      "intensidade_emocional": {
        "ansiedade": parseInt(document.getElementById('anxiety-slider').value),
        "motivacao": parseInt(document.getElementById('motivation-slider').value),
        "realizacao": parseInt(document.getElementById('achievement-slider').value),
        "foco": parseInt(document.getElementById('focus-slider').value)
      }
    },
    "preferencias_offline": {
      "interesses": interests,
      "objetivos_pessoais": personalGoals
    },
    "configuracoes": {
      "limite_diario_redes": parseInt(document.getElementById('daily-limit').value),
      "alertas_emocionais": document.getElementById('emotional-alerts').value === 'true',
      "sincronizar_calendario": document.getElementById('calendar-sync').value === 'true',
      "modo_foco_ativado": document.getElementById('focus-mode').value === 'true'
    }
  };
  
  // Salvar dados no localStorage
  localStorage.setItem('emotionMapData', JSON.stringify(formData));
  
  return formData;
}

// Função para carregar dados salvos
function loadSavedData() {
  const savedData = localStorage.getItem('emotionMapData');
  if (savedData) {
    const data = JSON.parse(savedData);
    
    // Preencher campos do formulário com dados salvos
    document.getElementById('user-name').value = data.usuario.nome || '';
    document.getElementById('user-age').value = data.usuario.idade || '';
    document.getElementById('user-profession').value = data.usuario.profissao || '';
    document.getElementById('user-city').value = data.usuario.cidade || '';
    document.getElementById('main-goal').value = data.usuario.objetivo_principal || '';
    document.getElementById('social-time').value = data.usuario.tempo_diario_redes_sociais || '3-5 horas';
    
    // Redes sociais
    const socialNetworks = data.usuario.redes_sociais_mais_utilizadas || [];
    document.getElementById('social-instagram').checked = socialNetworks.includes('Instagram');
    document.getElementById('social-tiktok').checked = socialNetworks.includes('TikTok');
    document.getElementById('social-twitter').checked = socialNetworks.includes('Twitter');
    document.getElementById('social-facebook').checked = socialNetworks.includes('Facebook');
    document.getElementById('social-youtube').checked = socialNetworks.includes('YouTube');
    document.getElementById('social-whatsapp').checked = socialNetworks.includes('WhatsApp');
    
    // Emoções
    document.getElementById('primary-emotion').value = data.mapa_emoções.emocao_primaria || 'Ansiedade';
    document.getElementById('secondary-emotion').value = data.mapa_emoções.emocao_secundaria || 'Frustração';
    
    // Gatilhos emocionais
    const triggers = data.mapa_emoções.gatilhos_emocionais || [];
    document.getElementById('trigger-comparison').checked = triggers.includes('Comparação com outras pessoas');
    document.getElementById('trigger-procrastination').checked = triggers.includes('Procrastinação');
    document.getElementById('trigger-fomo').checked = triggers.includes('Medo de estar perdendo algo (FOMO)');
    document.getElementById('trigger-boredom').checked = triggers.includes('Tédio');
    document.getElementById('trigger-loneliness').checked = triggers.includes('Solidão');
    document.getElementById('trigger-stress').checked = triggers.includes('Estresse/Ansiedade');
    
    // Intensidade emocional
    const intensity = data.mapa_emoções.intensidade_emocional || {};
    document.getElementById('anxiety-slider').value = intensity.ansiedade || 8;
    document.getElementById('motivation-slider').value = intensity.motivacao || 6;
    document.getElementById('achievement-slider').value = intensity.realizacao || 4;
    document.getElementById('focus-slider').value = intensity.foco || 5;
    
    // Atualizar valores dos sliders
    document.getElementById('anxiety-value').textContent = intensity.ansiedade || 8;
    document.getElementById('motivation-value').textContent = intensity.motivacao || 6;
    document.getElementById('achievement-value').textContent = intensity.realizacao || 4;
    document.getElementById('focus-value').textContent = intensity.foco || 5;
    
    // Interesses
    const interests = data.preferencias_offline.interesses || [];
    document.getElementById('interest-art').checked = interests.includes('Arte e Pintura');
    document.getElementById('interest-reading').checked = interests.includes('Leitura');
    document.getElementById('interest-cooking').checked = interests.includes('Culinária');
    document.getElementById('interest-yoga').checked = interests.includes('Yoga/Meditação');
    document.getElementById('interest-music').checked = interests.includes('Música');
    document.getElementById('interest-sports').checked = interests.includes('Esportes');
    document.getElementById('interest-gaming').checked = interests.includes('Jogos');
    document.getElementById('interest-nature').checked = interests.includes('Natureza');
    
    // Objetivos pessoais
    const personalGoals = data.preferencias_offline.objetivos_pessoais || [];
    document.getElementById('personal-goals').value = personalGoals.join('\n');
    
    // Configurações
    const settings = data.configuracoes || {};
    document.getElementById('daily-limit').value = settings.limite_diario_redes || 120;
    document.getElementById('focus-mode').value = settings.modo_foco_ativado ? 'true' : 'false';
    document.getElementById('emotional-alerts').value = settings.alertas_emocionais ? 'true' : 'false';
    document.getElementById('calendar-sync').value = settings.sincronizar_calendario ? 'true' : 'false';
  }
}

// Função para navegar entre páginas (simulação)
function navigateToPage(page) {
  // Esta função seria implementada no contexto do site completo
  // Por enquanto, apenas redireciona para a página inicial
  if (page === 'home') {
    window.location.href = 'index.html'; // Ajuste conforme necessário
  }
}