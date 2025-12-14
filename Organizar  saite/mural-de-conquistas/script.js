// ============================================
// MURAL DE CONQUISTAS - Script
// ============================================

let achievements = [];

// Carrega conquistas do db.json local
async function loadAchievements() {
  try {
    const response = await fetch('./db.json');
    const data = await response.json();
    achievements = data.achievements || [];
  } catch (error) {
    console.error('Erro ao carregar conquistas:', error);
    // Fallback para conquistas padrão
    achievements = [
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
  }
}

async function initConquistas() {
  // Carrega conquistas primeiro
  await loadAchievements();
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

// Inicializa ao carregar a página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initConquistas);
} else {
  initConquistas();
}

