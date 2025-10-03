import jwt from 'jsonwebtoken';
// A importação do userModel foi REMOVIDA
import mongoose from 'mongoose'; // <-- IMPORTANTE: Adicionado Mongoose aqui

// ==========================================================
// ALTERAÇÃO AQUI: Copiando o Schema e Modelo para cá também
// ==========================================================
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Truque para evitar erro de "modelo já compilado"
const User = mongoose.models.User || mongoose.model('User', userSchema);
// ==========================================================


export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'Usuário não encontrado.' });
            }
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ success: false, error: 'Não autorizado, token falhou.' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, error: 'Não autorizado, nenhum token encontrado.' });
    }
}