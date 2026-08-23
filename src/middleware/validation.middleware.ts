import type { Request, Response, NextFunction } from 'express';
import { ZodError, type ZodObject } from 'zod';

export const validate = (schema: ZodObject<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: {
            message: 'Validation failed',
            details: error.issues.map((issue: any) => ({
              path: issue.path.join('.'),
              message: issue.message,
            })),
          },
        });
      }
      next(error);
    }
  };
};
