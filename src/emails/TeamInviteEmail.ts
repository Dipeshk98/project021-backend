import { Team } from 'src/models/Team';
import { Env } from 'src/utils/Env';

import { AbstractEmailTemplate } from './AbstractEmailTemplate';

export class TeamInviteEmailTemplate extends AbstractEmailTemplate {
  private team: Team;

  private verificationCode: string;

  constructor(team: Team, verificationCode: string) {
    super();
    this.team = team;
    this.verificationCode = verificationCode;
  }

  public buildSubject(): string {
    return `Invitation to join ${this.team.getDisplayName()}`;
  }

  public buildText(): string {
    return `Hi there,\n\nClick to the following link to join ${this.team.getDisplayName()} as a team member:\n${Env.getValue(
      'FRONTEND_DOMAIN_URL'
    )}/team/${this.team.id}/join/${
      this.verificationCode
    }\n\nThanks for your time.`;
  }
}
