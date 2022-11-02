import type { Member, PrismaClient } from '@prisma/client';

import { MemberModel } from '@/models/MemberModel';
import { MemberRole, MemberStatus } from '@/types/Member';

import { AbstractRepository } from './AbstractRepository';

export class MemberRepository extends AbstractRepository<Member, MemberModel> {
  constructor(dbClient: PrismaClient) {
    super(dbClient, 'member');
  }

  deleteByKeys(teamId: string, userId: string) {
    const member = new MemberModel(teamId, userId);

    return this.delete(member);
  }

  async deleteOnlyInPending(teamId: string, verificationCode: string) {
    const member = new MemberModel(teamId, verificationCode);
    let entity: Member | null = null;

    await this.catchNotFound(async () => {
      entity = await this.dbClient.member.delete({
        where: {
          teamSkId: {
            teamId,
            skId: verificationCode,
          },
          status: MemberStatus.PENDING,
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
      const member = new MemberModel(elt.teamId, elt.skId);
      member.fromEntity(elt);
      return member;
    });
  }

  findByKeys(teamId: string, userId: string) {
    const member = new MemberModel(teamId, userId);

    return this.get(member);
  }

  async findAllByTeamId(teamId: string) {
    const list = await this.dbClient.member.findMany({
      where: {
        teamId,
      },
    });

    return list.map((elt) => {
      const member = new MemberModel(teamId, elt.skId);
      member.fromEntity(elt);
      return member;
    });
  }

  async updateEmail(teamId: string, userId: string, email: string) {
    await this.dbClient.member.update({
      data: {
        email,
      },
      where: {
        teamSkId: {
          teamId,
          skId: userId,
        },
      },
    });
  }

  async updateRoleIfNotOwner(teamId: string, userId: string, role: MemberRole) {
    const member = new MemberModel(teamId, userId);
    let entity: Member | null = null;

    await this.catchNotFound(async () => {
      entity = await this.dbClient.member.update({
        data: {
          role,
        },
        where: {
          teamSkId: {
            teamId,
            skId: userId,
          },
          role: {
            not: MemberRole.OWNER,
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
