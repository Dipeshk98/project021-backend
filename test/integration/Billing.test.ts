import {
  mockCheckoutSessionCreate,
  mockCustomersCreate,
} from '__mocks__/stripe';
import supertest from 'supertest';

import { app } from '@/app';
import { ErrorCode } from '@/error/ErrorCode';

describe('Billing', () => {
  let teamId: string;

  beforeEach(async () => {
    app.request.currentUserId = '123';

    const response = await supertest(app).get(
      '/user/profile?email=example@example.com'
    );
    teamId = response.body.teamList[0].id;
  });

  describe('Create checkout session', () => {
    it('should return an error with a missing priceId as a parameter. PriceId is needed to create a checkout session.', async () => {
      const response = await supertest(app).post(
        `/${teamId}/billing/create-checkout-session`
      );

      expect(response.statusCode).toEqual(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([{ param: 'priceId', type: 'invalid_type' }])
      );
    });

    it("shouldn't create a checkout session and return an error because the user isn't a member", async () => {
      const response = await supertest(app)
        .post('/123/billing/create-checkout-session')
        .send({
          priceId: 'PRICE_ID',
        });

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.NOT_MEMBER);
    });

    it('should create a Stripe customer ID for the team and return checkout session ID', async () => {
      mockCustomersCreate.mockReturnValueOnce({
        id: 'RANDOM_STRIPE_CUSTOMER_ID',
      });
      mockCheckoutSessionCreate.mockReturnValueOnce({
        id: 'RANDOM_STRIPE_SESSION_ID',
      });

      const response = await supertest(app)
        .post(`/${teamId}/billing/create-checkout-session`)
        .send({
          priceId: 'PRICE_ID',
        });

      expect(mockCustomersCreate.mock.calls[0][0].metadata.teamId).toEqual(
        teamId
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.sessionId).toEqual('RANDOM_STRIPE_SESSION_ID');
    });
  });
});
