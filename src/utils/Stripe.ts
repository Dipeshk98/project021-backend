import Stripe from 'stripe';

import { Env } from './Env';

let stripe: Stripe | null = null;

export const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(Env.getValue('STRIPE_SECRET_KEY'), {
      apiVersion: '2020-08-27',
      telemetry: false,
    });
  }

  return stripe;
};
