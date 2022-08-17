import type { Table } from 'dynamodb-onetable';

import { Team } from '@/models/Team';
import type { ISubscription } from '@/types/StripeTypes';

import { AbstractRepository } from './AbstractRepository';

export class TeamRepository extends AbstractRepository<Team> {
  constructor(dbTable: Table) {
    super(dbTable, 'Team');
  }

  async createWithDisplayName(displayName: string) {
    const team = new Team();
    team.setDisplayName(displayName);

    await this.create(team);

    return team;
  }

  deleteByTeamId(teamId: string) {
    const team = new Team(teamId);

    return this.delete(team);
  }

  findByTeamId(teamId: string) {
    const team = new Team(teamId);

    return this.get(team);
  }

  async findAllByTeamIdList(teamIdList: string[]) {
    const batch = {};
    const promiseList = [];

    for (let i = 0; i < teamIdList.length; i += 1) {
      const team = new Team(teamIdList[i]);
      promiseList.push(this.dbModel.get(team.keys(), { batch }));
    }

    await Promise.all(promiseList);

    // Use temporary `any` until typing is implemented for batchGet: https://github.com/sensedeep/dynamodb-onetable/issues/348
    const result: any[] = await this.dbTable.batchGet(batch, {
      parse: true,
    });

    return result
      .map((elt: any) => {
        const team = new Team(Team.removeBeginsKeys(elt.PK));
        team.fromEntity(elt);
        return team;
      })
      .sort((team1, team2) => team1.id.localeCompare(team2.id));
  }

  async updateDisplayName(teamId: string, displayName: string) {
    const team = new Team(teamId);

    await this.dbModel.update({
      ...team.keys(),
      displayName,
    });
  }

  async updateSubscription(teamId: string, subscription: ISubscription) {
    const team = new Team(teamId);

    await this.dbModel.update({
      ...team.keys(),
      subscription,
    });
  }
}
