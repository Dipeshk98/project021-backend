import { nanoid } from 'nanoid';

import { MemberRole, MemberStatus } from '@/types/Member';

import { AbstractModel } from './AbstractModel';
import type { MemberEntity } from './Schema';

export class Member extends AbstractModel<MemberEntity> {
  static BEGINS_KEYS = 'MEMBER#';

  public readonly teamId: string;

  public readonly skId: string;

  private role = MemberRole.READ_ONLY;

  private status = MemberStatus.PENDING;

  private email?: string;

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

  get pk() {
    return `${Member.BEGINS_KEYS}${this.teamId}`;
  }

  get sk() {
    return `${Member.BEGINS_KEYS}${this.skId}`;
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

  toEntity() {
    return {
      ...this.keys(),
      email: this.email,
      role: this.role,
      status: this.status,
    };
  }

  fromEntity(entity: MemberEntity) {
    if (entity.email) this.email = entity.email;

    if (entity.role) this.role = MemberRole[entity.role];

    if (entity.status) this.status = MemberStatus[entity.status];
  }

  static removeBeginsKeys(pk: string) {
    return pk.replace(Member.BEGINS_KEYS, '');
  }
}
