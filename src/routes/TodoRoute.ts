import { Router } from 'express';
import { todoController } from 'src/controllers';
import {
  paramsTodoValidate,
  bodyTodoValidate,
  fullTodoValidate,
} from 'src/validations/TodoValidation';

const todoRouter = Router();

todoRouter.get('/todo/list', todoController.list);

todoRouter.post(
  '/:teamId/todo/create',
  bodyTodoValidate,
  todoController.create
);

todoRouter.get('/todo/:id', paramsTodoValidate, todoController.read);

todoRouter.delete('/todo/:id', paramsTodoValidate, todoController.delete);

todoRouter.put('/todo/:id', fullTodoValidate, todoController.update);

export { todoRouter };
