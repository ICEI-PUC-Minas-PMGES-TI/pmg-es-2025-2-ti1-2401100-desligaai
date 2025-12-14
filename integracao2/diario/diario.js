// ============================================
// VARIÁVEIS E INICIALIZAÇÃO DE ELEMENTOS
// ============================================
const REFLEXOES_KEY = 'desligaAi_reflexoes';
const THEME_KEY = 'theme';
const ACHIEVEMENTS_STATS_KEY = 'desligaAI_achievements_stats';

// Obtendo elementos do DOM (É crucial que os IDs no HTML sejam exatos)
const themeToggle = document.getElementById('themeToggle');
const reflexaoForm = document.getElementById('reflexaoForm');
const reflexaoTexto = document.getElementById('reflexaoTexto');
const entriesList = document.getElementById('entriesList');

// ------------------------------------------
// Lógica de Tema (Alternância e Persistência)
// ------------------------------------------

/**
 * 🌙 Alterna a classe 'dark' no elemento HTML e salva a preferência.
 */
function toggleTheme() {
    // Alterna a classe 'dark' no <html>
    const isDark = document.documentElement.classList.toggle('dark');
    
    // Salva a preferência
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    
    // Altera a cor de fundo do body imediatamente (ajuda na transição)
    document.body.classList.toggle('bg-dark', isDark);
}

/**
 * Carrega a preferência de tema salva ou usa a do sistema.
 */
function loadThemePreference() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('bg-dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('bg-dark');
        }
    } else if (prefersDark) {
        // Se não há preferência salva, usa a do sistema
        document.documentElement.classList.add('dark');
        document.body.classList.add('bg-dark');
    } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('bg-dark');
    }
}

// ------------------------------------------
// Integração: Botão de Perfil
// ------------------------------------------
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
        } catch (e) {
            profileBtn.classList.add('d-none');
        }
    } else {
        profileBtn.classList.add('d-none');
    }
}

function goToProfile() {
    window.location.href = '../gabriel/perfil_usuario/perfil.html';
}

function goBackToMain() {
    window.location.href = '../DELIGA 02TESTE ATUAL - Copia/index.html';
}


// ------------------------------------------
// Lógica do Diário (Persistência e Renderização)
// ------------------------------------------

function loadReflexoes() {
    const json = localStorage.getItem(REFLEXOES_KEY);
    return json ? JSON.parse(json) : [];
}

function saveReflexoes(reflexoes) {
    localStorage.setItem(REFLEXOES_KEY, JSON.stringify(reflexoes));
}

function formatarData(dateObj) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
    };
    
    const formatter = new Intl.DateTimeFormat('pt-BR', options);
    const formattedDate = formatter.format(dateObj).replace(/\s\s+/g, ' '); 
    
    const partes = formattedDate.split(' ');
    const hora = partes.pop();
    const data = partes.join(' ');
    
    return `${data} às ${hora}`;
}

function createEntryHTML(entry) {
    return `
        <div class="card bg-muted p-3 border-0 animate-fade-in-up" data-timestamp="${entry.timestamp}">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <small class="text-muted fw-bold">${formatarData(new Date(entry.timestamp))}</small>
                    <p class="mb-0 mt-1">${entry.texto}</p>
                </div>
                <button class="btn btn-sm btn-outline-danger btn-delete-entry" 
                        data-timestamp="${entry.timestamp}" 
                        aria-label="Excluir reflexão">
                    &times;
                </button>
            </div>
        </div>
    `;
}

function renderReflexoes(reflexoes) {
    const sortedReflexoes = reflexoes.sort((a, b) => b.timestamp - a.timestamp);
    
    entriesList.innerHTML = sortedReflexoes.map(createEntryHTML).join('');

    document.querySelectorAll('.btn-delete-entry').forEach(button => {
        button.addEventListener('click', deleteReflexao);
    });
    
    if (reflexoes.length === 0) {
         entriesList.innerHTML = `
            <div class="text-center p-4">
                <p class="text-muted mb-0">Nenhuma reflexão salva ainda. Comece a registrar!</p>
            </div>
         `;
    }
}

function handleFormSubmit(event) {
    event.preventDefault();

    const texto = reflexaoTexto.value.trim();

    if (texto) {
        const novaReflexao = {
            texto: texto,
            timestamp: Date.now()
        };

        const reflexoes = loadReflexoes();
        reflexoes.push(novaReflexao);
        saveReflexoes(reflexoes);

        reflexaoTexto.value = '';
        renderReflexoes(reflexoes);
        
        // ===== RASTREAR ENTRADA NO DIÁRIO PARA CONQUISTA =====
        rastrearReflexaoDiario();
    }
}

// ============================================
// SISTEMA DE RASTREAMENTO - DIÁRIO REFLEXIVO
// ============================================

function rastrearReflexaoDiario() {
    try {
        console.log('📝 Reflexão salva! Registrando para Diário Reflexivo...');
        updateAchievementStatDiario('diaryEntries', 1);
    } catch (e) {
        console.error('Erro ao rastrear reflexão:', e);
    }
}

function updateAchievementStatDiario(statName, incrementBy = 1) {
    try {
        const saved = localStorage.getItem(ACHIEVEMENTS_STATS_KEY);
        let stats = saved ? JSON.parse(saved) : {
            quizCompleted: 0,
            challengesCompleted: 0,
            timerSessions: 0,
            emotionMapUsage: 0,
            offlineActivities: 0,
            diaryEntries: 0,
            daysCompleted: 0,
            currentStreak: 0,
            earlyCompletions: 0
        };
        
        if (statName in stats) {
            stats[statName] = Math.max(0, (stats[statName] || 0) + incrementBy);
        }
        
        stats.lastUpdated = Date.now();
        localStorage.setItem(ACHIEVEMENTS_STATS_KEY, JSON.stringify(stats));
        
        console.log(`📊 Stat Diário atualizado: ${statName} = ${stats[statName]}`);
        console.log(`🎯 Faltam ${Math.max(0, 10 - stats[statName])} reflexões para desbloquear Diário Reflexivo`);
        
    } catch (e) {
        console.error('Erro ao atualizar stat diário:', e);
    }
}

function mostrarNotificacaoReflexao() {
    try {
        const stats = JSON.parse(localStorage.getItem(ACHIEVEMENTS_STATS_KEY) || '{}');
        const diaryEntries = stats.diaryEntries || 0;
        
        const notif = document.createElement('div');
        notif.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
        notif.style.zIndex = '9999';
        notif.innerHTML = `
            <strong>✨ Reflexão Salva!</strong><br>
            ${diaryEntries >= 10 ? '🎉 Parabéns! Você desbloqueou Diário Reflexivo!' : `${diaryEntries}/10 reflexões para desbloquear a conquista`}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notif);
        
        setTimeout(() => notif.remove(), 4000);
    } catch (e) {
        console.log('Notificação não disponível:', e);
    }
}

function deleteReflexao(event) {
    const timestampToDelete = parseInt(event.currentTarget.dataset.timestamp);

    let reflexoes = loadReflexoes();
    reflexoes = reflexoes.filter(entry => entry.timestamp !== timestampToDelete);
    saveReflexoes(reflexoes);

    renderReflexoes(reflexoes);
}


// ============================================
// EXECUÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrega a preferência de tema antes de tudo
    loadThemePreference();
    
    // 2. Adiciona o listener para o botão de tema
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // 3. Inicializa o diário
    renderReflexoes(loadReflexoes());

    // 4. Adiciona o listener de envio do formulário
    if (reflexaoForm) {
        reflexaoForm.addEventListener('submit', handleFormSubmit);
    }

    // 5. Integração: inicializa botão de perfil
    initProfileButton();
    
    // 6. Log do progresso da conquista
    try {
        const stats = JSON.parse(localStorage.getItem(ACHIEVEMENTS_STATS_KEY) || '{}');
        const diaryEntries = stats.diaryEntries || 0;
        console.log(`📚 Diário Reflexivo: ${diaryEntries}/10 reflexões`);
        if (diaryEntries >= 10) {
            console.log('🎉 Conquista Desbloqueada: Diário Reflexivo!');
        }
    } catch (e) {
        console.log('Não foi possível carregar estatísticas do diário');
    }
});