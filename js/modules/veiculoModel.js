import mongoose from 'mongoose';

const veiculoSchema = new mongoose.Schema(
    {
        modelo: {
            type: String,
            required: [true, 'O modelo do veículo é obrigatório.'],
            trim: true
        },
        cor: {
            type: String,
            required: [true, 'A cor do veículo é obrigatória.'],
            trim: true
        },
        tipoVeiculo: {
            type: String,
            required: [true, 'O tipo do veículo é obrigatório (Carro, Moto, etc.).'],
            enum: ['Carro', 'Moto', 'Outro']
        },
        maxVelocidade: {
            type: Number,
            required: [true, 'A velocidade máxima é obrigatória.']
        },
        imageUrl: {
            type: String,
            default: 'imagemilustrativa.png'
        },
        historicoManutencao: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Manutencao'
            }
        ],
       owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // <-- NOME DO MODELO
    required: true
}
    },
    {
        timestamps: true
    }
);

const Veiculo = mongoose.model('Veiculo', veiculoSchema);

export default Veiculo;