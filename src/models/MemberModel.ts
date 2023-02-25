import type { Member } from '@prisma/client';
import { InvitationStatus, Role } from '@prisma/client';
import { nanoid } from 'nanoid';
import { ulid } from 'ulid';

import { AbstractModel } from './AbstractModel';

export class MemberModel extends AbstractModel<Member> {
  public readonly teamId: string;

  public readonly skId: string;

  private role: Role = Role.READ_ONLY;

  private status: InvitationStatus = InvitationStatus.PENDING;

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
      this.skId = ulid() + nanoid(30);
    }
  }

  getTeamId() {
    return this.teamId;
  }

  setRole(role: Role) {
    this.role = role;
  }

  getRole() {
    return this.role;
  }

  setStatus(status: InvitationStatus) {
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
    this.role = Role[entity.role];
    this.status = InvitationStatus[entity.status];
    this.email = entity.email;
  }
}
