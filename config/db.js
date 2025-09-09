// config/db.js (arquivo completo)
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI_CRUD) {
            console.error("\n!!! ERRO FATAL: Variável de ambiente MONGO_URI_CRUD NÃO DEFINIDA! !!!");
            console.error("!!! A aplicação não pode conectar ao Banco de Dados. Configure-a no seu arquivo .env (local) e nas variáveis de ambiente do Render.com. !!!\n");
            // Pode optar por sair do processo aqui se a conexão ao DB for crítica
            // process.exit(1);
            return;
        }

        const conn = await mongoose.connect(process.env.MONGO_URI_CRUD);
        console.log(`🚀 MongoDB Conectado: ${conn.connection.host}`);

        // Opcional: Ouvir eventos de conexão para mais logs
        mongoose.connection.on('disconnected', () => console.warn("⚠️ Mongoose desconectado do MongoDB!"));
        mongoose.connection.on('error', (err) => console.error("❌ Mongoose erro de conexão:", err));

    } catch (error) {
        console.error(`❌ ERRO FATAL: Falha ao conectar ao MongoDB: ${error.message}`);
        console.error("Verifique sua MONGO_URI_CRUD (.env local e/ou Render), acesso de rede no Atlas, e credenciais do usuário.");
        // Em um ambiente de produção, é comum encerrar o processo aqui
        process.exit(1); // Encerra o processo se a conexão inicial falhar
    }
};

export default connectDB;