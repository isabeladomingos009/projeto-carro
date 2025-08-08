// 3.1 & 6.1 - Carrega variáveis de ambiente
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Conecta ao Banco de Dados
connectDB();

const app = express();

// Middlewares essenciais
app.use(cors()); // Permite requisições de diferentes origens (frontend)
app.use(express.json()); // Habilita o parser de JSON para o corpo das requisições

// 1.2. - Definição das Rotas da API
app.use('/api/veiculos', require('./routes/veiculos'));
//app.use('/api/servicos', require('./routes/servicos'));
//app.use('/api/ferramentas', require('./routes/ferramentas'));

// 2.2. - Middleware de Tratamento de Erros Centralizado
// (Deve ser o último middleware a ser adicionado)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));