# 📱 DOCUMENTAÇÃO COMPLETA - DESLIGA AI

## 🎯 VISÃO GERAL DO PROJETO

Desliga AI é uma plataforma web educativa e conscientizadora focada em combater o vício em vídeos curtos e redes sociais. O objetivo é ajudar usuários a recuperarem o controle sobre seu tempo digital através de ferramentas práticas de autocontrole, bem-estar e criação de hábitos saudáveis.

**Este projeto foi convertido para HTML, CSS e JavaScript puro**, utilizando apenas Bootstrap para o layout, sem frameworks ou dependências de build.

---

## 🎨 DESIGN SYSTEM

### Cores Principais (HSL)

**Light Mode:**
- Background: `0 0% 100%` (branco puro)
- Foreground: `240 10% 3.9%` (quase preto)
- Primary: `263 70% 50%` (roxo vibrante)
- Primary Glow: `263 70% 65%` (roxo claro)
- Secondary: `217 91% 60%` (azul vibrante)
- Accent: `25 95% 53%` (laranja vibrante)
- Destructive: `0 84% 60%` (vermelho)
- Muted: `240 5% 96%` (cinza muito claro)
- Border: `240 6% 90%`

**Dark Mode:**
- Background: `240 10% 3.9%` (preto escuro)
- Foreground: `0 0% 98%` (branco quase puro)
- Primary/Secondary/Accent: mesmas cores do light mode
- Muted: `240 6% 15%` (cinza escuro)
- Border: `240 6% 20%`

### Gradientes
- `--gradient-primary`: Linear gradient roxo → azul (135deg)
- `--gradient-hero`: Light = branco → roxo claro / Dark = preto → roxo escuro
- `--gradient-accent`: Laranja → vermelho (135deg)

### Sombras
- `--shadow-glow`: Brilho roxo suave (0 0 40px com opacity)
- `--shadow-card`: Sombra de card padrão

### Utilitários CSS
- `.text-gradient`: Texto com gradiente primary → secondary
- `.text-gradient-accent`: Texto com gradiente accent → destructive
- `.card-glow`: Box shadow com glow effect

### Animações CSS
- `fade-in`: Fade in com translateY (0.6s)
- `fade-in-up`: Fade in com translateY menor (0.5s)
- `scale-in`: Scale de 0.95 → 1 com fade (0.4s)
- `glow-pulse`: Pulsação de brilho (3s infinito)
- `rocket-fly`: Foguete voando para cima da tela

### Border Radius
- `--radius`: 1rem (padrão)

---

## 🏗️ ESTRUTURA DO PROJETO

### Tecnologias Utilizadas
- **HTML5** - Estrutura semântica
- **CSS3** - Estilos customizados com variáveis CSS
- **JavaScript (ES6+)** - Lógica pura sem frameworks
- **Bootstrap 5.3.2** - Framework CSS para layout responsivo (via CDN)
- **Bootstrap Icons 1.11.1** - Biblioteca de ícones (via CDN)

### Arquivos do Projeto
```
balance-your-byte-main/
├── index.html          # Estrutura HTML completa
├── style.css           # Estilos customizados (variáveis CSS, animações)
├── javascript.js       # Lógica JavaScript pura
├── public/             # Arquivos estáticos
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
└── README.md           # Esta documentação
```

---

## 📄 ESTRUTURA DA PÁGINA PRINCIPAL

A página principal (`index.html`) contém todas as seções em uma única página, com navegação por scroll suave:

### 1. Watermark
- Texto gigante transparente "Desliga AI" no background
- Posição fixa, não interfere na interação
- Opacidade: 0.02

### 2. ThemeToggle
- Botão fixo no topo direito
- Alterna entre tema claro e escuro
- Persiste preferência no `localStorage`
- Ícones: Sol (light) / Lua (dark)

### 3. Hero - Seção Principal
**Elementos:**
- Badge de alerta: "Alerta: O Vício Digital Está Roubando Seu Tempo"
- Título: "Bem-vindo ao Desliga AI" (com gradiente)
- Subtítulo: "Equilibre Seu Tempo Digital" (com gradiente accent)
- Descrição explicativa
- Dois botões:
  - "Começar Agora" → scroll para `#emotion-map`
  - "Ver Todas as Ferramentas" → scroll para `#tools-preview`
- 3 cards de estatísticas:
  - 2.5h média diária em reels
  - 67% sentem-se viciados
  - ↓40% redução na produtividade

**Efeitos visuais:**
- Background com gradiente
- 2 orbs animados (esferas desfocadas com `glow-pulse`)
- Animações fade-in nos elementos

### 4. EmotionMap - Mapa de Emoções
**6 emoções disponíveis:**
1. 😊 Feliz (azul) - `bi-emoji-smile-fill`
2. ❤️ Motivado (roxo) - `bi-heart-fill`
3. 😐 Entediado (cinza) - `bi-emoji-neutral-fill`
4. 😟 Ansioso (laranja) - `bi-emoji-frown-fill`
5. ⚡ Estressado (vermelho) - `bi-lightning-charge-fill`
6. ☕ Cansado (cinza) - `bi-cup-hot-fill`

**Funcionalidade:**
- Grid responsivo: 2 colunas (mobile) / 3 colunas (desktop)
- Ao clicar em uma emoção:
  - Botão recebe classe `active` (gradiente)
  - Mostra card com 3 sugestões personalizadas
  - Animação `scale-in` no card de sugestões

**Implementação JavaScript:**
- Array `emotions` com dados de cada emoção
- Função `initEmotionMap()` cria botões dinamicamente
- Event listeners para interação

### 5. HabitsQuiz - Quiz de Hábitos Digitais
**4 perguntas:**
1. "Quanto tempo você passa diariamente em redes sociais/vídeos curtos?"
2. "Com que frequência você checa seu celular logo ao acordar?"
3. "Você consegue ficar sem o celular por 1 hora?"
4. "Com que frequência você abre apps de redes sociais automaticamente?"

**Sistema de pontos:**
- Cada resposta: 1-4 pontos
- Total máximo: 16 pontos

**4 resultados possíveis:**
- **4-6 pontos**: Uso Saudável 🎉
- **7-10 pontos**: Uso Moderado ⚠️
- **11-14 pontos**: Uso Excessivo 🚨
- **15-16 pontos**: Possível Dependência ⛔

**Cada resultado inclui:**
- Título com emoji
- Descrição
- 3 dicas personalizadas
- Badge com pontuação

**Funcionalidades:**
- Progress bar mostrando progresso (25%, 50%, 75%, 100%)
- Badge com número da pergunta atual
- Botão "Refazer Quiz" após resultado

**Implementação JavaScript:**
- Arrays `questions` e `results`
- Variáveis de estado: `currentQuestion`, `answers`, `showResult`
- Funções: `renderQuiz()`, `handleAnswer()`, `resetQuiz()`

### 6. ToolsPreview - Preview de Ferramentas
**8 ferramentas em cards clicáveis:**
1. ⏱️ Timer de Desafio (roxo) → `/timer-desafio`
2. 📈 Progresso Diário (azul) → `/progresso-diario`
3. 💡 Atividades Offline (laranja) → `/atividades-offline`
4. 🏆 Mural de Conquistas (roxo) → `/mural-conquistas`
5. ✅ Checklist Diário (azul) → `/checklist-diario`
6. 📤 Compartilhar Progresso (laranja) → `/compartilhar-progresso`
7. 👁️ Modo Foco (vermelho) → `/modo-foco`
8. 📖 Diário Rápido (roxo) → `/diario-rapido`

**Layout:**
- Grid responsivo: 1 coluna (mobile) / 2 (tablet) / 4 (desktop)
- Cards com hover: scale(1.05) + border glow
- Animações fade-in-up com delay escalonado

**Banner final:**
- Alerta informando que ferramentas estarão disponíveis após cadastro

**Implementação JavaScript:**
- Array `tools` com dados
- Função `initTools()` cria cards dinamicamente
- Click handler mostra alert (em versão completa, faria navegação)

### 7. Maleficios - Seção de Malefícios
**6 malefícios em cards:**
1. 🧠 Danos Cognitivos (vermelho) - `bi-cpu-fill`
2. ⏰ Perda de Tempo (laranja) - `bi-clock-fill`
3. 👁️ Fadiga Visual (azul) - `bi-eye-fill`
4. ❤️ Saúde Mental (vermelho) - `bi-heart-fill`
5. 👥 Isolamento Social (roxo) - `bi-people-fill`
6. ⚡ Produtividade Zero (laranja) - `bi-lightning-charge-fill`

**Layout:**
- Grid: 3 colunas (desktop) / 2 (tablet) / 1 (mobile)
- Cards com hover: border-primary/50

**Banner informativo:**
- Alerta destacado: "O Algoritmo é Projetado Para Viciar"
- Texto explicativo sobre como plataformas usam IA para viciar

**Implementação JavaScript:**
- Array `harms` com dados
- Função `initHarms()` cria cards dinamicamente

### 8. Solutions - Soluções Práticas
**4 categorias de soluções:**
1. 🎯 Defina Limites Claros (`bi-bullseye`) - 4 passos
2. 🛡️ Crie Barreiras Físicas (`bi-shield-check`) - 4 passos
3. 🏆 Substitua o Hábito (`bi-trophy-fill`) - 4 passos
4. ✅ Mantenha-se Firme (`bi-check-circle-fill`) - 4 passos

**Layout:**
- Grid: 2 colunas
- Cards grandes com ícones e listas numeradas

**CTA Final:**
- Card com gradiente
- Botão: "Apertar o botão de decolagem! 🚀"
- Ao clicar:
  - Mostra overlay com foguete
  - Animação `rocket-fly` (foguete voa para cima)
  - Após 2s, mostra alert (em versão completa, redirecionaria para cadastro)

**Implementação JavaScript:**
- Array `solutions` com dados
- Função `initSolutions()` cria cards dinamicamente
- Função `launchRocket()` gerencia animação

### 9. Footer - Rodapé
- Título: "Desliga AI" (com gradiente)
- Descrição sobre o propósito do projeto
- Copyright: © 2025 | Desliga AI

---

## 🎯 FUNCIONALIDADES PRINCIPAIS

### 1. Sistema de Tema Dark/Light
**Implementação:**
- Classe `dark` no `<html>` alterna tema
- Variáveis CSS mudam automaticamente
- Preferência salva no `localStorage`
- Detecta preferência do sistema no primeiro carregamento

**Código JavaScript:**
```javascript
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  } else {
    document.documentElement.classList.toggle('dark', prefersDark);
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark', !isDark);
  localStorage.setItem('theme', !isDark ? 'dark' : 'light');
}
```

### 2. Rolagem Suave
**Implementação:**
- Função `scrollToSection(id)` usa `scrollIntoView` com `behavior: 'smooth'`
- Chamada pelos botões "Começar Agora" e "Ver Todas as Ferramentas"

### 3. Interatividade JavaScript Pura
**Sem React, sem frameworks:**
- Manipulação direta do DOM
- Event listeners nativos
- Arrays e objetos para dados
- Funções para lógica de negócio
- Variáveis globais para estado (simulando useState)

### 4. Animações CSS
**Todas implementadas em CSS puro:**
- `@keyframes` para animações
- Classes utilitárias para aplicar animações
- Transições suaves em hover
- Delays escalonados para efeitos sequenciais

### 5. Responsividade
**Bootstrap Grid System:**
- Classes: `col-12`, `col-md-6`, `col-lg-4`, etc.
- Breakpoints padrão do Bootstrap
- Layout mobile-first

---

## 📊 DADOS E ESTRUTURAS

### Quiz de Hábitos
```javascript
const questions = [
  {
    id: 1,
    question: "Quanto tempo você passa diariamente...",
    options: [
      { text: "Menos de 30 minutos", points: 1 },
      // ...
    ]
  },
  // ...
];

const results = [
  {
    range: [4, 6],
    title: "Uso Saudável 🎉",
    description: "...",
    tips: ["...", "...", "..."]
  },
  // ...
];
```

### Emoções
```javascript
const emotions = [
  {
    id: 'happy',
    icon: 'bi-emoji-smile-fill',
    label: 'Feliz',
    color: 'text-info',
    suggestions: [
      'Continue assim!...',
      // ...
    ]
  },
  // ...
];
```

### Ferramentas
```javascript
const tools = [
  {
    id: 'timer',
    title: 'Timer de Desafio',
    description: '...',
    icon: 'bi-stopwatch-fill',
    color: 'text-primary',
    route: '/timer-desafio'
  },
  // ...
];
```

---

## 🎨 PADRÕES DE DESIGN

### Cards
- Background: `hsl(var(--card))`
- Border: `hsl(var(--border))`
- Border radius: `var(--radius)` (1rem)
- Hover: `border-primary/50` + `shadow-glow`
- Padding: `1.5rem` (p-6)

### Botões
- Primary: Gradiente `primary → secondary`
- Outline: Border com hover `bg-primary/10`
- Tamanho: `btn-lg` para CTAs principais

### Ícones
- Bootstrap Icons via CDN
- Tamanhos: `2rem` (títulos) / `1.25rem` (botões)
- Cores semânticas: `text-primary`, `text-secondary`, etc.

### Títulos
- H1: `display-2` (Bootstrap) ou `text-5xl` (custom)
- H2: `display-4` (Bootstrap)
- Spans com gradiente para destaque

### Espaçamento
- Seções: `py-5` (Bootstrap) = 3rem vertical
- Cards: `p-4` ou `p-6`
- Gaps: `gap-3` ou `gap-4`

---

## 🚀 COMO USAR

### Opção 1: Abrir Diretamente
1. Abra o arquivo `index.html` no navegador
2. Funciona imediatamente (após carregar Bootstrap do CDN)

### Opção 2: Servidor Local
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server

# PHP
php -S localhost:8000
```
Depois acesse: `http://localhost:8000`

---

## 🔧 PERSONALIZAÇÃO

### Cores
Edite as variáveis CSS em `style.css`:
```css
:root {
  --primary: 263 70% 50%;
  --secondary: 217 91% 60%;
  --accent: 25 95% 53%;
  /* ... */
}
```

### Animações
Modifique os `@keyframes` em `style.css`:
```css
@keyframes fade-in {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
```

### Dados
Edite os arrays em `javascript.js`:
- `emotions` - Emoções e sugestões
- `questions` - Perguntas do quiz
- `results` - Resultados do quiz
- `tools` - Ferramentas disponíveis
- `harms` - Malefícios
- `solutions` - Soluções

---

## 📝 NOTAS IMPORTANTES

1. **Apenas Bootstrap**: O projeto usa apenas Bootstrap (não Tailwind)
2. **JavaScript Puro**: Todo código é JavaScript vanilla (sem React, sem frameworks)
3. **Sem Build**: Não precisa de Node.js, npm ou processo de build
4. **CDN**: Bootstrap e Bootstrap Icons carregados via CDN
5. **LocalStorage**: Tema salvo no navegador
6. **Responsivo**: Funciona em todos os dispositivos

---

## 🎯 FUNCIONALIDADES FUTURAS

As seguintes páginas estão documentadas mas não implementadas na versão atual (apenas preview na home):

- `/cadastro` - Formulário de cadastro
- `/timer-desafio` - Timer Pomodoro
- `/progresso-diario` - Gráficos de progresso
- `/atividades-offline` - Sorteio de atividades
- `/mural-conquistas` - Sistema de badges
- `/checklist-diario` - Lista de tarefas
- `/compartilhar-progresso` - Compartilhamento social
- `/modo-foco` - Modo foco com timer
- `/diario-rapido` - Diário de reflexões

**Nota**: Estas páginas podem ser implementadas seguindo o mesmo padrão (HTML/CSS/JS puro com Bootstrap).

---

## 📄 LICENÇA

© 2025 | Desliga AI - Todos os direitos reservados

---

## 🛠️ CONVERSÃO DO PROJETO

Este projeto foi convertido de React/TypeScript/Tailwind para HTML/CSS/JavaScript puro:

**Removido:**
- React e todos os componentes React
- TypeScript e arquivos `.tsx`
- Tailwind CSS (substituído por Bootstrap)
- Vite e configurações de build
- Todas as dependências npm

**Mantido:**
- Design visual idêntico
- Todas as funcionalidades interativas
- Animações e efeitos visuais
- Sistema de temas dark/light
- Responsividade completa

**Resultado:**
- Projeto 100% funcional sem dependências locais
- Código mais simples e direto
- Fácil de entender e modificar
- Funciona apenas abrindo o HTML no navegador
