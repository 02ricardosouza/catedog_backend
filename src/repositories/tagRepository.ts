import { query } from '../config/db';

class TagRepository {
    async getTopTags(limit: number = 10) {
        const sql = `
            SELECT t.name, t.color, COUNT(pt.post_id) as post_count
            FROM tags t
            JOIN post_tags pt ON t.id = pt.tag_id
            GROUP BY t.id, t.name, t.color
            ORDER BY post_count DESC
            LIMIT $1
        `;
        const result = await query(sql, [limit]);
        return result.rows;
    }
}

export default new TagRepository();
