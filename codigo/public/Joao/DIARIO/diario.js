document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('reflection');
  const saveBtn = document.getElementById('save-btn');
  const entriesContainer = document.getElementById('entries');

  // Carregar entradas
  function loadEntries() {
    const entries = JSON.parse(localStorage.getItem('desligaAi-diario') || '[]');
    entriesContainer.innerHTML = entries.map(entry => `
      <div class="entry">
        <div class="date">${entry.date}</div>
        <div class="text">${entry.text.replace(/\n/g, '<br>')}</div>
      </div>
    `).join('');
  }

  // Salvar
  saveBtn.addEventListener('click', () => {
    const text = textarea.value.trim();
    if (!text) {
      alert('Escreva algo antes de salvar.');
      return;
    }

    const date = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const entry = { date, text };
    const entries = JSON.parse(localStorage.getItem('desligaAi-diario') || '[]');
    entries.unshift(entry);
    localStorage.setItem('desligaAi-diario', JSON.stringify(entries));

    textarea.value = '';
    loadEntries();
    
    // Feedback visual
    saveBtn.textContent = 'Salvo!';
    setTimeout(() => saveBtn.textContent = 'Salvar Reflexão', 1500);
  });

  // Inicializar
  loadEntries();
});