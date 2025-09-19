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
// import servicosRoutes from './routes/servicos.js'; // MANTIDO COMENTADO: Para focar no clima e reset
// import ferramentasRoutes from './routes/ferramentas.js'; // MANTIDO COMENTADO
import climaRoutes from './routes/clima.js'; // <-- DESCOMENTADO: Ativando a rota de clima

// Conecta ao Banco de Dados MongoDB Atlas
connectDB();

const app = express();

// Middlewares essenciais
app.use(cors()); // Permite requisições de diferentes origens (frontend)
app.use(express.json()); // Habilita o parser de JSON para o corpo das requisições

// --- DEFINIÇÃO DAS ROTAS DA API (COLOCAR SEMPRE ANTES DE SERVIR ARQUIVOS ESTÁTICOS) ---
// É CRÍTICO que todas as rotas da API venham ANTES de `express.static(__dirname)`
app.use('/api/veiculos', veiculosRoutes);
// app.use('/api/servicos', servicosRoutes); // MANTIDO COMENTADO
// app.use('/api/ferramentas', ferramentasRoutes); // MANTIDO COMENTADO
app.use('/api/clima', climaRoutes); // <-- USANDO A ROTA DE CLIMA AGORA

// Rota padrão para testar se o backend está rodando
app.get('/api', (req, res) => {
    res.send('Servidor backend da Garagem Virtual API está online!');
});

// --- SERVIR ARQUIVOS ESTÁTICOS (COLOCAR SEMPRE DEPOIS DAS ROTAS DA API) ---
// Isso fará com que `index.html`, `css/`, `js/`, `imagens/` sejam acessíveis diretamente da raiz.
app.use(express.static(__dirname)); 

// Middleware de Tratamento de Erros Centralizado
// (Deve ser o último middleware a ser adicionado, antes de app.listen)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
    console.log(`Acesse http://localhost:${PORT}`);
    console.log(`Frontend acessível em http://localhost:${PORT}/index.html (ou use Live Server na raiz)`);
});