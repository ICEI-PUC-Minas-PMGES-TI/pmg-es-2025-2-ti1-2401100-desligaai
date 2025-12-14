## ✅ Pré-requisitos

Antes de iniciar, certifique-se de:

1. Ter o [Node.js](https://nodejs.org/) instalado em sua máquina.  
2. Estar no terminal na pasta raiz do projeto.  
   ```bash
   node -v
   Se aparecer algo como v22.9.0, o Node está pronto para uso⚙️

Passo a passo para executar o projeto:

1. Abra o projeto no terminal
    Acesse a pasta onde o projeto está salvo.
    Exemplo:
    cd: caminho/da/sua/pasta
    ![Foto de exemplo do caminho da pasta](/codigo/public/modulos/Evelyn%20-%20atvrandom/exemplocd.png)

2. Abra o arquivo principal no navegador
    Abra o arquivo html que você está avaliando no seu navegador(basta dar duplo clique no arquivo ou abrir via VS Code com "Open with Live Server)

    ⚠️ Nesse momento o CRUD ainda não estará funcional, apenas a interface será exibida.
    Exemplo: Página de atividades aleatórias
    ![Foto de exemplo da página de atividades aleatórias](/codigo/public/modulos/Evelyn%20-%20atvrandom/exemploatvaleatorias.png)

3. Execute o servidor JSON
    No mesmo terminal, execute o seguinte comando:

    npx json-server --watch evydb.json --port 3000

    Depois de rodar, ele mostrará algo como:    
        Index:
        http://localhost:3000/
    ![Foto de exemplo do terminal](/codigo/public/modulos/Evelyn%20-%20atvrandom/exemplonode.png)

4. Acesse o link no navegador
    Acesse o link destacado como na imagem anterior

5. Volte para a página do arquivo principal e atualize
    Após clicar no link, volte à aba onde abriu o arquivo principal e aperte F5 / Atualizar a página
    Agora o CRUD está funcional
    Exemplo:
    ![Foto de exemplo do CRUD funcionando](/codigo/public/modulos/Evelyn%20-%20atvrandom/exemplocrudfuncional.png)

📝 Observações

    Se o terminal informar que a porta 3000 já está em uso, você pode mudar o comando para:

    npx json-server --watch evydb.json --port 3001

    Se alterar o nome ou caminho do arquivo evydb.json, lembre-se de atualizar o comando no passo 3.

