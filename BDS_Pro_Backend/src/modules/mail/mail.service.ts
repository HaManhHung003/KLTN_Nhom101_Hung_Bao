import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const mailHost = this.config.get<string>('mail.host');
    const mailPort = this.config.get<number>('mail.port');
    const mailUser = this.config.get<string>('mail.user');
    const mailPass = this.config.get<string>('mail.password');

    this.transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailPort === 465, // true cho port 465, false cho 587
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    });
  }

  /**
   * Gửi mã OTP xác thực tài khoản đến email người dùng.
   */
  async sendOtpEmail(to: string, name: string, otp: string): Promise<void> {
    const from = this.config.get<string>('mail.from') ?? 'BDS Pro <noreply@bdspro.vn>';

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Xác thực tài khoản BDS Pro</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#059669,#047857);padding:32px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 20px;">
                <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:1px;">🏠 BDS Pro</span>
              </div>
              <p style="color:rgba(255,255,255,0.9);margin:12px 0 0;font-size:15px;">Nền tảng Bất động sản Thông minh</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;font-weight:700;">Xác thực Email của bạn</h2>
              <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
                Xin chào <strong style="color:#0f172a;">${name}</strong>,<br/>
                Vui lòng sử dụng mã OTP dưới đây để hoàn tất đăng ký tài khoản BDS Pro. Mã có hiệu lực trong <strong>5 phút</strong>.
              </p>
              <!-- OTP Box -->
              <div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:2px solid #6ee7b7;border-radius:16px;padding:28px;text-align:center;margin:0 0 28px;">
                <p style="margin:0 0 8px;font-size:13px;color:#065f46;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Mã xác thực OTP của bạn</p>
                <div style="font-size:48px;font-weight:900;color:#047857;letter-spacing:12px;font-family:'Courier New',monospace;line-height:1;">
                  ${otp}
                </div>
                <p style="margin:12px 0 0;font-size:12px;color:#6b7280;">Mã hết hạn sau 5 phút · Không chia sẻ mã này cho bất kỳ ai</p>
              </div>
              <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">
                Nếu bạn không yêu cầu tạo tài khoản, hãy bỏ qua email này. Tài khoản của bạn sẽ không được tạo nếu không nhập mã OTP.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                © 2026 BDS Pro · Nền tảng Bất động sản Thông minh Việt Nam<br/>
                Email này được gửi tự động, vui lòng không trả lời.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: `[BDS Pro] Mã xác thực OTP: ${otp}`,
        html,
      });
      this.logger.log(`✅ OTP email sent to ${to}`);
    } catch (err) {
      this.logger.error(`❌ Failed to send OTP email to ${to}: ${err.message}`);
      throw err;
    }
  }
}
