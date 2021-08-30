import { ISubscription } from 'src/types/StripeTypes';

import { AbstractItem, IDynamodbItem } from './AbstractItem';

export class User extends AbstractItem {
  static BEGINS_KEYS = 'USER#';

  private id: string;

  private firstSignIn: Date;

  private stripeCustomerId?: string;

  private subscription?: ISubscription;

  constructor(id: string) {
    super();
    this.id = id;
    this.firstSignIn = new Date();
  }

  get pk() {
    return `${User.BEGINS_KEYS}${this.id}`;
  }

  get sk() {
    return `${User.BEGINS_KEYS}${this.id}`;
  }

  getId() {
    return this.id;
  }

  getFirstSignIn() {
    return this.firstSignIn;
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
      firstSignIn: this.firstSignIn.toISOString(),
      stripeCustomerId: this.stripeCustomerId,
      subscription: this.subscription,
    };
  }

  fromItem(item: IDynamodbItem) {
    this.firstSignIn = new Date(item.firstSignIn);
    this.stripeCustomerId = item.stripeCustomerId;
    this.subscription = item.subscription;
  }
}
