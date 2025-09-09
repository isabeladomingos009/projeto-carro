// models/veiculoModel.js (arquivo completo)
import mongoose from 'mongoose';

const veiculoSchema = new mongoose.Schema({
  modelo: { type: String, required: [true, 'O modelo do veículo é obrigatório.'] },
  cor: { type: String, required: true },
  tipoVeiculo: { type: String, enum: ['Carro', 'Moto', 'Caminhão', 'Bicicleta'], required: true },
  imageUrl: { type: String, default: 'placeholder.png' }, // Adicionado imageUrl e default
  ligado: { type: Boolean, default: false },
  velocidade: { type: Number, default: 0 },
  maxVelocidade: { type: Number, required: true },
  historicoManutencao: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Manutencao' }]
}, { timestamps: true });

veiculoSchema.index({ modelo: 1, tipoVeiculo: 1 });

const Veiculo = mongoose.model('Veiculo', veiculoSchema);
export default Veiculo;