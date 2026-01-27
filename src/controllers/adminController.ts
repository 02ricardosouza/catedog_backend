import { Request, Response } from 'express';
import { adminService } from '../services/adminService';

const adminController = {
    // ===== STATISTICS =====

    async getStats(req: Request, res: Response) {
        try {
            const stats = await adminService.getStats();
            res.json(stats);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // ===== USER MANAGEMENT =====

    async listUsers(req: Request, res: Response) {
        try {
            const users = await adminService.getAllUsers();
            res.json(users);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateUserRole(req: Request, res: Response) {
        try {
            const userId = Number.parseInt(req.params.id);
            const { role } = req.body;
            const adminId = (req as any).user.userId;

            if (!role) {
                return res.status(400).json({ error: 'Role is required' });
            }

            const user = await adminService.updateUserRole(adminId, userId, role);
            res.json(user);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async toggleUserStatus(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.id);
            const { is_active } = req.body;
            const adminId = (req as any).user.userId;

            if (is_active === undefined) {
                return res.status(400).json({ error: 'is_active is required' });
            }

            const user = await adminService.toggleUserStatus(adminId, userId, is_active);
            res.json(user);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // ===== POST MODERATION =====

    async listAllPosts(req: Request, res: Response) {
        try {
            const posts = await adminService.getAllPosts();
            res.json(posts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async deleteAnyPost(req: Request, res: Response) {
        try {
            const postId = Number.parseInt(req.params.id);
            const adminId = (req as any).user.userId;

            const post = await adminService.deletePost(adminId, postId);
            res.json({ message: 'Post deleted successfully', post });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // ===== COMMENT MODERATION =====

    async listAllComments(req: Request, res: Response) {
        try {
            const comments = await adminService.getAllComments();
            res.json(comments);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async deleteAnyComment(req: Request, res: Response) {
        try {
            const commentId = Number.parseInt(req.params.id);
            const adminId = (req as any).user.userId;

            const comment = await adminService.deleteComment(adminId, commentId);
            res.json({ message: 'Comment deleted successfully', comment });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    // ===== ADMIN LOGS =====

    async getAdminLogs(req: Request, res: Response) {
        try {
            const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : 100;
            const logs = await adminService.getLogs(limit);
            res.json(logs);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
};

export default adminController;
