import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'O e-mail é obrigatório.'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Por favor, insira um e-mail válido.'
        ]
    },
    password: {
        type: String,
        required: [true, 'A senha é obrigatória.'],
        minlength: [6, 'A senha deve ter no mínimo 6 caracteres.']
    }
}, {
    timestamps: true
});

// ==========================================================
// ALTERAÇÃO AQUI: Impede o erro de sobrescrita do modelo
// ==========================================================
const User = mongoose.models.User || mongoose.model('User', userSchema);


// (O resto do arquivo permanece exatamente o mesmo)
export const registerUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, error: 'Usuário com este e-mail já existe.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({
            email,
            password: hashedPassword,
        });
        if (user) {
            res.status(201).json({
                success: true,
                message: 'Usuário registrado com sucesso!',
                data: { _id: user._id, email: user.email },
            });
        } else {
            res.status(400).json({ success: false, error: 'Dados de usuário inválidos.' });
        }
    } catch (error) {
        next(error);
    }
};

export const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Credenciais inválidas.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Credenciais inválidas.' });
        }
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.status(200).json({
            success: true,
            message: 'Login realizado com sucesso!',
            token: token,
        });
    } catch (error) {
        next(error);
    }
};