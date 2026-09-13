import { Resend } from 'resend';
import { logger } from '../config/logger';

export class EmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 're_your_api_key_here') {
      logger.warn('RESEND_API_KEY is not configured or is using the default placeholder.');
    }
    this.resend = new Resend(apiKey);
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  }

  /**
   * Send an email using Resend
   * @param to Recipient email address
   * @param subject Email subject
   * @param html HTML content of the email
   * @returns Resend response data
   */
  async sendEmail(to: string, subject: string, html: string) {
    try {
      logger.info(`Sending email to ${to} with subject: ${subject}`);
      
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      if (error) {
        logger.error('Resend API error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      logger.info(`Email sent successfully. ID: ${data?.id}`);
      return data;
    } catch (error: any) {
      logger.error('Error in sendEmail service:', error);
      throw error;
    }
  }

  /**
   * Send OTP email to the school
   * @param to Recipient email address
   * @param otp The one-time password
   */
  async sendOtpEmail(to: string, otp: string) {
    const subject = 'Verify your school registration';
    const html = `
      <h1>School Registration Verification</h1>
      <p>Thank you for registering your school. Please use the following OTP to verify your account:</p>
      <h2 style="font-size: 24px; color: #4F46E5; letter-spacing: 2px;">${otp}</h2>
      <p>This OTP will expire in 30 seconds.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    return this.sendEmail(to, subject, html);
  }
}

export const emailService = new EmailService();
