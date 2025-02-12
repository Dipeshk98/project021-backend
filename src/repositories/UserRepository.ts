import type { PrismaClient, User } from '@prisma/client';

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

  async findById(id: string): Promise<User | null> {
    return this.dbClient.findUnique({
      where: { id },
    });
  }

  async updateById(id: string, updateData: Partial<User>): Promise<User> {
    return this.dbClient.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.dbClient.delete({
      where: { id },
    });
  }

  async findAll(): Promise<User[]> {
    return this.dbClient.findMany(); // Fetch all users
  }

  async create(data: Partial<User>): Promise<User> {
    return this.dbClient.create({ data }); // Create a new user
  }
}
