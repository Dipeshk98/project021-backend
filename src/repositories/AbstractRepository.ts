import type { Entity, Model, Table } from 'dynamodb-onetable';

import type { AbstractModel } from '@/models/AbstractModel';
import type { PrimaryKeys } from '@/models/Schema';

export class AbstractRepository<T extends AbstractModel<PrimaryKeys>> {
  protected dbTable: Table;

  protected dbModel: Model<Entity<any>>;

  constructor(dbTable: Table, modelName: string) {
    this.dbTable = dbTable;
    this.dbModel = dbTable.getModel(modelName);
  }

  async create(model: T) {
    await this.dbModel.create(model.toEntity());
  }

  async get(model: T) {
    const entity = await this.dbModel.get(model.keys());

    if (!entity) {
      return null;
    }

    model.fromEntity(entity);
    return model;
  }

  async save(model: T) {
    await this.dbModel.create(model.toEntity(), { exists: null });
  }

  update(model: T): Promise<Entity<any> | undefined> {
    // `update` method from `dynamodb-onetable` library can also return `undefined` with the `throw` set to false.
    // The typing from the library is incorrect, need to add `undefined` manually
    return this.dbModel.update(model.toEntity(), { throw: false });
  }

  delete(model: T) {
    return this.dbModel.remove(model.keys(), {
      exists: true,
      throw: false,
    });
  }
}
