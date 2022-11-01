import assert from 'assert';

import { TodoModel } from '@/models/Todo';
import { getDBClient } from '@/utils/DBClient';

import { TodoRepository } from './TodoRepository';

describe('TodoRepository', () => {
  let todoRepository: TodoRepository;

  beforeEach(() => {
    todoRepository = new TodoRepository(getDBClient());
  });

  describe('Basic operation', () => {
    it("should return null when the todo don't exist", async () => {
      const todo = await todoRepository.findByKeys(
        'user-123',
        '123123123123123123123123'
      );

      expect(todo).toBeNull();
    });

    it('should create a todo when saving a non-existing one and and be able to get the todo from the database', async () => {
      const userId = 'user-123';
      const todoId = '123123123123123123123123';
      const savedTodo = new TodoModel(userId, todoId);
      savedTodo.setTitle('todo-title-123');
      await todoRepository.save(savedTodo);

      const todo = await todoRepository.findByKeys(userId, todoId);
      assert(todo !== null, "todo shouldn't be null");
      expect(todo.getTitle()).toEqual('todo-title-123');
    });

    it('should create a todo when saving a non-existing one and update when saving again', async () => {
      const userId = 'user-123';
      const todoId = '123123123123123123123123';
      const savedTodo = new TodoModel(userId, todoId);
      savedTodo.setTitle('todo-title-123');
      await todoRepository.save(savedTodo);

      savedTodo.setTitle('new-todo-title-123');
      await todoRepository.save(savedTodo);

      const todo = await todoRepository.findByKeys(userId, todoId);
      assert(todo !== null, "todo shouldn't be null");
      expect(todo.getTitle()).toEqual('new-todo-title-123');
    });

    it("shouldn't be able to delete an non-existing todo", async () => {
      const deleteResult = await todoRepository.deleteByKeys(
        'user-123',
        '123123123123123123123123'
      );

      expect(deleteResult).toBeFalsy();
    });

    it('should create a new team and delete the newly created team', async () => {
      const savedTodo = new TodoModel('user-123', '123123123123123123123123');
      await todoRepository.save(savedTodo);

      const deleteResult = await todoRepository.deleteByKeys(
        savedTodo.ownerId,
        savedTodo.id
      );
      expect(deleteResult).toBeTruthy();

      const team = await todoRepository.findByKeys(
        savedTodo.ownerId,
        savedTodo.id
      );
      expect(team).toBeNull();
    });

    it('should return all todos from one user', async () => {
      const userId = 'user-123';
      const todo1 = new TodoModel(userId);
      todo1.setTitle('todo-user-1');
      await todoRepository.save(todo1);

      const todo2 = new TodoModel(userId);
      todo2.setTitle('todo-user-2');
      await todoRepository.save(todo2);

      const todo3 = new TodoModel(userId);
      todo3.setTitle('todo-user-3');
      await todoRepository.save(todo3);

      const result = await todoRepository.findAllByUserId(userId);
      expect(result).toHaveLength(3);

      expect(result[0]).toEqual(todo1);
      expect(result[1]).toEqual(todo2);
      expect(result[2]).toEqual(todo3);
    });

    it('should return all todos from multiple users and complex workflow', async () => {
      const userId1 = 'user-1';
      const userId2 = 'user-2';
      const userId3 = 'user-3';

      // Create 2 todos for User 1
      const todo11 = new TodoModel(userId1);
      todo11.setTitle('todo-user-1-1');
      await todoRepository.save(todo11);

      const todo12 = new TodoModel(userId1);
      todo12.setTitle('todo-user-1-2');
      await todoRepository.save(todo12);

      // Create 1 todo for User 2
      const todo21 = new TodoModel(userId2);
      todo21.setTitle('todo-user-2-1');
      await todoRepository.save(todo21);

      // No todo for User 3 by creating one and remove it
      const todo31 = new TodoModel(userId3);
      todo31.setTitle('todo-user-3-1');
      await todoRepository.save(todo31);
      await todoRepository.deleteByKeys(userId3, todo31.id);

      // The order is maintaining because the id is from `ulid` library
      const todoList1 = await todoRepository.findAllByUserId(userId1);

      // Verify todos from User 1
      expect(todoList1).toHaveLength(2);
      expect(todoList1[0]).toEqual(todo11);
      expect(todoList1[1]).toEqual(todo12);

      // Verify todo from User 2
      const todoList2 = await todoRepository.findAllByUserId(userId2);
      expect(todoList2).toHaveLength(1);
      expect(todoList2[0]).toEqual(todo21);

      // Verify todo from User 3
      const todoList3 = await todoRepository.findAllByUserId(userId3);
      expect(todoList3).toHaveLength(0);
    });
  });
});
