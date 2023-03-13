import type { PrismaClient, Todo } from '@prisma/client';

import { TodoModel } from '@/models/TodoModel';

import { AbstractRepository } from './AbstractRepository';

export class TodoRepository extends AbstractRepository<Todo, TodoModel> {
  constructor(dbClient: PrismaClient) {
    super(dbClient, 'todo');
  }

  findByKeys(teamId: string, id: string) {
    const todo = new TodoModel(teamId, id);

    return this.get(todo);
  }

  deleteByKeys(teamId: string, id: string) {
    const todo = new TodoModel(teamId, id);

    return this.delete(todo);
  }

  async findAllByUserId(teamId: string) {
    const list = await this.dbClient.todo.findMany({
      where: {
        ownerId: teamId,
      },
    });

    return list.map((elt) => {
      const todo = new TodoModel(teamId, elt.id);
      todo.fromEntity(elt);
      return todo;
    });
  }
}
