import assert from 'power-assert';
import { E_ErrorCode } from '../../../../app/lib/enum';
import { get, post } from '../../utils/request';


describe('test/app/controller/material-center/blockHistory.test.ts', () => {
  const tempBlockId = 991;
  let tempBlockHistoryId = 0;
  describe('test list|create|update|delete case', () => {
    // 创建接口为预留接口，前端不会调用，区块的历史记录在区块发布过程生成 
    // 此处服务于删除、更新接口的测试
    it('should created block history success', async () => {
      const mockData = {
        message: `add new ${tempBlockId} history record`,
        block: tempBlockId,
        content: {
          schema: {}
        },
      };
      return post('/material-center/api/block-history/create')
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id, message } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(message, mockData.message);
          tempBlockHistoryId = id;
        });
    })

    it('should created block history failed', async () => {
      const mockData = {
        message: `add new ${tempBlockId} history record`,
        block: '',
        content: {
          schema: {}
        },
      };
      return post('/material-center/api/block-history/create')
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const code = response.body.error.code;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    })

    it('should get block history list success', () => {
      return get(`/material-center/api/block-history?block=${tempBlockId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { data } = response.body;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(Array.isArray(data), true);
        });
    })

    it('should get block history list failed', () => {
      return get('/material-center/api/block-history?block=abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { data } = response.body;
          assert.ok(!response.body.error, 'response.body.error should be exist');
          assert.equal(Array.isArray(data) && data.length === 0, true);
        });
    })

    it('should delete block history success', () => {
      return get(`/material-center/api/block-history/delete/${tempBlockHistoryId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(id, tempBlockHistoryId);
        });
    })

    it('should delete block history failed', () => {
      return get('/material-center/api/block-history/delete/abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const code = response.body.error.code;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    })
  })
})