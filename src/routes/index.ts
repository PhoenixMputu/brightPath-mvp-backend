import { Router } from 'express';
import provinceRoutes from './province.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Province routes
router.use('/provinces', provinceRoutes);

export default router;
