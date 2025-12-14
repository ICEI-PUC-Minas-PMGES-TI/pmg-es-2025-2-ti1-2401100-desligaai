const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8080;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Headers que desabilitam cache COMPLETAMENTE
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Last-Modified', new Date().toUTCString());
  res.setHeader('ETag', Date.now().toString());
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Decodificar URL para lidar com espaços e caracteres especiais
  let decodedUrl = decodeURIComponent(req.url);
  
  // Log para debug
  console.log(`[SERVER] Requisição recebida: ${req.url}`);
  console.log(`[SERVER] URL decodificada: ${decodedUrl}`);
  
  let filePath = '.' + decodedUrl;
  
  if (filePath === './' || filePath === './index.html') {
    filePath = './index principal.html';
  }
  
  // Normalizar separadores de caminho para Windows e lidar com espaços
  filePath = path.normalize(filePath);
  
  console.log(`[SERVER] Caminho do arquivo: ${filePath}`);

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      console.error(`[SERVER] Erro ao ler arquivo: ${error.code} - ${filePath}`);
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`<h1>404 - Arquivo não encontrado</h1><p>Caminho: ${filePath}</p>`, 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Erro do servidor: ${error.code} - ${error.message}`, 'utf-8');
      }
    } else {
      console.log(`[SERVER] Arquivo servido com sucesso: ${filePath}`);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`   Servidor rodando em http://localhost:${PORT}`);
  console.log(`   Cache DESABILITADO completamente!`);
  console.log(`========================================\n`);
  
  // Abre o navegador automaticamente
  const url = `http://localhost:${PORT}`;
  const command = process.platform === 'win32' 
    ? `start ${url}` 
    : process.platform === 'darwin' 
    ? `open ${url}` 
    : `xdg-open ${url}`;
  
  exec(command);
});

