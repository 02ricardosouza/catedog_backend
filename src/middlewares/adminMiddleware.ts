import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    userId: number;
    email: string;
    role?: string;
}

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey') as JwtPayload;

        // Check if user is admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied. Admin privileges required.'
            });
        }

        // Attach user info to request
        (req as any).user = decoded;
        next();
    } catch (error) {
        console.error('AdminMiddleware error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export default adminMiddleware;
