import nodemailer from 'nodemailer';

/**
 * Send an email notification.
 * @param {{ to: string, subject: string, html: string }} options
 * @returns {Promise<void>}
 */
export async function sendEmail({ to, subject, html }) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"EduMesh" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error('Email send error:', error.message);
    // Don't throw — email failures shouldn't break user flows
  }
}

/**
 * Send OTP email for password reset.
 * @param {string} email
 * @param {string} otp
 */
export async function sendOtpEmail(email, otp) {
  await sendEmail({
    to: email,
    subject: 'EduMesh — Password Reset OTP',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 32px;">
        <h2 style="color: #0f87e9;">Reset Your Password</h2>
        <p>Your one-time password is:</p>
        <div style="font-size: 32px; font-weight: bold; color: #0f87e9; letter-spacing: 8px; padding: 16px; background: #f0f7ff; border-radius: 8px; text-align: center;">
          ${otp}
        </div>
        <p style="color: #666; margin-top: 16px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">EduMesh — Decentralized Learning for Everyone</p>
      </div>
    `,
  });
}

/**
 * Send mentor match notification email.
 * @param {string} email
 * @param {{ studentName: string, subject: string }} matchData
 */
export async function sendMentorMatchEmail(email, matchData) {
  await sendEmail({
    to: email,
    subject: 'EduMesh — New Student Match',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 32px;">
        <h2 style="color: #0f87e9;">New Student Match!</h2>
        <p>A student needs your help with <strong>${matchData.subject}</strong>.</p>
        <p><strong>Student:</strong> ${matchData.studentName}</p>
        <p>Log in to EduMesh to accept the match.</p>
      </div>
    `,
  });
}
