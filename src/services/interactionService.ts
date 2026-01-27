import interactionRepository from '../repositories/interactionRepository';

class InteractionService {
    // Comments
    async addComment(userId: number, postId: number, content: string) {
        return await interactionRepository.createComment({ user_id: userId, post_id: postId, content });
    }

    async getComments(postId: number) {
        return await interactionRepository.findCommentsByPostId(postId);
    }

    // Likes
    async toggleLike(userId: number, postId: number) {
        const hasLiked = await interactionRepository.hasLiked(userId, postId);
        if (hasLiked) {
            await interactionRepository.removeLike(userId, postId);
            return { liked: false };
        } else {
            await interactionRepository.addLike(userId, postId);
            return { liked: true };
        }
    }

    async getLikesCount(postId: number) {
        return await interactionRepository.countLikes(postId);
    }

    // Follows
    async toggleFollow(followerId: number, followingId: number) {
        if (followerId === followingId) {
            throw new Error('You cannot follow yourself');
        }
        const isFollowing = await interactionRepository.isFollowing(followerId, followingId);
        if (isFollowing) {
            await interactionRepository.unfollow(followerId, followingId);
            return { following: false };
        } else {
            await interactionRepository.follow(followerId, followingId);
            return { following: true };
        }
    }
}

export default new InteractionService();
