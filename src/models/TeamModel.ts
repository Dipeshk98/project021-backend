import type { Team } from '@prisma/client';
import { AbstractModel } from './AbstractModel';

export class TeamModel extends AbstractModel<Team> {
  public readonly id: string;

  private displayName = '';

  private stripeCustomerId: string | null = null;

  private subscriptionId: string | null = null;

  private subscriptionProductId: string | null = null;

  private subscriptionStatus: string | null = null;

  constructor(id: string) {
    super();
    this.id = id;
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

  keys() {
    return {
      id: this.id,
    };
  }

  toCreateEntity() {
    return {
      ...this.keys(),
      displayName: this.displayName,
      stripeCustomerId: this.stripeCustomerId,
      subscriptionId: this.subscriptionId,
      subscriptionProductId: this.subscriptionProductId,
      subscriptionStatus: this.subscriptionStatus,
    };
  }

  toEntity() {
    return {
      displayName: this.displayName,
      stripeCustomerId: this.stripeCustomerId,
      subscriptionId: this.subscriptionId,
      subscriptionProductId: this.subscriptionProductId,
      subscriptionStatus: this.subscriptionStatus,
    };
  }

  fromEntity(entity: Team) {
    this.displayName = entity.displayName;
    this.stripeCustomerId = entity.stripeCustomerId;
    this.subscriptionId = entity.subscriptionId;
    this.subscriptionProductId = entity.subscriptionProductId;
    this.subscriptionStatus = entity.subscriptionStatus;
  }
}
