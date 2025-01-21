import type { PrismaClient, Todo } from '@prisma/client';

import { TodoModel } from '@/models/TodoModel';

import { AbstractRepository } from './AbstractRepository';

export class TodoRepository extends AbstractRepository<
  PrismaClient['todo'],
  Todo,
  TodoModel
> {
  constructor(dbClient: PrismaClient) {
    super(dbClient.todo);
  }

  findByKeys(ownerId: string, id: string) {
    const todo = new TodoModel(ownerId, id);

    return this.get(todo);
  }

  deleteByKeys(ownerId: string, id: string) {
    const todo = new TodoModel(ownerId, id);

    return this.delete(todo);
  }

  async findAllByOwnerId(ownerId: string) {
    const list = await this.dbClient.findMany({
      where: {
        ownerId,
      },
    });

    return list.map((elt) => {
      const todo = new TodoModel(ownerId, elt.id);
      todo.fromEntity(elt);
      return todo;
    });
  }
}
