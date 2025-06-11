import type { AuditTrail, PrismaClient } from '@prisma/client';
import { AbstractRepository } from './AbstractRepository';

export class AuditTrailRepository extends AbstractRepository<
  PrismaClient['AuditTrail'],
  AuditTrail,
  any
> {
  constructor(dbClient: PrismaClient) {
    super(dbClient.auditTrail);
  }

  //  Create a new audit trail entry
  async createAuditTrail(data: Partial<AuditTrail>): Promise<AuditTrail> {
    return this.dbClient.create({
      data,
    });
  }

  //  Find all audit logs for a specific form
  async findByFormId(form_id: string): Promise<AuditTrail[]> {
    return this.dbClient.findMany({
      where: { form_id },
      orderBy: { performed_at: 'desc' },
      include: {
        form: true,  
        user: true,  
      }
    });
  }

  //  Find all audit logs performed by a specific user
  async findByUserId(userId: string): Promise<AuditTrail[]> {
    return this.dbClient.findMany({
      where: { performed_by: userId },
      orderBy: { performed_at: 'desc' },
      include: {
        form: true,
        user: true,
      }
    });
  }

  //  Find all audit logs for a section
  async findBySection(section: string): Promise<AuditTrail[]> {
    return this.dbClient.findMany({
      where: { section },
      orderBy: { performed_at: 'desc' }
    });
  }

  //  Get total count of audit entries
  async count(): Promise<number> {
    return this.dbClient.count();
  }

  //  Paginated fetch of audit trail
  async findAll(options?: { skip?: number; take?: number }): Promise<AuditTrail[]> {
    return this.dbClient.findMany({
      skip: options?.skip,
      take: options?.take,
      orderBy: { performed_at: 'desc' },
      include: {
        form: true,
        user: true,
      }
    });
  }
}
