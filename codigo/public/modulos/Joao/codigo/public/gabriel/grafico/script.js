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

  // Registros em memória — vamos tentar carregar do JSON Server (/registros)
  // e caso falhe usar /gabriel/db.json (arquivo estático) ou localStorage.
  let registros = [];

  async function loadRegistros() {
    // 1) tenta JSON Server
    try {
      const res = await fetch('/registros');
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

    // 3) fallback final para localStorage
    try {
      registros = JSON.parse(localStorage.getItem('registrosUso')) || [];
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

  // Não usamos servidor: localStorage é a fonte de verdade

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

    // Tenta POSTar no JSON Server
    try {
      const res = await fetch('/registros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoRegistro)
      });
      if (res.ok) {
        const created = await res.json();
        registros.push(created);
      } else {
        registros.push(novoRegistro);
      }
    } catch (e) {
      console.warn('POST /registros falhou, salvando localmente', e);
      registros.push(novoRegistro);
    }

    // sempre atualiza localStorage para modo offline
    localStorage.setItem('registrosUso', JSON.stringify(registros));
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
    registros = [];
    localStorage.removeItem('registrosUso');
    atualizarGrafico();
    alert('Todos os registros foram apagados.');
  });

  // Apagar progresso do dia selecionado
  apagarDiaBtn.addEventListener('click', () => {
    const dia = dataAlvoInput.value;
    if (!dia) { alert('Selecione a data alvo para apagar.'); return; }
    if (!confirm(`Apagar todos os registros do dia ${dia}?`)) return;
    // Se houver plataformas selecionadas, só removemos registros dessas plataformas
    const selecionadas = plataformasSelecionadas();
    if (selecionadas.length === 0) {
      registros = registros.filter(r => r.data !== dia);
    } else {
      registros = registros.filter(r => !(r.data === dia && selecionadas.includes(r.plataforma)));
    }
    localStorage.setItem('registrosUso', JSON.stringify(registros));
    atualizarGrafico();
    alert(`Registros do dia ${dia} apagados.`);
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

  // salvar e atualizar localmente
  localStorage.setItem('registrosUso', JSON.stringify(registros));
  atualizarGrafico();
    alert('Edição concluída para o dia ' + dia);
  });

  // Ao carregar a página, carrega registros do JSON Server / fallback e atualiza o gráfico
  await loadRegistros();
  atualizarGrafico();
});
