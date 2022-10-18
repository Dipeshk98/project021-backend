/* eslint-disable max-classes-per-file,class-methods-use-this */

import { getDBTable } from '@/models/DBTable';
import { UserModel } from '@/models/User';

import { AbstractRepository } from './AbstractRepository';

class DummyTestRepository extends AbstractRepository<UserModel> {}

describe('AbstractRepository', () => {
  let dummyTestRepository: DummyTestRepository;

  beforeEach(() => {
    dummyTestRepository = new DummyTestRepository(getDBTable(), 'User');
  });

  describe('Basic operation', () => {
    it('should not able to create the same entity twice', async () => {
      const model = new UserModel('user-123');

      await dummyTestRepository.create(model);
      await expect(dummyTestRepository.create(model)).rejects.toThrow(
        'Conditional create failed'
      );
    });

    it('should create an entity and retrieve the newly created', async () => {
      const createdModel = new UserModel('user-123');
      const date = new Date('2018-09-22T15:00:00.000Z');
      createdModel.setFirstSignIn(date);
      await dummyTestRepository.create(createdModel);

      const model = new UserModel('user-123');
      await dummyTestRepository.get(model);
      expect(model.getFirstSignIn().toISOString()).toEqual(
        '2018-09-22T15:00:00.000Z'
      );
    });

    it('should able to save multiple times', async () => {
      const createdModel = new UserModel('user-123');
      await dummyTestRepository.save(createdModel);

      const date = new Date('2018-09-22T15:00:00.000Z');
      createdModel.setFirstSignIn(date);
      await dummyTestRepository.save(createdModel);

      const model = new UserModel('user-123');
      await dummyTestRepository.get(model);
      expect(model.getFirstSignIn().toISOString()).toEqual(
        '2018-09-22T15:00:00.000Z'
      );
    });

    it('should not able to update for non-existing entity', async () => {
      const model = new UserModel('user-123');
      const updateRes = await dummyTestRepository.update(model);
      expect(updateRes).toBeFalsy();
    });

    it('should create an entity and update the newly created', async () => {
      const createdModel = new UserModel('user-123');
      await dummyTestRepository.create(createdModel);

      const date = new Date('2018-09-22T15:00:00.000Z');
      createdModel.setFirstSignIn(date);
      await dummyTestRepository.update(createdModel);

      const model = new UserModel('user-123');
      await dummyTestRepository.get(model);
      expect(model.getFirstSignIn().toISOString()).toEqual(
        '2018-09-22T15:00:00.000Z'
      );
    });

    it('should not able to delete a non-existing entity', async () => {
      const model = new UserModel('user-123');
      const deleteRes = await dummyTestRepository.delete(model);
      expect(deleteRes).toBeFalsy();
    });

    it('should create a new entity and delete the newly created entity', async () => {
      const model = new UserModel('user-123');
      await dummyTestRepository.create(model);

      const deleteRes = await dummyTestRepository.delete(model);
      expect(deleteRes).toBeTruthy();
    });
  });
});
