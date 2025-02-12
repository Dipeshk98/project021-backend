import type { I9Reverification, PrismaClient } from '@prisma/client';

import { AbstractRepository } from './AbstractRepository';

export class I9ReverificationRepository extends AbstractRepository<
  PrismaClient['i9Reverification'], // Use the I9Reverification table
  I9Reverification,
  any
> {
  constructor(dbClient: PrismaClient) {
    super(dbClient.i9Reverification);
  }

  // Fetch a reverification entry by form_id
  async findReverificationByFormId(
    form_id: string
  ): Promise<I9Reverification | null> {
    return this.dbClient.findUnique({
      where: { form_id },
    });
  }

  // Create a new reverification entry
  async createReverification(
    data: Partial<I9Reverification>
  ): Promise<I9Reverification> {
    return this.dbClient.create({
      data,
    });
  }
}
