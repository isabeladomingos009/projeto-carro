import express from 'express';
import {
  getVeiculos,
  createVeiculo,
  getVeiculoById,
  updateVeiculo,
  deleteVeiculo
} from '../controllers/veiculoController.js';

// NOVO: Importa nosso guardião
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Rotas para a coleção de veículos (/api/veiculos) ---
// TODAS as rotas abaixo agora exigem autenticação
router.route('/')
  .get(protect, getVeiculos)     // GET -> Lista os veículos DO USUÁRIO LOGADO
  .post(protect, createVeiculo);  // POST -> Cria um novo veículo PARA O USUÁRIO LOGADO

// --- Rotas para um veículo específico (/api/veiculos/:id) ---
// TODAS as rotas abaixo agora exigem autenticação
router.route('/:id')
  .get(protect, getVeiculoById)  // GET -> Pega um veículo específico (se pertencer ao usuário)
  .put(protect, updateVeiculo)   // PUT -> Atualiza um veículo (se pertencer ao usuário)
  .delete(protect, deleteVeiculo); // DELETE -> Deleta um veículo (se pertencer ao usuário)

export default router;

// NOTA: As rotas de manutenção e de resetar garagem foram removidas temporariamente
// para simplificar a implementação da autenticação. Podemos readicioná-las depois.