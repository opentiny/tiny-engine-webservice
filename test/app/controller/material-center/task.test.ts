import assert from 'power-assert';
import { E_TASK_TYPE } from '../../../../app/lib/enum';
import { get } from '../../utils/request';


describe('test/app/controller/material-center/task.test.ts', () => {

  describe('test task status|detailcase', () => {
    const id = 1;
    it('GET material-center/api/tasks/status', () => {
      return get(`/material-center/api/tasks/status?taskTypeId=${E_TASK_TYPE.BLOCK_BUILD}&uniqueIds=990`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { taskTypeId } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(taskTypeId, E_TASK_TYPE.BLOCK_BUILD);
        });
    });

    it('GET material-center/api/tasks', () => {
      return get(`/material-center/api/tasks/${id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { data } = response.body;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(data.id, id);
        });
    });
  });
});
