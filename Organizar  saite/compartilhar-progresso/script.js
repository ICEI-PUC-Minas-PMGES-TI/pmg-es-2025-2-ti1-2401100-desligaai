// ============================================
// COMPARTILHAR PROGRESSO - Script
// ============================================

let shareStats = null;

// Carrega estatísticas do db.json local
async function loadShareStats() {
  try {
    const response = await fetch('./db.json');
    const data = await response.json();
    shareStats = data.shareStats && data.shareStats.length > 0 ? data.shareStats[0] : null;
    if (shareStats) {
      updateShareDisplay();
    }
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
    // Fallback para dados padrão
    shareStats = {
      id: 1,
      userId: 1,
      diasAtivos: 12,
      minutosEconomizados: 780,
      conquistasDesbloqueadas: 3,
      diasSequencia: 5,
      lastUpdate: "2025-01-20T00:00:00.000Z"
    };
    updateShareDisplay();
  }
}

function updateShareDisplay() {
  if (!shareStats) return;
  
  // Atualiza os valores exibidos
  const statsElements = {
    'diasAtivos': shareStats.diasAtivos,
    'minutosEconomizados': shareStats.minutosEconomizados,
    'conquistasDesbloqueadas': shareStats.conquistasDesbloqueadas,
    'diasSequencia': shareStats.diasSequencia
  };
  
  // Atualiza o texto de compartilhamento
  const shareText = document.getElementById('shareText');
  if (shareText) {
    shareText.value = `🎯 Meu progresso no Desliga AI:
✨ ${shareStats.diasAtivos} dias ativos
⏰ ${shareStats.minutosEconomizados} minutos economizados
🏆 ${shareStats.conquistasDesbloqueadas} conquistas desbloqueadas
🔥 ${shareStats.diasSequencia} dias de sequência
Reconquiste seu tempo! Acesse: desligaai.com`;
  }
  
  // Atualiza os cards de estatísticas (se existirem elementos com IDs específicos)
  const diasEl = document.querySelector('[data-stat="diasAtivos"]');
  const minutosEl = document.querySelector('[data-stat="minutosEconomizados"]');
  const conquistasEl = document.querySelector('[data-stat="conquistasDesbloqueadas"]');
  const sequenciaEl = document.querySelector('[data-stat="diasSequencia"]');
  
  if (diasEl) diasEl.textContent = shareStats.diasAtivos;
  if (minutosEl) minutosEl.textContent = shareStats.minutosEconomizados;
  if (conquistasEl) conquistasEl.textContent = shareStats.conquistasDesbloqueadas;
  if (sequenciaEl) sequenciaEl.textContent = shareStats.diasSequencia + ' 🔥';
}

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

// Inicializa ao carregar a página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadShareStats);
} else {
  loadShareStats();
}

window.shareTo = shareTo;
window.copyShareText = copyShareText;

