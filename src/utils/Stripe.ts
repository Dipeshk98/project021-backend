import Stripe from 'stripe';

import { Env } from './Env';

let stripe: Stripe | null = null;

export const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(Env.getValue('STRIPE_SECRET_KEY'), {
      apiVersion: '2022-08-01',
      telemetry: false,
    });
  }

  return stripe;
};
