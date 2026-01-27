import { query } from '../config/db';

export interface Post {
    id?: number;
    user_id: number;
    title: string;
    content: string;
    image_url?: string;
    category: 'Gatos' | 'Cachorros';
    created_at?: Date;
    author_name?: string;
    tags?: { name: string; color: string }[] | string[];
    is_featured?: boolean;
    featured_at?: Date;
    status?: 'pending' | 'approved' | 'rejected';
    reviewed_by?: number;
    reviewed_at?: Date;
    rejection_reason?: string;
}

class PostRepository {
    async create(post: Post): Promise<Post> {
        const { user_id, title, content, image_url, category, tags } = post;
        const sql = `
            INSERT INTO posts (user_id, title, content, image_url, category)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [user_id, title, content, image_url, category];
        const result = await query(sql, values);
        const createdPost = result.rows[0];

        if (tags && tags.length > 0) {
            await this.updatePostTags(createdPost.id, tags as string[]);
        }

        const fullPost = await this.findById(createdPost.id);
        if (!fullPost) throw new Error('Post not found after creation');
        return fullPost;
    }

    private async updatePostTags(postId: number, tags: string[]): Promise<void> {
        // Delete existing tags
        await query('DELETE FROM post_tags WHERE post_id = $1', [postId]);

        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

        for (const tagName of tags) {
            const normalizedName = tagName.toLowerCase().trim();
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            // Insert tag if not exists, with a random color if it's new
            const tagResult = await query(
                `INSERT INTO tags (name, color) 
                 VALUES ($1, $2) 
                 ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
                 RETURNING id`,
                [normalizedName, randomColor]
            );
            const tagId = tagResult.rows[0].id;
            // Link tag to post
            await query('INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [postId, tagId]);
        }
    }

    async findAll(category?: string, userId?: number, tagName?: string, limit?: number, offset?: number, status: string = 'approved'): Promise<Post[]> {
        const params: any[] = [];
        let paramIndex = 1;

        let sql = `
            SELECT 
                p.id,
                p.title,
                p.content,
                p.image_url,
                p.category,
                p.created_at,
                p.is_featured,
                p.featured_at,
                p.status,
                u.name as author_name,
                COUNT(DISTINCT l.user_id) as "likesCount",
                COUNT(DISTINCT c.id) as "commentsCount",
                (
                    SELECT COALESCE(json_agg(json_build_object('name', t.name, 'color', t.color)), '[]')
                    FROM post_tags pt
                    JOIN tags t ON pt.tag_id = t.id
                    WHERE pt.post_id = p.id
                ) as tags
        `;

        // Add isLikedByMe only if userId is provided
        if (userId) {
            sql += `,
                EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $${paramIndex}) as "isLikedByMe"
            `;
            params.push(userId);
            paramIndex++;
        } else {
            sql += `,
                false as "isLikedByMe"
            `;
        }

        sql += `
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN likes l ON p.id = l.post_id
            LEFT JOIN comments c ON p.id = c.post_id
        `;

        const whereClauses = [];

        // Always filter by status
        whereClauses.push(`p.status = $${paramIndex}`);
        params.push(status);
        paramIndex++;

        if (category) {
            whereClauses.push(`p.category = $${paramIndex}`);
            params.push(category);
            paramIndex++;
        }

        if (tagName) {
            whereClauses.push(`EXISTS (
                SELECT 1 FROM post_tags pt 
                JOIN tags t ON pt.tag_id = t.id 
                WHERE pt.post_id = p.id AND t.name = $${paramIndex}
            )`);
            params.push(tagName.toLowerCase().trim());
            paramIndex++;
        }

        if (whereClauses.length > 0) {
            sql += ' WHERE ' + whereClauses.join(' AND ');
        }

        sql += ' GROUP BY p.id, u.name ORDER BY p.created_at DESC';

        // Add pagination
        if (limit !== undefined) {
            sql += ` LIMIT $${params.length + 1}`;
            params.push(limit);
        }
        if (offset !== undefined) {
            sql += ` OFFSET $${params.length + 1}`;
            params.push(offset);
        }

        const result = await query(sql, params);
        return result.rows;
    }

    async findById(id: number, userId?: number): Promise<Post | undefined> {
        const sql = `
            SELECT 
                p.*,
                u.name as author_name,
                COUNT(DISTINCT l.user_id) as "likesCount",
                COUNT(DISTINCT c.id) as "commentsCount",
                (
                    SELECT COALESCE(json_agg(json_build_object('name', t.name, 'color', t.color)), '[]')
                    FROM post_tags pt
                    JOIN tags t ON pt.tag_id = t.id
                    WHERE pt.post_id = p.id
                ) as tags,
                CASE 
                    WHEN $2::INTEGER IS NOT NULL THEN 
                        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $2::INTEGER)
                    ELSE false
                END as "isLikedByMe"
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN likes l ON p.id = l.post_id
            LEFT JOIN comments c ON p.id = c.post_id
            WHERE p.id = $1
            GROUP BY p.id, u.name
        `;
        const result = await query(sql, [id, userId || null]);
        return result.rows[0];
    }

    async update(id: number, post: Partial<Post>): Promise<Post> {
        const { title, content, image_url, category, tags } = post;
        const sql = `
            UPDATE posts 
            SET title = $1, content = $2, image_url = $3, category = $4
            WHERE id = $5
            RETURNING *
        `;
        const values = [title, content, image_url, category, id];
        const result = await query(sql, values);
        const updatedPost = result.rows[0];

        if (tags && tags.length > 0) {
            await this.updatePostTags(id, tags as string[]);
        }

        const fullPost = await this.findById(id);
        if (!fullPost) throw new Error('Post not found after update');
        return fullPost;
    }

    async delete(id: number): Promise<void> {
        const sql = 'DELETE FROM posts WHERE id = $1';
        await query(sql, [id]);
    }

    async findByUserId(userId: number): Promise<Post[]> {
        const sql = `
            SELECT 
                p.id,
                p.title,
                p.content,
                p.image_url,
                p.category,
                p.created_at,
                p.is_featured,
                p.featured_at,
                p.status,
                p.reviewed_at,
                p.rejection_reason,
                u.name as author_name,
                COUNT(DISTINCT l.user_id) as "likesCount",
                COUNT(DISTINCT c.id) as "commentsCount",
                (
                    SELECT COALESCE(json_agg(json_build_object('name', t.name, 'color', t.color)), '[]')
                    FROM post_tags pt
                    JOIN tags t ON pt.tag_id = t.id
                    WHERE pt.post_id = p.id
                ) as tags
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN likes l ON p.id = l.post_id
            LEFT JOIN comments c ON p.id = c.post_id
            WHERE p.user_id = $1
            GROUP BY p.id, u.name
            ORDER BY p.created_at DESC
        `;
        const result = await query(sql, [userId]);
        return result.rows;
    }

    async findMostLiked(limit: number = 5): Promise<Post[]> {
        const sql = `
            SELECT 
                p.*,
                u.name as author_name,
                COUNT(l.user_id) as "likesCount"
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN likes l ON p.id = l.post_id
            GROUP BY p.id, u.name
            HAVING COUNT(l.user_id) > 0
            ORDER BY "likesCount" DESC, p.created_at DESC
            LIMIT $1
        `;
        const result = await query(sql, [limit]);
        return result.rows;
    }

    async findFeatured(userId?: number): Promise<Post | undefined> {
        let sql = `
            SELECT 
                p.id,
                p.title,
                p.content,
                p.image_url,
                p.category,
                p.created_at,
                p.is_featured,
                p.featured_at,
                u.name as author_name,
                COUNT(DISTINCT l.user_id) as "likesCount",
                COUNT(DISTINCT c.id) as "commentsCount",
                (
                    SELECT COALESCE(json_agg(json_build_object('name', t.name, 'color', t.color)), '[]')
                    FROM post_tags pt
                    JOIN tags t ON pt.tag_id = t.id
                    WHERE pt.post_id = p.id
                ) as tags`;

        if (userId) {
            sql += `,
                EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) as "isLikedByMe"
            `;
        } else {
            sql += `,
                false as "isLikedByMe"
            `;
        }

        sql += `
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN likes l ON p.id = l.post_id
            LEFT JOIN comments c ON p.id = c.post_id
            WHERE p.is_featured = true
            GROUP BY p.id, u.name
            ORDER BY p.featured_at DESC
            LIMIT 1
        `;

        const result = await query(sql, userId ? [userId] : []);
        return result.rows[0];
    }

    async findRecent(limit: number = 3, userId?: number): Promise<Post[]> {
        let paramIndex = 1;
        const params: any[] = [];

        let sql = `
            SELECT 
                p.id,
                p.title,
                p.content,
                p.image_url,
                p.category,
                p.created_at,
                p.is_featured,
                p.featured_at,
                u.name as author_name,
                COUNT(DISTINCT l.user_id) as "likesCount",
                COUNT(DISTINCT c.id) as "commentsCount",
                (
                    SELECT COALESCE(json_agg(json_build_object('name', t.name, 'color', t.color)), '[]')
                    FROM post_tags pt
                    JOIN tags t ON pt.tag_id = t.id
                    WHERE pt.post_id = p.id
                ) as tags`;

        if (userId) {
            sql += `,
                EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $${paramIndex}) as "isLikedByMe"
            `;
            params.push(userId);
            paramIndex++;
        } else {
            sql += `,
                false as "isLikedByMe"
            `;
        }

        sql += `
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN likes l ON p.id = l.post_id
            LEFT JOIN comments c ON p.id = c.post_id
            WHERE p.is_featured = false
            GROUP BY p.id, u.name
            ORDER BY p.created_at DESC
            LIMIT $${paramIndex}
        `;
        params.push(limit);

        const result = await query(sql, params);
        return result.rows;
    }

    async setFeatured(id: number, isFeatured: boolean): Promise<Post> {
        // If setting as featured, unfeatured all other posts first
        if (isFeatured) {
            await query('UPDATE posts SET is_featured = false, featured_at = NULL WHERE is_featured = true');
        }

        const sql = `
            UPDATE posts 
            SET is_featured = $1, featured_at = $2
            WHERE id = $3
            RETURNING *
        `;
        const featuredAt = isFeatured ? new Date() : null;
        const result = await query(sql, [isFeatured, featuredAt, id]);

        if (result.rows.length === 0) {
            throw new Error('Post not found');
        }

        return result.rows[0];
    }

    async findPendingPosts(): Promise<Post[]> {
        const sql = `
            SELECT 
                p.id,
                p.title,
                p.content,
                p.image_url,
                p.category,
                p.created_at,
                p.status,
                p.reviewed_by,
                p.reviewed_at,
                p.rejection_reason,
                u.name as author_name,
                u.id as user_id,
                (
                    SELECT COALESCE(json_agg(json_build_object('name', t.name, 'color', t.color)), '[]')
                    FROM post_tags pt
                    JOIN tags t ON pt.tag_id = t.id
                    WHERE pt.post_id = p.id
                ) as tags
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.status = 'pending'
            ORDER BY p.created_at DESC
        `;
        const result = await query(sql);
        return result.rows;
    }

    async approvePost(id: number, reviewerId: number): Promise<Post> {
        const sql = `
            UPDATE posts 
            SET status = 'approved', reviewed_by = $1, reviewed_at = NOW()
            WHERE id = $2
            RETURNING *
        `;
        const result = await query(sql, [reviewerId, id]);

        if (result.rows.length === 0) {
            throw new Error('Post not found');
        }

        return result.rows[0];
    }

    async rejectPost(id: number, reviewerId: number, reason: string): Promise<Post> {
        const sql = `
            UPDATE posts 
            SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW(), rejection_reason = $2
            WHERE id = $3
            RETURNING *
        `;
        const result = await query(sql, [reviewerId, reason, id]);

        if (result.rows.length === 0) {
            throw new Error('Post not found');
        }

        return result.rows[0];
    }

    async getPostsByStatus(status: string): Promise<Post[]> {
        const sql = `
            SELECT 
                p.id,
                p.title,
                p.content,
                p.image_url,
                p.category,
                p.created_at,
                p.status,
                p.reviewed_by,
                p.reviewed_at,
                p.rejection_reason,
                u.name as author_name,
                reviewer.name as reviewer_name,
                (
                    SELECT COALESCE(json_agg(json_build_object('name', t.name, 'color', t.color)), '[]')
                    FROM post_tags pt
                    JOIN tags t ON pt.tag_id = t.id
                    WHERE pt.post_id = p.id
                ) as tags
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN users reviewer ON p.reviewed_by = reviewer.id
            WHERE p.status = $1
            ORDER BY p.created_at DESC
        `;
        const result = await query(sql, [status]);
        return result.rows;
    }

    async search(searchTerm: string, userId?: number, limit: number = 20): Promise<Post[]> {
        const params: any[] = [];
        let paramIndex = 1;

        const searchPattern = `%${searchTerm.toLowerCase()}%`;

        let sql = `
            SELECT 
                p.id,
                p.title,
                p.content,
                p.image_url,
                p.category,
                p.created_at,
                p.is_featured,
                p.status,
                u.name as author_name,
                COUNT(DISTINCT l.user_id) as "likesCount",
                COUNT(DISTINCT c.id) as "commentsCount",
                (
                    SELECT COALESCE(json_agg(json_build_object('name', t.name, 'color', t.color)), '[]')
                    FROM post_tags pt
                    JOIN tags t ON pt.tag_id = t.id
                    WHERE pt.post_id = p.id
                ) as tags
        `;

        if (userId) {
            sql += `,
                EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $${paramIndex}) as "isLikedByMe"
            `;
            params.push(userId);
            paramIndex++;
        } else {
            sql += `,
                false as "isLikedByMe"
            `;
        }

        sql += `
            FROM posts p
            JOIN users u ON p.user_id = u.id
            LEFT JOIN likes l ON p.id = l.post_id
            LEFT JOIN comments c ON p.id = c.post_id
            WHERE p.status = 'approved'
            AND (
                LOWER(p.title) LIKE $${paramIndex}
                OR LOWER(p.content) LIKE $${paramIndex}
                OR EXISTS (
                    SELECT 1 FROM post_tags pt 
                    JOIN tags t ON pt.tag_id = t.id 
                    WHERE pt.post_id = p.id AND LOWER(t.name) LIKE $${paramIndex}
                )
            )
        `;
        params.push(searchPattern);
        paramIndex++;

        sql += `
            GROUP BY p.id, u.name
            ORDER BY p.created_at DESC
            LIMIT $${paramIndex}
        `;
        params.push(limit);

        const result = await query(sql, params);
        return result.rows;
    }
}

export default new PostRepository();
