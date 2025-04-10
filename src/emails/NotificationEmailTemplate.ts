import { AbstractEmailTemplate } from './AbstractEmailTemplate';

export class NotificationEmailTemplate extends AbstractEmailTemplate {
  private subject: string;
  private message: string;
  private senderName: string;
  private recipientName: string;

  constructor(subject: string, message: string, senderName: string, recipientName: string) {
    super();
    this.subject = subject;
    this.message = message;
    this.senderName = senderName;
    this.recipientName = recipientName;
  }

  public buildSubject(): string {
    return this.subject;
  }

  public buildText(): string {
    return `Dear ${this.recipientName},

${this.message}

Important Instructions:
1. Please complete your I-9 form as soon as possible
2. You will need to provide:
   - Valid identification documents (e.g., passport, driver's license)
   - Social Security Number (if applicable)
   - Work authorization documents (if applicable)
3. The form must be completed within 3 business days of your start date

If you have any questions or need assistance, please don't hesitate to contact the HR department.

Best regards,
${this.senderName}
HR Department`;
  }
} 