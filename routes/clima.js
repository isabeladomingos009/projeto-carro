// routes/clima.js (arquivo completo)
import express from 'express';
import { getPrevisaoDetalhada } from '../controllers/climaController.js'; // Importa a função do controller

const router = express.Router();

// Rota para buscar a previsão do tempo para uma cidade específica
router.route('/:cidade').get(getPrevisaoDetalhada);

export default router;