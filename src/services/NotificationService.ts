import { NotificationEmailTemplate } from '@/emails/NotificationEmailTemplate';
import { NotificationLogModel } from '@/models/NotificationLogModel';
import { NotificationLogRepository } from '@/repositories/NotificationLogRepository';
import { logger } from '@/utils/Logger';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from './EmailService';

export class NotificationService {
  private emailService: EmailService;
  private notificationLogRepository: NotificationLogRepository;

  constructor(emailService: EmailService, notificationLogRepository: NotificationLogRepository) {
    this.emailService = emailService;
    this.notificationLogRepository = notificationLogRepository;
  }

  /**
   * Send a notification email to a recipient
   * @param recipientEmail - The email address of the recipient
   * @param recipientName - The name of the recipient
   * @param subject - The subject of the notification
   * @param message - The message content of the notification
   * @param senderName - The name of the sender
   * @returns Promise<boolean> - Returns true if email is sent successfully, false otherwise
   */
  async sendNotification(
    recipientEmail: string,
    recipientName: string,
    subject: string,
    message: string,
    senderName: string
  ): Promise<boolean> {
    const logId = uuidv4();
    try {
      logger.info({
        msg: 'Sending notification email',
        recipientEmail,
        recipientName,
        subject,
        senderName,
        logId
      });

      const template = new NotificationEmailTemplate(subject, message, senderName, recipientName);
      await this.emailService.send(template, recipientEmail);

      // Create notification log
      const notificationLog = new NotificationLogModel(
        logId,
        this.emailService.getSenderEmail(),
        senderName,
        recipientEmail,
        recipientName,
        subject,
        message,
        'SUCCESS',
        null
      );

      await this.notificationLogRepository.create(notificationLog);

      logger.info({
        msg: 'Notification email sent successfully',
        logId,
        recipientEmail
      });

      return true;
    } catch (error) {
      logger.error({
        msg: 'Failed to send notification',
        error,
        recipientEmail,
        logId
      });

      // Create error log
      const notificationLog = new NotificationLogModel(
        logId,
        this.emailService.getSenderEmail(),
        senderName,
        recipientEmail,
        recipientName,
        subject,
        message,
        'ERROR',
        error instanceof Error ? error.message : 'Unknown error'
      );

      await this.notificationLogRepository.create(notificationLog);

      return false;
    }
  }
} 