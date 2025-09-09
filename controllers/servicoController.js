// controllers/servicoController.js (arquivo completo)
import Servico from '../models/servicoModel.js'; // Importa o modelo Servico

// @desc    Obter todos os serviços
// @route   GET /api/servicos
// @access  Public
export const getServicos = async (req, res, next) => {
    try {
        const servicos = await Servico.find(); // Busca todos os serviços no MongoDB
        res.status(200).json({ success: true, count: servicos.length, data: servicos });
    } catch (error) {
        next(error); // Passa o erro para o middleware de tratamento de erros
    }
};

// @desc    Criar novo serviço
// @route   POST /api/servicos
// @access  Public
export const createServico = async (req, res, next) => {
    try {
        const servico = await Servico.create(req.body);
        res.status(201).json({ success: true, data: servico });
    } catch (error) {
        next(error);
    }
};

// @desc    Obter um único serviço por ID
// @route   GET /api/servicos/:id
// @access  Public
export const getServicoById = async (req, res, next) => {
    try {
        const servico = await Servico.findById(req.params.id);
        if (!servico) {
            return res.status(404).json({ success: false, error: 'Serviço não encontrado' });
        }
        res.status(200).json({ success: true, data: servico });
    } catch (error) {
        next(error);
    }
};

// @desc    Atualizar serviço
// @route   PUT /api/servicos/:id
// @access  Public
export const updateServico = async (req, res, next) => {
    try {
        const servico = await Servico.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!servico) {
            return res.status(404).json({ success: false, error: 'Serviço não encontrado' });
        }
        res.status(200).json({ success: true, data: servico });
    } catch (error) {
        next(error);
    }
};

// @desc    Deletar serviço
// @route   DELETE /api/servicos/:id
// @access  Public
export const deleteServico = async (req, res, next) => {
    try {
        const servico = await Servico.findByIdAndDelete(req.params.id);
        if (!servico) {
            return res.status(404).json({ success: false, error: 'Serviço não encontrado' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};