let questions = [];
let currentQuestion = 0;
let score = 0;

async function loadQuestions() {
    try {
        const response = await fetch('http://localhost:3000/questions');
        questions = await response.json();
        showQuestion();
    } catch (error) {
        console.error('Erro ao carregar perguntas:', error);
    }
}

function startQuiz() {
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('quiz-screen').classList.add('active');
    loadQuestions();
}

function showQuestion() {
    if (currentQuestion < questions.length) {
        const q = questions[currentQuestion];
        document.getElementById('question').textContent = q.text;
        const optionsDiv = document.getElementById('options');
        optionsDiv.innerHTML = '';
        q.options.forEach((opt, index) => {
            const optElem = document.createElement('div');
            optElem.classList.add('option');
            optElem.textContent = opt;
            optElem.onclick = () => selectOption(index);
            optionsDiv.appendChild(optElem);
        });
        updateProgress();
    } else {
        showResult();
    }
}

function selectOption(points) {
    score += points;
    currentQuestion++;
    showQuestion();
}

function updateProgress() {
    const progress = (currentQuestion / questions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

function showResult() {
    document.getElementById('quiz-screen').classList.remove('active');
    document.getElementById('result-screen').classList.add('active');
    let title, desc, gatilhos;
    if (score <= 2) {
        title = 'Nenhum';
        desc = 'Você não apresenta sinais de vício em vídeos curtos. Seu uso parece equilibrado.';
        gatilhos = ['Uso ocasional sem dependência emocional ou habitual.'];
    } else if (score <= 5) {
        title = 'Baixo';
        desc = 'Você tem um nível baixo de vício, com uso moderado que não interfere na rotina.';
        gatilhos = ['Tédio em momentos ociosos.', 'Busca por entretenimento leve.'];
    } else if (score <= 8) {
        title = 'Médio';
        desc = 'Você tem um nível médio de vício, com consumo que pode afetar hábitos diários.';
        gatilhos = ['Estresse ou ansiedade como escape.', 'Hábito reforçado por notificações.', 'Ociosidade frequente.'];
    } else {
        title = 'Alto';
        desc = 'Você tem um nível alto de vício, com consumo excessivo impactando bem-estar.';
        gatilhos = ['Dependência emocional para lidar com sentimentos.', 'Dopamina de conteúdos viciantes.', 'Interferência em sono e produtividade.'];
    }
    document.getElementById('result-title').textContent = title;
    document.getElementById('result-desc').textContent = desc;
    const tipsList = document.getElementById('tips-list');
    tipsList.innerHTML = '';
    gatilhos.forEach(gatilho => {
        const li = document.createElement('li');
        li.classList.add('tip');
        li.textContent = gatilho;
        tipsList.appendChild(li);
    });
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    document.getElementById('result-screen').classList.remove('active');
    document.getElementById('start-screen').classList.add('active');
}