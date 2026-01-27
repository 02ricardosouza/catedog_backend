import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    user?: any;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Access denied' });
        return;
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

export default authMiddleware;
