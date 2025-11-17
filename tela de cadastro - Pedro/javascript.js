const state = {
  users: [],
  sessions: [],
  statistics: [],
  history: [],
  settings: {},
  themes: [],
  messages: {},
  nextId: {
    users: 1,
    sessions: 1,
    statistics: 1,
    history: 1,
  },
  currentUser: null,
  currentSession: null,
};

// Funções para gerenciar o banco de dados JSON
async function loadDatabase() {
  try {
    // Tenta carregar do localStorage primeiro (persistência)
    const savedData = localStorage.getItem('userDatabase');
    if (savedData) {
      const data = JSON.parse(savedData);
      state.users = data.users || [];
      state.sessions = data.sessions || [];
      state.statistics = data.statistics || [];
      state.history = data.history || [];
      state.settings = data.settings || {};
      state.themes = data.themes || [];
      state.messages = data.messages || {};
      state.nextId = data.nextId || { users: 1, sessions: 1, statistics: 1, history: 1 };
      return;
    }

    // Se não houver no localStorage, tenta carregar do arquivo JSON
    const response = await fetch('./db.json');
    if (response.ok) {
      const data = await response.json();
      state.users = data.users || [];
      state.sessions = data.sessions || [];
      state.statistics = data.statistics || [];
      state.history = data.history || [];
      state.settings = data.settings || {};
      state.themes = data.themes || [];
      state.messages = data.messages || {};
      state.nextId = data.nextId || { users: 1, sessions: 1, statistics: 1, history: 1 };
      // Salva no localStorage para persistência
      saveDatabase();
    }
  } catch (error) {
    console.warn('Erro ao carregar banco de dados:', error);
    // Se houver erro, inicializa com valores padrão
    state.users = [];
    state.sessions = [];
    state.statistics = [];
    state.history = [];
    state.settings = {};
    state.themes = [];
    state.messages = {};
    state.nextId = { users: 1, sessions: 1, statistics: 1, history: 1 };
  }
}

function saveDatabase() {
  const data = {
    users: state.users,
    sessions: state.sessions,
    statistics: state.statistics,
    history: state.history,
    settings: state.settings,
    themes: state.themes,
    messages: state.messages,
    nextId: state.nextId,
  };
  // Salva no localStorage para persistência
  localStorage.setItem('userDatabase', JSON.stringify(data));
  
  // Também disponibiliza função para exportar JSON
  // (não podemos salvar diretamente no arquivo por questões de segurança do navegador)
  window.exportDatabase = function() {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
}

// Funções de validação disponíveis no console do navegador
window.validateDatabase = function() {
  console.log('🔍 Validando banco de dados...\n');
  
  const errors = [];
  const warnings = [];
  
  // Valida estrutura básica
  if (!state.users || !Array.isArray(state.users)) {
    errors.push('❌ "users" deve ser um array');
  }
  
  if (!state.nextId || typeof state.nextId !== 'object') {
    errors.push('❌ "nextId" deve ser um objeto');
  }
  
  // Valida usuários
  if (Array.isArray(state.users)) {
    state.users.forEach((user, index) => {
      if (!user.id) warnings.push(`⚠️ Usuário ${index}: falta campo "id"`);
      if (!user.username) warnings.push(`⚠️ Usuário ${index}: falta campo "username"`);
      if (!user.gmail) warnings.push(`⚠️ Usuário ${index}: falta campo "gmail"`);
      if (!user.password) warnings.push(`⚠️ Usuário ${index}: falta campo "password"`);
    });
  }
  
  // Valida IDs
  if (state.nextId) {
    const requiredIds = ['users', 'sessions', 'statistics', 'history'];
    requiredIds.forEach(id => {
      if (typeof state.nextId[id] !== 'number') {
        errors.push(`❌ "nextId.${id}" deve ser um número`);
      }
    });
  }
  
  // Mostra resultados
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Banco de dados válido!');
    console.log(`📊 Estatísticas:`);
    console.log(`   - Usuários: ${state.users.length}`);
    console.log(`   - Sessões: ${state.sessions.length}`);
    console.log(`   - Histórico: ${state.history.length}`);
    console.log(`   - Estatísticas: ${state.statistics.length}`);
    return true;
  } else {
    if (errors.length > 0) {
      console.error('❌ ERROS ENCONTRADOS:');
      errors.forEach(err => console.error('   ' + err));
    }
    if (warnings.length > 0) {
      console.warn('⚠️ AVISOS:');
      warnings.forEach(warn => console.warn('   ' + warn));
    }
    return false;
  }
};

// Função para visualizar o JSON completo
window.viewDatabase = function() {
  const data = {
    users: state.users,
    sessions: state.sessions,
    statistics: state.statistics,
    history: state.history,
    settings: state.settings,
    themes: state.themes,
    messages: state.messages,
    nextId: state.nextId,
  };
  console.log('📄 Banco de dados completo:');
  console.log(JSON.stringify(data, null, 2));
  return data;
};

// Função para validar JSON do localStorage
window.validateLocalStorage = function() {
  console.log('🔍 Validando localStorage...\n');
  const savedData = localStorage.getItem('userDatabase');
  if (!savedData) {
    console.warn('⚠️ Nenhum dado encontrado no localStorage');
    return false;
  }
  
  try {
    const data = JSON.parse(savedData);
    console.log('✅ JSON do localStorage é válido!');
    console.log('📊 Estrutura:', Object.keys(data));
    return true;
  } catch (error) {
    console.error('❌ JSON inválido no localStorage:', error.message);
    return false;
  }
};

// Função para validar arquivo JSON externo
window.validateJSONFile = async function() {
  console.log('🔍 Validando arquivo db.json...\n');
  try {
    const response = await fetch('./db.json');
    if (!response.ok) {
      console.error('❌ Erro ao carregar arquivo:', response.status, response.statusText);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Arquivo db.json é válido!');
    console.log('📊 Estrutura:', Object.keys(data));
    return true;
  } catch (error) {
    console.error('❌ Erro ao validar arquivo:', error.message);
    return false;
  }
};

// Função para limpar e resetar banco de dados
window.resetDatabase = function() {
  if (confirm('⚠️ Tem certeza que deseja resetar o banco de dados? Todos os dados serão perdidos!')) {
    localStorage.removeItem('userDatabase');
    location.reload();
  }
};

console.log('%c🔧 Funções de Validação Disponíveis:', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
console.log('%c  validateDatabase()  - Valida estrutura do banco de dados', 'color: #2196F3;');
console.log('%c  viewDatabase()      - Visualiza JSON completo', 'color: #2196F3;');
console.log('%c  validateLocalStorage() - Valida JSON no localStorage', 'color: #2196F3;');
console.log('%c  validateJSONFile()  - Valida arquivo db.json', 'color: #2196F3;');
console.log('%c  exportDatabase()    - Exporta banco de dados como JSON', 'color: #2196F3;');
console.log('%c  resetDatabase()     - Reseta banco de dados', 'color: #FF9800;');

// Função para adicionar entrada no histórico
function addHistoryEntry(userId, action, description) {
  const entry = {
    id: state.nextId.history++,
    userId,
    action,
    description,
    timestamp: new Date().toISOString(),
  };
  state.history.push(entry);
  saveDatabase();
}

// Função para criar/atualizar estatísticas
function updateStatistics(userId, action) {
  let stats = state.statistics.find(s => s.userId === userId);
  if (!stats) {
    stats = {
      id: state.nextId.statistics++,
      userId,
      totalLogins: 0,
      totalCadastros: 0,
      diasAtivos: 0,
      ultimaAtividade: new Date().toISOString(),
    };
    state.statistics.push(stats);
  }
  
  if (action === 'login') {
    stats.totalLogins++;
  } else if (action === 'register') {
    stats.totalCadastros++;
  }
  
  stats.ultimaAtividade = new Date().toISOString();
  saveDatabase();
}

// Função para criar sessão
function createSession(userId) {
  const session = {
    id: state.nextId.sessions++,
    userId,
    loginTime: new Date().toISOString(),
    logoutTime: null,
    ipAddress: null,
    userAgent: navigator.userAgent,
    ativo: true,
  };
  state.sessions.push(session);
  state.currentSession = session;
  saveDatabase();
  return session;
}

// Função para encerrar sessão
function endSession() {
  if (state.currentSession) {
    state.currentSession.logoutTime = new Date().toISOString();
    state.currentSession.ativo = false;
    state.currentSession = null;
    saveDatabase();
  }
}

const views = {
  login: document.getElementById('loginView'),
  register: document.getElementById('registerView'),
  welcome: document.getElementById('welcomeView'),
};

const forms = {
  login: document.getElementById('loginForm'),
  register: document.getElementById('registerForm'),
};

const alerts = {
  login: document.getElementById('loginAlert'),
  register: document.getElementById('registerAlert'),
};

const successMessage = document.getElementById('registerSuccess');
const welcomeFields = {
  id: document.getElementById('welcomeUserId'),
  username: document.getElementById('welcomeUsername'),
  usernameDetail: document.getElementById('welcomeUsernameDetail'),
  gmail: document.getElementById('welcomeGmail'),
};

const switches = {
  toRegister: document.getElementById('toRegister'),
  toLogin: document.getElementById('toLogin'),
  logout: document.getElementById('logoutBtn'),
};

const themeToggle = document.getElementById('themeToggle');

function setTheme(mode) {
  document.body.classList.toggle('theme-dark', mode === 'dark');
  localStorage.setItem('theme', mode);
  themeToggle.setAttribute(
    'aria-label',
    mode === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'
  );
  themeToggle.innerHTML = mode === 'dark' ? '☀️' : '🌙';
}

function initializeTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    setTheme(saved);
    return;
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(prefersDark ? 'dark' : 'light');
}

function showView(viewName) {
  Object.entries(views).forEach(([name, element]) => {
    element.classList.toggle('active', name === viewName);
  });
}

function clearAlert(alertEl) {
  alertEl.classList.add('d-none');
  alertEl.textContent = '';
}

function showAlert(alertEl, message, type = 'danger') {
  alertEl.textContent = message;
  alertEl.className = `alert-custom alert-${type}`;
}

function registerUser({ username, gmail, password }) {
  const trimmedUsername = username.trim();
  const trimmedGmail = gmail.trim().toLowerCase();

  if (!trimmedUsername || !trimmedGmail || !password) {
    throw new Error('Preencha todos os campos.');
  }

  const existing = state.users.find(
    (user) =>
      user.username.toLowerCase() === trimmedUsername.toLowerCase() ||
      user.gmail === trimmedGmail
  );

  if (existing) {
    if (existing.username.toLowerCase() === trimmedUsername.toLowerCase()) {
      throw new Error('Nome de usuário já existe.');
    }
    throw new Error('Gmail já cadastrado.');
  }

  const newUser = {
    id: state.nextId.users++,
    username: trimmedUsername,
    gmail: trimmedGmail,
    password,
    dataCadastro: new Date().toISOString(),
    ultimoLogin: null,
    theme: "light",
    ativo: true,
  };

  state.users.push(newUser);
  
  // Adiciona ao histórico
  addHistoryEntry(newUser.id, 'register', 'Usuário cadastrado com sucesso');
  
  // Atualiza estatísticas
  updateStatistics(newUser.id, 'register');
  
  saveDatabase(); // Salva após registrar novo usuário
  return { id: newUser.id, username: newUser.username, gmail: newUser.gmail };
}

function loginUser({ identifier, password }) {
  const trimmedIdentifier = identifier.trim().toLowerCase();
  const user = state.users.find(
    (u) =>
      (u.username.toLowerCase() === trimmedIdentifier ||
        u.gmail === trimmedIdentifier) &&
      u.password === password &&
      u.ativo !== false
  );

  if (!user) {
    throw new Error(state.messages.error?.invalidCredentials || 'Credenciais inválidas. Verifique usuário/gmail e senha.');
  }

  // Atualiza último login
  user.ultimoLogin = new Date().toISOString();
  
  // Cria sessão
  createSession(user.id);
  
  // Adiciona ao histórico
  addHistoryEntry(user.id, 'login', 'Login realizado com sucesso');
  
  // Atualiza estatísticas
  updateStatistics(user.id, 'login');
  
  saveDatabase();

  return { id: user.id, username: user.username, gmail: user.gmail };
}

function fillWelcomeCard(user) {
  welcomeFields.id.textContent = user.id;
  welcomeFields.username.textContent = user.username;
  welcomeFields.usernameDetail.textContent = user.username;
  welcomeFields.gmail.textContent = user.gmail;
}

function handleLogin(event) {
  event.preventDefault();
  clearAlert(alerts.login);

  const identifier = forms.login.identifier.value;
  const password = forms.login.password.value;

  try {
    const user = loginUser({ identifier, password });
    state.currentUser = user;
    fillWelcomeCard(user);
    showView('welcome');
    forms.login.reset();
  } catch (error) {
    showAlert(alerts.login, error.message);
  }
}

function handleRegister(event) {
  event.preventDefault();
  clearAlert(alerts.register);
  successMessage.classList.add('d-none');

  const username = forms.register.username.value;
  const gmail = forms.register.gmail.value;
  const password = forms.register.password.value;

  try {
    registerUser({ username, gmail, password });
    successMessage.classList.remove('d-none');
    forms.register.reset();
    setTimeout(() => {
      successMessage.classList.add('d-none');
      showView('login');
    }, 2000);
  } catch (error) {
    showAlert(alerts.register, error.message);
  }
}

function setupNavigation() {
  switches.toRegister.addEventListener('click', () => {
    showView('register');
  });

  switches.toLogin.addEventListener('click', () => {
    showView('login');
  });

  switches.logout.addEventListener('click', () => {
    if (state.currentUser) {
      addHistoryEntry(state.currentUser.id, 'logout', 'Logout realizado com sucesso');
      endSession();
    }
    state.currentUser = null;
    showView('login');
  });
}

async function init() {
  showView('login');
  initializeTheme();
  
  // Carrega o banco de dados
  await loadDatabase();

  forms.login.addEventListener('submit', handleLogin);
  forms.register.addEventListener('submit', handleRegister);
  setupNavigation();

  themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('theme-dark')
      ? 'light'
      : 'dark';
    setTheme(nextTheme);
  });
}

document.addEventListener('DOMContentLoaded', init);

