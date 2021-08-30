import { z } from 'zod';

// Non-exhaustive attributes for Stripe Subscription Event.
// You can add more attributes if your application needs it.
export const StripeSubscriptionEvent = z.object({
  id: z.string(),
  status: z.string(),
  plan: z.object({
    product: z.string(),
  }),
  customer: z.string(),
});

// Non-exhaustive attributes for Stripe Checkout Event
export const StripeCheckoutEvent = z.object({
  subscription: z.string(),
  customer: z.string(),
});

// Non-exhaustive attributes for Stripe Customer
export const StripeCustomer = z.object({
  metadata: z.object({
    userId: z.string(),
  }),
});

// Subscription used by User class
export type ISubscription = {
  id: string;
  productId: string;
  status: string;
};

// Non-exhaustive attributes for Stripe Subscription status.
export enum SubscriptionStatus {
  ACTIVE = 'active',
}
