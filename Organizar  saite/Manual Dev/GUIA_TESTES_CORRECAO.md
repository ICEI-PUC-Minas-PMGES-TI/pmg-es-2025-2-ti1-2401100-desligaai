# 🧪 Guia de Testes - Correção de Novos Usuários

**Objetivo:** Validar que a correção do erro crítico funciona corretamente

---

## 📋 Pré-requisitos

1. **JSON-Server rodando:**
   ```bash
   cd "c:\Users\gabri\Desktop\Puc exercicios\tiaw\Organizar  saite"
   npm run server
   ```
   ou execute:
   ```bash
   INICIAR_ALTERNATIVO.bat
   ```

2. **Navegador com DevTools aberto:**
   - Pressione F12 para abrir o console
   - Mantenha aberto durante todos os testes

3. **Backup do db.json (recomendado):**
   ```bash
   copy db.json db.json.backup
   ```

---

## 🔧 Etapa 0: Corrigir Usuários Existentes (Opcional)

Se há usuários antigos sem `currentDay`, execute o script de correção:

1. Abra o console do navegador
2. Navegue para qualquer página do site
3. Cole o conteúdo de `fix_existing_users.js`
4. Pressione Enter
5. Aguarde a mensagem de conclusão

**Ou:**

Cole este código no console:

```javascript
(async function() {
    const response = await fetch('http://localhost:3000/users');
    const users = await response.json();
    
    for (const user of users) {
        if (!user.currentDay) {
            const fixed = {
                ...user,
                currentDay: 1,
                dayHistory: user.dayHistory || [],
                achievements: user.achievements || [],
                rank: user.rank || 'Bronze',
                avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome || user.name)}&background=7c3aed&color=fff`
            };
            
            await fetch(`http://localhost:3000/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fixed)
            });
            
            console.log(`✅ Usuário ${user.id} corrigido`);
        }
    }
    console.log('✅ Correção concluída!');
})();
```

---

## ✅ Teste 1: Cadastro de Novo Usuário

### Objetivo
Verificar que novos usuários são criados com todos os campos obrigatórios.

### Passos

1. **Acessar página de cadastro:**
   ```
   http://localhost:8080/Cadastro/cadastro.html
   ```

2. **Preencher formulário:**
   - **Nome completo:** `Teste Correção`
   - **E-mail:** `teste.correcao@example.com`
   - **Telefone:** `(31) 99999-9999`
   - **Senha:** `Teste123!`
   - **Confirmar senha:** `Teste123!`

3. **Avançar para Etapa 2:**
   - Objetivo: `Reduzir tempo em telas`
   - Tempo médio: `4-6h por dia`

4. **Concluir cadastro:**
   - Marcar "Li e aceito os Termos"
   - Clicar em "Criar Conta"

### ✅ Verificações

#### No Console:
```
[REGISTER] Conta criada
[LOGIN] Login bem-sucedido
[INIT] Página pós-login carregada
[INIT] Validando dados do usuário...
[INIT] Dados do usuário validados
```

#### Visualmente:
- [ ] Redirecionado automaticamente para página pós-login
- [ ] Layout carrega completamente
- [ ] Header exibe nome do usuário
- [ ] Avatar aparece (gerado ou padrão)
- [ ] Pontos: "0 pts"
- [ ] Rank: "Bronze"
- [ ] Dias: "1 / 30"
- [ ] Desafios aparecem (5 desafios)
- [ ] Ferramentas aparecem (6 cards)
- [ ] Roadmap aparece (5 semanas)

#### No db.json:
1. Abrir `db.json`
2. Procurar pelo usuário com email `teste.correcao@example.com`
3. Verificar campos:

```json
{
  "id": 7,
  "nome": "Teste Correção",
  "email": "teste.correcao@example.com",
  "phone": "(31) 99999-9999",
  "password": "...",
  "dataCadastro": "2025-12-14T...",
  "updatedAt": "2025-12-14T...",
  "points": 0,                    // ✅
  "level": 1,                     // ✅
  "theme": "light",               // ✅
  "currentDay": 1,                // ✅ OBRIGATÓRIO
  "rank": "Bronze",               // ✅ OBRIGATÓRIO
  "avatar": "https://...",        // ✅ OBRIGATÓRIO
  "joinedDate": "2025-12-14T...", // ✅ OBRIGATÓRIO
  "isLoggedIn": false,            // ✅ OBRIGATÓRIO
  "dayHistory": [],               // ✅ OBRIGATÓRIO
  "achievements": [],             // ✅ OBRIGATÓRIO
  "preferences": {                // ✅
    "goal": "reduce_screen",
    "screenTime": "4_6h",
    "newsletter": true,
    "notifications": true
  },
  "lastLogin": "2025-12-14T..."
}
```

#### Erros que NÃO devem aparecer:
- ❌ `Cannot read properties of undefined (reading 'toString')`
- ❌ `currentDay is undefined`
- ❌ Layout quebrado
- ❌ Ferramentas não aparecem

---

## ✅ Teste 2: Login com Novo Usuário

### Objetivo
Verificar que o login funciona corretamente com o usuário recém-criado.

### Passos

1. **Fazer logout:**
   - Clicar no dropdown do perfil
   - Clicar em "Desconectar"

2. **Acessar login:**
   ```
   http://localhost:8080/Cadastro/login.html
   ```

3. **Fazer login:**
   - E-mail: `teste.correcao@example.com`
   - Senha: `Teste123!`
   - Clicar em "Entrar"

### ✅ Verificações

#### No Console:
```
[LOGIN] Login bem-sucedido para: teste.correcao@example.com
[LOGIN] Usuário salvo no localStorage: Sim
[LOGIN] Usuário confirmado no localStorage, redirecionando...
[INIT] Página pós-login carregada
[INIT] Validando dados do usuário...
```

#### Visualmente:
- [ ] Login bem-sucedido
- [ ] Redirecionamento automático
- [ ] Dashboard carrega completamente
- [ ] Sem erros no console
- [ ] Todos os dados corretos (nome, avatar, pontos, etc.)

---

## ✅ Teste 3: Testar Funcionalidades

### Objetivo
Verificar que todas as funcionalidades funcionam com o novo usuário.

### 3.1 Marcar Desafios

1. Clicar em um desafio
2. Verificar que marca como completo
3. Verificar que progresso atualiza (20%, 40%, 60%, 80%, 100%)
4. Clicar novamente para desmarcar
5. Verificar que progresso diminui

**✅ Deve funcionar sem erros**

### 3.2 Abrir Ferramentas

Clicar em cada ferramenta e verificar que abre:

1. ⏱️ **Timer de Desafio** → Abre nova aba
2. 📊 **Progresso Diário** → Abre modal
3. 📈 **Progresso no Tempo** → Abre modal
4. 🌿 **Atividades Offline** → Abre nova aba
5. 🏆 **Mural de Conquistas** → Abre modal
6. ✅ **Checklist Rotina** → Abre nova aba
7. 📤 **Compartilhar** → Abre modal

**✅ Todas devem abrir sem erros**

### 3.3 Alterar Avatar

1. Clicar no dropdown do perfil
2. Clicar em "Alterar foto de perfil"
3. Inserir URL: `https://i.pravatar.cc/200`
4. Clicar em "Salvar"
5. Verificar que avatar atualiza

**✅ Deve funcionar**

### 3.4 Tema Escuro/Claro

1. Clicar no botão de tema (sol/lua)
2. Verificar que tema alterna
3. Recarregar página
4. Verificar que tema persiste

**✅ Deve funcionar**

---

## ✅ Teste 4: Completar Todos os Desafios

### Objetivo
Testar o fluxo de conclusão do dia.

### Passos

1. Marcar todos os 5 desafios como completos
2. Verificar mensagens exibidas
3. Verificar botão "Avançar para o Próximo Dia"

### ✅ Verificações

- [ ] Progresso: "100%"
- [ ] Barra de progresso verde completa
- [ ] Alerta verde: "Dia concluído!"
- [ ] Botão "Avançar para o Próximo Dia" aparece
- [ ] Timer exibe tempo restante para avançar

**Nota:** Não é possível testar o avanço real sem esperar 24 horas ou manipular o tempo.

---

## ✅ Teste 5: Testar Usuário Antigo (Regressão)

### Objetivo
Verificar que usuários antigos continuam funcionando.

### Passos

1. Fazer logout do novo usuário
2. Fazer login com usuário antigo (ID 2):
   - E-mail: `pedronunes021006@gmail.com`
   - Senha: conhecida do sistema

### ✅ Verificações

- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Dados corretos (dia atual, pontos, rank)
- [ ] Desafios aparecem
- [ ] Ferramentas funcionam
- [ ] **Sem regressões**

---

## ✅ Teste 6: Verificar localStorage

### Objetivo
Verificar que os dados estão sendo salvos corretamente.

### Passos

1. Abrir DevTools → Application → Local Storage → `http://localhost:8080`
2. Verificar chaves:

```
desligaAI_currentUser
digitalDetoxDB
```

3. Clicar em `desligaAI_currentUser`
4. Verificar JSON:

```json
{
  "id": 7,
  "nome": "Teste Correção",
  "email": "teste.correcao@example.com",
  "currentDay": 1,        // ✅ DEVE EXISTIR
  "rank": "Bronze",
  "points": 0,
  "avatar": "...",
  "dayHistory": [],
  "achievements": [],
  // ... outros campos
}
```

**✅ currentDay DEVE existir e ser um número**

---

## ✅ Teste 7: Teste de Stress - Múltiplos Cadastros

### Objetivo
Criar vários usuários e verificar que todos funcionam.

### Passos

Criar 3 novos usuários:

1. **Usuário 1:**
   - Nome: `Teste A`
   - Email: `testea@example.com`
   - Senha: `Test123!`

2. **Usuário 2:**
   - Nome: `Teste B`
   - Email: `testeb@example.com`
   - Senha: `Test123!`

3. **Usuário 3:**
   - Nome: `Teste C`
   - Email: `testec@example.com`
   - Senha: `Test123!`

### ✅ Verificações

Para cada usuário:
- [ ] Cadastro bem-sucedido
- [ ] Login automático funciona
- [ ] Dashboard carrega completamente
- [ ] Sem erros no console
- [ ] db.json contém todos os campos obrigatórios

---

## 🐛 Problemas Conhecidos (Esperados)

### Comportamento Normal

1. **Timer de 24 horas:**
   - É esperado que leve 24 horas reais para avançar de dia
   - Isso é por design para evitar trapaças

2. **Console pode exibir avisos:**
   - `[VALIDATE] Dados corrigidos` → Normal, significa que a validação funcionou
   - `[AUTH] currentDay ausente, definido como 1` → Normal para novos usuários

3. **Primeiro login pode demorar um pouco:**
   - Sistema valida e corrige dados
   - É esperado um delay de 300-500ms

### ⚠️ Erros que NÃO Devem Ocorrer

1. ❌ `Cannot read properties of undefined (reading 'toString')`
2. ❌ Layout quebrado ou não carregado
3. ❌ Ferramentas não aparecem
4. ❌ Desafios não são exibidos
5. ❌ Página em branco após login
6. ❌ Redirect loop (ficar voltando para login)

---

## 📊 Checklist Final de Validação

### Novos Usuários
- [ ] Cadastro funciona sem erros
- [ ] Login automático após cadastro funciona
- [ ] Login manual funciona
- [ ] Dashboard carrega completamente
- [ ] Layout renderizado corretamente
- [ ] Todas as ferramentas acessíveis
- [ ] Desafios exibidos
- [ ] Roadmap aparece
- [ ] Avatar exibido
- [ ] Dados corretos (nome, pontos, rank, dia)
- [ ] Console sem erros críticos
- [ ] db.json contém todos os campos obrigatórios

### Usuários Antigos
- [ ] Login continua funcionando
- [ ] Dashboard carrega normalmente
- [ ] Dados preservados
- [ ] Sem regressões
- [ ] Funcionalidades intactas

### Sistema Geral
- [ ] Sem erros de `.toString()`
- [ ] Sem undefined values
- [ ] localStorage correto
- [ ] db.json correto
- [ ] Validação automática funciona
- [ ] Logs informativos no console

---

## 🎯 Critérios de Sucesso

### ✅ Teste Bem-Sucedido Se:

1. **100% dos novos usuários conseguem:**
   - Criar conta
   - Fazer login
   - Ver dashboard completo
   - Usar todas as funcionalidades

2. **0 erros de `undefined.toString()`**

3. **0 layouts quebrados**

4. **100% dos usuários antigos continuam funcionando**

5. **db.json contém todos os campos obrigatórios**

---

## 🚨 Em Caso de Erro

### Se encontrar problemas:

1. **Verificar console:**
   - Copiar todos os logs
   - Procurar por mensagens de erro

2. **Verificar db.json:**
   - Abrir arquivo
   - Procurar pelo usuário com problema
   - Verificar campos ausentes

3. **Executar script de correção:**
   - Usar `fix_existing_users.js`
   - Corrigir dados manualmente se necessário

4. **Restaurar backup:**
   ```bash
   copy db.json.backup db.json
   ```

5. **Reiniciar json-server:**
   - Parar servidor (Ctrl+C)
   - Executar novamente `npm run server`

---

## 📝 Relatório de Testes

Preencha após executar todos os testes:

```
Data do Teste: _______________
Testador: _____________________

TESTE 1 - Cadastro: [ ] Passou [ ] Falhou
TESTE 2 - Login: [ ] Passou [ ] Falhou
TESTE 3 - Funcionalidades: [ ] Passou [ ] Falhou
TESTE 4 - Completar Dia: [ ] Passou [ ] Falhou
TESTE 5 - Regressão: [ ] Passou [ ] Falhou
TESTE 6 - localStorage: [ ] Passou [ ] Falhou
TESTE 7 - Stress: [ ] Passou [ ] Falhou

Erros Encontrados:
_________________________________________
_________________________________________
_________________________________________

Observações:
_________________________________________
_________________________________________
_________________________________________

Conclusão:
[ ] APROVADO - Pode ir para produção
[ ] REPROVADO - Precisa de correções
```

---

**Boa sorte nos testes! 🚀**
