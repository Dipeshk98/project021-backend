import type { Table } from 'dynamodb-onetable';

import { Todo } from '@/models/Todo';

import { AbstractRepository } from './AbstractRepository';

export class TodoRepository extends AbstractRepository<Todo> {
  constructor(dbTable: Table) {
    super(dbTable, 'Todo');
  }

  findByKeys(userId: string, id: string) {
    const todo = new Todo(userId, id);

    return this.get(todo);
  }

  deleteByKeys(userId: string, id: string) {
    const todo = new Todo(userId, id);

    return this.delete(todo);
  }

  async findAllByUserId(userId: string) {
    const list = await this.dbModel.find({
      PK: `${Todo.BEGINS_KEYS}${userId}`,
      SK: { begins_with: Todo.BEGINS_KEYS },
    });

    return list.map((elt) => {
      const todo = new Todo(userId, Todo.removeBeginsKeys(`${elt.SK}`));
      todo.fromEntity(elt);
      return todo;
    });
  }
}
