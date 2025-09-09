// controllers/climaController.js (arquivo completo)
import axios from 'axios';

// Pega a chave da API do .env
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// @desc    Obter previsão detalhada do tempo para uma cidade
// @route   GET /api/clima/:cidade
// @access  Public
export const getPrevisaoDetalhada = async (req, res, next) => {
    const cidade = req.params.cidade; // Pega o nome da cidade da URL

    if (!cidade) {
        return res.status(400).json({ error: "Nome da cidade é obrigatório." });
    }

    if (!OPENWEATHER_API_KEY) {
        console.error("ERRO: A chave da API OpenWeatherMap não está configurada no arquivo .env");
        return res.status(500).json({ 
            error: "A chave da API de clima não está configurada no servidor.",
            details: "Verifique se a variável OPENWEATHER_API_KEY está definida no arquivo .env do backend."
        });
    }

    const openWeatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;

    console.log(`[Backend/Clima] Recebida requisição para ${cidade}. Chamando OpenWeatherMap...`);

    try {
        const response = await axios.get(openWeatherApiUrl);
        console.log(`[Backend/Clima] Resposta da OpenWeatherMap para ${cidade} recebida (Status: ${response.status}).`);
        res.status(200).json({ success: true, data: response.data }); // Envia a resposta encapsulada em 'data'
    } catch (error) {
        console.error(`[Backend/Clima] Erro ao buscar previsão para ${cidade}:`, error.message);
        if (error.response) {
            res.status(error.response.status).json({
                success: false,
                error: error.response.data.message || `Erro ${error.response.status} da API de clima externa.`,
                city: cidade
            });
        } else {
            next(error); // Passa para o errorHandler geral se for outro tipo de erro
        }
    }
};