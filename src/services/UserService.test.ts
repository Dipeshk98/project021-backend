import assert from 'assert';

import { getDbClient } from '@/utils/DBClient';

import { UserService } from './UserService';

describe('TodoService', () => {
  describe('Create todo', () => {
    it('should create a new user and get the user from the db', async () => {
      const userId = 'abc-123';

      const userService = new UserService(getDbClient());
      await userService.create(userId);

      const user = await userService.findByUserId(userId);

      assert(user !== null, "user shouldn't be null");
      expect(user.id).toEqual(userId);
    });
  });
});
