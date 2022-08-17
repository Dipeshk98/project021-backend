import assert from 'assert';

import { getDBTable } from '@/models/DBTable';
import { User } from '@/models/User';

import { UserRepository } from './UserRepository';

describe('UserRepository', () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository(getDBTable());
  });

  describe('Basic operation', () => {
    it("should return null when the user don't exist", async () => {
      const user = await userRepository.findByUserId('user-123');

      expect(user).toBeNull();
    });

    it('should create a new user and be able to get the user from the database', async () => {
      await userRepository.createWithUserId('user-123');

      const user = await userRepository.findByUserId('user-123');

      assert(user !== null, "user shouldn't be null");
      expect(user.id).toEqual('user-123');
    });

    it("should create a new user with `findOrCreate` because the user don't exist", async () => {
      const user = await userRepository.findOrCreate('user-123');

      assert(user !== null, "user shouldn't be null");
      expect(user.id).toEqual('user-123');
    });

    it("shouldn't create a new user using `findOrCreate` method", async () => {
      const userId = 'user-123';
      let user = await userRepository.createWithUserId(userId);

      userRepository.createWithUserId = jest.fn();
      user = await userRepository.findOrCreate(userId);
      assert(user !== null, "user shouldn't be null");
      expect(user.id).toEqual('user-123');
      expect(userRepository.createWithUserId).not.toHaveBeenCalled();
    });

    it("should throw an exception when the user don't exist", async () => {
      await expect(
        userRepository.strictFindByUserId('user-123')
      ).rejects.toThrow(/Incorrect UserID/);
    });

    it('should be able to save an non-existing user and be able to get the user from the database', async () => {
      const userId = 'user-123';
      const savedUser = new User(userId);
      await userRepository.save(savedUser);

      const user = await userRepository.findByUserId(userId);

      assert(user !== null, "user shouldn't be null");
      expect(user.id).toEqual('user-123');
    });

    it('should able to save an existing user', async () => {
      const userId = 'user-123';
      await userRepository.createWithUserId(userId);

      const savedUser = new User(userId);
      savedUser.addTeam('team-1');
      savedUser.addTeam('team-2');
      savedUser.addTeam('team-3');
      await userRepository.save(savedUser);

      const user = await userRepository.findByUserId(userId);

      assert(user !== null, "user shouldn't be null");
      expect(user.getTeamList()).toEqual(['team-1', 'team-2', 'team-3']);
    });
  });

  describe('User and Team', () => {
    it("shouldn't belong to the team by default", async () => {
      const userId = 'user-123';
      await userRepository.createWithUserId(userId);

      await expect(
        userRepository.findAndVerifyTeam(userId, 'team-123')
      ).rejects.toThrow("isn't a team member");
    });

    it('should add user to the team', async () => {
      const userId = 'user-123';
      const teamId = 'team-123';
      let user = await userRepository.createWithUserId(userId);

      // Add user to the team
      assert(user !== null, "user shouldn't be null");
      user.addTeam(teamId);
      await userRepository.save(user);

      // Verify user belongs to the team
      user = await userRepository.findAndVerifyTeam(userId, teamId);
      assert(user !== null, "user shouldn't be null");
      expect(user.id).toEqual('user-123');
    });
  });
});
