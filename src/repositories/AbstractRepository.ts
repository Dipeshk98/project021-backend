import type { PrismaClient } from '@prisma/client';

export class AbstractRepository {
  protected dbClient: PrismaClient;

  constructor(dbClient: PrismaClient) {
    this.dbClient = dbClient;
  }
}
