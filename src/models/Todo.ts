import { ulid } from 'ulid';

import type { IDynamodbItem } from './AbstractItem';
import { AbstractItem } from './AbstractItem';

export class Todo extends AbstractItem {
  static BEGINS_KEYS = 'TODO#';

  public readonly ownerId: string;

  public readonly id: string;

  private title?: string;

  /**
   * Constructor for Todo class.
   * @constructor
   * @param ownerId - The owner ID of the todo.
   * @param id - The ID of the todo.
   * @param removeBegins - Is BEGINS_KEYS included in the ID.
   * If yes, it needs to be removed.
   */
  constructor(ownerId: string, id?: string, removeBegins?: boolean) {
    super();
    this.ownerId = ownerId;

    if (id) {
      let tmpId = id;

      if (removeBegins) {
        tmpId = tmpId.replace(Todo.BEGINS_KEYS, '');
      }

      this.id = tmpId;
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

  toItem() {
    return {
      ...this.keys(),
      title: this.title,
    };
  }

  fromItem(item: IDynamodbItem) {
    this.title = item.title;
  }
}
