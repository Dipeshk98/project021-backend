import { PrismaClient } from '@prisma/client';
import { AbstractRepository } from './AbstractRepository';
import { NotificationLogModel } from '../models/NotificationLogModel';

interface NotificationLogEntity {
  id: string;
  sender_email: string;
  sender_name: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  message: string;
  status: string;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
}

export class NotificationLogRepository extends AbstractRepository<
  any,
  NotificationLogEntity,
  NotificationLogModel
> {
  constructor(prisma: PrismaClient) {
    super(prisma.notificationLog);
  }

  async create(model: NotificationLogModel): Promise<NotificationLogEntity> {
    return this.dbClient.create({
      data: model.toCreateEntity(),
    });
  }

  async findById(id: string): Promise<NotificationLogModel | null> {
    const entity = await this.dbClient.findUnique({
      where: { id },
    });
    if (!entity) return null;
    const model = new NotificationLogModel(
      entity.id,
      entity.sender_email,
      entity.sender_name,
      entity.recipient_email,
      entity.recipient_name,
      entity.subject,
      entity.message,
      entity.status,
      entity.error_message
    );
    model.fromEntity(entity);
    return model;
  }

  async findAll(): Promise<NotificationLogModel[]> {
    const entities = await this.dbClient.findMany();
    return entities.map((entity: NotificationLogEntity) => {
      const model = new NotificationLogModel(
        entity.id,
        entity.sender_email,
        entity.sender_name,
        entity.recipient_email,
        entity.recipient_name,
        entity.subject,
        entity.message,
        entity.status,
        entity.error_message
      );
      model.fromEntity(entity);
      return model;
    });
  }

  async update(model: NotificationLogModel): Promise<NotificationLogEntity> {
    return this.dbClient.update({
      where: model.keys(),
      data: model.toEntity(),
    });
  }

  async delete(model: NotificationLogModel): Promise<NotificationLogEntity> {
    return this.dbClient.delete({
      where: model.keys(),
    });
  }
} 