import { Router } from 'express';

import { userController } from '@/controllers';
import { authenticate } from '@/middlewares/authMiddleware';

const userRouter = Router();
export { userRouter };
userRouter.post('/users', userController.createUser);
userRouter.get('/users/permissions',authenticate, userController.getUserPermissions);
userRouter.get('/users/:id', userController.getUserById);
userRouter.put('/users/:id', userController.updateUserById);
userRouter.delete('/users/:id', userController.deleteUserById);
userRouter.get('/users', userController.getAllUsers);
userRouter.post('/users/cognito-register', userController.registerUserFromCognito);
