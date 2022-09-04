import type { RequestHandler } from 'express';
import type Stripe from 'stripe';

import { ApiError } from '@/error/ApiError';
import { ErrorCode } from '@/error/ErrorCode';
import type { BillingService } from '@/services/BillingService';
import type { TeamService } from '@/services/TeamService';
import { MemberRole } from '@/types/Member';
import { Env } from '@/utils/Env';
import { getStripe } from '@/utils/Stripe';
import type { BodyPriceHandler } from '@/validations/BillingValidation';
import type { ParamsTeamIdHandler } from '@/validations/TeamValidation';

export class BillingController {
  private teamService: TeamService;

  private billingService: BillingService;

  constructor(teamService: TeamService, billingService: BillingService) {
    this.teamService = teamService;
    this.billingService = billingService;
  }

  public createCheckoutSession: BodyPriceHandler = async (req, res) => {
    await this.teamService.findAndVerifyTeam(
      req.currentUserId,
      req.params.teamId,
      [MemberRole.OWNER, MemberRole.ADMIN]
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
      throw new ApiError(
        'Incorrect Stripe webhook signature',
        ex,
        ErrorCode.INCORRECT_STRIPE_SIGNATURE
      );
    }

    // FYI, here is the explanation why we need these Stripe events:
    // https://github.com/stripe/stripe-firebase-extensions/issues/146
    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      await this.billingService.processSubscriptionEvent(event);
    } else if (event.type === 'checkout.session.completed') {
      await this.billingService.processCheckoutEvent(event);
    } else {
      throw new ApiError('Stripe are calling with unexpected events');
    }

    res.json({ received: true });
  };

  public createCustomerPortalLink: ParamsTeamIdHandler = async (req, res) => {
    const { team } = await this.teamService.findOnlyIfTeamMember(
      req.params.teamId,
      req.currentUserId,
      [MemberRole.OWNER, MemberRole.ADMIN]
    );

    const stripeCustomerId = team.getStripeCustomerId();

    if (!stripeCustomerId) {
      // It shouldn't happens because the user shouldn't be able to call `createCustomerPortalLink` when the `stripeCustomerId` isn't defined.
      // The option is hidden in the frontend when the `stripCustomerId` isn't defined.
      // Is it a bug? Or, someone bypassing the frontend?
      throw new ApiError(
        "Stripe customer ID shouldn't be null",
        null,
        ErrorCode.INCORRECT_DATA
      );
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
