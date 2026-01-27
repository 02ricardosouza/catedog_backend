import { Request, Response } from 'express';
import userService from '../services/userService';

interface AuthRequest extends Request {
    user?: { id: number; role: string };
}

class UserController {
    async getProfile(req: Request, res: Response) {
        try {
            const userId = Number.parseInt(req.params.id);
            
            if (Number.isNaN(userId)) {
                return res.status(400).json({ error: 'ID de usuário inválido' });
            }

            const profile = await userService.getProfile(userId);
            
            if (!profile) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            // Check if current user is following this profile
            const authReq = req as AuthRequest;
            let isFollowing = false;
            if (authReq.user && authReq.user.id !== userId) {
                isFollowing = await userService.isFollowing(authReq.user.id, userId);
            }

            return res.json({ ...profile, isFollowing });
        } catch (error) {
            console.error('Error fetching profile:', error);
            return res.status(500).json({ error: 'Erro ao buscar perfil' });
        }
    }

    async getUserPosts(req: Request, res: Response) {
        try {
            const userId = Number.parseInt(req.params.id);
            
            if (Number.isNaN(userId)) {
                return res.status(400).json({ error: 'ID de usuário inválido' });
            }

            const posts = await userService.getUserPosts(userId);
            return res.json(posts);
        } catch (error) {
            console.error('Error fetching user posts:', error);
            return res.status(500).json({ error: 'Erro ao buscar posts do usuário' });
        }
    }

    async getFollowers(req: Request, res: Response) {
        try {
            const userId = Number.parseInt(req.params.id);
            
            if (Number.isNaN(userId)) {
                return res.status(400).json({ error: 'ID de usuário inválido' });
            }

            const followers = await userService.getFollowers(userId);
            return res.json(followers);
        } catch (error) {
            console.error('Error fetching followers:', error);
            return res.status(500).json({ error: 'Erro ao buscar seguidores' });
        }
    }

    async getFollowing(req: Request, res: Response) {
        try {
            const userId = Number.parseInt(req.params.id);
            
            if (Number.isNaN(userId)) {
                return res.status(400).json({ error: 'ID de usuário inválido' });
            }

            const following = await userService.getFollowing(userId);
            return res.json(following);
        } catch (error) {
            console.error('Error fetching following:', error);
            return res.status(500).json({ error: 'Erro ao buscar usuários seguidos' });
        }
    }
}

export default new UserController();
