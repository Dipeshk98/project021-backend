import { ulid } from 'ulid';

import { AbstractItem, IDynamodbItem } from './AbstractItem';

export class Team extends AbstractItem {
  static BEGINS_KEYS = 'TEAM#';

  public readonly id: string;

  private displayName?: string;

  private memberList: string[];

  /**
   * Constructor for Team class.
   * @constructor
   * @param id - The ID of the team.
   */
  constructor(id?: string) {
    super();

    if (id) {
      this.id = id;
    } else {
      this.id = ulid();
    }

    this.memberList = [];
  }

  get pk() {
    return `${Team.BEGINS_KEYS}${this.id}`;
  }

  get sk() {
    return `${Team.BEGINS_KEYS}${this.id}`;
  }

  setDisplayName(name: string) {
    this.displayName = name;
  }

  getDisplayName() {
    return this.displayName;
  }

  addMember(userId: string) {
    this.memberList.push(userId);
  }

  toItem() {
    return {
      ...this.keys(),
      displayName: this.displayName,
      memberList: this.memberList,
    };
  }

  fromItem(item: IDynamodbItem) {
    this.displayName = item.name;
    this.memberList = item.memberList;
  }
}
