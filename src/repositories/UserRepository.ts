import type { PrismaClient, User } from '@prisma/client';

import { ApiError } from '@/errors/ApiError';
import { ErrorCode } from '@/errors/ErrorCode';
import { UserModel } from '@/models/UserModel';

import { AbstractRepository } from './AbstractRepository';

export class UserRepository extends AbstractRepository<
  PrismaClient['user'],
  User,
  UserModel
> {
  constructor(dbClient: PrismaClient) {
    super(dbClient.user);
  }

  async createWithUserId(providerId: string) {
    const user = new UserModel(providerId);

    await this.create(user);

    return user;
  }

  findByUserId(providerId: string) {
    const user = new UserModel(providerId);

    return this.get(user);
  }

  async findOrCreate(providerId: string) {
    const user = await this.findByUserId(providerId);

    if (!user) {
      return this.createWithUserId(providerId);
    }

    return user;
  }

  async strictFindByUserId(providerId: string) {
    const user = await this.findByUserId(providerId);

    if (!user) {
      throw new ApiError(
        `Incorrect UserID ${providerId}`,
        null,
        ErrorCode.INCORRECT_USER_ID
      );
    }

    return user;
  }

  async removeTeam(providerId: string, teamId: string) {
    const user = await this.strictFindByUserId(providerId);
    user.removeTeam(teamId);
    await this.save(user);
  }
}
