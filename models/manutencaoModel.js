// models/manutencaoModel.js (arquivo completo)
import mongoose from 'mongoose';

const manutencaoSchema = new mongoose.Schema({
  data: { type: Date, default: Date.now, required: true },
  tipo: { type: String, required: [true, 'O tipo da manutenção é obrigatório.'] },
  custo: { type: Number, required: true, default: 0 },
  descricao: { type: String, default: '' },
  status: { type: String, enum: ['Agendada', 'Em andamento', 'Concluída', 'Cancelada'], default: 'Agendada' }
}, { timestamps: true });

const Manutencao = mongoose.model('Manutencao', manutencaoSchema);
export default Manutencao;