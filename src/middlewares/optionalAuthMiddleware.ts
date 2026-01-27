import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from './authMiddleware';

const optionalAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        next();
        return;
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = verified;
        console.log('OptionalAuth: User identified', req.user);
        next();
    } catch (error) {
        console.log('OptionalAuth: Invalid token');
        // If token is invalid, just proceed without user info
        next();
    }
};

export default optionalAuthMiddleware;
