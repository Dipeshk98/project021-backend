import assert from 'assert';

import { getDBTable } from '@/models/DBTable';
import { Member } from '@/models/Member';
import { MemberRole, MemberStatus } from '@/types/Member';

import { MemberRepository } from './MemberRepository';

describe('MemberRepository', () => {
  let memberRepository: MemberRepository;

  beforeEach(() => {
    memberRepository = new MemberRepository(getDBTable());
  });

  describe('Basic operation', () => {
    it("should return null when the team member don't exist", async () => {
      const member = await memberRepository.findByKeys('team-123', 'user-123');

      expect(member).toBeNull();
    });

    it('should create a team member when saving a non-existing one and and be able to get the member from the database', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const savedMember = new Member(teamId, userId);
      savedMember.setEmail('random@example.com');
      await memberRepository.save(savedMember);

      const member = await memberRepository.findByKeys(teamId, userId);
      assert(member !== null, "member shouldn't be null");
      expect(member.getEmail()).toEqual('random@example.com');
      expect(member.getStatus()).toEqual(MemberStatus.PENDING);
    });

    it('should create a todo when saving a non-existing one and update when saving again', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const savedMember = new Member(teamId, userId);
      savedMember.setEmail('random@example.com');
      await memberRepository.save(savedMember);

      savedMember.setEmail('new-random@example.com');
      await memberRepository.save(savedMember);

      const member = await memberRepository.findByKeys(teamId, userId);
      assert(member !== null, "member shouldn't be null");
      expect(member.getEmail()).toEqual('new-random@example.com');
      expect(member.getStatus()).toEqual(MemberStatus.PENDING);
    });

    it("shouldn't be able to delete an non-existing team member", async () => {
      const deleteResult = await memberRepository.deleteByKeys(
        'team-123',
        'user-123'
      );

      expect(deleteResult).toBeFalsy();
    });

    it('should add a new team member and delete the newly created team member', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const savedMember = new Member(teamId, userId);
      await memberRepository.save(savedMember);

      const deleteResult = await memberRepository.deleteByKeys(teamId, userId);
      expect(deleteResult).toBeTruthy();

      const member = await memberRepository.findByKeys(teamId, userId);
      expect(member).toBeNull();
    });

    it("shouldn't be able to delete an non-existing team member with deleteOnlyInPending method", async () => {
      const deleteResult = await memberRepository.deleteOnlyInPending(
        'team-123',
        'user-123'
      );

      expect(deleteResult).toBeFalsy();
    });

    it("shouldn't be able to delete when the status isn't in pending", async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const savedMember = new Member(teamId, userId);
      savedMember.setStatus(MemberStatus.ACTIVE);
      await memberRepository.save(savedMember);

      const deleteResult = await memberRepository.deleteOnlyInPending(
        teamId,
        userId
      );
      expect(deleteResult).toBeFalsy();

      const member = await memberRepository.findByKeys(teamId, userId);
      expect(member).not.toBeNull();
    });

    it('should be able to delete the team member in pending status', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const savedMember = new Member(teamId, userId);
      await memberRepository.save(savedMember);

      const deleteResult = await memberRepository.deleteOnlyInPending(
        teamId,
        userId
      );
      expect(deleteResult).toBeTruthy();

      const member = await memberRepository.findByKeys(teamId, userId);
      expect(member).toBeNull();
    });

    it('should get an empty team member list', async () => {
      const list = await memberRepository.findAllByTeamId('team-123');
      expect(list).toHaveLength(0);
    });

    it('should update the team member email', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const savedMember = new Member(teamId, userId);
      savedMember.setEmail('random@example.com');
      await memberRepository.save(savedMember);

      await memberRepository.updateEmail(
        teamId,
        userId,
        'new-random@example.com'
      );

      const member = await memberRepository.findByKeys(teamId, userId);
      assert(member !== null, "member shouldn't be null");
      expect(member.getEmail()).toEqual('new-random@example.com');
    });

    it('should update the team member role to `ADMIN`', async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const savedMember = new Member(teamId, userId);
      savedMember.setRole(MemberRole.READ_ONLY);
      savedMember.setEmail('random@example.com');
      await memberRepository.save(savedMember);

      await memberRepository.updateRoleIfNotOwner(
        teamId,
        userId,
        MemberRole.ADMIN
      );

      const member = await memberRepository.findByKeys(teamId, userId);
      assert(member !== null, "member shouldn't be null");
      expect(member.getRole()).toEqual(MemberRole.ADMIN);
    });

    it("shouldn't update the team member role when he is an `OWNER`", async () => {
      const teamId = 'team-123';
      const userId = 'user-123';
      const savedMember = new Member(teamId, userId);
      savedMember.setRole(MemberRole.OWNER);
      savedMember.setEmail('random@example.com');
      await memberRepository.save(savedMember);

      const updateRes = await memberRepository.updateRoleIfNotOwner(
        teamId,
        userId,
        MemberRole.READ_ONLY
      );
      expect(updateRes).toBeNull();
    });

    it('should return null when there is member to delete', async () => {
      const list = await memberRepository.deleteAllMembers('team-123');

      expect(list).toBeNull();
    });
  });

  describe('Batch manipulation', () => {
    const teamId = 'team-123';
    const userId = 'user-123';

    let member1: Member;
    let member2: Member;
    let member3: Member;

    beforeEach(async () => {
      // Member 1 in pending
      member1 = new Member(teamId);
      member1.setEmail('example1@example.com');
      await memberRepository.save(member1);

      // Member 2 in active
      member2 = new Member(teamId, userId);
      member2.setEmail('example2@example.com');
      await memberRepository.save(member2);

      // Member 3 in pending
      member3 = new Member(teamId);
      member3.setEmail('example3@example.com');
      await memberRepository.save(member3);
    });

    it('should retrieve all team members', async () => {
      const list = await memberRepository.findAllByTeamId(teamId);
      expect(list).toHaveLength(3);

      // The order isn't always the same. So, we won't able to rely on array index.
      // `skId` can be a userId or a random string.
      expect(list).toEqual(expect.arrayContaining([member2]));
    });

    it('should remove all members', async () => {
      let list = await memberRepository.findAllByTeamId(teamId);
      expect(list).toHaveLength(3);

      const deletedList = await memberRepository.deleteAllMembers(teamId);

      list = await memberRepository.findAllByTeamId(teamId);
      expect(list).toHaveLength(0);

      assert(deletedList !== null, "deletedList shouldn't be null");
      expect(deletedList).toHaveLength(3);
      expect(deletedList).toEqual(
        expect.arrayContaining([member1, member2, member3])
      );
    });
  });
});
