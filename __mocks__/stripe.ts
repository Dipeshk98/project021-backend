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
}));
