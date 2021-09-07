import { RequestHandler } from 'express';
import { ApiError } from 'src/error/ApiError';
import { BillingService } from 'src/services/BillingService';
import { UserService } from 'src/services/UserService';
import { Env } from 'src/utils/Env';
import { getStripe } from 'src/utils/Stripe';
import { BodyPriceHandler } from 'src/validations/BillingValidation';
import Stripe from 'stripe';

export class BillingController {
  private billingService: BillingService;

  private userService: UserService;

  constructor(billingService: BillingService, userService: UserService) {
    this.billingService = billingService;
    this.userService = userService;
  }

  public createCheckoutSession: BodyPriceHandler = async (req, res) => {
    const user = await this.userService.findByUserId(req.currentUserId);

    if (!user) {
      throw new ApiError("User ID doesn't exist");
    }

    const customerId = await this.billingService.createOrRetrieveCustomerId(
      user
    );
    const session = await this.billingService.createCheckoutSession(
      customerId,
      req.body.priceId
    );

    res.json({
      sessionId: session.id,
    });
  };

  public webhook: RequestHandler = async (req, res) => {
    const sig = req.headers['stripe-signature']!;
    let event: Stripe.Event;

    try {
      event = getStripe().webhooks.constructEvent(
        req.body,
        sig,
        Env.getValue('STRIPE_WEBHOOK_SECRET', true)
      );
    } catch (ex: any) {
      throw new ApiError('Incorrect Stripe webhook signature', ex);
    }

    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      await this.billingService.processSubscriptionEvent(event);
    } else if (event.type === 'checkout.session.completed') {
      await this.billingService.processCheckoutEvent(event);
    } else {
      throw new ApiError('Stripe are calling with more events than expected');
    }

    res.json({ received: true });
  };

  public createCustomerPortalLink: RequestHandler = async (req, res) => {
    const user = await this.userService.findByUserId(req.currentUserId);

    if (!user) {
      throw new ApiError("User ID doesn't exist");
    }

    const stripeCustomerId = user.getStripeCustomerId();

    if (!stripeCustomerId) {
      // It shouldn't happens because the user shouldn't be able to call `createCustomerPortalLink`
      // when the `stripeCustomerId` isn't defined.
      // The option is hidden in the frontend when the `stripCustomerId` isn't defined.
      throw new ApiError("Stripe customer ID shouldn't be null");
    }

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${Env.getValue('FRONTEND_DOMAIN_URL')}/dashboard/settings`,
    });

    res.send({
      url: portalSession.url,
    });
  };
}
