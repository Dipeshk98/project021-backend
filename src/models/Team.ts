import { ulid } from 'ulid';

import type { ISubscription } from '@/types/StripeTypes';

import type { IDynamodbItem } from './AbstractItem';
import { AbstractItem } from './AbstractItem';

export class Team extends AbstractItem {
  static BEGINS_KEYS = 'TEAM#';

  public readonly id: string;

  private displayName?: string;

  private stripeCustomerId?: string;

  private subscription?: ISubscription;

  /**
   * Constructor for Team class.
   * @constructor
   * @param id - The ID of the team.
   * @param removeBegins - Is BEGINS_KEYS included in the ID.
   * If yes, it needs to be removed.
   */
  constructor(id?: string, removeBegins?: boolean) {
    super();

    if (id) {
      let tmpId = id;

      if (removeBegins) {
        tmpId = tmpId.replace(Team.BEGINS_KEYS, '');
      }

      this.id = tmpId;
    } else {
      this.id = ulid();
    }
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

  setStripeCustomerId(customerId: string) {
    this.stripeCustomerId = customerId;
  }

  getStripeCustomerId() {
    return this.stripeCustomerId;
  }

  hasStripeCustomerId() {
    return !!this.stripeCustomerId;
  }

  getSubscription() {
    return this.subscription;
  }

  toItem() {
    return {
      ...this.keys(),
      displayName: this.displayName,
      stripeCustomerId: this.stripeCustomerId,
      subscription: this.subscription,
    };
  }

  fromItem(item: IDynamodbItem) {
    this.displayName = item.displayName;
    this.stripeCustomerId = item.stripeCustomerId;
    this.subscription = item.subscription;
  }
}
