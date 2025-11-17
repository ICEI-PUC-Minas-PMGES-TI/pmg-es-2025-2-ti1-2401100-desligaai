// =================================================================
// INTEGRAÇÃO COM BACKEND: ESPELHO DO TEMPO
// =================================================================
const API_URL = 'http://localhost:3000'; 
const CURRENT_USER_ID = 'user123'; 

// Elementos do Espelho do Tempo (Existentes)
const totalTimeValueEl = document.getElementById('total-time-value');
const analogiaMessageEl = document.getElementById('analogia-message');
const timeTodayEl = document.getElementById('time-today');
const totalDaysCountEl = document.getElementById('total-days-count');
const inputDesconexao = document.getElementById('input-desconexao');
const registrarBtn = document.getElementById('registrar-desconexao-btn');
const registroStatus = document.getElementById('registro-status');

// Elementos NOVOS
const diarioTexto = document.getElementById('diarioTexto');
const salvarDiarioBtn = document.getElementById('salvarDiarioBtn');
const historicoDiarioEl = document.getElementById('historicoDiario');
const resetarContagemBtn = document.getElementById('resetarContagemBtn');


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
        const daysCount = data.historico ? data.historico.length : 0;
        
        // Formata o Tempo Total
        if (totalTimeValueEl) totalTimeValueEl.textContent = formatTime(totalMinutes);
        
        // Tempo de Hoje 
        const todayKey = new Date().toISOString().slice(0, 10);
        const timeToday = data.historico ? data.historico.filter(h => h.data === todayKey)
                                     .reduce((sum, h) => sum + h.tempo, 0) : 0;
        if (timeTodayEl) timeTodayEl.textContent = `${timeToday} min`;

        // Estatísticas
        if (totalDaysCountEl) totalDaysCountEl.textContent = daysCount;
        if (analogiaMessageEl) analogiaMessageEl.textContent = generateAnalogy(totalMinutes, daysCount);
        
    } catch (error) {
        if (totalTimeValueEl) totalTimeValueEl.textContent = "Offline";
        if (analogiaMessageEl) analogiaMessageEl.textContent = "Erro: Servidor Node.js (porta 3000) não está ativo.";
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


// ==========================================================
// === LÓGICA DE DIÁRIO: BUSCAR E RENDERIZAR REFLEXÕES (NOVO) ===
// ==========================================================

// Função para renderizar o histórico de reflexões na tela
function renderHistorico(reflexoes) {
    if (!historicoDiarioEl) return;
    
    historicoDiarioEl.innerHTML = ''; 

    if (reflexoes && reflexoes.length > 0) {
        reflexoes.slice().reverse().forEach(item => { 
            const entryDiv = document.createElement('div');
            entryDiv.className = 'diario-entrada';
            
            const date = new Date(item.data);
            const dataFormatada = date.toLocaleString('pt-BR', { 
                day: '2-digit', month: '2-digit', year: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
            });

            entryDiv.innerHTML = `
                <div style="margin-bottom: 15px; padding: 10px; border-left: 3px solid var(--accent-light); padding-left: 10px; background-color: var(--card-bg);">
                    <p class="diario-data" style="font-size: 11px; color: var(--text-light); margin-bottom: 5px; font-weight: bold;">
                        ${dataFormatada}
                    </p>
                    <p class="diario-texto" style="color: var(--text-dark);">
                        ${item.texto}
                    </p>
                </div>
            `;
            historicoDiarioEl.appendChild(entryDiv);
        });
    } else {
        historicoDiarioEl.innerHTML = '<p class="small">Nenhuma reflexão salva ainda.</p>';
    }
}

// Busca o histórico de reflexões no servidor
async function fetchAndRenderHistorico() {
    if (!historicoDiarioEl) return;
    historicoDiarioEl.innerHTML = '<p class="small">Carregando histórico...</p>';

    try {
        const response = await fetch(`${API_URL}/diario/historico`);
        const data = await response.json();
        
        if (response.ok) {
            renderHistorico(data.reflexoes);
        } else {
            console.error('Erro ao buscar histórico:', data.error);
            historicoDiarioEl.innerHTML = '<p class="small" style="color: var(--danger);">Erro ao carregar histórico.</p>';
        }
    } catch (error) {
        console.error('Erro de rede ao buscar histórico:', error);
        historicoDiarioEl.innerHTML = '<p class="small" style="color: var(--danger);">Falha na conexão com o servidor.</p>';
    }
}

// Função para salvar a nova reflexão na API
async function salvarDiario() {
    if (!diarioTexto) return;
    const textoAtual = diarioTexto.value.trim();
    
    if (textoAtual === "") {
        alert('O diário de reflexão está vazio. Por favor, escreva algo antes de salvar.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/diario/salvar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: CURRENT_USER_ID, texto: textoAtual })
        });

        const data = await response.json();

        if (response.ok) {
            diarioTexto.value = ''; // Limpa a área de texto
            alert('✅ Reflexão salva com sucesso no servidor!');
            await fetchAndRenderHistorico(); // Recarrega e renderiza
        } else {
            alert(`Erro ao salvar reflexão: ${data.error}`);
        }
    } catch (error) {
        console.error('Erro de rede ao salvar reflexão:', error);
        alert('Falha na conexão com o servidor. Tente novamente.');
    }
}

// ==========================================================
// === LÓGICA DE RESET DA CONTAGEM (NOVO) ===
// ==========================================================
async function resetarContagem() {
    if (!confirm("Tem certeza que deseja RESETAR a contagem total? Esta ação é irreversível e apagará TODO o histórico de tempo.")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/contagem/reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: CURRENT_USER_ID })
        });
        
        const data = await response.json();

        if (response.ok) {
            // Atualiza o display na tela para zero
            renderEspelhoDoTempo(); 
            alert('✅ Contagem total e histórico de tempo resetados!');
        } else {
            alert(`Erro ao resetar: ${data.error}`);
        }

    } catch (error) {
        console.error('Erro de rede ao resetar contagem:', error);
        alert('Falha na conexão com o servidor. Tente novamente.');
    }
}


// 3. Inicialização e Eventos
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a exibição de tempo
    renderEspelhoDoTempo(); 
    
    // Inicializa o histórico do diário
    fetchAndRenderHistorico();

    // Event Listeners
    if (registrarBtn) {
        registrarBtn.addEventListener('click', registrarDesconexao);
    }
    if (salvarDiarioBtn) {
        salvarDiarioBtn.addEventListener('click', salvarDiario);
    }
    if (resetarContagemBtn) {
        resetarContagemBtn.addEventListener('click', resetarContagem);
    }
});