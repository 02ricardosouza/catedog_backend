import { query } from '../config/db';

export interface Comment {
    id?: number;
    user_id: number;
    post_id: number;
    content: string;
    created_at?: Date;
    author_name?: string;
    author?: {
        id: number;
        name: string;
        avatarUrl?: string;
    };
}

class InteractionRepository {
    // Comments
    async createComment(comment: Comment): Promise<Comment> {
        const { user_id, post_id, content } = comment;
        const sql = `
            WITH inserted_comment AS (
                INSERT INTO comments (user_id, post_id, content)
                VALUES ($1, $2, $3)
                RETURNING *
            )
            SELECT ic.*, json_build_object('id', u.id, 'name', u.name) as author
            FROM inserted_comment ic
            JOIN users u ON ic.user_id = u.id
        `;
        const result = await query(sql, [user_id, post_id, content]);
        return result.rows[0];
    }

    async findCommentsByPostId(postId: number): Promise<Comment[]> {
        const sql = `
            SELECT c.*, json_build_object('id', u.id, 'name', u.name) as author
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC
        `;
        const result = await query(sql, [postId]);
        return result.rows;
    }

    // Likes
    async addLike(userId: number, postId: number): Promise<any> {
        const sql = 'INSERT INTO likes (user_id, post_id) VALUES ($1, $2) RETURNING *';
        const result = await query(sql, [userId, postId]);
        return result.rows[0];
    }

    async removeLike(userId: number, postId: number): Promise<void> {
        const sql = 'DELETE FROM likes WHERE user_id = $1 AND post_id = $2';
        await query(sql, [userId, postId]);
    }

    async countLikes(postId: number): Promise<number> {
        const sql = 'SELECT COUNT(*) FROM likes WHERE post_id = $1';
        const result = await query(sql, [postId]);
        return Number.parseInt(result.rows[0].count);
    }

    async hasLiked(userId: number, postId: number): Promise<boolean> {
        const sql = 'SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2';
        const result = await query(sql, [userId, postId]);
        return result.rowCount ? result.rowCount > 0 : false;
    }

    // Follows
    async follow(followerId: number, followingId: number): Promise<any> {
        const sql = 'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) RETURNING *';
        const result = await query(sql, [followerId, followingId]);
        return result.rows[0];
    }

    async unfollow(followerId: number, followingId: number): Promise<void> {
        const sql = 'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2';
        await query(sql, [followerId, followingId]);
    }

    async isFollowing(followerId: number, followingId: number): Promise<boolean> {
        const sql = 'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2';
        const result = await query(sql, [followerId, followingId]);
        return result.rowCount ? result.rowCount > 0 : false;
    }
}

export default new InteractionRepository();
