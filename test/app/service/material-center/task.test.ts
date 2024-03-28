import { app } from 'egg-mock/bootstrap';
import assert from 'power-assert';
import { E_TASK_STATUS, E_TASK_TYPE } from '../../../../app/lib/enum';


describe('test/app/controller/material-center/task.test.ts', () => {
  let taskId: number | string;
  describe('test task list|create|detail|update|delete case', () => {
    it('create: successfully created task', async () => {
      const body = {
        taskTypeId: E_TASK_TYPE.BLOCK_BUILD,
        taskStatus: E_TASK_STATUS.INIT,
        uniqueId: 100
      };
      const ctx = app.mockContext();
      const response = await ctx.service.task.create(body);
      assert.ok(!response.error, 'response.error should not be exist');
      assert.equal(body.uniqueId, response.data.uniqueId);
      taskId = response.data.id;
    });

    it('list: successfully get task list', async () => {
      const ctx = app.mockContext();
      const response = await ctx.service.task.list();
      const data = response.data;
      assert.ok(!response.error, 'response.error should not be exist');
      assert.equal(Array.isArray(data), true);
    });

    it('findById:', async () => {
      const ctx = app.mockContext();
      const response = await ctx.service.task.findById(taskId);
      assert.ok(!response.error, 'response.error should not be exist');
      const { id } = response.data;
      assert.equal(id, taskId);
    });

    it('find:', async () => {
      const ctx = app.mockContext();
      const response = await ctx.service.task.find(`id=${taskId}`);
      assert.ok(!response.error, 'response.error should not be exist');
      assert.equal(Array.isArray(response.data), true);
    });

    it('status:', async () => {
      const ctx = app.mockContext();
      const response = await ctx.service.task.status(`taskTypeId=${E_TASK_TYPE.BLOCK_BUILD}&uniqueIds=990`);
      const { taskTypeId } = response.data;
      assert.ok(!response.error, 'response.error should not be exist');
      assert.equal(taskTypeId, E_TASK_TYPE.BLOCK_BUILD);
    });

    it('update:', async () => {
      const body = {
        id: taskId,
        progress_percent: 100,
        taskResult: JSON.stringify({ result: 'block building completed' }),
        taskStatus: E_TASK_STATUS.FINISHED
      }
      const ctx = app.mockContext();
      const response = await ctx.service.task.update(body);
      assert.ok(!response.error, 'response.error should not be exist');
      const { taskStatus } = response.data;
      assert.equal(taskStatus, body.taskStatus);
    });

    it('getLatestTask:', async () => {
      const taskTypeId = E_TASK_TYPE.BLOCK_BUILD;
      const id = 100;
      const ctx = app.mockContext();
      const response = await ctx.service.task.getLatestTask(taskTypeId, id);
      assert.ok(!response.error, 'response.error should not be exist');
      const { uniqueId } = response.data;
      assert.equal(uniqueId, id);
    });

    it('delete:', async () => {
      const ctx = app.mockContext();
      const response = await ctx.service.task.delete({ id: taskId });
      assert.ok(!response.error, 'response.error should not be exist');
      const { id } = response.data;
      assert.equal(id, taskId);
    });
  });
});