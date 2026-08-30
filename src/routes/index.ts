import { Router } from 'express';
import provinceRoutes from './province.routes';
import { prisma } from '../lib/prisma';
import { redisClient } from '../lib/redis';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 123.45
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                     redis:
 *                       type: string
 */
router.get('/health', async (_req, res) => {
  let dbStatus = 'ok';
  let redisStatus = 'ok';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = 'disconnected';
  }

  try {
    await redisClient.set('__healthcheck__', 'ok');
    await redisClient.del('__healthcheck__');
  } catch (error) {
    redisStatus = 'disconnected';
  }

  const isHealthy = dbStatus === 'ok' && redisStatus === 'ok';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
  });
});

// Province routes
router.use('/provinces', provinceRoutes);

export default router;
