import type { Translator, PrismaClient } from '@prisma/client';
import { AbstractRepository } from './AbstractRepository';

export class TranslatorRepository extends AbstractRepository<
  PrismaClient['translator'],
  Translator,
  any
> {
  constructor(dbClient: PrismaClient) {
    super(dbClient.translator);
  }

  // Create a new translator entry
  async createTranslator(data: Partial<Translator>): Promise<Translator> {
    return this.dbClient.create({
      data,
    });
  }

  // Get all translators for a specific form
  async findByFormId(form_id: string): Promise<Translator[]> {
    return this.dbClient.findMany({
      where: { form_id },
      orderBy: { translator_id: 'asc' }
    });
  }

  // Count all translators
  async count(): Promise<number> {
    return this.dbClient.count();
  }

  // Paginated list of all translators
  async findAll(options?: { skip?: number; take?: number }): Promise<Translator[]> {
    return this.dbClient.findMany({
      skip: options?.skip,
      take: options?.take,
      orderBy: { translator_id: 'asc' }
    });
  }
}
