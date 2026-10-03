import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { visitorName, visitorEmail, projectDetails, customHtml, customSubject } = req.body;

  if (!visitorEmail || !visitorName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4,
    auth: { user: gmailUser, pass: gmailPass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  const defaultHtml = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#080A12;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;border:1px solid rgba(0,229,255,0.3);border-radius:12px;padding:8px 20px;background:rgba(0,229,255,0.05);">
      <span style="font-size:18px;font-weight:900;letter-spacing:3px;color:#00E5FF;">ELYVORI</span>
    </div>
  </div>
  <div style="border:1px solid rgba(0,229,255,0.2);border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,rgba(0,229,255,0.1),rgba(213,0,249,0.08));padding:32px;text-align:center;">
      <div style="font-size:36px;margin-bottom:12px;">✅</div>
      <h1 style="font-size:20px;font-weight:800;color:#ffffff;margin:0 0 8px;">تم استلام طلبك بنجاح</h1>
      <p style="font-size:13px;color:#00E5FF;margin:0;">Elyvori Technologies — AI Platform</p>
    </div>
    <div style="background:#0D0F1A;padding:28px;">
      <p style="font-size:14px;color:#cbd5e1;line-height:1.8;margin:0 0 20px;">
        مرحباً <strong style="color:#ffffff;">${visitorName}</strong>،<br>
        تم استلام طلب مشروعك وسيصلك رابط المشروع قريباً.
      </p>
    </div>
  </div>
  <div style="text-align:center;padding:16px;margin-top:8px;">
    <div style="font-size:11px;color:#334155;">© 2026 Elyvori Technologies</div>
  </div>
</div>
</body></html>`;

  const emailSubject = customSubject || '✅ Your Elyvori project request has been received';
  const emailHtml = customHtml || defaultHtml;

  try {
    await transporter.sendMail({
      from: `ELYVORI <${gmailUser}>`,
      to: visitorEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    await transporter.sendMail({
      from: `ELYVORI <${gmailUser}>`,
      to: gmailUser,
      subject: `🌟 New project request from ${visitorName}`,
      text: `Name: ${visitorName}\nEmail: ${visitorEmail}\nDetails: ${projectDetails || 'N/A'}`,
      replyTo: visitorEmail,
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}
