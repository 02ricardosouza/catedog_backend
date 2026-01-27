import { Router } from 'express';
import adminController from '../controllers/adminController';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

// All admin routes require authentication AND admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// ===== STATISTICS =====
/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Obter estatísticas do sistema
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas gerais
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 totalPosts:
 *                   type: integer
 *                 totalComments:
 *                   type: integer
 *                 totalLikes:
 *                   type: integer
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado (não é admin)
 */
router.get('/stats', adminController.getStats);

// ===== USER MANAGEMENT =====
/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Acesso negado
 */
router.get('/users', adminController.listUsers);

/**
 * @swagger
 * /admin/users/{id}/role:
 *   put:
 *     summary: Alterar role de usuário
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [reader, author, moderator, admin]
 *     responses:
 *       200:
 *         description: Role atualizada
 *       403:
 *         description: Acesso negado
 */
router.put('/users/:id/role', adminController.updateUserRole);

/**
 * @swagger
 * /admin/users/{id}/status:
 *   put:
 *     summary: Ativar/desativar usuário
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status alterado
 *       403:
 *         description: Acesso negado
 */
router.put('/users/:id/status', adminController.toggleUserStatus);

// ===== POST MODERATION =====
/**
 * @swagger
 * /admin/posts:
 *   get:
 *     summary: Listar todos os posts (moderação)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos os posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       403:
 *         description: Acesso negado
 */
router.get('/posts', adminController.listAllPosts);

/**
 * @swagger
 * /admin/posts/{id}:
 *   delete:
 *     summary: Deletar qualquer post
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post deletado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Post não encontrado
 */
router.delete('/posts/:id', adminController.deleteAnyPost);

// ===== COMMENT MODERATION =====
/**
 * @swagger
 * /admin/comments:
 *   get:
 *     summary: Listar todos os comentários
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de comentários
 *       403:
 *         description: Acesso negado
 */
router.get('/comments', adminController.listAllComments);

/**
 * @swagger
 * /admin/comments/{id}:
 *   delete:
 *     summary: Deletar qualquer comentário
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Comentário deletado
 *       403:
 *         description: Acesso negado
 */
router.delete('/comments/:id', adminController.deleteAnyComment);

// ===== ADMIN LOGS =====
/**
 * @swagger
 * /admin/logs:
 *   get:
 *     summary: Listar logs de ações admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de logs administrativos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   admin_id:
 *                     type: integer
 *                   action:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       403:
 *         description: Acesso negado
 */
router.get('/logs', adminController.getAdminLogs);

export default router;
