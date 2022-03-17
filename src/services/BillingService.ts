import { ApiError } from 'src/error/ApiError';
import {
  ISubscription,
  StripeCheckoutEvent,
  StripeCustomer,
  StripeSubscriptionEvent,
  SubscriptionStatus,
} from 'src/types/StripeTypes';
import { BillingPlan } from 'src/utils/BillingPlan';
import { Env } from 'src/utils/Env';
import { getStripe } from 'src/utils/Stripe';
import Stripe from 'stripe';

import { TeamService } from './TeamService';

export class BillingService {
  private teamService: TeamService;

  constructor(teamService: TeamService) {
    this.teamService = teamService;
  }

  async createOrRetrieveCustomerId(teamId: string) {
    const team = await this.teamService.findByTeamId(teamId);

    if (!team) {
      throw new ApiError("Team ID doesn't exist");
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
    await this.teamService.update(team);

    return stripeCustomer.id;
  }

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

    await this.teamService.updateSubscription(customer.metadata.teamId, {
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

    await this.teamService.updateSubscription(customer.metadata.teamId, {
      id: subscription.id,
      productId: subscription.plan.product,
      status: subscription.status,
    });
  }

  getPlanFromSubscription(subscription?: ISubscription) {
    const billingEnv = BillingPlan[Env.getValue('BILLING_PLAN_ENV')];

    if (!billingEnv) {
      throw new ApiError("BILLING_PLAN_ENV environment variable isn't defined");
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
