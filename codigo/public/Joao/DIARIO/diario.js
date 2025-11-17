document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('reflection');
  const saveBtn = document.getElementById('save-btn');
  const entriesContainer = document.getElementById('entries');

  function loadEntries() {
    const entries = JSON.parse(localStorage.getItem('desligaAi-diario') || '[]');
    entriesContainer.innerHTML = entries.map(entry => `
      <div class="entry">
        <div class="date">${entry.date}</div>
        <div class="text">${entry.text.replace(/\n/g, '<br>')}</div>
      </div>
    `).join('');
    
    // Scroll suave para a nova entrada
    if (entries.length > 0) {
      entriesContainer.scrollTop = 0;
    }
  }

  saveBtn.addEventListener('click', () => {
    const text = textarea.value.trim();
    if (!text) {
      alert('😐 Escreva algo antes de salvar.');
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
    
    // Feedback mais elegante
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '✨ Salvo com sucesso!';
    saveBtn.style.background = 'linear-gradient(135deg, #00e676, #00c853)';
    
    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.style.background = '';
    }, 2000);
  });

  // Salvar com Enter + Ctrl (evita salvar só com Enter)
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      saveBtn.click();
    }
  });

  loadEntries();
});