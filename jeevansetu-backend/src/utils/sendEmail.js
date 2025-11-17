import nodemailer from "nodemailer";

const DEFAULT_FROM = "JeevanSetu <no-reply@jeevansetu.local>";

let transporter;
let lastSignature;

const getSmtpConfig = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  return {
    host: SMTP_HOST,
    port: SMTP_PORT ? Number(SMTP_PORT) : 587,
    user: SMTP_USER,
    pass: SMTP_PASS,
    from: SMTP_FROM || DEFAULT_FROM,
  };
};

const buildTransporter = async () => {
  const config = getSmtpConfig();
  const signature = JSON.stringify({
    host: config.host,
    port: config.port,
    user: config.user,
    pass: config.pass,
  });

  if (transporter && lastSignature === signature) {
    return transporter;
  }

  try {
    if (!config.host) {
      transporter = nodemailer.createTransport({ jsonTransport: true });
    } else {
      transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: config.user
          ? {
              user: config.user,
              pass: config.pass,
            }
          : undefined,
      });

      await transporter.verify();
    }

    lastSignature = signature;
    return transporter;
  } catch (err) {
    transporter = undefined;
    lastSignature = undefined;
    throw err;
  }
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    throw new Error("Recipient address is required to send email");
  }

  const activeTransporter = await buildTransporter();
  const { from } = getSmtpConfig();

  const info = await activeTransporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });

  if (activeTransporter.options.jsonTransport) {
    console.info("[Email simulated]", { to, subject, preview: info.message });
  }

  return info;
};

export const buildVerificationEmail = ({
  name,
  otp,
  expiresInMinutes = 10,
}) => {
  const safeName = name?.trim() ? name.trim() : "there";

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
      <div style="padding: 24px; border-radius: 18px; background: linear-gradient(135deg, rgba(225,29,72,0.12), rgba(244,114,182,0.16)); border: 1px solid rgba(225,29,72,0.2);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 54px; height: 54px; border-radius: 16px; background: linear-gradient(135deg, #dc2626, #fb7185); color: #fff; font-weight: 700; font-size: 24px; letter-spacing: -0.02em;">
            JS
          </div>
          <h2 style="margin: 16px 0 4px; font-size: 24px; font-weight: 700;">Verify your JeevanSetu account</h2>
          <p style="margin: 0; color: rgba(15,23,42,0.7); font-size: 14px;">Namaste ${safeName},</p>
        </div>

        <p style="margin: 0 0 16px; line-height: 1.6;">Thank you for joining JeevanSetu. Please enter the OTP below to confirm your email and activate your dashboard access.</p>

        <div style="background: #fff; border-radius: 14px; border: 1px dashed rgba(225,29,72,0.35); padding: 20px; text-align: center; margin-bottom: 20px;">
          <span style="display: inline-block; font-size: 30px; font-weight: 700; letter-spacing: 8px; color: #dc2626;">${otp}</span>
        </div>

        <p style="margin: 0 0 12px; line-height: 1.6;">This OTP expires in ${expiresInMinutes} minutes. If you didn’t request this, you can safely ignore the message.</p>

        <p style="margin: 0; line-height: 1.6;">With gratitude,<br /><strong>The JeevanSetu Team</strong></p>
      </div>
      <p style="margin: 16px 0 0; font-size: 12px; color: rgba(15,23,42,0.45); text-align: center;">This is an automated email. Please do not reply.</p>
    </div>
  `;

  const text = `Namaste ${safeName},

Thank you for joining JeevanSetu. Your verification code is ${otp}.
It expires in ${expiresInMinutes} minutes.

If you did not request this, please ignore the email.

The JeevanSetu Team`;

  return { html, text };
};

export const buildPasswordResetEmail = ({
  name,
  otp,
  expiresInMinutes = 10,
}) => {
  const safeName = name?.trim() ? name.trim() : "there";

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
      <div style="padding: 24px; border-radius: 18px; background: linear-gradient(135deg, rgba(59,130,246,0.12), rgba(14,165,233,0.16)); border: 1px solid rgba(59,130,246,0.2);">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 54px; height: 54px; border-radius: 16px; background: linear-gradient(135deg, #2563eb, #0ea5e9); color: #fff; font-weight: 700; font-size: 24px; letter-spacing: -0.02em;">
            JS
          </div>
          <h2 style="margin: 16px 0 4px; font-size: 24px; font-weight: 700;">Reset your JeevanSetu password</h2>
          <p style="margin: 0; color: rgba(15,23,42,0.7); font-size: 14px;">Namaste ${safeName},</p>
        </div>

        <p style="margin: 0 0 16px; line-height: 1.6;">Enter the one-time password below to verify your identity and choose a new password. For security, the code expires in ${expiresInMinutes} minutes.</p>

        <div style="background: #fff; border-radius: 14px; border: 1px dashed rgba(59,130,246,0.35); padding: 20px; text-align: center; margin-bottom: 20px;">
          <span style="display: inline-block; font-size: 30px; font-weight: 700; letter-spacing: 8px; color: #2563eb;">${otp}</span>
        </div>

        <p style="margin: 0 0 12px; line-height: 1.6;">If you didn’t request a password reset, you can safely ignore this email.</p>
      </div>
      <p style="margin: 16px 0 0; font-size: 12px; color: rgba(15,23,42,0.45); text-align: center;">This is an automated email. Please do not reply.</p>
    </div>
  `;

  const text = `Namaste ${safeName},

Use the following OTP to reset your JeevanSetu password (expires in ${expiresInMinutes} minutes): ${otp}

If you did not request this change, you can safely ignore this email.

The JeevanSetu Team`;

  return { html, text };
};

export default sendEmail;
