document.addEventListener('DOMContentLoaded', function() {
    // Atualizar valores dos sliders
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        const valueElement = document.getElementById(slider.id.replace('slider', 'value'));
        valueElement.textContent = slider.value;
        
        slider.addEventListener('input', function() {
            valueElement.textContent = this.value;
        });
    });
    
    // Visualizar JSON
    document.getElementById('btn-preview').addEventListener('click', function() {
        const formData = getFormData();
        document.getElementById('json-preview').textContent = JSON.stringify(formData, null, 2);
        document.getElementById('preview-container').style.display = 'block';
        window.scrollTo({ top: document.getElementById('preview-container').offsetTop - 20, behavior: 'smooth' });
    });
    
    // Fechar prévia
    document.getElementById('btn-close-preview').addEventListener('click', function() {
        document.getElementById('preview-container').style.display = 'none';
    });
    
    // Copiar JSON
    document.getElementById('btn-copy-json').addEventListener('click', function() {
        const jsonText = document.getElementById('json-preview').textContent;
        navigator.clipboard.writeText(jsonText).then(function() {
            alert('JSON copiado para a área de transferência!');
        }, function() {
            alert('Erro ao copiar JSON. Tente novamente.');
        });
    });
    
    // Enviar formulário
    document.getElementById('emotion-map-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = getFormData();
        
        // Aqui você normalmente enviaria os dados para um servidor
        // Por enquanto, vamos apenas mostrar uma mensagem
        alert('Mapa de emoções salvo com sucesso!');
        console.log('Dados do formulário:', formData);
    });
    
    // Função para coletar dados do formulário
    function getFormData() {
        // Coletar redes sociais
        const socialNetworks = [];
        if (document.getElementById('social-instagram').checked) socialNetworks.push('Instagram');
        if (document.getElementById('social-tiktok').checked) socialNetworks.push('TikTok');
        if (document.getElementById('social-twitter').checked) socialNetworks.push('Twitter');
        if (document.getElementById('social-facebook').checked) socialNetworks.push('Facebook');
        if (document.getElementById('social-youtube').checked) socialNetworks.push('YouTube');
        if (document.getElementById('social-whatsapp').checked) socialNetworks.push('WhatsApp');
        
        // Coletar gatilhos emocionais
        const emotionalTriggers = [];
        if (document.getElementById('trigger-comparison').checked) emotionalTriggers.push('Comparação com outros profissionais');
        if (document.getElementById('trigger-procrastination').checked) emotionalTriggers.push('Procrastinação');
        if (document.getElementById('trigger-fomo').checked) emotionalTriggers.push('Sensação de estar perdendo oportunidades');
        if (document.getElementById('trigger-boredom').checked) emotionalTriggers.push('Tédio');
        if (document.getElementById('trigger-loneliness').checked) emotionalTriggers.push('Solidão');
        if (document.getElementById('trigger-stress').checked) emotionalTriggers.push('Estresse/Ansiedade');
        
        // Coletar interesses
        const interests = [];
        if (document.getElementById('interest-art').checked) interests.push('Desenho e pintura');
        if (document.getElementById('interest-reading').checked) interests.push('Leitura');
        if (document.getElementById('interest-cooking').checked) interests.push('Culinária');
        if (document.getElementById('interest-yoga').checked) interests.push('Yoga e meditação');
        if (document.getElementById('interest-music').checked) interests.push('Música');
        if (document.getElementById('interest-sports').checked) interests.push('Esportes');
        if (document.getElementById('interest-gaming').checked) interests.push('Jogos');
        if (document.getElementById('interest-nature').checked) interests.push('Natureza');
        
        // Coletar objetivos pessoais
        const personalGoals = document.getElementById('personal-goals').value.split('\n').filter(goal => goal.trim() !== '');
        
        // Criar estrutura de dados
        const formData = {
            "usuario": {
                "id": "USR-2024-001",
                "nome": document.getElementById('user-name').value,
                "idade": parseInt(document.getElementById('user-age').value),
                "profissao": document.getElementById('user-profession').value,
                "cidade": document.getElementById('user-city').value,
                "objetivo_principal": document.getElementById('main-goal').value,
                "tempo_diario_redes_sociais": document.getElementById('social-time').value,
                "redes_sociais_mais_utilizadas": socialNetworks
            },
            "mapa_emoções": {
                "emocao_primaria": document.getElementById('primary-emotion').value,
                "emocao_secundaria": document.getElementById('secondary-emotion').value,
                "gatilhos_emocionais": emotionalTriggers,
                "intensidade_emocional": {
                    "ansiedade": parseInt(document.getElementById('anxiety-slider').value),
                    "motivacao": parseInt(document.getElementById('motivation-slider').value),
                    "realizacao": parseInt(document.getElementById('achievement-slider').value),
                    "foco": parseInt(document.getElementById('focus-slider').value)
                }
            },
            "preferencias_offline": {
                "interesses": interests,
                "objetivos_pessoais": personalGoals,
                "atividades_sugeridas": [
                    {
                        "categoria": "Criatividade",
                        "atividades": [
                            "Fazer um curso de aquarela",
                            "Criar um projeto de sketchbook diário",
                            "Visitar galerias de arte aos finais de semana"
                        ]
                    },
                    {
                        "categoria": "Desenvolvimento Pessoal",
                        "atividades": [
                            "Estabelecer uma rotina de leitura de 30 minutos ao dia",
                            "Praticar journaling matinal",
                            "Fazer caminhadas em parques sem celular"
                        ]
                    },
                    {
                        "categoria": "Empreendedorismo",
                        "atividades": [
                            "Planejar um negócio de ilustração digital",
                            "Participar de feiras de arte locais",
                            "Criar um calendário de metas mensais"
                        ]
                    }
                ]
            },
            "configuracoes": {
                "limite_diario_redes": parseInt(document.getElementById('daily-limit').value),
                "alertas_emocionais": document.getElementById('emotional-alerts').value === 'true',
                "sincronizar_calendario": document.getElementById('calendar-sync').value === 'true',
                "modo_foco_ativado": document.getElementById('focus-mode').value === 'true'
            }
        };
        
        return formData;
    }
});