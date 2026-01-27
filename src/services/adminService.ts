import { adminRepository } from '../repositories/adminRepository';

export const adminService = {
    // ===== USER MANAGEMENT =====

    async getAllUsers() {
        return await adminRepository.getAllUsers();
    },

    async updateUserRole(adminId: number, userId: number, newRole: string) {
        // Validate role
        if (!['user', 'editor', 'admin'].includes(newRole)) {
            throw new Error('Invalid role');
        }

        const user = await adminRepository.updateUserRole(userId, newRole);

        // Log the action
        await adminRepository.createLog(
            adminId,
            'update_user_role',
            'user',
            userId,
            { new_role: newRole, user_email: user.email }
        );

        return user;
    },

    async toggleUserStatus(adminId: number, userId: number, isActive: boolean) {
        const user = await adminRepository.toggleUserStatus(userId, isActive);

        // Log the action
        await adminRepository.createLog(
            adminId,
            isActive ? 'unban_user' : 'ban_user',
            'user',
            userId,
            { user_email: user.email, is_active: isActive }
        );

        return user;
    },

    // ===== POST MODERATION =====

    async getAllPosts() {
        return await adminRepository.getAllPosts();
    },

    async deletePost(adminId: number, postId: number) {
        const post = await adminRepository.deletePost(postId);

        if (!post) {
            throw new Error('Post not found');
        }

        // Log the action
        await adminRepository.createLog(
            adminId,
            'delete_post',
            'post',
            postId,
            { post_title: post.title, post_author_id: post.user_id }
        );

        return post;
    },

    // ===== COMMENT MODERATION =====

    async getAllComments() {
        return await adminRepository.getAllComments();
    },

    async deleteComment(adminId: number, commentId: number) {
        const comment = await adminRepository.deleteComment(commentId);

        if (!comment) {
            throw new Error('Comment not found');
        }

        // Log the action
        await adminRepository.createLog(
            adminId,
            'delete_comment',
            'comment',
            commentId,
            { comment_author_id: comment.user_id, post_id: comment.post_id }
        );

        return comment;
    },

    // ===== STATISTICS =====

    async getStats() {
        return await adminRepository.getStats();
    },

    // ===== ADMIN LOGS =====

    async getLogs(limit: number = 100) {
        return await adminRepository.getLogs(limit);
    }
};
