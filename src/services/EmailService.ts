import type { SESClientConfig } from '@aws-sdk/client-ses';
import * as AWS from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';

import type { AbstractEmailTemplate } from '@/emails/AbstractEmailTemplate';
import { Env } from '@/utils/Env';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure AWS SES client with credentials from .env
    const sesOptions: SESClientConfig = {
      region: Env.getValue('AWS_REGION'),
      credentials: {
        accessKeyId: Env.getValue('AWS_ACCESS_KEY_ID'),
        secretAccessKey: Env.getValue('AWS_SECRET_ACCESS_KEY'),
      },
    };

    this.transporter = nodemailer.createTransport({
      SES: { ses: new AWS.SES(sesOptions), aws: AWS },
    });
  }

  send(template: AbstractEmailTemplate, email: string) {
    return this.transporter.sendMail({
      from: {
        name: Env.getValue('SITE_NAME'),
        address: Env.getValue('SENDER_EMAIL_ADDRESS'),
      },
      to: email,
      subject: template.buildSubject(),
      text: template.buildText(),
    });
  }

  /**
   * Send an email with a custom subject and body.
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param body - Email body content (plain text)
   * @returns {Promise<boolean>} - Returns true if email is sent, false otherwise
   */
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: {
          name: Env.getValue('SITE_NAME', false) || 'HR Team',
          address: Env.getValue('SENDER_EMAIL_ADDRESS'),
        },
        to,
        subject,
        text: body,
      });

      // console.log(`✅ Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      // console.error(`❌ Error sending email to ${to}:`, error);
      return false;
    }
  }

  /**
   * Get the sender email address configured for this service
   * @returns {string} The sender email address
   */
  getSenderEmail(): string {
    return Env.getValue('SENDER_EMAIL_ADDRESS');
  }
}
