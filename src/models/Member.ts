import { nanoid } from 'nanoid';

import { MemberStatus } from '@/types/MemberStatus';

import type { IDynamodbItem } from './AbstractItem';
import { AbstractItem } from './AbstractItem';

export class Member extends AbstractItem {
  static BEGINS_KEYS = 'MEMBER#';

  public readonly teamId: string;

  public readonly skId: string;

  private status = MemberStatus.PENDING;
  // `status` is a reserved keyword in DynamoDB: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html
  // There is no issue working in JavaScript/TypeScript. But, when you are working with DynamoDB, please be careful.

  private email?: string;

  /**
   * Constructor for Member class.
   * @constructor
   * @param teamId - The ID of the team.
   * @param userId - The ID of the user. Leave it empty for `MemberStatus.PENDING` when the user didn't accept the invitation yet.
   * @param removeBegins - Is BEGINS_KEYS included in the ID.
   * If yes, it needs to be removed.
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

  getTeamId() {
    return this.teamId;
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
