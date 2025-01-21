import type { Member } from '@prisma/client';
import { InvitationStatus, Role } from '@prisma/client';
import { AbstractModel } from './AbstractModel';

export class MemberModel extends AbstractModel<Member> {
  public readonly teamId: string;

  public readonly inviteCodeOrUserId: string;

  private role: Role = Role.READ_ONLY;

  private status: InvitationStatus = InvitationStatus.PENDING;

  private email = '';

  constructor(teamId: string, inviteCodeOrUserId?: string) {
    super();
    this.teamId = teamId;
    this.inviteCodeOrUserId = inviteCodeOrUserId || '';
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
      teamId: this.teamId,
      inviteCodeOrUserId: this.inviteCodeOrUserId,
    };
  }

  toCreateEntity() {
    return {
      ...this.keys(),
      role: this.role,
      status: this.status,
      email: this.email,
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
    this.role = entity.role;
    this.status = entity.status;
    this.email = entity.email;
  }
}
