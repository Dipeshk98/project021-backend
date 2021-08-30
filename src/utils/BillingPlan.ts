// You can add additional information related to your billing plan.
// In this example, we only use stripeProductId and you can add more information if needed.
type IPricing = {
  id: string;
  name: string;
};

// Billing Plan for one environment
type IBillingPlanEnv = {
  [k: string]: {
    free: IPricing;
    [k: string]: IPricing;
  };
};

export const BillingPlan: IBillingPlanEnv = {
  dev: {
    free: {
      id: 'FREE',
      name: 'Free',
    },
    // FIXME: Add your pricing id for dev environment
    prod_K70Vg9JW6WW97Q: {
      id: 'PRO',
      name: 'Pro',
    },
  },
  prod: {
    free: {
      id: 'FREE',
      name: 'Free',
    },
    // FIXME: Add your pricing id for prod environment
  },
};
