// =================================================================
// INTEGRAÇÃO COM BACKEND: ESPELHO DO TEMPO
// =================================================================
const API_URL = 'http://localhost:3000'; 
const CURRENT_USER_ID = 'user123'; 

// Elementos do Espelho do Tempo
const totalTimeValueEl = document.getElementById('total-time-value');
const analogiaMessageEl = document.getElementById('analogia-message');
const timeTodayEl = document.getElementById('time-today');
const totalDaysCountEl = document.getElementById('total-days-count');
const inputDesconexao = document.getElementById('input-desconexao');
const registrarBtn = document.getElementById('registrar-desconexao-btn');
const registroStatus = document.getElementById('registro-status');

// Helper para converter minutos em D:H:M (para analogia)
function formatTime(totalMinutes) {
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    
    let parts = [];
    if (days > 0) parts.push(`${days} dia${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
    if (minutes > 0 || totalMinutes === 0) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`);
    
    if (totalMinutes === 0) return "0 minutos";
    return parts.join(', ');
}

// Analisa e gera a mensagem motivacional e analogia
function generateAnalogy(totalMinutes, daysCount) {
    if (totalMinutes < 60) return "Continue firme! Pequenas vitórias constroem grandes hábitos.";
    
    const totalHours = totalMinutes / 60;
    
    if (totalHours >= 24) return `Isso é mais de ${Math.round(totalHours)} horas! Você recuperou mais de ${daysCount} dia${daysCount > 1 ? 's' : ''} de vida real.`;
    if (totalHours >= 3) return `Parabéns! Isso equivale a assistir ${Math.floor(totalHours / 1.5)} filmes longos, com atenção plena.`;
    if (totalHours >= 1) return "Uma hora completa de foco! É tempo de uma boa caminhada ou leitura.";
    
    return "Seu tempo está voltando para você. Não pare agora!";
}

// 1. Renderiza o Painel do Espelho do Tempo
async function renderEspelhoDoTempo() {
    try {
        const response = await fetch(`${API_URL}/tempo/${CURRENT_USER_ID}`);
        if (!response.ok) throw new Error("Falha ao carregar dados do tempo.");

        const data = await response.json();
        const totalMinutes = data.tempoTotalMinutos || 0;
        const daysCount = data.historico.length;
        
        // Formata o Tempo Total
        totalTimeValueEl.textContent = formatTime(totalMinutes);
        
        // Tempo de Hoje (Calculamos o tempo do dia atual)
        const todayKey = new Date().toISOString().slice(0, 10);
        const timeToday = data.historico.filter(h => h.data === todayKey)
                                         .reduce((sum, h) => sum + h.tempo, 0);
        timeTodayEl.textContent = `${timeToday} min`;

        // Estatísticas
        totalDaysCountEl.textContent = daysCount;
        analogiaMessageEl.textContent = generateAnalogy(totalMinutes, daysCount);
        
    } catch (error) {
        totalTimeValueEl.textContent = "Offline";
        analogiaMessageEl.textContent = "Erro: Servidor Node.js (porta 3000) não está ativo.";
        console.error("Falha na API do Espelho do Tempo:", error);
    }
}

// 2. Registra a Desconexão (POST)
async function registrarDesconexao() {
    const tempoMinutos = parseInt(inputDesconexao.value);

    if (isNaN(tempoMinutos) || tempoMinutos <= 0) {
        alert("Por favor, insira um tempo de desconexão válido (em minutos).");
        return;
    }

    registroStatus.textContent = "Registrando...";
    registroStatus.style.color = 'var(--muted-light)';
    
    try {
        const response = await fetch(`${API_URL}/tempo/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: CURRENT_USER_ID, tempoMinutos })
        });
        
        const data = await response.json();

        if (response.ok) {
            registroStatus.textContent = `✅ ${data.message}`;
            registroStatus.style.color = 'var(--success)';
            inputDesconexao.value = ''; // Limpa o input
            renderEspelhoDoTempo(); // Atualiza o painel imediatamente
        } else {
            throw new Error(data.error || "Falha ao registrar tempo.");
        }

    } catch (error) {
        registroStatus.textContent = `❌ Erro: ${error.message}`;
        registroStatus.style.color = 'var(--danger)';
    }
}

// 3. Inicialização e Eventos
document.addEventListener('DOMContentLoaded', () => {
    renderEspelhoDoTempo(); 
    
    if (registrarBtn) {
        registrarBtn.addEventListener('click', registrarDesconexao);
    }
});


// ... (O restante das funções do seu projeto original, como loadEntries, saveEntries, drawChart, etc., estariam aqui)
