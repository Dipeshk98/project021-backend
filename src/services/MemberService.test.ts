import { Member } from '@/models/Member';
import { getDbClient } from '@/utils/DBClient';

import { MemberService } from './MemberService';

describe('MemberService', () => {
  let memberService: MemberService;

  beforeEach(() => {
    memberService = new MemberService(getDbClient());
  });

  describe('Batch manipulation (loop)', () => {
    const teamId = 'team-123';
    const userId = 'user-123';

    beforeEach(async () => {
      // Member 1 in pending
      const member1 = new Member(teamId);
      member1.setEmail('example1@example.com');
      await memberService.save(member1);

      // Member 2 in active
      const member2 = new Member(teamId, userId);
      member2.setEmail('example2@example.com');
      await memberService.save(member2);

      // Member 3 in pending
      const member3 = new Member(teamId);
      member3.setEmail('example3@example.com');
      await memberService.save(member3);
    });

    it('should get the member email', async () => {
      const list = await memberService.findAllByTeamId(teamId);
      expect(list).toHaveLength(3);

      // The order isn't always the same. So, we won't able to rely on array index.
      // `skId` can be a userId or a random string.
      expect(list).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            email: 'example2@example.com',
            skId: 'user-123',
          }),
        ])
      );
    });

    it('should remove all members', async () => {
      let list = await memberService.findAllByTeamId(teamId);
      expect(list).toHaveLength(3);

      await memberService.deleteAllMembers(teamId);

      list = await memberService.findAllByTeamId(teamId);
      expect(list).toHaveLength(0);
    });
  });
});
