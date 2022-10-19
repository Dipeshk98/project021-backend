import type { Todo } from '@prisma/client';
import ObjectID from 'bson-objectid';

export class TodoModel {
  public readonly ownerId: string;

  public readonly id: string;

  private title: string = '';

  /**
   * Constructor for Todo class.
   * @constructor
   * @param ownerId - The owner ID of the todo.
   * @param id - The ID of the todo.
   */
  constructor(ownerId: string, id?: string) {
    this.ownerId = ownerId;

    if (id) {
      this.id = id;
    } else {
      this.id = ObjectID().str;
    }
  }

  setTitle(title: string) {
    this.title = title;
  }

  getTitle() {
    return this.title;
  }

  toEntity() {
    return {
      id: this.id,
      ownerId: this.ownerId,
      title: this.title,
    };
  }

  fromEntity(entity: Todo) {
    this.title = entity.title;
  }
}
