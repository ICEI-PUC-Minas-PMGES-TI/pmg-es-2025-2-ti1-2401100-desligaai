// Database Management
let db = {
    users: [],
    challenges: {},
    ranks: ["Bronze", "Prata", "Ouro", "Imortal", "Radiante"],
    tools: [],
    harms: [],
    settings: { darkMode: false }
};

let currentUser = null;

// Load database from JSON file or localStorage
async function loadDatabase() {
    try {
        // Primeiro, tentar carregar via API do json-server (db.json da raiz)
        const API_URL = 'http://localhost:3000';
        try {
            // Carregar dados do json-server (db.json da raiz)
            const [usersRes, challengesRes, ranksRes, toolsRes, harmsRes, settingsRes] = await Promise.allSettled([
                fetch(`${API_URL}/users`),
                fetch(`${API_URL}/challenges`),
                fetch(`${API_URL}/ranks`),
                fetch(`${API_URL}/tools`),
                fetch(`${API_URL}/harms`),
                fetch(`${API_URL}/settings`)
            ]);
            
            // Se conseguiu carregar pelo menos os usuários, usar dados da API
            if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
                db.users = await usersRes.value.json();
                if (challengesRes.status === 'fulfilled' && challengesRes.value.ok) {
                    db.challenges = await challengesRes.value.json();
                }
                if (ranksRes.status === 'fulfilled' && ranksRes.value.ok) {
                    db.ranks = await ranksRes.value.json();
                }
                if (toolsRes.status === 'fulfilled' && toolsRes.value.ok) {
                    db.tools = await toolsRes.value.json();
                }
                if (harmsRes.status === 'fulfilled' && harmsRes.value.ok) {
                    db.harms = await harmsRes.value.json();
                }
                if (settingsRes.status === 'fulfilled' && settingsRes.value.ok) {
                    const settings = await settingsRes.value.json();
                    db.settings = Array.isArray(settings) ? settings[0] || {} : settings;
                }
                
                // Salvar no localStorage para cache
                localStorage.setItem('digitalDetoxDB', JSON.stringify(db));
                applyTheme();
                console.log('[DB] Banco de dados unificado carregado via API json-server (db.json da raiz)');
                return;
            }
        } catch (apiError) {
            console.warn('[DB] API json-server não disponível, tentando carregar arquivo diretamente:', apiError.message);
        }
        
        // Se API não disponível, tentar carregar arquivo diretamente
        // First try to load from localStorage
        const savedDB = localStorage.getItem('digitalDetoxDB');
        if (savedDB) {
            db = JSON.parse(savedDB);
            applyTheme();
            console.log('[DB] Banco de dados carregado do localStorage');
            return;
        }
        
        // If no localStorage, try to load from db.json (raiz do projeto)
        const dbPaths = ['../db.json', '/db.json', './db.json', 'db.json'];
        for (const dbPath of dbPaths) {
            try {
                const response = await fetch(dbPath);
                if (response.ok) {
                    const jsonData = await response.json();
                    db = jsonData;
                    // Save to localStorage for future use
                    localStorage.setItem('digitalDetoxDB', JSON.stringify(db));
                    applyTheme();
                    console.log('[DB] Banco de dados unificado carregado de:', dbPath);
                    return;
                }
            } catch (error) {
                console.warn('[DB] Erro ao carregar de', dbPath, ':', error.message);
                continue;
            }
        }
        
        console.log('[DB] Não foi possível carregar db.json da raiz, usando dados padrão');
    } catch (error) {
        console.error('Error loading database:', error);
    }
    
    // Initialize with default data if nothing found
    initializeDefaultData();
    applyTheme();
}

// Save database to localStorage and API
async function saveDatabase() {
    try {
        // Valida dados antes de salvar
        validateUserData();
        
        // Adiciona timestamp de última atualização
        db.lastUpdate = Date.now();
        db.lastUpdateBrasilia = getBrasiliaDate().timestamp;
        
        // Salvar no localStorage para cache
        localStorage.setItem('digitalDetoxDB', JSON.stringify(db));
        
        // Tentar salvar também via API do json-server (db.json da raiz)
        const API_URL = 'http://localhost:3000';
        try {
            // Atualizar usuário atual se existir
            if (currentUser && currentUser.id) {
                await fetch(`${API_URL}/users/${currentUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentUser)
                });
            }
            
            // Atualizar desafios se necessário
            if (db.challenges && Object.keys(db.challenges).length > 0) {
                // json-server não suporta atualização parcial de objetos aninhados facilmente
                // Por enquanto, apenas logamos
                console.log('[DB] Desafios atualizados localmente');
            }
        } catch (apiError) {
            console.warn('[DB] Não foi possível salvar via API (json-server pode não estar rodando):', apiError.message);
            // Continua mesmo se API não estiver disponível
        }
    } catch (error) {
        console.error('Error saving database:', error);
        showNotification('Erro ao salvar dados. Tente novamente.', 'error');
    }
}

// Verificação periódica de integridade
function startIntegrityCheck() {
    // Verifica a cada 5 minutos se os dados estão consistentes
    setInterval(() => {
        if (currentUser) {
            validateUserData();
            
            // Verifica se há tentativas de manipulação
            const day = currentUser.currentDay.toString();
            validateDayStartTime(day);
            
            // Verifica se o dia atual ainda é válido
            const canAdvance = canAdvanceDay(day);
            const challenges = db.challenges[day] || [];
            const allCompleted = challenges.every(c => c.completed);
            
            // Se completou mas não pode avançar, garante que não avançou indevidamente
            if (allCompleted && !canAdvance) {
                // Garante que não avançou
                const completionKey = `day_${day}_completed`;
                const wasCompleted = localStorage.getItem(completionKey);
                if (wasCompleted) {
                    // Verifica se o timestamp de conclusão é válido
                    const completionTime = parseInt(wasCompleted);
                    const dayKey = `day_${day}_start`;
                    const startTime = parseInt(localStorage.getItem(dayKey) || '0');
                    
                    if (completionTime < startTime) {
                        // Conclusão antes do início - inválido
                        localStorage.removeItem(completionKey);
                        challenges.forEach(c => c.completed = false);
                        db.challenges[day] = challenges;
                        saveDatabase();
                        loadChallenges();
                    }
                }
            }
        }
    }, 5 * 60 * 1000); // A cada 5 minutos
}

// Initialize default data
function initializeDefaultData() {
    const defaultData = {
        users: [{
            id: 1,
            name: "Alex",
            email: "alex@example.com",
            avatar: "https://picsum.photos/200",
            rank: "Bronze",
            currentDay: 1,
            points: 150,
            joinedDate: new Date().toISOString(),
            isLoggedIn: false
        }],
        challenges: {
            "1": [
                { id: "day-1-challenge-0", text: "Deixe o celular em outro cômodo por 1 hora.", completed: false },
                { id: "day-1-challenge-1", text: "Leia 10 páginas de um livro físico.", completed: false },
                { id: "day-1-challenge-2", text: "Desative notificações de redes sociais hoje.", completed: false },
                { id: "day-1-challenge-3", text: "Faça uma caminhada de 15 minutos sem fones.", completed: false },
                { id: "day-1-challenge-4", text: "Não use o celular 1 hora antes de dormir.", completed: false }
            ]
        },
        ranks: ["Bronze", "Prata", "Ouro", "Imortal", "Radiante"],
        tools: [
            { id: "timer", name: "Timer de Desafio", desc: "Foco total", icon: "⏱️" },
            { id: "progress", name: "Progresso Diário", desc: "Estatísticas", icon: "📊" },
            { id: "offline", name: "Atividades Offline", desc: "Ideias reais", icon: "bi-airplane" },
            { id: "achievements", name: "Mural", desc: "Conquistas", icon: "🏆" },
            { id: "checklist", name: "Checklist Rotina", desc: "Rotina diária", icon: "✅" },
            { id: "share", name: "Compartilhar", desc: "Inspire", icon: "📤" }
        ],
        harms: [
            { title: "Danos Cognitivos", desc: "Redução de foco e memória.", icon: "🧠" },
            { title: "Perda de Tempo", desc: "Horas desperdiçadas em nada.", icon: "⏰" },
            { title: "Fadiga Visual", desc: "Cansaço e dores de cabeça.", icon: "👁️" },
            { title: "Saúde Mental", desc: "Ansiedade e comparação.", icon: "😊" },
            { title: "Isolamento", desc: "Menos conexões reais.", icon: "👥" },
            { title: "Produtividade 0", desc: "Procrastinação constante.", icon: "❌" }
        ],
        settings: { darkMode: false }
    };
    
    // Merge with existing db, keeping existing data
    db = {
        users: db.users.length > 0 ? db.users : defaultData.users,
        challenges: Object.keys(db.challenges).length > 0 ? db.challenges : defaultData.challenges,
        ranks: db.ranks.length > 0 ? db.ranks : defaultData.ranks,
        tools: db.tools.length > 0 ? db.tools : defaultData.tools,
        harms: db.harms.length > 0 ? db.harms : defaultData.harms,
        settings: db.settings || defaultData.settings
    };
    
    saveDatabase();
}

// Função para validar e corrigir dados do usuário
function validateUserData() {
    if (!currentUser) return;
    
    let needsSave = false;
    
    // Garantir campos obrigatórios
    if (!currentUser.currentDay || isNaN(currentUser.currentDay)) {
        console.warn('[VALIDATE] currentDay ausente ou inválido, definindo como 1');
        currentUser.currentDay = 1;
        needsSave = true;
    }
    
    if (!currentUser.rank) {
        console.warn('[VALIDATE] rank ausente, definindo como Bronze');
        currentUser.rank = 'Bronze';
        needsSave = true;
    }
    
    if (!currentUser.points || isNaN(currentUser.points)) {
        console.warn('[VALIDATE] points ausente ou inválido, definindo como 0');
        currentUser.points = 0;
        needsSave = true;
    }
    
    if (!currentUser.avatar) {
        console.warn('[VALIDATE] avatar ausente, gerando avatar padrão');
        currentUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=7c3aed&color=fff`;
        needsSave = true;
    }
    
    if (!currentUser.dayHistory) {
        currentUser.dayHistory = [];
        needsSave = true;
    }
    
    if (!currentUser.achievements) {
        currentUser.achievements = [];
        needsSave = true;
    }
    
    if (!currentUser.joinedDate) {
        currentUser.joinedDate = new Date().toISOString();
        needsSave = true;
    }
    
    if (needsSave) {
        console.log('[VALIDATE] Dados corrigidos, salvando...');
        saveDatabase();
    }
}

// Theme Management
function applyTheme() {
    const isDark = db.settings.darkMode;
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.classList.remove('dark');
    }
    updateThemeIcons();
}

function toggleTheme() {
    db.settings.darkMode = !db.settings.darkMode;
    applyTheme();
    saveDatabase();
}

function updateThemeIcons() {
    const isDark = db.settings.darkMode;
    const icons = document.querySelectorAll('#themeIcon, #themeIconDashboard');
    icons.forEach(icon => {
        icon.className = isDark ? 'bi bi-sun' : 'bi bi-moon';
    });
}

// Auto-login: sempre usa o primeiro usuário ou cria um padrão
// Verificar autenticação do sistema de cadastro
function checkAuthFromCadastro() {
    try {
        console.log('[AUTH] Verificando autenticação...');
        const currentUserStr = localStorage.getItem('desligaAI_currentUser');
        
        if (!currentUserStr) {
            console.log('[AUTH] Nenhum usuário encontrado no localStorage');
            return null;
        }
        
        console.log('[AUTH] Usuário encontrado no localStorage');
        const authUser = JSON.parse(currentUserStr);
        
        if (!authUser || !authUser.email) {
            console.error('[AUTH] Dados do usuário inválidos:', authUser);
            return null;
        }
        
        console.log('[AUTH] Email do usuário autenticado:', authUser.email);
        
        // Criar ou atualizar usuário no sistema local
        let user = db.users.find(u => u.email === authUser.email);
        if (!user) {
            console.log('[AUTH] Criando novo usuário no sistema local');
            // Criar novo usuário baseado nos dados de autenticação
            user = {
                id: db.users.length + 1,
                name: authUser.nome || authUser.email.split('@')[0],
                email: authUser.email,
                avatar: authUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.nome || authUser.email.split('@')[0])}&background=7c3aed&color=fff`,
                rank: authUser.rank || "Bronze",
                currentDay: authUser.currentDay || 1,
                points: authUser.points || 0,
                joinedDate: authUser.dataCadastro || new Date().toISOString(),
                isLoggedIn: true,
                dayHistory: authUser.dayHistory || [],
                achievements: authUser.achievements || [],
                quizResult: null
            };
            db.users.push(user);
            saveDatabase();
        } else {
            console.log('[AUTH] Usuário existente encontrado, atualizando dados');
            // Atualizar dados do usuário existente
            user.name = authUser.nome || user.name;
            user.isLoggedIn = true;
            if (authUser.points !== undefined) user.points = authUser.points;
            if (authUser.rank) user.rank = authUser.rank;
            if (authUser.currentDay) user.currentDay = authUser.currentDay;
            // Garantir que currentDay sempre existe
            if (!user.currentDay || isNaN(user.currentDay)) {
                user.currentDay = 1;
                console.warn('[AUTH] currentDay ausente, definido como 1');
            }
            // Garantir campos obrigatórios
            if (!user.dayHistory) user.dayHistory = [];
            if (!user.achievements) user.achievements = [];
            if (!user.avatar) user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=fff`;
            
            // Atualizar quizResult se houver um novo
            try {
                const savedQuizResult = localStorage.getItem('desligaAI_quizResult');
                if (savedQuizResult) {
                    const newQuizResult = JSON.parse(savedQuizResult);
                    // Só atualiza se for mais recente
                    if (!user.quizResult || new Date(newQuizResult.date) > new Date(user.quizResult.date || 0)) {
                        user.quizResult = newQuizResult;
                    }
                } else if (authUser.quizResult) {
                    user.quizResult = authUser.quizResult;
                }
            } catch (e) {
                console.warn('Erro ao atualizar quizResult:', e);
            }
            
            saveDatabase();
        }
        
        console.log('[AUTH] Autenticação bem-sucedida para:', user.email);
        return user;
    } catch (error) {
        console.error('[AUTH] Erro ao verificar autenticação:', error);
        return null;
    }
}

function initializeUser() {
    // Primeiro, verificar autenticação do sistema de cadastro
    const authUser = checkAuthFromCadastro();
    
    // Verificar também se há flag de autenticação na sessionStorage
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    
    if (authUser || (isAuthenticated && justLoggedIn)) {
        // Usuário autenticado do sistema de cadastro
        if (authUser) {
            currentUser = authUser;
            console.log('[INIT] Usuário autenticado:', currentUser.email);
        } else {
            // Se não encontrou no checkAuthFromCadastro mas há flag, tentar novamente após um delay
            console.log('[INIT] Flag de autenticação encontrada, aguardando carregamento do usuário...');
            setTimeout(() => {
                const retryAuth = checkAuthFromCadastro();
                if (retryAuth) {
                    currentUser = retryAuth;
                    console.log('[INIT] Usuário autenticado após retry:', currentUser.email);
                    loadDashboard();
                } else {
                    console.error('[INIT] Não foi possível autenticar após retry');
                    sessionStorage.removeItem('isAuthenticated');
                    sessionStorage.removeItem('justLoggedIn');
                    sessionStorage.setItem('redirectingToLogin', 'true');
                    window.location.replace('../Cadastro/login.html');
                }
            }, 500);
            return;
        }
    } else {
        // Se não há autenticação, redirecionar para login
        console.log('[INIT] Usuário não autenticado, redirecionando para login...');
        const isRedirecting = sessionStorage.getItem('redirectingToLogin');
        if (!isRedirecting) {
            sessionStorage.setItem('redirectingToLogin', 'true');
            sessionStorage.removeItem('isAuthenticated');
            sessionStorage.removeItem('justLoggedIn');
            setTimeout(() => {
                window.location.replace('../Cadastro/login.html');
            }, 100);
        }
        return;
    }
}

// Dashboard Functions
function loadDashboard() {
    if (!currentUser) return;
    
    // Valida integridade dos dados ao carregar
    validateUserData();
    
    // Garantir que currentDay existe e é válido
    if (!currentUser.currentDay || isNaN(currentUser.currentDay)) {
        console.warn('[LOAD] currentDay inválido, redefinindo para 1');
        currentUser.currentDay = 1;
        saveDatabase();
    }
    
    // Verifica se há tentativa de avanço indevido
    const day = currentUser.currentDay.toString();
    const completionKey = `day_${day}_completed`;
    const wasCompleted = localStorage.getItem(completionKey);
    
    if (wasCompleted) {
        // Se foi marcado como completo mas não pode avançar, remove a marcação
        if (!validateDayCompletion(day)) {
            localStorage.removeItem(completionKey);
            const challenges = db.challenges[day] || [];
            challenges.forEach(c => c.completed = false);
            db.challenges[day] = challenges;
            saveDatabase();
        }
    }
    
    // Update user info
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatar').src = currentUser.avatar;
    document.getElementById('userPoints').textContent = `${currentUser.points} pts`;
    document.getElementById('userPointsCard').textContent = currentUser.points;
    document.getElementById('userRank').textContent = currentUser.rank;
    document.getElementById('userDays').textContent = `${currentUser.currentDay} / 30`;
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileRank').textContent = currentUser.rank;
    
    // Load challenges
    loadChallenges();
    
    // Load tools
    loadTools();
    
    // Load roadmap
    loadRoadmap();
}

function loadChallenges() {
    if (!currentUser) return;
    
    // Garantir que currentDay existe
    if (!currentUser.currentDay || isNaN(currentUser.currentDay)) {
        console.warn('[CHALLENGES] currentDay inválido, redefinindo para 1');
        currentUser.currentDay = 1;
        saveDatabase();
    }
    
    const day = currentUser.currentDay.toString();
    let challenges = db.challenges[day] || [];
    
    // If no challenges for this day, generate personalized ones
    if (challenges.length === 0) {
        // Usar quizResult do usuário para personalizar desafios
        const quizResult = currentUser.quizResult || null;
        challenges = generatePersonalizedChallenges(day, quizResult);
        db.challenges[day] = challenges;
        saveDatabase();
    }
    
    // Start timer for the day
    startDayTimer();
    
    const challengesList = document.getElementById('challengesList');
    challengesList.innerHTML = '';
    
    challenges.forEach(challenge => {
        const challengeItem = document.createElement('div');
        challengeItem.className = `challenge-item ${challenge.completed ? 'completed' : ''}`;
        challengeItem.onclick = () => toggleChallenge(challenge.id);
        
        // Adicionar link para página de conscientização se for um desafio relacionado
        const hasConsciousnessLink = challenge.text.toLowerCase().includes('celular') || 
                                     challenge.text.toLowerCase().includes('notificação') ||
                                     challenge.text.toLowerCase().includes('redes');
        
        challengeItem.innerHTML = `
            <div class="challenge-checkbox">
                ${challenge.completed ? '<i class="bi bi-check"></i>' : ''}
            </div>
            <p class="challenge-text">${challenge.text}</p>
            ${hasConsciousnessLink ? '<button class="btn btn-sm btn-link p-0 mt-1" onclick="showConsciousnessInfo(event, \'' + challenge.text + '\')"><i class="bi bi-info-circle"></i> Saiba mais</button>' : ''}
        `;
        
        challengesList.appendChild(challengeItem);
    });
    
    // Update progress
    updateChallengeProgress();
    
    // Update day info
    document.getElementById('challengeDay').textContent = `Dia ${currentUser.currentDay} - Complete para avançar`;
}

// Validação de tempo e progresso
function canAdvanceDay(day) {
    if (!currentUser) return false;
    
    const dayKey = `day_${day}_start`;
    const savedStart = localStorage.getItem(dayKey);
    
    if (!savedStart) {
        // Se não há timestamp de início, não pode avançar
        return false;
    }
    
    const startTime = parseInt(savedStart);
    const brasiliaNow = getBrasiliaDate();
    const now = brasiliaNow.timestamp;
    
    // Verifica se passou meia-noite em Brasília (novo dia)
    const startDateUTC = new Date(startTime);
    const startBrasiliaYear = startDateUTC.getUTCFullYear();
    const startBrasiliaMonth = startDateUTC.getUTCMonth() + 1;
    const startBrasiliaDay = startDateUTC.getUTCDate();
    
    // Se já passou meia-noite, pode avançar (mas ainda precisa completar desafios)
    const passedMidnight = (startBrasiliaDay !== brasiliaNow.day || 
                           startBrasiliaMonth !== brasiliaNow.month ||
                           startBrasiliaYear !== brasiliaNow.year);
    
    // Calcula se passaram 24 horas completas
    const dayDuration = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
    const elapsed = now - startTime;
    const has24Hours = elapsed >= dayDuration;
    
    // Pode avançar se passou meia-noite OU se passaram 24 horas completas
    return passedMidnight || has24Hours;
}

function validateDayCompletion(day) {
    if (!currentUser) return false;
    
    // Garantir que currentDay existe
    if (!currentUser.currentDay || isNaN(currentUser.currentDay)) {
        console.warn('[VALIDATE] currentDay inválido');
        currentUser.currentDay = 1;
        saveDatabase();
        return false;
    }
    
    const challenges = db.challenges[day] || [];
    if (challenges.length === 0) return false;
    
    // Verifica se todos os desafios foram completados
    const allCompleted = challenges.every(c => c.completed);
    
    // Verifica se pode avançar (tempo + desafios)
    const canAdvance = canAdvanceDay(day);
    
    return allCompleted && canAdvance;
}

function toggleChallenge(challengeId) {
    if (!currentUser) return;
    
    const day = currentUser.currentDay.toString();
    const challenges = db.challenges[day] || [];
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (challenge) {
        // Verifica se ainda está no prazo antes de permitir marcar
        if (!canAdvanceDay(day)) {
            challenge.completed = !challenge.completed;
            loadChallenges();
            saveDatabase();
            
        // Check if all challenges are completed
        const allCompleted = challenges.every(c => c.completed);
        if (allCompleted && challenges.length > 0) {
            // Verifica se pode avançar
            const canAdvance = canAdvanceDay(day);
            
            if (canAdvance) {
                // Pode avançar - mostra botão
                document.getElementById('dayCompleteAlert').classList.remove('d-none');
                document.getElementById('advanceDayButton').classList.remove('d-none');
                
                const alertElement = document.getElementById('dayCompleteAlert');
                alertElement.innerHTML = `
                    <i class="bi bi-check-circle me-2"></i>
                    <strong>Todos os desafios concluídos e 24 horas completas!</strong> Clique no botão abaixo para avançar.
                `;
            } else {
                // Ainda não pode avançar - mostra mensagem de espera
                document.getElementById('dayCompleteAlert').classList.remove('d-none');
                document.getElementById('advanceDayButton').classList.add('d-none');
                
                const alertElement = document.getElementById('dayCompleteAlert');
                alertElement.innerHTML = `
                    <i class="bi bi-clock me-2"></i>
                    <strong>Todos os desafios concluídos!</strong> Aguarde as 24 horas completas para avançar ao próximo dia.
                `;
            }
            
            // Salva timestamp de conclusão para validação
            const completionKey = `day_${day}_completed`;
            localStorage.setItem(completionKey, Date.now().toString());
        } else {
            document.getElementById('advanceDayButton').classList.add('d-none');
        }
        } else {
            // Se passou o tempo, permite desmarcar para reiniciar
            challenge.completed = !challenge.completed;
            loadChallenges();
            saveDatabase();
        }
    }
}

// Torna função acessível globalmente
window.attemptDayAdvance = function() {
    if (!currentUser) return false;
    
    // Garantir que currentDay existe
    if (!currentUser.currentDay || isNaN(currentUser.currentDay)) {
        console.error('[ADVANCE] currentDay inválido');
        showNotification('❌ Erro: Dados do usuário inválidos. Recarregue a página.', 'error');
        return false;
    }
    
    const day = currentUser.currentDay.toString();
    
    // Validação completa antes de avançar
    if (!validateDayCompletion(day)) {
        const challenges = db.challenges[day] || [];
        const allCompleted = challenges.every(c => c.completed);
        
        if (!allCompleted) {
            showNotification('Você precisa completar todos os 5 desafios antes de avançar!', 'warning');
            return false;
        }
        
        if (!canAdvanceDay(day)) {
            const dayKey = `day_${day}_start`;
            const savedStart = localStorage.getItem(dayKey);
            if (savedStart) {
                const startTime = parseInt(savedStart);
                const brasiliaNow = getBrasiliaDate();
                const now = brasiliaNow.timestamp;
                const elapsed = now - startTime;
                const remaining = (24 * 60 * 60 * 1000) - elapsed;
                const hours = Math.floor(remaining / (1000 * 60 * 60));
                const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                
                showNotification(`Aguarde mais ${hours}h ${minutes}min para avançar ao próximo dia!`, 'info');
            } else {
                showNotification('Erro: Não foi possível validar o tempo. O dia será reiniciado.', 'warning');
                resetDayChallenges();
            }
            return false;
        }
    }
    
    // Todas as validações passaram - pode avançar
    // Registra a conclusão do dia
    const completionKey = `day_${day}_completed`;
    const completionTime = getBrasiliaDate();
    localStorage.setItem(completionKey, completionTime.timestamp.toString());
    
    // Registra no histórico do usuário
    if (!currentUser.dayHistory) {
        currentUser.dayHistory = [];
    }
    currentUser.dayHistory.push({
        day: parseInt(day),
        completedAt: completionTime.timestamp,
        completedDate: `${completionTime.day}/${completionTime.month}/${completionTime.year}`,
        points: 50
    });
    
    // Award points
    currentUser.points += 50;
    
    // Advance to next day
    if (currentUser.currentDay < 30) {
        const previousDay = currentUser.currentDay;
        const previousWeek = Math.ceil(previousDay / 7);
        
        currentUser.currentDay++;
        const newWeek = Math.ceil(currentUser.currentDay / 7);
        
        // Sistema de patentes por semana
        // Só atualiza patente se completou todos os dias da semana anterior
        if (newWeek > previousWeek && newWeek <= 5) {
            // Verificar se completou todos os dias da semana anterior (7 dias)
            const weekStartDay = (previousWeek - 1) * 7 + 1;
            const weekEndDay = Math.min(previousWeek * 7, 30); // Não ultrapassar 30 dias
            let allWeekDaysCompleted = true;
            
            // Verificar cada dia da semana
            for (let d = weekStartDay; d <= weekEndDay; d++) {
                const dayKey = `day_${d}_completed`;
                const wasCompleted = localStorage.getItem(dayKey);
                if (!wasCompleted) {
                    allWeekDaysCompleted = false;
                    console.log(`[PATENTE] Dia ${d} não foi completado, não pode avançar patente`);
                    break;
                }
            }
            
            if (allWeekDaysCompleted) {
                // Avançar para próxima patente
                const newRank = db.ranks[newWeek - 1];
                currentUser.rank = newRank;
                showNotification(`🎉 Parabéns! Você completou a semana ${previousWeek} e alcançou a patente ${newRank}!`, 'success');
                console.log(`[PATENTE] Usuário avançou para patente ${newRank} (Semana ${newWeek})`);
            } else {
                // Manter patente anterior até completar todos os dias
                const currentRank = db.ranks[previousWeek - 1] || db.ranks[0];
                currentUser.rank = currentRank;
                showNotification(`⚠️ Complete todos os dias da semana ${previousWeek} para avançar para a próxima patente.`, 'warning');
            }
        } else if (newWeek <= 5) {
            // Ainda na mesma semana, atualizar patente baseada na semana atual
            currentUser.rank = db.ranks[newWeek - 1];
        }
        
        // Generate new challenges for next day
        const nextDay = currentUser.currentDay.toString();
        if (!db.challenges[nextDay]) {
            db.challenges[nextDay] = generatePersonalizedChallenges(nextDay, currentUser.quizResult);
        }
        
        // Inicia o timer do próximo dia
        const nextDayKey = `day_${nextDay}_start`;
        const brasiliaNow = getBrasiliaDate();
        const nextStartTime = getStartOfDayBrasilia(brasiliaNow.year, brasiliaNow.month, brasiliaNow.day);
        localStorage.setItem(nextDayKey, nextStartTime.toString());
    } else if (currentUser.currentDay === 30) {
        // Completou 30 dias - mostrar tela de conclusão
        showJourneyCompleteScreen();
    }
    
    saveDatabase();
    loadDashboard();
    
    // Mostra notificação de sucesso
    showNotification(`Parabéns! Você avançou para o dia ${currentUser.currentDay}! Continue assim! 🎉`, 'success');
    
    return true;
}

// Sistema de notificações melhorado
function showNotification(message, type = 'info') {
    // Remove notificações existentes
    const existing = document.querySelectorAll('.custom-notification');
    existing.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `custom-notification custom-notification-${type}`;
    
    const icons = {
        success: 'bi-check-circle',
        warning: 'bi-exclamation-triangle',
        info: 'bi-info-circle',
        error: 'bi-x-circle'
    };
    
    notification.innerHTML = `
        <div class="custom-notification-content">
            <i class="bi ${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="custom-notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="bi bi-x"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Anima entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove automaticamente após 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
};

// Torna função de calendário acessível globalmente (será definida depois)

function updateChallengeProgress() {
    if (!currentUser) return;
    
    // Garantir que currentDay existe
    if (!currentUser.currentDay || isNaN(currentUser.currentDay)) {
        console.warn('[PROGRESS] currentDay inválido, redefinindo para 1');
        currentUser.currentDay = 1;
        saveDatabase();
    }
    
    const day = currentUser.currentDay.toString();
    const challenges = db.challenges[day] || [];
    const completed = challenges.filter(c => c.completed).length;
    const total = challenges.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    document.getElementById('challengeProgress').textContent = `${progress}%`;
    document.getElementById('progressBar').style.width = `${progress}%`;
    
    // Atualiza status do botão de avanço
    const allCompleted = challenges.every(c => c.completed);
    const canAdvance = canAdvanceDay(day);
    
    if (progress === 100 && allCompleted) {
        if (canAdvance) {
            document.getElementById('dayCompleteAlert').classList.remove('d-none');
            document.getElementById('advanceDayButton').classList.remove('d-none');
            document.getElementById('dayCompleteAlert').innerHTML = `
                <i class="bi bi-check-circle me-2"></i>
                <strong>Todos os desafios concluídos e 24 horas completas!</strong> Clique no botão abaixo para avançar.
            `;
        } else {
            document.getElementById('dayCompleteAlert').classList.remove('d-none');
            document.getElementById('advanceDayButton').classList.add('d-none');
            document.getElementById('dayCompleteAlert').innerHTML = `
                <i class="bi bi-clock me-2"></i>
                <strong>Todos os desafios concluídos!</strong> Aguarde as 24 horas completas para avançar.
            `;
        }
    } else {
        document.getElementById('dayCompleteAlert').classList.add('d-none');
        document.getElementById('advanceDayButton').classList.add('d-none');
    }
}

function loadTools() {
    const toolsGrid = document.getElementById('toolsGrid');
    toolsGrid.innerHTML = '';
    
    const toolHandlers = {
        timer: () => {
            // Abrir página do Timer de Desafio
            window.location.href = '../Timer de Desafio/timer.html';
        },
        progress: () => {
            // Abrir modal de Progresso Diário
            openProgressDailyModal();
        },
        progressTime: () => {
            // Abrir modal de Progresso ao Longo do Tempo
            openProgressTimeModal();
        },
        offline: () => {
            // Abrir página de Atividades Offline - Ideias Reais
            window.location.href = '../Atividades Offline/atvaleatorias.html';
        },
        achievements: () => {
            // Abrir modal de Mural de Conquistas
            openAchievementsModal();
        },
        checklist: () => {
            // Abrir modal de Checklist Rotina
            openChecklistModal();
        },
        share: () => {
            // Abrir modal de Compartilhamento
            openShareModal();
        }
    };
    
    db.tools.forEach(tool => {
        const toolCard = document.createElement('div');
        toolCard.className = 'col-6';
        toolCard.onclick = () => {
            const handler = toolHandlers[tool.id];
            if (handler) handler();
            else alert(`Abrindo ferramenta: ${tool.name}`);
        };
        
        // Verificar se o ícone é uma classe Bootstrap ou emoji
        const iconHTML = tool.icon.startsWith('bi-') 
            ? `<i class="bi ${tool.icon}"></i>` 
            : tool.icon;
        
        toolCard.innerHTML = `
            <div class="tool-card">
                <div class="tool-icon">${iconHTML}</div>
                <div class="tool-name">${tool.name}</div>
                <div class="tool-desc">${tool.desc}</div>
            </div>
        `;
        
        toolsGrid.appendChild(toolCard);
    });
}


function loadRoadmap() {
    if (!currentUser) return;
    
    const roadmapWeeks = document.getElementById('roadmapWeeks');
    roadmapWeeks.innerHTML = '';
    
    const currentWeek = Math.ceil(currentUser.currentDay / 7);
    
    for (let week = 1; week <= 5; week++) {
        const weekDiv = document.createElement('div');
        const isPast = week < currentWeek;
        const isCurrent = week === currentWeek;
        const isLocked = week > currentWeek;
        
        let className = 'roadmap-week';
        if (isPast) className += ' past';
        else if (isCurrent) className += ' current';
        else if (isLocked) className += ' locked';
        
        weekDiv.className = className;
        
        let icon = '';
        if (isPast) icon = '<i class="bi bi-check"></i>';
        else if (isCurrent) icon = '<i class="bi bi-fire"></i>';
        else icon = '<i class="bi bi-lock"></i>';
        
        weekDiv.innerHTML = `
            <div class="roadmap-circle">${icon}</div>
            <span class="roadmap-week-label">Sem ${week}</span>
        `;
        
        roadmapWeeks.appendChild(weekDiv);
    }
}


// Timezone System - Brasília (UTC-3)
// Sistema robusto que sempre usa o fuso horário oficial de Brasília
function getBrasiliaDate() {
    // Obtém a data atual no fuso horário de Brasília
    const now = new Date();
    
    // Formata a data no timezone de Brasília (America/Sao_Paulo = UTC-3)
    const formatter = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo', // Fuso horário oficial de Brasília
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const dateParts = {};
    parts.forEach(part => {
        dateParts[part.type] = part.value;
    });
    
    // Cria uma data representando o horário de Brasília
    const brasiliaDate = new Date(
        parseInt(dateParts.year),
        parseInt(dateParts.month) - 1,
        parseInt(dateParts.day),
        parseInt(dateParts.hour),
        parseInt(dateParts.minute),
        parseInt(dateParts.second)
    );
    
    return {
        year: parseInt(dateParts.year),
        month: parseInt(dateParts.month),
        day: parseInt(dateParts.day),
        hour: parseInt(dateParts.hour),
        minute: parseInt(dateParts.minute),
        second: parseInt(dateParts.second),
        timestamp: now.getTime(), // Usa o timestamp UTC atual
        date: brasiliaDate,
        // Adicionar informações úteis
        dayOfWeek: brasiliaDate.getDay(), // 0 = Domingo, 6 = Sábado
        isWeekend: brasiliaDate.getDay() === 0 || brasiliaDate.getDay() === 6
    };
}

function getDaysInMonth(year, month) {
    // Retorna o número de dias em um mês específico
    // month: 1-12 (Janeiro = 1, Dezembro = 12)
    return new Date(year, month, 0).getDate();
}

function getDaysInMonthBrasilia(year, month) {
    // Retorna o número de dias em um mês específico (Brasília)
    // month: 1-12 (Janeiro = 1, Dezembro = 12)
    return new Date(year, month, 0).getDate();
}

function getStartOfDayBrasilia(year, month, day) {
    // Brasília está em UTC-3 (horário de verão foi abolido em 2019)
    // Quando é 00:00:00 em Brasília, é 03:00:00 UTC
    // Então criamos a data como 03:00 UTC para representar 00:00 em Brasília
    // Isso garante que o sistema sempre use o fuso horário correto
    const utcMidnight = new Date(Date.UTC(year, month - 1, day, 3, 0, 0, 0));
    return utcMidnight.getTime();
}

// Função auxiliar para obter número de dias em um mês
function getDaysInMonthBrasilia(year, month) {
    // Usa o timezone de Brasília para calcular corretamente
    const date = new Date(year, month, 0); // Último dia do mês anterior = primeiro dia do mês seguinte - 1
    return date.getDate();
}

// Timer System (24 hours per day) - Baseado no horário de Brasília
let dayTimer = null;

function startDayTimer() {
    if (!currentUser) return;
    
    // Valida integridade dos dados antes de iniciar
    validateUserData();
    
    // Garantir que currentDay existe
    if (!currentUser.currentDay || isNaN(currentUser.currentDay)) {
        console.warn('[TIMER] currentDay inválido, redefinindo para 1');
        currentUser.currentDay = 1;
        saveDatabase();
    }
    
    const day = currentUser.currentDay.toString();
    const dayKey = `day_${day}_start`;
    const savedStart = localStorage.getItem(dayKey);
    
    const brasiliaNow = getBrasiliaDate();
    let startTime;
    
    // Valida o timestamp salvo
    if (savedStart && !validateDayStartTime(day)) {
        // Se a validação falhou, recria o timestamp
        startTime = getStartOfDayBrasilia(brasiliaNow.year, brasiliaNow.month, brasiliaNow.day);
        localStorage.setItem(dayKey, startTime.toString());
    } else if (savedStart) {
        startTime = parseInt(savedStart);
        // Verifica se já passou meia-noite em Brasília
        const startDate = new Date(startTime);
        const startBrasilia = new Date(startDate.getTime() + (3 * 60 * 60 * 1000)); // Ajusta para UTC
        
        // Se já passou meia-noite em Brasília, reseta o dia
        const currentBrasilia = getBrasiliaDate();
        if (startBrasilia.getDate() !== currentBrasilia.day || 
            startBrasilia.getMonth() + 1 !== currentBrasilia.month ||
            startBrasilia.getFullYear() !== currentBrasilia.year) {
            // Novo dia em Brasília - reseta
            startTime = getStartOfDayBrasilia(currentBrasilia.year, currentBrasilia.month, currentBrasilia.day);
            localStorage.setItem(dayKey, startTime.toString());
        }
    } else {
        // Primeira vez - inicia no início do dia atual em Brasília
        startTime = getStartOfDayBrasilia(brasiliaNow.year, brasiliaNow.month, brasiliaNow.day);
        localStorage.setItem(dayKey, startTime.toString());
    }
    
    function updateTimer() {
        const brasiliaNow = getBrasiliaDate();
        const now = brasiliaNow.timestamp;
        
        // startTime é um timestamp UTC que representa meia-noite em Brasília
        const startDateUTC = new Date(startTime);
        const startBrasiliaYear = startDateUTC.getUTCFullYear();
        const startBrasiliaMonth = startDateUTC.getUTCMonth() + 1;
        const startBrasiliaDay = startDateUTC.getUTCDate();
        
        // Verifica se já passou meia-noite em Brasília comparando as datas
        const passedMidnight = (startBrasiliaDay !== brasiliaNow.day || 
                               startBrasiliaMonth !== brasiliaNow.month ||
                               startBrasiliaYear !== brasiliaNow.year);
        
        // Calcula tempo decorrido desde o início do dia
        const dayDuration = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
        const elapsed = now - startTime;
        const has24Hours = elapsed >= dayDuration;
        
        // Verifica se todos os desafios foram completados
        const challenges = db.challenges[day] || [];
        const allCompleted = challenges.length > 0 && challenges.every(c => c.completed);
        
        // Se passou meia-noite OU 24 horas E não completou, reseta
        if ((passedMidnight || has24Hours) && !allCompleted) {
            resetDayChallenges();
            return;
        }
        
        // Se completou todos e passou o tempo, tenta avançar automaticamente
        if (allCompleted && (passedMidnight || has24Hours)) {
            attemptDayAdvance();
            return;
        }
        
        // Calcula o tempo restante (até 24h completas OU próxima meia-noite, o que vier primeiro)
        let nextDay = brasiliaNow.day + 1;
        let nextMonth = brasiliaNow.month;
        let nextYear = brasiliaNow.year;
        
        // Ajusta se passar do fim do mês
        const daysInMonth = getDaysInMonth(nextYear, nextMonth);
        if (nextDay > daysInMonth) {
            nextDay = 1;
            nextMonth++;
            if (nextMonth > 12) {
                nextMonth = 1;
                nextYear++;
            }
        }
        
        const nextMidnightBrasilia = getStartOfDayBrasilia(nextYear, nextMonth, nextDay);
        const timeUntilMidnight = nextMidnightBrasilia - now;
        const timeUntil24Hours = dayDuration - elapsed;
        
        // Usa o menor tempo (24h ou meia-noite)
        const remaining = Math.min(timeUntilMidnight, timeUntil24Hours);
        
        if (remaining <= 0) {
            // Day expired
            if (!allCompleted) {
                resetDayChallenges();
            } else {
                attemptDayAdvance();
            }
            return;
        }
        
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        const timerText = document.getElementById('timerText');
        if (timerText) {
            let statusText = '';
            if (allCompleted) {
                statusText = ' - Aguardando 24h para avançar';
            }
            timerText.textContent = `Tempo restante: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} (Brasília)${statusText}`;
        }
    }
    
    updateTimer();
    if (dayTimer) clearInterval(dayTimer);
    dayTimer = setInterval(updateTimer, 1000);
}

function resetDayChallenges() {
    if (!currentUser) return;
    
    // Garantir que currentDay existe
    if (!currentUser.currentDay || isNaN(currentUser.currentDay)) {
        console.warn('[RESET] currentDay inválido, redefinindo para 1');
        currentUser.currentDay = 1;
        saveDatabase();
    }
    
    const day = currentUser.currentDay.toString();
    const challenges = db.challenges[day] || [];
    const allCompleted = challenges.every(c => c.completed);
    
    const brasiliaNow = getBrasiliaDate();
    
    // Registra tentativa de reset no histórico
    if (!currentUser.resetHistory) {
        currentUser.resetHistory = [];
    }
    currentUser.resetHistory.push({
        day: parseInt(day),
        resetAt: brasiliaNow.timestamp,
        resetDate: `${brasiliaNow.day}/${brasiliaNow.month}/${brasiliaNow.year}`,
        reason: allCompleted ? 'time_expired_after_completion' : 'time_expired_before_completion'
    });
    
    // Reset all challenges
    challenges.forEach(c => c.completed = false);
    db.challenges[day] = challenges;
    
    // Reset timer para o início do dia atual em Brasília
    const dayKey = `day_${day}_start`;
    const startTime = getStartOfDayBrasilia(brasiliaNow.year, brasiliaNow.month, brasiliaNow.day);
    localStorage.setItem(dayKey, startTime.toString());
    
    // Remove timestamp de conclusão se existir
    const completionKey = `day_${day}_completed`;
    localStorage.removeItem(completionKey);
    
    saveDatabase();
    loadChallenges();
    startDayTimer();
    
    if (!allCompleted) {
        showNotification('O dia foi reiniciado! Você tem mais 24 horas para completar os desafios (horário de Brasília).', 'info');
    }
}

// Validação de integridade dos dados
function validateUserData() {
    if (!currentUser) return false;
    
    // Valida que currentDay está entre 1 e 30
    if (currentUser.currentDay < 1 || currentUser.currentDay > 30) {
        console.error('Dia inválido detectado, corrigindo...');
        currentUser.currentDay = Math.max(1, Math.min(30, currentUser.currentDay));
        saveDatabase();
    }
    
    // Valida que points não é negativo
    if (currentUser.points < 0) {
        console.error('Pontos negativos detectados, corrigindo...');
        currentUser.points = 0;
        saveDatabase();
    }
    
    // Valida rank
    if (!db.ranks.includes(currentUser.rank)) {
        console.error('Rank inválido detectado, corrigindo...');
        const week = Math.ceil(currentUser.currentDay / 7);
        currentUser.rank = db.ranks[Math.min(week - 1, db.ranks.length - 1)] || db.ranks[0];
        saveDatabase();
    }
    
    return true;
}

// Proteção contra manipulação de localStorage
function validateDayStartTime(day) {
    const dayKey = `day_${day}_start`;
    const savedStart = localStorage.getItem(dayKey);
    
    if (!savedStart) return false;
    
    const startTime = parseInt(savedStart);
    const now = Date.now();
    
    // Valida que o timestamp não está no futuro (mais de 1 hora de diferença)
    if (startTime > now + (60 * 60 * 1000)) {
        console.error('Timestamp inválido detectado (futuro), corrigindo...');
        const brasiliaNow = getBrasiliaDate();
        const correctStart = getStartOfDayBrasilia(brasiliaNow.year, brasiliaNow.month, brasiliaNow.day);
        localStorage.setItem(dayKey, correctStart.toString());
        return false;
    }
    
    // Valida que o timestamp não é muito antigo (mais de 60 dias)
    const maxAge = 60 * 24 * 60 * 60 * 1000;
    if (startTime < now - maxAge) {
        console.error('Timestamp muito antigo detectado, corrigindo...');
        const brasiliaNow = getBrasiliaDate();
        const correctStart = getStartOfDayBrasilia(brasiliaNow.year, brasiliaNow.month, brasiliaNow.day);
        localStorage.setItem(dayKey, correctStart.toString());
        return false;
    }
    
    return true;
}

// Generate personalized challenges based on quiz result
function generatePersonalizedChallenges(day, quizResult) {
    // Desafios base (para usuários sem quiz ou com uso saudável)
    const baseChallenges = [
        "Deixe o celular em outro cômodo por 1 hora.",
        "Leia 10 páginas de um livro físico.",
        "Desative notificações de redes sociais hoje.",
        "Faça uma caminhada de 15 minutos sem fones.",
        "Não use o celular 1 hora antes de dormir.",
        "Escreva em um diário por 10 minutos.",
        "Pratique 5 minutos de meditação ou respiração profunda.",
        "Converse pessoalmente com alguém por pelo menos 20 minutos.",
        "Faça uma atividade manual (desenho, artesanato, cozinhar).",
        "Organize um espaço da sua casa."
    ];
    
    // Desafios moderados (uso moderado - 7-10 pontos)
    const moderateChallenges = [
        "Deixe o celular desligado por 2 horas consecutivas.",
        "Leia 20 páginas de um livro físico.",
        "Desative todas as notificações por 6 horas.",
        "Faça uma caminhada de 30 minutos sem qualquer dispositivo.",
        "Não use o celular 2 horas antes de dormir.",
        "Complete uma tarefa importante sem interrupções digitais.",
        "Pratique exercícios físicos por 30 minutos.",
        "Escreva uma lista de 5 coisas pelas quais é grato.",
        "Passe 1 hora em um hobby offline.",
        "Faça uma refeição completa sem usar o celular."
    ];
    
    // Desafios intensos (uso excessivo/dependência - 11-16 pontos)
    const intenseChallenges = [
        "Deixe o celular em outro cômodo por 4 horas.",
        "Leia 30 páginas de um livro físico.",
        "Desative todas as notificações por 12 horas.",
        "Faça uma caminhada de 1 hora completamente offline.",
        "Não use o celular 3 horas antes de dormir.",
        "Complete um projeto pessoal sem checar redes sociais.",
        "Pratique exercícios físicos por 1 hora.",
        "Passe uma manhã ou tarde inteira sem telas.",
        "Converse pessoalmente com 3 pessoas diferentes hoje.",
        "Faça uma atividade criativa por pelo menos 2 horas."
    ];
    
    // Determinar nível de desafio baseado no quiz
    let challenges;
    if (quizResult && quizResult.score) {
        // Score do quiz principal (4 perguntas, 1-4 pontos cada = 4-16 total)
        if (quizResult.score >= 11) {
            // Uso excessivo ou dependência
            challenges = intenseChallenges;
        } else if (quizResult.score >= 7) {
            // Uso moderado
            challenges = moderateChallenges;
        } else {
            // Uso saudável
            challenges = baseChallenges;
        }
    } else {
        // Sem quiz, usar desafios base
        challenges = baseChallenges;
    }
    
    // Shuffle and select 5 desafios únicos
    const shuffled = [...challenges].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5).map((text, index) => ({
        id: `day-${day}-challenge-${index}`,
        text: text,
        completed: false
    }));
}


// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('[INIT] ========================================');
        console.log('[INIT] Página pós-login carregada');
        console.log('[INIT] URL atual:', window.location.href);
        
        // Esconder dashboard inicialmente
        const dashboardScreen = document.getElementById('dashboardScreen');
        if (dashboardScreen) {
            dashboardScreen.classList.add('d-none');
        }
        
        // Load database
        console.log('[INIT] Carregando banco de dados...');
        await loadDatabase();
        console.log('[INIT] Banco de dados carregado');
        
        // Initialize user (verifica autenticação)
        // Aguardar um pouco para garantir que o localStorage foi atualizado após login
        const justLoggedIn = sessionStorage.getItem('justLoggedIn');
        if (justLoggedIn) {
            // Se acabou de fazer login, aguardar um pouco mais para garantir que os dados foram salvos
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        initializeUser();
        
        // Se não há usuário autenticado, initializeUser já redirecionou ou está aguardando retry
        if (!currentUser) {
            console.log('[INIT] Aguardando retry de autenticação...');
            // Se initializeUser retornou mas não definiu currentUser, pode estar aguardando retry
            // Verificar novamente após um delay
            setTimeout(async () => {
                const retryAuth = checkAuthFromCadastro();
                if (retryAuth) {
                    currentUser = retryAuth;
                    console.log('[INIT] Usuário autenticado após retry:', currentUser.email);
                    
                    // Exibir dashboard
                    if (dashboardScreen) {
                        dashboardScreen.classList.remove('d-none');
                        dashboardScreen.style.display = '';
                    }
                    loadDashboard();
                } else {
                    console.error('[INIT] Não foi possível autenticar após retry');
                }
            }, 1000);
            return;
        }
        
        // Limpar flags se autenticado com sucesso
        sessionStorage.removeItem('stayOnLogin');
        sessionStorage.removeItem('redirectingToLogin');
        // Não remover justLoggedIn e isAuthenticated imediatamente para evitar loops
        // Eles serão limpos quando o usuário fizer logout ou após alguns minutos
        
        // Validar e corrigir dados do usuário antes de carregar dashboard
        console.log('[INIT] Validando dados do usuário...');
        validateUserData();
        console.log('[INIT] Dados do usuário validados');
        
        // Exibir dashboard
        if (dashboardScreen) {
            console.log('[INIT] Exibindo dashboard...');
            dashboardScreen.classList.remove('d-none');
            dashboardScreen.style.display = '';
        }
        
        // Show dashboard directly
        loadDashboard();
        console.log('[INIT] Dashboard carregado com sucesso!');
        
        // Dashboard Event Listeners
        const themeToggle = document.getElementById('themeToggleDashboard');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                currentUser = null;
                localStorage.removeItem('desligaAI_currentUser');
                window.location.replace('/Cadastro/login.html');
            });
        }
        
        // Inicia verificação periódica de integridade
        if (currentUser) {
            startIntegrityCheck();
        }
        
        console.log('[INIT] ========================================');
        console.log('[INIT] Inicialização completa!');
        
        // Verificar se completou 30 dias
        if (currentUser && currentUser.currentDay >= 30) {
            // Verificar se realmente completou o dia 30
            const day30Key = `day_30_completed`;
            const day30Completed = localStorage.getItem(day30Key);
            if (day30Completed) {
                showJourneyCompleteScreen();
            }
        }
    } catch (error) {
        console.error('[INIT] ERRO CRÍTICO na inicialização:', error);
        console.error('[INIT] Stack trace:', error.stack);
        alert('Erro ao carregar a página. Por favor, recarregue a página ou entre em contato com o suporte.\n\nErro: ' + error.message);
    }
});

// ============================================
// FUNÇÕES DO MENU DE PERFIL
// ============================================

function openChangeAvatar() {
    const modal = new bootstrap.Modal(document.getElementById('changeAvatarModal'));
    const currentAvatar = document.getElementById('userAvatar').src;
    document.getElementById('currentAvatarPreview').src = currentAvatar;
    document.getElementById('avatarUrl').value = currentAvatar;
    modal.show();
}

function generateAvatar() {
    if (!currentUser) return;
    const name = currentUser.name || currentUser.email.split('@')[0];
    const colors = ['7c3aed', '3b82f6', '10b981', 'f59e0b', 'ef4444', '8b5cf6'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=200`;
    document.getElementById('avatarUrl').value = avatarUrl;
    document.getElementById('currentAvatarPreview').src = avatarUrl;
}

async function saveAvatar() {
    if (!currentUser) return;
    const avatarUrl = document.getElementById('avatarUrl').value.trim();
    if (!avatarUrl) {
        showNotification('Por favor, informe uma URL válida', 'warning');
        return;
    }
    
    currentUser.avatar = avatarUrl;
    document.getElementById('userAvatar').src = avatarUrl;
    await saveDatabase();
    
    // Atualizar também no localStorage do sistema de autenticação
    try {
        const authUserStr = localStorage.getItem('desligaAI_currentUser');
        if (authUserStr) {
            const authUser = JSON.parse(authUserStr);
            authUser.avatar = avatarUrl;
            localStorage.setItem('desligaAI_currentUser', JSON.stringify(authUser));
        }
    } catch (e) {
        console.warn('Erro ao atualizar avatar no auth:', e);
    }
    
    bootstrap.Modal.getInstance(document.getElementById('changeAvatarModal')).hide();
    showNotification('Avatar atualizado com sucesso!', 'success');
}

function openChangePassword() {
    const modal = new bootstrap.Modal(document.getElementById('changePasswordModal'));
    // Limpar campos
    document.getElementById('newEmail').value = currentUser?.email || '';
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    modal.show();
}

async function savePasswordAndEmail() {
    if (!currentUser) return;
    
    const newEmail = document.getElementById('newEmail').value.trim();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (!newEmail || !isValidEmail(newEmail)) {
        showNotification('Por favor, informe um e-mail válido', 'warning');
        return;
    }
    
    if (newPassword && newPassword.length < 6) {
        showNotification('A nova senha deve ter pelo menos 6 caracteres', 'warning');
        return;
    }
    
    if (newPassword && newPassword !== confirmPassword) {
        showNotification('As senhas não coincidem', 'warning');
        return;
    }
    
    // Verificar senha atual se estiver mudando senha
    if (newPassword && currentPassword) {
        try {
            const API_URL = 'http://localhost:3000';
            const users = await fetch(`${API_URL}/users`).then(r => r.json());
            const user = users.find(u => u.email === currentUser.email);
            
            if (user) {
                const authManager = window.authManager;
                if (authManager) {
                    const hashedCurrent = authManager.hashPassword(currentPassword);
                    if (hashedCurrent !== user.password) {
                        showNotification('Senha atual incorreta', 'error');
                        return;
                    }
                }
            }
        } catch (e) {
            console.warn('Erro ao verificar senha:', e);
        }
    }
    
    // Atualizar no sistema
    try {
        const API_URL = 'http://localhost:3000';
        const users = await fetch(`${API_URL}/users`).then(r => r.json());
        const user = users.find(u => u.email === currentUser.email);
        
        if (user) {
            const updates = { email: newEmail };
            if (newPassword) {
                const authManager = window.authManager;
                if (authManager) {
                    updates.password = authManager.hashPassword(newPassword);
                }
            }
            
            await fetch(`${API_URL}/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...user, ...updates })
            });
            
            // Atualizar localmente
            currentUser.email = newEmail;
            currentUser.name = newEmail.split('@')[0];
            await saveDatabase();
            
            // Atualizar localStorage
            const authUserStr = localStorage.getItem('desligaAI_currentUser');
            if (authUserStr) {
                const authUser = JSON.parse(authUserStr);
                authUser.email = newEmail;
                localStorage.setItem('desligaAI_currentUser', JSON.stringify(authUser));
            }
            
            bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
            showNotification('Dados atualizados com sucesso!', 'success');
            
            // Atualizar display
            document.getElementById('userName').textContent = currentUser.name;
        }
    } catch (e) {
        console.error('Erro ao atualizar dados:', e);
        showNotification('Erro ao atualizar dados. Tente novamente.', 'error');
    }
}

function openCalendarView() {
    const modal = new bootstrap.Modal(document.getElementById('calendarModal'));
    renderProgressCalendar();
    modal.show();
}

function renderProgressCalendar() {
    if (!currentUser) return;
    
    const calendarContainer = document.getElementById('progressCalendar');
    calendarContainer.innerHTML = '';
    
    // Criar calendário dinâmico do mês atual em Brasília
    const brasiliaNow = getBrasiliaDate();
    const calendar = document.createElement('div');
    calendar.className = 'calendar-grid';
    
    // Cabeçalho com dias da semana
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    weekDays.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.textContent = day;
        calendar.appendChild(header);
    });
    
    // Obter primeiro dia do mês e dia da semana
    const firstDayOfMonth = new Date(brasiliaNow.year, brasiliaNow.month - 1, 1);
    const firstDayWeek = firstDayOfMonth.getDay(); // 0 = Domingo
    
    // Adicionar células vazias para alinhar o primeiro dia
    for (let i = 0; i < firstDayWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-day empty';
        calendar.appendChild(emptyCell);
    }
    
    // Obter número de dias no mês atual
    // Usar Date para calcular corretamente (mês 0 = último dia do mês anterior)
    const daysInMonth = new Date(brasiliaNow.year, brasiliaNow.month, 0).getDate();
    
    // Gerar células para cada dia do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(brasiliaNow.year, brasiliaNow.month - 1, day);
        const dayKey = date.toISOString().slice(0, 10);
        
        // Verificar se este dia corresponde a um dia do desafio completado
        // Buscar no histórico do usuário ou localStorage
        let isCompleted = false;
        let dayNumber = null;
        
        // Verificar se há histórico de dias completados
        if (currentUser.dayHistory && currentUser.dayHistory.length > 0) {
            // Tentar encontrar dia completado próximo a esta data
            const completedDay = currentUser.dayHistory.find(h => {
                const completedDate = new Date(h.completedAt);
                return completedDate.getDate() === day && 
                       completedDate.getMonth() === brasiliaNow.month - 1 &&
                       completedDate.getFullYear() === brasiliaNow.year;
            });
            if (completedDay) {
                isCompleted = true;
                dayNumber = completedDay.day;
            }
        }
        
        // Verificar também no localStorage
        if (!isCompleted && day <= currentUser.currentDay) {
            for (let d = 1; d <= currentUser.currentDay; d++) {
                const completionKey = `day_${d}_completed`;
                const wasCompleted = localStorage.getItem(completionKey);
                if (wasCompleted) {
                    const completionDate = new Date(parseInt(wasCompleted));
                    if (completionDate.getDate() === day && 
                        completionDate.getMonth() === brasiliaNow.month - 1 &&
                        completionDate.getFullYear() === brasiliaNow.year) {
                        isCompleted = true;
                        dayNumber = d;
                        break;
                    }
                }
            }
        }
        
        const dayCell = document.createElement('div');
        const isToday = day === brasiliaNow.day && 
                       brasiliaNow.month === new Date().getMonth() + 1 &&
                       brasiliaNow.year === new Date().getFullYear();
        
        dayCell.className = `calendar-day ${isCompleted ? 'completed' : isToday ? 'today' : day > currentUser.currentDay ? 'future' : 'incomplete'}`;
        dayCell.innerHTML = `
            <div class="calendar-day-number">${day}</div>
            ${isCompleted ? '<i class="bi bi-check-circle-fill"></i>' : ''}
            ${isToday ? '<div class="calendar-today-indicator"></div>' : ''}
        `;
        
        if (isCompleted && dayNumber) {
            dayCell.title = `Dia ${dayNumber} do desafio completado em ${date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`;
        } else if (isToday) {
            dayCell.title = 'Hoje';
        }
        
        calendar.appendChild(dayCell);
    }
    
    calendarContainer.appendChild(calendar);
    
    // Adicionar legenda
    const legend = document.createElement('div');
    legend.className = 'calendar-legend mt-4 d-flex gap-3 justify-content-center flex-wrap';
    legend.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <div class="calendar-day completed" style="width: 24px; height: 24px; pointer-events: none;"></div>
            <small>Dia Completado</small>
        </div>
        <div class="d-flex align-items-center gap-2">
            <div class="calendar-day incomplete" style="width: 24px; height: 24px; pointer-events: none;"></div>
            <small>Dia Pendente</small>
        </div>
        <div class="d-flex align-items-center gap-2">
            <div class="calendar-day future" style="width: 24px; height: 24px; pointer-events: none;"></div>
            <small>Dia Futuro</small>
        </div>
    `;
    calendarContainer.appendChild(legend);
}

function logout() {
    if (confirm('Deseja realmente desconectar da sua conta?')) {
        currentUser = null;
        localStorage.removeItem('desligaAI_currentUser');
        sessionStorage.clear();
        window.location.replace('../index principal.html');
    }
}

function showJourneyCompleteScreen() {
    const dashboardScreen = document.getElementById('dashboardScreen');
    const completeScreen = document.getElementById('journeyCompleteScreen');
    
    if (dashboardScreen) dashboardScreen.classList.add('d-none');
    if (completeScreen) {
        completeScreen.classList.remove('d-none');
        
        // Preencher dados
        if (currentUser) {
            document.getElementById('completeDays').textContent = '30';
            document.getElementById('completePoints').textContent = currentUser.points || 0;
            document.getElementById('completeRank').textContent = currentUser.rank || 'Radiante';
        }
    }
}

function viewProgressCalendar() {
    const completeScreen = document.getElementById('journeyCompleteScreen');
    if (completeScreen) completeScreen.classList.add('d-none');
    openCalendarView();
}

function shareJourney() {
    if (!currentUser) return;
    const text = `🎉 Completei os 30 dias do Desliga AI! 
✨ ${currentUser.points || 0} pontos conquistados
🏆 Patente: ${currentUser.rank || 'Radiante'}
📅 30 dias de desafios superados!

Reconquiste seu tempo! Acesse: desligaai.com`;
    
    if (navigator.share) {
        navigator.share({ text });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Texto copiado para a área de transferência!', 'success');
        });
    }
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Disponibilizar funções globalmente
window.openChangeAvatar = openChangeAvatar;
window.openChangePassword = openChangePassword;
window.openCalendarView = openCalendarView;
window.logout = logout;
window.generateAvatar = generateAvatar;
window.saveAvatar = saveAvatar;
window.savePasswordAndEmail = savePasswordAndEmail;
window.viewProgressCalendar = viewProgressCalendar;
window.shareJourney = shareJourney;

// ============================================
// PÁGINAS DE CONSCIENTIZAÇÃO
// ============================================

function showConsciousnessInfo(event, challengeText) {
    event.stopPropagation();
    
    // Determinar qual malefício mostrar baseado no desafio
    let harmType = 'general';
    const text = challengeText.toLowerCase();
    
    if (text.includes('celular') || text.includes('dispositivo')) {
        harmType = 'cognitive';
    } else if (text.includes('notificação') || text.includes('redes')) {
        harmType = 'mental';
    } else if (text.includes('tempo') || text.includes('hora')) {
        harmType = 'time';
    }
    
    const harmsInfo = {
        cognitive: {
            title: '🧠 Danos Cognitivos',
            description: 'O uso excessivo de vídeos curtos e redes sociais causa redução significativa na capacidade de concentração, memória e pensamento crítico.',
            details: [
                'O cérebro se acostuma com estímulos rápidos e perde a habilidade de foco profundo',
                'A memória de trabalho é comprometida pela sobrecarga de informações',
                'A capacidade de análise crítica diminui com o consumo passivo de conteúdo',
                'A atenção sustentada é substituída por atenção fragmentada'
            ],
            solutions: [
                'Pratique leitura de livros físicos para exercitar o foco',
                'Faça atividades que requerem concentração prolongada',
                'Evite multitarefa e foque em uma atividade por vez',
                'Use técnicas de meditação para melhorar a atenção'
            ]
        },
        mental: {
            title: '🧩 Saúde Mental',
            description: 'Redes sociais e vídeos curtos podem causar ansiedade, depressão, baixa autoestima e FOMO (Fear of Missing Out).',
            details: [
                'Comparações constantes com vidas "perfeitas" nas redes sociais',
                'Ansiedade causada por notificações e necessidade de estar sempre conectado',
                'FOMO - medo de perder eventos ou informações importantes',
                'Dopamina rápida seguida de queda emocional'
            ],
            solutions: [
                'Desative notificações de redes sociais',
                'Estabeleça horários específicos para uso',
                'Lembre-se que redes sociais mostram apenas o melhor das pessoas',
                'Pratique gratidão e foque no que você tem'
            ]
        },
        time: {
            title: '⏳ Perda de Tempo',
            description: 'Horas valiosas são desperdiçadas em conteúdo efêmero que não agrega valor real à sua vida.',
            details: [
                'Tempo que poderia ser usado para crescimento pessoal e profissional',
                'Oportunidades perdidas de aprendizado e desenvolvimento',
                'Relacionamentos reais negligenciados',
                'Projetos importantes adiados indefinidamente'
            ],
            solutions: [
                'Use aplicativos de controle de tempo',
                'Defina limites diários de uso',
                'Substitua o tempo digital por atividades produtivas',
                'Acompanhe quanto tempo você realmente gasta'
            ]
        },
        general: {
            title: '🚫 Vício Digital',
            description: 'O vício em vídeos curtos e redes sociais afeta múltiplas áreas da sua vida.',
            details: [
                'Danos cognitivos: redução de foco e memória',
                'Perda de tempo: horas desperdiçadas',
                'Fadiga visual: cansaço e dores de cabeça',
                'Saúde mental: ansiedade e comparação',
                'Isolamento social: menos conexões reais',
                'Produtividade zero: procrastinação constante'
            ],
            solutions: [
                'Complete os desafios diários do Desliga AI',
                'Use as ferramentas disponíveis na plataforma',
                'Estabeleça metas claras de redução',
                'Busque apoio de amigos e familiares'
            ]
        }
    };
    
    const info = harmsInfo[harmType] || harmsInfo.general;
    
    // Criar modal de conscientização
    const modalHTML = `
        <div class="modal fade" id="consciousnessModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${info.title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p class="lead">${info.description}</p>
                        <h6 class="mt-4 mb-3">Impactos:</h6>
                        <ul class="list-unstyled">
                            ${info.details.map(d => `<li class="mb-2"><i class="bi bi-exclamation-circle text-warning me-2"></i>${d}</li>`).join('')}
                        </ul>
                        <h6 class="mt-4 mb-3">Soluções:</h6>
                        <ul class="list-unstyled">
                            ${info.solutions.map(s => `<li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>${s}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Entendi</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior se existir
    const existingModal = document.getElementById('consciousnessModal');
    if (existingModal) existingModal.remove();
    
    // Adicionar novo modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('consciousnessModal'));
    modal.show();
    
    // Remover modal após fechar
    document.getElementById('consciousnessModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

window.showConsciousnessInfo = showConsciousnessInfo;

// ============================================
// CHECKLIST DIÁRIO - INTEGRAÇÃO NA DASHBOARD
// ============================================

let checklistDailyInitialized = false;

async function openChecklistModal() {
    if (!currentUser) return;
    
    const modalElement = document.getElementById('checklistModal');
    const modal = new bootstrap.Modal(modalElement);
    const content = document.getElementById('checklistDailyContent');
    
    if (!checklistDailyInitialized) {
        // Carregar o HTML do checklist diário
        await loadChecklistDailyHTML(content);
        checklistDailyInitialized = true;
        
        // Adicionar listener uma única vez
        modalElement.addEventListener('shown.bs.modal', function() {
            initChecklistDaily();
        }, { once: false });
    }
    
    // Mostrar modal
    modal.show();
    
    // Se já foi inicializado, reinicializar ao abrir
    if (checklistDailyInitialized) {
        setTimeout(() => {
            initChecklistDaily();
        }, 300);
    }
}

async function loadChecklistDailyHTML(container) {
    // HTML do Checklist Diário adaptado para modal
    container.innerHTML = `
        <div class="row g-4">
            <!-- Coluna Principal - Formulário e Checklist -->
            <div class="col-lg-8">
                <!-- Formulário de Registro -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h3 class="mb-0">Registrar Dia</h3>
                    </div>
                    <div class="card-body">
                        <form id="entryForm">
                            <div class="mb-3">
                                <label for="date" class="form-label">Data</label>
                                <input type="date" class="form-control" id="date" required />
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-8">
                                    <label for="minutes" class="form-label">Minutos sem vídeos hoje</label>
                                    <input type="number" class="form-control" id="minutes" min="0" placeholder="ex: 120" required />
                                </div>
                                <div class="col-md-4">
                                    <label for="craving" class="form-label">Intensidade do desejo</label>
                                    <select class="form-select" id="craving">
                                        <option value="0">0 - Nenhum</option>
                                        <option value="1">1 - Fraco</option>
                                        <option value="2">2 - Moderado</option>
                                        <option value="3">3 - Forte</option>
                                        <option value="4">4 - Muito forte</option>
                                    </select>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label for="mood" class="form-label">Humor</label>
                                <input type="text" class="form-control" id="mood" placeholder="ex: Produtivo, Ansioso..." />
                            </div>

                            <div class="mb-3">
                                <label for="notes" class="form-label">Anotações / Estratégias</label>
                                <textarea class="form-control" id="notes" rows="3" placeholder="O que funcionou hoje? Quais gatilhos?"></textarea>
                            </div>

                            <div class="d-flex gap-2">
                                <button class="btn btn-primary" type="submit">
                                    <i class="bi bi-save me-2"></i>Salvar dia
                                </button>
                                <button class="btn btn-outline-danger" type="button" id="clearDayBtn">
                                    <i class="bi bi-trash me-2"></i>Limpar Dia
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Checklist de Atividades -->
                <div class="card mb-4">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h3 class="mb-0">Atividades do Dia</h3>
                            <span id="checklistPercentage" class="badge bg-primary fs-6 px-3 py-2">0%</span>
                        </div>
                        <div class="progress mb-3" style="height: 20px;">
                            <div id="checklistProgressBar" class="progress-bar" role="progressbar" style="width: 0%">0%</div>
                        </div>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" id="newTaskInput" placeholder="O que você vai fazer hoje?">
                            <button class="btn btn-primary" id="addTaskBtn" onclick="addChecklistDailyTask()">
                                <i class="bi bi-plus-lg"></i> Adicionar
                            </button>
                        </div>
                        <ul id="tasksList" class="list-group list-group-flush">
                            <!-- Tarefas serão inseridas via JavaScript -->
                        </ul>
                    </div>
                </div>

                <!-- Estatísticas -->
                <div class="card mb-4">
                    <div class="card-body">
                        <h4 class="mb-3">Estatísticas</h4>
                        <div class="row g-3">
                            <div class="col-md-6 col-lg-3">
                                <div class="text-center p-3 border rounded">
                                    <div class="small text-muted mb-1">Total de dias registrados</div>
                                    <div id="totalDays" class="h4 mb-0 text-primary">0</div>
                                </div>
                            </div>
                            <div class="col-md-6 col-lg-3">
                                <div class="text-center p-3 border rounded">
                                    <div class="small text-muted mb-1">Minutos totais sem vídeos</div>
                                    <div id="totalMinutes" class="h4 mb-0 text-info">0</div>
                                </div>
                            </div>
                            <div class="col-md-6 col-lg-3">
                                <div class="text-center p-3 border rounded">
                                    <div class="small text-muted mb-1">Maior sequência (dias)</div>
                                    <div id="bestStreak" class="h4 mb-0 text-warning">0</div>
                                </div>
                            </div>
                            <div class="col-md-6 col-lg-3">
                                <div class="text-center p-3 border rounded">
                                    <div class="small text-muted mb-1">Média diária (min)</div>
                                    <div id="avgMinutes" class="h4 mb-0 text-success">0</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Gráfico Semanal -->
                <div class="card">
                    <div class="card-body">
                        <h4 class="mb-3">Gráfico semanal (últimos 7 dias)</h4>
                        <canvas id="chart" width="600" height="120"></canvas>
                    </div>
                </div>
            </div>

            <!-- Coluna Lateral - Lista de Entradas -->
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h3 class="mb-0">Entradas</h3>
                        <small class="text-muted">Edite ou remova dias registrados</small>
                    </div>
                    <div class="card-body">
                        <div id="entriesList" style="max-height: 600px; overflow-y: auto;">
                            <!-- Entradas serão inseridas via JavaScript -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Variáveis globais para o Checklist Diário
let checklistDailyTasks = [];
let checklistDailyTaskIdCounter = 1;
let checklistDailyEntries = [];
let checklistDailyEditingId = null;

async function initChecklistDaily() {
    if (!currentUser) return;
    
    // Inicializar data com hoje
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = getBrasiliaDate();
        dateInput.value = `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
    }
    
    // Carregar dados do db.json
    await loadChecklistDailyData();
    
    // Inicializar formulário
    initChecklistDailyEntryForm();
    
    // Renderizar tarefas e entradas
    renderChecklistDailyTasks();
    renderChecklistDailyEntries();
    updateChecklistDailyPercentage();
    updateChecklistDailyStats();
    
    // Adiciona evento de Enter no input
    const input = document.getElementById('newTaskInput');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addChecklistDailyTask();
            }
        });
    }
    
    // Redimensiona gráfico quando necessário
    window.addEventListener('resize', () => drawChecklistDailyChart());
    
    // Desenha gráfico após um pequeno delay
    setTimeout(() => drawChecklistDailyChart(), 100);
}

async function loadChecklistDailyData() {
    if (!currentUser) return;
    
    const API_URL = 'http://localhost:3000';
    const today = getBrasiliaDate();
    const dateKey = `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
    
    try {
        // Carregar tarefas do dia atual
        const progressResponse = await fetch(`${API_URL}/checklistProgress?userId=${currentUser.id}&date=${dateKey}`);
        if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            if (progressData.length > 0 && progressData[0].tasks) {
                checklistDailyTasks = progressData[0].tasks;
                checklistDailyTaskIdCounter = Math.max(...checklistDailyTasks.map(t => t.id || 0), 0) + 1;
            } else {
                checklistDailyTasks = [];
                checklistDailyTaskIdCounter = 1;
            }
        }
        
        // Carregar todas as entradas do usuário
        const entriesResponse = await fetch(`${API_URL}/checklistProgress?userId=${currentUser.id}`);
        if (entriesResponse.ok) {
            const allProgress = await entriesResponse.json();
            checklistDailyEntries = allProgress.map(p => ({
                id: p.id,
                date: p.date,
                minutes: p.minutes || 0,
                craving: p.craving || 0,
                mood: p.mood || '',
                notes: p.notes || '',
                percentage: p.percentage || 0,
                points: p.points || 0
            })).sort((a, b) => b.date.localeCompare(a.date));
        }
    } catch (e) {
        console.error('[ChecklistDaily] Erro ao carregar dados:', e);
        checklistDailyTasks = [];
        checklistDailyEntries = [];
        checklistDailyTaskIdCounter = 1;
    }
}

function initChecklistDailyEntryForm() {
    const form = document.getElementById('entryForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveChecklistDailyEntry();
    });
    
    const clearBtn = document.getElementById('clearDayBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
            if (confirm('Deseja realmente limpar o dia atual?')) {
                await clearChecklistDailyDay();
            }
        });
    }
}

async function saveChecklistDailyEntry() {
    if (!currentUser) return;
    
    const dateInput = document.getElementById('date');
    const minutesInput = document.getElementById('minutes');
    const cravingInput = document.getElementById('craving');
    const moodInput = document.getElementById('mood');
    const notesInput = document.getElementById('notes');
    
    if (!dateInput || !minutesInput) return;
    
    const date = dateInput.value;
    const minutes = Number(minutesInput.value) || 0;
    const craving = Number(cravingInput?.value) || 0;
    const mood = moodInput?.value.trim() || '';
    const notes = notesInput?.value.trim() || '';
    
    if (!date) {
        showNotification('Escolha uma data', 'warning');
        return;
    }
    
    // Calcular porcentagem e pontos baseado nas tarefas
    const completed = checklistDailyTasks.filter(t => t.completed).length;
    const total = checklistDailyTasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const points = calculateChecklistDailyPoints(percentage);
    
    const entryData = {
        userId: currentUser.id,
        date: date,
        minutes: minutes,
        craving: craving,
        mood: mood,
        notes: notes,
        tasks: checklistDailyTasks,
        percentage: percentage,
        points: points,
        savedAt: Date.now()
    };
    
    try {
        const API_URL = 'http://localhost:3000';
        
        // Verificar se já existe entrada para esta data
        const existingResponse = await fetch(`${API_URL}/checklistProgress?userId=${currentUser.id}&date=${date}`);
        if (existingResponse.ok) {
            const existing = await existingResponse.json();
            
            if (existing.length > 0) {
                // Atualizar existente
                await fetch(`${API_URL}/checklistProgress/${existing[0].id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...existing[0], ...entryData })
                });
            } else {
                // Criar novo
                await fetch(`${API_URL}/checklistProgress`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entryData)
                });
            }
        }
        
        // Atualizar pontuação total do usuário
        if (points > 0) {
            currentUser.points = (currentUser.points || 0) + points;
            await saveDatabase();
            checkAndUnlockAchievements();
        }
        
        // Recarregar dados
        await loadChecklistDailyData();
        renderChecklistDailyEntries();
        updateChecklistDailyStats();
        drawChecklistDailyChart();
        
        showNotification(`Dia salvo com sucesso! ${points > 0 ? `+${points} pontos` : ''}`, 'success');
        
        // Reset form
        form.reset();
        if (dateInput) {
            const today = getBrasiliaDate();
            dateInput.value = `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
        }
        if (minutesInput) minutesInput.value = '';
        if (cravingInput) cravingInput.value = '0';
        if (moodInput) moodInput.value = '';
        if (notesInput) notesInput.value = '';
        checklistDailyEditingId = null;
    } catch (e) {
        console.error('[ChecklistDaily] Erro ao salvar:', e);
        showNotification('Erro ao salvar o dia. Tente novamente.', 'error');
    }
}

function calculateChecklistDailyPoints(percentage) {
    if (percentage === 100) return 10;
    if (percentage >= 75) return 7;
    if (percentage >= 50) return 5;
    if (percentage >= 25) return 3;
    return 0;
}

async function clearChecklistDailyDay() {
    if (!currentUser) return;
    
    const today = getBrasiliaDate();
    const dateKey = `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
    
    checklistDailyTasks = [];
    checklistDailyTaskIdCounter = 1;
    
    try {
        const API_URL = 'http://localhost:3000';
        
        // Remover do db.json
        const response = await fetch(`${API_URL}/checklistProgress?userId=${currentUser.id}&date=${dateKey}`);
        if (response.ok) {
            const existing = await response.json();
            if (existing.length > 0) {
                await fetch(`${API_URL}/checklistProgress/${existing[0].id}`, {
                    method: 'DELETE'
                });
            }
        }
        
        renderChecklistDailyTasks();
        updateChecklistDailyPercentage();
        showNotification('Dia limpo com sucesso!', 'success');
    } catch (e) {
        console.error('[ChecklistDaily] Erro ao limpar:', e);
        showNotification('Erro ao limpar o dia. Tente novamente.', 'error');
    }
}

async function addChecklistDailyTask() {
    const input = document.getElementById('newTaskInput');
    if (!input || !input.value.trim()) return;
    
    const taskText = input.value.trim();
    input.value = '';
    
    const newTask = {
        id: checklistDailyTaskIdCounter++,
        text: taskText,
        completed: false
    };
    
    checklistDailyTasks.push(newTask);
    renderChecklistDailyTasks();
    updateChecklistDailyPercentage();
}

async function toggleChecklistDailyTask(id) {
    const task = checklistDailyTasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        renderChecklistDailyTasks();
        updateChecklistDailyPercentage();
    }
}

async function deleteChecklistDailyTask(id) {
    checklistDailyTasks = checklistDailyTasks.filter(t => t.id !== id);
    renderChecklistDailyTasks();
    updateChecklistDailyPercentage();
}

function renderChecklistDailyTasks() {
    const list = document.getElementById('tasksList');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (checklistDailyTasks.length === 0) {
        list.innerHTML = '<li class="list-group-item text-center text-muted">Nenhuma tarefa ainda. Adicione uma nova tarefa acima!</li>';
        return;
    }
    
    checklistDailyTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `list-group-item checklist-item ${task.completed ? 'completed' : ''}`;
        li.style.cursor = 'pointer';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'form-check-input me-2';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleChecklistDailyTask(task.id));
        
        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;
        if (task.completed) {
            taskText.style.textDecoration = 'line-through';
            taskText.style.opacity = '0.6';
        }
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger ms-auto';
        deleteBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteChecklistDailyTask(task.id);
        });
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';
        actionsDiv.appendChild(deleteBtn);
        
        li.appendChild(checkbox);
        li.appendChild(taskText);
        li.appendChild(actionsDiv);
        
        list.appendChild(li);
    });
}

function updateChecklistDailyPercentage() {
    const completed = checklistDailyTasks.filter(t => t.completed).length;
    const total = checklistDailyTasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const percentageEl = document.getElementById('checklistPercentage');
    const progressBar = document.getElementById('checklistProgressBar');
    
    if (percentageEl) {
        percentageEl.textContent = `${percentage}%`;
    }
    
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
        progressBar.textContent = `${percentage}%`;
    }
}

function renderChecklistDailyEntries() {
    const list = document.getElementById('entriesList');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (checklistDailyEntries.length === 0) {
        list.innerHTML = '<div class="text-center text-muted p-3">Nenhuma entrada ainda. Registre seu primeiro dia acima!</div>';
        return;
    }
    
    checklistDailyEntries.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'card mb-2';
        div.innerHTML = `
            <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <div class="fw-bold">${entry.date}</div>
                        <small class="text-muted">${entry.minutes} min • desejo ${entry.craving} • ${entry.mood || '—'}</small>
                        <div class="mt-1">
                            <span class="badge bg-primary">${entry.percentage}%</span>
                            <span class="badge bg-success">${entry.points} pts</span>
                        </div>
                    </div>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary btn-sm" onclick="editChecklistDailyEntry('${entry.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteChecklistDailyEntry('${entry.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                ${entry.notes ? `<div class="small text-muted mt-2">${entry.notes.replace(/\n/g, '<br>')}</div>` : ''}
            </div>
        `;
        list.appendChild(div);
    });
}

async function editChecklistDailyEntry(id) {
    const entry = checklistDailyEntries.find(e => e.id.toString() === id.toString());
    if (!entry) return;
    
    checklistDailyEditingId = id;
    
    const dateInput = document.getElementById('date');
    const minutesInput = document.getElementById('minutes');
    const cravingInput = document.getElementById('craving');
    const moodInput = document.getElementById('mood');
    const notesInput = document.getElementById('notes');
    
    if (dateInput) dateInput.value = entry.date;
    if (minutesInput) minutesInput.value = entry.minutes;
    if (cravingInput) cravingInput.value = entry.craving;
    if (moodInput) moodInput.value = entry.mood || '';
    if (notesInput) notesInput.value = entry.notes || '';
    
    // Carregar tarefas do dia
    const API_URL = 'http://localhost:3000';
    try {
        const response = await fetch(`${API_URL}/checklistProgress/${id}`);
        if (response.ok) {
            const data = await response.json();
            if (data.tasks) {
                checklistDailyTasks = data.tasks;
                checklistDailyTaskIdCounter = Math.max(...checklistDailyTasks.map(t => t.id || 0), 0) + 1;
                renderChecklistDailyTasks();
                updateChecklistDailyPercentage();
            }
        }
    } catch (e) {
        console.error('[ChecklistDaily] Erro ao carregar para edição:', e);
    }
}

async function deleteChecklistDailyEntry(id) {
    if (!confirm('Remover este registro?')) return;
    
    try {
        const API_URL = 'http://localhost:3000';
        await fetch(`${API_URL}/checklistProgress/${id}`, {
            method: 'DELETE'
        });
        
        await loadChecklistDailyData();
        renderChecklistDailyEntries();
        updateChecklistDailyStats();
        drawChecklistDailyChart();
        
        showNotification('Registro removido com sucesso!', 'success');
    } catch (e) {
        console.error('[ChecklistDaily] Erro ao remover:', e);
        showNotification('Erro ao remover registro. Tente novamente.', 'error');
    }
}

function updateChecklistDailyStats() {
    const totalDays = checklistDailyEntries.length;
    const totalMinutes = checklistDailyEntries.reduce((sum, e) => sum + (Number(e.minutes) || 0), 0);
    const avgMinutes = totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0;
    const bestStreak = calcChecklistDailyBestStreak();
    
    const totalDaysEl = document.getElementById('totalDays');
    const totalMinutesEl = document.getElementById('totalMinutes');
    const avgMinutesEl = document.getElementById('avgMinutes');
    const bestStreakEl = document.getElementById('bestStreak');
    
    if (totalDaysEl) totalDaysEl.textContent = totalDays;
    if (totalMinutesEl) totalMinutesEl.textContent = totalMinutes;
    if (avgMinutesEl) avgMinutesEl.textContent = avgMinutes;
    if (bestStreakEl) bestStreakEl.textContent = bestStreak;
}

function calcChecklistDailyBestStreak() {
    if (checklistDailyEntries.length === 0) return 0;
    
    const set = new Set(checklistDailyEntries.filter(e => Number(e.minutes) > 0).map(e => e.date));
    const dates = Array.from(new Set(checklistDailyEntries.map(e => e.date))).sort();
    
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

function drawChecklistDailyChart() {
    const chart = document.getElementById('chart');
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
        const entry = checklistDailyEntries.find(e => e.date === key);
        last7.push({ date: key, minutes: entry ? Number(entry.minutes) || 0 : 0 });
    }
    
    const max = Math.max(...last7.map(x => x.minutes), 1);
    const pad = 20 * (window.devicePixelRatio || 1);
    const areaW = w - pad * 2;
    const barW = areaW / 7 * 0.7;
    
    last7.forEach((d, i) => {
        const x = pad + i * (areaW / 7) + (areaW / 7 - barW) / 2;
        const barH = (d.minutes / max) * (areaH - pad * 2);
        const y = h - pad - barH;
        
        const isDark = document.documentElement.classList.contains('dark');
        
        if (isDark) {
            ctx.fillStyle = 'rgba(96, 165, 250, 1)';
            ctx.shadowColor = 'rgba(96, 165, 250, 0.5)';
            ctx.shadowBlur = 4;
        } else {
            ctx.fillStyle = 'rgba(96, 165, 250, 0.9)';
            ctx.shadowBlur = 0;
        }
        
        ctx.fillRect(x, y, barW, barH);
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 0.7)';
        ctx.font = 'bold ' + (11 * (window.devicePixelRatio || 1)) + 'px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(d.date.slice(5), x + barW / 2, h - pad / 2);
    });
}

// Disponibilizar funções globalmente
window.openChecklistModal = openChecklistModal;
window.addChecklistDailyTask = addChecklistDailyTask;
window.editChecklistDailyEntry = editChecklistDailyEntry;
window.deleteChecklistDailyEntry = deleteChecklistDailyEntry;

// ============================================
// PROGRESSO DIÁRIO - FUNCIONALIDADES
// ============================================

async function openProgressDailyModal() {
    if (!currentUser) return;
    
    const modal = new bootstrap.Modal(document.getElementById('progressDailyModal'));
    await loadProgressDaily();
    modal.show();
}

async function loadProgressDaily() {
    if (!currentUser) return;
    
    const today = getBrasiliaDate();
    const dateKey = `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
    
    try {
        const API_URL = 'http://localhost:3000';
        
        // Carregar progresso do checklist do dia
        let checklistProgress = null;
        try {
            const response = await fetch(`${API_URL}/checklistProgress?userId=${currentUser.id}&date=${dateKey}`);
            if (response.ok) {
                const allProgress = await response.json();
                checklistProgress = allProgress.find(p => p.date === dateKey);
            }
        } catch (apiError) {
            console.warn('[Progress] Erro ao carregar checklist:', apiError);
        }
        
        const percentage = checklistProgress ? checklistProgress.percentage : 0;
        const points = checklistProgress ? checklistProgress.points : 0;
        const status = getDayStatus(percentage);
        
        const content = document.getElementById('progressDailyContent');
        if (content) {
            content.innerHTML = `
                <div class="row g-3 mb-4">
                    <div class="col-md-4">
                        <div class="card text-center p-4">
                            <div class="h2 mb-2 text-primary">${percentage}%</div>
                            <small class="text-muted">Conclusão</small>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card text-center p-4">
                            <div class="h2 mb-2 text-warning">${points}</div>
                            <small class="text-muted">Pontos do Dia</small>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card text-center p-4">
                            <div class="h2 mb-2 text-${status.color}">${status.icon}</div>
                            <small class="text-muted">${status.text}</small>
                        </div>
                    </div>
                </div>
                <div class="progress mb-3" style="height: 30px;">
                    <div class="progress-bar bg-gradient" role="progressbar" style="width: ${percentage}%">
                        ${percentage}%
                    </div>
                </div>
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    <strong>Data:</strong> ${dateKey}<br>
                    <strong>Pontuação Total:</strong> ${currentUser.points || 0} pts
                </div>
            `;
        }
    } catch (e) {
        console.error('[Progress] Erro ao carregar:', e);
    }
}

function getDayStatus(percentage) {
    if (percentage === 100) return { text: 'Concluído', icon: '✅', color: 'success' };
    if (percentage >= 75) return { text: 'Quase lá', icon: '🔥', color: 'warning' };
    if (percentage >= 50) return { text: 'Em progresso', icon: '📈', color: 'info' };
    if (percentage >= 25) return { text: 'Iniciado', icon: '🌱', color: 'primary' };
    return { text: 'Incompleto', icon: '⏳', color: 'secondary' };
}

// ============================================
// PROGRESSO AO LONGO DO TEMPO - FUNCIONALIDADES
// ============================================

async function openProgressTimeModal() {
    if (!currentUser) return;
    
    const modal = new bootstrap.Modal(document.getElementById('progressTimeModal'));
    await loadProgressTime();
    modal.show();
}

async function loadProgressTime() {
    if (!currentUser) return;
    
    try {
        const API_URL = 'http://localhost:3000';
        
        // Carregar todo o histórico do checklist
        let allProgress = [];
        try {
            const response = await fetch(`${API_URL}/checklistProgress?userId=${currentUser.id}`);
            if (response.ok) {
                allProgress = await response.json();
                allProgress.sort((a, b) => a.date.localeCompare(b.date));
            }
        } catch (apiError) {
            console.warn('[ProgressTime] Erro ao carregar:', apiError);
        }
        
        if (allProgress.length === 0) {
            const content = document.getElementById('progressTimeContent');
            if (content) {
                content.innerHTML = '<div class="alert alert-info">Ainda não há histórico de progresso. Complete alguns dias para ver sua evolução!</div>';
            }
            return;
        }
        
        // Calcular estatísticas
        const percentages = allProgress.map(p => p.percentage);
        const avgPercentage = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
        const trend = calculateTrend(percentages);
        const regularity = calculateRegularity(allProgress);
        
        // Criar gráfico simples
        const chartData = allProgress.slice(-14); // Últimos 14 dias
        
        const content = document.getElementById('progressTimeContent');
        if (content) {
            content.innerHTML = `
                <div class="row g-3 mb-4">
                    <div class="col-md-4">
                        <div class="card text-center p-3">
                            <div class="h4 mb-2 text-primary">${avgPercentage}%</div>
                            <small class="text-muted">Média de Conclusão</small>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card text-center p-3">
                            <div class="h4 mb-2 text-${trend.color}">${trend.icon}</div>
                            <small class="text-muted">${trend.text}</small>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card text-center p-3">
                            <div class="h4 mb-2 text-info">${regularity}%</div>
                            <small class="text-muted">Regularidade</small>
                        </div>
                    </div>
                </div>
                <div class="card mb-3">
                    <div class="card-body">
                        <h6 class="card-title">Últimos 14 dias</h6>
                        <canvas id="progressTimeChart" width="600" height="200"></canvas>
                    </div>
                </div>
                <div class="list-group">
                    ${chartData.map(p => `
                        <div class="list-group-item d-flex justify-content-between align-items-center">
                            <span>${p.date}</span>
                            <span class="badge bg-${p.percentage === 100 ? 'success' : p.percentage >= 50 ? 'warning' : 'secondary'}">
                                ${p.percentage}%
                            </span>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Desenhar gráfico após um delay
            setTimeout(() => drawProgressTimeChart(chartData), 100);
        }
    } catch (e) {
        console.error('[ProgressTime] Erro ao carregar:', e);
    }
}

function calculateTrend(percentages) {
    if (percentages.length < 2) return { text: 'Sem dados suficientes', icon: '📊', color: 'secondary' };
    
    const recent = percentages.slice(-7);
    const older = percentages.slice(-14, -7);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 5) return { text: 'Melhorando', icon: '📈', color: 'success' };
    if (diff < -5) return { text: 'Precisa atenção', icon: '📉', color: 'danger' };
    return { text: 'Estável', icon: '➡️', color: 'info' };
}

function calculateRegularity(progress) {
    if (progress.length === 0) return 0;
    
    // Calcular quantos dias únicos foram registrados nos últimos 30 dias
    const today = getBrasiliaDate();
    const thirtyDaysAgo = new Date(today.year, today.month - 1, today.day - 30);
    
    const uniqueDates = new Set(progress.map(p => p.date));
    const daysWithProgress = Array.from(uniqueDates).filter(date => {
        const d = new Date(date);
        return d >= thirtyDaysAgo;
    }).length;
    
    return Math.round((daysWithProgress / 30) * 100);
}

function drawProgressTimeChart(data) {
    const canvas = document.getElementById('progressTimeChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const w = canvas.width = rect.width * (window.devicePixelRatio || 1);
    const h = canvas.height = 200 * (window.devicePixelRatio || 1);
    
    ctx.clearRect(0, 0, w, h);
    
    if (data.length === 0) return;
    
    const max = 100;
    const pad = 30 * (window.devicePixelRatio || 1);
    const areaW = w - pad * 2;
    const areaH = h - pad * 2;
    
    // Desenhar linha
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 2 * (window.devicePixelRatio || 1);
    ctx.beginPath();
    
    data.forEach((d, i) => {
        const x = pad + (i / (data.length - 1 || 1)) * areaW;
        const y = pad + areaH - (d.percentage / max) * areaH;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Desenhar pontos
    data.forEach((d, i) => {
        const x = pad + (i / (data.length - 1 || 1)) * areaW;
        const y = pad + areaH - (d.percentage / max) * areaH;
        
        ctx.fillStyle = d.percentage === 100 ? 'hsl(var(--success))' : 
                       d.percentage >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--secondary))';
        ctx.beginPath();
        ctx.arc(x, y, 4 * (window.devicePixelRatio || 1), 0, Math.PI * 2);
        ctx.fill();
    });
}

// ============================================
// MURAL DE CONQUISTAS - FUNCIONALIDADES
// ============================================

async function openAchievementsModal() {
    if (!currentUser) return;
    
    const modal = new bootstrap.Modal(document.getElementById('achievementsModal'));
    await loadAchievements();
    modal.show();
}

async function loadAchievements() {
    if (!currentUser) return;
    
    try {
        const API_URL = 'http://localhost:3000';
        
        // Carregar conquistas do usuário
        let userAchievements = currentUser.achievements || [];
        
        // Verificar e desbloquear novas conquistas
        await checkAndUnlockAchievements();
        
        // Recarregar após verificação
        if (currentUser.achievements) {
            userAchievements = currentUser.achievements;
        }
        
        // Definir todas as conquistas possíveis
        const allAchievements = [
            {
                id: 'first_routine',
                title: 'Primeira Rotina',
                description: 'Complete sua primeira rotina diária',
                icon: '🌱',
                unlocked: userAchievements.some(a => a.id === 'first_routine')
            },
            {
                id: 'perfect_day',
                title: 'Dia Perfeito',
                description: 'Complete 100% de um dia',
                icon: '⭐',
                unlocked: userAchievements.some(a => a.id === 'perfect_day')
            },
            {
                id: 'week_streak',
                title: 'Semana de Ouro',
                description: 'Complete 7 dias consecutivos',
                icon: '🔥',
                unlocked: userAchievements.some(a => a.id === 'week_streak')
            },
            {
                id: 'points_100',
                title: 'Centenário',
                description: 'Acumule 100 pontos',
                icon: '💯',
                unlocked: userAchievements.some(a => a.id === 'points_100')
            },
            {
                id: 'points_500',
                title: 'Mestre',
                description: 'Acumule 500 pontos',
                icon: '🏆',
                unlocked: userAchievements.some(a => a.id === 'points_500')
            },
            {
                id: 'month_complete',
                title: 'Mês Completo',
                description: 'Complete 30 dias de rotina',
                icon: '📅',
                unlocked: userAchievements.some(a => a.id === 'month_complete')
            }
        ];
        
        const content = document.getElementById('achievementsContent');
        if (content) {
            content.innerHTML = `
                <div class="row g-3">
                    ${allAchievements.map(ach => `
                        <div class="col-md-6">
                            <div class="card ${ach.unlocked ? '' : 'opacity-50'}" style="border: 2px solid ${ach.unlocked ? 'hsl(var(--primary))' : 'hsl(var(--border))'};">
                                <div class="card-body text-center">
                                    <div class="h1 mb-2">${ach.unlocked ? ach.icon : '🔒'}</div>
                                    <h6 class="card-title">${ach.title}</h6>
                                    <p class="card-text small text-muted">${ach.description}</p>
                                    ${ach.unlocked && userAchievements.find(a => a.id === ach.id) ? 
                                        `<small class="text-muted">Desbloqueado em ${new Date(userAchievements.find(a => a.id === ach.id).unlockedAt).toLocaleDateString('pt-BR')}</small>` : 
                                        '<small class="text-muted">Bloqueado</small>'
                                    }
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (e) {
        console.error('[Achievements] Erro ao carregar:', e);
    }
}

async function checkAndUnlockAchievements() {
    if (!currentUser) return;
    
    try {
        const API_URL = 'http://localhost:3000';
        
        // Carregar progresso do checklist
        let allProgress = [];
        try {
            const response = await fetch(`${API_URL}/checklistProgress?userId=${currentUser.id}`);
            if (response.ok) {
                allProgress = await response.json();
            }
        } catch (apiError) {
            console.warn('[Achievements] Erro ao carregar progresso:', apiError);
        }
        
        if (!currentUser.achievements) {
            currentUser.achievements = [];
        }
        
        const unlocked = currentUser.achievements.map(a => a.id);
        const newAchievements = [];
        
        // Verificar Primeira Rotina
        if (!unlocked.includes('first_routine') && allProgress.length > 0) {
            newAchievements.push({
                id: 'first_routine',
                unlockedAt: Date.now()
            });
        }
        
        // Verificar Dia Perfeito
        if (!unlocked.includes('perfect_day') && allProgress.some(p => p.percentage === 100)) {
            newAchievements.push({
                id: 'perfect_day',
                unlockedAt: Date.now()
            });
        }
        
        // Verificar Semana de Ouro (7 dias consecutivos)
        if (!unlocked.includes('week_streak')) {
            const sortedProgress = allProgress.sort((a, b) => a.date.localeCompare(b.date));
            let streak = 0;
            let maxStreak = 0;
            let prevDate = null;
            
            sortedProgress.forEach(p => {
                if (p.percentage === 100) {
                    const currentDate = new Date(p.date);
                    if (prevDate) {
                        const diff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
                        if (diff === 1) {
                            streak++;
                        } else {
                            streak = 1;
                        }
                    } else {
                        streak = 1;
                    }
                    prevDate = currentDate;
                    maxStreak = Math.max(maxStreak, streak);
                } else {
                    streak = 0;
                }
            });
            
            if (maxStreak >= 7) {
                newAchievements.push({
                    id: 'week_streak',
                    unlockedAt: Date.now()
                });
            }
        }
        
        // Verificar Pontos
        const totalPoints = currentUser.points || 0;
        if (!unlocked.includes('points_100') && totalPoints >= 100) {
            newAchievements.push({
                id: 'points_100',
                unlockedAt: Date.now()
            });
        }
        
        if (!unlocked.includes('points_500') && totalPoints >= 500) {
            newAchievements.push({
                id: 'points_500',
                unlockedAt: Date.now()
            });
        }
        
        // Verificar Mês Completo
        if (!unlocked.includes('month_complete') && allProgress.length >= 30) {
            newAchievements.push({
                id: 'month_complete',
                unlockedAt: Date.now()
            });
        }
        
        // Adicionar novas conquistas
        if (newAchievements.length > 0) {
            currentUser.achievements = [...currentUser.achievements, ...newAchievements];
            await saveDatabase();
            
            // Mostrar notificação para cada conquista
            newAchievements.forEach(ach => {
                const achInfo = {
                    'first_routine': { title: 'Primeira Rotina', icon: '🌱' },
                    'perfect_day': { title: 'Dia Perfeito', icon: '⭐' },
                    'week_streak': { title: 'Semana de Ouro', icon: '🔥' },
                    'points_100': { title: 'Centenário', icon: '💯' },
                    'points_500': { title: 'Mestre', icon: '🏆' },
                    'month_complete': { title: 'Mês Completo', icon: '📅' }
                }[ach.id];
                
                if (achInfo) {
                    showNotification(`🎉 Conquista desbloqueada: ${achInfo.icon} ${achInfo.title}!`, 'success');
                }
            });
        }
    } catch (e) {
        console.error('[Achievements] Erro ao verificar:', e);
    }
}

// ============================================
// COMPARTILHAMENTO - FUNCIONALIDADES
// ============================================

async function openShareModal() {
    if (!currentUser) return;
    
    const modal = new bootstrap.Modal(document.getElementById('shareModal'));
    await loadShareContent();
    modal.show();
}

async function loadShareContent() {
    if (!currentUser) return;
    
    const today = getBrasiliaDate();
    const dateKey = `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`;
    
    try {
        const API_URL = 'http://localhost:3000';
        
        // Carregar progresso do dia
        let checklistProgress = null;
        try {
            const response = await fetch(`${API_URL}/checklistProgress?userId=${currentUser.id}&date=${dateKey}`);
            if (response.ok) {
                const allProgress = await response.json();
                checklistProgress = allProgress.find(p => p.date === dateKey);
            }
        } catch (apiError) {
            console.warn('[Share] Erro ao carregar progresso:', apiError);
        }
        
        const percentage = checklistProgress ? checklistProgress.percentage : 0;
        const totalPoints = currentUser.points || 0;
        
        const shareMessage = `🎯 Progresso de Hoje - Desliga AI

📅 Data: ${dateKey}
✅ Conclusão: ${percentage}%
🔥 Pontuação Total: ${totalPoints} pts

Reconquiste seu tempo! 💪`;

        const content = document.getElementById('shareContent');
        if (content) {
            content.innerHTML = `
                <div class="mb-3">
                    <label class="form-label">Mensagem para compartilhar:</label>
                    <textarea class="form-control" id="shareMessageText" rows="6" readonly>${shareMessage}</textarea>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-primary" onclick="copyShareMessage()">
                        <i class="bi bi-clipboard me-2"></i>Copiar Mensagem
                    </button>
                    <button class="btn btn-outline-primary" onclick="shareNative()">
                        <i class="bi bi-share me-2"></i>Compartilhar
                    </button>
                </div>
            `;
        }
    } catch (e) {
        console.error('[Share] Erro ao carregar:', e);
    }
}

function copyShareMessage() {
    const textarea = document.getElementById('shareMessageText');
    if (textarea) {
        textarea.select();
        document.execCommand('copy');
        showNotification('Mensagem copiada para a área de transferência!', 'success');
    }
}

async function shareNative() {
    const textarea = document.getElementById('shareMessageText');
    if (textarea && navigator.share) {
        try {
            await navigator.share({
                text: textarea.value
            });
        } catch (e) {
            if (e.name !== 'AbortError') {
                copyShareMessage();
            }
        }
    } else {
        copyShareMessage();
    }
}

// Disponibilizar funções globalmente (já declaradas acima)
window.openProgressDailyModal = openProgressDailyModal;
window.openProgressTimeModal = openProgressTimeModal;
window.openAchievementsModal = openAchievementsModal;
window.openShareModal = openShareModal;
window.copyShareMessage = copyShareMessage;
window.shareNative = shareNative;
