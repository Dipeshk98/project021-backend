import { nanoid } from 'nanoid';
import { MemberStatus } from 'src/types/MemberStatus';

import { AbstractItem, IDynamodbItem } from './AbstractItem';

export class Member extends AbstractItem {
  static BEGINS_KEYS = 'MEMBER#';

  public readonly teamId: string;

  public readonly skId: string;

  private status = MemberStatus.PENDING;

  private email?: string;

  /**
   * Constructor for Team class.
   * @constructor
   * @param userId - The ID of the user. Leave it empty for `MemberStatus.PENDING` when the user didn't accept the invitation yet.
   */
  constructor(teamId: string, userId?: string, removeBegins?: boolean) {
    super();
    this.teamId = teamId;

    if (userId) {
      let tmpUserId = userId;

      if (removeBegins) {
        tmpUserId = tmpUserId.replace(Member.BEGINS_KEYS, '');
      }

      this.skId = tmpUserId;
    } else {
      // In pending status, we use the skId for verification code
      this.skId = nanoid(30);
    }
  }

  get pk() {
    return `${Member.BEGINS_KEYS}${this.teamId}`;
  }

  get sk() {
    return `${Member.BEGINS_KEYS}${this.skId}`;
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
