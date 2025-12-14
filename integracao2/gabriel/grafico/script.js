window.addEventListener("DOMContentLoaded", async () => {
  const plataformaSelect = document.getElementById("plataforma");
  const plataformaInfo = document.getElementById("plataformaSelecionada");
  const tempoInput = document.getElementById("tempo");
  const dataInput = document.getElementById("data");
  const registrarBtn = document.getElementById("registrarBtn");
  const ctx = document.getElementById("graficoUso").getContext("2d");

  const plataformas = {
    instagram: { nome: "Instagram", img: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png" },
    tiktok: { nome: "TikTok", img: "https://cdn-icons-png.flaticon.com/512/3046/3046122.png" },
    youtube: { nome: "YouTube", img: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png" },
    kwai: { nome: "Kwai", img: "https://cdn-icons-png.flaticon.com/512/5968/5968885.png" }
  };

  // API base (json-server) - quando estiver rodando em http://localhost:3000
  const API_BASE = 'http://localhost:3000';

  // Registros em memória — vamos tentar carregar do JSON Server (API_BASE + /registros)
  // e caso falhe usar /gabriel/db.json (arquivo estático). NÃO usar localStorage.
  let registros = [];

  async function loadRegistros() {
    // 1) tenta JSON Server
    try {
  const res = await fetch(`${API_BASE}/registros`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          registros = data;
          return;
        }
      }
    } catch (e) {
      console.warn('Não foi possível obter /registros do JSON Server', e);
    }

    // 2) fallback para o arquivo estático criado em /gabriel/db.json
    try {
  const res2 = await fetch('/gabriel/db.json');
      if (res2.ok) {
        const blob = await res2.json();
        if (blob && Array.isArray(blob.registros)) {
          registros = blob.registros;
          return;
        }
      }
    } catch (e) {
      console.warn('Não foi possível obter /gabriel/db.json', e);
    }

    // 3) fallback final para arquivo estático em /gabriel/db.json
    try {
      registros = [];
      const res3 = await fetch('/gabriel/db.json');
      if (res3.ok) {
        const blob = await res3.json();
        if (blob && Array.isArray(blob.registros)) registros = blob.registros;
      }
    } catch (e) { registros = []; }
  }

  // Tipo atual do gráfico ('line' ou 'bar')
  let currentChartType = 'line';

  // Helper para escurecer/clarear cores (aceita hex como '#rrggbb')
  const shadeColor = (color, percent) => {
    // percent -100..100
    const f = parseInt(color.slice(1),16), t = percent<0?0:255, p = Math.abs(percent)/100;
    const R = Math.round((t - (f>>16)) * p) + (f>>16);
    const G = Math.round((t - ((f>>8)&0x00FF)) * p) + ((f>>8)&0x00FF);
    const B = Math.round((t - (f&0x0000FF)) * p) + (f&0x0000FF);
    return '#' + (0x1000000 + (R<<16) + (G<<8) + B).toString(16).slice(1);
  };

  // Cores por plataforma (personalizáveis)
  const coresPlataforma = {
    Instagram: '#E1306C', // rosa/roxo do Instagram
    TikTok: '#69C9D0',    // cyan TikTok
    YouTube: '#FF0000',   // vermelho YouTube
    Kwai: '#FFC107'       // amarelo Kwai
  };

  // Função para agrupar registros por data e plataforma e construir datasets por plataforma
  const construirDatasetsPorPlataforma = () => {
    // coletar todas as datas únicas (ordenadas)
    const datasSet = new Set(registros.map(r => r.data));
    const datas = Array.from(datasSet).sort();

    // inicializar mapa plataforma -> {label, data[]}
    const plataformasPresentes = {};
    Object.values(plataformas).forEach(p => {
      plataformasPresentes[p.nome] = datas.map(() => 0);
    });

    // somar tempos por data/plataforma
    registros.forEach(r => {
      const idx = datas.indexOf(r.data);
      if (idx === -1) return;
      if (!plataformasPresentes[r.plataforma]) {
        // se existir plataforma que não está no mapeamento inicial (segurança)
        plataformasPresentes[r.plataforma] = datas.map(() => 0);
      }
      plataformasPresentes[r.plataforma][idx] += Number(r.tempo);
    });

    // formatar labels (DD/MM) para exibir no eixo X
    // Parse 'YYYY-MM-DD' as local date to avoid timezone shift (new Date('YYYY-MM-DD') can be parsed as UTC)
    const formatDateLabel = (s) => {
      if (!s) return s;
      const parts = s.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        // construct local Date
        const d = new Date(Number(year), Number(month) - 1, Number(day));
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return `${dd}/${mm}`;
      }
      // fallback: try to parse loosely
      try {
        const d = new Date(s);
        return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
      } catch (e) { return s; }
    };

    const formattedLabels = datas.map(formatDateLabel);

    // criar array de datasets para Chart.js (uma série por plataforma)
    const datasets = Object.keys(plataformasPresentes).map((nome) => {
      const color = coresPlataforma[nome] || '#888888';
      // se o tipo atual é 'bar', use estilo de barras agrupadas
      if (currentChartType === 'bar') {
        return {
          label: nome,
          data: plataformasPresentes[nome],
          backgroundColor: color,
          borderColor: shadeColor(color, -10),
          borderWidth: 1,
          type: 'bar',
          barPercentage: 0.7,
          categoryPercentage: 0.7
        };
      }

      // padrão: linha
      return {
        label: nome,
        data: plataformasPresentes[nome],
        borderColor: color,
        backgroundColor: color + '33', // cor com alpha
        tension: 0.3,
        fill: false,
        pointRadius: 4,
        borderWidth: 2,
        type: 'line'
      };
    });

    return { labels: formattedLabels, datasets };
  };

  // Função para atualizar o gráfico
  const atualizarGrafico = () => {
    const novo = construirDatasetsPorPlataforma();
    grafico.data.labels = novo.labels;
    grafico.data.datasets = novo.datasets;
    // aplicar filtro de plataformas selecionadas
    const sel = plataformasSelecionadas();
    grafico.data.datasets.forEach(ds => { ds.hidden = !(sel.length ? sel.includes(ds.label) : true); });
    grafico.update();
    atualizarThumbnails();
  };

  // Configuração inicial (vazia, será preenchida por atualizarGrafico)
  const dadosIniciais = construirDatasetsPorPlataforma();

  const grafico = new Chart(ctx, {
    type: currentChartType,
    data: dadosIniciais,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      stacked: false,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Tempo (minutos)' }, ticks: { precision: 0 } },
        x: {
          title: { display: true, text: 'Data' },
          stacked: false,
          offset: true,
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            padding: 8,
            font: { size: 12 }
          }
        }
      },
      plugins: {
        legend: { display: true, position: 'bottom' },
        tooltip: { mode: 'index', intersect: false }
      }
    }
  });

  // Seletor de tipo de gráfico
  const tipoGraficoSelect = document.getElementById('tipoGrafico');
  const plataformaCheckboxes = Array.from(document.querySelectorAll('.plataformaFiltro'));

  // Função para recriar o gráfico com novo tipo
  const trocarTipoGrafico = (novoTipo) => {
    currentChartType = novoTipo;
    grafico.config.type = novoTipo;
    grafico.update();
  };

  tipoGraficoSelect.addEventListener('change', (e) => { trocarTipoGrafico(e.target.value); atualizarGrafico(); });

  // Thumbnails
  const thumbLine = document.getElementById('thumbLine');
  const thumbBar = document.getElementById('thumbBar');

  const desenharMiniatura = (canvas, tipo) => {
    const c = canvas.getContext('2d');
    c.clearRect(0,0,canvas.width,canvas.height);
    c.fillStyle = '#fff';
    c.fillRect(0,0,canvas.width,canvas.height);
    c.strokeStyle = '#ddd';
    c.strokeRect(0,0,canvas.width,canvas.height);
    // desenho simples
    c.strokeStyle = '#999';
    if (tipo === 'line') {
      c.beginPath(); c.moveTo(8,canvas.height-18); c.lineTo(40,30); c.lineTo(80,50); c.lineTo(120,20); c.lineTo(152,36); c.stroke();
    } else {
      // barras
      c.fillStyle = '#f0b700';
      c.fillRect(12,32,18,36);
      c.fillRect(42,18,18,50);
      c.fillRect(72,8,18,60);
      c.fillRect(102,26,18,42);
    }
  };

  const atualizarThumbnails = () => { desenharMiniatura(thumbLine, 'line'); desenharMiniatura(thumbBar, 'bar'); };
  atualizarThumbnails();

  thumbLine.addEventListener('click', () => { tipoGraficoSelect.value = 'line'; trocarTipoGrafico('line'); });
  thumbBar.addEventListener('click', () => { tipoGraficoSelect.value = 'bar'; trocarTipoGrafico('bar'); });

  // Retorna array com plataformas selecionadas no painel (strings com os nomes conforme labels)
  const plataformasSelecionadas = () => plataformaCheckboxes.filter(cb => cb.checked).map(cb => cb.value);

  // Ao mudar seleção de plataformas, atualiza o gráfico (oculta datasets não selecionados)
  plataformaCheckboxes.forEach(cb => cb.addEventListener('change', () => {
    const selecionadas = plataformasSelecionadas();
    grafico.data.datasets.forEach(ds => { ds.hidden = !selecionadas.includes(ds.label); });
    grafico.update();
  }));

  // Preferimos o servidor (json-server) quando disponível; fallback para /gabriel/db.json. Não usar localStorage.

  // Exibir ícone da plataforma escolhida
  plataformaSelect.addEventListener("change", () => {
    const valor = plataformaSelect.value;
    plataformaInfo.innerHTML = "";

    if (valor && plataformas[valor]) {
      const { nome, img } = plataformas[valor];
      plataformaInfo.innerHTML = `<span>${nome}</span><img src="${img}" alt="${nome}">`;
    }
  });

  // Registrar tempo — tenta persistir no JSON Server via POST, senão salva localmente
  registrarBtn.addEventListener("click", async () => {
    const plataforma = plataformaSelect.value;
    const tempo = parseInt(tempoInput.value);
    const data = dataInput.value;

    if (!plataforma || isNaN(tempo) || tempo <= 0 || !data) {
      alert("Preencha todos os campos corretamente!");
      return;
    }

    const novoRegistro = {
      plataforma: plataformas[plataforma].nome,
      tempo: tempo,
      data: data
    };

    // Tenta POSTar no JSON Server; se falhar, mantém apenas em memória e avisa
    try {
      const res = await fetch(`${API_BASE}/registros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoRegistro)
      });
      if (res.ok) {
        const created = await res.json();
        registros.push(created);
      } else {
        registros.push(novoRegistro);
        alert('Registro adicionado localmente na sessão, mas não foi possível persistir no servidor.');
      }
    } catch (e) {
      console.warn('POST /registros falhou', e);
      registros.push(novoRegistro);
      alert('Registro adicionado localmente na sessão, mas não foi possível persistir no servidor.');
    }

    atualizarGrafico();

    tempoInput.value = "";
    dataInput.value = "";
  });

  // --- Controles de gerenciamento: limpar tudo, apagar dia, editar dia ---
  const dataAlvoInput = document.getElementById('dataAlvo');
  const apagarDiaBtn = document.getElementById('apagarDiaBtn');
  const editarDiaBtn = document.getElementById('editarDiaBtn');
  const limparDadosBtn = document.getElementById('limparDadosBtn');

  // Limpar todo o progresso
  limparDadosBtn.addEventListener('click', () => {
    if (!confirm('Deseja realmente apagar TODO o progresso? Esta ação não pode ser desfeita.')) return;
    // Tenta remover no servidor todos os registros (apenas os que têm id)
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/registros`);
        if (res.ok) {
          const srv = await res.json();
          for (const r of srv) {
            if (r.id != null) await fetch(`${API_BASE}/registros/${r.id}`, { method: 'DELETE' });
          }
          registros = [];
          atualizarGrafico();
          alert('Todos os registros foram apagados no servidor.');
          return;
        }
      } catch (e) { /* falha no servidor */ }
      // se não conseguiu falar com o servidor, apenas limpa a sessão atual
      registros = [];
      atualizarGrafico();
      alert('Registros removidos apenas na sessão (não foi possível acessar o servidor).');
    })();
  });

  // Apagar progresso do dia selecionado
  apagarDiaBtn.addEventListener('click', () => {
    const dia = dataAlvoInput.value;
    if (!dia) { alert('Selecione a data alvo para apagar.'); return; }
    if (!confirm(`Apagar todos os registros do dia ${dia}?`)) return;
    // Se houver plataformas selecionadas, só removemos registros dessas plataformas
    const selecionadas = plataformasSelecionadas();
    // tenta apagar no servidor os registros com id correspondente; se falhar, limpa na sessão
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/registros`);
        if (res.ok) {
          const srv = await res.json();
          for (const r of srv) {
            if (r.data === dia && (selecionadas.length === 0 || selecionadas.includes(r.plataforma))) {
              if (r.id != null) await fetch(`${API_BASE}/registros/${r.id}`, { method: 'DELETE' });
            }
          }
          // atualizar lista local reconsultando servidor
          await loadRegistros();
          atualizarGrafico();
          alert(`Registros do dia ${dia} apagados no servidor.`);
          return;
        }
      } catch (e) { /* falha no servidor */ }
      // fallback: apenas remove na sessão atual
      if (selecionadas.length === 0) {
        registros = registros.filter(r => r.data !== dia);
      } else {
        registros = registros.filter(r => !(r.data === dia && selecionadas.includes(r.plataforma)));
      }
      atualizarGrafico();
      alert(`Registros do dia ${dia} removidos apenas na sessão (não persistido).`);
    })();
  });

  // Editar progresso do dia: preserva múltiplos registros por plataforma/data
  editarDiaBtn.addEventListener('click', () => {
    const dia = dataAlvoInput.value;
    if (!dia) { alert('Selecione a data alvo para editar.'); return; }

    // Para cada plataforma que está selecionada no painel perguntamos o total desejado para o dia
    const selecionadas = plataformasSelecionadas();
    const keysIterar = selecionadas.length ? Object.values(plataformas).filter(p => selecionadas.includes(p.nome)) : Object.values(plataformas);
    for (const key of keysIterar) {
      const nome = key.nome;
      // encontrar índices dos registros correspondentes (no array original)
      const idxs = [];
      for (let i = 0; i < registros.length; i++) {
        if (registros[i].data === dia && registros[i].plataforma === nome) idxs.push(i);
      }

      const somaAtual = idxs.reduce((s, i) => s + Number(registros[i].tempo), 0);
      const textoPadrao = somaAtual ? String(somaAtual) : '0';
      const resposta = prompt(`Novo tempo total (min) para ${nome} em ${dia}? (deixe vazio para pular)`, textoPadrao);
      if (resposta === null) return; // cancelou a operação inteira
      const valor = resposta.trim();
      if (valor === '') continue; // pula esta plataforma
      const num = Number(valor);
      if (isNaN(num) || num < 0) { alert('Valor inválido, operação abortada. Use números positivos.'); return; }

      if (somaAtual > 0) {
        // já existem registros: se num == 0 remove todos, senão escala proporcionalmente
        if (num === 0) {
          // remover do final para manter índices válidos
          registros = registros.filter(r => !(r.data === dia && r.plataforma === nome));
        } else {
          const fator = num / somaAtual;
          // aplicar escala proporcionalmente, arredondando, ajustando o último para bater o total
          let restante = num;
          for (let j = 0; j < idxs.length; j++) {
            const i = idxs[j];
            if (j < idxs.length - 1) {
              const novo = Math.round(Number(registros[i].tempo) * fator);
              registros[i].tempo = novo;
              restante -= novo;
            } else {
              registros[i].tempo = restante;
            }
          }
        }
      } else {
        // não havia registros: se num > 0 cria um novo registro único para essa plataforma/dia
        if (num > 0) {
          registros.push({ plataforma: nome, tempo: num, data: dia });
        }
      }
    }

  // tentar sincronizar alterações com o servidor para registros que possuem id
  (async () => {
    let synced = true;
    try {
      for (const r of registros) {
        if (r.id != null) {
          await fetch(`${API_BASE}/registros/${r.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tempo: r.tempo })
          });
        }
      }
    } catch (e) { synced = false; console.warn('Falha ao sincronizar alterações com o servidor', e); }
    atualizarGrafico();
    alert(synced ? 'Edição concluída e sincronizada com o servidor.' : 'Edição aplicada apenas na sessão (não persistida).');
  })();
  });

  // Ao carregar a página, carrega registros do JSON Server / fallback e atualiza o gráfico
  await loadRegistros();
  // carregar usuário para o bloco do header (usar id query ou padrão 4)
  async function loadUserForHeader(){
    const params = new URLSearchParams(location.search);
    const id = params.get('id') || params.get('user') || '4';
    try{
      // tenta por id numérico
      if (/^\d+$/.test(String(id))) {
        const res = await fetch(`${API_BASE}/usuarios/${id}`);
        if(res.ok){ currentUser = await res.json(); return; }
      }
      // tenta por login
      const resQ = await fetch(`${API_BASE}/usuarios?login=${encodeURIComponent(id)}`);
      if(resQ.ok){ const arr = await resQ.json(); if(Array.isArray(arr) && arr.length){ currentUser = arr[0]; return; } }
    }catch(e){ console.warn('Falha ao obter usuário do servidor', e); }
    try{
      const res2 = await fetch('/gabriel/db.json');
      if(res2.ok){ const blob = await res2.json(); if(blob && Array.isArray(blob.usuarios)){ currentUser = blob.usuarios.find(u => String(u.id) === String(id) || String(u.login) === String(id)); }}
    }catch(_){ /* ignore */ }
  }

  await loadUserForHeader();
  if(currentUser){
    const ua = document.querySelector('.user-avatar');
    const uname = document.querySelector('.user-name');
    const uemail = document.querySelector('.user-email');
    if(ua) ua.textContent = (currentUser.nome||currentUser.login||'U').trim().charAt(0).toUpperCase();
    if(uname) uname.textContent = currentUser.nome || currentUser.login || '';
    if(uemail) uemail.textContent = currentUser.login ? `${currentUser.login}@exemplo.com` : '';
  }
  atualizarGrafico();
});
