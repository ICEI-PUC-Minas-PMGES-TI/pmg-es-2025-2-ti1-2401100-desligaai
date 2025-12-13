// Gerenciador avançado de localStorage para o Desliga AI
class LocalStorageManager {
    constructor() {
        this.prefix = 'desligaAI_';
        this.version = '2.1.0';
        this.init();
    }

    init() {
        if (!this.isSupported()) {
            console.warn('localStorage não é suportado neste navegador');
            return false;
        }

        this.initializeDataStructure();
        return true;
    }

    isSupported() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    initializeDataStructure() {
        const structure = {
            usuario: null,
            metricas: {
                tempoTotalOffline: 0,
                diasConsecutivos: 0,
                atividadesRealizadas: 0,
                nivelSatisfacao: '-',
                pontosTotais: 0,
                ultimaAtividade: null
            },
            historico: {
                atividades: [],
                tempoOffline: [],
                notificacoes: []
            },
            configuracoes: {
                tema: 'claro',
                notificacoesAtivas: true,
                frequenciaNotificacoes: 30,
                somNotificacoes: true
            },
            sistema: {
                versao: this.version,
                dataInstalacao: new Date().toISOString(),
                ultimoAcesso: new Date().toISOString()
            }
        };

        Object.keys(structure).forEach(key => {
            const storageKey = this.prefix + key;
            if (!localStorage.getItem(storageKey)) {
                this.setItem(key, structure[key]);
            }
        });
    }

    setItem(key, value) {
        try {
            const storageKey = this.prefix + key;
            const data = {
                value: value,
                timestamp: new Date().toISOString(),
                version: this.version
            };
            localStorage.setItem(storageKey, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Erro ao salvar no localStorage:', e);
            return false;
        }
    }

    getItem(key) {
        try {
            const storageKey = this.prefix + key;
            const item = localStorage.getItem(storageKey);
            
            if (!item) return null;
            
            const data = JSON.parse(item);
            return data.value;
        } catch (e) {
            console.error('Erro ao ler do localStorage:', e);
            return null;
        }
    }

    removeItem(key) {
        try {
            const storageKey = this.prefix + key;
            localStorage.removeItem(storageKey);
            return true;
        } catch (e) {
            console.error('Erro ao remover do localStorage:', e);
            return false;
        }
    }

    salvarPerfilUsuario(perfil) {
        return this.setItem('usuario', perfil);
    }

    carregarPerfilUsuario() {
        return this.getItem('usuario');
    }

    registrarAtividade(atividade, categoria, duracao = 0, emocao = null) {
        const registro = {
            id: 'ACT_' + Date.now(),
            atividade,
            categoria,
            duracao,
            emocao,
            timestamp: new Date().toISOString(),
            pontos: this.calcularPontosAtividade(atividade, duracao)
        };

        const historico = this.getItem('historico') || { atividades: [] };
        historico.atividades.push(registro);
        this.setItem('historico', historico);

        this.atualizarMetricas({
            atividadesRealizadas: 1,
            pontosTotais: registro.pontos
        });

        return registro;
    }

    registrarTempoOffline(minutos, dispositivo = 'web') {
        const registro = {
            id: 'TIME_' + Date.now(),
            minutos,
            dispositivo,
            timestamp: new Date().toISOString(),
            pontos: Math.floor(minutos / 5)
        };

        const historico = this.getItem('historico') || { tempoOffline: [] };
        historico.tempoOffline.push(registro);
        this.setItem('historico', historico);

        this.atualizarMetricas({
            tempoTotalOffline: minutos,
            pontosTotais: registro.pontos
        });

        return registro;
    }

    atualizarMetricas(updates) {
        const metricas = this.getItem('metricas') || {};
        
        Object.keys(updates).forEach(key => {
            if (key === 'tempoTotalOffline' || key === 'atividadesRealizadas' || key === 'pontosTotais') {
                metricas[key] = (metricas[key] || 0) + updates[key];
            } else {
                metricas[key] = updates[key];
            }
        });

        metricas.ultimaAtividade = new Date().toISOString();
        
        if (updates.pontosTotais) {
            metricas.nivelSatisfacao = this.calcularNivelSatisfacao(metricas.pontosTotais);
        }

        this.setItem('metricas', metricas);
        return metricas;
    }

    calcularPontosAtividade(atividade, duracao) {
        let pontos = 10;
        
        if (duracao > 30) pontos += 10;
        if (duracao > 60) pontos += 15;
        
        const atividadeLower = atividade.toLowerCase();
        
        if (atividadeLower.includes('exercício') || 
            atividadeLower.includes('caminhar') ||
            atividadeLower.includes('yoga') ||
            atividadeLower.includes('alongamento')) {
            pontos += 8;
        }
        
        if (atividadeLower.includes('ler') ||
            atividadeLower.includes('estudar') ||
            atividadeLower.includes('aprender') ||
            atividadeLower.includes('pesquisar')) {
            pontos += 12;
        }
        
        if (atividadeLower.includes('meditar') ||
            atividadeLower.includes('respirar') ||
            atividadeLower.includes('mindfulness')) {
            pontos += 15;
        }

        return pontos;
    }

    calcularNivelSatisfacao(pontosTotais) {
        if (pontosTotais >= 1000) return '😊 Excelente';
        if (pontosTotais >= 500) return '🙂 Muito Bom';
        if (pontosTotais >= 200) return '😐 Bom';
        if (pontosTotais >= 100) return '🫤 Regular';
        return '😞 Iniciante';
    }

    obterEstatisticas() {
        const metricas = this.getItem('metricas') || {};
        const historico = this.getItem('historico') || {};
        const usuario = this.getItem('usuario');

        return {
            usuario: usuario ? usuario.nome : 'Visitante',
            metricas,
            totalAtividades: historico.atividades ? historico.atividades.length : 0,
            totalTempoOffline: metricas.tempoTotalOffline || 0,
            nivel: metricas.nivelSatisfacao || 'Iniciante',
            pontos: metricas.pontosTotais || 0
        };
    }

    exportarDados() {
        const dados = {};
        const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
        
        keys.forEach(key => {
            const cleanKey = key.replace(this.prefix, '');
            dados[cleanKey] = this.getItem(cleanKey);
        });

        return {
            sistema: 'Desliga AI',
            versao: this.version,
            dataExportacao: new Date().toISOString(),
            dados: dados
        };
    }

    limparDados() {
        const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
        keys.forEach(key => localStorage.removeItem(key));
        this.initializeDataStructure();
        return true;
    }

    criarBackup() {
        const backup = this.exportarDados();
        const backupKey = this.prefix + 'backup_' + new Date().toISOString().replace(/[:.]/g, '-');
        
        try {
            localStorage.setItem(backupKey, JSON.stringify(backup));
            return true;
        } catch (e) {
            console.error('Erro ao criar backup:', e);
            return false;
        }
    }

    sincronizarComMapaEmocoes() {
        const perfilMapa = localStorage.getItem('emotionMapData');
        
        if (perfilMapa) {
            try {
                const perfil = JSON.parse(perfilMapa);
                this.salvarPerfilUsuario(perfil);
                console.log('Perfil sincronizado com Mapa de Emoções');
                return perfil;
            } catch (e) {
                console.error('Erro ao sincronizar perfil:', e);
            }
        }
        
        return null;
    }
}

// Instância global
const storageManager = new LocalStorageManager();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.DesligaAIStorage = storageManager;
}

export default storageManager;