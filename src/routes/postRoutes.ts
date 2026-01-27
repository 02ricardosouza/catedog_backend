import { Router } from 'express';
import postController from '../controllers/postController';
import authMiddleware from '../middlewares/authMiddleware';
import adminMiddleware from '../middlewares/adminMiddleware';
import optionalAuthMiddleware from '../middlewares/optionalAuthMiddleware';

const router = Router();

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Listar todos os posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Gatos, Cachorros]
 *         description: Filtrar por categoria
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filtrar por tag
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limite de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset para paginação
 *     responses:
 *       200:
 *         description: Lista de posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get('/', optionalAuthMiddleware, postController.findAll);

/**
 * @swagger
 * /posts/featured:
 *   get:
 *     summary: Obter post em destaque
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Post em destaque
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 */
router.get('/featured', optionalAuthMiddleware, postController.getFeaturedPost);

/**
 * @swagger
 * /posts/recent:
 *   get:
 *     summary: Obter posts recentes
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Número de posts
 *     responses:
 *       200:
 *         description: Lista de posts recentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get('/recent', optionalAuthMiddleware, postController.getRecentPosts);

/**
 * @swagger
 * /posts/most-liked:
 *   get:
 *     summary: Obter posts mais curtidos
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Número de posts
 *     responses:
 *       200:
 *         description: Lista de posts mais curtidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get('/most-liked', optionalAuthMiddleware, postController.getMostLikedPosts);

/**
 * @swagger
 * /posts/search:
 *   get:
 *     summary: Buscar posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Termo de busca
 *     responses:
 *       200:
 *         description: Resultados da busca
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
router.get('/search', optionalAuthMiddleware, postController.search);

/**
 * @swagger
 * /posts/my-posts:
 *   get:
 *     summary: Listar minhas postagens
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de posts do usuário autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Não autenticado
 */
router.get('/my-posts', authMiddleware, postController.getMyPosts);

/**
 * @swagger
 * /posts/pending:
 *   get:
 *     summary: Listar posts pendentes de moderação
 *     tags: [Administração]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de posts pendentes
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão (requer admin)
 */
router.get('/pending', authMiddleware, adminMiddleware, postController.getPendingPosts);

/**
 * @swagger
 * /posts/by-status:
 *   get:
 *     summary: Listar posts por status
 *     tags: [Administração]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Lista de posts filtrados por status
 */
router.get('/by-status', authMiddleware, adminMiddleware, postController.getPostsByStatus);

/**
 * @swagger
 * /posts/{id}/approve:
 *   put:
 *     summary: Aprovar post
 *     tags: [Administração]
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
 *         description: Post aprovado
 */
router.put('/:id/approve', authMiddleware, adminMiddleware, postController.approvePost);

/**
 * @swagger
 * /posts/{id}/reject:
 *   put:
 *     summary: Rejeitar post
 *     tags: [Administração]
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
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Conteúdo duplicado"
 *     responses:
 *       200:
 *         description: Post rejeitado
 */
router.put('/:id/reject', authMiddleware, adminMiddleware, postController.rejectPost);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Obter post por ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes do post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post não encontrado
 */
router.get('/:id', optionalAuthMiddleware, postController.findById);

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Criar novo post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostRequest'
 *     responses:
 *       201:
 *         description: Post criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         description: Não autenticado
 */
router.post('/', authMiddleware, postController.create);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Atualizar post
 *     tags: [Posts]
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
 *             $ref: '#/components/schemas/CreatePostRequest'
 *     responses:
 *       200:
 *         description: Post atualizado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Post não encontrado
 */
router.put('/:id', authMiddleware, postController.update);

/**
 * @swagger
 * /posts/{id}/featured:
 *   put:
 *     summary: Marcar/desmarcar post como destaque
 *     tags: [Administração]
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
 *               is_featured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status de destaque atualizado
 */
router.put('/:id/featured', authMiddleware, adminMiddleware, postController.setFeatured);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Excluir post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Post excluído
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Post não encontrado
 */
router.delete('/:id', authMiddleware, postController.delete);

export default router;
