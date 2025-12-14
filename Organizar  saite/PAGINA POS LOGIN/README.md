# Desliga AI

Sistema de detox digital construído com HTML, CSS, JavaScript puro e Bootstrap.

## Tecnologias Utilizadas

- **HTML5** - Estrutura da página
- **CSS3** - Estilização customizada
- **JavaScript (Vanilla)** - Lógica da aplicação
- **Bootstrap 5.3.2** - Framework CSS para componentes
- **Bootstrap Icons** - Ícones

## Estrutura de Arquivos

```
digital-detox-journey/
├── index.html      # Página principal
├── styles.css      # Estilos customizados
├── script.js       # Lógica JavaScript
├── db.json         # Base de dados inicial
└── README.md       # Este arquivo
```

## Como Usar

1. Abra o arquivo `index.html` diretamente no navegador
2. Ou use um servidor local simples:
   - Python: `python -m http.server 8000`
   - Node.js: `npx http-server`
   - PHP: `php -S localhost:8000`

3. Acesse `http://localhost:8000` no navegador

## Funcionalidades

- ✅ Tela de login
- ✅ Dashboard com progresso do usuário
- ✅ Sistema de desafios diários
- ✅ Sistema de pontos e ranks
- ✅ Visualização de jornada (roadmap)
- ✅ Ferramentas de apoio
- ✅ Seção de conscientização
- ✅ Modo claro/escuro (dark mode)
- ✅ Armazenamento local (localStorage)

## Base de Dados

O arquivo `db.json` contém a estrutura inicial de dados. Os dados são salvos automaticamente no `localStorage` do navegador após o primeiro uso.

## Notas

- Todos os dados são armazenados localmente no navegador (localStorage)
- Não requer instalação de dependências
- Funciona offline após o primeiro carregamento
- Compatível com todos os navegadores modernos
