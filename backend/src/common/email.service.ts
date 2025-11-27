import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: this.configService.get('EMAIL_SERVICE') || 'gmail',
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `motelapp://reset-password?token=${resetToken}`;
    const emailFrom = this.configService.get('EMAIL_FROM') || this.configService.get('EMAIL_USER');

    try {
      await this.transporter.sendMail({
        from: emailFrom,
        to: email,
        subject: 'Đặt lại mật khẩu - Motel App',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background-color: #B85C5C;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
              }
              .content {
                background-color: #f9f9f9;
                padding: 30px;
                border: 1px solid #ddd;
              }
              .button {
                display: inline-block;
                padding: 12px 30px;
                background-color: #B85C5C;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                font-size: 12px;
                color: #888;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
              }
              .warning {
                background-color: #fff3cd;
                border: 1px solid #ffc107;
                padding: 15px;
                border-radius: 5px;
                margin: 15px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏠 Motel App</h1>
              </div>
              <div class="content">
                <h2>Yêu cầu đặt lại mật khẩu</h2>
                <p>Xin chào,</p>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
                </div>
                <p>Hoặc copy link sau vào trình duyệt:</p>
                <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 3px;">
                  ${resetUrl}
                </p>
                <div class="warning">
                  <strong>⚠️ Chú ý:</strong>
                  <ul>
                    <li>Link này sẽ hết hạn sau <strong>1 giờ</strong></li>
                    <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                  </ul>
                </div>
              </div>
              <div class="footer">
                <p>Email này được gửi tự động từ Motel App</p>
                <p>© 2025 Motel App. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`Password reset email sent to: ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendOTPEmail(email: string, otp: string) {
    const emailFrom = this.configService.get('EMAIL_FROM') || this.configService.get('EMAIL_USER');

    try {
      await this.transporter.sendMail({
        from: emailFrom,
        to: email,
        subject: 'Xác thực email - Motel App',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background-color: #B85C5C;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
              }
              .content {
                background-color: #f9f9f9;
                padding: 30px;
                border: 1px solid #ddd;
              }
              .otp-code {
                background-color: #FAF7F0;
                border: 2px solid #B85C5C;
                padding: 20px;
                text-align: center;
                border-radius: 8px;
                margin: 20px 0;
              }
              .otp-digits {
                font-size: 32px;
                font-weight: bold;
                color: #B85C5C;
                letter-spacing: 8px;
                font-family: monospace;
              }
              .footer {
                text-align: center;
                font-size: 12px;
                color: #888;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
              }
              .warning {
                background-color: #fff3cd;
                border: 1px solid #ffc107;
                padding: 15px;
                border-radius: 5px;
                margin: 15px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏠 Motel App</h1>
              </div>
              <div class="content">
                <h2>Xác thực email đăng ký</h2>
                <p>Xin chào,</p>
                <p>Cảm ơn bạn đã đăng ký tài khoản Motel App!</p>
                <p>Đây là mã OTP để xác thực email của bạn:</p>
                
                <div class="otp-code">
                  <div class="otp-digits">${otp}</div>
                </div>

                <p style="text-align: center; color: #666; font-size: 14px;">
                  Nhập mã này vào ứng dụng để hoàn tất đăng ký
                </p>

                <div class="warning">
                  <strong>⚠️ Lưu ý:</strong>
                  <ul>
                    <li>Mã OTP này sẽ hết hạn sau <strong>5 phút</strong></li>
                    <li>Không chia sẻ mã này vớibất kỳ ai</li>
                    <li>Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này</li>
                  </ul>
                </div>
              </div>
              <div class="footer">
                <p>Email này được gửi tự động từ Motel App</p>
                <p>© 2025 Motel App. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`OTP email sent to: ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw error;
    }
  }
}
