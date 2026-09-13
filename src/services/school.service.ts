import { prisma } from '../lib/prisma';
import type { CreateSchoolInput } from '../types/school';

export class SchoolService {
  /**
   * Create a new school
   * @param data School data
   * @returns Created school
   */
  async createSchool(data: CreateSchoolInput) {
    // Check if province exists
    const province = await prisma.province.findUnique({
      where: { id: data.province_id },
    });

    if (!province) {
      throw new Error('Province not found');
    }

    // Check if school with this email already exists
    const existingSchool = await prisma.school.findUnique({
      where: { email: data.email },
    });

    if (existingSchool) {
      throw new Error('Email already registered');
    }

    // Create the school
    return await prisma.school.create({
      data: {
        name: data.name,
        provinceId: data.province_id,
        city: data.city,
        governor: data.governor,
        email: data.email,
        password: data.password,
        phone: data.phone,
        address: data.address,
      },
      include: {
        province: true,
      }
    });
  }

  /**
   * Update school status
   * @param email School email
   * @param status New status
   * @returns Updated school
   */
  async updateStatus(email: string, status: string) {
    const school = await prisma.school.findUnique({
      where: { email },
    });

    if (!school) {
      throw new Error('School not found');
    }

    return await prisma.school.update({
      where: { email },
      data: { status },
      include: {
        province: true,
      }
    });
  }
}

export const schoolService = new SchoolService();
