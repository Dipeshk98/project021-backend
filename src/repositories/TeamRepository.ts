import type { Team } from '@prisma/client';

import { TeamModel } from '@/models/Team';
import type { ISubscription } from '@/types/StripeTypes';

import { AbstractRepository } from './AbstractRepository';

export class TeamRepository extends AbstractRepository {
  async create(model: TeamModel) {
    await this.dbClient.team.create({
      data: model.toEntity(),
    });
  }

  async get(model: TeamModel) {
    const entity = await this.dbClient.team.findUnique({
      where: {
        id: model.id,
      },
    });

    if (!entity) {
      return null;
    }

    model.fromEntity(entity);
    return model;
  }

  delete(model: TeamModel) {
    return this.dbClient.team.delete({
      where: {
        id: model.id,
      },
    });
  }

  async createWithDisplayName(displayName: string) {
    const team = new TeamModel();
    team.setDisplayName(displayName);

    await this.create(team);

    return team;
  }

  deleteByTeamId(teamId: string) {
    const team = new TeamModel(teamId);

    return this.delete(team);
  }

  findByTeamId(teamId: string) {
    const team = new TeamModel(teamId);

    return this.get(team);
  }

  async findAllByTeamIdList(teamIdList: string[]) {
    const promiseList = [];

    for (let i = 0; i < teamIdList.length; i += 1) {
      promiseList.push(
        this.dbClient.team.findUnique({
          where: {
            id: teamIdList[i],
          },
        })
      );
    }

    const result = await Promise.all(promiseList);

    return result
      .filter((elt): elt is Team => elt !== null)
      .map((elt) => {
        const team = new TeamModel(elt.id);
        team.fromEntity(elt);
        return team;
      })
      .sort((team1, team2) => team1.id.localeCompare(team2.id));
  }

  async updateDisplayName(teamId: string, displayName: string) {
    await this.dbClient.team.update({
      data: {
        displayName,
      },
      where: {
        id: teamId,
      },
    });
  }

  async updateSubscription(teamId: string, subscription: ISubscription) {
    await this.dbClient.team.update({
      data: {
        subscriptionId: subscription.id,
        subscriptionProductId: subscription.productId,
        subscriptionStatus: subscription.status,
      },
      where: {
        id: teamId,
      },
    });
  }
}
