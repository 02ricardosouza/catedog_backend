import { query } from '../config/db';

export interface User {
    id?: number;
    name: string;
    email: string;
    password?: string;
    role?: string;
    is_active?: boolean;
    created_at?: Date;
}

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: Date;
    posts_count: number;
    followers_count: number;
    following_count: number;
}

export interface FollowUser {
    id: number;
    name: string;
    followed_at: Date;
}

class UserRepository {
    async create(user: User): Promise<User> {
        const { name, email, password } = user;
        const sql = `
            INSERT INTO users (name, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, name, email, created_at
        `;
        const values = [name, email, password];
        const result = await query(sql, values);
        return result.rows[0];
    }

    async findByEmail(email: string): Promise<User | undefined> {
        const sql = 'SELECT * FROM users WHERE email = $1';
        const result = await query(sql, [email]);
        return result.rows[0];
    }

    async findById(id: number): Promise<User | undefined> {
        const sql = 'SELECT id, name, email, created_at FROM users WHERE id = $1';
        const result = await query(sql, [id]);
        return result.rows[0];
    }

    async getProfile(id: number): Promise<UserProfile | undefined> {
        const sql = `
            SELECT 
                u.id, u.name, u.email, u.role, u.created_at,
                (SELECT COUNT(*) FROM posts WHERE user_id = u.id AND status = 'approved') as posts_count,
                (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as followers_count,
                (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count
            FROM users u
            WHERE u.id = $1 AND u.is_active = true
        `;
        const result = await query(sql, [id]);
        if (result.rows[0]) {
            return {
                ...result.rows[0],
                posts_count: Number.parseInt(result.rows[0].posts_count),
                followers_count: Number.parseInt(result.rows[0].followers_count),
                following_count: Number.parseInt(result.rows[0].following_count)
            };
        }
        return undefined;
    }

    async getFollowers(userId: number): Promise<FollowUser[]> {
        const sql = `
            SELECT u.id, u.name, f.created_at as followed_at
            FROM follows f
            JOIN users u ON f.follower_id = u.id
            WHERE f.following_id = $1 AND u.is_active = true
            ORDER BY f.created_at DESC
        `;
        const result = await query(sql, [userId]);
        return result.rows;
    }

    async getFollowing(userId: number): Promise<FollowUser[]> {
        const sql = `
            SELECT u.id, u.name, f.created_at as followed_at
            FROM follows f
            JOIN users u ON f.following_id = u.id
            WHERE f.follower_id = $1 AND u.is_active = true
            ORDER BY f.created_at DESC
        `;
        const result = await query(sql, [userId]);
        return result.rows;
    }
}

export default new UserRepository();
