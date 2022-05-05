import { Team } from '@/models/Team';

import { TeamInviteEmailTemplate } from './TeamInviteEmail';

describe('TeamInviteEmail', () => {
  describe('Build Email', () => {
    it('should contain the team name in the email subject', () => {
      const team = new Team('team-123');
      team.setDisplayName('team-name-123');

      const template = new TeamInviteEmailTemplate(team, 'verification-123');

      expect(template.buildSubject()).toContain('team-name-123');
    });

    it('should contain the link in the email body', () => {
      const team = new Team('team-123');
      team.setDisplayName('team-name-123');

      const template = new TeamInviteEmailTemplate(team, 'verification-123');

      expect(template.buildText()).toContain(
        '/join/?teamId=team-123&verificationCode=verification-123'
      );
    });
  });
});
