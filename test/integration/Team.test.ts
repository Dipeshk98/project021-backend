import supertest from 'supertest';

import { app } from '@/app';
import { ErrorCode } from '@/error/ErrorCode';

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
    it('should return an error with missing user email and display name as a parameter. They are needed to create team.', async () => {
      const response = await supertest(app).post('/team/create');

      expect(response.statusCode).toEqual(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          { param: 'displayName', type: 'invalid_type' },
          { param: 'userEmail', type: 'invalid_type' },
        ])
      );
    });

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
    it("shouldn't list team members and return an error because the user isn't a team member", async () => {
      const response = await supertest(app).get(`/team/123/list-members`);

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.NOT_MEMBER);
    });

    it('should list team members', async () => {
      const response = await supertest(app).get(`/team/${teamId}/list-members`);

      expect(response.body.list[0].status).toEqual('ACTIVE');
      expect(response.body.list[0].email).toEqual('example@example.com');
    });
  });
});
