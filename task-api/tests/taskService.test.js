const taskService = require('../src/services/taskService');

describe('taskService', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('create', () => {
    test('creates a task with default values', () => {
      const task = taskService.create({
        title: 'Test task',
      });

      expect(task).toMatchObject({
        title: 'Test task',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        completedAt: null,
      });

      expect(task.id).toBeDefined();
      expect(task.createdAt).toBeDefined();
    });

    test('creates a task with provided values', () => {
      const task = taskService.create({
        title: 'Important task',
        description: 'Test description',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2030-01-01T00:00:00.000Z',
      });

      expect(task.title).toBe('Important task');
      expect(task.description).toBe('Test description');
      expect(task.status).toBe('in_progress');
      expect(task.priority).toBe('high');
      expect(task.dueDate).toBe('2030-01-01T00:00:00.000Z');
    });
  });

  describe('getAll', () => {
    test('returns all tasks', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });

      const tasks = taskService.getAll();

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[1].title).toBe('Task 2');
    });
  });

  describe('findById', () => {
    test('returns a task when it exists', () => {
      const created = taskService.create({ title: 'Find me' });

      expect(taskService.findById(created.id)).toEqual(created);
    });

    test('returns undefined when task does not exist', () => {
      expect(taskService.findById('missing-id')).toBeUndefined();
    });
  });

  describe('getByStatus', () => {
    test('returns tasks matching the status', () => {
      taskService.create({ title: 'Todo task', status: 'todo' });
      taskService.create({ title: 'Progress task', status: 'in_progress' });
      taskService.create({ title: 'Done task', status: 'done' });

      const tasks = taskService.getByStatus('todo');

      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Todo task');
    });

    test('returns an empty array when no tasks match', () => {
      taskService.create({ title: 'Todo task', status: 'todo' });

      expect(taskService.getByStatus('done')).toEqual([]);
    });
  });

  describe('getPaginated', () => {
    beforeEach(() => {
      for (let i = 1; i <= 25; i++) {
        taskService.create({ title: `Task ${i}` });
      }
    });

    test('returns the first page starting with the first task', () => {
      const tasks = taskService.getPaginated(1, 10);

      expect(tasks).toHaveLength(10);
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[9].title).toBe('Task 10');
    });

    test('returns the second page correctly', () => {
      const tasks = taskService.getPaginated(2, 10);

      expect(tasks).toHaveLength(10);
      expect(tasks[0].title).toBe('Task 11');
      expect(tasks[9].title).toBe('Task 20');
    });

    test('returns an empty array when page is beyond available data', () => {
      expect(taskService.getPaginated(10, 10)).toEqual([]);
    });
  });

  describe('update', () => {
    test('updates an existing task', () => {
      const created = taskService.create({ title: 'Old title' });

      const updated = taskService.update(created.id, {
        title: 'New title',
        priority: 'high',
      });

      expect(updated.title).toBe('New title');
      expect(updated.priority).toBe('high');
    });

    test('returns null for a missing task', () => {
      expect(
        taskService.update('missing-id', { title: 'New title' })
      ).toBeNull();
    });
  });

  describe('remove', () => {
    test('removes an existing task', () => {
      const created = taskService.create({ title: 'Delete me' });

      expect(taskService.remove(created.id)).toBe(true);
      expect(taskService.findById(created.id)).toBeUndefined();
    });

    test('returns false for a missing task', () => {
      expect(taskService.remove('missing-id')).toBe(false);
    });
  });

  describe('completeTask', () => {
    test('marks a task as done and sets completedAt', () => {
      const created = taskService.create({
        title: 'Complete me',
        priority: 'high',
      });

      const completed = taskService.completeTask(created.id);

      expect(completed.status).toBe('done');
      expect(completed.completedAt).toBeDefined();
    });

    test('returns null when task does not exist', () => {
      expect(taskService.completeTask('missing-id')).toBeNull();
    });
  });

  describe('getStats', () => {
    test('returns counts by status', () => {
      taskService.create({ title: 'Todo 1', status: 'todo' });
      taskService.create({ title: 'Todo 2', status: 'todo' });
      taskService.create({ title: 'Progress', status: 'in_progress' });
      taskService.create({ title: 'Done', status: 'done' });

      const stats = taskService.getStats();

      expect(stats.todo).toBe(2);
      expect(stats.in_progress).toBe(1);
      expect(stats.done).toBe(1);
    });

    test('counts overdue incomplete tasks', () => {
      taskService.create({
        title: 'Overdue',
        dueDate: '2020-01-01T00:00:00.000Z',
      });

      taskService.create({
        title: 'Completed overdue',
        status: 'done',
        dueDate: '2020-01-01T00:00:00.000Z',
      });

      const stats = taskService.getStats();

      expect(stats.overdue).toBe(1);
    });
  });
});