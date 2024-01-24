import assert from 'power-assert';
import { E_ErrorCode } from '../../../../app/lib/enum';
import { doDelete, get, post, put } from '../../utils/request';

const tempAppId = 918;
let tempBlockCategoriesId: any;
describe('test/app/controller/material-center/blockCategories.test.ts', () => {
  describe('test list|create|update|delete case', () => {
    it('should get created block categories', async () => {
      const mockData = {
        name: `categories${Date.now()}`,
        app: tempAppId,
        desc: 'categories',
        category_id: `categories${Date.now()}`
      }
      return post(`/material-center/api/block-categories?appId=${tempAppId}`)
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id, name } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(name, mockData.name);
          tempBlockCategoriesId = id;
        });
    })

    it('should get block categories list', async () => {
      return get(`/material-center/api/block-categories?appId=${tempAppId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { data } = response.body;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(Array.isArray(data), true);
        });
    })

    it('should update block categories success', async () => {
      const mockData = {
        name: `categoriesTest${Date.now()}`
      }
      return put(`/material-center/api/block-categories/${tempBlockCategoriesId}`)
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { name } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(name, mockData.name);
        });
    })

    it('should delete block categories success', async () => {
      return doDelete(`/material-center/api/block-categories/${tempBlockCategoriesId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(id, tempBlockCategoriesId);
        });
    })
  })

  describe('test block categories list|update|delete illegal id params', () => {
    it('list: should status 200 and get code 400', () => {
      return get('/material-center/api/block-categories?appId=abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const code = response.body.error.code;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    })

    it('update: should status 200 and get code 400', () => {
      const mockData = {
        name: `categoriesTest${Date.now()}`
      }
      return put('/material-center/api/block-categories/abc')
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const code = response.body.error.code;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    })

    it('update: should status 200 and get code 404', () => {
      const mockData = {
        name: `categoriesTest${Date.now()}`
      }
      return put(`/material-center/api/block-categories/${Date.now()}`)
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const code = response.body.error.code;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM009);
        });
    })

    it('delete: should status 200 and get code 400', () => {
      return doDelete('/material-center/api/block-categories/abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const code = response.body.error.code;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    })

    it('delete: should status 200 and get code 500', () => {
      return doDelete(`/material-center/api/block-categories/${Date.now()}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const code = response.body.error.code;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM001);
        });
    })
  })

  describe('should created block categories failed', () => {
    it('send error param, should created block categories failed', async () => {
      const mockData = {
        message: 'blcok categories test'
      }
      return post(`/material-center/api/block-categories?appId=${tempAppId}`)
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const code = response.body.error.code;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    })

    it('send empty param, should created block categories failed', async () => {
      const mockData = {}
      return post(`/material-center/api/block-categories?appId=${tempAppId}`)
        .send(mockData)
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