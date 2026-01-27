import { Request, Response } from 'express';
import authService from '../services/authService';

class AuthController {
    async register(req: Request, res: Response) {
        try {
            const { name, email, password } = req.body;
            const user = await authService.register(name, email, password);
            res.status(201).json(user);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const data = await authService.login(email, password);
            res.status(200).json(data);
        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    }
}

export default new AuthController();
