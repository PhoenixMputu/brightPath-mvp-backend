import type { Request, Response, NextFunction } from 'express';
import { provinceService } from '../services/province.service';
import { logger } from '../config/logger';
import { provinceQuerySchema } from '../types/province';

export class ProvinceController {
  /**
   * Create a new province
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const province = await provinceService.createProvince(req.body);
      return res.status(201).json({
        data: province,
      });
    } catch (error: any) {
      logger.error('Create province error:', error);
      if (error.message === 'Province with this name already exists') {
        return res.status(409).json({
          error: {
            message: error.message,
          },
        });
      }
      next(error);
    }
  }

  /**
   * Get all provinces
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = provinceQuerySchema.parse(req.query);
      const { data, meta } = await provinceService.getAllProvinces(query);
      return res.status(200).json({
        data,
        meta,
      });
    } catch (error) {
      logger.error('Get all provinces error:', error);
      next(error);
    }
  }
}

export const provinceController = new ProvinceController();
