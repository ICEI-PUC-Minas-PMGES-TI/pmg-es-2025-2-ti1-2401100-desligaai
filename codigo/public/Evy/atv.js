const API = "http://localhost:3000/atividades";

const btnPlay = document.getElementById("btnPlay");
const atividadeGerada = document.getElementById("atividadeGerada");
const somClique = document.getElementById("somClique");
const cubo = document.getElementById("cubo");

const inputAtividade = document.getElementById("novaAtividade");
const btnAdicionar = document.getElementById("btnAdicionar");
const listaAtividades = document.getElementById("listaAtividades");
const btnToggleLista = document.getElementById("btnToggleLista");

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
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  });
  return await res.json();
}

// Atualizar atividade
async function atualizarAtividade(id, obj) {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  });
  return await res.json();
}

// Deletar atividade
async function deletarAtividade(id) {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  return res.ok;
}

// Renderizar lista de atividades
async function renderizarAtividades() {
  const atividades = await buscarAtividades();
  listaAtividades.innerHTML = "";

  atividades.forEach((a) => {
    const li = document.createElement("li");
    li.textContent = a.texto;

    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.onclick = async () => {
      const novoTexto = prompt("Editar atividade:", a.texto);
      if (novoTexto) {
        await atualizarAtividade(a.id, { texto: novoTexto });
        renderizarAtividades();
      }
    };

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir";
    btnExcluir.onclick = async () => {
      await deletarAtividade(a.id);
      renderizarAtividades();
    };

    li.appendChild(btnEditar);
    li.appendChild(btnExcluir);
    listaAtividades.appendChild(li);
  });
}

// ----------- EVENTOS -----------

// Adicionar atividade
btnAdicionar.addEventListener("click", async () => {
  if (inputAtividade.value.trim() !== "") {
    await criarAtividade({ texto: inputAtividade.value });
    inputAtividade.value = "";
    renderizarAtividades();
  }
});

// Toggle lista de atividades
btnToggleLista.addEventListener("click", () => {
  if (listaAtividades.style.display === "none" || listaAtividades.style.display === "") {
    listaAtividades.style.display = "block";
    btnToggleLista.textContent = "Ocultar atividades";
  } else {
    listaAtividades.style.display = "none";
    btnToggleLista.textContent = "Mostrar atividades";
  }
});

// Gerar atividade aleatória (cubo + som + fade)
btnPlay.addEventListener("click", async () => {
  try {
    somClique.currentTime = 0;
    somClique.play();

    cubo.classList.add("girando");
    setTimeout(() => cubo.classList.remove("girando"), 2000);

    atividadeGerada.classList.add("fade");

    const atividades = await buscarAtividades();

    setTimeout(() => {
      if (atividades.length === 0) {
        atividadeGerada.textContent = "Nenhuma atividade disponível.";
      } else {
        const idx = Math.floor(Math.random() * atividades.length);
        atividadeGerada.textContent = atividades[idx].texto;
      }
      atividadeGerada.classList.remove("fade");
    }, 600);
  } catch (err) {
    console.error(err);
  }
});

// Mensagem inicial
window.addEventListener("load", () => {
  const mensagemInicial = document.createElement("p");
  mensagemInicial.textContent = "✨ Pronto(a) pra se desconectar?";
  mensagemInicial.style.color = "#5a189a";
  mensagemInicial.style.fontWeight = "bold";
  mensagemInicial.style.marginTop = "15px";
  mensagemInicial.style.transition = "opacity 1s ease-in-out";

  document.querySelector(".atividade-section").appendChild(mensagemInicial);

  setTimeout(() => {
    mensagemInicial.style.opacity = "0";
    setTimeout(() => mensagemInicial.remove(), 1000);
  }, 3000);

  // Renderiza lista de atividades ao carregar
  renderizarAtividades();

  // Esconde a lista inicialmente
  listaAtividades.style.display = "none";
  btnToggleLista.textContent = "Exibir atividades";
});

// Hover no botão para mexer cubo
btnPlay.addEventListener("mouseover", () => {
  cubo.style.transform = "rotateX(25deg) rotateY(35deg) scale(1.1)";
});

btnPlay.addEventListener("mouseout", () => {
  cubo.style.transform = "rotateX(20deg) rotateY(30deg) scale(1)";
});
