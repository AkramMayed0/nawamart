const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const hasCredentials = process.env.SMTP_USER && process.env.SMTP_PASS
    && process.env.SMTP_USER !== 'your_email@gmail.com'
    && process.env.SMTP_PASS !== 'your_app_password';

  if (hasCredentials) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

/**
 * Send password reset email.
 * Returns { sent: boolean, resetLink: string }
 */
const sendPasswordResetEmail = async ({ to, name, resetLink }) => {
  const smtp = getTransporter();

  // Log the link to console in dev regardless
  console.log('\n========================================');
  console.log('[DEV] Password Reset Link');
  console.log('To:', to, `(${name})`);
  console.log('Link:', resetLink);
  console.log('========================================\n');

  // No SMTP configured — return link for dev UI
  if (!smtp) {
    return { sent: false, resetLink };
  }

  const fromName = process.env.EMAIL_FROM_NAME || 'نوامارت';
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: 'إعادة تعيين كلمة المرور — نوامارت',
    html: `
      <div dir="rtl" style="font-family: 'Cairo', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0D1B2A; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">نوامارت</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #0D1B2A; font-size: 20px; margin-top: 0;">إعادة تعيين كلمة المرور</h2>
          <p style="color: #555; line-height: 1.8; font-size: 15px;">مرحباً ${name}،</p>
          <p style="color: #555; line-height: 1.8; font-size: 15px;">لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في نوامارت. يمكنك إعادة تعيين كلمة المرور بالنقر على الرابط أدناه:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetLink}" style="background-color: #DC2626; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">إعادة تعيين كلمة المرور</a>
          </div>
          <p style="color: #555; line-height: 1.8; font-size: 15px;">إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.</p>
          <p style="color: #555; line-height: 1.8; font-size: 15px;">هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} نوامارت — منصة التجارة الإلكترونية اليمنية</p>
        </div>
      </div>
    `,
  };

  try {
    await smtp.sendMail(mailOptions);
    return { sent: true };
  } catch (error) {
    console.error('[Email] Failed to send password reset email:', error.message);
    // In dev, return the link anyway so the UI can show it
    if (process.env.NODE_ENV !== 'production') {
      return { sent: false, resetLink };
    }
    throw new Error('فشل إرسال بريد إعادة تعيين كلمة المرور');
  }
};

module.exports = { sendPasswordResetEmail, getTransporter };
