import { Router } from 'express';

import { userController } from '@/controllers';
import {
  bodyEmailValidate,
  paramsEmailValidate,
} from '@/validations/UserValidation';

const userRouter = Router();

// Temporary middleware to set currentUserId for testing purposes
userRouter.use((req, res, next) => {
  req.currentUserId = 'USR001'; // Replace with a valid userId from your database
  next();
});

userRouter.get('/user/profile', paramsEmailValidate, userController.getProfile);

userRouter.put(
  '/user/email-update',
  bodyEmailValidate,
  userController.updateEmail
);

export { userRouter };
