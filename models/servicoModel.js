// models/servicoModel.js (arquivo completo)
import mongoose from 'mongoose';

const servicoSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true },
  descricao: { type: String, required: true },
  precoEstimado: { type: Number, required: true }
}, { timestamps: true });

const Servico = mongoose.model('Servico', servicoSchema);
export default Servico;