import type { Request, Response, NextFunction } from 'express';
import { provinceService } from '../services/province.service';

export class ProvinceController {
  /**
   * Create a new province
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const province = await provinceService.createProvince(req.body);
      return res.status(201).json({
        data: province,
      });
    } catch (error: any) {
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
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const provinces = await provinceService.getAllProvinces();
      return res.status(200).json({
        data: provinces,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const provinceController = new ProvinceController();
