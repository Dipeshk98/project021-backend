import { Router } from 'express';

import { I9userController } from '@/controllers';
import { authenticate } from '@/middlewares/authMiddleware';

const I9userRouter = Router();
export { I9userRouter };
I9userRouter.use(authenticate);

I9userRouter.post('/i9/send-email/:id', I9userController.sendI9Email);
I9userRouter.post('/i9-users', I9userController.createI9User);
I9userRouter.post('/i9/documents', I9userController.createI9Document);
I9userRouter.post(
  '/i9/employer-section',
  I9userController.createI9EmployerSection
);
I9userRouter.post(
  '/i9/reverification',
  I9userController.createI9Reverification
);

I9userRouter.get('/i9-users', I9userController.getAllI9Users);