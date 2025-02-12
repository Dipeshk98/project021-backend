import type { I9EmployerSection, PrismaClient } from '@prisma/client';

import { AbstractRepository } from './AbstractRepository';

export class I9EmployerRepository extends AbstractRepository<
  PrismaClient['i9EmployerSection'], // Use the I9EmployerSection table
  I9EmployerSection,
  any
> {
  constructor(dbClient: PrismaClient) {
    super(dbClient.i9EmployerSection);
  }

  // Fetch an employer section by form_id
  async findEmployerSectionByFormId(
    form_id: string
  ): Promise<I9EmployerSection | null> {
    return this.dbClient.findUnique({
      where: { form_id },
    });
  }

  // ✅ Fix: Create an employer section **without** calling `toCreateEntity()`
  async createEmployerSection(
    data: Partial<I9EmployerSection>
  ): Promise<I9EmployerSection> {
    return this.dbClient.create({
      data, // Directly passing the object instead of calling `.toCreateEntity()`
    });
  }
}
