import type { I9Section2, PrismaClient } from '@prisma/client';

import { AbstractRepository } from './AbstractRepository';

export class I9EmployerRepository extends AbstractRepository<
  PrismaClient['i9Section2'],
  I9Section2,
  any
> {
  constructor(dbClient: PrismaClient) {
    super(dbClient.i9Section2);
  }

  // Fetch a section2 by form_id
  async findEmployerSectionByFormId(
    form_id: string
  ): Promise<I9Section2 | null> {
    return this.dbClient.findUnique({
      where: { form_id },
    });
  }

  // Create a new section2
  async createEmployerSection(
    data: Partial<I9Section2>
  ): Promise<I9Section2> {
    return this.dbClient.create({
      data,
    });
  }
}
