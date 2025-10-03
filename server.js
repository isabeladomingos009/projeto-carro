import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

import veiculosRoutes from './routes/veiculos.js';
import authRoutes from './routes/authRoutes.js';
import climaRoutes from './routes/clima.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();
const app = express();

app.use(cors());
app.use(express.json());


// --- 1. ROTAS DA API ---
// As rotas específicas da API vêm primeiro.
app.use('/api/auth', authRoutes);
app.use('/api/veiculos', veiculosRoutes);
app.use('/api/clima', climaRoutes);


// --- 2. SERVIR O FRONTEND ---
// Esta seção deve vir DEPOIS de todas as rotas da API.
if (process.env.NODE_ENV === 'production') {
    // Se estiver em produção, serve os arquivos estáticos
    app.use(express.static(path.join(__dirname)));

    // E para qualquer outra rota, serve o index.html
    app.get('*', (req, res) =>
        res.sendFile(path.resolve(__dirname, 'index.html'))
    );
} else {
    // Se estiver em desenvolvimento, apenas adicionamos uma rota raiz
    app.get('/', (req, res) => {
        res.send('API está rodando em modo de desenvolvimento...');
    });
}

// --- 3. MIDDLEWARE DE ERRO ---
// O handler de erro vem por último.
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));