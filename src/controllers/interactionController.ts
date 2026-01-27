import { Request, Response } from 'express';
import interactionService from '../services/interactionService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

class InteractionController {
    // Comments
    async addComment(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params; // Post ID
            const { content } = req.body;
            const userId = req.user.id;
            const comment = await interactionService.addComment(userId, parseInt(id), content);
            res.status(201).json(comment);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getComments(req: Request, res: Response) {
        try {
            const { id } = req.params; // Post ID
            const comments = await interactionService.getComments(parseInt(id));
            res.status(200).json(comments);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Likes
    async toggleLike(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params; // Post ID
            const userId = req.user.id;
            const result = await interactionService.toggleLike(userId, parseInt(id));
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getLikes(req: Request, res: Response) {
        try {
            const { id } = req.params; // Post ID
            const count = await interactionService.getLikesCount(parseInt(id));
            res.status(200).json({ count });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // Follows
    async toggleFollow(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params; // User ID to follow
            const followerId = req.user.id;
            const result = await interactionService.toggleFollow(followerId, parseInt(id));
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

export default new InteractionController();
