import type { I9Section1, PrismaClient } from '@prisma/client';

import { AbstractRepository } from './AbstractRepository';

export class I9UserRepository extends AbstractRepository<
  PrismaClient['i9Section1'],
  I9Section1,
  any
> {
  constructor(dbClient: PrismaClient) {
    super(dbClient.i9Section1);
  }

  // Fetch a section1 by form_id
  async findSection1ByFormId(form_id: string): Promise<I9Section1 | null> {
    return this.dbClient.findUnique({
      where: { form_id },
    });
  }

  // Fetch a section1 by email
  async findSection1ByEmail(email: string): Promise<I9Section1 | null> {
    return this.dbClient.findUnique({
      where: { email },
      select: {
        form_id: true
      }
    });
  }

  async count(): Promise<number> {
    return this.dbClient.count();
  }
  
  async findAll(options?: { skip?: number; take?: number }): Promise<Partial<I9Section1>[]> {
    return this.dbClient.findMany({
      select: {
        first_name: true,
        last_name: true,
        email: true,
        work_start_date: true,
        citizenship_status: true,
        form_id: true
      },
      skip: options?.skip,
      take: options?.take,
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  // Create a new section1
  async createSection1(data: Partial<I9Section1>): Promise<I9Section1> {
    return this.dbClient.create({
      data,
    });
  }
}
