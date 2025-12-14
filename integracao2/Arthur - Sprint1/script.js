// ============================================
// GERENCIAMENTO DE TEMA
// ============================================
function initTheme() {
  // Tenta pegar o tema salvo no localStorage do site principal
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Define o tema inicial
  if (savedTheme) {
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  } else {
    document.documentElement.classList.toggle('dark', prefersDark);
  }
}

// Event listener para o botão de alternar tema
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}

// Função para alternar tema
function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark', !isDark);
  localStorage.setItem('theme', !isDark ? 'dark' : 'light');
}

// ============================================
// BOTÃO DE PERFIL
// ============================================
function initProfileButton() {
  const profileBtn = document.getElementById('profileBtn');
  const profileImg = document.getElementById('profileImg');
  const profileIcon = document.getElementById('profileIcon');
  
  if (!profileBtn) return;
  
  // Verifica se o usuário está logado
  const currentUserKey = 'desligaAI_currentUser';
  const currentUserData = localStorage.getItem(currentUserKey);
  
  if (currentUserData) {
    try {
      const user = JSON.parse(currentUserData);
      
      // Mostra o botão
      profileBtn.classList.remove('d-none');
      
      // Se o usuário tem foto, mostra a foto
      if (user.photo && profileImg) {
        profileImg.src = user.photo;
        profileImg.classList.remove('d-none');
        if (profileIcon) profileIcon.classList.add('d-none');
      } else {
        // Se não tem foto, mostra o ícone
        if (profileImg) profileImg.classList.add('d-none');
        if (profileIcon) profileIcon.classList.remove('d-none');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      profileBtn.classList.add('d-none');
    }
  } else {
    profileBtn.classList.add('d-none');
  }
}

function goToProfile() {
  window.location.href = '../gabriel/perfil_usuario/perfil.html';
}

// Inicializa o tema e o botão de perfil ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  initProfileButton();
});

// ============================================
// TRACKER DE PROGRESSO
// ============================================
// Removendo as keys de Local Storage para focar no JSON
const TASKS_STORAGE_KEY = 'shortvid_tracker_tasks_v1';

// Helpers
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

// Elementos
const form = $('#entryForm');
const dateInput = $('#date');
const minutesInput = $('#minutes');
const cravingInput = $('#craving');
const moodInput = $('#mood');
const notesInput = $('#notes');
const list = $('#entriesList');
const totalDaysEl = $('#totalDays');
const totalMinutesEl = $('#totalMinutes');
const bestStreakEl = $('#bestStreak');
const avgMinutesEl = $('#avgMinutes');
const chart = $('#chart');
const clearAllBtn = $('#clearAll');

// Elementos de Exportação/Importação
const exportBtn = $('#exportBtn');
const importBtn = $('#importBtn');
const importFile = $('#importFile');

// Elementos do Checklist
const taskInput = $('#new-task-input');
const addTaskBtn = $('#add-task-btn');
const taskList = $('#task-list');
const checklistPercentage = $('#checklist-percentage');

// Estado
let entries = []; // Inicializamos vazio
let editingId = null;
let tasks = loadTasks(); // Mantemos o checklist no LS por simplicidade

// Inicialização
(async function init(){ 
    // Tenta carregar os dados do arquivo data.json na inicialização
    entries = await loadEntries(); 
    
    const today = new Date().toISOString().slice(0,10);
    dateInput.value = today;
    render();
    renderTasks();
})();

// NOVO: Carrega dados do arquivo JSON
async function loadEntries(){
    try{
        const response = await fetch('./data.json');
        if (!response.ok) {
            console.warn('data.json não encontrado ou erro de carregamento. Retornando array vazio.');
            return [];
        }
        const parsed = await response.json();
        
        const entryData = parsed.entries || parsed; 

        entryData.sort((a,b)=> b.date.localeCompare(a.date));
        return entryData;

    }catch(e){
        console.error('Erro ao carregar data.json', e);
        return [];
    }
}

// MODIFICADO: Não salva permanentemente. Apenas atualiza a memória e renderiza.
function saveEntries(){
    console.warn("Funcionalidade de salvamento permanente (em arquivo JSON) está desativada. Use 'Exportar JSON' para salvar seu progresso.");
    render(); 
}

function addOrUpdate(entry){
    if(editingId){
        const idx = entries.findIndex(e=> e.id === editingId);
        if(idx>-1) entries[idx] = {...entries[idx], ...entry};
        editingId = null;
    }else{
        entries.push(entry);
    }
    entries.sort((a,b)=> b.date.localeCompare(a.date));
    saveEntries(); 
}

function removeEntry(id){
    entries = entries.filter(e=> e.id !== id);
    saveEntries();
}

form.addEventListener('submit', e=>{
    e.preventDefault();
    const date = dateInput.value;
    const minutes = Number(minutesInput.value)||0;
    const craving = Number(cravingInput.value)||0;
    const mood = moodInput.value.trim();
    const notes = notesInput.value.trim();

    if(!date){ alert('Escolha uma data'); return; }

    const entry = {
        id: editingId || 'id_'+Date.now(),
        date, minutes, craving, mood, notes, createdAt: new Date().toISOString()
    };

    addOrUpdate(entry);
    form.reset();
    dateInput.value = new Date().toISOString().slice(0,10);
    minutesInput.value = '';
    cravingInput.value = '0';
    moodInput.value = '';
    notesInput.value = '';
});

function render(){
    // List
    list.innerHTML = '';
    if(entries.length===0){ list.innerHTML = '<div class="small" style="padding:12px;color:var(--muted-light)">Nenhuma entrada ainda.</div>'; }
    entries.forEach(e=>{
        const el = document.createElement('div'); el.className='entry';
        el.innerHTML = `
            <div class="entry-info"> 
                <div style="display:flex;align-items:center;gap:10px">
                    <div style="font-weight:600">${e.date}</div>
                    <div class="meta">${e.minutes} min • desejo ${e.craving} • ${e.mood||'—'}</div>
                </div>
                <div class="small" style="margin-top:6px">${(e.notes||'').replace(/\n/g,'<br>')}</div>
            </div>
            <div class="controls">
                <button class="btn ghost" data-action="edit" data-id="${e.id}">Editar</button>
                <button class="btn" data-action="del" data-id="${e.id}">Remover</button>
            </div>
        `;
        list.appendChild(el);
    });

    // Stats
    const totalDays = entries.length;
    const totalMinutes = entries.reduce((s,i)=> s + (Number(i.minutes)||0),0);
    const avgMinutes = totalDays ? Math.round(totalMinutes/totalDays) : 0;
    const bestStreak = calcBestStreak();
    totalDaysEl.textContent = totalDays;
    totalMinutesEl.textContent = totalMinutes;
    avgMinutesEl.textContent = avgMinutes;
    bestStreakEl.textContent = bestStreak;

    // Chart last 7 days
    drawChart();

    // Attach buttons
    $$("[data-action='edit']").forEach(btn=> btn.onclick = ()=> startEdit(btn.dataset.id));
    $$("[data-action='del']").forEach(btn=> btn.onclick = ()=> {
        if(confirm('Remover este registro?')) removeEntry(btn.dataset.id);
    });
}

function startEdit(id){
    const e = entries.find(it=> it.id===id);
    if(!e) return;
    editingId = id;
    dateInput.value = e.date;
    minutesInput.value = e.minutes;
    cravingInput.value = e.craving;
    moodInput.value = e.mood;
    notesInput.value = e.notes;
    window.scrollTo({top:0,behavior:'smooth'});
}

clearAllBtn.addEventListener('click', ()=>{
    if(confirm('Apagar todas as entradas? Os dados não serão persistidos após o recarregamento da página.')){
        entries = [];
        localStorage.removeItem(TASKS_STORAGE_KEY); // Remove o checklist do LS
        tasks = []; 
        render(); 
        renderTasks();
    }
});

// FUNÇÃO DE EXPORTAÇÃO
exportBtn.addEventListener('click', ()=>{
    const dataToExport = {
        entries: entries,
        tasks: tasks
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'desliga_digital_backup_'+Date.now()+'.json';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    alert('Backup JSON exportado com sucesso!');
});

// FUNÇÃO DE IMPORTAÇÃO
importBtn.addEventListener('click', ()=> importFile.click());
importFile.addEventListener('change', ev=>{
    const f = ev.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = ()=>{
        try{
            const parsed = JSON.parse(reader.result);
            
            if(!parsed.entries || !Array.isArray(parsed.entries) || !parsed.tasks || !Array.isArray(parsed.tasks)) {
                throw new Error('Formato JSON inválido. Verifique se contém "entries" e "tasks".');
            }

            if (confirm("Importar dados? Isso substituirá todos os dados atuais na sua sessão.")) {
                // Sobrescreve dados na memória e no Local Storage (para o checklist)
                entries = parsed.entries;
                localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(parsed.tasks)); 
                tasks = parsed.tasks;
                
                render();
                renderTasks();
                alert('Dados importados com sucesso!');
            }
            
            importFile.value = '';
        }catch(err){ 
            alert('Erro ao importar o arquivo: ' + err.message); 
        }
    };
    reader.readAsText(f);
});

// Simple chart
function drawChart(){
    const ctx = chart.getContext('2d');
    const w = chart.width = chart.clientWidth * (window.devicePixelRatio||1);
    const h = chart.height = 120 * (window.devicePixelRatio||1);
    ctx.clearRect(0,0,w,h);

    const last7 = [];
    for(let i=6;i>=0;i--){
        const d = new Date(); d.setDate(d.getDate()-i);
        const key = d.toISOString().slice(0,10);
        const entry = entries.find(e=> e.date===key);
        last7.push({date:key, minutes: entry? Number(entry.minutes)||0 : 0});
    }
    const max = Math.max(...last7.map(x=> x.minutes), 1);
    const pad = 20*(window.devicePixelRatio||1);
    const areaW = w - pad*2;
    const barW = areaW / 7 * 0.7;
    last7.forEach((d,i)=>{
        const x = pad + i*(areaW/7) + (areaW/7 - barW)/2;
        const barH = (d.minutes / max) * (h - pad*2);
        const y = h - pad - barH;
        ctx.fillStyle = 'rgba(96,165,250,0.9)';
        ctx.fillRect(x, y, barW, barH);
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.font = (11*(window.devicePixelRatio||1))+'px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(d.date.slice(5), x + barW/2, h - pad/2);
    });
}

function calcBestStreak(){
    if(entries.length===0) return 0;
    const set = new Set(entries.filter(e=> Number(e.minutes)>0).map(e=> e.date));
    const dates = entries.map(e=> e.date).sort();
    let best = 0, cur = 0; let prev = null;
    const unique = Array.from(new Set(dates)).sort();
    unique.forEach(d=>{
        if(!prev){ prev = d; cur = set.has(d)?1:0; best = Math.max(best,cur); return; }
        const pd = new Date(prev); const cd = new Date(d);
        const diff = (cd - pd)/(1000*60*60*24);
        if(diff===1 && set.has(d)){
            cur += 1;
        }else{
            cur = set.has(d)?1:0;
        }
        best = Math.max(best, cur);
        prev = d;
    });
    return best;
}

window.addEventListener('resize', ()=> drawChart());

// --- Funções do Checklist de Atividades (Tasks) ---
function loadTasks() {
    try {
        const rawTasks = localStorage.getItem(TASKS_STORAGE_KEY);
        return rawTasks ? JSON.parse(rawTasks) : [];
    } catch (e) {
        console.error("Erro ao carregar tarefas", e);
        return [];
    }
}

function saveTasks() {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.className = "checklist-item";
        if (task.completed) li.classList.add("completed");
        
        const taskText = document.createElement("span");
        taskText.textContent = task.text;
        taskText.className = "task-text";
        
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "task-actions";
        
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = "✕";
        deleteBtn.title = "Remover tarefa";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation(); 
            deleteTask(index);
        });

        li.addEventListener("click", () => toggleTask(index));
        
        li.appendChild(taskText);
        actionsDiv.appendChild(deleteBtn);
        li.appendChild(actionsDiv);
        taskList.appendChild(li);
    });
    updateTaskPercentage();
}

function addTask() {
    const text = taskInput.value.trim();
    if (text === "") return;
    tasks.push({ text, completed: false });
    taskInput.value = "";
    saveTasks();
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
}

function updateTaskPercentage() {
    if (tasks.length === 0) {
        checklistPercentage.textContent = "0%";
        return;
    }
    const completedCount = tasks.filter(t => t.completed).length;
    const percentage = Math.round((completedCount / tasks.length) * 100);
    checklistPercentage.textContent = `${percentage}%`;
}

// Eventos do Checklist
addTaskBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        addTask();
    }
});
