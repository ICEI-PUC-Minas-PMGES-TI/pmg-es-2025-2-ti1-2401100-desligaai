// ============================================
// CHECKLIST DIÁRIO - Script
// ============================================

const API_URL = 'http://localhost:3000';
const TASKS_STORAGE_KEY = 'desliga_checklist_tasks_v1'; // Fallback
let tasks = [];
let taskIdCounter = 1;
let currentUser = null;

// ============================================
// SISTEMA DE REGISTRO DE PROGRESSO DIÁRIO
// ============================================
const ENTRIES_STORAGE_KEY = 'desliga_progress_entries_v1';
let entries = [];
let editingId = null;

async function initChecklist() {
  // Obter usuário atual do localStorage
  try {
    const userStr = localStorage.getItem('desligaAI_currentUser');
    if (userStr) {
      currentUser = JSON.parse(userStr);
      console.log('[Checklist] Usuário carregado:', currentUser.email);
    } else {
      console.warn('[Checklist] Nenhum usuário encontrado no localStorage');
    }
  } catch (e) {
    console.error('[Checklist] Erro ao carregar usuário:', e);
  }
  
  // Inicializa o sistema de registro
  loadEntries();
  initEntryForm();
  renderEntries();
  
  // Inicializa o checklist
  await loadTasks();
  renderTasks();
  updateTaskPercentage();
  
  // Adiciona evento de Enter no input
  const input = document.getElementById('newTaskInput');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTask();
      }
    });
  }
  
  // Inicializa data com hoje
  const dateInput = document.getElementById('date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }
  
  // Redimensiona gráfico quando necessário
  window.addEventListener('resize', () => drawChart());
  
  // Desenha gráfico após um pequeno delay para garantir que o canvas esteja renderizado
  setTimeout(() => drawChart(), 100);
}

function loadEntries() {
  try {
    const saved = localStorage.getItem(ENTRIES_STORAGE_KEY);
    if (saved) {
      entries = JSON.parse(saved);
      entries.sort((a, b) => b.date.localeCompare(a.date));
    }
  } catch (e) {
    console.error('Erro ao carregar entradas:', e);
    entries = [];
  }
}

function saveEntries() {
  try {
    localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(entries));
    renderEntries();
  } catch (e) {
    console.error('Erro ao salvar entradas:', e);
  }
}

function initEntryForm() {
  const form = document.getElementById('entryForm');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
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
      alert('Escolha uma data');
      return;
    }
    
    const entry = {
      id: editingId || 'id_' + Date.now(),
      date,
      minutes,
      craving,
      mood,
      notes,
      createdAt: new Date().toISOString()
    };
    
    addOrUpdateEntry(entry);
    
    // Reset form
    form.reset();
    if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);
    if (minutesInput) minutesInput.value = '';
    if (cravingInput) cravingInput.value = '0';
    if (moodInput) moodInput.value = '';
    if (notesInput) notesInput.value = '';
    editingId = null;
  });
  
  // Botão limpar tudo
  const clearAllBtn = document.getElementById('clearAll');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (confirm('Apagar todas as entradas? Isso não pode ser desfeito.')) {
        entries = [];
        tasks = [];
        localStorage.removeItem(ENTRIES_STORAGE_KEY);
        localStorage.removeItem(TASKS_STORAGE_KEY);
        renderEntries();
        renderTasks();
        updateTaskPercentage();
      }
    });
  }
}

function addOrUpdateEntry(entry) {
  if (editingId) {
    const idx = entries.findIndex(e => e.id === editingId);
    if (idx > -1) {
      entries[idx] = { ...entries[idx], ...entry };
    }
    editingId = null;
  } else {
    entries.push(entry);
  }
  entries.sort((a, b) => b.date.localeCompare(a.date));
  saveEntries();
}

function removeEntry(id) {
  entries = entries.filter(e => e.id !== id);
  saveEntries();
}

function startEdit(id) {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;
  
  editingId = id;
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
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderEntries() {
  const list = document.getElementById('entriesList');
  if (!list) return;
  
  list.innerHTML = '';
  
  if (entries.length === 0) {
    list.innerHTML = '<div class="text-center text-muted p-3">Nenhuma entrada ainda. Registre seu primeiro dia acima!</div>';
    updateStats();
    drawChart();
    return;
  }
  
  entries.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'card mb-2';
    div.innerHTML = `
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div class="fw-bold">${entry.date}</div>
            <small class="text-muted">${entry.minutes} min • desejo ${entry.craving} • ${entry.mood || '—'}</small>
          </div>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary btn-sm" data-action="edit" data-id="${entry.id}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger btn-sm" data-action="del" data-id="${entry.id}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
        ${entry.notes ? `<div class="small text-muted mt-2">${entry.notes.replace(/\n/g, '<br>')}</div>` : ''}
      </div>
    `;
    list.appendChild(div);
  });
  
  // Attach event listeners
  list.querySelectorAll("[data-action='edit']").forEach(btn => {
    btn.addEventListener('click', () => startEdit(btn.dataset.id));
  });
  
  list.querySelectorAll("[data-action='del']").forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Remover este registro?')) {
        removeEntry(btn.dataset.id);
      }
    });
  });
  
  updateStats();
  drawChart();
}

function updateStats() {
  const totalDays = entries.length;
  const totalMinutes = entries.reduce((sum, e) => sum + (Number(e.minutes) || 0), 0);
  const avgMinutes = totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0;
  const bestStreak = calcBestStreak();
  
  const totalDaysEl = document.getElementById('totalDays');
  const totalMinutesEl = document.getElementById('totalMinutes');
  const avgMinutesEl = document.getElementById('avgMinutes');
  const bestStreakEl = document.getElementById('bestStreak');
  
  if (totalDaysEl) totalDaysEl.textContent = totalDays;
  if (totalMinutesEl) totalMinutesEl.textContent = totalMinutes;
  if (avgMinutesEl) avgMinutesEl.textContent = avgMinutes;
  if (bestStreakEl) bestStreakEl.textContent = bestStreak;
}

function calcBestStreak() {
  if (entries.length === 0) return 0;
  
  const set = new Set(entries.filter(e => Number(e.minutes) > 0).map(e => e.date));
  const dates = Array.from(new Set(entries.map(e => e.date))).sort();
  
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

function drawChart() {
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
    const entry = entries.find(e => e.date === key);
    last7.push({ date: key, minutes: entry ? Number(entry.minutes) || 0 : 0 });
  }
  
  const max = Math.max(...last7.map(x => x.minutes), 1);
  const pad = 20 * (window.devicePixelRatio || 1);
  const areaW = w - pad * 2;
  const barW = areaW / 7 * 0.7;
  
  last7.forEach((d, i) => {
    const x = pad + i * (areaW / 7) + (areaW / 7 - barW) / 2;
    const barH = (d.minutes / max) * (h - pad * 2);
    const y = h - pad - barH;
    
    // Cor do gráfico adaptável ao tema - melhorado para modo escuro
    const isDark = document.documentElement.classList.contains('dark');
    
    // Barras do gráfico - mais brilhantes no modo escuro
    if (isDark) {
      ctx.fillStyle = 'rgba(96, 165, 250, 1)'; // Azul mais brilhante
      ctx.shadowColor = 'rgba(96, 165, 250, 0.5)';
      ctx.shadowBlur = 4;
    } else {
      ctx.fillStyle = 'rgba(96, 165, 250, 0.9)';
      ctx.shadowBlur = 0;
    }
    
    ctx.fillRect(x, y, barW, barH);
    ctx.shadowBlur = 0; // Reset shadow
    
    // Texto das datas - mais visível no modo escuro
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 0.7)';
    ctx.font = 'bold ' + (11 * (window.devicePixelRatio || 1)) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(d.date.slice(5), x + barW / 2, h - pad / 2);
  });
}

async function loadTasks() {
  try {
    // Tentar carregar via API do JSON-SERVER
    try {
      const response = await fetch(`${API_URL}/tasks`);
      if (response.ok) {
        const allTasks = await response.json();
        // Filtrar tarefas do usuário atual ou sem userId (tarefas globais)
        const userId = currentUser?.id || null;
        tasks = allTasks.filter(t => 
          !userId || t.userId === userId || !t.userId
        ).map(t => ({
          id: t.id,
          text: t.text,
          completed: t.completed || false,
          userId: t.userId || userId
        }));
        
        taskIdCounter = Math.max(...tasks.map(t => t.id || 0), 0) + 1;
        
        // Se não há tarefas e há usuário, criar tarefas padrão
        if (tasks.length === 0 && userId) {
          const defaultTasks = [
            { text: 'Meditar por 10 minutos', completed: false, userId },
            { text: 'Ler 30 páginas de um livro', completed: false, userId },
            { text: 'Fazer exercícios físicos', completed: false, userId },
            { text: 'Conversar com alguém pessoalmente', completed: false, userId }
          ];
          
          for (const task of defaultTasks) {
            try {
              const res = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task)
              });
              if (res.ok) {
                const newTask = await res.json();
                tasks.push(newTask);
              }
            } catch (err) {
              console.warn('Erro ao criar tarefa padrão:', err);
            }
          }
          
          taskIdCounter = Math.max(...tasks.map(t => t.id || 0), 0) + 1;
        }
        
        console.log('[Checklist] Tarefas carregadas via API:', tasks.length);
        return;
      }
    } catch (apiError) {
      console.warn('[Checklist] Erro ao carregar via API, usando fallback:', apiError);
    }
    
    // Fallback: tentar localStorage
    const saved = localStorage.getItem(TASKS_STORAGE_KEY);
    if (saved) {
      tasks = JSON.parse(saved);
      taskIdCounter = Math.max(...tasks.map(t => t.id || 0), 0) + 1;
      console.log('[Checklist] Tarefas carregadas do localStorage:', tasks.length);
    } else {
      // Fallback final: tarefas padrão
      tasks = [
        { id: 1, text: 'Meditar por 10 minutos', completed: false },
        { id: 2, text: 'Ler 30 páginas de um livro', completed: false },
        { id: 3, text: 'Fazer exercícios físicos', completed: false },
        { id: 4, text: 'Conversar com alguém pessoalmente', completed: false }
      ];
      taskIdCounter = 5;
      await saveTasks();
    }
  } catch (e) {
    console.error('[Checklist] Erro ao carregar tarefas:', e);
    tasks = [];
    taskIdCounter = 1;
  }
}

async function saveTasks() {
  try {
    const userId = currentUser?.id || null;
    
    // Tentar salvar via API do JSON-SERVER
    try {
      for (const task of tasks) {
        const taskData = {
          text: task.text,
          completed: task.completed || false,
          userId: userId
        };
        
        if (task.id && task.id > 0) {
          // Atualizar tarefa existente
          const response = await fetch(`${API_URL}/tasks/${task.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...taskData, id: task.id })
          });
          
          if (!response.ok) {
            console.warn(`[Checklist] Erro ao atualizar tarefa ${task.id}:`, response.status);
          }
        } else {
          // Criar nova tarefa
          const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
          });
          
          if (response.ok) {
            const newTask = await response.json();
            task.id = newTask.id;
          } else {
            console.warn('[Checklist] Erro ao criar tarefa:', response.status);
          }
        }
      }
      
      console.log('[Checklist] Tarefas salvas via API');
      return;
    } catch (apiError) {
      console.warn('[Checklist] Erro ao salvar via API, usando fallback:', apiError);
    }
    
    // Fallback: salvar no localStorage
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    console.log('[Checklist] Tarefas salvas no localStorage (fallback)');
  } catch (e) {
    console.error('[Checklist] Erro ao salvar tarefas:', e);
  }
}

async function addTask() {
  const input = document.getElementById('newTaskInput');
  if (!input || !input.value.trim()) return;
  
  const userId = currentUser?.id || null;
  const taskText = input.value.trim();
  input.value = '';
  
  // Criar tarefa temporária para renderização imediata
  const tempId = taskIdCounter++;
  const newTask = {
    id: tempId,
    text: taskText,
    completed: false,
    userId: userId
  };
  
  tasks.push(newTask);
  renderTasks();
  updateTaskPercentage();
  
  // Salvar via API e atualizar ID se necessário
  try {
    const taskData = {
      text: taskText,
      completed: false,
      userId: userId
    };
    
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    
    if (response.ok) {
      const savedTask = await response.json();
      // Atualizar ID da tarefa no array
      const taskIndex = tasks.findIndex(t => t.id === tempId);
      if (taskIndex > -1) {
        tasks[taskIndex].id = savedTask.id;
        if (savedTask.id >= taskIdCounter) {
          taskIdCounter = savedTask.id + 1;
        }
      }
      console.log('[Checklist] Tarefa criada via API:', savedTask.id);
    } else {
      console.warn('[Checklist] Erro ao criar tarefa via API, usando localStorage');
      await saveTasks(); // Fallback para localStorage
    }
  } catch (error) {
    console.warn('[Checklist] Erro ao criar tarefa via API, usando localStorage:', error);
    await saveTasks(); // Fallback para localStorage
  }
}

async function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    await saveTasks();
    renderTasks();
    updateTaskPercentage();
  }
}

async function deleteTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  
  // Remover do array local
  tasks = tasks.filter(t => t.id !== id);
  
  // Remover do JSON principal via API
  if (task.id && task.id > 0) {
    try {
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        console.warn(`[Checklist] Erro ao deletar tarefa ${task.id} via API:`, response.status);
      }
    } catch (error) {
      console.warn('[Checklist] Erro ao deletar tarefa via API:', error);
    }
  }
  
  await saveTasks();
  renderTasks();
  updateTaskPercentage();
}

function renderTasks() {
  const list = document.getElementById('tasksList');
  if (!list) return;
  
  list.innerHTML = '';
  
  if (tasks.length === 0) {
    list.innerHTML = '<li class="list-group-item text-center text-muted">Nenhuma tarefa ainda. Adicione uma nova tarefa acima!</li>';
    return;
  }
  
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `list-group-item checklist-item ${task.completed ? 'completed' : ''}`;
    li.style.cursor = 'pointer';
    li.style.transition = 'background-color 0.2s ease';
    
    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.text;
    if (task.completed) {
      taskText.style.textDecoration = 'line-through';
      taskText.style.opacity = '0.6';
    }
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-outline-danger';
    deleteBtn.innerHTML = '<i class="bi bi-x-lg"></i>';
    deleteBtn.title = 'Remover tarefa';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'form-check-input me-2';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));
    
    li.appendChild(checkbox);
    li.appendChild(taskText);
    actionsDiv.appendChild(deleteBtn);
    li.appendChild(actionsDiv);
    
    list.appendChild(li);
  });
}

function updateTaskPercentage() {
  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const percentageEl = document.getElementById('checklistPercentage');
  const progressBar = document.getElementById('checklistProgressBar');
  
  if (percentageEl) {
    percentageEl.textContent = `${percentage}%`;
  }
  
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${percentage}%`;
    progressBar.setAttribute('aria-valuenow', percentage);
    progressBar.setAttribute('aria-valuemin', 0);
    progressBar.setAttribute('aria-valuemax', 100);
  }
}

// Disponibiliza funções globalmente
window.addTask = addTask;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// Inicializa ao carregar a página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChecklist);
} else {
  initChecklist();
}

