// server.js

// 1. Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// 2. Importa as bibliotecas necessárias
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Importa o middleware CORS

// 3. Cria a aplicação Express
const app = express();
const PORT = process.env.PORT || 3001; // Define a porta, usando a variável de ambiente PORT ou 3001 como padrão
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY; // Pega a chave da API do .env

// 4. Configura o middleware CORS para permitir requisições do frontend
// Isto é importante se o frontend estiver em uma porta diferente (como 5500 do Live Server)
app.use(cors());

// 5. Middleware para verificar se a chave da API está configurada
app.use((req, res, next) => {
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


// 6. Define a rota para buscar a previsão do tempo
// GET /api/previsao/:cidade
app.get('/api/previsao/:cidade', async (req, res) => {
    const cidade = req.params.cidade; // Pega o nome da cidade da URL

    if (!cidade) {
        // 7. Valida se a cidade foi fornecida
        return res.status(400).json({ error: "Nome da cidade é obrigatório." });
    }

    // 8. Constrói a URL para a API da OpenWeatherMap (Forecast de 5 dias / 3 horas)
    // Documentação: https://openweathermap.org/forecast5
    const openWeatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;

    console.log(`[Backend] Recebida requisição para ${cidade}. Chamando OpenWeatherMap...`);

    try {
        // 9. Faz a requisição para a API da OpenWeatherMap usando axios
        const response = await axios.get(openWeatherApiUrl);

        // 10. Envia os dados recebidos da OpenWeatherMap de volta para o frontend
        console.log(`[Backend] Resposta da OpenWeatherMap para ${cidade} recebida (Status: ${response.status}). Enviando para o frontend.`);
        res.json(response.data);

    } catch (error) {
        // 11. Trata erros na requisição para a OpenWeatherMap
        console.error(`[Backend] Erro ao buscar previsão para ${cidade}:`, error.message);

        if (error.response) {
            // O OpenWeatherMap respondeu com um código de erro (ex: 404 Not Found)
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

// 12. Rota padrão para testar se o backend está rodando (opcional)
app.get('/', (req, res) => {
    res.send('Servidor backend da Garagem Inteligente está online!');
});


// 13. Inicia o servidor Express
app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
    console.log(`Acesse http://localhost:${PORT}`);
     if (!OPENWEATHER_API_KEY) {
         console.warn("\n!!! AVISO GRAVE: A chave da API OpenWeatherMap NÃO FOI LIDA. !!!");
         console.warn("!!! A funcionalidade de clima NÃO FUNCIONARÁ até você configurar a variável OPENWEATHER_API_KEY no seu arquivo .env na raiz do projeto. !!!\n");
     } else {
         console.log("Chave da API OpenWeatherMap carregada com sucesso.");
     }
});