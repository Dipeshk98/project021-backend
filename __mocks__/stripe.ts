import Stripe from 'stripe';

import { Env } from '@/utils/Env';

export const originalStripe = new Stripe(Env.getValue('STRIPE_SECRET_KEY'), {
  apiVersion: '2020-08-27',
  telemetry: false,
});

export const mockCustomersCreate = jest.fn();
export const mockCheckoutSessionCreate = jest.fn();
export const mockBillingPortalSessionsCreate = jest.fn();

export default jest.fn(() => ({
  customers: {
    create: mockCustomersCreate,
  },
  checkout: {
    sessions: {
      create: mockCheckoutSessionCreate,
    },
  },
  billingPortal: {
    sessions: {
      create: mockBillingPortalSessionsCreate,
    },
  },
  webhooks: originalStripe.webhooks,
}));
