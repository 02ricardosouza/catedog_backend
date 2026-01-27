import { Router } from 'express';
import userController from '../controllers/userController';
import optionalAuthMiddleware from '../middlewares/optionalAuthMiddleware';

const router = Router();

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obter perfil público do usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Dados do perfil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 posts_count:
 *                   type: integer
 *                 followers_count:
 *                   type: integer
 *                 following_count:
 *                   type: integer
 *                 isFollowing:
 *                   type: boolean
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:id', optionalAuthMiddleware, userController.getProfile);

/**
 * @swagger
 * /users/{id}/posts:
 *   get:
 *     summary: Listar posts do usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de posts do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get('/:id/posts', userController.getUserPosts);

/**
 * @swagger
 * /users/{id}/followers:
 *   get:
 *     summary: Listar seguidores do usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de seguidores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   followed_at:
 *                     type: string
 *                     format: date-time
 */
router.get('/:id/followers', userController.getFollowers);

/**
 * @swagger
 * /users/{id}/following:
 *   get:
 *     summary: Listar usuários que este perfil segue
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de usuários seguidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   followed_at:
 *                     type: string
 *                     format: date-time
 */
router.get('/:id/following', userController.getFollowing);

export default router;
