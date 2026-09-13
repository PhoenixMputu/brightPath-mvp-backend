import type { Request, Response, NextFunction } from 'express';
import { schoolService } from '../services/school.service';

export class SchoolController {
  /**
   * Register a new school
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const school = await schoolService.createSchool(req.body);
      return res.status(201).json({
        data: school,
      });
    } catch (error: any) {
      if (error.message === 'Province not found') {
        return res.status(400).json({
          error: {
            message: error.message,
          },
        });
      }

      if (error.message === 'Email already registered') {
        return res.status(409).json({
          error: {
            message: error.message,
          },
        });
      }

      next(error);
    }
  }
}

export const schoolController = new SchoolController();
