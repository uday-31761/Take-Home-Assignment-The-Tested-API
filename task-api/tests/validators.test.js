const {
  validateCreateTask,
  validateUpdateTask,
} = require('../src/utils/validators');

describe('validators', () => {
  describe('validateCreateTask', () => {
    test('accepts a valid task', () => {
      expect(
        validateCreateTask({
          title: 'Test task',
          status: 'todo',
          priority: 'high',
          dueDate: '2030-01-01T00:00:00.000Z',
        })
      ).toBeNull();
    });

    test('rejects missing title', () => {
      expect(validateCreateTask({})).toBe(
        'title is required and must be a non-empty string'
      );
    });

    test('rejects empty title', () => {
      expect(validateCreateTask({ title: '   ' })).toBe(
        'title is required and must be a non-empty string'
      );
    });

    test('rejects invalid status', () => {
      expect(
        validateCreateTask({
          title: 'Task',
          status: 'invalid',
        })
      ).toContain('status must be one of');
    });

    test('rejects invalid priority', () => {
      expect(
        validateCreateTask({
          title: 'Task',
          priority: 'urgent',
        })
      ).toContain('priority must be one of');
    });

    test('rejects invalid due date', () => {
      expect(
        validateCreateTask({
          title: 'Task',
          dueDate: 'not-a-date',
        })
      ).toBe('dueDate must be a valid ISO date string');
    });
  });

  describe('validateUpdateTask', () => {
    test('accepts a valid update', () => {
      expect(
        validateUpdateTask({
          title: 'Updated task',
          status: 'done',
          priority: 'low',
        })
      ).toBeNull();
    });

    test('rejects an empty title', () => {
      expect(
        validateUpdateTask({
          title: '   ',
        })
      ).toBe('title must be a non-empty string');
    });

    test('rejects invalid status', () => {
      expect(
        validateUpdateTask({
          status: 'invalid',
        })
      ).toContain('status must be one of');
    });

    test('rejects invalid priority', () => {
      expect(
        validateUpdateTask({
          priority: 'urgent',
        })
      ).toContain('priority must be one of');
    });
  });
});