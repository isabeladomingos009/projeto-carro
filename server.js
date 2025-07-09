// server.js

// Carrega as variáveis de ambiente do arquivo .env usando sintaxe de import para ES Modules.
// Deve ser a primeira coisa a fazer para que as variáveis estejam disponíveis.
import 'dotenv/config'; // <-- CORRIGIDO AQUI: Usa import para dotenv

// Importa as bibliotecas necessárias usando sintaxe de import
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';

// Cria a aplicação Express
const app = express();
// Define a porta, usando a variável de ambiente PORT (para o Render) ou 3001 como padrão (local)
const PORT = process.env.PORT || 3001;
// Pega a chave da API de clima e a URI do MongoDB do .env
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const MONGO_URI_CRUD = process.env.MONGO_URI_CRUD; // <-- Pega a URI do .env

// --- NOVOS DADOS INTERNOS (Arrays de Objetos - mantidos por enquanto, mas virão do DB depois) ---
const veiculosDestaque = [
    { id: 'd001', modelo: "Mustang GT", ano: 2023, destaque: "Potência V8 Incrível", imagemUrl: "imagens/mustang.png" }, // Exemplo com imagem
    { id: 'd002', modelo: "Tesla Model S Plaid", ano: 2024, destaque: "Aceleração Inacreditável", imagemUrl: "imagens/teslaplaid.png" },
    { id: 'd003', modelo: "Jeep Wrangler Rubicon", ano: 2022, destaque: "Aventureiro Todo-Terreno", imagemUrl: "imagens/wrangler.png" }
];

const servicosGaragem = [
    { id: "svc001", nome: "Troca de Óleo e Filtro", descricao: "Serviço rápido e essencial para a vida do motor.", precoEstimado: "R$ 250,00" },
    { id: "svc002", nome: "Alinhamento e Balanceamento", descricao: "Melhora a dirigibilidade e a vida útil dos pneus.", precoEstimado: "R$ 180,00" },
    { id: "svc003", nome: "Inspeção Completa (Check-up)", descricao: "Avaliação geral do veículo, freios, suspensão, fluidos, etc.", precoEstimado: "R$ 350,00" }
];

const ferramentasEssenciais = [
    { id: "fer001", nome: "Chave de Roda Cruz", utilidade: "Indispensável para troca de pneus.", imagemUrl: "imagens/chavederoda.png" },
    { id: "fer002", nome: "Macaco Hidráulico", utilidade: "Levantar o veículo com segurança.", imagemUrl: "imagens/macaco.png" },
    { id: "fer003", nome: "Jogo de Chaves Combinadas", utilidade: "Variedade de tamanhos para apertar/soltar parafusos.", imagemUrl: "imagens/chaves.png" }
];
// --- FIM DOS NOVOS DADOS INTERNOS ---


// --- FUNÇÃO PARA CONECTAR AO BANCO DE DADOS MONGODB ATLAS ---
async function connectCrudDB() {
    // Verifica se já existe uma conexão Mongoose ativa (readyState 1 é 'connected')
    if (mongoose.connections[0].readyState) {
        console.log("[MongoDB] Mongoose já conectado.");
        return; // Se já conectado, não tenta de novo
    }

    // Verifica se a String de Conexão está definida no .env
    if (!MONGO_URI_CRUD) {
        console.error("\n!!! ERRO FATAL: Variável de ambiente MONGO_URI_CRUD NÃO DEFINIDA! !!!");
        console.error("!!! A aplicação não pode conectar ao Banco de Dados. Configure-a no seu arquivo .env (local) e nas variáveis de ambiente do Render.com. !!!\n");
        // Em um app real, talvez logar e tentar reconectar depois. Para aprender, pode apenas avisar.
        return; // Não tenta conectar se a URI estiver faltando
    }

    console.log("[MongoDB] Tentando conectar ao MongoDB Atlas...");
    try {
        // Opções de conexão (muitas agora são padrão no Mongoose 6+, mas serverSelectionTimeoutMS é útil)
        const options = {
            serverSelectionTimeoutMS: 5000, // Timeout para selecionar o servidor (5s)
            // Outras opções como useNewUrlParser, useUnifiedTopology, etc., são padrão no Mongoose 6+
        };

        // Tenta estabelecer a conexão
        await mongoose.connect(MONGO_URI_CRUD, options);

        console.log("🚀 Conectado ao MongoDB Atlas (CRUD) via Mongoose com sucesso!");

        // Opcional: Ouvir eventos de conexão para mais logs (não bloqueiam o app)
        mongoose.connection.on('disconnected', () => console.warn("⚠️ Mongoose desconectado!"));
        mongoose.connection.on('error', (err) => console.error("❌ Mongoose erro de conexão:", err));
        // O evento 'connected' é disparado automaticamente após o sucesso do await connect

    } catch (err) {
        console.error("❌ ERRO FATAL: Falha ao conectar ao MongoDB (CRUD):", err.message);
        console.error("Verifique:");
        console.error("- Sua MONGO_URI_CRUD no arquivo .env local e/ou no Render.com");
        console.error("- Acesso de Rede (Network Access) no MongoDB Atlas (seu IP e/ou 0.0.0.0/0 no Render)");
        console.error("- Credenciais de Usuário do Banco de Dados (Database Access) no MongoDB Atlas");
        // Em um app real, você poderia tentar reconectar periodicamente ou encerrar o processo
        // process.exit(1); // Descomente se a conexão inicial for essencial para o app rodar
    }
}

// Chama a função de conexão para tentar conectar ao iniciar o servidor
connectCrudDB();

// --- FIM DA FUNÇÃO DE CONEXÃO MONGODB ---


// Configura o middleware CORS para permitir requisições do frontend
// Isto é importante se o frontend estiver em uma porta diferente (como 5500 do Live Server)
app.use(cors());
// Middleware para parsear JSON no corpo das requisições (útil para rotas POST/PUT/PATCH futuras)
app.use(express.json());


// Middleware para verificar se a chave da API de Clima está configurada
// (Note: Este middleware só afeta rotas definidas DEPOIS dele ou que usem 'next()')
app.use('/api/previsao', (req, res, next) => { // Aplica este middleware SOMENTE para rotas que começam com /api/previsao
    if (!OPENWEATHER_API_KEY) {
        console.error("ERRO: A chave da API OpenWeatherMap não está configurada no arquivo .env");
        // Retorna um erro 500 para o frontend
        return res.status(500).json({
            error: "A chave da API de clima não está configurada no servidor.",
            details: "Verifique se a variável OPENWEATHER_API_KEY está definida no arquivo .env do backend."
        });
    }
    next(); // Continua para a próxima rota se a chave estiver configurada
});


// Define a rota para buscar a previsão do tempo (já existente)
// GET /api/previsao/:cidade
app.get('/api/previsao/:cidade', async (req, res) => {
    const cidade = req.params.cidade; // Pega o nome da cidade da URL

    if (!cidade) {
        // Valida se a cidade foi fornecida
        return res.status(400).json({ error: "Nome da cidade é obrigatório." });
    }

    // Constrói a URL para a API da OpenWeatherMap (Forecast de 5 dias / 3 horas)
    // Documentação: https://openweathermap.org/forecast5
    const openWeatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;

    console.log(`[Backend] Recebida requisição para /api/previsao/${cidade}. Chamando OpenWeatherMap...`);

    try {
        // Faz a requisição para a API da OpenWeatherMap usando axios
        const response = await axios.get(openWeatherApiUrl);

        // Envia os dados recebidos da OpenWeatherMap de volta para o frontend
        console.log(`[Backend] Resposta da OpenWeatherMap para ${cidade} recebida (Status: ${response.status}). Enviando para o frontend.`);
        res.json(response.data);

    } catch (error) {
        // Trata erros na requisição para a OpenWeatherMap
        console.error(`[Backend] Erro ao buscar previsão para ${cidade}:`, error.message);

        if (error.response) {
            // O OpenWeatherMap respondeu com um código de erro (ex: 404 Not Found, 401 Unauthorized, etc.)
            console.error(`[Backend] Status do Erro da API Externa: ${error.response.status}`, error.response.data);
            res.status(error.response.status).json({
                error: error.response.data.message || `Erro ${error.response.status} da API de clima externa.`,
                city: cidade
            });
        } else if (error.request) {
            // A requisição foi feita, mas não houve resposta
            console.error('[Backend] Nenhuma resposta recebida da API externa:', error.request);
            res.status(500).json({
                error: "Erro de rede ao contatar a API de clima.",
                city: cidade
            });
        } else {
            // Algo aconteceu na configuração da requisição que disparou um erro
            console.error('[Backend] Erro na configuração da requisição:', error.message);
             res.status(500).json({
                error: "Erro interno do servidor ao preparar a requisição de clima.",
                city: cidade
            });
        }
    }
});

// --- ROTAS PARA SERVIR OS DADOS INTERNOS (Arrays de Objetos) ---

// GET /api/garagem/veiculos-destaque
app.get('/api/garagem/veiculos-destaque', (req, res) => {
    console.log(`[Backend] Requisição para /api/garagem/veiculos-destaque. Enviando dados.`);
    res.json(veiculosDestaque); // Envia o array de veículos destaque
});

// GET /api/garagem/servicos-oferecidos
app.get('/api/garagem/servicos-oferecidos', (req, res) => {
    console.log(`[Backend] Requisição para /api/garagem/servicos-oferecidos. Enviando dados.`);
    res.json(servicosGaragem); // Envia o array de serviços
});

// GET /api/garagem/ferramentas-essenciais
app.get('/api/garagem/ferramentas-essenciais', (req, res) => {
    console.log(`[Backend] Requisição para /api/garagem/ferramentas-essenciais. Enviando dados.`);
    res.json(ferramentasEssenciais); // Envia o array de ferramentas
});

// (Opcional) Exemplo de rota para buscar um item específico por ID
app.get('/api/garagem/servicos-oferecidos/:idServico', (req, res) => {
    const { idServico } = req.params; // Pega o ID da URL
    console.log(`[Backend] Requisição para /api/garagem/servicos-oferecidos/${idServico}.`);
    const servico = servicosGaragem.find(s => s.id === idServico); // Procura no array

    if (servico) {
        console.log(`[Backend] Serviço ${idServico} encontrado. Enviando dados.`);
        res.json(servico); // Envia o objeto encontrado
    } else {
        console.warn(`[Backend] Serviço ${idServico} não encontrado.`);
        res.status(404).json({ error: 'Serviço não encontrado.' }); // Envia erro 404
    }
});


// --- FIM DAS ROTAS ---


// Rota padrão para testar se o backend está rodando
app.get('/', (req, res) => {
    res.send('Servidor backend da Garagem Inteligente está online!');
});


// Inicia o servidor Express
app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
    console.log(`Acesse http://localhost:${PORT}`);
     if (!OPENWEATHER_API_KEY) {
         console.warn("\n!!! AVISO GRAVE: A chave da API OpenWeatherMap NÃO FOI LIDA. !!!");
         console.warn("!!! A funcionalidade de clima NÃO FUNCIONARÁ até você configurar a variável OPENWEATHER_API_KEY no seu arquivo .env na raiz do projeto. !!!\n");
     } else {
         console.log("Chave da API OpenWeatherMap carregada com sucesso.");
     }
     // Aviso sobre a conexão do DB (se a URI não estiver definida)
     if (!MONGO_URI_CRUD) {
          console.warn("\n!!! AVISO GRAVE: A URI do MongoDB (MONGO_URI_CRUD) NÃO FOI LIDA. !!!");
          console.warn("!!! As funcionalidades de Banco de Dados NÃO FUNCIONARÃO até você configurar a variável MONGO_URI_CRUD no seu arquivo .env (local) e no Render.com. !!!\n");
     }
});