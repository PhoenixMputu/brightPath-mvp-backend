import { Router } from 'express';
import { provinceController } from '../controllers/province.controller';
import { validate } from '../middleware/validation.middleware';
import { createProvinceSchema } from '../types/province';

const router = Router();

/**
 * @swagger
 * /provinces:
 *   post:
 *     summary: Create a new province
 *     tags: [Provinces]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the province
 *     responses:
 *       201:
 *         description: Province created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Province already exists
 */
router.post('/', validate(createProvinceSchema), provinceController.create);

/**
 * @swagger
 * /provinces:
 *   get:
 *     summary: Get all provinces
 *     tags: [Provinces]
 *     responses:
 *       200:
 *         description: List of provinces
 */
router.get('/', provinceController.list);

export default router;
