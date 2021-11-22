import { RequestHandler } from 'express';
import { ApiError } from 'src/error/ApiError';
import { ErrorCode } from 'src/error/ErrorCode';
import { Todo } from 'src/models/Todo';
import { TodoService } from 'src/services/TodoService';
import {
  ParamsTodoHandler,
  BodyTodoHandler,
  FullTodoHandler,
} from 'src/validations/TodoValidation';

export class TodoController {
  private todoService: TodoService;

  constructor(todoService: TodoService) {
    this.todoService = todoService;
  }

  public list: RequestHandler = async (req, res) => {
    const list = await this.todoService.findAllByUserId(req.currentUserId);

    res.json({
      list: list.map((elt) => ({
        id: elt.id,
        title: elt.getTitle(),
      })),
    });
  };

  public create: BodyTodoHandler = async (req, res) => {
    const todo = new Todo(req.currentUserId);
    todo.setTitle(req.body.title);
    await this.todoService.save(todo);

    res.json({
      id: todo.id,
      title: todo.getTitle(),
    });
  };

  public read: ParamsTodoHandler = async (req, res) => {
    const todo = await this.todoService.findByKeys(
      req.currentUserId,
      req.params.id
    );

    if (!todo) {
      throw new ApiError("Todo ID doesn't exist", null, ErrorCode.INCORRECT_ID);
    }

    res.json({
      id: todo.id,
      title: todo.getTitle(),
    });
  };

  public delete: ParamsTodoHandler = async (req, res) => {
    const success = await this.todoService.delete(
      req.currentUserId,
      req.params.id
    );

    if (!success) {
      throw new ApiError("Todo ID doesn't exist", null, ErrorCode.INCORRECT_ID);
    }

    res.json({
      success: true,
    });
  };

  public update: FullTodoHandler = async (req, res) => {
    const todo = new Todo(req.currentUserId, req.params.id);
    todo.setTitle(req.body.title);
    const success = await this.todoService.update(todo);

    if (!success) {
      throw new ApiError("Todo ID doesn't exist", null, ErrorCode.INCORRECT_ID);
    }

    res.json({
      id: todo.id,
      title: todo.getTitle(),
    });
  };
}
