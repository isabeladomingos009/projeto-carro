// controllers/ferramentaController.js (arquivo completo)
import Ferramenta from '../models/ferramentaModel.js';

// @desc    Obter todas as ferramentas
// @route   GET /api/ferramentas
// @access  Public
export const getFerramentas = async (req, res, next) => {
    try {
        const ferramentas = await Ferramenta.find();
        res.status(200).json({ success: true, count: ferramentas.length, data: ferramentas });
    } catch (error) {
        next(error);
    }
};

// @desc    Criar nova ferramenta
// @route   POST /api/ferramentas
// @access  Public
export const createFerramenta = async (req, res, next) => {
    try {
        const ferramenta = await Ferramenta.create(req.body);
        res.status(201).json({ success: true, data: ferramenta });
    } catch (error) {
        next(error);
    }
};

// @desc    Obter uma única ferramenta por ID
// @route   GET /api/ferramentas/:id
// @access  Public
export const getFerramentaById = async (req, res, next) => {
    try {
        const ferramenta = await Ferramenta.findById(req.params.id);
        if (!ferramenta) {
            return res.status(404).json({ success: false, error: 'Ferramenta não encontrada' });
        }
        res.status(200).json({ success: true, data: ferramenta });
    } catch (error) {
        next(error);
    }
};

// @desc    Atualizar ferramenta
// @route   PUT /api/ferramentas/:id
// @access  Public
export const updateFerramenta = async (req, res, next) => {
    try {
        const ferramenta = await Ferramenta.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!ferramenta) {
            return res.status(404).json({ success: false, error: 'Ferramenta não encontrada' });
        }
        res.status(200).json({ success: true, data: ferramenta });
    } catch (error) {
        next(error);
    }
};

// @desc    Deletar ferramenta
// @route   DELETE /api/ferramentas/:id
// @access  Public
export const deleteFerramenta = async (req, res, next) => {
    try {
        const ferramenta = await Ferramenta.findByIdAndDelete(req.params.id);
        if (!ferramenta) {
            return res.status(404).json({ success: false, error: 'Ferramenta não encontrada' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};