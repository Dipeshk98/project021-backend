import supertest from 'supertest';

import { app } from '@/app';

describe('User', () => {
  beforeAll(() => {
    app.request.currentUserId = '123';
  });

  describe('User profile', () => {
    it('should return an error missing the email as parameter. Email is used to create a new team.', async () => {
      const response = await supertest(app).get('/user/profile');

      expect(response.statusCode).toEqual(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([{ param: 'email', type: 'invalid_type' }])
      );
    });

    it('should return an error with incorrect email as parameter. Email is used to create a new team.', async () => {
      const response = await supertest(app).get('/user/profile?email=example');

      expect(response.statusCode).toEqual(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([{ param: 'email', type: 'invalid_string' }])
      );
    });

    it('should create a new user and a new team', async () => {
      const response = await supertest(app).get(
        '/user/profile?email=example@example.com'
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.firstSignIn.substr(0, 10)).toEqual(
        new Date().toISOString().substring(0, 10)
      ); // Compare only the date, the user should be create today
      expect(response.body.teamList[0].displayName).toEqual('New Team');
    });
  });
});
