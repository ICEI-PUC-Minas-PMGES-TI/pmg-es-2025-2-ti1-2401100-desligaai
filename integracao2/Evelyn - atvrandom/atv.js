// ============================================
// GERENCIAMENTO DE TEMA (Dark/Light)
// ============================================
function initTheme() {
  // Verifica se há tema salvo no localStorage
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Define o tema inicial
  if (savedTheme) {
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  } else {
    document.documentElement.classList.toggle('dark', prefersDark);
  }
  
  // Event listener para o botão de alternar tema
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
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
  
  const currentUserKey = 'desligaAI_currentUser';
  const currentUserData = localStorage.getItem(currentUserKey);
  
  if (currentUserData) {
    try {
      const user = JSON.parse(currentUserData);
      profileBtn.classList.remove('d-none');
      
      if (user.photo && profileImg) {
        profileImg.src = user.photo;
        profileImg.classList.remove('d-none');
        if (profileIcon) profileIcon.classList.add('d-none');
      } else {
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

// ============================================
// ATIVIDADES OFFLINE ALEATÓRIAS
// ============================================
const API = "http://localhost:3000/atividades";

// ===== ELEMENTOS DO DOM =====
let btnPlay, atividadeGerada, somClique, cubo;
let inputAtividade, btnAdicionar, listaAtividades, btnToggleLista;

// ----------- FUNÇÕES CRUD -----------

// Buscar todas as atividades
async function buscarAtividades() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`Erro ao buscar: ${res.status}`);
    const dados = await res.json();
    return dados;
  } catch (err) {
    console.error("Erro ao buscar atividades:", err);
    return [];
  }
}

// Criar nova atividade
async function criarAtividade(obj) {
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(obj),
    });
    if (!res.ok) throw new Error(`Erro ao criar: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Erro ao criar atividade:", err);
    throw err;
  }
}

// Atualizar atividade
async function atualizarAtividade(id, obj) {
  try {
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(obj),
    });
    if (!res.ok) throw new Error(`Erro ao atualizar: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Erro ao atualizar atividade:", err);
    throw err;
  }
}

// Deletar atividade
async function deletarAtividade(id) {
  try {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    return res.ok;
  } catch (err) {
    console.error("Erro ao deletar atividade:", err);
    return false;
  }
}

// Renderizar lista de atividades
async function renderizarAtividades() {
  const atividades = await buscarAtividades();
  if (!listaAtividades) return;
  
  listaAtividades.innerHTML = "";

  if (atividades.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-muted";
    li.textContent = "Nenhuma atividade cadastrada ainda.";
    listaAtividades.appendChild(li);
    return;
  }

  atividades.forEach((a) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    
    // Criar span para o texto da atividade (usando textContent para evitar problemas com caracteres especiais)
    const spanTexto = document.createElement("span");
    spanTexto.textContent = a.texto;
    spanTexto.style.flex = "1";
    spanTexto.style.marginRight = "10px";
    spanTexto.style.wordBreak = "break-word";
    
    // Criar container para os botões
    const divBotoes = document.createElement("div");
    divBotoes.style.display = "flex";
    divBotoes.style.gap = "8px";
    divBotoes.style.flexShrink = "0";
    
    // Criar botão Editar
    const btnEditar = document.createElement("button");
    btnEditar.className = "btn btn-sm btn-primary";
    btnEditar.setAttribute("data-action", "edit");
    btnEditar.setAttribute("data-id", a.id);
    btnEditar.innerHTML = '<i class="bi bi-pencil"></i> Editar';
    
    // Criar botão Excluir
    const btnExcluir = document.createElement("button");
    btnExcluir.className = "btn btn-sm btn-danger";
    btnExcluir.setAttribute("data-action", "delete");
    btnExcluir.setAttribute("data-id", a.id);
    btnExcluir.innerHTML = '<i class="bi bi-trash"></i> Excluir';
    
    // Adicionar botões ao container
    divBotoes.appendChild(btnEditar);
    divBotoes.appendChild(btnExcluir);
    
    // Adicionar elementos ao li
    li.appendChild(spanTexto);
    li.appendChild(divBotoes);

    // Event listeners para os botões
    btnEditar.addEventListener('click', async () => {
      const novoTexto = prompt("Editar atividade:", a.texto);
      if (novoTexto && novoTexto.trim() !== "") {
        try {
          await atualizarAtividade(a.id, { texto: novoTexto.trim() });
          await renderizarAtividades();
        } catch (err) {
          alert("Erro ao atualizar atividade. Verifique se o json-server está rodando.");
        }
      }
    });

    btnExcluir.addEventListener('click', async () => {
      // Criar mensagem de confirmação de forma segura (textContent já trata caracteres especiais)
      if (confirm("Deseja realmente excluir esta atividade?")) {
        try {
          const sucesso = await deletarAtividade(a.id);
          if (sucesso) {
            await renderizarAtividades();
          } else {
            alert("Erro ao excluir atividade. Verifique se o json-server está rodando.");
          }
        } catch (err) {
          alert("Erro ao excluir atividade. Verifique se o json-server está rodando.");
        }
      }
    });

    listaAtividades.appendChild(li);
  });
}

// ----------- EVENTOS -----------

// Gerar atividade aleatória (cubo + som + fade)
async function gerarAtividadeAleatoria() {
  if (!btnPlay || !atividadeGerada || !cubo || !somClique) return;

  try {
    if (somClique) {
      somClique.currentTime = 0;
      somClique.play().catch(() => {
        // Ignora erros de áudio
      });
    }

    if (cubo) {
      cubo.classList.add("girando");
      setTimeout(() => {
        if (cubo) cubo.classList.remove("girando");
      }, 2000);
    }

    if (atividadeGerada) {
      atividadeGerada.classList.add("fade");
    }

    const atividades = await buscarAtividades();

    setTimeout(() => {
      if (!atividadeGerada) return;
      
      if (atividades.length === 0) {
        atividadeGerada.textContent = "Nenhuma atividade disponível. Adicione atividades primeiro!";
      } else {
        const idx = Math.floor(Math.random() * atividades.length);
        atividadeGerada.textContent = atividades[idx].texto;
      }
      atividadeGerada.classList.remove("fade");
    }, 600);
  } catch (err) {
    console.error("Erro ao gerar atividade:", err);
    if (atividadeGerada) {
      atividadeGerada.textContent = "Erro ao buscar atividades. Verifique se o json-server está rodando.";
      atividadeGerada.classList.remove("fade");
    }
  }
}

// Adicionar atividade
function adicionarAtividade() {
  if (!inputAtividade || !btnAdicionar) return;

  btnAdicionar.addEventListener("click", async () => {
    if (inputAtividade.value.trim() !== "") {
      try {
        await criarAtividade({ texto: inputAtividade.value.trim() });
        inputAtividade.value = "";
        await renderizarAtividades();
      } catch (err) {
        alert("Erro ao adicionar atividade. Verifique se o json-server está rodando.");
      }
    } else {
      alert("Por favor, digite uma atividade antes de adicionar.");
    }
  });

  // Permitir adicionar com Enter
  inputAtividade.addEventListener("keypress", async (e) => {
    if (e.key === "Enter" && inputAtividade.value.trim() !== "") {
      try {
        await criarAtividade({ texto: inputAtividade.value.trim() });
        inputAtividade.value = "";
        await renderizarAtividades();
      } catch (err) {
        alert("Erro ao adicionar atividade. Verifique se o json-server está rodando.");
      }
    }
  });
}

// Toggle lista de atividades
function toggleListaAtividades() {
  if (!btnToggleLista || !listaAtividades) return;

  btnToggleLista.addEventListener("click", () => {
    const isVisible = listaAtividades.classList.contains("show");
    
    if (isVisible) {
      listaAtividades.classList.remove("show");
      btnToggleLista.innerHTML = '<i class="bi bi-eye me-2"></i>Exibir atividades';
    } else {
      listaAtividades.classList.add("show");
      btnToggleLista.innerHTML = '<i class="bi bi-eye-slash me-2"></i>Ocultar atividades';
    }
  });
}

// Hover no botão para mexer cubo
function setupCuboHover() {
  if (!btnPlay || !cubo) return;

  btnPlay.addEventListener("mouseover", () => {
    if (cubo && !cubo.classList.contains("girando")) {
      cubo.style.transform = "rotateX(25deg) rotateY(35deg) scale(1.1)";
    }
  });

  btnPlay.addEventListener("mouseout", () => {
    if (cubo && !cubo.classList.contains("girando")) {
      cubo.style.transform = "rotateX(20deg) rotateY(30deg) scale(1)";
    }
  });
}

// Mensagem inicial
function mostrarMensagemInicial() {
  const atividadeSection = document.querySelector(".atividade-section");
  if (!atividadeSection) return;

  const mensagemInicial = document.createElement("p");
  mensagemInicial.textContent = "✨ Pronto(a) pra se desconectar?";
  mensagemInicial.className = "text-primary fw-bold mt-3";
  mensagemInicial.style.transition = "opacity 1s ease-in-out";

  atividadeSection.appendChild(mensagemInicial);

  setTimeout(() => {
    mensagemInicial.style.opacity = "0";
    setTimeout(() => mensagemInicial.remove(), 1000);
  }, 3000);
}

// ============================================
// INICIALIZAÇÃO
// ============================================
function initAtividades() {
  // Inicializa elementos do DOM
  btnPlay = document.getElementById("btnPlay");
  atividadeGerada = document.getElementById("atividadeGerada");
  somClique = document.getElementById("somClique");
  cubo = document.getElementById("cubo");
  inputAtividade = document.getElementById("novaAtividade");
  btnAdicionar = document.getElementById("btnAdicionar");
  listaAtividades = document.getElementById("listaAtividades");
  btnToggleLista = document.getElementById("btnToggleLista");

  // Configura eventos
  if (btnPlay) {
    btnPlay.addEventListener("click", gerarAtividadeAleatoria);
  }

  adicionarAtividade();
  toggleListaAtividades();
  setupCuboHover();

  // Renderiza lista de atividades ao carregar
  renderizarAtividades();

  // Esconde a lista inicialmente
  if (listaAtividades) {
    listaAtividades.classList.remove("show");
  }
  if (btnToggleLista) {
    btnToggleLista.innerHTML = '<i class="bi bi-eye me-2"></i>Exibir atividades';
  }

  // Mostra mensagem inicial
  mostrarMensagemInicial();
}

// ============================================
// INICIALIZAÇÃO GERAL
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  initProfileButton();
  initAtividades();
});
