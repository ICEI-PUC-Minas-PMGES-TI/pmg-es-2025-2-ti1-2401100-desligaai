// Variável global para armazenar os dados
let notificationData;

// Carregar dados do JSON
async function loadNotificationData() {
    try {
        const response = await fetch('notifications-data.json');
        notificationData = await response.json();
        initNotifications();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Dados de fallback caso o JSON não carregue
        notificationData = {
            sistema_notificacoes: {
                notificacoes_genericas: [],
                sugestoes_genericas: [],
                metricas_iniciais: {
                    tempo_total_offline_minutos: 0,
                    dias_consecutivos: 0,
                    atividades_realizadas: 0,
                    nivel_satisfacao: "-"
                }
            }
        };
    }
}

// Inicializar sistema de notificações
function initNotifications() {
    renderNotifications();
    renderQuickSuggestions();
    setupThemeToggle();
    setupEventListeners();
}

// Função para renderizar notificações
function renderNotifications() {
    const container = document.getElementById('notificationsContainer');
    if (!container) return;
    
    const notifications = notificationData.sistema_notificacoes.notificacoes_genericas;
    
    container.innerHTML = '';
    
    notifications.forEach(notification => {
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification ${notification.prioridade === 'alta' ? 'high-priority' : ''}`;
        
        notificationEl.innerHTML = `
            <div class="notification-header">
                <h3 class="notification-title">${notification.titulo}</h3>
                <span class="notification-priority">${notification.prioridade}</span>
            </div>
            <div class="notification-message">${notification.mensagem}</div>
            ${notification.acao_sugerida ? `
                <div class="suggestion-action">
                    <p><strong>${notification.acao_sugerida.texto}</strong> ${notification.acao_sugerida.atividade}</p>
                </div>
            ` : ''}
        `;
        
        container.appendChild(notificationEl);
    });
}

// Função para renderizar sugestões rápidas
function renderQuickSuggestions() {
    const container = document.getElementById('suggestionsContainer');
    const quickActionsContainer = document.querySelector('.quick-actions');
    
    if (!container || !quickActionsContainer) return;
    
    const suggestions = notificationData.sistema_notificacoes.sugestoes_genericas;
    
    // Renderizar sugestões em cards
    container.innerHTML = '';
    suggestions.forEach(category => {
        category.atividades.forEach(activity => {
            const suggestionEl = document.createElement('div');
            suggestionEl.className = 'suggestion-card';
            
            suggestionEl.innerHTML = `
                <div class="suggestion-category">${category.categoria}</div>
                <div class="suggestion-activity">${activity}</div>
            `;
            
            // Adicionar evento de clique para registrar atividade
            suggestionEl.addEventListener('click', () => {
                registerActivity(activity, category.categoria);
            });
            
            container.appendChild(suggestionEl);
        });
    });
    
    // Renderizar ações rápidas
    quickActionsContainer.innerHTML = '';
    const quickActions = [
        { text: "Criar Perfil", action: "createProfile" },
        { text: "Registrar 15min offline", action: "registerTime" },
        { text: "Explorar atividades", action: "exploreActivities" },
        { text: "Definir primeira meta", action: "setGoal" }
    ];
    
    quickActions.forEach(action => {
        const actionEl = document.createElement('button');
        actionEl.className = 'quick-action';
        actionEl.textContent = action.text;
        actionEl.setAttribute('data-action', action.action);
        quickActionsContainer.appendChild(actionEl);
    });
}

// Função para alternar tema claro/escuro
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const themeIcon = themeToggle.querySelector('span');
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        
        if (document.body.classList.contains('dark')) {
            themeIcon.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        }
    });
    
    // Verificar tema salvo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        themeIcon.textContent = '☀️';
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Botão de criar perfil
    const createProfileBtn = document.querySelector('.btn-primary');
    if (createProfileBtn) {
        createProfileBtn.addEventListener('click', createProfile);
    }
    
    // Ações rápidas
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('quick-action')) {
            const action = e.target.getAttribute('data-action');
            handleQuickAction(action);
        }
    });
}

// Função para criar perfil
function createProfile() {
    alert('Redirecionando para a criação de perfil...');
    // Em implementação real, redirecionaria para página de cadastro
    // window.location.href = '/cadastro';
}

// Função para lidar com ações rápidas
function handleQuickAction(action) {
    switch(action) {
        case 'createProfile':
            createProfile();
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
    }
}

// Função para registrar tempo offline
function registerOfflineTime(minutes) {
    // Em implementação real, enviaria para o backend
    console.log(`Registrando ${minutes} minutos offline`);
    alert(`${minutes} minutos de desconexão registrados!`);
    
    // Atualizar métricas locais
    updateMetrics({
        time: minutes,
        activity: true
    });
}

// Função para registrar atividade
function registerActivity(activity, category) {
    console.log(`Atividade registrada: ${activity} (${category})`);
    alert(`Atividade "${activity}" registrada!`);
    
    // Atualizar métricas locais
    updateMetrics({
        activity: true
    });
}

// Função para explorar atividades
function exploreActivities() {
    alert('Explorando mais atividades...');
    // Em implementação real, mostraria mais sugestões
}

// Função para definir primeira meta
function setFirstGoal() {
    const goal = prompt('Qual sua primeira meta de desconexão? (ex: "30 minutos por dia")');
    if (goal) {
        console.log(`Meta definida: ${goal}`);
        alert(`Meta "${goal}" definida com sucesso!`);
    }
}

// Função para atualizar métricas
function updateMetrics(data) {
    // Em implementação real, atualizaria via API
    // Aqui é apenas uma simulação
    if (data.time) {
        console.log(`Adicionando ${data.time} minutos ao tempo total`);
    }
    if (data.activity) {
        console.log('Incrementando contador de atividades');
    }
}

// Função para gerar notificação personalizada
function generatePersonalizedNotification(type, userData) {
    const notifications = {
        motivation: [
            "Você está indo bem! Continue assim!",
            "Cada minuto offline é uma vitória!",
            "Seu progresso está inspirando outros!"
        ],
        reminder: [
            "Hora de fazer uma pausa das telas!",
            "Que tal experimentar uma atividade offline?",
            "Lembre-se: qualidade > quantidade"
        ],
        achievement: [
            "Parabéns! Você atingiu uma nova meta!",
            "Marcou um novo recorde de tempo offline!",
            "Consistência é a chave - você está no caminho certo!"
        ]
    };
    
    const randomIndex = Math.floor(Math.random() * notifications[type].length);
    return notifications[type][randomIndex];
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    loadNotificationData();
});

// Exportar funções para uso em outros arquivos (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadNotificationData,
        initNotifications,
        generatePersonalizedNotification,
        registerOfflineTime,
        registerActivity
    };
}