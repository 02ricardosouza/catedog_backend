import { Request, Response } from 'express';
import tagRepository from '../repositories/tagRepository';

class TagController {
    async getTopTags(req: Request, res: Response) {
        try {
            const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : 10;
            const tags = await tagRepository.getTopTags(limit);
            res.status(200).json(tags);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new TagController();
