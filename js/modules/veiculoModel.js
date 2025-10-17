import mongoose from 'mongoose';

const veiculoSchema = new mongoose.Schema(
    {
        modelo: { type: String, required: true, trim: true },
        cor: { type: String, required: true, trim: true },
        tipoVeiculo: { type: String, required: true, enum: ['Carro', 'Moto', 'Outro'] },
        maxVelocidade: { type: Number, required: true },
        imageUrl: { type: String, default: 'imagemilustrativa.png' },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        sharedWith: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    {
        timestamps: true
    }
);

const Veiculo = mongoose.model('Veiculo', veiculoSchema);

export default Veiculo;