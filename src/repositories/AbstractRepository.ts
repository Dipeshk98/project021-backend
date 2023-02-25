import type { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

import type { AbstractModel } from '@/models/AbstractModel';

// Use this file as a external library
export class AbstractRepository<
  PrismaModel,
  Model extends AbstractModel<PrismaModel>
> {
  protected dbClient: PrismaClient;

  protected model: string;

  constructor(client: PrismaClient, model: string) {
    this.dbClient = client;
    this.model = model;
  }

  // Due to Prisma typing limitation returns `any`: https://github.com/prisma/prisma/discussions/10584`
  getModelClient(): any {
    // Randomly choose one Prisma model for typing, here we use 'user' but it also works for other models
    return this.dbClient[this.model as 'user'];
  }

  // eslint-disable-next-line class-methods-use-this
  async catchNotFound(execute: () => Promise<void>) {
    try {
      await execute();
    } catch (ex: any) {
      if (
        !(ex instanceof Prisma.PrismaClientKnownRequestError) ||
        ex.code !== 'P2025' // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
      ) {
        throw ex;
      }
    }
  }

  async create(model: Model) {
    await this.getModelClient().create({
      data: model.toCreateEntity(),
    });
  }

  async get(model: Model): Promise<Model | null> {
    const entity = await this.getModelClient().findUnique({
      where: model.keys(),
    });

    if (!entity) {
      return null;
    }

    model.fromEntity(entity);
    return model;
  }

  async update(model: Model) {
    let entity: PrismaModel | null = null;

    await this.catchNotFound(async () => {
      entity = await this.getModelClient().update({
        data: model.toEntity(),
        where: model.keys(),
      });
    });

    return entity;
  }

  async save(model: Model) {
    await this.getModelClient().upsert({
      create: model.toCreateEntity(),
      update: model.toEntity(),
      where: model.keys(),
    });
  }

  async delete(model: Model) {
    let entity: PrismaModel | null = null;

    await this.catchNotFound(async () => {
      entity = await this.getModelClient().delete({
        where: model.keys(),
      });
    });

    return entity;
  }
}
