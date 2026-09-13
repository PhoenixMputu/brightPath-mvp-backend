import { z } from 'zod';

export const createSchoolSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(255, 'Name must be at most 255 characters long'),
  province_id: z.string().uuid('Invalid province ID format'),
  city: z.string().min(2, 'City must be at least 2 characters long').max(255, 'City must be at most 255 characters long'),
  governor: z.string().min(2, 'Governor name must be at least 2 characters long').max(255, 'Governor name must be at most 255 characters long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  phone: z.string().min(5, 'Phone number must be at least 5 characters long').max(20, 'Phone number must be at most 20 characters long'),
  address: z.string().min(5, 'Address must be at least 5 characters long').max(500, 'Address must be at most 500 characters long'),
});

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 characters long'),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
