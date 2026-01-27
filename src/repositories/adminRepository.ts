import { query } from '../config/db';

export const adminRepository = {
    // ===== USER MANAGEMENT =====

    async getAllUsers() {
        const result = await query(`
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.role, 
                u.is_active,
                u.created_at,
                COUNT(DISTINCT p.id) as posts_count,
                COUNT(DISTINCT c.id) as comments_count
            FROM users u
            LEFT JOIN posts p ON u.id = p.user_id
            LEFT JOIN comments c ON u.id = c.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `);
        return result.rows;
    },

    async updateUserRole(userId: number, role: string) {
        const result = await query(
            'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [role, userId]
        );
        return result.rows[0];
    },

    async toggleUserStatus(userId: number, isActive: boolean) {
        const result = await query(
            'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [isActive, userId]
        );
        return result.rows[0];
    },

    // ===== POST MODERATION =====

    async getAllPosts() {
        const result = await query(`
            SELECT 
                p.*,
                u.name as author_name,
                u.email as author_email,
                COUNT(DISTINCT l.user_id) as likes_count,
                COUNT(DISTINCT c.id) as comments_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN likes l ON p.id = l.post_id
            LEFT JOIN comments c ON p.id = c.post_id
            GROUP BY p.id, u.name, u.email
            ORDER BY p.created_at DESC
        `);
        return result.rows;
    },

    async deletePost(postId: number) {
        const result = await query(
            'DELETE FROM posts WHERE id = $1 RETURNING *',
            [postId]
        );
        return result.rows[0];
    },

    // ===== COMMENT MODERATION =====

    async getAllComments() {
        const result = await query(`
            SELECT 
                c.*,
                u.name as author_name,
                u.email as author_email,
                p.title as post_title
            FROM comments c
            JOIN users u ON c.user_id = u.id
            JOIN posts p ON c.post_id = p.id
            ORDER BY c.created_at DESC
        `);
        return result.rows;
    },

    async deleteComment(commentId: number) {
        const result = await query(
            'DELETE FROM comments WHERE id = $1 RETURNING *',
            [commentId]
        );
        return result.rows[0];
    },

    // ===== STATISTICS =====

    async getStats() {
        const usersResult = await query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
                COUNT(*) FILTER (WHERE role = 'editor') as editor_count,
                COUNT(*) FILTER (WHERE role = 'user') as user_count,
                COUNT(*) FILTER (WHERE is_active = false) as banned_count
            FROM users
        `);

        const postsResult = await query('SELECT COUNT(*) as total_posts FROM posts');
        const commentsResult = await query('SELECT COUNT(*) as total_comments FROM comments');
        const likesResult = await query('SELECT COUNT(*) as total_likes FROM likes');

        return {
            users: usersResult.rows[0],
            total_posts: Number.parseInt(postsResult.rows[0].total_posts),
            total_comments: Number.parseInt(commentsResult.rows[0].total_comments),
            total_likes: Number.parseInt(likesResult.rows[0].total_likes)
        };
    },

    // ===== ADMIN LOGS =====

    async createLog(adminId: number, action: string, targetType: string, targetId: number | null, details: any) {
        const result = await query(
            'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [adminId, action, targetType, targetId, JSON.stringify(details)]
        );
        return result.rows[0];
    },

    async getLogs(limit: number = 100) {
        const result = await query(`
            SELECT 
                al.*,
                u.name as admin_name,
                u.email as admin_email
            FROM admin_logs al
            JOIN users u ON al.admin_id = u.id
            ORDER BY al.created_at DESC
            LIMIT $1
        `, [limit]);
        return result.rows;
    }
};
