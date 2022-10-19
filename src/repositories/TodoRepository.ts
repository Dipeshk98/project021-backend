import { TodoModel } from '@/models/Todo';

import { AbstractRepository } from './AbstractRepository';

export class TodoRepository extends AbstractRepository {
  async get(model: TodoModel) {
    const entity = await this.dbClient.todo.findUnique({
      where: {
        id: model.id,
      },
    });

    if (!entity) {
      return null;
    }

    model.fromEntity(entity);
    return model;
  }

  delete(model: TodoModel) {
    return this.dbClient.todo.delete({
      where: {
        id: model.id,
      },
    });
  }

  findByKeys(userId: string, id: string) {
    const todo = new TodoModel(userId, id);

    return this.get(todo);
  }

  deleteByKeys(userId: string, id: string) {
    const todo = new TodoModel(userId, id);

    return this.delete(todo);
  }

  async findAllByUserId(userId: string) {
    const list = await this.dbClient.todo.findMany({
      where: {
        ownerId: userId,
      },
    });

    return list.map((elt) => {
      const todo = new TodoModel(userId, elt.id);
      todo.fromEntity(elt);
      return todo;
    });
  }
}
