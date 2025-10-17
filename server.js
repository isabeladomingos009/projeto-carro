
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
 app.use('/api/auth', authRoutes);
 app.use('/api/veiculos', veiculosRoutes);
 app.use('/api/clima', climaRoutes);

 // --- 2. SERVIR O FRONTEND ---
 // Esta linha serve todos os arquivos estáticos (CSS, JS, imagens)
 app.use(express.static(path.join(__dirname)));

 // Esta rota "catch-all" garante que qualquer outra requisição
 // receba o index.html. É a parte mais importante.
 app.get('*', (req, res) => {
     res.sendFile(path.resolve(__dirname, 'index.html'));
 });

 // --- 3. MIDDLEWARE DE ERRO ---
 app.use(errorHandler);

 const PORT = process.env.PORT || 5000;
 app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
