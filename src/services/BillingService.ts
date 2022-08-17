import type Stripe from 'stripe';

import { ApiError } from '@/error/ApiError';
import { ErrorCode } from '@/error/ErrorCode';
import type { TeamRepository } from '@/repositories/TeamRepository';
import type { ISubscription } from '@/types/StripeTypes';
import {
  StripeCheckoutEvent,
  StripeCustomer,
  StripeSubscriptionEvent,
  SubscriptionStatus,
} from '@/types/StripeTypes';
import { BillingPlan } from '@/utils/BillingPlan';
import { Env } from '@/utils/Env';
import { getStripe } from '@/utils/Stripe';

export class BillingService {
  private teamRepository: TeamRepository;

  constructor(teamRepository: TeamRepository) {
    this.teamRepository = teamRepository;
  }

  async createOrRetrieveCustomerId(teamId: string) {
    const team = await this.teamRepository.findByTeamId(teamId);

    if (!team) {
      throw new ApiError('Incorrect TeamID', null, ErrorCode.INCORRECT_TEAM_ID);
    }

    const customerId = team.getStripeCustomerId();

    if (customerId) {
      // Return the Stripe customer ID if the user has already one.
      return customerId;
    }

    const stripeCustomer = await getStripe().customers.create({
      metadata: {
        teamId: team.id,
      },
    });

    team.setStripeCustomerId(stripeCustomer.id);
    await this.teamRepository.save(team);

    return stripeCustomer.id;
  }

  // TODO: Remove getStripe and make it a class attribute instead of injecting directly from import
  // eslint-disable-next-line class-methods-use-this
  async createCheckoutSession(customerId: string, priceId: string) {
    try {
      return await getStripe().checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer: customerId,
        line_items: [
          {
            price: priceId,
            // For metered billing, do not pass quantity
            quantity: 1,
          },
        ],
        // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
        // the actual Session ID is returned in the query parameter when your customer
        // is redirected to the success page.
        success_url: `${Env.getValue(
          'FRONTEND_DOMAIN_URL'
        )}/dashboard/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${Env.getValue('FRONTEND_DOMAIN_URL')}/dashboard/upgrade`,
      });
    } catch (ex: any) {
      throw new ApiError('Impossible to create Stripe checkout session', ex);
    }
  }

  async processSubscriptionEvent(event: Stripe.Event) {
    // `customer.subscription.updated` can be called `before customer.subscription.created`
    // what is why we need to retrieve subscription to get the latest version
    let subscription = StripeSubscriptionEvent.parse(event.data.object);
    const subscriptionRetrieved = await getStripe().subscriptions.retrieve(
      subscription.id
    );
    subscription = StripeSubscriptionEvent.parse(subscriptionRetrieved);

    const stripeCustomer = await getStripe().customers.retrieve(
      subscription.customer
    );
    const customer = StripeCustomer.parse(stripeCustomer);

    await this.teamRepository.updateSubscription(customer.metadata.teamId, {
      id: subscription.id,
      productId: subscription.plan.product,
      status: subscription.status,
    });
  }

  async processCheckoutEvent(event: Stripe.Event) {
    const checkout = StripeCheckoutEvent.parse(event.data.object);
    const subscriptionRetrieved = await getStripe().subscriptions.retrieve(
      checkout.subscription
    );
    const subscription = StripeSubscriptionEvent.parse(subscriptionRetrieved);

    const stripeCustomer = await getStripe().customers.retrieve(
      subscription.customer
    );
    const customer = StripeCustomer.parse(stripeCustomer);

    await this.teamRepository.updateSubscription(customer.metadata.teamId, {
      id: subscription.id,
      productId: subscription.plan.product,
      status: subscription.status,
    });
  }

  // TODO: Should become a static method or move this function into User? Open to suggestion
  // eslint-disable-next-line class-methods-use-this
  getPlanFromSubscription(subscription?: ISubscription) {
    const billingEnv = BillingPlan[Env.getValue('BILLING_PLAN_ENV')];

    if (!billingEnv) {
      throw new ApiError(
        "BILLING_PLAN_ENV environment variable isn't defined correctly"
      );
    }

    if (!subscription) {
      // Subscription isn't defined, it means the user is at free tier.
      return billingEnv.free;
    }

    const pricing = billingEnv[subscription.productId];

    // List of Stripe Subscription statuses: https://stripe.com/docs/billing/subscriptions/overview#subscription-statuses
    if (pricing && subscription?.status === SubscriptionStatus.ACTIVE) {
      return pricing;
    }

    return billingEnv.free;
  }
}
