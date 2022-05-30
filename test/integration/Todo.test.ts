import supertest from 'supertest';

import { app } from '@/app';
import { ErrorCode } from '@/error/ErrorCode';

describe('Todo', () => {
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

  describe('Create todo', () => {
    it('should return an error with a missing title as a parameter. Title is needed to create a todo.', async () => {
      const response = await supertest(app).post(`/${teamId}/todo/create`);

      expect(response.statusCode).toEqual(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([{ param: 'title', type: 'invalid_type' }])
      );
    });

    it("shouldn't create todo and return an error because the user isn't a member", async () => {
      const response = await supertest(app).post(`/123/todo/create`).send({
        title: 'Todo title',
      });

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.NOT_MEMBER);
    });

    it('should create a todo with the correct title', async () => {
      const response = await supertest(app)
        .post(`/${teamId}/todo/create`)
        .send({
          title: 'Todo title',
        });

      expect(response.statusCode).toEqual(200);
      expect(response.body.title).toEqual('Todo title');
    });
  });

  describe('Get todo', () => {
    it("shouldn't be able to get a non-existing todo and throw an exception", async () => {
      const response = await supertest(app).get(`/${teamId}/todo/123`);

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.INCORRECT_TODO_ID);
    });

    it("shouldn't get todo and return an error because the user isn't a member", async () => {
      const response = await supertest(app).get(`/123/todo/123`);

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.NOT_MEMBER);
    });

    it('should create a todo and be able to get the todo', async () => {
      let response = await supertest(app).post(`/${teamId}/todo/create`).send({
        title: 'Todo title',
      });

      const todoId = response.body.id;

      response = await supertest(app).get(`/${teamId}/todo/${todoId}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body.title).toEqual('Todo title');
    });
  });

  describe('Delete todo', () => {
    it("shouldn't delete todo and return an error because the user isn't a member", async () => {
      const response = await supertest(app).delete(`/123/todo/123`);

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.NOT_MEMBER);
    });

    it("shouldn't be able to delete a non-existing todo and throw an exception", async () => {
      const response = await supertest(app).delete(`/${teamId}/todo/123`);

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.INCORRECT_TODO_ID);
    });

    it('should create a todo and be able to delete the newly created todo', async () => {
      let response = await supertest(app).post(`/${teamId}/todo/create`).send({
        title: 'Todo title',
      });
      const todoId = response.body.id;

      response = await supertest(app).delete(`/${teamId}/todo/${todoId}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body.success).toBeTruthy();
    });
  });

  describe('Update todo', () => {
    it('should return an error with a missing title as a parameter. Title is needed to update a todo', async () => {
      const response = await supertest(app).put(`/${teamId}/todo/123`);

      expect(response.statusCode).toEqual(400);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([{ param: 'title', type: 'invalid_type' }])
      );
    });

    it("shouldn't update todo title and return an error because the user isn't a team member", async () => {
      const response = await supertest(app).put('/123/todo/123').send({
        title: 'New title',
      });

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.NOT_MEMBER);
    });

    it("shouldn't be able to update a non-existing todo and return an error", async () => {
      const response = await supertest(app).put(`/${teamId}/todo/123`).send({
        title: 'New title',
      });

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.INCORRECT_TODO_ID);
    });

    it('should create a todo and be able to update the newly created todo title', async () => {
      let response = await supertest(app).post(`/${teamId}/todo/create`).send({
        title: 'Todo title',
      });
      const todoId = response.body.id;

      response = await supertest(app).put(`/${teamId}/todo/${todoId}`).send({
        title: 'New title',
      });
      expect(response.statusCode).toEqual(200);
      expect(response.body.title).toEqual('New title');
    });
  });

  describe('List todo', () => {
    it("shouldn't list todo and return an error because the user isn't a team member", async () => {
      const response = await supertest(app).get(`/123/todo/list`);

      expect(response.statusCode).toEqual(500);
      expect(response.body.errors).toEqual(ErrorCode.NOT_MEMBER);
    });

    it('should return an empty list', async () => {
      const response = await supertest(app).get(`/${teamId}/todo/list`);

      expect(response.statusCode).toEqual(200);
      expect(response.body.list).toEqual([]);
    });

    it('should create 3 todos, remove one todo and list', async () => {
      let response = await supertest(app).post(`/${teamId}/todo/create`).send({
        title: 'Todo title one',
      });

      response = await supertest(app).post(`/${teamId}/todo/create`).send({
        title: 'Todo title two',
      });
      const todoId = response.body.id;

      response = await supertest(app).post(`/${teamId}/todo/create`).send({
        title: 'Todo title three',
      });

      response = await supertest(app).delete(`/${teamId}/todo/${todoId}`);

      response = await supertest(app).get(`/${teamId}/todo/list`);
      expect(response.statusCode).toEqual(200);
      expect(response.body.list).toHaveLength(2);
      expect(response.body.list[0]!.title).toEqual('Todo title one');
      expect(response.body.list[1]!.title).toEqual('Todo title three');
    });
  });
});
