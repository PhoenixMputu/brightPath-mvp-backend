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
 *             $ref: '#/components/schemas/CreateProvinceInput'
 *     responses:
 *       201:
 *         description: Province created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Province'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Province already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Province'
 */
router.get('/', provinceController.list);

export default router;
