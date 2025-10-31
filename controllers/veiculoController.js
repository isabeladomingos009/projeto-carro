import Veiculo from '../models/veiculoModel.js';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({ email: { type: String, required: true, unique: true }, password: { type: String, required: true } });
const User = mongoose.models.User || mongoose.model('User', userSchema);

export const getVeiculos = async (req, res, next) => {
    try {
        const veiculos = await Veiculo.find({ owner: req.user._id }).populate('owner', 'email');
        res.status(200).json({ success: true, count: veiculos.length, data: veiculos });
    } catch (error) { next(error); }
};

export const createVeiculo = async (req, res, next) => {
    try {
        req.body.owner = req.user._id;
        const veiculo = await Veiculo.create(req.body);
        res.status(201).json({ success: true, data: veiculo });
    } catch (error) { next(error); }
};

export const getVeiculoById = async (req, res, next) => {
    try {
        const veiculo = await Veiculo.findById(req.params.id);
        if (!veiculo || veiculo.owner.toString() !== req.user._id.toString()) {
            return res.status(404).json({ success: false, error: 'Veículo não encontrado ou não autorizado.' });
        }
        res.status(200).json({ success: true, data: veiculo });
    } catch (error) { next(error); }
};

export const updateVeiculo = async (req, res, next) => {
    try {
        let veiculo = await Veiculo.findById(req.params.id);
        if (!veiculo || veiculo.owner.toString() !== req.user._id.toString()) {
            return res.status(404).json({ success: false, error: 'Veículo não encontrado ou não autorizado.' });
        }
        veiculo = await Veiculo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: veiculo });
    } catch (error) { next(error); }
};

export const deleteVeiculo = async (req, res, next) => {
    try {
        const veiculo = await Veiculo.findById(req.params.id);
        if (!veiculo || veiculo.owner.toString() !== req.user._id.toString()) {
            return res.status(404).json({ success: false, error: 'Veículo não encontrado ou não autorizado.' });
        }
        await veiculo.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) { next(error); }
};