import { ApiError } from '@/errors/ApiError';
import { ErrorCode } from '@/errors/ErrorCode';
import { UserModel } from '@/models/User';

import { AbstractRepository } from './AbstractRepository';

export class UserRepository extends AbstractRepository {
  async create(model: UserModel) {
    await this.dbClient.user.create({
      data: model.toCreateEntity(),
    });
  }

  async get(model: UserModel) {
    const entity = await this.dbClient.user.findUnique({
      where: model.keys(),
    });

    if (!entity) {
      return null;
    }

    model.fromEntity(entity);
    return model;
  }

  async save(model: UserModel) {
    await this.dbClient.user.upsert({
      create: model.toCreateEntity(),
      update: model.toEntity(),
      where: model.keys(),
    });
  }

  update(model: UserModel) {
    return this.dbClient.user.update({
      data: model.toEntity(),
      where: model.keys(),
    });
  }

  delete(model: UserModel) {
    return this.dbClient.user.delete({
      where: model.keys(),
    });
  }

  async createWithUserId(userId: string) {
    const user = new UserModel(userId);

    await this.create(user);

    return user;
  }

  findByUserId(userId: string) {
    const user = new UserModel(userId);

    return this.get(user);
  }

  async findOrCreate(userId: string) {
    const user = await this.findByUserId(userId);

    if (!user) {
      return this.createWithUserId(userId);
    }

    return user;
  }

  async strictFindByUserId(userId: string) {
    const user = await this.findByUserId(userId);

    if (!user) {
      throw new ApiError(
        `Incorrect UserID ${userId}`,
        null,
        ErrorCode.INCORRECT_USER_ID
      );
    }

    return user;
  }

  async removeTeam(userId: string, teamId: string) {
    const user = await this.strictFindByUserId(userId);
    user.removeTeam(teamId);
    await this.save(user);
  }
}
