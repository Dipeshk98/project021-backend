import type Stripe from 'stripe';

import { getDBTable } from '@/models/DBTable';
import { TeamRepository } from '@/repositories/TeamRepository';
import { SubscriptionStatus } from '@/types/StripeTypes';
import { getStripe } from '@/utils/Stripe';

import { BillingService } from './BillingService';

describe('BillingService', () => {
  let teamRepository: TeamRepository;

  let stripe: Stripe;

  beforeEach(() => {
    const dbTable = getDBTable();

    teamRepository = new TeamRepository(dbTable);

    stripe = getStripe();
  });

  describe('BillingService exception in constructor', () => {
    it("should raise an exception when the billingEnv doesn't exist", () => {
      expect(() => {
        const billingService = new BillingService(
          teamRepository,
          stripe,
          'NON_EXISTING_BILLING_PLAN'
        );

        // Unused statement to avoid typing and linting error
        billingService.getPlanFromSubscription();
      }).toThrow(
        "BILLING_PLAN_ENV environment variable isn't defined correctly"
      );
    });
  });

  describe('Basic operation', () => {
    let billingService: BillingService;

    beforeEach(() => {
      billingService = new BillingService(teamRepository, stripe, 'dev');
    });

    it('should return the free plan when the productId is incorrect', () => {
      const plan = billingService.getPlanFromSubscription({
        id: 'RANDOM_SUBSCRIPTION_ID',
        productId: 'INCORRECT_PRODUCT_ID',
        status: SubscriptionStatus.ACTIVE,
      });

      expect(plan.id).toEqual('FREE');
    });

    it('should return the free plan by default', () => {
      const plan = billingService.getPlanFromSubscription();
      expect(plan.id).toEqual('FREE');
    });

    it('should return the free plan when the status is not active', () => {
      const plan = billingService.getPlanFromSubscription({
        id: 'RANDOM_SUBSCRIPTION_ID',
        productId: 'prod_MQV5G6bV1mdV6Z', // Stripe `product id` located at BillingPlan.ts file
        status: SubscriptionStatus.PENDING,
      });

      expect(plan.id).toEqual('FREE');
    });

    it('should return the PRO plan when the subscription is active', () => {
      const plan = billingService.getPlanFromSubscription({
        id: 'RANDOM_SUBSCRIPTION_ID',
        productId: 'prod_MQV5G6bV1mdV6Z', // Stripe `product id` located at BillingPlan.ts file
        status: SubscriptionStatus.ACTIVE,
      });

      expect(plan.id).toEqual('PRO');
    });
  });
});
