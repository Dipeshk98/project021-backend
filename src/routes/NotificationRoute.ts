import { Router } from 'express';
import { NotificationController } from '@/controllers/NotificationController';

const notificationRouter = Router();
const notificationController = new NotificationController();

notificationRouter.post('/notifications/send', notificationController.sendNotification);

export { notificationRouter }; 