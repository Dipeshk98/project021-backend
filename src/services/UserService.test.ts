import assert from 'assert';

import { getDbClient } from '@/utils/DBClient';

import { UserService } from './UserService';

describe('UserService', () => {
  describe('Get/Create User', () => {
    it("should return null when the user don't exist", async () => {
      const userId = 'abc-123';

      const userService = new UserService(getDbClient());
      const user = await userService.findByUserId(userId);
      expect(user).toBeNull();
    });

    it('should create a new user and be able to get the user from the db', async () => {
      const userId = 'abc-123';

      // Create a new user
      const userService = new UserService(getDbClient());
      await userService.create(userId);

      // Verify if the user exists
      const user = await userService.findByUserId(userId);
      assert(user !== null, "user shouldn't be null");
      expect(user.id).toEqual(userId);
    });

    it("should create a new user because the user don't exist", async () => {
      const userId = 'abc-123';

      const userService = new UserService(getDbClient());
      const user = await userService.findOrCreate(userId);
      assert(user !== null, "user shouldn't be null");
      expect(user.id).toEqual(userId);
    });

    it('should create a new user', async () => {
      const userId = 'abc-123';

      // Create a new user
      const userService = new UserService(getDbClient());
      let user = await userService.create(userId);
      assert(user !== null, "user shouldn't be null");

      // Verify `findOrCreate` method doesn't create a new user
      userService.create = jest.fn();
      user = await userService.findOrCreate(userId);
      assert(user !== null, "user shouldn't be null");
      expect(user.id).toEqual(userId);
      expect(userService.create).not.toHaveBeenCalled();
    });

    it("should throw an exception when the user don't exist", async () => {
      const userId = 'abc-123';

      const userService = new UserService(getDbClient());
      await expect(userService.strictFindByUserId(userId)).rejects.toThrow(
        /Incorrect UserID/
      );
    });
  });
});
