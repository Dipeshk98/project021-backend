import { ulid } from 'ulid';

import { AbstractModel } from './AbstractModel';
import type { TodoEntity } from './Schema';

export class Todo extends AbstractModel<TodoEntity> {
  static BEGINS_KEYS = 'TODO#';

  public readonly ownerId: string;

  public readonly id: string;

  private title?: string;

  /**
   * Constructor for Todo class.
   * @constructor
   * @param ownerId - The owner ID of the todo.
   * @param id - The ID of the todo.
   */
  constructor(ownerId: string, id?: string) {
    super();
    this.ownerId = ownerId;

    if (id) {
      this.id = id;
    } else {
      this.id = ulid();
    }
  }

  get pk() {
    return `${Todo.BEGINS_KEYS}${this.ownerId}`;
  }

  get sk() {
    return `${Todo.BEGINS_KEYS}${this.id}`;
  }

  setTitle(title: string) {
    this.title = title;
  }

  getTitle() {
    return this.title;
  }

  toEntity() {
    return {
      ...this.keys(),
      title: this.title,
    };
  }

  fromEntity(entity: TodoEntity) {
    if (entity.title) this.title = entity.title;
  }

  static removeBeginsKeys(pk: string) {
    return pk.replace(Todo.BEGINS_KEYS, '');
  }
}
