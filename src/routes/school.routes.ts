import { Router } from 'express';
import { schoolController } from '../controllers/school.controller';
import { validate } from '../middleware/validation.middleware';
import { createSchoolSchema } from '../types/school';

const router = Router();

/**
 * @swagger
 * /schools:
 *   post:
 *     summary: Register a new school
 *     tags: [Schools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolInput'
 *     responses:
 *       201:
 *         description: School registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/School'
 *       400:
 *         description: Validation error or Province not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validate(createSchoolSchema), schoolController.register);

export default router;
