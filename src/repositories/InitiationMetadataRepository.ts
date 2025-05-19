import type { PrismaClient, InitiationMetadata } from '@prisma/client';
import { AbstractRepository } from './AbstractRepository';

export class InitiationMetadataRepository extends AbstractRepository<
  PrismaClient['initiationMetadata'],
  InitiationMetadata
> {
  constructor(dbClient: PrismaClient) {
    super(dbClient.initiationMetadata);
  }

  async create(data: Partial<InitiationMetadata>): Promise<InitiationMetadata> {
    return this.dbClient.create({ data });
  }

  async findById(id: string): Promise<InitiationMetadata | null> {
    return this.dbClient.findUnique({
      where: { initiation_id: id },
    });
  }

  async findByFormId(formId: string): Promise<InitiationMetadata | null> {
    return this.dbClient.findFirst({
      where: { form_id: formId },
    });
  }
} 