const atividade = [
    "Caminhe por 20min 🍄",
    "Leia 5 páginas de um livro 📖",
    "Medite por 10min 🧘🏼‍♀️",
    "Tome um copo d'água e respire fundo 💧",
    "Escreva seus pensamentos e seus sentimentos ✍🏼",
    "Escreva 3 coisas pelas quais você é grato(a) ✨",
    "Desenhe algo de sua preferência 🖌️",
    "Inicia um novo hobbie 🎨",
    "Deixe seu app de música no aleatório para experimentar coisas novas 🎶",
    "Faça alongamentos por 15min 🫀"
];

const btnPlay = document.getElementById("btnPlay");
const atividadeGerada = document.getElementById("atividadeGerada");
const somClique = document.getElementById("somClique");
const cubo = document.getElementById("cubo");

btnPlay.addEventListener("click", () => {
    somClique.play();

    //ativa rotação do cubo

    cubo.classList.add("girando");

    //remove rotação depois de 2s

    setTimeout(() => {
        cubo.classList.remove("girando");
    }, 2000);

    //transição leve no texto 
    atividadeGerada.classList.add("fade");

    setTimeout(() => {
        const aleatoria = atividade[Math.floor(Math.random() * atividade.length)];
        atividadeGerada.textContent = aleatoria;
        atividadeGerada.classList.remove("fade");
    }, 600);
});

window.addEventListener("load", () => {
    const mensagemInicial = document.createElement("p" );
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
});

btnPlay.addEventListener("mouseover", () => {
    cubo.style.transform = "rotateX(25deg) rotateY(35deg) scale(1.1)";
});


btnPlay.addEventListener("mouseout", () => {
    cubo.style.transform = "rotateX(20deg) rotateY(30deg) scale(1)";
});


