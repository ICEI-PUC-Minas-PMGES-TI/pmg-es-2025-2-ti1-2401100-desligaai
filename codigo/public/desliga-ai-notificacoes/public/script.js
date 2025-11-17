// Dados das notificações
let notificationData = {
    sistema_notificacoes: {
        configuracoes: {
            frequencia_notificacoes: "3h",
            horario_ativo: "08:00-22:00",
            dias_ativos: ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"],
            integracao_mapa_emocoes: true,
            usar_emocao_real: true,
            personalizar_sugestoes: true,
            versao: "2.1.0"
        },
        notificacoes_genericas: [
            {
                id: "NOT-GEN-001",
                tipo: "boas_vindas",
                titulo: "👋 Complete seu perfil!",
                mensagem: "Personalize sua experiência para receber sugestões de atividades offline baseadas nos seus interesses.",
                acao_sugerida: {
                    texto: "Clique aqui para",
                    atividade: "criar seu perfil personalizado"
                },
                prioridade: "alta"
            },
            {
                id: "NOT-GEN-002",
                tipo: "beneficios",
                titulo: "📱 Reduza seu tempo de tela",
                mensagem: "A cada hora offline, você ganha mais foco, criatividade e bem-estar.",
                acao_sugerida: {
                    texto: "Experimente",
                    atividade: "ficar 15 minutos sem celular agora"
                },
                prioridade: "media"
            },
            {
                id: "NOT-GEN-003",
                tipo: "primeiros_passos",
                titulo: "🚀 Comece sua jornada",
                mensagem: "Registre seu primeiro tempo offline e veja seu progresso crescer.",
                acao_sugerida: {
                    texto: "Registre",
                    atividade: "seu primeiro período de desconexão"
                },
                prioridade: "media"
            }
        ],
        sugestoes_genericas: [
            {
                categoria: "Criatividade",
                icone: "🎨",
                descricao: "Atividades para expressar sua criatividade",
                atividades: [
                    "Desenhar ou rabiscar em um caderno",
                    "Escrever um pequeno poema ou texto criativo",
                    "Fotografar algo interessante ao seu redor",
                    "Pintar uma paisagem ou retrato",
                    "Criar colagens com revistas antigas",
                    "Escrever uma carta à mão para alguém"
                ]
            },
            {
                categoria: "Movimento",
                icone: "🏃‍♂️",
                descricao: "Atividades para mover o corpo e renovar as energias",
                atividades: [
                    "Fazer 5 minutos de alongamento",
                    "Caminhar pelo quarteirão observando detalhes",
                    "Dançar por uma música inteira",
                    "Fazer 10 minutos de yoga",
                    "Subir e descer escadas por 5 minutos",
                    "Fazer exercícios de respiração profunda"
                ]
            },
            {
                categoria: "Mindfulness",
                icone: "🧘‍♂️",
                descricao: "Atividades para acalmar a mente e conectar-se com o presente",
                atividades: [
                    "Respirar profundamente por 2 minutos",
                    "Observar as nuvens ou o céu por 5 minutos",
                    "Fechar os olhos e identificar 5 sons diferentes",
                    "Praticar meditação guiada por 10 minutos",
                    "Fazer um scan corporal para relaxar",
                    "Escrever 3 coisas pelas quais é grato"
                ]
            },
            {
                categoria: "Aprendizado",
                icone: "📚",
                descricao: "Atividades para expandir conhecimentos e habilidades",
                atividades: [
                    "Ler um capítulo de um livro físico",
                    "Aprender uma palavra nova em outro idioma",
                    "Fazer um quebra-cabeça ou sudoku",
                    "Estudar um mapa da sua cidade",
                    "Aprender a tocar uma música simples",
                    "Pesquisar sobre um tema histórico interessante"
                ]
            }
        ],
        emocional_support: {
            happy: {
                icon: "😊",
                title: "Que bom ver você feliz!",
                messages: [
                    "Que tal aproveitar essa energia positiva para fazer algo criativo offline?",
                    "Sua felicidade é contagiante! Compartilhe esse momento com alguém pessoalmente.",
                    "Aproveite esse estado de espírito para planejar algo especial sem telas.",
                    "Use essa alegria para começar aquele projeto que estava adiando!",
                    "Que tal registrar esse momento feliz em um diário ou desenho?"
                ],
                categories: ["Criatividade", "Social", "Natureza"],
                benefits: ["Aumenta criatividade", "Melhora humor", "Fortalecimento social"]
            },
            anxious: {
                icon: "😰",
                title: "Respire fundo...",
                messages: [
                    "Que tal uma pausa para alongar ou ouvir uma música calma?",
                    "Desconectar um pouco pode ajudar a acalmar a mente ansiosa.",
                    "Tente focar em uma atividade manual para acalmar os pensamentos.",
                    "Exercícios de respiração podem ajudar a reduzir a ansiedade.",
                    "Uma caminhada curta pode trazer nova perspectiva."
                ],
                categories: ["Mindfulness", "Movimento", "Natureza"],
                benefits: ["Reduz ansiedade", "Acalma a mente", "Melhora respiração"]
            },
            stressed: {
                icon: "😫",
                title: "Hora de dar uma pausa",
                messages: [
                    "Uma caminhada rápida ou um chá podem ajudar a acalmar.",
                    "Desconectar das telas pode reduzir significativamente o estresse.",
                    "Tente uma atividade relaxante como desenhar ou meditar.",
                    "Alongamentos simples podem aliviar a tensão muscular.",
                    "Ouça música instrumental para acalmar a mente."
                ],
                categories: ["Mindfulness", "Movimento", "Criatividade"],
                benefits: ["Reduz estresse", "Alivia tensão", "Promove relaxamento"]
            },
            bored: {
                icon: "😐",
                title: "O tédio pode ser criativo!",
                messages: [
                    "Que tal ler um livro ou aprender algo novo offline?",
                    "Explore um hobby que você adorava antes das redes sociais.",
                    "Desafie-se com um projeto manual ou criativo.",
                    "Organize um espaço da sua casa para renovar as energias.",
                    "Experimente uma receita nova na cozinha."
                ],
                categories: ["Aprendizado", "Criatividade", "Movimento"],
                benefits: ["Estimula criatividade", "Combate tédio", "Promove aprendizado"]
            },
            sad: {
                icon: "😢",
                title: "Sua saúde mental é importante",
                messages: [
                    "Que tal conversar com um amigo ou fazer uma atividade que você goste?",
                    "Às vezes, desconectar das telas e conectar com a natureza ajuda.",
                    "Tente escrever sobre seus sentimentos em um diário físico.",
                    "Ouça músicas que tragam conforto e boas lembranças.",
                    "Um banho relaxante pode ajudar a renovar as energias."
                ],
                categories: ["Social", "Criatividade", "Natureza"],
                benefits: ["Eleva humor", "Conforto emocional", "Conexão social"]
            },
            angry: {
                icon: "😠",
                title: "Vamos acalmar?",
                messages: [
                    "Tente respirar profundamente ou fazer uma atividade física para liberar a energia.",
                    "Desconectar pode ajudar a ganhar perspectiva sobre a situação.",
                    "Que tal canalizar essa energia em algo criativo ou produtivo?",
                    "Escreva sobre o que está sentindo para processar as emoções.",
                    "Atividades manuais podem ajudar a focar a mente."
                ],
                categories: ["Movimento", "Criatividade", "Mindfulness"],
                benefits: ["Libera energia", "Reduz irritação", "Promove clareza"]
            },
            tired: {
                icon: "😴",
                title: "Descanse um pouco",
                messages: [
                    "Um cochilo ou meditação podem recarregar suas energias.",
                    "Desconectar das telas antes de dormir melhora a qualidade do sono.",
                    "Que tal relaxar com um livro em vez de rolar a tela?",
                    "Uma xícara de chá calmante pode ajudar no relaxamento.",
                    "Alongamentos suaves podem revigorar o corpo cansado."
                ],
                categories: ["Mindfulness", "Natureza", "Criatividade"],
                benefits: ["Recarrega energias", "Melhora sono", "Promove relaxamento"]
            },
            motivated: {
                icon: "💪",
                title: "Você está motivado!",
                messages: [
                    "Aproveite para colocar em prática aquela ideia ou projeto offline.",
                    "Use essa energia para começar um novo hobby ou aprender uma habilidade.",
                    "Que tal transformar essa motivação em ação concreta sem distrações digitais?",
                    "Estabeleça metas claras para aproveitar esse momento produtivo.",
                    "Compartilhe sua energia com alguém que precise de incentivo."
                ],
                categories: ["Aprendizado", "Criatividade", "Movimento"],
                benefits: ["Aproveita motivação", "Aumenta produtividade", "Promove crescimento"]
            }
        }
    }
};

// Variáveis globais
let screenTime = 0;
let currentEmotion = 'happy';
let notificationInterval;
let lastEmotionMapData = null;
let selectedEmotion = null;

// ========== FUNÇÕES DE INTEGRAÇÃO COM MAPA DE EMOÇÕES ==========

// Verificar e carregar dados do Mapa de Emoções
function checkAndLoadEmotionMapData() {
    const emotionMapData = localStorage.getItem('emotionMapData');
    
    if (emotionMapData) {
        try {
            const profile = JSON.parse(emotionMapData);
            console.log('Perfil do Mapa de Emoções encontrado:', profile);
            
            // Sincronizar com nosso sistema
            storageManager.salvarPerfilUsuario(profile);
            
            // Atualizar interface
            updateUIWithEmotionMapData(profile);
            
            return profile;
        } catch (error) {
            console.error('Erro ao carregar dados do Mapa de Emoções:', error);
        }
    }
    
    return null;
}

// Atualizar UI com dados do Mapa de Emoções
function updateUIWithEmotionMapData(profile) {
    if (!profile) return;
    
    // Atualizar badge do usuário
    const userBadge = document.getElementById('userBadge');
    const userName = document.getElementById('userName');
    
    if (userBadge && userName && profile.usuario) {
        userBadge.classList.remove('d-none');
        userName.textContent = profile.usuario.nome || 'Usuário';
    }
    
    // Atualizar pontos
    const pointsDisplay = document.getElementById('pointsDisplay');
    const pointsValue = document.getElementById('pointsValue');
    if (pointsDisplay && pointsValue) {
        pointsDisplay.classList.remove('d-none');
        // Em produção, buscaríamos pontos reais
        pointsValue.textContent = '125';
    }
    
    // Atualizar emoção atual
    if (profile.mapa_emoções) {
        const emotion = profile.mapa_emoções.emocao_primaria;
        const emotionIcon = getEmotionIcon(emotion);
        const emotionText = getEmotionDisplayText(emotion);
        
        // Atualizar banner de boas-vindas
        updateWelcomeBanner(profile.usuario.nome, emotionIcon, emotionText);
        
        // Atualizar emoção atual para notificações
        currentEmotion = mapEmotionToKey(emotion);
    }
    
    // Esconder prompt de setup
    document.getElementById('setupPrompt').style.display = 'none';
    
    // Mostrar banner de boas-vindas
    document.getElementById('welcomeBanner').classList.remove('d-none');
    
    // Atualizar badge de personalização
    document.getElementById('personalizationBadge').classList.remove('d-none');
    
    // Atualizar subtítulos
    document.getElementById('notificationSubtitle').textContent = 
        'Notificações personalizadas baseadas no seu estado emocional atual';
    document.getElementById('suggestionsSubtitle').textContent = 
        'Atividades selecionadas especialmente para seus interesses';
}

// Mapear emoções em português para chaves em inglês
function mapEmotionToKey(emotion) {
    const emotionMap = {
        'feliz': 'happy',
        'alegre': 'happy',
        'contente': 'happy',
        'ansioso': 'anxious',
        'ansiedade': 'anxious',
        'nervoso': 'anxious',
        'estressado': 'stressed',
        'estresse': 'stressed',
        'tenso': 'stressed',
        'entediado': 'bored',
        'tédio': 'bored',
        'triste': 'sad',
        'tristeza': 'sad',
        'deprimido': 'sad',
        'raiva': 'angry',
        'irritado': 'angry',
        'nervoso': 'angry',
        'cansado': 'tired',
        'fadiga': 'tired',
        'exausto': 'tired',
        'motivado': 'motivated',
        'empolgado': 'motivated',
        'animado': 'motivated'
    };
    
    return emotionMap[emotion.toLowerCase()] || 'happy';
}

// Obter ícone para emoção
function getEmotionIcon(emotion) {
    const emotionIcons = {
        'feliz': '😊',
        'alegre': '😄',
        'contente': '🙂',
        'ansioso': '😰',
        'ansiedade': '😥',
        'nervoso': '😟',
        'estressado': '😫',
        'estresse': '😤',
        'tenso': '😬',
        'entediado': '😐',
        'tédio': '🫤',
        'triste': '😢',
        'tristeza': '😔',
        'deprimido': '😞',
        'raiva': '😠',
        'irritado': '😡',
        'nervoso': '🤬',
        'cansado': '😴',
        'fadiga': '🥱',
        'exausto': '😪',
        'motivado': '💪',
        'empolgado': '🚀',
        'animado': '🎉'
    };
    
    return emotionIcons[emotion.toLowerCase()] || '😊';
}

// Obter texto de exibição para emoção
function getEmotionDisplayText(emotion) {
    const displayTexts = {
        'feliz': 'Feliz',
        'alegre': 'Alegre',
        'contente': 'Contente',
        'ansioso': 'Ansioso',
        'ansiedade': 'Ansiedade',
        'nervoso': 'Nervoso',
        'estressado': 'Estressado',
        'estresse': 'Estresse',
        'tenso': 'Tenso',
        'entediado': 'Entediado',
        'tédio': 'Tédio',
        'triste': 'Triste',
        'tristeza': 'Tristeza',
        'deprimido': 'Deprimido',
        'raiva': 'Raiva',
        'irritado': 'Irritado',
        'nervoso': 'Nervoso',
        'cansado': 'Cansado',
        'fadiga': 'Fadiga',
        'exausto': 'Exausto',
        'motivado': 'Motivado',
        'empolgado': 'Empolgado',
        'animado': 'Animado'
    };
    
    return displayTexts[emotion.toLowerCase()] || 'Feliz';
}

// Atualizar banner de boas-vindas
function updateWelcomeBanner(userName, emotionIcon, emotionText) {
    const welcomeTitle = document.getElementById('welcomeTitle');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const welcomeEmotionIcon = document.getElementById('welcomeEmotionIcon');
    const welcomeEmotionText = document.getElementById('welcomeEmotionText');
    
    if (welcomeTitle) {
        welcomeTitle.textContent = `Olá, ${userName}!`;
    }
    
    if (welcomeMessage) {
        welcomeMessage.textContent = `Você está se sentindo ${emotionText.toLowerCase()} hoje. Vamos encontrar atividades que combinam com seu estado!`;
    }
    
    if (welcomeEmotionIcon) {
        welcomeEmotionIcon.textContent = emotionIcon;
    }
    
    if (welcomeEmotionText) {
        welcomeEmotionText.textContent = emotionText;
    }
}

// Monitorar mudanças no localStorage do Mapa de Emoções
function setupEmotionMapListener() {
    window.addEventListener('storage', function(e) {
        if (e.key === 'emotionMapData') {
            console.log('Dados do Mapa de Emoções atualizados!');
            checkAndLoadEmotionMapData();
            renderPersonalizedSuggestions();
            updateUserMetrics();
        }
    });
    
    // Também verificar periodicamente (para mesma aba)
    setInterval(() => {
        const currentData = localStorage.getItem('emotionMapData');
        if (currentData !== lastEmotionMapData) {
            lastEmotionMapData = currentData;
            checkAndLoadEmotionMapData();
        }
    }, 1000);
}

// ========== INICIALIZAÇÃO DO SISTEMA ==========

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        document.querySelector('.main-content').style.display = 'block';
        initNotifications();
    }, 2000);
});

// Inicializar notificações
function initNotifications() {
    // Verificar dados do Mapa de Emoções primeiro
    checkAndLoadEmotionMapData();
    
    // Configurar listener para mudanças
    setupEmotionMapListener();
    
    renderNotifications();
    renderPersonalizedSuggestions();
    setupThemeToggle();
    checkUserProfileStatus();
    updateUserMetrics();
    setupEventListeners();
    setupQuickActionsMain();
    
    // Iniciar monitoramento de tempo de tela
    startScreenTimeMonitoring();
    
    // Inicializar tooltips do Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Botão de criar perfil
    const createProfileBtn = document.getElementById('createProfileBtn');
    if (createProfileBtn) {
        createProfileBtn.addEventListener('click', redirectToEmotionMap);
    }
    
    // Ações rápidas
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('quick-action')) {
            const action = e.target.getAttribute('data-action');
            handleQuickAction(action);
        }
    });
    
    // Botões do pop-up motivacional
    document.getElementById('suggestActivityBtn').addEventListener('click', suggestActivity);
    document.getElementById('dismissPopupBtn').addEventListener('click', dismissPopup);
    document.getElementById('popupClose').addEventListener('click', dismissPopup);
    
    // Botões do pop-up de sucesso
    document.getElementById('successDismissBtn').addEventListener('click', dismissSuccessPopup);
    document.getElementById('successClose').addEventListener('click', dismissSuccessPopup);
    
    // Botões do pop-up de atividade aleatória
    document.getElementById('randomActivityClose').addEventListener('click', dismissRandomActivityPopup);
    document.getElementById('randomActivitySkipBtn').addEventListener('click', showRandomActivityPopup);
    document.getElementById('randomActivityAcceptBtn').addEventListener('click', acceptRandomActivity);
    
    // Toggle de tema
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Botão de editar perfil
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', redirectToEmotionMap);
    }
    
    // Seleção de emoção
    const emotionOptions = document.querySelectorAll('.emotion-option');
    emotionOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remover seleção anterior
            emotionOptions.forEach(opt => opt.classList.remove('selected'));
            // Selecionar nova opção
            this.classList.add('selected');
            selectedEmotion = this.getAttribute('data-emotion');
        });
    });
    
    // Confirmar emoção
    document.getElementById('confirmEmotionBtn').addEventListener('click', confirmEmotionSelection);
}

// ========== FUNÇÕES DE AÇÕES RÁPIDAS PRINCIPAIS ==========

// Configurar ações rápidas principais
function setupQuickActionsMain() {
    const container = document.getElementById('quickActionsMain');
    if (!container) return;
    
    const userProfile = storageManager.carregarPerfilUsuario();
    
    const mainActions = userProfile ? [
        { text: "🎯 Sugerir Atividade", action: "suggestRandomActivity", icon: "bi-lightbulb" },
        { text: "⏱️ Registrar Tempo Offline", action: "registerQuickTime", icon: "bi-clock" },
        { text: "😊 Como estou me sentindo?", action: "selectEmotion", icon: "bi-emoji-smile" },
        { text: "📊 Ver Progresso", action: "viewProgress", icon: "bi-graph-up" }
    ] : [
        { text: "👤 Criar Perfil", action: "createProfile", icon: "bi-person-plus" },
        { text: "🎯 Sugerir Atividade", action: "suggestRandomActivity", icon: "bi-lightbulb" },
        { text: "⏱️ Registrar 15min", action: "registerQuickTime", icon: "bi-clock" },
        { text: "😊 Como estou me sentindo?", action: "selectEmotion", icon: "bi-emoji-smile" }
    ];
    
    container.innerHTML = '';
    
    mainActions.forEach((action, index) => {
        const actionEl = document.createElement('button');
        actionEl.className = 'quick-action animate__animated animate__fadeIn';
        actionEl.style.animationDelay = `${index * 0.1}s`;
        actionEl.innerHTML = `<i class="bi ${action.icon} me-2"></i><span>${action.text}</span>`;
        actionEl.setAttribute('data-action', action.action);
        container.appendChild(actionEl);
    });
}

// ========== FUNÇÕES DE NOTIFICAÇÕES ==========

// Renderizar notificações
function renderNotifications() {
    const container = document.getElementById('notificationsContainer');
    if (!container) return;
    
    const notifications = notificationData.sistema_notificacoes.notificacoes_genericas;
    
    container.innerHTML = '';
    
    notifications.forEach(notification => {
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification-card p-4 mb-3 animate__animated animate__fadeIn ${notification.prioridade === 'alta' ? 'high-priority' : ''}`;
        
        notificationEl.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-3">
                <h5 class="mb-0 fw-bold">${notification.titulo}</h5>
                <span class="badge ${notification.prioridade === 'alta' ? 'bg-warning' : 'bg-secondary'} rounded-pill">${notification.prioridade}</span>
            </div>
            <p class="mb-3">${notification.mensagem}</p>
            ${notification.acao_sugerida ? `
                <div class="suggestion-action p-3 bg-light rounded">
                    <p class="mb-0"><strong>${notification.acao_sugerida.texto}</strong> ${notification.acao_sugerida.atividade}</p>
                </div>
            ` : ''}
        `;
        
        container.appendChild(notificationEl);
    });
}

// ========== FUNÇÕES DE SUGESTÕES ==========

// Renderizar sugestões personalizadas
function renderPersonalizedSuggestions() {
    const container = document.getElementById('suggestionsContainer');
    const quickActionsContainer = document.getElementById('quickActionsContainer');
    
    if (!container || !quickActionsContainer) return;
    
    const userProfile = storageManager.carregarPerfilUsuario();
    const suggestions = getPersonalizedSuggestions();
    
    // Renderizar sugestões personalizadas
    container.innerHTML = '';
    
    if (suggestions.length === 0) {
        // Fallback para sugestões genéricas se não há personalização
        suggestions.push(...notificationData.sistema_notificacoes.sugestoes_genericas);
    }
    
    suggestions.forEach((category, index) => {
        category.atividades.forEach(activity => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4 mb-3';
            
            const suggestionEl = document.createElement('div');
            
            // Verificar se é personalizado
            const isPersonalized = userProfile && getUserInterests().length > 0;
            suggestionEl.className = `suggestion-card ${isPersonalized ? 'personalized' : ''} animate__animated animate__fadeInUp`;
            suggestionEl.style.animationDelay = `${index * 0.1}s`;
            
            suggestionEl.innerHTML = `
                <div class="suggestion-icon">${category.icone}</div>
                <h6 class="fw-bold mb-2">${category.categoria}</h6>
                <p class="mb-2">${activity}</p>
                ${isPersonalized ? 
                    '<div class="personalized-badge"><span class="badge bg-success rounded-pill">✨ Para você</span></div>' : 
                    ''
                }
            `;
            
            suggestionEl.addEventListener('click', () => {
                registerActivity(activity, category.categoria);
            });
            
            col.appendChild(suggestionEl);
            container.appendChild(col);
        });
    });
    
    // Atualizar ações rápidas baseadas no perfil
    updateQuickActions(quickActionsContainer);
}

// Obter sugestões personalizadas
function getPersonalizedSuggestions() {
    const userInterests = getUserInterests();
    const allSuggestions = notificationData.sistema_notificacoes.sugestoes_genericas;
    
    if (userInterests.length === 0) {
        return allSuggestions; // Retorna todas se não há interesses
    }
    
    // Mapear interesses para categorias
    const interestToCategory = {
        'Arte e Pintura': 'Criatividade',
        'Leitura': 'Aprendizado',
        'Culinária': 'Criatividade',
        'Yoga/Meditação': 'Mindfulness',
        'Música': 'Criatividade',
        'Esportes': 'Movimento',
        'Jogos': 'Aprendizado',
        'Natureza': 'Mindfulness'
    };
    
    // Filtrar categorias que correspondem aos interesses do usuário
    return allSuggestions.filter(category => {
        // Verificar se alguma categoria corresponde diretamente
        const directMatch = userInterests.some(interest => 
            category.categoria.toLowerCase().includes(interest.toLowerCase()) || 
            interest.toLowerCase().includes(category.categoria.toLowerCase())
        );
        
        // Verificar mapeamento de interesses para categorias
        const mappedMatch = userInterests.some(interest => 
            interestToCategory[interest] === category.categoria
        );
        
        return directMatch || mappedMatch;
    });
}

// Obter interesses do usuário
function getUserInterests() {
    const userProfile = storageManager.carregarPerfilUsuario();
    
    if (userProfile && userProfile.preferencias_offline) {
        return userProfile.preferencias_offline.interesses || [];
    }
    
    return [];
}

// Atualizar ações rápidas
function updateQuickActions(container) {
    const userProfile = storageManager.carregarPerfilUsuario();
    
    container.innerHTML = '';
    
    if (userProfile) {
        // Ações personalizadas para usuários com perfil
        const personalizedActions = [
            { text: "Atualizar Perfil", action: "updateProfile", icon: "👤" },
            { text: `Meta: ${userProfile.configuracoes?.limite_diario_redes || 120}min`, action: "adjustGoal", icon: "🎯" },
            { text: "Ver Progresso", action: "viewProgress", icon: "📊" },
            { text: "Nova Atividade", action: "newActivity", icon: "💡" }
        ];
        
        personalizedActions.forEach((action, index) => {
            const actionEl = document.createElement('button');
            actionEl.className = 'quick-action animate__animated animate__fadeIn';
            actionEl.style.animationDelay = `${index * 0.1}s`;
            actionEl.innerHTML = `<span>${action.icon}</span><span>${action.text}</span>`;
            actionEl.setAttribute('data-action', action.action);
            container.appendChild(actionEl);
        });
    } else {
        // Ações padrão para usuários sem perfil
        const baseActions = [
            { text: "Criar Perfil", action: "createProfile", icon: "👤" },
            { text: "Registrar 15min offline", action: "registerTime", icon: "⏱️" },
            { text: "Explorar atividades", action: "exploreActivities", icon: "🔍" },
            { text: "Definir primeira meta", action: "setGoal", icon: "🎯" }
        ];
        
        baseActions.forEach((action, index) => {
            const actionEl = document.createElement('button');
            actionEl.className = 'quick-action animate__animated animate__fadeIn';
            actionEl.style.animationDelay = `${index * 0.1}s`;
            actionEl.innerHTML = `<span>${action.icon}</span><span>${action.text}</span>`;
            actionEl.setAttribute('data-action', action.action);
            container.appendChild(actionEl);
        });
    }
}

// ========== FUNÇÕES DE INTERAÇÃO ==========

// Função para lidar com ações rápidas
function handleQuickAction(action) {
    const userProfile = storageManager.carregarPerfilUsuario();
    
    switch(action) {
        case 'createProfile':
            redirectToEmotionMap();
            break;
        case 'registerTime':
            registerOfflineTime(15);
            break;
        case 'exploreActivities':
            exploreActivities();
            break;
        case 'setGoal':
            setFirstGoal();
            break;
        case 'updateProfile':
            redirectToEmotionMap();
            break;
        case 'adjustGoal':
            adjustDailyGoal();
            break;
        case 'viewProgress':
            viewProgress();
            break;
        case 'newActivity':
            suggestNewActivity();
            break;
        case 'suggestRandomActivity':
            showRandomActivityPopup();
            break;
        case 'registerQuickTime':
            registerOfflineTime(30);
            break;
        case 'selectEmotion':
            showEmotionSelector();
            break;
    }
}

// Registrar atividade
function registerActivity(activity, category) {
    console.log(`Atividade registrada: ${activity} (${category})`);
    
    // Calcular pontos
    const points = storageManager.calcularPontosAtividade(activity, 0);
    
    // Registrar no histórico
    const registro = storageManager.registrarAtividade(activity, category, 0, currentEmotion);
    
    // Mostrar pop-up de sucesso
    showSuccessPopup(activity, points);
    
    // Atualizar métricas
    updateUserMetrics();
    
    // Atualizar conquistas
    updateAchievements();
}

// Mostrar pop-up de sucesso
function showSuccessPopup(activity, points) {
    const successPopup = document.getElementById('successPopup');
    const successTitle = document.getElementById('successTitle');
    const successMessage = document.getElementById('successMessage');
    const pointsEarned = document.getElementById('pointsEarned');
    
    if (successTitle) {
        successTitle.textContent = 'Atividade Registrada!';
    }
    
    if (successMessage) {
        successMessage.textContent = `Parabéns! Você completou: "${activity}"`;
    }
    
    if (pointsEarned) {
        pointsEarned.textContent = `+${points}`;
    }
    
    successPopup.classList.add('active');
    
    // Adicionar animação de confetti
    createConfetti();
}

// Criar efeito de confetti
function createConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            top: -10px;
            left: ${Math.random() * 100}vw;
            border-radius: 50%;
            z-index: 1060;
            pointer-events: none;
        `;
        
        document.body.appendChild(confetti);
        
        // Animação
        const animation = confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight}px) rotate(${360 * Math.random()}deg)`, opacity: 0 }
        ], {
            duration: 1000 + Math.random() * 2000,
            easing: 'cubic-bezier(0.1, 0.2, 0.8, 0.9)'
        });
        
        animation.onfinish = () => {
            confetti.remove();
        };
    }
}

// Fechar pop-up de sucesso
function dismissSuccessPopup() {
    document.getElementById('successPopup').classList.remove('active');
}

// Registrar tempo offline
function registerOfflineTime(minutes) {
    const registro = storageManager.registrarTempoOffline(minutes);
    
    // Mostrar notificação
    showToast(`⏱️ ${minutes} minutos offline registrados! +${registro.pontos} pontos`);
    
    updateUserMetrics();
}

// Explorar atividades
function exploreActivities() {
    renderPersonalizedSuggestions();
    
    // Scroll para sugestões
    document.getElementById('suggestionsContainer').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    
    // Feedback visual
    const suggestionsTitle = document.querySelector('.section-title');
    const originalText = suggestionsTitle.textContent;
    suggestionsTitle.textContent = '✨ Explore estas atividades!';
    
    setTimeout(() => {
        suggestionsTitle.textContent = originalText;
    }, 2000);
}

// Definir primeira meta
function setFirstGoal() {
    const userProfile = storageManager.carregarPerfilUsuario();
    
    if (userProfile) {
        adjustDailyGoal();
    } else {
        const goal = prompt('Qual sua primeira meta de desconexão? (ex: "30 minutos por dia")');
        if (goal) {
            localStorage.setItem('userGoal', goal);
            showToast('🎯 Meta definida com sucesso!');
            updateUserMetrics();
        }
    }
}

// Ajustar meta diária
function adjustDailyGoal() {
    const userProfile = storageManager.carregarPerfilUsuario();
    const currentGoal = userProfile?.configuracoes?.limite_diario_redes || 
                       parseInt(localStorage.getItem('userGoal')) || 120;
    
    const newGoal = prompt(`Seu limite diário atual é ${currentGoal} minutos. Digite o novo limite:`, currentGoal);
    
    if (newGoal && !isNaN(newGoal)) {
        const goalNum = parseInt(newGoal);
        
        if (userProfile) {
            userProfile.configuracoes.limite_diario_redes = goalNum;
            localStorage.setItem('emotionMapData', JSON.stringify(userProfile));
        } else {
            localStorage.setItem('userGoal', goalNum.toString());
        }
        
        showToast('🎯 Meta atualizada com sucesso!');
        updateUserMetrics();
        renderPersonalizedSuggestions();
    }
}

// Ver progresso
function viewProgress() {
    const userProfile = storageManager.carregarPerfilUsuario();
    
    if (!userProfile) {
        showToast('Complete seu perfil para ver seu progresso detalhado!');
        return;
    }
    
    const emotion = userProfile.mapa_emoções.emocao_primaria;
    const intensity = userProfile.mapa_emoções.intensidade_emocional;
    const stats = storageManager.obterEstatisticas();
    
    const progressMessage = `
📊 Seu Progresso:

👤 Emoção principal: ${emotion}
💪 Motivação: ${intensity.motivacao || 5}/10
⭐ Realização: ${intensity.realizacao || 5}/10
🎯 Foco: ${intensity.foco || 5}/10

⏱️ Tempo offline total: ${Math.floor(stats.totalTempoOffline / 60)}h ${stats.totalTempoOffline % 60}m
✅ Atividades realizadas: ${stats.totalAtividades}
📅 Dias consecutivos: ${stats.metricas.diasConsecutivos}
🏆 Nível: ${stats.nivel}
    `.trim();
    
    alert(progressMessage);
}

// Sugerir nova atividade
function suggestNewActivity() {
    showMotivationalNotification();
}

// ========== FUNÇÕES DE POP-UP DE ATIVIDADE ALEATÓRIA ==========

// Mostrar seletor de emoção
function showEmotionSelector() {
    const modal = new bootstrap.Modal(document.getElementById('emotionSelectorModal'));
    modal.show();
}

// Confirmar seleção de emoção
function confirmEmotionSelection() {
    if (!selectedEmotion) {
        showToast('Por favor, selecione como você está se sentindo.');
        return;
    }
    
    currentEmotion = selectedEmotion;
    showRandomActivityPopup();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('emotionSelectorModal'));
    modal.hide();
    
    showToast(`Emoção definida como: ${getEmotionDisplayName(selectedEmotion)}`);
}

// Obter atividade aleatória baseada na emoção
function getRandomActivityByEmotion(emotion) {
    const emotionData = notificationData.sistema_notificacoes.emocional_support[emotion];
    const allSuggestions = notificationData.sistema_notificacoes.sugestoes_genericas;
    
    // Filtrar categorias preferidas para esta emoção
    const preferredCategories = emotionData.categories || ['Criatividade', 'Movimento', 'Mindfulness'];
    const filteredCategories = allSuggestions.filter(category => 
        preferredCategories.includes(category.categoria)
    );
    
    // Escolher uma categoria aleatória
    const randomCategory = filteredCategories[Math.floor(Math.random() * filteredCategories.length)];
    const randomActivity = randomCategory.atividades[Math.floor(Math.random() * randomCategory.atividades.length)];
    
    return {
        category: randomCategory.categoria,
        activity: randomActivity,
        icon: randomCategory.icone,
        benefits: emotionData.benefits || ['Melhora humor', 'Reduz estresse', 'Aumenta bem-estar']
    };
}

// Mostrar pop-up de atividade aleatória
function showRandomActivityPopup() {
    const emotion = currentEmotion;
    const randomActivity = getRandomActivityByEmotion(emotion);
    const emotionData = notificationData.sistema_notificacoes.emocional_support[emotion];
    
    // Atualizar o pop-up
    document.getElementById('randomActivityIcon').textContent = emotionData.icon;
    document.getElementById('randomActivityTitle').textContent = `Atividade para quando você está ${getEmotionDisplayName(emotion).toLowerCase()}`;
    document.getElementById('randomActivityMessage').textContent = emotionData.messages[Math.floor(Math.random() * emotionData.messages.length)];
    
    document.getElementById('randomActivityCategoryText').textContent = randomActivity.category;
    document.getElementById('randomActivitySuggestionIcon').textContent = randomActivity.icon;
    document.getElementById('randomActivityName').textContent = randomActivity.activity;
    document.getElementById('randomActivityDescription').textContent = `Esta atividade de ${randomActivity.category} pode ajudar a ${emotionData.benefits[0].toLowerCase()}.`;
    
    // Atualizar benefícios
    const benefits = randomActivity.benefits;
    document.getElementById('benefit1').textContent = `🧘‍♂️ ${benefits[0]}`;
    document.getElementById('benefit2').textContent = `🎯 ${benefits[1]}`;
    document.getElementById('benefit3').textContent = `😊 ${benefits[2]}`;
    
    // Mostrar o pop-up
    document.getElementById('randomActivityPopup').classList.add('active');
}

// Fechar pop-up de atividade aleatória
function dismissRandomActivityPopup() {
    document.getElementById('randomActivityPopup').classList.remove('active');
}

// Aceitar atividade aleatória
function acceptRandomActivity() {
    const activityName = document.getElementById('randomActivityName').textContent;
    const activityCategory = document.getElementById('randomActivityCategoryText').textContent;
    registerActivity(activityName, activityCategory);
    dismissRandomActivityPopup();
}

// ========== FUNÇÕES DE POP-UP MOTIVACIONAL ==========

// Iniciar monitoramento de tempo de tela
function startScreenTimeMonitoring() {
    screenTime = parseInt(localStorage.getItem('screenTime') || '0');
    
    notificationInterval = setInterval(() => {
        screenTime += 1;
        localStorage.setItem('screenTime', screenTime.toString());
        
        // Verificar se é hora de mostrar uma notificação (a cada 30 minutos simulados)
        if (screenTime % 30 === 0) {
            showMotivationalNotification();
        }
        
        updateUserMetrics();
    }, 60000); // 1 minuto em milissegundos
}

// Mostrar notificação motivacional
function showMotivationalNotification() {
    // Tentar obter emoção real do usuário
    const userEmotion = getCurrentUserEmotion();
    
    if (userEmotion) {
        currentEmotion = userEmotion;
    } else {
        // Fallback para emoção aleatória se não há perfil
        const emotions = Object.keys(notificationData.sistema_notificacoes.emocional_support);
        currentEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    }
    
    const emotionData = notificationData.sistema_notificacoes.emocional_support[currentEmotion];
    const randomMessage = emotionData.messages[Math.floor(Math.random() * emotionData.messages.length)];
    
    // Atualizar o pop-up
    document.getElementById('popupIcon').textContent = emotionData.icon;
    document.getElementById('popupTitle').textContent = emotionData.title;
    document.getElementById('popupMessage').textContent = randomMessage;
    document.getElementById('emotionIcon').textContent = emotionData.icon;
    document.getElementById('emotionText').textContent = `Estado emocional: ${getEmotionDisplayName(currentEmotion)}`;
    
    // Mostrar o pop-up
    document.getElementById('motivationalPopup').classList.add('active');
}

// Obter emoção atual do usuário
function getCurrentUserEmotion() {
    const userProfile = storageManager.carregarPerfilUsuario();
    
    if (userProfile && userProfile.mapa_emoções) {
        const primaryEmotion = userProfile.mapa_emoções.emocao_primaria.toLowerCase();
        return mapEmotionToKey(primaryEmotion);
    }
    
    return null;
}

// Obter nome de exibição da emoção
function getEmotionDisplayName(emotionKey) {
    const displayNames = {
        'happy': 'Feliz',
        'anxious': 'Ansioso',
        'stressed': 'Estressado',
        'bored': 'Entediado',
        'sad': 'Triste',
        'angry': 'Irritado',
        'tired': 'Cansado',
        'motivated': 'Motivado'
    };
    return displayNames[emotionKey] || emotionKey;
}

// Sugerir atividade baseada na emoção
function suggestActivity() {
    const emotionData = notificationData.sistema_notificacoes.emocional_support[currentEmotion];
    let personalizedSuggestions = getPersonalizedSuggestions();
    
    if (personalizedSuggestions.length === 0) {
        personalizedSuggestions = notificationData.sistema_notificacoes.sugestoes_genericas;
    }
    
    // Escolher uma categoria aleatória
    const randomCategory = personalizedSuggestions[Math.floor(Math.random() * personalizedSuggestions.length)];
    const randomActivity = randomCategory.atividades[Math.floor(Math.random() * randomCategory.atividades.length)];
    
    // Atualizar a mensagem do pop-up
    const userProfile = storageManager.carregarPerfilUsuario();
    const userName = userProfile ? userProfile.usuario.nome : '';
    const greeting = userName ? `, ${userName.split(' ')[0]}` : '';
    
    document.getElementById('popupMessage').textContent = 
        `Que tal${greeting}: "${randomActivity}"? Essa atividade da categoria ${randomCategory.categoria} pode ajudar a melhorar seu estado de ${getEmotionDisplayName(currentEmotion)}.`;
    
    // Registrar a atividade sugerida
    registerActivity(randomActivity, randomCategory.categoria);
}

// Fechar pop-up motivacional
function dismissPopup() {
    document.getElementById('motivationalPopup').classList.remove('active');
    screenTime = 0;
    localStorage.setItem('screenTime', '0');
}

// ========== FUNÇÕES DE TEMA E UI ==========

// Alternar tema claro/escuro
function toggleTheme() {
    document.body.classList.toggle('dark');
    const themeIcon = document.getElementById('themeIcon');
    
    if (document.body.classList.contains('dark')) {
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

// Configurar toggle de tema
function setupThemeToggle() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('#themeIcon');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        themeIcon.textContent = '☀️';
    }
}

// Verificar status do perfil
function checkUserProfileStatus() {
    const userProfile = storageManager.carregarPerfilUsuario();
    const setupPrompt = document.getElementById('setupPrompt');
    
    if (userProfile) {
        setupPrompt.style.display = 'none';
    } else {
        setupPrompt.style.display = 'block';
    }
}

// ========== FUNÇÕES DE MÉTRICAS ==========

// Atualizar métricas do usuário
function updateUserMetrics() {
    const stats = storageManager.obterEstatisticas();
    
    // Atualizar exibição das métricas
    document.getElementById('metricTime').textContent = 
        `${Math.floor(stats.metricas.tempoTotalOffline / 60)}h ${stats.metricas.tempoTotalOffline % 60}m`;
    document.getElementById('metricDays').textContent = stats.metricas.diasConsecutivos;
    document.getElementById('metricActivities').textContent = stats.metricas.atividadesRealizadas;
    document.getElementById('metricSatisfaction').textContent = stats.metricas.nivelSatisfacao;
    
    // Atualizar barra de progresso do tempo
    const timeProgress = document.getElementById('timeProgress');
    const progressPercentage = Math.min((stats.metricas.tempoTotalOffline / 120) * 100, 100);
    timeProgress.style.width = `${progressPercentage}%`;
    
    // Atualizar meta diária
    const userProfile = storageManager.carregarPerfilUsuario();
    const dailyGoal = userProfile?.configuracoes?.limite_diario_redes || parseInt(localStorage.getItem('userGoal')) || 120;
    const goalProgress = document.getElementById('dailyGoalProgress');
    const goalTime = document.getElementById('goalTime');
    const goalText = document.getElementById('goalText');
    
    const goalPercentage = Math.min((stats.metricas.tempoTotalOffline / dailyGoal) * 100, 100);
    goalProgress.style.width = `${goalPercentage}%`;
    goalTime.textContent = `${stats.metricas.tempoTotalOffline}/${dailyGoal} min`;
    goalText.textContent = goalPercentage >= 100 ? 'Meta atingida! 🎉' : 'Sua meta diária';
}

// Atualizar conquistas
function updateAchievements() {
    const stats = storageManager.obterEstatisticas();
    
    // Primeira atividade
    if (stats.metricas.atividadesRealizadas >= 1) {
        document.getElementById('firstActivity').classList.add('unlocked');
    }
    
    // 3 dias consecutivos
    if (stats.metricas.diasConsecutivos >= 3) {
        document.getElementById('threeDays').classList.add('unlocked');
    }
    
    // 1 hora offline
    if (stats.metricas.tempoTotalOffline >= 60) {
        document.getElementById('oneHour').classList.add('unlocked');
    }
    
    // 5 atividades
    if (stats.metricas.atividadesRealizadas >= 5) {
        document.getElementById('fiveActivities').classList.add('unlocked');
    }
}

// ========== FUNÇÕES DE UTILIDADE ==========

// Redirecionar para o Mapa de Emoções
function redirectToEmotionMap() {
    const currentState = {
        timestamp: new Date().toISOString(),
        source: 'notificacoes'
    };
    localStorage.setItem('desligaAI_returnState', JSON.stringify(currentState));
    window.location.href = 'mapa-emocoes.html';
}

// Mostrar toast notification
function showToast(message) {
    // Criar elemento toast
    const toast = document.createElement('div');
    toast.className = 'position-fixed top-0 end-0 p-3';
    toast.style.zIndex = '1060';
    
    toast.innerHTML = `
        <div class="toast show" role="alert">
            <div class="toast-header bg-primary text-white">
                <strong class="me-auto">Desliga AI</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Remover automaticamente após 3 segundos
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Carregar dados salvos
function loadSavedData() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        document.querySelector('#themeIcon').textContent = '☀️';
    }
    
    const savedScreenTime = localStorage.getItem('screenTime');
    if (savedScreenTime) {
        screenTime = parseInt(savedScreenTime);
    }
}

// Inicializar tooltips do Bootstrap
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}