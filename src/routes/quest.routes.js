import { Router } from 'express';
import { getAllQuests, getQuest, getOptions, answerQuestion } from '../controllers/quest.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js'

const router = Router();
/**
 * @swagger
 * /quest:
 *   get:
 *     summary: Obtiene todas las preguntas
 *     responses:
 *       200:
 *         description: Lista de preguntas
 */
router.get('/', getAllQuests);        
router.get('/:id', getQuest);
router.get('/:id/options', getOptions);
router.post('/:id/answer', verifyToken, answerQuestion);

export default router;

