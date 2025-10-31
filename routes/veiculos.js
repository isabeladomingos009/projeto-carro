import express from 'express';
import { getVeiculos, createVeiculo, getVeiculoById, updateVeiculo, deleteVeiculo } from '../controllers/veiculoController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getVeiculos).post(protect, createVeiculo);
router.route('/:id').get(protect, getVeiculoById).put(protect, updateVeiculo).delete(protect, deleteVeiculo);

export default router;