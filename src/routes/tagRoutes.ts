import { Router } from 'express';
import tagController from '../controllers/tagController';

const router = Router();

/**
 * @swagger
 * /tags/top:
 *   get:
 *     summary: Listar tags mais usadas
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Lista das tags mais populares
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 */
router.get('/top', tagController.getTopTags);

export default router;
