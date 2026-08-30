import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { logger } from './config/logger';
import { limiter } from './config/rateLimit';
import routes from './routes';

const app: Application = express();

const isDev = process.env.NODE_ENV === 'development';

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "script-src": ["'self'", ...(isDev ? ["'unsafe-inline'"] : [])],
      "style-src": ["'self'", "https:", ...(isDev ? ["'unsafe-inline'"] : [])],
      "img-src": ["'self'", "data:", "https:"],
      "upgrade-insecure-requests": [],
    },
  },
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? '*' : process.env.ALLOWED_ORIGINS?.split(',') || false,
}));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`[PID ${process.pid}] ${req.method} ${req.url}`);
  next();
});

if (process.env.NODE_ENV === 'development') {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use('/api/v1', routes);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  logger.error(`[PID ${process.pid}] ${err.message}`, { stack: err.stack });

  return res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

export default app;