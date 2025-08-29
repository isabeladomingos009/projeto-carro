// server.js (arquivo completo e ATUALIZADO)

// Importações de módulos ES (moderno)
import 'dotenv/config'; // Carrega variáveis de ambiente do .env
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose'; // Para a conexão com o MongoDB
import path from 'path'; // Para lidar com caminhos de arquivos
import { fileURLToPath } from 'url'; // Para __dirname em módulos ES

// Definindo __filename e __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importação das funções de conexão e middlewares
import connectDB from './config/db.js'; // Conexão DB
import errorHandler from './middleware/errorHandler.js'; // Tratamento de erros

// Importação dos arquivos de rota
import veiculosRoutes from './routes/veiculos.js';
import servicosRoutes from './routes/servicos.js'; 
// import ferramentasRoutes from './routes/ferramentas.js'; // <-- COMENTADO: Para pular a parte de ferramentas por enquanto
// import climaRoutes from './routes/clima.js'; // <-- COMENTADO: Para pular a parte de clima por enquanto

// Conecta ao Banco de Dados MongoDB Atlas
connectDB();

const app = express();

// Middlewares essenciais
app.use(cors()); // Permite requisições de diferentes origens (frontend)
app.use(express.json()); // Habilita o parser de JSON para o corpo das requisições

// Servir arquivos estáticos da pasta raiz do projeto (para Opção B)
// Isso fará com que `index.html`, `css/`, `js/`, `imagens/` sejam acessíveis diretamente.
app.use(express.static(__dirname)); 

// Definição das Rotas da API
app.use('/api/veiculos', veiculosRoutes);
app.use('/api/servicos', servicosRoutes);
// app.use('/api/ferramentas', ferramentasRoutes); // <-- COMENTADO: Para pular a parte de ferramentas por enquanto
// app.use('/api/clima', climaRoutes); // <-- COMENTADO: Para pular a parte de clima por enquanto

// Rota padrão para testar se o backend está rodando
app.get('/api', (req, res) => { // Mudei para /api para evitar conflito com index.html
    res.send('Servidor backend da Garagem Virtual API está online!');
});

// Middleware de Tratamento de Erros Centralizado
// (Deve ser o último middleware a ser adicionado, antes de app.listen)
app.use(errorHandler);

const PORT = process.env.PORT || 5000; // Porta para o backend (5000 para evitar conflito com live-server 5500)

app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
    console.log(`Acesse http://localhost:${PORT}`);
    console.log(`Frontend acessível em http://localhost:${PORT}/index.html (ou use Live Server na raiz)`);
});