import Veiculo from '../models/veiculoModel.js';

// @desc    Obter todos os veículos DO USUÁRIO LOGADO
// @route   GET /api/veiculos
// @access  Private (Protegido)
export const getVeiculos = async (req, res, next) => {
    try {
        // Busca apenas os veículos cujo 'owner' é o ID do usuário logado
        const veiculos = await Veiculo.find({ owner: req.user._id });
        res.status(200).json({ success: true, count: veiculos.length, data: veiculos });
    } catch (error) {
        next(error);
    }
};

// @desc    Criar novo veículo PARA O USUÁRIO LOGADO
// @route   POST /api/veiculos
// @access  Private (Protegido)
export const createVeiculo = async (req, res, next) => {
    try {
        // Adiciona o ID do usuário logado ao corpo da requisição antes de criar
        req.body.owner = req.user._id;

        const veiculo = await Veiculo.create(req.body);
        res.status(201).json({ success: true, data: veiculo });
    } catch (error) {
        next(error);
    }
};

// @desc    Obter um único veículo (e verificar se pertence ao usuário)
// @route   GET /api/veiculos/:id
// @access  Private (Protegido)
export const getVeiculoById = async (req, res, next) => {
    try {
        const veiculo = await Veiculo.findById(req.params.id);

        if (!veiculo) {
            return res.status(404).json({ success: false, error: 'Veículo não encontrado' });
        }
        
        // Verifica se o dono do veículo é o mesmo usuário que está logado
        if (veiculo.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, error: 'Não autorizado a acessar este veículo' });
        }

        res.status(200).json({ success: true, data: veiculo });
    } catch (error) {
        next(error);
    }
};

// @desc    Atualizar veículo (e verificar se pertence ao usuário)
// @route   PUT /api/veiculos/:id
// @access  Private (Protegido)
export const updateVeiculo = async (req, res, next) => {
    try {
        let veiculo = await Veiculo.findById(req.params.id);
        if (!veiculo) {
            return res.status(404).json({ success: false, error: 'Veículo não encontrado' });
        }

        if (veiculo.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, error: 'Não autorizado a atualizar este veículo' });
        }

        veiculo = await Veiculo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: veiculo });
    } catch (error) {
        next(error);
    }
};

// @desc    Deletar veículo (e verificar se pertence ao usuário)
// @route   DELETE /api/veiculos/:id
// @access  Private (Protegido)
export const deleteVeiculo = async (req, res, next) => {
    try {
        const veiculo = await Veiculo.findById(req.params.id);
        if (!veiculo) {
            return res.status(404).json({ success: false, error: 'Veículo não encontrado' });
        }

        if (veiculo.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, error: 'Não autorizado a deletar este veículo' });
        }

        await veiculo.deleteOne(); // Usa .deleteOne() no documento encontrado
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};