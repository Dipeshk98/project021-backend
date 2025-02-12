import type { Todo } from '@prisma/client';

import { AbstractModel } from './AbstractModel';

export class TodoModel extends AbstractModel<Todo> {
  public readonly id: string;

  public ownerId: string;

  private title: string = '';

  constructor(ownerId: string, id: string) {
    super();
    this.id = id;
    this.ownerId = ownerId;
  }

  setTitle(title: string) {
    this.title = title;
  }

  getTitle() {
    return this.title;
  }

  keys() {
    return {
      id: this.id,
    };
  }

  toCreateEntity() {
    return {
      ...this.keys(),
      ownerId: this.ownerId,
      title: this.title,
    };
  }

  toEntity() {
    return {
      ownerId: this.ownerId,
      title: this.title,
    };
  }

  fromEntity(entity: Todo) {
    this.ownerId = entity.ownerId;
    this.title = entity.title;
  }
}
