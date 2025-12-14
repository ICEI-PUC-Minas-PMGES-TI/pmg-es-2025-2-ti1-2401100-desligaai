// perfil.js
(function(){
  const API_BASE = 'http://localhost:3000';
  const CURRENT_USER_KEY = 'desligaAI_currentUser';

  let selectedUserId = null;
  let currentUser = null;
  let lastLoadedUser = null;

  // Seletores rápidos
  function qs(id){ return document.getElementById(id); }

  // Tema (claro/escuro) - compatível com botão da home
  function initTheme(){
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const startDark = saved ? saved === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', startDark);
    const toggle = qs('themeToggle');
    if(toggle){
      toggle.addEventListener('click', toggleTheme);
    }
  }

  function toggleTheme(){
    const isDark = document.documentElement.classList.contains('dark');
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  function handleLogout(){
    // Remove o usuário logado do localStorage
    localStorage.removeItem(CURRENT_USER_KEY);
    // Redireciona para a página de login
    window.location.href = '../../DELIGA 02TESTE ATUAL - Copia/Cadastro/login.html';
  }

  const avatar = qs('avatar');
  const photo = qs('photo');
  const nomeEl = qs('nome');
  const idadeEl = qs('idade');
  const sobreTextEl = qs('sobreText');
  const editSobreBtn = qs('editSobreBtn');
  const saveSobreBtn = qs('saveSobreBtn');
  const cancelSobreBtn = qs('cancelSobreBtn');
  const sobreEdit = qs('sobreEdit');
  const sobreInput = qs('sobreInput');

  function getQueryIdentifier(){
    const params = new URLSearchParams(location.search);
    return params.get('id') || params.get('user') || params.get('email');
  }

  function setAvatarLetter(name){
    avatar.textContent = name ? name.trim().charAt(0).toUpperCase() : 'A';
  }

  function computeAgeFromBirth(birth){
    if(!birth) return null;
    let d = null;
    if(/\d{4}-\d{2}-\d{2}/.test(birth)) d = new Date(birth);
    else if(/\d{2}\/\d{2}\/\d{4}/.test(birth)){
      const parts = birth.split('/');
      d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      const parsed = Date.parse(birth);
      if(!isNaN(parsed)) d = new Date(parsed);
    }
    if(!d) return null;
    const diff = Date.now() - d.getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  }

  function getLoggedUser(){
    try{
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    }catch(_){
      return null;
    }
  }

  // Busca o usuário pelo ID ou e-mail na mesma API usada pelo cadastro/login (/users)
  async function fetchUser(identifier){
    if(!identifier) return null;
    const idStr = String(identifier).trim();
    const isNumeric = /^\d+$/.test(idStr);
    const isEmail = idStr.includes('@');

    const endpoints = [];
    if(isNumeric) endpoints.push(`${API_BASE}/users/${idStr}`);
    if(isEmail) endpoints.push(`${API_BASE}/users?email=${encodeURIComponent(idStr)}`);
    endpoints.push(`${API_BASE}/users/${encodeURIComponent(idStr)}`);
    endpoints.push(`${API_BASE}/users?email=${encodeURIComponent(idStr)}`);

    for(const url of endpoints){
      try{
        const res = await fetch(url, { cache: 'no-store' });
        if(!res.ok) continue;
        const data = await res.json();
        if(Array.isArray(data)){
          if(data.length) return data[0];
        } else if(data) {
          return data;
        }
      }catch(_){ /* tenta próxima rota */ }
    }

    // Fallback: tenta ler db.json local caso o json-server não esteja rodando
    const fallbackPaths = [
      '../db.json',
      '../../DELIGA 02TESTE ATUAL - Copia/db.json',
      '../../gabriel/db.json'
    ];

    for(const path of fallbackPaths){
      try{
        const res = await fetch(path, { cache: 'no-store' });
        if(!res.ok) continue;
        const blob = await res.json();
        const collections = [blob.users, blob.usuarios].filter(Array.isArray);
        for(const col of collections){
          const found = col.find(u => String(u.id) === idStr || (u.email && u.email === idStr));
          if(found) return found;
        }
      }catch(_){ /* ignora e segue */ }
    }
    return null;
  }

  function showData(user){
    currentUser = user;
    lastLoadedUser = user;
    selectedUserId = user ? (user.id || user.email || null) : null;

    if(!user){
      nomeEl.textContent = 'Usuário não encontrado';
      idadeEl.textContent = '';
      photo.classList.add('hidden');
      avatar.classList.remove('hidden');
      setAvatarLetter(null);
      return;
    }

    const nome = user.nome || user.fullName || user.login || user.email || 'Sem nome';
    nomeEl.textContent = nome;

    let idade = user.idade || user.age || null;
    if(!idade){
      idade = computeAgeFromBirth(user.nascimento || user.birthdate || user.birth);
    }
    idadeEl.textContent = idade ? `${idade} anos` : '';

    if (user.foto || user.photo){
      const fotoVal = String(user.foto || user.photo).trim();
      const candidates = [
        fotoVal,
        `../img/${fotoVal}`,
        `img/${fotoVal}`,
        `./img/${fotoVal}`,
        `/gabriel/${fotoVal}`,
        `/gabriel/img/${fotoVal}`
      ];

      const trySrc = (i) => {
        if(i >= candidates.length){
          photo.classList.add('hidden');
          avatar.classList.remove('hidden');
          setAvatarLetter(nome);
          return;
        }
        const src = candidates[i];
        photo.onload = () => {
          photo.alt = `Foto de ${nome}`;
          photo.classList.remove('hidden');
          avatar.classList.add('hidden');
        };
        photo.onerror = () => { trySrc(i+1); };
        photo.src = src;
      };
      trySrc(0);
    } else {
      photo.classList.add('hidden');
      avatar.classList.remove('hidden');
      setAvatarLetter(nome);
    }

    const sobreVal = user.sobre || user.bio || user.descricao || '';
    sobreTextEl.textContent = sobreVal || 'Sem descrição.';
    sobreInput.value = sobreVal || '';
  }

  // Salva o campo "Sobre" na mesma coleção /users usada pelo cadastro/login
  async function saveSobre(id, text){
    if(!id) return false;
    try{
      const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ sobre: text })
      });
      if(!res.ok) throw new Error('PATCH falhou');
      const updated = await res.json();
      currentUser = Object.assign({}, currentUser, updated);
      return true;
    }catch(e){
      console.warn('PATCH /users falhou', e);
      alert('Não foi possível salvar no servidor. Inicie o json-server na pasta "DELIGA 02TESTE ATUAL - Copia" para persistir as alterações.');
      return false;
    }
  }

  function enterEditSobre(){
    sobreEdit.classList.remove('hidden');
    saveSobreBtn.classList.remove('hidden');
    cancelSobreBtn.classList.remove('hidden');
    editSobreBtn.classList.add('hidden');
    sobreInput.focus();
  }

  function exitEditSobre(){
    sobreEdit.classList.add('hidden');
    saveSobreBtn.classList.add('hidden');
    cancelSobreBtn.classList.add('hidden');
    editSobreBtn.classList.remove('hidden');
  }

  async function bootstrapProfile(){
    initTheme();

    // Event listener para logout
    const logoutBtn = qs('logoutBtn');
    if(logoutBtn){
      logoutBtn.addEventListener('click', () => {
        if(confirm('Tem certeza que deseja sair?')){
          handleLogout();
        }
      });
    }

    const logged = getLoggedUser();
    const queryIdentifier = getQueryIdentifier();
    let userData = null;

    if(logged){
      const idToFetch = logged.id || logged.email;
      userData = await fetchUser(idToFetch) || logged;
    } else if(queryIdentifier){
      userData = await fetchUser(queryIdentifier);
    } else {
      userData = await fetchUser('gabriel'); // fallback para navegação direta
    }

    showData(userData);

    editSobreBtn.addEventListener('click', enterEditSobre);
    cancelSobreBtn.addEventListener('click', () => {
      exitEditSobre();
      sobreInput.value = lastLoadedUser ? (lastLoadedUser.sobre || lastLoadedUser.bio || '') : '';
    });
    saveSobreBtn.addEventListener('click', async () => {
      if(!selectedUserId){
        alert('Faça login ou abra o perfil com um usuário válido para salvar.');
        return;
      }
      const novo = sobreInput.value.trim();
      const ok = await saveSobre(selectedUserId, novo);
      sobreTextEl.textContent = novo || 'Sem descrição.';
      exitEditSobre();
      alert(ok ? 'Sobre salvo no servidor' : 'Sobre salvo localmente (offline)');
    });

    // Inicializa desafios de hoje
    initDailyChallenges();

    if(!userData){
      alert('Nenhum usuário encontrado. Faça login pelo cadastro/login para carregar seu perfil.');
    }
  }

  // ============================================
  // SISTEMA DE DESAFIOS DE HOJE
  // ============================================
  const DAILY_CHALLENGES_KEY = 'desligaAI_dailyChallenges';
  const CHALLENGES_STATE_KEY = 'desligaAI_challengesState';

  const dailyChallenges = [
    {
      id: 'challenge_1',
      title: 'Deixe o celular em outro cômodo por 1 hora',
      info: 'Tempo restante: 08:42:41 (Brasília)',
      tip: 'Saiba mais',
      completed: false
    },
    {
      id: 'challenge_2',
      title: 'Leia 10 páginas de um livro físico',
      info: 'Tempo restante: 08:42:41',
      tip: 'Saiba mais',
      completed: false
    },
    {
      id: 'challenge_3',
      title: 'Desative notificações de redes sociais hoje',
      info: 'Tempo restante: 08:42:41',
      tip: 'Saiba mais',
      completed: false
    },
    {
      id: 'challenge_4',
      title: 'Faça uma caminhada de 15 minutos sem fones',
      info: 'Tempo restante: 08:42:41',
      tip: 'Saiba mais',
      completed: false
    },
    {
      id: 'challenge_5',
      title: 'Não use o celular 1 hora antes de dormir',
      info: 'Tempo restante: 08:42:41',
      tip: 'Saiba mais',
      completed: false
    }
  ];

  function loadDailyChallengesState() {
    try {
      const saved = localStorage.getItem(CHALLENGES_STATE_KEY);
      const lastReset = localStorage.getItem(CHALLENGES_STATE_KEY + '_reset');
      const today = new Date().toDateString();
      
      // Se não foi resetado hoje, reseta
      if (lastReset !== today) {
        const freshState = {};
        dailyChallenges.forEach(ch => {
          freshState[ch.id] = { completed: false };
        });
        localStorage.setItem(CHALLENGES_STATE_KEY, JSON.stringify(freshState));
        localStorage.setItem(CHALLENGES_STATE_KEY + '_reset', today);
        return freshState;
      }
      
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao carregar estado dos desafios:', e);
    }
    
    const initial = {};
    dailyChallenges.forEach(ch => {
      initial[ch.id] = { completed: false };
    });
    return initial;
  }

  function saveDailyChallengesState(state) {
    try {
      localStorage.setItem(CHALLENGES_STATE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Erro ao salvar estado dos desafios:', e);
    }
  }

  // ============================================
  // INTEGRAÇÃO COM SISTEMA DE CONQUISTAS
  // ============================================
  const ACHIEVEMENT_STATS_KEY = 'desligaAI_achievements_stats';
  const ACHIEVEMENTS_STORAGE_KEY = 'desligaAI_achievements';

  function updateAchievementStatForProfile(statName, incrementBy = 1) {
    try {
      // Carrega stats atuais
      const saved = localStorage.getItem(ACHIEVEMENT_STATS_KEY);
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

      // Atualiza o stat
      if (statName in stats) {
        stats[statName] = Math.max(0, (stats[statName] || 0) + incrementBy);
      }

      // Salva de volta
      stats.lastUpdated = Date.now();
      localStorage.setItem(ACHIEVEMENT_STATS_KEY, JSON.stringify(stats));

      console.log(`Achievement stat updated: ${statName} = ${stats[statName]}`);
      
      // IMPORTANTE: Chama o sistema de verificação de conquistas
      checkAndUnlockAchievementsFromProfile();
      
      return stats;
    } catch (e) {
      console.error('Erro ao atualizar stat de conquistas:', e);
      return null;
    }
  }

  // Verifica e desbloqueia conquistas - versão simplificada para o perfil
  function checkAndUnlockAchievementsFromProfile() {
    try {
      const stats = JSON.parse(localStorage.getItem(ACHIEVEMENT_STATS_KEY) || '{}');
      const achievements = JSON.parse(localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY) || '{}');
      
      // Lista de verificações simples
      const checks = [
        {
          id: 'first_step',
          condition: stats.challengesCompleted >= 1
        },
        {
          id: 'warrior',
          condition: stats.daysCompleted >= 3
        },
        {
          id: 'week_conscious',
          condition: stats.daysCompleted >= 7
        },
        {
          id: 'time_saver',
          condition: stats.challengesCompleted >= 50
        },
        {
          id: 'month_winner',
          condition: stats.daysCompleted >= 30
        }
      ];

      let hasNewUnlock = false;
      
      checks.forEach(check => {
        const achState = achievements[check.id];
        
        // Se já está desbloqueada, pula
        if (achState && achState.unlocked) return;
        
        // Se a condição foi cumprida, desbloqueia
        if (check.condition) {
          achievements[check.id] = {
            unlocked: true,
            unlockedAt: Date.now()
          };
          hasNewUnlock = true;
          console.log(`🎉 Conquista desbloqueada: ${check.id}`);
        }
      });

      if (hasNewUnlock) {
        localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements));
      }
      
    } catch (e) {
      console.error('Erro ao verificar conquistas:', e);
    }
  }

  function initDailyChallenges() {
    const challengesList = qs('challengesList');
    if (!challengesList) return;

    const state = loadDailyChallengesState();
    const completedCount = Object.values(state).filter(s => s.completed).length;
    const totalCount = dailyChallenges.length;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    // Atualiza progresso
    const progressEl = qs('dailyChallengeProgress');
    if (progressEl) {
      progressEl.textContent = progressPercent + '%';
    }

    const progressBar = qs('dailyChallengeProgressBar');
    if (progressBar) {
      progressBar.style.width = progressPercent + '%';
    }

    // Renderiza desafios
    challengesList.innerHTML = '';
    dailyChallenges.forEach(challenge => {
      const isCompleted = state[challenge.id]?.completed || false;
      
      const item = document.createElement('div');
      item.className = 'challenge-item' + (isCompleted ? ' completed' : '');
      item.dataset.challengeId = challenge.id;
      
      item.innerHTML = `
        <div class="challenge-checkbox">
          <i class="bi bi-check"></i>
        </div>
        <div class="challenge-content">
          <p class="challenge-text">${challenge.title}</p>
          <div class="challenge-info">
            <span class="challenge-info-item">
              <i class="bi bi-clock"></i>
              ${challenge.info}
            </span>
          </div>
        </div>
      `;
      
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasCompleted = state[challenge.id].completed;
        
        // Toggle o estado
        state[challenge.id].completed = !state[challenge.id].completed;
        
        // Se foi marcado como completo agora, registra a estatística
        if (!wasCompleted && state[challenge.id].completed) {
          // Incrementa desafios completados
          updateAchievementStatForProfile('challengesCompleted', 1);
          
          // Verifica se é o primeiro desbloqueio do dia (daysCompleted)
          const completedToday = Object.values(state).filter(s => s.completed).length;
          if (completedToday === 1) {
            // Se é o primeiro desafio do dia, incrementa daysCompleted
            updateAchievementStatForProfile('daysCompleted', 1);
          }
        }
        
        saveDailyChallengesState(state);
        initDailyChallenges(); // Re-renderiza
      });
      
      challengesList.appendChild(item);
    });

    // Mostra mensagem se completo
    const allCompletedMsg = qs('allChallengesCompleted');
    if (allCompletedMsg) {
      if (completedCount === totalCount) {
        allCompletedMsg.classList.remove('d-none');
      } else {
        allCompletedMsg.classList.add('d-none');
      }
    }
  }

  document.addEventListener('DOMContentLoaded', bootstrapProfile);
})();
