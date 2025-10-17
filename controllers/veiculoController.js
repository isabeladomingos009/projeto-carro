import Veiculo from '../models/veiculoModel.js';
// A importação do userModel.js foi REMOVIDA
import mongoose from 'mongoose'; // Adicionado Mongoose aqui

// ==========================================================
// DEFINIÇÃO DO MODELO DE USUÁRIO (COPIADA PARA CÁ)
// ==========================================================
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
// Evita erro de sobrescrita se o modelo já foi compilado em outro lugar
const User = mongoose.models.User || mongoose.model('User', userSchema);


// ==========================================================
// FUNÇÕES DO CONTROLLER (AGORA FUNCIONAIS)
// ==========================================================

export const getVeiculos = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const veiculos = await Veiculo.find({
            $or: [ { owner: userId }, { sharedWith: userId } ]
        }).populate('owner', 'email');
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
        if (!veiculo) { return res.status(404).json({ success: false, error: 'Veículo não encontrado' }); }
        const isOwner = veiculo.owner.toString() === req.user._id.toString();
        const isSharedWithUser = veiculo.sharedWith.some(id => id.toString() === req.user._id.toString());
        if (!isOwner && !isSharedWithUser) { return res.status(401).json({ success: false, error: 'Não autorizado' }); }
        res.status(200).json({ success: true, data: veiculo });
    } catch (error) { next(error); }
};

export const updateVeiculo = async (req, res, next) => {
    try {
        let veiculo = await Veiculo.findById(req.params.id);
        if (!veiculo) { return res.status(404).json({ success: false, error: 'Veículo não encontrado' }); }
        if (veiculo.owner.toString() !== req.user._id.toString()) { return res.status(401).json({ success: false, error: 'Não autorizado a editar, você não é o dono.' }); }
        veiculo = await Veiculo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: veiculo });
    } catch (error) { next(error); }
};

export const deleteVeiculo = async (req, res, next) => {
    try {
        const veiculo = await Veiculo.findById(req.params.id);
        if (!veiculo) { return res.status(404).json({ success: false, error: 'Veículo não encontrado' }); }
        if (veiculo.owner.toString() !== req.user._id.toString()) { return res.status(401).json({ success: false, error: 'Não autorizado a deletar, você não é o dono.' }); }
        await veiculo.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) { next(error); }
};

export const shareVeiculo = async (req, res, next) => {
    try {
        const { email } = req.body;
        const veiculoId = req.params.id;
        const ownerId = req.user._id;
        const veiculo = await Veiculo.findById(veiculoId);
        if (!veiculo) { return res.status(404).json({ success: false, error: 'Veículo não encontrado.' }); }
        if (veiculo.owner.toString() !== ownerId.toString()) { return res.status(403).json({ success: false, error: 'Ação proibida. Você não é o dono.' }); }
        const userToShareWith = await User.findOne({ email });
        if (!userToShareWith) { return res.status(404).json({ success: false, error: 'Usuário para compartilhamento não encontrado.' }); }
        if (userToShareWith._id.toString() === ownerId.toString()) { return res.status(400).json({ success: false, error: 'Você não pode compartilhar consigo mesmo.' }); }
        if (veiculo.sharedWith.includes(userToShareWith._id)) { return res.status(400).json({ success: false, error: 'Veículo já compartilhado com este usuário.' }); }
        veiculo.sharedWith.push(userToShareWith._id);
        await veiculo.save();
        res.status(200).json({ success: true, message: `Veículo compartilhado com ${email}.` });
    } catch (error) {
        next(error);
    }
};