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
