// models/ferramentaModel.js (arquivo completo)
import mongoose from 'mongoose';

const ferramentaSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true },
  utilidade: { type: String, required: true },
  imageUrl: { type: String, default: 'placeholder_ferramenta.png' } // Imagem para ferramentas
}, { timestamps: true });

const Ferramenta = mongoose.model('Ferramenta', ferramentaSchema);
export default Ferramenta;