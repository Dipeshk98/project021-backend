import type { Team } from '@prisma/client';
import ObjectID from 'bson-objectid';

import type { ISubscription } from '@/types/StripeTypes';

export class TeamModel {
  public readonly id: string;

  private displayName = 'New Team';

  private stripeCustomerId: string | null = null;

  private subscription: ISubscription | null = null;

  /**
   * Constructor for Team class.
   * @constructor
   * @param id - The ID of the team.
   */
  constructor(id?: string) {
    if (id) {
      this.id = id;
    } else {
      this.id = ObjectID().str;
    }
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
      displayName: this.displayName,
      stripeCustomerId: this.stripeCustomerId,
      subscriptionId: this.subscription?.id,
      subscriptionProductId: this.subscription?.productId,
      subscriptionStatus: this.subscription?.status,
    };
  }

  fromEntity(entity: Team) {
    this.displayName = entity.displayName;
    this.stripeCustomerId = entity.stripeCustomerId;

    if (
      entity.subscriptionId &&
      entity.subscriptionProductId &&
      entity.subscriptionStatus
    ) {
      this.subscription = {
        id: entity.subscriptionId,
        productId: entity.subscriptionProductId,
        status: entity.subscriptionStatus,
      };
    }
  }
}
