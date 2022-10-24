import { MemberModel } from '@/models/Member';
import { MemberRole, MemberStatus } from '@/types/Member';

import { AbstractRepository } from './AbstractRepository';

export class MemberRepository extends AbstractRepository {
  delete(model: MemberModel) {
    return this.dbClient.member.delete({
      where: {
        teamSkId: {
          teamId: model.teamId,
          skId: model.skId,
        },
      },
    });
  }

  async get(model: MemberModel) {
    const entity = await this.dbClient.member.findUnique({
      where: {
        teamSkId: {
          teamId: model.teamId,
          skId: model.skId,
        },
      },
    });

    if (!entity) {
      return null;
    }

    model.fromEntity(entity);
    return model;
  }

  async save(model: MemberModel) {
    await this.dbClient.member.upsert({
      create: model.toEntity(),
      update: model.toEntity(),
      where: {
        teamSkId: {
          teamId: model.teamId,
          skId: model.skId,
        },
      },
    });
  }

  deleteByKeys(teamId: string, userId: string) {
    const member = new MemberModel(teamId, userId);

    return this.delete(member);
  }

  async deleteOnlyInPending(teamId: string, verificationCode: string) {
    const member = new MemberModel(teamId, verificationCode);
    const entity = await this.dbClient.member.delete({
      where: {
        teamSkId: {
          teamId,
          skId: verificationCode,
        },
        status: MemberStatus.PENDING,
      },
    });

    if (!entity) {
      return null;
    }

    member.fromEntity(entity);
    return member;
  }

  async deleteAllMembers(teamId: string) {
    const list = await this.dbClient.member.deleteMany({
      where: {
        teamId,
      },
    });

    return list.count;
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
    // `update` method from `dynamodb-onetable` library can also return `undefined` with the `throw` set to false.
    // The typing from the library is incorrect, need to add `undefined` manually
    const entity = await this.dbClient.member.update({
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

    if (!entity) {
      return null;
    }

    member.fromEntity(entity);
    return member;
  }
}
