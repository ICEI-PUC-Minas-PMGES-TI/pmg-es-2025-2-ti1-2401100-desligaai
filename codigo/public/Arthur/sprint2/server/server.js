const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'data', 'usuarios.json');

app.use(cors()); 
app.use(express.json()); 

// --- Funções Auxiliares de Banco de Dados ---

// Estrutura base completa (agora inclui 'reflexoes')
const BASE_USER_DATA = { 
    nome: "Arthur", 
    tempoTotalMinutos: 0, 
    historico: [], 
    reflexoes: [] // Adicionado para inicialização
};

function readDb() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Usar a estrutura base completa em caso de erro de leitura
        console.error("Erro ao ler DB. Usando estrutura base.");
        return { user123: BASE_USER_DATA };
    }
}

function writeDb(data) {
    // Adicionada segurança para garantir que a pasta 'data' exista
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Helper para garantir que os arrays existam
const getOrCreateUserData = (db, userId) => {
    const userData = db[userId] || BASE_USER_DATA;
    if (!userData.historico) userData.historico = [];
    if (!userData.reflexoes) userData.reflexoes = [];
    return userData;
};

// --- ROTAS DA API ---

// GET /tempo/:userId -> Retorna todos os dados do usuário (tempo e reflexões)
app.get('/tempo/:userId', (req, res) => {
    const { userId } = req.params;
    const db = readDb();
    const userData = getOrCreateUserData(db, userId);

    res.json({
        userId,
        nome: userData.nome,
        tempoTotalMinutos: userData.tempoTotalMinutos,
        historico: userData.historico,
        reflexoes: userData.reflexoes // Incluído
    });
});

// POST /tempo/registrar -> Registra novo período de desconexão (ORIGINAL E FUNCIONANDO)
app.post('/tempo/registrar', (req, res) => {
    const { userId, tempoMinutos } = req.body; 

    if (!userId || typeof tempoMinutos !== 'number' || tempoMinutos <= 0) {
        return res.status(400).json({ error: "Dados de tempo inválidos." });
    }

    const db = readDb();
    const userData = getOrCreateUserData(db, userId);

    // Atualiza o Tempo Total
    userData.tempoTotalMinutos = (userData.tempoTotalMinutos || 0) + tempoMinutos; 
    
    // Registra no Histórico
    const today = new Date().toISOString().slice(0, 10);
    userData.historico.push({ data: today, tempo: tempoMinutos });
    
    db[userId] = userData;
    writeDb(db);

    res.status(200).json({ 
        message: `${tempoMinutos} minutos registrados!`, 
        novoTotal: userData.tempoTotalMinutos
    });
});


// ==========================================================
// === NOVAS ROTAS (Diário e Reset) ===
// ==========================================================

// 1. POST /diario/salvar -> Salva uma nova reflexão (NOVA ROTA)
app.post('/diario/salvar', (req, res) => {
    const userId = 'user123'; 
    const { texto } = req.body;
    
    if (!userId || !texto || texto.trim() === "") {
        return res.status(400).json({ error: "Dados de reflexão inválidos." });
    }

    const db = readDb();
    const userData = getOrCreateUserData(db, userId);

    const novaReflexao = {
        texto: texto,
        data: new Date().toISOString()
    };

    userData.reflexoes.push(novaReflexao);
    db[userId] = userData;
    writeDb(db);

    res.status(200).json({ 
        message: "Reflexão salva com sucesso!",
        novaReflexao: novaReflexao
    });
});

// 2. GET /diario/historico -> Busca as reflexões salvas (NOVA ROTA)
app.get('/diario/historico', (req, res) => {
    const userId = 'user123'; 
    const db = readDb();
    const userData = getOrCreateUserData(db, userId);

    res.status(200).json({ reflexoes: userData.reflexoes });
});

// 3. POST /contagem/reset -> Reseta o tempo total do usuário (NOVA ROTA)
app.post('/contagem/reset', (req, res) => {
    const userId = 'user123';
    const db = readDb();
    
    // Confirma se o usuário existe antes de tentar resetar
    if (!db[userId]) {
        return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Zera o tempo total e limpa o histórico de registro de tempo
    db[userId].tempoTotalMinutos = 0;
    db[userId].historico = [];
    
    // Opcional: Manter as reflexões. Se quiser limpá-las, adicione: db[userId].reflexoes = [];
    
    writeDb(db);

    res.status(200).json({ 
        message: "Contagem total resetada com sucesso!",
        tempoTotalMinutos: 0 
    });
});


// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
    console.log(`[BACKEND] Servidor rodando em http://localhost:${PORT}`);
});