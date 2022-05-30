import supertest from 'supertest';

import { app } from '@/app';

describe('Team', () => {
  let teamId: string;

  beforeAll(() => {
    app.request.currentUserId = '123';
  });

  beforeEach(async () => {
    const response = await supertest(app).get(
      '/user/profile?email=example@example.com'
    );
    teamId = response.body.teamList[0].id;
  });

  describe('Create team', () => {
    it('should create a team with the correct displayName', async () => {
      const response = await supertest(app).post('/team/create').send({
        userEmail: 'example@example.com',
        displayName: 'Team display name',
      });

      expect(response.statusCode).toEqual(200);
      expect(response.body.displayName).toEqual('Team display name');
    });
  });

  describe('List team members', () => {
    it('should list team members', async () => {
      const response = await supertest(app).get(`/team/${teamId}/list-members`);

      expect(response.body.list[0].status).toEqual('ACTIVE');
      expect(response.body.list[0].email).toEqual('example@example.com');
    });
  });
});
