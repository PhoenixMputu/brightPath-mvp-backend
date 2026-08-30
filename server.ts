import cluster from 'node:cluster';
import os from 'node:os';
import app from './src/app';
import { logger } from './src/config/logger.ts';
import { prisma } from './src/lib/prisma';
import { redisClient } from './src/lib/redis';

const PORT = process.env.PORT || 3000;

const numCPUs = os.availableParallelism ? os.availableParallelism() : os.cpus().length;

if (cluster.isPrimary) {
  logger.info(`[Master ${process.pid}] Initializing cluster on ${numCPUs} CPU cores...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`[Master] Worker ${worker.process.pid} stopped (code: ${code}, signal: ${signal}). Restarting a new worker...`);
    cluster.fork();
  });
} else {
  const startServer = async () => {
    try {
      // Stagger worker startup to avoid thundering herd on DB/Redis
      const delay = Math.floor(Math.random() * 2000);
      await new Promise((resolve) => setTimeout(resolve, delay));

      await prisma.$connect();
      logger.info(`[Worker ${process.pid}] Database connection established.`);

      await redisClient.set('__healthcheck__', 'ok');
      await redisClient.del('__healthcheck__');
      logger.info(`[Worker ${process.pid}] Redis connection established.`);

      const server = app.listen(PORT, () => {
        logger.info(`[Worker ${process.pid}] Server started on port ${PORT}`);
      });

      const gracefulShutdown = async (signal: string) => {
        logger.info(`[Worker ${process.pid}] Signal ${signal} received. Closing connections...`);

        server.close(async () => {
          try {
            await prisma.$disconnect();
            await redisClient.quit();
            logger.info(`[Worker ${process.pid}] Postgres and Redis connections closed.`);
            process.exit(0);
          } catch (error) {
            logger.error(`[Worker ${process.pid}] Error during shutdown:`, error);
            process.exit(1);
          }
        });
      };

      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    } catch (error) {
      logger.error(`[Worker ${process.pid}] Failed to start worker:`, error);
      process.exit(1);
    }
  };

  startServer();
}