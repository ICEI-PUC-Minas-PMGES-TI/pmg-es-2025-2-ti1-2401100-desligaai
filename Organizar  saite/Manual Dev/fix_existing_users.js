/**
 * Script para Corrigir Usuários Existentes no Banco de Dados
 * 
 * Este script corrige usuários que foram criados antes da implementação
 * dos campos obrigatórios (currentDay, dayHistory, achievements, etc.)
 * 
 * COMO USAR:
 * 1. Certifique-se de que o json-server está rodando (porta 3000)
 * 2. Abra o console do navegador em qualquer página do site
 * 3. Cole este script e execute
 * 4. Aguarde a mensagem de conclusão
 */

(async function fixExistingUsersInDatabase() {
    console.log('🔧 Iniciando correção de usuários existentes...');
    
    const API_URL = 'http://localhost:3000';
    
    try {
        // Buscar todos os usuários
        const response = await fetch(`${API_URL}/users`);
        if (!response.ok) {
            throw new Error('Erro ao buscar usuários. Verifique se o json-server está rodando.');
        }
        
        const users = await response.json();
        console.log(`📊 Total de usuários encontrados: ${users.length}`);
        
        let fixedCount = 0;
        let errorCount = 0;
        
        // Processar cada usuário
        for (const user of users) {
            console.log(`\n🔍 Verificando usuário ID ${user.id}: ${user.nome || user.name || user.email}`);
            
            let needsFix = false;
            const fixes = [];
            const fixedUser = { ...user };
            
            // Verificar e corrigir currentDay
            if (!fixedUser.currentDay || isNaN(fixedUser.currentDay)) {
                fixedUser.currentDay = 1;
                needsFix = true;
                fixes.push('currentDay');
            }
            
            // Verificar e corrigir rank
            if (!fixedUser.rank) {
                fixedUser.rank = 'Bronze';
                needsFix = true;
                fixes.push('rank');
            }
            
            // Verificar e corrigir points
            if (fixedUser.points === undefined || fixedUser.points === null || isNaN(fixedUser.points)) {
                fixedUser.points = 0;
                needsFix = true;
                fixes.push('points');
            }
            
            // Verificar e corrigir level
            if (!fixedUser.level || isNaN(fixedUser.level)) {
                fixedUser.level = 1;
                needsFix = true;
                fixes.push('level');
            }
            
            // Verificar e corrigir dayHistory
            if (!Array.isArray(fixedUser.dayHistory)) {
                fixedUser.dayHistory = [];
                needsFix = true;
                fixes.push('dayHistory');
            }
            
            // Verificar e corrigir achievements
            if (!Array.isArray(fixedUser.achievements)) {
                fixedUser.achievements = [];
                needsFix = true;
                fixes.push('achievements');
            }
            
            // Verificar e corrigir avatar
            if (!fixedUser.avatar) {
                const name = fixedUser.nome || fixedUser.name || fixedUser.email.split('@')[0];
                fixedUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff`;
                needsFix = true;
                fixes.push('avatar');
            }
            
            // Verificar e corrigir joinedDate
            if (!fixedUser.joinedDate) {
                fixedUser.joinedDate = fixedUser.dataCadastro || new Date().toISOString();
                needsFix = true;
                fixes.push('joinedDate');
            }
            
            // Verificar e corrigir isLoggedIn
            if (fixedUser.isLoggedIn === undefined || fixedUser.isLoggedIn === null) {
                fixedUser.isLoggedIn = false;
                needsFix = true;
                fixes.push('isLoggedIn');
            }
            
            // Verificar e corrigir theme
            if (!fixedUser.theme) {
                fixedUser.theme = 'light';
                needsFix = true;
                fixes.push('theme');
            }
            
            // Verificar e corrigir preferences
            if (!fixedUser.preferences) {
                fixedUser.preferences = {
                    goal: 'reduce_screen',
                    screenTime: '4_6h',
                    newsletter: false,
                    notifications: true
                };
                needsFix = true;
                fixes.push('preferences');
            }
            
            // Padronizar campo 'name'
            if (!fixedUser.name && fixedUser.nome) {
                fixedUser.name = fixedUser.nome;
                needsFix = true;
                fixes.push('name (standardized)');
            }
            
            // Se precisa de correção, atualizar no banco
            if (needsFix) {
                console.log(`  ⚠️ Campos ausentes/inválidos: ${fixes.join(', ')}`);
                console.log(`  🔄 Atualizando usuário...`);
                
                try {
                    // Adicionar timestamp de atualização
                    fixedUser.updatedAt = new Date().toISOString();
                    
                    const updateResponse = await fetch(`${API_URL}/users/${user.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(fixedUser)
                    });
                    
                    if (!updateResponse.ok) {
                        throw new Error(`Erro HTTP: ${updateResponse.status}`);
                    }
                    
                    console.log(`  ✅ Usuário ID ${user.id} corrigido com sucesso!`);
                    fixedCount++;
                } catch (error) {
                    console.error(`  ❌ Erro ao atualizar usuário ID ${user.id}:`, error.message);
                    errorCount++;
                }
            } else {
                console.log(`  ✅ Usuário já está correto`);
            }
        }
        
        // Resumo final
        console.log('\n' + '='.repeat(50));
        console.log('📊 RESUMO DA CORREÇÃO');
        console.log('='.repeat(50));
        console.log(`Total de usuários: ${users.length}`);
        console.log(`Usuários corrigidos: ${fixedCount}`);
        console.log(`Erros: ${errorCount}`);
        console.log(`Já estavam corretos: ${users.length - fixedCount - errorCount}`);
        console.log('='.repeat(50));
        
        if (fixedCount > 0) {
            console.log('\n✅ Correção concluída! Recarregue a página para aplicar as alterações.');
        } else {
            console.log('\n✅ Todos os usuários já estavam corretos!');
        }
        
    } catch (error) {
        console.error('\n❌ ERRO CRÍTICO:', error.message);
        console.error('Verifique se o json-server está rodando na porta 3000');
        console.error('Execute: npm run server');
    }
})();
