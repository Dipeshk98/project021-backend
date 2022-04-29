import { getDbClient } from '../utils/DBClient';
import { UserService } from './UserService';

describe('TodoService', () => {
  describe('Create todo', () => {
    it('test', async () => {
      const userService = new UserService(getDbClient());
      userService.create('1234567');

      const user = await userService.findByUserId('1234567');

      expect(user).toBeDefined();
    });
  });
});
