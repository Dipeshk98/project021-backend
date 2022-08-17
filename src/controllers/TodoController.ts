import { ApiError } from '@/error/ApiError';
import { ErrorCode } from '@/error/ErrorCode';
import { Todo } from '@/models/Todo';
import type { TodoRepository } from '@/repositories/TodoRepository';
import type { UserRepository } from '@/repositories/UserRepository';
import type { ParamsTeamIdHandler } from '@/validations/TeamValidation';
import type {
  BodyTodoHandler,
  FullTodoHandler,
  ParamsTodoHandler,
} from '@/validations/TodoValidation';

export class TodoController {
  private todoRepository: TodoRepository;

  private userRepository: UserRepository;

  constructor(todoRepository: TodoRepository, userRepository: UserRepository) {
    this.todoRepository = todoRepository;
    this.userRepository = userRepository;
  }

  public list: ParamsTeamIdHandler = async (req, res) => {
    await this.userRepository.findAndVerifyTeam(
      req.currentUserId,
      req.params.teamId
    );

    const list = await this.todoRepository.findAllByUserId(req.params.teamId);

    res.json({
      list: list.map((elt) => ({
        id: elt.id,
        title: elt.getTitle(),
      })),
    });
  };

  public create: BodyTodoHandler = async (req, res) => {
    await this.userRepository.findAndVerifyTeam(
      req.currentUserId,
      req.params.teamId
    );

    const todo = new Todo(req.params.teamId);
    todo.setTitle(req.body.title);
    await this.todoRepository.save(todo);

    res.json({
      id: todo.id,
      title: todo.getTitle(),
    });
  };

  public read: ParamsTodoHandler = async (req, res) => {
    await this.userRepository.findAndVerifyTeam(
      req.currentUserId,
      req.params.teamId
    );

    const todo = await this.todoRepository.findByKeys(
      req.params.teamId,
      req.params.id
    );

    if (!todo) {
      throw new ApiError('Incorrect TodoId', null, ErrorCode.INCORRECT_TODO_ID);
    }

    res.json({
      id: todo.id,
      title: todo.getTitle(),
    });
  };

  public delete: ParamsTodoHandler = async (req, res) => {
    await this.userRepository.findAndVerifyTeam(
      req.currentUserId,
      req.params.teamId
    );

    const success = await this.todoRepository.deleteByKeys(
      req.params.teamId,
      req.params.id
    );

    if (!success) {
      throw new ApiError('Incorrect TodoId', null, ErrorCode.INCORRECT_TODO_ID);
    }

    res.json({
      success: true,
    });
  };

  public update: FullTodoHandler = async (req, res) => {
    await this.userRepository.findAndVerifyTeam(
      req.currentUserId,
      req.params.teamId
    );

    const todo = new Todo(req.params.teamId, req.params.id);
    todo.setTitle(req.body.title);
    const success = await this.todoRepository.update(todo);

    if (!success) {
      throw new ApiError('Incorrect TodoId', null, ErrorCode.INCORRECT_TODO_ID);
    }

    res.json({
      id: todo.id,
      title: todo.getTitle(),
    });
  };
}
