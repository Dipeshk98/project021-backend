import type { Todo } from '@prisma/client';
import { Prisma } from '@prisma/client';

import { TodoModel } from '@/models/Todo';

import { AbstractRepository } from './AbstractRepository';

export class TodoRepository extends AbstractRepository {
  async get(model: TodoModel) {
    const entity = await this.dbClient.todo.findUnique({
      where: model.keys(),
    });

    if (!entity) {
      return null;
    }

    model.fromEntity(entity);
    return model;
  }

  async save(model: TodoModel) {
    await this.dbClient.todo.upsert({
      create: model.toCreateEntity(),
      update: model.toEntity(),
      where: model.keys(),
    });
  }

  async delete(model: TodoModel) {
    let deleteResult: Todo | null = null;

    try {
      deleteResult = await this.dbClient.todo.delete({
        where: model.keys(),
      });
    } catch (ex: any) {
      if (
        !(ex instanceof Prisma.PrismaClientKnownRequestError) ||
        ex.code !== 'P2025' // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
      ) {
        throw ex;
      }
    }

    return deleteResult;
  }

  update(model: TodoModel) {
    return this.dbClient.todo.update({
      data: model.toEntity(),
      where: model.keys(),
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
