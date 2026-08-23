import { prisma } from '../lib/prisma';
import type { CreateProvinceInput } from '../types/province';

export class ProvinceService {
  /**
   * Create a new province
   * @param data Province data
   * @returns Created province
   */
  async createProvince(data: CreateProvinceInput) {
    // Check if province already exists
    const existingProvince = await prisma.province.findUnique({
      where: { name: data.name },
    });

    if (existingProvince) {
      throw new Error('Province with this name already exists');
    }

    return await prisma.province.create({
      data: {
        name: data.name,
      },
    });
  }

  /**
   * Get all provinces
   * @returns List of provinces
   */
  async getAllProvinces() {
    return await prisma.province.findMany({
      orderBy: { name: 'asc' },
    });
  }
}

export const provinceService = new ProvinceService();
