import assert from 'assert';

import { getDbClient } from '@/utils/DBClient';

import { UserService } from './UserService';

describe('UserService', () => {
  describe('Get/Create User', () => {
    it("should return null when the user don't exist", async () => {
      const userId = 'user-123';

      const userService = new UserService(getDbClient());
      const user = await userService.findByUserId(userId);
      expect(user).toBeNull();
    });

    it('should create a new user and be able to get the user from the db', async () => {
      const userId = 'user-123';

      // Create a new user
      const userService = new UserService(getDbClient());
      await userService.create(userId);

      // Verify if the user exists
      const user = await userService.findByUserId(userId);
      assert(user !== null, "user shouldn't be null");
      expect(user.id).toEqual(userId);
    });

    it("should create a new user because the user don't exist", async () => {
      const userId = 'user-123';

      const userService = new UserService(getDbClient());
      const user = await userService.findOrCreate(userId);
      assert(user !== null, "user shouldn't be null");
      expect(user.id).toEqual(userId);
    });

    it('should create a new user', async () => {
      const userId = 'user-123';

      // Create a new user
      const userService = new UserService(getDbClient());
      let user = await userService.create(userId);

      // Verify `findOrCreate` method doesn't create a new user
      userService.create = jest.fn();
      user = await userService.findOrCreate(userId);
      assert(user !== null, "user shouldn't be null");
      expect(user.id).toEqual(userId);
      expect(userService.create).not.toHaveBeenCalled();
    });

    it("should throw an exception when the user don't exist", async () => {
      const userId = 'user-123';

      const userService = new UserService(getDbClient());
      await expect(userService.strictFindByUserId(userId)).rejects.toThrow(
        /Incorrect UserID/
      );
    });
  });

  describe('User and Team', () => {
    it("shouldn't belong to the team by default", async () => {
      const userId = 'user-123';
      const teamId = 'team-123';

      // Create a new user
      const userService = new UserService(getDbClient());
      await userService.create(userId);

      // Verify team
      await expect(
        userService.findAndVerifyTeam(userId, teamId)
      ).rejects.toThrow(/isn't a team member/);
    });

    it('should add user to the team', async () => {
      const userId = 'user-123';
      const teamId = 'team-123';

      // Create a new user
      const userService = new UserService(getDbClient());
      let user = await userService.create(userId);

      // Add user to the team
      assert(user !== null, "user shouldn't be null");
      user.addTeam(teamId);
      await userService.update(user);

      // Verify user belongs to the team
      user = await userService.findAndVerifyTeam(userId, teamId);
      assert(user !== null, "user shouldn't be null");
      expect(user.id).toEqual(userId);
    });
  });
});
