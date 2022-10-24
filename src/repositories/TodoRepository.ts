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

  async save(model: TodoModel) {
    await this.dbClient.todo.upsert({
      create: model.toEntity(),
      update: model.toEntity(),
      where: {
        id: model.id,
      },
    });
  }

  delete(model: TodoModel) {
    return this.dbClient.todo.delete({
      where: {
        id: model.id,
      },
    });
  }

  update(model: TodoModel) {
    return this.dbClient.todo.update({
      data: model.toEntity(),
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
