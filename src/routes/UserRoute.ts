import { Router } from 'express';
import { userController } from 'src/controllers';
import { paramsEmailValidate } from 'src/validations/UserValidation';

const userRouter = Router();

userRouter.get('/user/profile', paramsEmailValidate, userController.getProfile);

// For illustration purpose, you can implement a `/user/settings` endpoint
// userRouter.get('/user/settings');

export { userRouter };
