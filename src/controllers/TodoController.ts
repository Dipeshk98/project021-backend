import { ApiError } from 'src/error/ApiError';
import { ErrorCode } from 'src/error/ErrorCode';
import { Todo } from 'src/models/Todo';
import { TodoService } from 'src/services/TodoService';
import { UserService } from 'src/services/UserService';
import {
  ParamsTodoHandler,
  BodyTodoHandler,
  FullTodoHandler,
  ParamsTeamIdHandler,
} from 'src/validations/TodoValidation';

export class TodoController {
  private todoService: TodoService;

  private userService: UserService;

  constructor(todoService: TodoService, userService: UserService) {
    this.todoService = todoService;
    this.userService = userService;
  }

  public list: ParamsTeamIdHandler = async (req, res) => {
    const user = await this.userService.findByUserId(req.currentUserId);

    if (!user) {
      throw new ApiError("User ID doesn't exist");
    }

    if (!user.isTeamMember(req.params.teamId)) {
      throw new ApiError(
        "User isn't a team member",
        null,
        ErrorCode.NOT_TEAM_MEMBER
      );
    }

    const list = await this.todoService.findAllByUserId(req.params.teamId);

    res.json({
      list: list.map((elt) => ({
        id: elt.id,
        title: elt.getTitle(),
      })),
    });
  };

  public create: BodyTodoHandler = async (req, res) => {
    const user = await this.userService.findByUserId(req.currentUserId);

    if (!user) {
      throw new ApiError("User ID doesn't exist");
    }

    if (!user.isTeamMember(req.params.teamId)) {
      throw new ApiError(
        "User isn't a team member",
        null,
        ErrorCode.NOT_TEAM_MEMBER
      );
    }

    const todo = new Todo(req.params.teamId);
    todo.setTitle(req.body.title);
    await this.todoService.save(todo);

    res.json({
      id: todo.id,
      title: todo.getTitle(),
    });
  };

  public read: ParamsTodoHandler = async (req, res) => {
    const user = await this.userService.findByUserId(req.currentUserId);

    if (!user) {
      throw new ApiError("User ID doesn't exist");
    }

    if (!user.isTeamMember(req.params.teamId)) {
      throw new ApiError(
        "User isn't a team member",
        null,
        ErrorCode.NOT_TEAM_MEMBER
      );
    }

    const todo = await this.todoService.findByKeys(
      req.params.teamId,
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
    const user = await this.userService.findByUserId(req.currentUserId);

    if (!user) {
      throw new ApiError("User ID doesn't exist");
    }

    if (!user.isTeamMember(req.params.teamId)) {
      throw new ApiError(
        "User isn't a team member",
        null,
        ErrorCode.NOT_TEAM_MEMBER
      );
    }

    const success = await this.todoService.delete(
      req.params.teamId,
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
    const user = await this.userService.findByUserId(req.currentUserId);

    if (!user) {
      throw new ApiError("User ID doesn't exist");
    }

    if (!user.isTeamMember(req.params.teamId)) {
      throw new ApiError(
        "User isn't a team member",
        null,
        ErrorCode.NOT_TEAM_MEMBER
      );
    }

    const todo = new Todo(req.params.teamId, req.params.id);
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
