import type { Member, PrismaClient } from '@prisma/client';
import { InvitationStatus, Role } from '@prisma/client';

import { MemberModel } from '@/models/MemberModel';

import { AbstractRepository } from './AbstractRepository';

export class MemberRepository extends AbstractRepository<Member, MemberModel> {
  constructor(dbClient: PrismaClient) {
    super(dbClient, 'member');
  }

  deleteByKeys(teamId: string, inviteCodeOrUserId: string) {
    const member = new MemberModel(teamId, inviteCodeOrUserId);

    return this.delete(member);
  }

  async deleteOnlyInPending(teamId: string, verificationCode: string) {
    const member = new MemberModel(teamId, verificationCode);
    let entity: Member | null = null;

    await this.catchNotFound(async () => {
      entity = await this.dbClient.member.delete({
        where: {
          teamInviteCodeOrUserId: {
            teamId,
            inviteCodeOrUserId: verificationCode,
          },
          status: InvitationStatus.PENDING,
        },
      });
    });

    if (!entity) {
      return null;
    }

    member.fromEntity(entity);
    return member;
  }

  async deleteAllMembers(teamId: string) {
    const list = await this.dbClient.member.findMany({
      where: {
        teamId,
      },
    });

    const deleteRes = await this.dbClient.member.deleteMany({
      where: {
        teamId,
      },
    });

    if (deleteRes.count === 0) {
      return null;
    }

    return list.map((elt) => {
      const member = new MemberModel(elt.teamId, elt.inviteCodeOrUserId);
      member.fromEntity(elt);
      return member;
    });
  }

  findByKeys(teamId: string, inviteCodeOrUserId: string) {
    const member = new MemberModel(teamId, inviteCodeOrUserId);

    return this.get(member);
  }

  async findAllByTeamId(teamId: string, status?: InvitationStatus) {
    const list = await this.dbClient.member.findMany({
      where: {
        teamId,
        status,
      },
    });

    return list.map((elt) => {
      const member = new MemberModel(teamId, elt.inviteCodeOrUserId);
      member.fromEntity(elt);
      return member;
    });
  }

  async updateEmail(teamId: string, inviteCodeOrUserId: string, email: string) {
    await this.dbClient.member.update({
      data: {
        email,
      },
      where: {
        teamInviteCodeOrUserId: {
          teamId,
          inviteCodeOrUserId,
        },
      },
    });
  }

  async updateRole(teamId: string, inviteCodeOrUserId: string, role: Role) {
    await this.dbClient.member.update({
      data: {
        role,
      },
      where: {
        teamInviteCodeOrUserId: {
          teamId,
          inviteCodeOrUserId,
        },
      },
    });
  }

  async updateRoleIfNotOwner(
    teamId: string,
    inviteCodeOrUserId: string,
    role: Role
  ) {
    const member = new MemberModel(teamId, inviteCodeOrUserId);
    let entity: Member | null = null;

    await this.catchNotFound(async () => {
      entity = await this.dbClient.member.update({
        data: {
          role,
        },
        where: {
          teamInviteCodeOrUserId: {
            teamId,
            inviteCodeOrUserId,
          },
          role: {
            not: Role.OWNER,
          },
        },
      });
    });

    if (!entity) {
      return null;
    }

    member.fromEntity(entity);
    return member;
  }
}
