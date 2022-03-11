import { MemberStatus } from 'src/types/MemberStatus';

import { AbstractItem, IDynamodbItem } from './AbstractItem';

export class Member extends AbstractItem {
  static BEGINS_KEYS = 'MEMBER#';

  private teamId: string;

  private userId: string;

  private status = MemberStatus.PENDING;

  private email?: string;

  constructor(teamId: string, userId: string, removeBegins?: boolean) {
    super();
    this.teamId = teamId;

    let tmpUserId = userId;

    if (removeBegins) {
      tmpUserId = tmpUserId.replace(Member.BEGINS_KEYS, '');
    }

    this.userId = tmpUserId;
  }

  get pk() {
    return `${Member.BEGINS_KEYS}${this.teamId}`;
  }

  get sk() {
    return `${Member.BEGINS_KEYS}${this.userId}`;
  }

  getUserId() {
    return this.userId;
  }

  setStatus(status: MemberStatus) {
    this.status = status;
  }

  getStatus() {
    return this.status;
  }

  setEmail(email: string) {
    this.email = email;
  }

  getEmail() {
    return this.email;
  }

  toItem() {
    return {
      ...this.keys(),
      status: this.status,
      email: this.email,
    };
  }

  fromItem(item: IDynamodbItem) {
    this.status = item.status;
    this.email = item.email;
  }
}
