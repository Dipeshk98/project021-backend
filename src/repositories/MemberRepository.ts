import type { Member } from '@prisma/client';
import { Prisma } from '@prisma/client';

import { MemberModel } from '@/models/Member';
import { MemberRole, MemberStatus } from '@/types/Member';

import { AbstractRepository } from './AbstractRepository';

export class MemberRepository extends AbstractRepository {
  async create(model: MemberModel) {
    await this.dbClient.member.create({
      data: model.toCreateEntity(),
    });
  }

  async delete(model: MemberModel) {
    let entity: Member | null = null;

    try {
      entity = await this.dbClient.member.delete({
        where: model.keys(),
      });
    } catch (ex: any) {
      if (
        !(ex instanceof Prisma.PrismaClientKnownRequestError) ||
        ex.code !== 'P2025' // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
      ) {
        throw ex;
      }
    }

    return entity;
  }

  async get(model: MemberModel) {
    const entity = await this.dbClient.member.findUnique({
      where: model.keys(),
    });

    if (!entity) {
      return null;
    }

    model.fromEntity(entity);
    return model;
  }

  async save(model: MemberModel) {
    await this.dbClient.member.upsert({
      create: model.toCreateEntity(),
      update: model.toEntity(),
      where: model.keys(),
    });
  }

  deleteByKeys(teamId: string, userId: string) {
    const member = new MemberModel(teamId, userId);

    return this.delete(member);
  }

  async deleteOnlyInPending(teamId: string, verificationCode: string) {
    const member = new MemberModel(teamId, verificationCode);
    let entity: Member | null = null;

    try {
      entity = await this.dbClient.member.delete({
        where: {
          teamSkId: {
            teamId,
            skId: verificationCode,
          },
          status: MemberStatus.PENDING,
        },
      });
    } catch (ex: any) {
      if (
        !(ex instanceof Prisma.PrismaClientKnownRequestError) ||
        ex.code !== 'P2025' // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
      ) {
        throw ex;
      }
    }

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

    try {
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
    } catch (ex: any) {
      if (
        !(ex instanceof Prisma.PrismaClientKnownRequestError) ||
        ex.code !== 'P2025' // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
      ) {
        throw ex;
      }
    }

    if (!entity) {
      return null;
    }

    member.fromEntity(entity);
    return member;
  }
}
