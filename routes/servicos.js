// routes/servicos.js (arquivo completo)
import express from 'express';
import {
  getServicos,
  createServico, 
  getServicoById, 
  updateServico, 
  deleteServico 
} from '../controllers/servicoController.js';

const router = express.Router();

// Rotas para Serviços
router.route('/')
  .get(getServicos);
  // .post(createServico); // Descomente para habilitar criação de serviço

// Rotas para serviço específico por ID (comentadas por padrão, descomente se precisar)
// router.route('/:id')
//   .get(getServicoById) 
//   .put(updateServico) 
//   .delete(deleteServico); 

export default router;