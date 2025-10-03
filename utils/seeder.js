// utils/seeder.js (arquivo completo e ATUALIZADO)

import 'dotenv/config'; 
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega os modelos Mongoose
import Veiculo from '../models/veiculoModel.js';
import Manutencao from '../models/manutencaoModel.js'; 
import Servico from '../models/servicoModel.js';      
import Ferramenta from '../models/ferramentaModel.js'; 

// Conecta ao Banco de Dados (reusa a lógica de conexão para o seeder)
mongoose.connect(process.env.MONGO_URI_CRUD)
  .then(() => console.log('✅ Conectado ao MongoDB para seeding!'))
  .catch(err => {
    console.error(`❌ ERRO: Falha ao conectar ao MongoDB para seeding: ${err.message}`);
    process.exit(1);
  });

// Lê os arquivos JSON da pasta 'data'
const veiculos = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../data/veiculos.json'), 'utf-8')
);
const servicos = JSON.parse( 
  fs.readFileSync(path.resolve(__dirname, '../data/servicos.json'), 'utf-8')
);
const ferramentas = JSON.parse( 
  fs.readFileSync(path.resolve(__dirname, '../data/ferramentas.json'), 'utf-8')
);

// Função para importar os dados para o BD
const importData = async () => {
  try {
    // Limpa todas as coleções antes de importar
    await Veiculo.deleteMany();
    await Manutencao.deleteMany(); 
    await Servico.deleteMany();    
    await Ferramenta.deleteMany(); 
    console.log('Dados existentes deletados.');

    // Importa novos dados
    await Veiculo.create(veiculos);
    await Servico.create(servicos);
    await Ferramenta.create(ferramentas);
    console.log('✅ Dados (Veículos, Serviços, Ferramentas) Importados com Sucesso!');

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
    await Manutencao.deleteMany(); 
    await Servico.deleteMany();    
    await Ferramenta.deleteMany(); 
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