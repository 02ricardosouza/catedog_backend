import { Request, Response } from 'express';
import postService from '../services/postService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

class PostController {
    async create(req: AuthenticatedRequest, res: Response) {
        try {
            const { title, content, image_url, category, tags } = req.body;
            const user_id = req.user.id;
            const post = await postService.create({ user_id, title, content, image_url, category, tags });
            res.status(201).json(post);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const { category, tag, limit, offset } = req.query;
            // Extract userId from token if present
            const userId = (req as any).user?.id;
            const parsedLimit = limit ? Number.parseInt(limit as string) : undefined;
            const parsedOffset = offset ? Number.parseInt(offset as string) : undefined;
            const posts = await postService.findAll(category as string, userId, tag as string, parsedLimit, parsedOffset);
            res.status(200).json(posts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const postId = Number.parseInt(id);
            console.log('PostController.findById: id:', id, 'parsedId:', postId);
            // Extract userId from token if present
            const userId = (req as any).user?.id;
            const post = await postService.findById(postId, userId);
            res.status(200).json(post);
        } catch (error: any) {
            console.error('PostController.findById error:', error);
            if (error.message === 'Post not found') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error', details: error.message });
            }
        }
    }

    async update(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const user_id = req.user.id;
            const post = await postService.update(Number.parseInt(id), user_id, req.body);
            res.status(200).json(post);
        } catch (error: any) {
            if (error.message === 'Unauthorized') {
                res.status(403).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    async delete(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const user_id = req.user.id;
            await postService.delete(Number.parseInt(id), user_id);
            res.status(204).send();
        } catch (error: any) {
            if (error.message === 'Unauthorized') {
                res.status(403).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    }

    async getMyPosts(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user.id;
            const posts = await postService.findByUserId(userId);
            res.status(200).json(posts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getMostLikedPosts(req: Request, res: Response) {
        try {
            const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : 5;
            const posts = await postService.findMostLiked(limit);
            res.status(200).json(posts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getFeaturedPost(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const post = await postService.getFeaturedPost(userId);
            res.status(200).json(post || null);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getRecentPosts(req: Request, res: Response) {
        try {
            const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : 3;
            const userId = (req as any).user?.id;
            const posts = await postService.getRecentPosts(limit, userId);
            res.status(200).json(posts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async setFeatured(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const { is_featured } = req.body;
            const post = await postService.setFeatured(Number.parseInt(id), is_featured);
            res.status(200).json(post);
        } catch (error: any) {
            if (error.message === 'Post not found') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    // Moderation endpoints
    async getPendingPosts(req: Request, res: Response) {
        try {
            const posts = await postService.getPendingPosts();
            res.status(200).json(posts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getPostsByStatus(req: Request, res: Response) {
        try {
            const { status } = req.query;
            if (!status || !['pending', 'approved', 'rejected'].includes(status as string)) {
                return res.status(400).json({ error: 'Invalid status. Must be pending, approved, or rejected.' });
            }
            const posts = await postService.getPostsByStatus(status as string);
            res.status(200).json(posts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async approvePost(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const reviewerId = req.user.id;
            const post = await postService.approvePost(Number.parseInt(id), reviewerId);
            res.status(200).json(post);
        } catch (error: any) {
            if (error.message === 'Post not found') {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    async rejectPost(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const reviewerId = req.user.id;
            const post = await postService.rejectPost(Number.parseInt(id), reviewerId, reason);
            res.status(200).json(post);
        } catch (error: any) {
            if (error.message === 'Post not found') {
                res.status(404).json({ error: error.message });
            } else if (error.message === 'Rejection reason is required') {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    }

    async search(req: Request, res: Response) {
        try {
            const { q } = req.query;
            const userId = (req as any).user?.id;

            if (!q || typeof q !== 'string') {
                return res.status(400).json({ error: 'Search query is required' });
            }

            const posts = await postService.search(q, userId);
            res.status(200).json(posts);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new PostController();
