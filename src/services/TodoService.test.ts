import { Todo } from '@/models/Todo';
import { getDbClient } from '@/utils/DBClient';

import { TodoService } from './TodoService';

describe('TodoService', () => {
  let todoService: TodoService;

  beforeEach(() => {
    todoService = new TodoService(getDbClient());
  });

  describe('Get/Create Todo', () => {
    it('should return all todos from one user', async () => {
      const userId1 = 'user-1';
      const userId2 = 'user-2';
      const userId3 = 'user-3';

      // Create 2 todos for User 1
      const todo11 = new Todo(userId1);
      todo11.setTitle('todo-user-1-1');
      await todoService.save(todo11);

      const todo12 = new Todo(userId1);
      todo12.setTitle('todo-user-1-2');
      await todoService.save(todo12);

      // Create 1 todo for User 2
      const todo21 = new Todo(userId2);
      todo21.setTitle('todo-user-2-1');
      await todoService.save(todo21);

      // No todo for User 3 by creating one and remove it
      const todo31 = new Todo(userId3);
      todo31.setTitle('todo-user-3-1');
      await todoService.save(todo31);
      await todoService.delete(userId3, todo31.id);

      // Verify todos from User 1
      const todoList1 = await todoService.findAllByUserId(userId1);
      expect(todoList1).toHaveLength(2);
      expect(todoList1[0]!.getTitle()).toEqual('todo-user-1-1');
      expect(todoList1[1]!.getTitle()).toEqual('todo-user-1-2');

      // Verify todo from User 2
      const todoList2 = await todoService.findAllByUserId(userId2);
      expect(todoList2).toHaveLength(1);
      expect(todoList2[0]!.getTitle()).toEqual('todo-user-2-1');

      // Verify todo from User 3
      const todoList3 = await todoService.findAllByUserId(userId3);
      expect(todoList3).toHaveLength(0);
    });
  });
});
