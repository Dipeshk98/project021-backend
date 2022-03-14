import { Router } from 'express';
import { userController } from 'src/controllers';
import {
  bodyEmailValidate,
  paramsEmailValidate,
} from 'src/validations/UserValidation';

const userRouter = Router();

userRouter.get('/user/profile', paramsEmailValidate, userController.getProfile);

userRouter.put(
  '/user/email-update',
  bodyEmailValidate,
  userController.updateEmail
);

export { userRouter };
