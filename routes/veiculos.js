// routes/veiculos.js (arquivo completo e CORRIGIDO)
import express from 'express';
import {
  getVeiculos,
  createVeiculo,
  getVeiculoById,
  updateVeiculo,
  deleteVeiculo,
  createManutencaoForVeiculo, // Importa a nova função para criar manutenção
  getManutencoesForVeiculo // Importa a nova função para listar manutenções
} from '../controllers/veiculoController.js'; // Importa funções do controlador de veículos

const router = express.Router();

// Rotas CRUD padrão para Veículos (no caminho /api/veiculos)
router.route('/')
  .get(getVeiculos) // GET /api/veiculos (Lista todos os veículos)
  .post(createVeiculo); // POST /api/veiculos (Cria um novo veículo)

// Rotas CRUD para um Veículo específico (no caminho /api/veiculos/:id)
router.route('/:id')
  .get(getVeiculoById) // GET /api/veiculos/:id (Obtém um veículo por ID)
  .put(updateVeiculo) // PUT /api/veiculos/:id (Atualiza um veículo por ID)
  .delete(deleteVeiculo); // DELETE /api/veiculos/:id (Deleta um veículo por ID)

// --- NOVAS ROTAS PARA MANUTENÇÕES (Sub-recurso de Veículo) ---
// No caminho /api/veiculos/:veiculoId/manutencoes
router.route('/:veiculoId/manutencoes')
    .post(createManutencaoForVeiculo) // POST /api/veiculos/:veiculoId/manutencoes (Cria manutenção para o veículo)
    .get(getManutencoesForVeiculo); // GET /api/veiculos/:veiculoId/manutencoes (Lista manutenções do veículo)
// --- FIM DAS NOVAS ROTAS ---

// É ESSENCIAL que este módulo exporte o 'router' como default
export default router;