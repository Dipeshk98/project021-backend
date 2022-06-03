import { mockSendMail } from '__mocks__/nodemailer';
import supertest from 'supertest';

import { app } from '@/app';
import { ErrorCode } from '@/error/ErrorCode';
import { MemberStatus } from '@/types/MemberStatus';

describe('Team', () => {
  let teamId: string;

  beforeEach(async () => {
    app.request.currentUserId = '123';

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

  describe('Update team name', () => {
    it('should return an error with missing display name as a parameter. Display name is needed to update team name', async () => {
      const response = await supertest(app).put(`/team/${teamId}/name`);

      expect(response.statusCode).toEqual(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([{ param: 'displayName', type: 'invalid_type' }])
      );
    });

    it("shouldn't update team name and return an error because the user isn't a team member", async () => {
      const response = await supertest(app).put(`/team/123/name`).send({
        displayName: 'Team display name',
      });

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.NOT_MEMBER);
    });

    it('should be able to update the team name', async () => {
      const response = await supertest(app).put(`/team/${teamId}/name`).send({
        displayName: 'New Team display name',
      });

      expect(response.statusCode).toEqual(200);
      expect(response.body.displayName).toEqual('New Team display name');
    });
  });

  describe('Delete team', () => {
    it("shouldn't delete team and return an error because the user isn't a team member", async () => {
      const response = await supertest(app).delete(`/team/123`);

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.NOT_MEMBER);
    });

    it("should delete team and shouldn't be able to retrieve team member list", async () => {
      let response = await supertest(app).delete(`/team/${teamId}`);

      expect(response.statusCode).toEqual(200);
      expect(response.body.success).toBeTruthy();

      response = await supertest(app).get(`/team/${teamId}/list-members`);
      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.NOT_MEMBER);
    });
  });

  describe('Get team settings', () => {
    it("shouldn't get the team settings and return an error because the user isn't a team member", async () => {
      const response = await supertest(app).get(`/team/123/settings`);

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.NOT_MEMBER);
    });

    it('should return team settings', async () => {
      const response = await supertest(app).get(`/team/${teamId}/settings`);

      expect(response.statusCode).toEqual(200);
      expect(response.body.hasStripeCustomerId).toBeFalsy();
      expect(response.body.planId).toEqual('FREE');
    });
  });

  describe('Invite team members', () => {
    it("should return an error with missing email as a parameter. It's needed to invite team member.", async () => {
      const response = await supertest(app).post(`/team/${teamId}/invite`);

      expect(response.statusCode).toEqual(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([{ param: 'email', type: 'invalid_type' }])
      );
    });

    it("shouldn't invite team member and return an error because the user isn't a team member", async () => {
      const response = await supertest(app).post(`/team/123/invite`).send({
        email: 'example@example.com',
      });

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.NOT_MEMBER);
    });

    it('should send invitation by sending email', async () => {
      const response = await supertest(app)
        .post(`/team/${teamId}/invite`)
        .send({
          email: 'example@example.com',
        });

      expect(response.statusCode).toEqual(200);
      expect(response.body.status).toEqual(MemberStatus.PENDING);

      // Verify if the email is sent
      expect(mockSendMail).toHaveBeenCalled();
      expect(mockSendMail).toBeCalledWith(
        expect.objectContaining({
          to: 'example@example.com',
        })
      );
    });
  });

  describe('Get join info', () => {
    it("shouldn't return join information and return an error because the team doesn't exist.", async () => {
      const response = await supertest(app).get(`/team/123/join/123`);

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.INCORRECT_TEAM_ID);
    });

    it("shouldn't return join information and return an error with incorrect verification code.", async () => {
      const response = await supertest(app).get(
        `/team/${teamId}/join/INCORRECT`
      );

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.INCORRECT_CODE);
    });

    it('should return team information', async () => {
      let response = await supertest(app).post(`/team/${teamId}/invite`).send({
        email: 'example@example.com',
      });

      const verificationCode = mockSendMail.mock.calls[0][0].text.match(
        /&verificationCode=(\S+)/
      )[1]; // \S+ gets all characters until a whitespace, tab, new line, etc.

      response = await supertest(app).get(
        `/team/${teamId}/join/${verificationCode}`
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.displayName).toEqual('New Team');
    });
  });

  describe('Join team', () => {
    it('should return an error with missing email as a parameter. Email is needed to join team.', async () => {
      const response = await supertest(app).post(`/team/${teamId}/join/123`);

      expect(response.statusCode).toEqual(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([{ param: 'email', type: 'invalid_type' }])
      );
    });

    it("shouldn't join team and return an error because the user is already a member.", async () => {
      let response = await supertest(app).post(`/team/${teamId}/invite`).send({
        email: 'example@example.com',
      });

      const verificationCode = mockSendMail.mock.calls[0][0].text.match(
        /&verificationCode=(\S+)/
      )[1]; // \S+ gets all characters until a whitespace, tab, new line, etc.

      response = await supertest(app)
        .post(`/team/${teamId}/join/${verificationCode}`)
        .send({
          email: 'user2@example.com',
        });

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.ALREADY_MEMBER);
    });

    it("shouldn't join team and return an error with incorrect verification code.", async () => {
      // Using different user ID
      app.request.currentUserId = '125';

      let response = await supertest(app).get(
        '/user/profile?email=user2@example.com'
      );

      response = await supertest(app)
        .post(`/team/${teamId}/join/INCORRECT`)
        .send({
          email: 'user2@example.com',
        });

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.INCORRECT_CODE);
    });

    it('should send invitation by sending email and a second user join the team', async () => {
      let response = await supertest(app).post(`/team/${teamId}/invite`).send({
        email: 'user2@example.com',
      });

      const verificationCode = mockSendMail.mock.calls[0][0].text.match(
        /&verificationCode=(\S+)/
      )[1]; // \S+ gets all characters until a whitespace, tab, new line, etc.

      // Using different user ID
      app.request.currentUserId = '125';

      response = await supertest(app).get(
        '/user/profile?email=user2@example.com'
      );

      response = await supertest(app)
        .post(`/team/${teamId}/join/${verificationCode}`)
        .send({
          email: 'user2@example.com',
        });

      expect(response.statusCode).toEqual(200);
      expect(response.body.status).toEqual(MemberStatus.ACTIVE);
    });
  });

  describe('Delete team member', () => {
    it("shouldn't delete team member and return an error because the user isn't a team member", async () => {
      const response = await supertest(app).delete(`/team/123/remove/123`);

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.NOT_MEMBER);
    });

    it("shouldn't delete team member and return an error with incorrect member id in 'PENDING' status", async () => {
      const response = await supertest(app).delete(
        `/team/${teamId}/remove/INCORRECT?isPending=true`
      );

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.INTERNAL_SERVER_ERROR);
    });

    it("should send invitation and remove invitation in 'PENDING' status", async () => {
      let response = await supertest(app).post(`/team/${teamId}/invite`).send({
        email: 'user2@example.com',
      });

      const verificationCode = mockSendMail.mock.calls[0][0].text.match(
        /&verificationCode=(\S+)/
      )[1]; // \S+ gets all characters until a whitespace, tab, new line, etc.

      response = await supertest(app).delete(
        `/team/${teamId}/remove/${verificationCode}?isPending=true`
      );

      expect(response.body.success).toBeTruthy();
    });

    it("shouldn't delete team member and return an error with incorrect member id in 'ACTIVE' status", async () => {
      const response = await supertest(app).delete(
        `/team/${teamId}/remove/INCORRECT`
      );

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.INCORRECT_USER_ID);
    });

    it('should add a new user in team and remove it from the team', async () => {
      let response = await supertest(app).post(`/team/${teamId}/invite`).send({
        email: 'user2@example.com',
      });

      const verificationCode = mockSendMail.mock.calls[0][0].text.match(
        /&verificationCode=(\S+)/
      )[1]; // \S+ gets all characters until a whitespace, tab, new line, etc.

      // Using different user ID
      app.request.currentUserId = '125';

      response = await supertest(app).get(
        '/user/profile?email=user2@example.com'
      );

      response = await supertest(app)
        .post(`/team/${teamId}/join/${verificationCode}`)
        .send({
          email: 'user2@example.com',
        });

      // Back to the original user ID
      app.request.currentUserId = '123';

      response = await supertest(app).delete(`/team/${teamId}/remove/125`);

      expect(response.statusCode).toEqual(200);
      expect(response.body.success).toBeTruthy();
    });

    it('should remove the user himself from the team', async () => {
      const response = await supertest(app).delete(
        `/team/${teamId}/remove/123`
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.success).toBeTruthy();
    });
  });

  describe('Complex invitation workflow', () => {
    it('should send 2 invitations with ACTIVE and PENDING status in listing', async () => {
      // Send invitation and the user accept it
      let response = await supertest(app).post(`/team/${teamId}/invite`).send({
        email: 'user2@example.com',
      });

      const verificationCode = mockSendMail.mock.calls[0][0].text.match(
        /&verificationCode=(\S+)/
      )[1]; // \S+ gets all characters until a whitespace, tab, new line, etc.

      // Using different user ID
      app.request.currentUserId = '125';

      response = await supertest(app).get(
        '/user/profile?email=user2@example.com'
      );

      response = await supertest(app)
        .post(`/team/${teamId}/join/${verificationCode}`)
        .send({
          email: 'user2@example.com',
        });

      // Send another invitation without any other steps
      response = await supertest(app).post(`/team/${teamId}/invite`).send({
        email: 'user3@example.com',
      });

      response = await supertest(app).get(`/team/${teamId}/list-members`);
      expect(response.body.list).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            email: 'example@example.com',
            memberId: '123',
            status: MemberStatus.ACTIVE,
          }),
          expect.objectContaining({
            email: 'user2@example.com',
            memberId: '125',
            status: MemberStatus.ACTIVE,
          }),
          expect.objectContaining({
            email: 'user3@example.com',
            status: MemberStatus.PENDING,
          }),
        ])
      );
    });

    it('should send 2 invitation. Both are accepted but one of them will be removed.', async () => {
      // Send invitation and the user accept it. But, it'll be removed
      let response = await supertest(app).post(`/team/${teamId}/invite`).send({
        email: 'user2@example.com',
      });

      const verificationCode = mockSendMail.mock.calls[0][0].text.match(
        /&verificationCode=(\S+)/
      )[1]; // \S+ gets all characters until a whitespace, tab, new line, etc.

      // Using different user ID
      app.request.currentUserId = '125';

      response = await supertest(app).get(
        '/user/profile?email=user2@example.com'
      );

      response = await supertest(app)
        .post(`/team/${teamId}/join/${verificationCode}`)
        .send({
          email: 'user2@example.com',
        });

      // Send another invitation and the user accept it. But, it won't be removed.
      response = await supertest(app).post(`/team/${teamId}/invite`).send({
        email: 'user3@example.com',
      });

      const verificationCode2 = mockSendMail.mock.calls[1][0].text.match(
        /&verificationCode=(\S+)/
      )[1]; // \S+ gets all characters until a whitespace, tab, new line, etc.

      // Using different user ID
      app.request.currentUserId = '126';

      response = await supertest(app).get(
        '/user/profile?email=user3@example.com'
      );

      response = await supertest(app)
        .post(`/team/${teamId}/join/${verificationCode2}`)
        .send({
          email: 'user3@example.com',
        });

      // Remove the first added user
      response = await supertest(app).delete(`/team/${teamId}/remove/125`);

      response = await supertest(app).get(`/team/${teamId}/list-members`);
      expect(response.body.list).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            email: 'example@example.com',
            memberId: '123',
            status: MemberStatus.ACTIVE,
          }),
          expect.objectContaining({
            email: 'user3@example.com',
            memberId: '126',
            status: MemberStatus.ACTIVE,
          }),
        ])
      );
    });
  });
});
