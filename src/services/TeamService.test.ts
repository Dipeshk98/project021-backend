import assert from 'assert';

import { getDBTable } from '@/models/DBTable';
import { Member } from '@/models/Member';
import { User } from '@/models/User';
import { MemberRepository } from '@/repositories/MemberRepository';
import { TeamRepository } from '@/repositories/TeamRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { MemberRole, MemberStatus } from '@/types/Member';

import { TeamService } from './TeamService';

describe('TeamService', () => {
  let teamService: TeamService;

  let teamRepository: TeamRepository;

  let userRepository: UserRepository;

  let memberRepository: MemberRepository;

  beforeEach(() => {
    const dbTable = getDBTable();
    teamRepository = new TeamRepository(dbTable);
    userRepository = new UserRepository(dbTable);
    memberRepository = new MemberRepository(dbTable);
    teamService = new TeamService(
      teamRepository,
      userRepository,
      memberRepository
    );
  });

  describe('Basic operation', () => {
    it('should create a new team and add the user as a team member', async () => {
      const user = new User('user-123');
      const createdTeam = await teamService.create(
        'team-123',
        user,
        'random@example.com'
      );

      const team = await teamRepository.findByTeamId(createdTeam.id);
      assert(team !== null, "team shouldn't be null");
      expect(team.getDisplayName()).toEqual('team-123');

      const member = await memberRepository.findByKeys(
        createdTeam.id,
        'user-123'
      );
      assert(member !== null, "todo shouldn't be null");
      expect(member.getEmail()).toEqual('random@example.com');
      expect(member.getRole()).toEqual(MemberRole.OWNER);
      expect(member.getStatus()).toEqual(MemberStatus.ACTIVE);
    });

    it("should throw an exception when the user doesn't exist", async () => {
      await expect(
        teamService.findOnlyIfTeamMember('team-123', 'user-123')
      ).rejects.toThrow(/Incorrect UserID/);
    });

    it("should throw an exception when the user isn't a team member", async () => {
      const user = await userRepository.createWithUserId('user-123');
      await teamService.create(
        'team-display-name-123',
        user,
        'random@example.com'
      );

      await expect(
        teamService.findOnlyIfTeamMember('team-123', user.id)
      ).rejects.toThrow(/isn't a team member of/);
    });

    it('should return the team when the user is a team member', async () => {
      const user = await userRepository.createWithUserId('user-123');
      const createdTeam = await teamService.create(
        'team-display-name-123',
        user,
        'random@example.com'
      );

      const team = await teamService.findOnlyIfTeamMember(
        createdTeam.id,
        user.id
      );
      assert(team !== null, "team shouldn't be null");
      expect(team.getDisplayName()).toEqual('team-display-name-123');
    });

    it("shouldn't happen: the user belongs to a team but the team doesn't exist", async () => {
      const user = new User('user-123');
      user.addTeam('team-123');
      await userRepository.save(user);

      const member = new Member('team-123', user.id);
      member.setStatus(MemberStatus.ACTIVE);
      await memberRepository.create(member);

      await expect(
        teamService.findOnlyIfTeamMember('team-123', user.id)
      ).rejects.toThrow(/Incorrect TeamID/);
    });

    it('should update the user email in all teams', async () => {
      const user = new User('user-123');
      const team1 = await teamService.create(
        'team-1',
        user,
        'random@example.com'
      );
      const team2 = await teamService.create(
        'team-2',
        user,
        'random@example.com'
      );
      const team3 = await teamService.create(
        'team-3',
        user,
        'random@example.com'
      );

      let member1 = await memberRepository.findByKeys(team1.id, user.id);
      assert(member1 !== null, "member shouldn't be null");
      expect(member1.getEmail()).toEqual('random@example.com');

      let member2 = await memberRepository.findByKeys(team2.id, user.id);
      assert(member2 !== null, "member shouldn't be null");
      expect(member2.getEmail()).toEqual('random@example.com');

      let member3 = await memberRepository.findByKeys(team3.id, user.id);
      assert(member3 !== null, "member shouldn't be null");
      expect(member3.getEmail()).toEqual('random@example.com');

      await teamService.updateEmailAllTeams(user, 'new-random@example.com');

      member1 = await memberRepository.findByKeys(team1.id, user.id);
      assert(member1 !== null, "member shouldn't be null");
      expect(member1.getEmail()).toEqual('new-random@example.com');

      member2 = await memberRepository.findByKeys(team2.id, user.id);
      assert(member2 !== null, "member shouldn't be null");
      expect(member2.getEmail()).toEqual('new-random@example.com');

      member3 = await memberRepository.findByKeys(team3.id, user.id);
      assert(member3 !== null, "member shouldn't be null");
      expect(member3.getEmail()).toEqual('new-random@example.com');
    });
  });

  describe('Team permission', () => {
    it('should create a new user and should not have a team by default', async () => {
      const userId = 'user-123';
      await userRepository.createWithUserId(userId);

      await expect(
        teamService.findAndVerifyTeam('user-123', 'team-123')
      ).rejects.toThrow("isn't a team member");
    });

    it('should create a new user, make it a team member but in `PENDING` state', async () => {
      const userId = 'user-123';
      await userRepository.createWithUserId(userId);

      const member = new Member('team-123', userId);
      member.setStatus(MemberStatus.PENDING);
      await memberRepository.create(member);

      await expect(
        teamService.findAndVerifyTeam('user-123', 'team-123')
      ).rejects.toThrow("isn't a team member");
    });

    it('should create a new user, make it a team member but incorrect permission', async () => {
      const userId = 'user-123';
      await userRepository.createWithUserId(userId);

      const member = new Member('team-123', userId);
      member.setStatus(MemberStatus.ACTIVE);
      member.setRole(MemberRole.READ_ONLY);
      await memberRepository.create(member);

      await expect(
        teamService.findAndVerifyTeam('user-123', 'team-123', [
          MemberRole.OWNER,
          MemberRole.ADMIN,
        ])
      ).rejects.toThrow('are not able to perform the action');
    });

    it('should create a new user, make it a team member but incorrect permission only owner can', async () => {
      const userId = 'user-123';
      await userRepository.createWithUserId(userId);

      const member = new Member('team-123', userId);
      member.setStatus(MemberStatus.ACTIVE);
      member.setRole(MemberRole.ADMIN);
      await memberRepository.create(member);

      await expect(
        teamService.findAndVerifyTeam('user-123', 'team-123', [
          MemberRole.OWNER,
        ])
      ).rejects.toThrow('are not able to perform the action');
    });

    it('should create a new user with a new team and verify membership and permission', async () => {
      const createdUser = new User('user-123');
      const createdTeam = await teamService.create(
        'team-display-name',
        createdUser,
        'random@example.com'
      );

      const user = await teamService.findAndVerifyTeam(
        'user-123',
        createdTeam.id
      );
      expect(user.id).toEqual('user-123');
    });

    it('should create a new user and verify he is the owner', async () => {
      const userId = 'user-123';
      await userRepository.createWithUserId(userId);

      const member = new Member('team-123', userId);
      member.setStatus(MemberStatus.ACTIVE);
      member.setRole(MemberRole.OWNER);
      await memberRepository.create(member);

      const user = await teamService.findAndVerifyTeam('user-123', 'team-123', [
        MemberRole.OWNER,
      ]);
      expect(user.id).toEqual('user-123');
    });

    it('should create a new user and verify he has the correct role', async () => {
      const userId = 'user-123';
      await userRepository.createWithUserId(userId);

      const member = new Member('team-123', userId);
      member.setStatus(MemberStatus.ACTIVE);
      member.setRole(MemberRole.ADMIN);
      await memberRepository.create(member);

      const user = await teamService.findAndVerifyTeam('user-123', 'team-123', [
        MemberRole.OWNER,
        MemberRole.ADMIN,
      ]);
      expect(user.id).toEqual('user-123');
    });
  });
});
