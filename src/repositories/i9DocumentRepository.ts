import type { I9Documents, PrismaClient } from '@prisma/client';

import { AbstractRepository } from './AbstractRepository';

export class I9DocumentRepository extends AbstractRepository<
  PrismaClient['i9Documents'],
  I9Documents,
  any
> {
  constructor(dbClient: PrismaClient) {
    super(dbClient.i9Documents);
  }

  async create(data: Partial<I9Documents>): Promise<I9Documents> {
    return this.dbClient.create({ data });
  }
}
