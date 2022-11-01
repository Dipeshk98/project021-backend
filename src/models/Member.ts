import type { Member } from '@prisma/client';
import { nanoid } from 'nanoid';

import { MemberRole, MemberStatus } from '@/types/Member';

import { AbstractModel } from './AbstractModel';

export class MemberModel extends AbstractModel<Member> {
  public readonly teamId: string;

  public readonly skId: string;

  private role = MemberRole.READ_ONLY;

  private status = MemberStatus.PENDING;

  private email = '';

  /**
   * Constructor for Member class.
   * @constructor
   * @param teamId - The ID of the team.
   * @param userId - The ID of the user. Leave it empty for `MemberStatus.PENDING` when the user didn't accept the invitation yet.
   */
  constructor(teamId: string, userId?: string) {
    super();
    this.teamId = teamId;

    if (userId) {
      this.skId = userId;
    } else {
      // In pending status, we use the skId for verification code
      this.skId = nanoid(30);
    }
  }

  getTeamId() {
    return this.teamId;
  }

  setRole(role: MemberRole) {
    this.role = role;
  }

  getRole() {
    return this.role;
  }

  setStatus(status: MemberStatus) {
    this.status = status;
  }

  getStatus() {
    return this.status;
  }

  setEmail(email: string) {
    this.email = email;
  }

  getEmail() {
    return this.email;
  }

  keys() {
    return {
      teamSkId: {
        teamId: this.teamId,
        skId: this.skId,
      },
    };
  }

  toCreateEntity() {
    return {
      ...this.keys().teamSkId,
      ...this.toEntity(),
    };
  }

  toEntity() {
    return {
      role: this.role,
      status: this.status,
      email: this.email,
    };
  }

  fromEntity(entity: Member) {
    this.role = MemberRole[entity.role];
    this.status = MemberStatus[entity.status];
    this.email = entity.email;
  }
}
