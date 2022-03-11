import { ulid } from 'ulid';

import { AbstractItem, IDynamodbItem } from './AbstractItem';

export class Team extends AbstractItem {
  static BEGINS_KEYS = 'TEAM#';

  public readonly id: string;

  private displayName?: string;

  /**
   * Constructor for Team class.
   * @constructor
   * @param id - The ID of the team.
   */
  constructor(id?: string) {
    super();
    this.id = id ?? ulid();
  }

  get pk() {
    return `${Team.BEGINS_KEYS}${this.id}`;
  }

  get sk() {
    return `${Team.BEGINS_KEYS}${this.id}`;
  }

  getId() {
    return this.id;
  }

  setDisplayName(name: string) {
    this.displayName = name;
  }

  getDisplayName() {
    return this.displayName;
  }

  toItem() {
    return {
      ...this.keys(),
      displayName: this.displayName,
    };
  }

  fromItem(item: IDynamodbItem) {
    this.displayName = item.name;
  }
}
