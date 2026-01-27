import postRepository, { Post } from '../repositories/postRepository';

class PostService {
    async create(post: Post) {
        return await postRepository.create(post);
    }

    async findAll(category?: string, userId?: number, tagName?: string, limit?: number, offset?: number) {
        return await postRepository.findAll(category, userId, tagName, limit, offset);
    }

    async findById(id: number, userId?: number) {
        const post = await postRepository.findById(id, userId);
        if (!post) {
            throw new Error('Post not found');
        }
        return post;
    }

    async update(id: number, userId: number, postData: Partial<Post>) {
        const post = await postRepository.findById(id);
        if (!post) {
            throw new Error('Post not found');
        }
        if (post.user_id !== userId) {
            throw new Error('Unauthorized');
        }
        return await postRepository.update(id, postData);
    }

    async delete(id: number, userId: number) {
        const post = await postRepository.findById(id);
        if (!post) {
            throw new Error('Post not found');
        }
        if (post.user_id !== userId) {
            throw new Error('Unauthorized');
        }
        await postRepository.delete(id);
    }

    async findByUserId(userId: number) {
        return await postRepository.findByUserId(userId);
    }

    async findMostLiked(limit: number = 5) {
        return await postRepository.findMostLiked(limit);
    }

    async getFeaturedPost(userId?: number) {
        return await postRepository.findFeatured(userId);
    }

    async getRecentPosts(limit: number = 3, userId?: number) {
        return await postRepository.findRecent(limit, userId);
    }

    async setFeatured(id: number, isFeatured: boolean) {
        return await postRepository.setFeatured(id, isFeatured);
    }

    // Moderation methods
    async getPendingPosts() {
        return await postRepository.findPendingPosts();
    }

    async getPostsByStatus(status: string) {
        return await postRepository.getPostsByStatus(status);
    }

    async approvePost(id: number, reviewerId: number) {
        return await postRepository.approvePost(id, reviewerId);
    }

    async rejectPost(id: number, reviewerId: number, reason: string) {
        if (!reason || reason.trim() === '') {
            throw new Error('Rejection reason is required');
        }
        return await postRepository.rejectPost(id, reviewerId, reason);
    }

    async search(searchTerm: string, userId?: number) {
        if (!searchTerm || searchTerm.trim() === '') {
            return [];
        }
        return await postRepository.search(searchTerm.trim(), userId);
    }
}

export default new PostService();
