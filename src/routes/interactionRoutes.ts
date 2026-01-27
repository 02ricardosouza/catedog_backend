import { Router } from 'express';
import interactionController from '../controllers/interactionController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * /posts/{id}/comments:
 *   get:
 *     summary: Listar comentários de um post
 *     tags: [Interações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do post
 *     responses:
 *       200:
 *         description: Lista de comentários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
router.get('/posts/:id/comments', interactionController.getComments);

/**
 * @swagger
 * /posts/{id}/comments:
 *   post:
 *     summary: Adicionar comentário
 *     tags: [Interações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Ótimo post! Muito útil."
 *     responses:
 *       201:
 *         description: Comentário adicionado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Não autenticado
 */
router.post('/posts/:id/comments', authMiddleware, interactionController.addComment);

/**
 * @swagger
 * /posts/{id}/likes:
 *   get:
 *     summary: Obter contagem de curtidas
 *     tags: [Interações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do post
 *     responses:
 *       200:
 *         description: Contagem de curtidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 42
 */
router.get('/posts/:id/likes', interactionController.getLikes);

/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     summary: Curtir/descurtir post
 *     tags: [Interações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do post
 *     responses:
 *       200:
 *         description: Status de curtida alterado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Não autenticado
 */
router.post('/posts/:id/like', authMiddleware, interactionController.toggleLike);

/**
 * @swagger
 * /users/{id}/follow:
 *   post:
 *     summary: Seguir/deixar de seguir usuário
 *     tags: [Interações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário a seguir
 *     responses:
 *       200:
 *         description: Status de follow alterado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 following:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Não autenticado
 */
router.post('/users/:id/follow', authMiddleware, interactionController.toggleFollow);

export default router;
