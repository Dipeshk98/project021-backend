import type { Table } from 'dynamodb-onetable';

import { Member } from '@/models/Member';
import { MemberRole, MemberStatus } from '@/types/Member';

import { AbstractRepository } from './AbstractRepository';

export class MemberRepository extends AbstractRepository<Member> {
  constructor(dbTable: Table) {
    super(dbTable, 'Member');
  }

  deleteByKeys(teamId: string, userId: string) {
    const member = new Member(teamId, userId);

    return this.delete(member);
  }

  async deleteOnlyInPending(teamId: string, verificationCode: string) {
    const member = new Member(teamId, verificationCode);
    const entity = await this.dbModel.remove(member.keys(), {
      exists: true,
      throw: false,
      // eslint-disable-next-line no-template-curly-in-string
      where: '${status} = @{status}',
      substitutions: {
        status: MemberStatus.PENDING,
      },
    });

    if (entity == null) {
      return null;
    }

    member.fromEntity(entity);
    return member;
  }

  async deleteAllMembers(teamId: string) {
    await this.dbModel.remove(
      {
        PK: `${Member.BEGINS_KEYS}${teamId}`,
      },
      {
        many: true,
      }
    );
  }

  findByKeys(teamId: string, userId: string) {
    const member = new Member(teamId, userId);

    return this.get(member);
  }

  async findAllByTeamId(teamId: string) {
    const list = await this.dbModel.find({
      PK: `${Member.BEGINS_KEYS}${teamId}`,
      SK: { begins_with: Member.BEGINS_KEYS },
    });

    return list.map((elt) => {
      const member = new Member(teamId, Member.removeBeginsKeys(`${elt.SK}`));
      member.fromEntity(elt);
      return member;
    });
  }

  async updateEmail(teamId: string, userId: string, email: string) {
    const member = new Member(teamId, userId);

    await this.dbModel.update({ ...member.keys(), email });
  }

  async updateRoleIfNotOwner(teamId: string, userId: string, role: MemberRole) {
    const member = new Member(teamId, userId);

    await this.dbModel.update(
      { ...member.keys(), role },
      {
        // eslint-disable-next-line no-template-curly-in-string
        where: '${role} <> @{role}',
        substitutions: {
          role: MemberRole.OWNER,
        },
      }
    );
  }
}
