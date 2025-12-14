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

function readDb() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Se o arquivo não existir ou estiver vazio, retorna uma estrutura base.
        return { user123: { nome: "Arthur", tempoTotalMinutos: 0, historico: [] } };
    }
}

function writeDb(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// --- ROTAS DA API ---

// GET /tempo/:userId -> Retorna os dados totais do usuário
app.get('/tempo/:userId', (req, res) => {
    const { userId } = req.params;
    const db = readDb();
    const userData = db[userId] || { nome: "Novo Usuário", tempoTotalMinutos: 0, historico: [] };

    res.json({
        userId,
        nome: userData.nome,
        tempoTotalMinutos: userData.tempoTotalMinutos,
        historico: userData.historico
    });
});

// POST /tempo/registrar -> Registra novo período de desconexão
app.post('/tempo/registrar', (req, res) => {
    const { userId, tempoMinutos } = req.body; // tempoMinutos é o tempo que o cronômetro terminou

    if (!userId || typeof tempoMinutos !== 'number' || tempoMinutos <= 0) {
        return res.status(400).json({ error: "Dados de tempo inválidos." });
    }

    const db = readDb();
    const userData = db[userId] || { nome: "Novo Usuário", tempoTotalMinutos: 0, historico: [] };

    // Atualiza o Tempo Total
    userData.tempoTotalMinutos += tempoMinutos;
    
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

app.listen(PORT, () => {
    console.log(`[BACKEND] Servidor rodando em http://localhost:${PORT}`);
});
