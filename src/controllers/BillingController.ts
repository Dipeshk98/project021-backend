import { RequestHandler } from 'express';
import { ApiError } from 'src/error/ApiError';
import { BillingService } from 'src/services/BillingService';
import { TeamService } from 'src/services/TeamService';
import { UserService } from 'src/services/UserService';
import { Env } from 'src/utils/Env';
import { getStripe } from 'src/utils/Stripe';
import { BodyPriceHandler } from 'src/validations/BillingValidation';
import { ParamsTeamIdHandler } from 'src/validations/TeamValidation';
import Stripe from 'stripe';

export class BillingController {
  private billingService: BillingService;

  private userService: UserService;

  private teamService: TeamService;

  constructor(
    billingService: BillingService,
    userService: UserService,
    teamService: TeamService
  ) {
    this.billingService = billingService;
    this.userService = userService;
    this.teamService = teamService;
  }

  public createCheckoutSession: BodyPriceHandler = async (req, res) => {
    await this.userService.findAndVerifyTeam(
      req.currentUserId,
      req.params.teamId
    );

    const customerId = await this.billingService.createOrRetrieveCustomerId(
      req.params.teamId
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

  public createCustomerPortalLink: ParamsTeamIdHandler = async (req, res) => {
    const team = await this.teamService.findOnlyIfTeamMember(
      req.params.teamId,
      req.currentUserId
    );

    const stripeCustomerId = team.getStripeCustomerId();

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
