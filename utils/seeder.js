// utils/seeder.js (arquivo completo e ATUALIZADO)

// Carrega as variáveis de ambiente do .env
import 'dotenv/config'; 
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Definindo __filename e __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega os modelos Mongoose
import Veiculo from '../models/veiculoModel.js';
import Manutencao from '../models/manutencaoModel.js'; // Importa o modelo Manutencao
import Servico from '../models/servicoModel.js';      // Importa o modelo Servico
import Ferramenta from '../models/ferramentaModel.js'; // Importa o modelo Ferramenta

// Conecta ao Banco de Dados (reusa a lógica de conexão para o seeder)
mongoose.connect(process.env.MONGO_URI_CRUD)
  .then(() => console.log('✅ Conectado ao MongoDB para seeding!'))
  .catch(err => {
    console.error(`❌ ERRO: Falha ao conectar ao MongoDB para seeding: ${err.message}`);
    process.exit(1);
  });

// Lê os arquivos JSON da pasta 'data' (caminhos ajustados para ES Modules)
const veiculos = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../data/veiculos.json'), 'utf-8')
);
const servicos = JSON.parse( // Carrega dados de serviços
  fs.readFileSync(path.resolve(__dirname, '../data/servicos.json'), 'utf-8')
);
const ferramentas = JSON.parse( // Carrega dados de ferramentas
  fs.readFileSync(path.resolve(__dirname, '../data/ferramentas.json'), 'utf-8')
);
// Você pode criar um data/manutencoes.json se quiser semear manutenções específicas,
// mas para a atividade, é mais comum criá-las via POST.

// Função para importar os dados para o BD
const importData = async () => {
  try {
    // Limpa todas as coleções antes de importar
    await Veiculo.deleteMany();
    await Manutencao.deleteMany(); // Limpa manutenções
    await Servico.deleteMany();    // Limpa serviços
    await Ferramenta.deleteMany(); // Limpa ferramentas
    console.log('Dados existentes deletados.');

    // Importa novos dados
    const createdVeiculos = await Veiculo.create(veiculos);
    await Servico.create(servicos);
    await Ferramenta.create(ferramentas);
    console.log('✅ Dados (Veículos, Serviços, Ferramentas) Importados com Sucesso!');

    // Opcional: Criar algumas manutenções para veículos existentes se você tiver um JSON de manutenções com veiculoId
    // Ou você pode adicionar lógica aqui para criar manutenções exemplo para os 'createdVeiculos'
    // Exemplo:
    // if (createdVeiculos.length > 0) {
    //     const manutencaoExemplo = {
    //         descricaoServico: "Troca de óleo inicial",
    //         custo: 200,
    //         quilometragem: 1000,
    //         veiculo: createdVeiculos[0]._id // Associa ao primeiro veículo
    //     };
    //     await Manutencao.create(manutencaoExemplo);
    //     console.log('Manutenção exemplo criada para o primeiro veículo.');
    // }

  } catch (err) {
    console.error('❌ Erro ao importar dados:', err);
  } finally {
    process.exit();
  }
};

// Função para deletar todos os dados do BD
const deleteData = async () => {
  try {
    await Veiculo.deleteMany();
    await Manutencao.deleteMany(); // Deleta manutenções
    await Servico.deleteMany();    // Deleta serviços
    await Ferramenta.deleteMany(); // Deleta ferramentas
    console.log('🔥 Todos os Dados (Veículos, Manutenções, Serviços, Ferramentas) Deletados com Sucesso!');
  } catch (err) {
    console.error('❌ Erro ao deletar dados:', err);
  } finally {
    process.exit();
  }
};

// Executa as funções com base nos argumentos da linha de comando
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}