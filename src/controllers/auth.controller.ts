import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { logger } from '../config/logger';

export class AuthController {
  /**
   * Register a new school (signup)
   */
  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const school = await authService.signup(req.body);
      return res.status(201).json({
        message: 'School registered successfully. Please verify your email with the OTP sent.',
        data: {
          id: school.id,
          email: school.email,
          status: school.status,
        },
      });
    } catch (error: any) {
      logger.error('Signup error:', error);
      
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

  /**
   * Verify OTP
   */
  verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { school, accessToken, refreshToken } = await authService.verifyOtp(req.body);

      this.setTokenCookies(res, accessToken, refreshToken);

      return res.status(200).json({
        message: 'Email verified successfully. School status updated to confirmed.',
        data: {
          id: school.id,
          email: school.email,
          status: school.status,
        },
      });
    } catch (error: any) {
      logger.error('OTP Verification error:', error);

      if (error.message === 'OTP expired or not found' || error.message === 'Invalid OTP') {
        return res.status(400).json({
          error: {
            message: error.message,
          },
        });
      }

      if (error.message === 'School not found') {
        return res.status(404).json({
          error: {
            message: error.message,
          },
        });
      }

      next(error);
    }
  }

  /**
   * Refresh Tokens (Silent Refresh)
   */
  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const oldRefreshToken = req.cookies.refresh_token;

      if (!oldRefreshToken) {
        return res.status(401).json({
          error: {
            message: 'Refresh token missing',
          },
        });
      }

      const { accessToken, refreshToken } = await authService.refreshTokens(oldRefreshToken);

      this.setTokenCookies(res, accessToken, refreshToken);

      return res.status(200).json({
        message: 'Tokens refreshed successfully',
      });
    } catch (error: any) {
      logger.error('Refresh error:', error);
      return res.status(401).json({
        error: {
          message: 'Invalid or expired refresh token',
        },
      });
    }
  }

  /**
   * Helper to set HttpOnly cookies for tokens
   */
  private setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}

export const authController = new AuthController();
