import assert from 'power-assert';
import { E_ErrorCode } from '../../../../app/lib/enum';
import { get, post } from '../../utils/request';

describe('test/app/controller/material-center/blockGroup.test.ts', () => {
  let tempBlockGroupId: any;
  describe('test  detail|list|create|update|delete', () => {
    it('should created block group success', async () => {
      const mockData = {
        name: `ut_group_${Date.now()}`,
        app: '918',
        desc: 'ut_group'
      }
      return post('/material-center/api/block-groups/create')
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id, name } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(name, mockData.name);
          tempBlockGroupId = id;
        });
    });

    it('should get block group list success', async () => {
      return get('/material-center/api/block-groups')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { data } = response.body;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(Array.isArray(data), true);
        });
    });

    it('should get block group detail success', async () => {
      return get(`/material-center/api/block-groups?id=${tempBlockGroupId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id } = response.body.data[0];
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(id, tempBlockGroupId);
        });
    })

    it('should update block group success', async () => {
      const mockData = {
        name: `ut_update_group_${Date.now()}`,
        desc: 'ut_update_group'
      }
      return post(`/material-center/api/block-groups/update/${tempBlockGroupId}`)
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { name } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(name, mockData.name);
        });
    });

    it('should delete block group success', async () => {
      return get(`/material-center/api/block-groups/delete/${tempBlockGroupId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(id, tempBlockGroupId);
        });
    })
  })

  describe('test block categories detail|delete|update illegal id params', () => {
    it('should get block group detail failed and status 200', async () => {
      return get('/material-center/api/block-groups?id=abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { data } = response.body;
          assert.ok(!response.body.error, 'response.body.error should be exist');
          assert.equal(Array.isArray(data) && data.length === 0, true);
        });
    });

    it('should delete block group failed and status 200', async () => {
      return get('/material-center/api/block-groups/delete/abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const code = response.body.error.code;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('should update block group failed and status 200', async () => {
      const mockData = {
        name: `ut_update_group_${Date.now()}`,
        desc: 'ut_update_group'
      }
      return post('/material-center/api/block-groups/update/abc')
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const code = response.body.error.code;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });
  })

  describe('test created block group parameters error', () => {
    it('created block group parameters error', async () => {
      const mockData = {
        message: 'test_block_group'
      }
      return post('/material-center/api/block-groups/create')
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const code = response.body.error.code;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('created block group missing parameters', async () => {
      const mockData = {}
      return post('/material-center/api/block-groups/create')
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const code = response.body.error.code;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });
  })
})