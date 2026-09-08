// =============================================================================
// Helper: Email Notification Dispatcher (Gmail SMTP / Resend / SendGrid)
// =============================================================================

import nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<{ success: boolean; provider?: string; error?: string }> {
  // 1. Try Gmail SMTP if configured (using Google App Password)
  const gmailUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser.trim(),
          pass: gmailPass.replace(/\s+/g, ''), // Strip spaces from Google 16-char App Password
        },
      });

      const info = await transporter.sendMail({
        from: `"Dubros B2B" <${gmailUser.trim()}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ''),
      });

      console.log('[Mailer] Email sent via Gmail SMTP:', info.messageId);
      return { success: true, provider: 'gmail' };
    } catch (err: any) {
      console.error('[Mailer] Gmail SMTP send failed:', err);
    }
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const sendgridApiKey = process.env.SENDGRID_API_KEY;

  // 1. Try Resend if configured
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'Dubros Notificaciones <onboarding@resend.dev>',
          to: [to],
          subject,
          html,
          text: text || html.replace(/<[^>]+>/g, ''),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        return { success: true, provider: 'resend' };
      }
      console.warn('[Mailer] Resend error:', data);
    } catch (err: any) {
      console.error('[Mailer] Resend fetch failed:', err);
    }
  }

  // 2. Try SendGrid if configured
  if (sendgridApiKey) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sendgridApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: {
            email: process.env.SENDGRID_FROM || 'dubroswix@gmail.com',
            name: 'Dubros Sistema',
          },
          subject,
          content: [
            {
              type: 'text/html',
              value: html,
            },
          ],
        }),
      });

      if (res.ok || res.status === 202) {
        return { success: true, provider: 'sendgrid' };
      }
      const errText = await res.text();
      console.warn('[Mailer] SendGrid error:', errText);
    } catch (err: any) {
      console.error('[Mailer] SendGrid fetch failed:', err);
    }
  }

  // Fallback: Neither key configured or failed
  console.log(`[Mailer Fallback] Simulated email to ${to}: "${subject}"`);
  return {
    success: false,
    error: 'No se ha configurado RESEND_API_KEY ni SENDGRID_API_KEY en las variables de entorno.',
  };
}
