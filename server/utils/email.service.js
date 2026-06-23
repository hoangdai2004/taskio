import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.MAIL_PORT || "587"),
    secure: process.env.MAIL_SECURE === "true",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
};

export const sendPasswordResetEmail = async (email, resetLink) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.MAIL_FROM || process.env.MAIL_USER || "noreply@taskio.app",
    to: email,
    subject: "Reset Your Password - Taskio",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #1e293b; margin-bottom: 16px;">Reset Your Password</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          You requested a password reset for your Taskio account. Click the button below to set a new password.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}" 
             style="background-color: #2563eb; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">
          If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #cbd5e1; font-size: 12px;">Taskio &copy; ${new Date().getFullYear()}</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export const sendPasswordResetCode = async (email, code) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.MAIL_FROM || process.env.MAIL_USER || "noreply@taskio.app",
    to: email,
    subject: "Reset Your Password - Taskio Verification Code",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e293b; margin-bottom: 16px; text-align: center;">Reset Your Password</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; text-align: center;">
          You requested a password reset for your Taskio account. Please use the verification code below to complete:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <span style="background-color: #f1f5f9; color: #2563eb; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 24px; letter-spacing: 4px; border: 1px dashed #cbd5e1; display: inline-block;">
            ${code}
          </span>
        </div>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; text-align: center;">
          This verification code is valid for 15 minutes. If you did not request this, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #cbd5e1; font-size: 12px; text-align: center;">Taskio &copy; ${new Date().getFullYear()}</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

