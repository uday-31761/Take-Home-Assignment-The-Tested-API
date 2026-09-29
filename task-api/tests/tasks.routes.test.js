const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API routes', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('GET /tasks', () => {
    test('returns all tasks', async () => {
      await request(app)
        .post('/tasks')
        .send({ title: 'Task 1' });

      await request(app)
        .post('/tasks')
        .send({ title: 'Task 2' });

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('filters tasks by status', async () => {
      await request(app)
        .post('/tasks')
        .send({ title: 'Todo', status: 'todo' });

      await request(app)
        .post('/tasks')
        .send({ title: 'Done', status: 'done' });

      const response = await request(app)
        .get('/tasks?status=todo');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Todo');
    });

    test('supports pagination', async () => {
      for (let i = 1; i <= 12; i++) {
        await request(app)
          .post('/tasks')
          .send({ title: `Task ${i}` });
      }

      const response = await request(app)
        .get('/tasks?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(10);
      expect(response.body[0].title).toBe('Task 1');
    });
  });

  describe('POST /tasks', () => {
    test('creates a task', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'New task',
          priority: 'high',
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('New task');
      expect(response.body.priority).toBe('high');
      expect(response.body.id).toBeDefined();
    });

    test('rejects a missing title', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          priority: 'high',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('title is required');
    });

    test('rejects an invalid status', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'Task',
          status: 'invalid',
        });

      expect(response.status).toBe(400);
    });

    test('rejects an invalid priority', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'Task',
          priority: 'urgent',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /tasks/:id', () => {
    test('updates an existing task', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Original' });

      const response = await request(app)
        .put(`/tasks/${created.body.id}`)
        .send({ title: 'Updated' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated');
    });

    test('returns 404 for a missing task', async () => {
      const response = await request(app)
        .put('/tasks/missing-id')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /tasks/:id', () => {
    test('deletes an existing task', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Delete me' });

      const response = await request(app)
        .delete(`/tasks/${created.body.id}`);

      expect(response.status).toBe(204);

      const list = await request(app).get('/tasks');
      expect(list.body).toHaveLength(0);
    });

    test('returns 404 for a missing task', async () => {
      const response = await request(app)
        .delete('/tasks/missing-id');

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    test('completes an existing task', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Complete me' });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/complete`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('done');
      expect(response.body.completedAt).toBeDefined();
    });

    test('returns 404 for a missing task', async () => {
      const response = await request(app)
        .patch('/tasks/missing-id/complete');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /tasks/stats', () => {
    test('returns task statistics', async () => {
      await request(app)
        .post('/tasks')
        .send({ title: 'Todo' });

      await request(app)
        .post('/tasks')
        .send({ title: 'Done', status: 'done' });

      const response = await request(app).get('/tasks/stats');

      expect(response.status).toBe(200);
      expect(response.body.todo).toBe(1);
      expect(response.body.done).toBe(1);
      expect(response.body).toHaveProperty('overdue');
    });
  });
    describe('PATCH /tasks/:id/assign', () => {
    test('assigns a task to a user', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Assign me' });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({ assignee: 'Uday' });

      expect(response.status).toBe(200);
      expect(response.body.assignee).toBe('Uday');
    });

    test('trims whitespace from assignee name', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Assign me' });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({ assignee: '  Uday  ' });

      expect(response.status).toBe(200);
      expect(response.body.assignee).toBe('Uday');
    });

    test('rejects an empty assignee', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Assign me' });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({ assignee: '   ' });

      expect(response.status).toBe(400);
    });

    test('rejects a missing assignee', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Assign me' });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({});

      expect(response.status).toBe(400);
    });

    test('rejects a non-string assignee', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Assign me' });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({ assignee: 123 });

      expect(response.status).toBe(400);
    });

    test('returns 404 when task does not exist', async () => {
      const response = await request(app)
        .patch('/tasks/missing-id/assign')
        .send({ assignee: 'Uday' });

      expect(response.status).toBe(404);
    });

    test('does not overwrite an existing assignee', async () => {
      const created = await request(app)
        .post('/tasks')
        .send({ title: 'Assign me' });

      await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({ assignee: 'First User' });

      const response = await request(app)
        .patch(`/tasks/${created.body.id}/assign`)
        .send({ assignee: 'Second User' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Task is already assigned');
    });
  });
});