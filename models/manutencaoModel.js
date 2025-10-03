// models/manutencaoModel.js (arquivo completo)
import mongoose from 'mongoose';

const manutencaoSchema = new mongoose.Schema({
  descricaoServico: { 
    type: String, 
    required: [true, 'A descrição do serviço é obrigatória.'] 
  },
  data: { 
    type: Date, 
    default: Date.now, 
    required: true 
  },
  custo: { 
    type: Number, 
    required: [true, 'O custo da manutenção é obrigatório.'], 
    min: [0, 'O custo não pode ser negativo.'] 
  },
  quilometragem: { 
    type: Number, 
    required: [true, 'A quilometragem da manutenção é obrigatória.'], 
    min: [0, 'A quilometragem não pode ser negativa.'] 
  },
  veiculo: { // Campo de relacionamento com Veiculo
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Veiculo', 
    required: [true, 'A manutenção deve estar associada a um veículo.']
  }
}, { timestamps: true });

const Manutencao = mongoose.model('Manutencao', manutencaoSchema);
export default Manutencao;