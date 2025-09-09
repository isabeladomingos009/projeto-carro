// controllers/veiculoController.js (arquivo completo)
import Veiculo from '../models/veiculoModel.js';
import Manutencao from '../models/manutencaoModel.js'; // Importa o modelo Manutencao

// @desc    Obter todos os veículos
// @route   GET /api/veiculos
// @access  Public
export const getVeiculos = async (req, res, next) => {
    try {
        const veiculos = await Veiculo.find().populate('historicoManutencao'); // Popula as manutenções associadas
        res.status(200).json({ success: true, count: veiculos.length, data: veiculos });
    } catch (error) {
        next(error); // Passa para o middleware de erro
    }
};

// @desc    Obter um único veículo
// @route   GET /api/veiculos/:id
// @access  Public
export const getVeiculoById = async (req, res, next) => {
    try {
        const veiculo = await Veiculo.findById(req.params.id).populate('historicoManutencao');
        if (!veiculo) {
            return res.status(404).json({ success: false, error: 'Veículo não encontrado' });
        }
        res.status(200).json({ success: true, data: veiculo });
    } catch (error) {
        next(error);
    }
};

// @desc    Criar novo veículo
// @route   POST /api/veiculos
// @access  Public
export const createVeiculo = async (req, res, next) => {
    try {
        const veiculo = await Veiculo.create(req.body);
        res.status(201).json({ success: true, data: veiculo });
    } catch (error) {
        // Erro de validação do Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        next(error);
    }
};

// @desc    Atualizar veículo
// @route   PUT /api/veiculos/:id
// @access  Public
export const updateVeiculo = async (req, res, next) => {
    try {
        const veiculo = await Veiculo.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Retorna o documento modificado
            runValidators: true // Executa validadores do schema
        });
        if (!veiculo) {
            return res.status(404).json({ success: false, error: 'Veículo não encontrado' });
        }
        res.status(200).json({ success: true, data: veiculo });
    } catch (error) {
        // Erro de validação do Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        next(error);
    }
};

// @desc    Deletar veículo
// @route   DELETE /api/veiculos/:id
// @access  Public
export const deleteVeiculo = async (req, res, next) => {
    try {
        const veiculo = await Veiculo.findByIdAndDelete(req.params.id);
        if (!veiculo) {
            return res.status(404).json({ success: false, error: 'Veículo não encontrado' });
        }
        // Opcional: Deletar manutenções associadas (se não for fazer isso em cascata no Schema)
        await Manutencao.deleteMany({ veiculo: req.params.id }); 
        res.status(200).json({ success: true, data: {} }); // Retorna objeto vazio em caso de sucesso
    } catch (error) {
        next(error);
    }
};

// --- NOVA FUNÇÃO: Criar Manutenção para um Veículo Específico ---
// @desc    Adicionar manutenção a um veículo específico
// @route   POST /api/veiculos/:veiculoId/manutencoes
// @access  Public
export const createManutencaoForVeiculo = async (req, res, next) => {
    try {
        const { veiculoId } = req.params; // Extrai veiculoId dos parâmetros da rota

        // 1. Validar se o veículo existe
        const veiculo = await Veiculo.findById(veiculoId);
        if (!veiculo) {
            return res.status(404).json({ success: false, error: 'Veículo não encontrado para adicionar manutenção.' });
        }

        // 2. Criar a manutenção, associando-a ao veiculoId
        const manutencaoData = { ...req.body, veiculo: veiculoId }; // Combina dados do corpo com o veiculoId
        const novaManutencao = await Manutencao.create(manutencaoData);

        // 3. Adicionar o ID da nova manutenção ao histórico do veículo e salvar o veículo
        veiculo.historicoManutencao.push(novaManutencao._id);
        await veiculo.save();

        res.status(201).json({ success: true, data: novaManutencao }); // Retorna a nova manutenção criada

    } catch (error) {
        // Lida com erros de validação do Mongoose ou outros erros
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages.join(', ') });
        }
        next(error); // Passa outros erros para o middleware de tratamento de erros
    }
};

// --- NOVA FUNÇÃO: Listar Manutenções de um Veículo Específico ---
// @desc    Listar todas as manutenções de um veículo específico
// @route   GET /api/veiculos/:veiculoId/manutencoes
// @access  Public
export const getManutencoesForVeiculo = async (req, res, next) => {
    try {
        const { veiculoId } = req.params; // Extrai veiculoId dos parâmetros da rota

        // Opcional (mas boa prática): Validar se o veículo existe
        const veiculo = await Veiculo.findById(veiculoId);
        if (!veiculo) {
            return res.status(404).json({ success: false, error: 'Veículo não encontrado para listar manutenções.' });
        }

        // Busca todas as manutenções cujo campo 'veiculo' corresponde ao 'veiculoId'
        const manutencoes = await Manutencao.find({ veiculo: veiculoId }).sort({ data: -1 }); // Ordena da mais recente para a mais antiga

        res.status(200).json({ success: true, count: manutencoes.length, data: manutencoes });

    } catch (error) {
        next(error); // Passa erros para o middleware de tratamento de erros
    }
};