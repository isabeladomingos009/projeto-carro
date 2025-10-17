import express from 'express';
import {
  getVeiculos,
  createVeiculo,
  getVeiculoById,
  updateVeiculo,
  deleteVeiculo,
  shareVeiculo
} from '../controllers/veiculoController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getVeiculos)
  .post(protect, createVeiculo);

router.route('/:id')
  .get(protect, getVeiculoById)
  .put(protect, updateVeiculo)
  .delete(protect, deleteVeiculo);
  
router.route('/:id/share').post(protect, shareVeiculo);

export default router;