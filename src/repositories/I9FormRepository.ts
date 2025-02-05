import type { PrismaClient, I9Forms } from '@prisma/client';
import { AbstractRepository } from './AbstractRepository';

export class I9FormRepository extends AbstractRepository<
  PrismaClient['i9Forms'], // Using I9Forms model
  I9Forms,
  any
> {
  constructor(dbClient: PrismaClient) {
    super(dbClient.i9Forms);
  }

  // Fetch an I-9 form by form_id
  async findI9FormById(form_id: string): Promise<I9Forms | null> {
    return this.dbClient.findUnique({
      where: { form_id },
    });
  }
  async createI9Form(data: Partial<I9Forms>): Promise<I9Forms> {
    return this.dbClient.create({
      data,
    });
  }
}
