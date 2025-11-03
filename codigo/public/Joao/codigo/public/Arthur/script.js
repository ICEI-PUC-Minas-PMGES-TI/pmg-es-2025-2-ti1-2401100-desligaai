// Key de armazenamento
const STORAGE_KEY = 'shortvid_tracker_entries_v1';
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

// Elementos do Checklist
const taskInput = $('#new-task-input');
const addTaskBtn = $('#add-task-btn');
const taskList = $('#task-list');
const checklistPercentage = $('#checklist-percentage');

// Estado
let entries = loadEntries();
let editingId = null;
let tasks = loadTasks();

// Inicialização
(function init(){
    const today = new Date().toISOString().slice(0,10);
    dateInput.value = today;
    render();
    renderTasks();
})();

// --- Funções de Registro Principal (Entries) ---
function loadEntries(){
    try{
        const raw = localStorage.getItem(STORAGE_KEY);
        if(!raw) return [];
        const parsed = JSON.parse(raw);
        parsed.sort((a,b)=> b.date.localeCompare(a.date));
        return parsed;
    }catch(e){
        console.error('Erro ao carregar entries', e);
        return [];
    }
}

function saveEntries(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
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
    
    list.innerHTML = '';
    if(entries.length===0){ list.innerHTML = '<div class="small" style="padding:12px;color:var(--muted)">Nenhuma entrada ainda.</div>'; }
    entries.forEach(e=>{
        const el = document.createElement('div'); el.className='entry';
        el.innerHTML = `
            <div style="flex:1">
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
    if(confirm('Apagar todas as entradas? Essa ação não pode ser desfeita.')){
        entries = [];
        tasks = []; 
        saveEntries();
        saveTasks();
    }
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
            e.stopPropagation(); // Previne o clique no item
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
