import userRepository from '../repositories/userRepository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class AuthService {
    async register(name: string, email: string, password: string) {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userRepository.create({ name, email, password: hashedPassword });
        return newUser;
    }

    async login(email: string, password: string) {
        const user = await userRepository.findByEmail(email);
        if (!user || !user.password) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        // Include role in JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                id: user.id,
                email: user.email,
                role: (user as any).role || 'user'
            },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: (user as any).role || 'user',
                isEditor: (user as any).role === 'editor' || (user as any).role === 'admin',
                isAdmin: (user as any).role === 'admin'
            },
            token
        };
    }
}

export default new AuthService();
