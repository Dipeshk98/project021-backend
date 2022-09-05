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
      const createdUser = new User('user-123');
      const createdTeam = await teamService.create(
        'team-123',
        createdUser,
        'random@example.com'
      );

      const team = await teamRepository.findByTeamId(createdTeam.id);
      assert(team !== null, "team shouldn't be null");
      expect(team.getDisplayName()).toEqual('team-123');

      const user = await userRepository.findByUserId(createdUser.id);
      assert(user !== null, "user shouldn't be null");
      expect(user.getTeamList()).toHaveLength(1);
      expect(user.getTeamList()[0]).toEqual(createdTeam.id);

      const member = await memberRepository.findByKeys(
        createdTeam.id,
        'user-123'
      );
      assert(member !== null, "member shouldn't be null");
      expect(member.getEmail()).toEqual('random@example.com');
      expect(member.getRole()).toEqual(MemberRole.OWNER);
      expect(member.getStatus()).toEqual(MemberStatus.ACTIVE);
    });

    it("should throw an exception when the user doesn't exist", async () => {
      await expect(
        teamService.requireAuthWithTeam('team-123', 'user-123')
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
        teamService.requireAuthWithTeam('team-123', user.id)
      ).rejects.toThrow(/isn't a team member of/);
    });

    it('should return the team when the user is a team member', async () => {
      const user = await userRepository.createWithUserId('user-123');
      const createdTeam = await teamService.create(
        'team-display-name-123',
        user,
        'random@example.com'
      );

      const { team } = await teamService.requireAuthWithTeam(
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
        teamService.requireAuthWithTeam('team-123', user.id)
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

    it('should raise an error when there is no team member to delete', async () => {
      await expect(teamService.delete('team-123')).rejects.toThrow(
        /Incorrect TeamID/
      );
    });

    it('should raise an error when deleting a team but there is no member. It should not happen because it should have at least the owner', async () => {
      const team = await teamRepository.createWithDisplayName('team-123');

      await expect(teamService.delete(team.id)).rejects.toThrow(
        /Nothing to delete/
      );
    });

    it('should delete team and its member', async () => {
      const createdUser = new User('user-1');
      const createdTeam = await teamService.create(
        'team-123',
        createdUser,
        'random@example.com'
      );

      const createdPendingMember = new Member(createdTeam.id);
      await memberRepository.create(createdPendingMember);

      const createdUser2 = new User('user-2');
      await teamService.join(
        createdTeam,
        createdUser2,
        'random2@example.com',
        MemberRole.ADMIN
      );

      expect(createdUser.getTeamList()[0]).toEqual(createdTeam.id);

      await teamService.delete(createdTeam.id);

      const team = await teamRepository.findByTeamId(createdTeam.id);
      expect(team).toBeNull();
      const member1 = await memberRepository.findByKeys(
        createdTeam.id,
        'user-1'
      );
      expect(member1).toBeNull();
      const member2 = await memberRepository.findByKeys(
        createdTeam.id,
        'user-2'
      );
      expect(member2).toBeNull();
      const pendingMember = await memberRepository.findByKeys(
        createdPendingMember.teamId,
        createdPendingMember.sk
      );
      expect(pendingMember).toBeNull();

      const user = await userRepository.strictFindByUserId('user-1');
      expect(user.getTeamList()).toHaveLength(0);
      const user2 = await userRepository.strictFindByUserId('user-2');
      expect(user2.getTeamList()).toHaveLength(0);
    });
  });

  describe('Team permission', () => {
    it('should not find team member with `PENDING` status', async () => {
      const createdMember = new Member('team-123', 'user-123');
      await memberRepository.create(createdMember);

      const member = await teamService.findTeamMember('user-123', 'team-123');

      expect(member).toBeNull();
    });

    it('should find team member with `ACTIVE` status only', async () => {
      const createdMember = new Member('team-123', 'user-123');
      createdMember.setStatus(MemberStatus.ACTIVE);
      await memberRepository.create(createdMember);

      const member = await teamService.findTeamMember('user-123', 'team-123');

      expect(member).not.toBeNull();
    });

    it('should create a new user and should not have a team by default', async () => {
      const userId = 'user-123';
      await userRepository.createWithUserId(userId);

      await expect(
        teamService.requireAuth('user-123', 'team-123')
      ).rejects.toThrow("isn't a team member");
    });

    it('should join a team as a member', async () => {
      const createdUser = await userRepository.createWithUserId('user-123');
      const createdTeam = await teamRepository.createWithDisplayName(
        'team-123'
      );

      await teamService.join(
        createdTeam,
        createdUser,
        'random@example.com',
        MemberRole.ADMIN
      );

      const { user } = await teamService.requireAuth(
        'user-123',
        createdTeam.id
      );
      expect(user.id).toEqual('user-123');
      expect(user.getTeamList()).toHaveLength(1);
      expect(user.getTeamList()[0]).toEqual(createdTeam.id);

      const member = await memberRepository.findByKeys(
        createdTeam.id,
        'user-123'
      );
      assert(member !== null, "member shouldn't be null");
      expect(member.getEmail()).toEqual('random@example.com');
      expect(member.getRole()).toEqual(MemberRole.ADMIN);
      expect(member.getStatus()).toEqual(MemberStatus.ACTIVE);
    });

    it('should create a new user, make it a team member but in `PENDING` state', async () => {
      const userId = 'user-123';
      await userRepository.createWithUserId(userId);

      const member = new Member('team-123', userId);
      member.setStatus(MemberStatus.PENDING);
      await memberRepository.create(member);

      await expect(
        teamService.requireAuth('user-123', 'team-123')
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
        teamService.requireAuth('user-123', 'team-123', [
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
        teamService.requireAuth('user-123', 'team-123', [MemberRole.OWNER])
      ).rejects.toThrow('are not able to perform the action');
    });

    it('should create a new user with a new team and verify membership and permission', async () => {
      const createdUser = new User('user-123');
      const createdTeam = await teamService.create(
        'team-display-name',
        createdUser,
        'random@example.com'
      );

      const { user } = await teamService.requireAuth(
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

      const { user } = await teamService.requireAuth('user-123', 'team-123', [
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

      const { user } = await teamService.requireAuth('user-123', 'team-123', [
        MemberRole.OWNER,
        MemberRole.ADMIN,
      ]);
      expect(user.id).toEqual('user-123');
    });
  });
});
