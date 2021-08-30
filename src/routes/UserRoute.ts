import { Router } from 'express';
import { userController } from 'src/controllers';

const userRouter = Router();

userRouter.get('/user/profile', userController.getProfile);

userRouter.get('/user/settings', userController.getSettings);

export { userRouter };
