import type { PrismaClient, Todo } from '@prisma/client';

import { TodoModel } from '@/models/Todo';

import { AbstractRepository } from './AbstractRepository';

export class TodoRepository extends AbstractRepository<Todo, TodoModel> {
  constructor(dbClient: PrismaClient) {
    super(dbClient, 'todo');
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
