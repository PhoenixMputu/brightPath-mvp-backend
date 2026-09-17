import { prisma } from '../lib/prisma';
import type { CreateProvinceInput, ProvinceQuery } from '../types/province';

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
   * Get all provinces with filtering, pagination and sorting
   * @param query Query parameters
   * @returns List of provinces and metadata
   */
  async getAllProvinces(query: ProvinceQuery = {}) {
    const { search, page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const [provinces, total] = await Promise.all([
      prisma.province.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.province.count({ where }),
    ]);

    return {
      data: provinces,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const provinceService = new ProvinceService();
