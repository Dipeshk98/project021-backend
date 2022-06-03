import assert from 'assert';

import { getDbClient } from '@/utils/DBClient';

import { UserService } from './UserService';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(getDbClient());
  });

  describe('Get/Create User', () => {
    it("should return null when the user don't exist", async () => {
      const userId = 'user-123';
      const user = await userService.findByUserId(userId);

      expect(user).toBeNull();
    });

    it('should create a new user and be able to get the user from the db', async () => {
      const userId = 'user-123';
      await userService.create(userId);

      const user = await userService.findByUserId(userId);

      assert(user !== null, "user shouldn't be null");
      expect(user.id).toEqual('user-123');
    });

    it("should create a new user with `findOrCreate` because the user don't exist", async () => {
      const userId = 'user-123';
      const user = await userService.findOrCreate(userId);

      assert(user !== null, "user shouldn't be null");
      expect(user.id).toEqual('user-123');
    });

    it("shouldn't create a new user using `findOrCreate` method", async () => {
      const userId = 'user-123';
      let user = await userService.create(userId);

      userService.create = jest.fn();
      user = await userService.findOrCreate(userId);
      assert(user !== null, "user shouldn't be null");
      expect(user.id).toEqual('user-123');
      expect(userService.create).not.toHaveBeenCalled();
    });

    it("should throw an exception when the user don't exist", async () => {
      const userId = 'user-123';

      await expect(userService.strictFindByUserId(userId)).rejects.toThrow(
        /Incorrect UserID/
      );
    });
  });

  describe('User and Team', () => {
    it("shouldn't belong to the team by default", async () => {
      const userId = 'user-123';
      const teamId = 'team-123';
      await userService.create(userId);

      await expect(
        userService.findAndVerifyTeam(userId, teamId)
      ).rejects.toThrow("isn't a team member");
    });

    it('should add user to the team', async () => {
      const userId = 'user-123';
      const teamId = 'team-123';
      let user = await userService.create(userId);

      // Add user to the team
      assert(user !== null, "user shouldn't be null");
      user.addTeam(teamId);
      await userService.update(user);

      // Verify user belongs to the team
      user = await userService.findAndVerifyTeam(userId, teamId);
      assert(user !== null, "user shouldn't be null");
      expect(user.id).toEqual('user-123');
    });
  });
});
