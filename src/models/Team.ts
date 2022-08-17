import { ulid } from 'ulid';

import type { ISubscription } from '@/types/StripeTypes';

import { AbstractModel } from './AbstractModel';
import type { TeamEntity } from './Schema';

export class Team extends AbstractModel<TeamEntity> {
  static BEGINS_KEYS = 'TEAM#';

  public readonly id: string;

  private displayName?: string;

  private stripeCustomerId?: string;

  private subscription?: ISubscription;

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

  toEntity() {
    return {
      ...this.keys(),
      displayName: this.displayName,
      stripeCustomerId: this.stripeCustomerId,
      subscription: this.subscription,
    };
  }

  fromEntity(entity: TeamEntity) {
    if (entity.displayName) this.displayName = entity.displayName;

    if (entity.stripeCustomerId)
      this.stripeCustomerId = entity.stripeCustomerId;

    if (
      entity.subscription &&
      entity.subscription.id &&
      entity.subscription.productId &&
      entity.subscription.status
    ) {
      this.subscription = {
        id: entity.subscription.id,
        productId: entity.subscription.productId,
        status: entity.subscription.status,
      };
    }
  }

  static removeBeginsKeys(pk: string) {
    return pk.replace(Team.BEGINS_KEYS, '');
  }
}
