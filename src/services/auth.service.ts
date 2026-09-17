import { randomInt } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { redisClient } from '../lib/redis';
import { logger } from '../config/logger';
import { emailService } from './email.service';
import { schoolService } from './school.service';
import type { CreateSchoolInput, VerifyOtpInput } from '../types/school';

export class AuthService {
  private OTP_EXPIRY = 30; // 30 seconds

  /**
   * Register a school and send OTP
   */
  async signup(data: CreateSchoolInput) {
    // 1. Hash password
    const hashedPassword = await Bun.password.hash(data.password);

    // 2. Create school in pending status
    const school = await schoolService.createSchool({
      ...data,
      password: hashedPassword,
    });

    // 3. Generate OTP
    const otp = this.generateOtp();

    // 3. Store OTP in Redis
    const redisKey = `otp:${school.email}`;
    await redisClient.set(redisKey, otp, 'EX', this.OTP_EXPIRY);
    logger.info(`OTP generated for ${school.email}: ${otp}`);

    // 4. Send OTP Email
    // In a real scenario, we might want to handle email failure gracefully
    // but here we trigger it immediately as requested.
    await emailService.sendOtpEmail(school.email, otp);

    return school;
  }

  /**
   * Verify OTP and update school status
   */
  async verifyOtp(data: VerifyOtpInput) {
    const { email, otp } = data;
    const redisKey = `otp:${email}`;

    // 1. Get OTP from Redis
    const storedOtp = await redisClient.get(redisKey);

    // 2. Validate OTP
    if (!storedOtp) {
      throw new Error('OTP expired or not found');
    }

    if (storedOtp !== otp) {
      throw new Error('Invalid OTP');
    }

    // 3. Update school status to confirmed
    const school = await schoolService.updateStatus(email, 'confirmed');

    // 4. Delete OTP from Redis after successful verification
    await redisClient.del(redisKey);

    // 5. Generate tokens
    const accessToken = this.generateAccessToken({ id: school.id, email: school.email });
    const refreshToken = this.generateRefreshToken({ id: school.id, email: school.email });

    return { school, accessToken, refreshToken };
  }

  /**
   * Refresh tokens
   */
  async refreshTokens(token: string) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string; email: string };
      
      // Generate new tokens (Rotation)
      const accessToken = this.generateAccessToken({ id: payload.id, email: payload.email });
      const refreshToken = this.generateRefreshToken({ id: payload.id, email: payload.email });

      return { accessToken, refreshToken };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Verify Access Token
   */
  verifyAccessToken(token: string) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { id: string; email: string };
  }

  /**
   * Generate Access Token
   */
  generateAccessToken(payload: { id: string; email: string }) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as any,
    });
  }

  /**
   * Generate Refresh Token
   */
  generateRefreshToken(payload: { id: string; email: string }) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d') as any,
    });
  }

  /**
   * Generate a random 6-digit OTP
   */
  private generateOtp(): string {
    return randomInt(100000, 1000000).toString();
  }
}

export const authService = new AuthService();
