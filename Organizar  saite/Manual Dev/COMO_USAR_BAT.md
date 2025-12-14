# 🖱️ Como Usar os Arquivos .BAT

## 🚀 INICIAR.bat - Iniciar o Projeto

### Como Usar:
1. **Clique duas vezes** no arquivo `INICIAR.bat`
2. **Pronto!** Tudo inicia automaticamente

### O Que Acontece:
- ✅ Verifica se Node.js está instalado
- ✅ Instala dependências automaticamente (se necessário)
- ✅ Cria `package.json` se não existir
- ✅ Inicia JSON-Server na porta 3000
- ✅ Inicia Site na porta 8080
- ✅ Abre navegador automaticamente

### Para Parar:
- Pressione **Ctrl+C** no terminal
- Ou feche a janela do terminal

---

## 🛑 PARAR.bat - Parar os Servidores

### Como Usar:
1. **Clique duas vezes** no arquivo `PARAR.bat`
2. Todos os servidores serão encerrados

### O Que Faz:
- ✅ Para JSON-Server (porta 3000)
- ✅ Para HTTP Server (porta 8080)
- ✅ Encerra processos do Node.js relacionados

---

## 📋 Requisitos

### Obrigatório:
- **Node.js** instalado
  - Baixar em: https://nodejs.org/
  - Versão 14 ou superior

### Opcional:
- Nada mais! O script instala tudo automaticamente

---

## 🔧 O Que o Script Faz Automaticamente

### 1. Verificações
- ✅ Node.js instalado?
- ✅ `db.json` existe?
- ✅ `node_modules` existe?

### 2. Instalação Automática
- ✅ Cria `package.json` se não existir
- ✅ Instala dependências se necessário
- ✅ Tudo automático!

### 3. Inicialização
- ✅ Inicia JSON-Server
- ✅ Inicia Site
- ✅ Abre navegador

---

## 💡 Dicas

### Criar Atalho na Área de Trabalho:
1. Clique com botão direito em `INICIAR.bat`
2. Selecione "Criar atalho"
3. Arraste o atalho para a área de trabalho
4. Renomeie para "Desliga AI"

### Fixar na Barra de Tarefas:
1. Clique com botão direito no atalho
2. Selecione "Fixar na barra de tarefas"

---

## ❓ Problemas Comuns

### Erro: "Node.js não encontrado"
**Solução:** Instale Node.js em https://nodejs.org/

### Erro: "db.json não encontrado"
**Solução:** Certifique-se de que o arquivo `db.json` está na mesma pasta do `INICIAR.bat`

### Porta já em uso
**Solução:** 
- Feche outros programas usando as portas 3000 ou 8080
- Ou use `PARAR.bat` para encerrar servidores anteriores

### Navegador não abre
**Solução:**
- Acesse manualmente: http://localhost:8080

---

## 🎯 Resumo

**Para iniciar:** Clique duas vezes em `INICIAR.bat`  
**Para parar:** Pressione Ctrl+C ou use `PARAR.bat`

**Simples assim!** 🚀

