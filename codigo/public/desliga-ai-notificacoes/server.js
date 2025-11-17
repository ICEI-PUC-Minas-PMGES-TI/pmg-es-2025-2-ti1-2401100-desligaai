const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Carregar dados do banco
async function loadDatabase() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao carregar banco de dados:', error);
        return { sistema_notificacoes: {} };
    }
}

// Salvar dados no banco
async function saveDatabase(data) {
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar banco de dados:', error);
        return false;
    }
}

// ========== ROTAS DA API ==========

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Obter todas as notificações
app.get('/api/notificacoes', async (req, res) => {
    try {
        const db = await loadDatabase();
        res.json(db.sistema_notificacoes.notificacoes_genericas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar notificações' });
    }
});

// Obter sugestões de atividades
app.get('/api/sugestoes', async (req, res) => {
    try {
        const db = await loadDatabase();
        const { categoria, interesse } = req.query;
        
        let sugestoes = db.sistema_notificacoes.sugestoes_genericas;
        
        // Filtrar por categoria se especificado
        if (categoria) {
            sugestoes = sugestoes.filter(s => 
                s.categoria.toLowerCase().includes(categoria.toLowerCase())
            );
        }
        
        // Filtrar por interesse se especificado
        if (interesse) {
            sugestoes = sugestoes.filter(s => 
                s.categoria.toLowerCase().includes(interesse.toLowerCase()) ||
                s.descricao.toLowerCase().includes(interesse.toLowerCase())
            );
        }
        
        res.json(sugestoes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar sugestões' });
    }
});

// Obter notificações emocionais
app.get('/api/emocional/:emocao', async (req, res) => {
    try {
        const { emocao } = req.params;
        const db = await loadDatabase();
        
        const emocionalData = db.sistema_notificacoes.emocional_support[emocao];
        
        if (!emocionalData) {
            return res.status(404).json({ error: 'Emoção não encontrada' });
        }
        
        res.json(emocionalData);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar dados emocionais' });
    }
});

// Registrar atividade do usuário
app.post('/api/atividades/registrar', async (req, res) => {
    try {
        const { usuarioId, atividade, categoria, emocao, duracao } = req.body;
        
        if (!atividade || !categoria) {
            return res.status(400).json({ error: 'Atividade e categoria são obrigatórias' });
        }
        
        const db = await loadDatabase();
        
        // Criar registro de atividade
        const atividadeRegistro = {
            id: `ACT-${Date.now()}`,
            usuarioId: usuarioId || 'anonimo',
            atividade,
            categoria,
            emocao: emocao || 'neutral',
            duracao: duracao || 0,
            timestamp: new Date().toISOString(),
            pontos: calcularPontos(atividade, duracao)
        };
        
        // Em produção, salvaríamos em uma tabela específica
        console.log('Atividade registrada:', atividadeRegistro);
        
        res.json({
            success: true,
            mensagem: 'Atividade registrada com sucesso!',
            atividade: atividadeRegistro,
            pontos: atividadeRegistro.pontos
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar atividade' });
    }
});

// Registrar tempo offline
app.post('/api/tempo-offline', async (req, res) => {
    try {
        const { usuarioId, minutos, dispositivo } = req.body;
        
        if (!minutos || minutos <= 0) {
            return res.status(400).json({ error: 'Tempo em minutos é obrigatório' });
        }
        
        const registro = {
            id: `TIME-${Date.now()}`,
            usuarioId: usuarioId || 'anonimo',
            minutos: parseInt(minutos),
            dispositivo: dispositivo || 'desconhecido',
            timestamp: new Date().toISOString(),
            pontos: Math.floor(minutos / 5) // 1 ponto a cada 5 minutos
        };
        
        console.log('Tempo offline registrado:', registro);
        
        res.json({
            success: true,
            mensagem: `🎉 ${minutos} minutos offline registrados!`,
            registro,
            pontos: registro.pontos
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar tempo offline' });
    }
});

// Obter métricas do usuário
app.get('/api/metricas/:usuarioId', async (req, res) => {
    try {
        const { usuarioId } = req.params;
        
        // Em produção, buscaríamos do banco de dados real
        const metricas = {
            usuarioId,
            tempoTotalOffline: Math.floor(Math.random() * 500) + 100, // minutos
            diasConsecutivos: Math.floor(Math.random() * 30) + 1,
            atividadesRealizadas: Math.floor(Math.random() * 50) + 10,
            nivelSatisfacao: ['😊 Alta', '🙂 Média', '😐 Baixa'][Math.floor(Math.random() * 3)],
            pontosTotais: Math.floor(Math.random() * 1000) + 100,
            ranking: Math.floor(Math.random() * 100) + 1
        };
        
        res.json(metricas);
        
    } catch (error) {
        res.status(500).json({ error: 'Erro ao carregar métricas' });
    }
});

// Sistema de usuários
app.post('/api/usuarios/registrar', async (req, res) => {
    try {
        const { nome, email, idade, profissao, cidade, interesses } = req.body;
        
        if (!nome || !email) {
            return res.status(400).json({ error: 'Nome e email são obrigatórios' });
        }
        
        const usuario = {
            id: `USR-${Date.now()}`,
            nome,
            email,
            idade: idade || null,
            profissao: profissao || null,
            cidade: cidade || null,
            interesses: interesses || [],
            dataRegistro: new Date().toISOString(),
            nivel: 'iniciante',
            pontos: 0
        };
        
        console.log('Novo usuário registrado:', usuario);
        
        res.json({
            success: true,
            mensagem: 'Usuário registrado com sucesso!',
            usuario
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
});

// Configurações do usuário
app.post('/api/usuarios/:usuarioId/configuracoes', async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const configuracoes = req.body;
        
        console.log(`Configurações atualizadas para ${usuarioId}:`, configuracoes);
        
        res.json({
            success: true,
            mensagem: 'Configurações atualizadas com sucesso!',
            configuracoes
        });
        
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar configurações' });
    }
});

// ========== FUNÇÕES AUXILIARES ==========

function calcularPontos(atividade, duracao) {
    let pontos = 10; // pontos base
    
    // Bônus por duração
    if (duracao > 30) pontos += 10;
    if (duracao > 60) pontos += 15;
    
    // Bônus por tipo de atividade
    if (atividade.toLowerCase().includes('exercício') || 
        atividade.toLowerCase().includes('caminhar') ||
        atividade.toLowerCase().includes('yoga')) {
        pontos += 5;
    }
    
    if (atividade.toLowerCase().includes('ler') ||
        atividade.toLowerCase().includes('estudar') ||
        atividade.toLowerCase().includes('aprender')) {
        pontos += 8;
    }
    
    return pontos;
}

// ========== INICIALIZAÇÃO DO SERVIDOR ==========

app.listen(PORT, () => {
    console.log(`🚀 Servidor Desliga AI rodando na porta ${PORT}`);
    console.log(`📊 Acesse: http://localhost:${PORT}`);
    console.log(`🔗 API disponível em: http://localhost:${PORT}/api/notificacoes`);
});

module.exports = app;