import { notificationService } from '@/services';
import { Request, Response } from 'express';
import { z } from 'zod';

const sendNotificationSchema = z.object({
  email: z.string().nonempty().email(),
  recipientName: z.string().nonempty(),
  subject: z.string().nonempty(),
  message: z.string().nonempty(),
  senderName: z.string().nonempty(),
});

export class NotificationController {
  public sendNotification = async (req: Request, res: Response) => {
    try {
      const { email, recipientName, subject, message, senderName } = sendNotificationSchema.parse(req.body);

      const success = await notificationService.sendNotification(
        email,
        recipientName,
        subject,
        message,
        senderName
      );

      if (success) {
        return res.json({
          success: true,
          message: `Notification sent successfully to ${email}`,
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'Failed to send notification',
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
} 