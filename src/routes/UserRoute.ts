import { Router } from 'express';
import { userController } from 'src/controllers';
import { paramsEmailValidate } from 'src/validations/UserValidation';

const userRouter = Router();

userRouter.get('/user/profile', paramsEmailValidate, userController.getProfile);

userRouter.get('/user/settings', userController.getSettings);

export { userRouter };
