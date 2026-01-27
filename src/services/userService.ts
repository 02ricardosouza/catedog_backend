import userRepository, { UserProfile, FollowUser } from '../repositories/userRepository';
import postRepository from '../repositories/postRepository';
import interactionRepository from '../repositories/interactionRepository';

class UserService {
    async getProfile(userId: number): Promise<UserProfile | null> {
        const profile = await userRepository.getProfile(userId);
        if (!profile) {
            return null;
        }
        return profile;
    }

    async getUserPosts(userId: number) {
        // Only return approved posts for public profile
        const posts = await postRepository.findByUserId(userId);
        return posts.filter((p: any) => p.status === 'approved');
    }

    async getFollowers(userId: number): Promise<FollowUser[]> {
        return userRepository.getFollowers(userId);
    }

    async getFollowing(userId: number): Promise<FollowUser[]> {
        return userRepository.getFollowing(userId);
    }

    async isFollowing(followerId: number, followingId: number): Promise<boolean> {
        return interactionRepository.isFollowing(followerId, followingId);
    }
}

export default new UserService();
