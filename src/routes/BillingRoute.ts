import { Router } from 'express';
import { billingController } from 'src/controllers';
import { paramsTeamIdValidate } from 'src/validations/TeamValidation';

import { bodyPriceValidate } from '../validations/BillingValidation';

const billingRouter = Router();

billingRouter.post(
  '/:teamId/billing/create-checkout-session',
  bodyPriceValidate,
  billingController.createCheckoutSession
);

// If you changes the route, please don't forget to update the route in the head of the `handler.ts` file.
// It keep the raw body for stripe signature
// reference to `app.use('....', express.raw({ type: '*/*' }));`
// You also need to update the path in `serverless.yml`
billingRouter.post('/billing/webhook', billingController.webhook);

billingRouter.post(
  '/:teamId/billing/customer-portal',
  paramsTeamIdValidate,
  billingController.createCustomerPortalLink
);

export { billingRouter };
