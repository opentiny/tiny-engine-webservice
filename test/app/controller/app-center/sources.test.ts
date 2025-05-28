
import assert from 'power-assert';
import { E_ErrorCode } from '../../../../app/lib/enum';
import mockConst from '../../mockData/const.json';
import { get, post } from '../../utils/request';

describe('test/app/controller/app-center/sources.test.ts', () => {
  let dataSourceId: number | string;
  const aid = mockConst.appId;
  describe('test create|list|detail|update|delete case', () => {
    it('create: should get created success ', () => {
      const createBody = {
        name: 'testCreate',
        app: aid,
        data: {},
        tpl: 3,
        desc: 'testCreate'
      }
      return post('/app-center/api/sources/create')
        .send(createBody)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id, name } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(name, createBody.name);
          dataSourceId = id;
        });
    });

    it('list: should get sources list', () => {
      return get(`/app-center/api/sources/list/${dataSourceId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          assert.ok(!response.body.error, 'response.body.error should not be exist');
        });
    });

    it('detail: should get detail', () => {
      return get(`/app-center/api/sources/detail/${dataSourceId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(id, dataSourceId);
        });
    });

    it('update: successfully update data sources', () => {
      const updateBody = {
        name: 'testCreate1',
        app: aid,
        data: {},
        tpl: 3,
        desc: 'testCreate'
      }
      return post(`/app-center/api/sources/update/${dataSourceId}`)
        .send(updateBody)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { name } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(name, updateBody.name);
        });
    });

    it('delete: successfully delete data sources', () => {
      return get(`/app-center/api/sources/delete/${dataSourceId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(id, dataSourceId);
        });
    });
  });

  describe('test data sources list|create|detail|delete parameter error', () => {
    it('create: failed to create data sources', () => {
      const body = {
        name: 'testCreate',
        app: 'abc',
        data: {},
        tpl: 3,
        desc: 'testCreate'
      }
      return post('/app-center/api/sources/create')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('list: failed to get data sources list & response.error.code CM002', () => {
      return get('/app-center/api/sources/list/abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('detail: failed to get data sources detail & response.error.code CM002', () => {
      return get('/app-center/api/sources/detail/abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('delete: failed to delete data sources & response.error.code CM002', () => {
      return get('/app-center/api/sources/delete/abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });
  });

  describe('test data sources create|delete missing param', () => {
    it('create: failed to create page history, missing parameter', () => {
      const body = {
        message: 'test page history'
      };
      return post('/app-center/api/sources/create')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('create: failed to create data sources, empty parameter', () => {
      const body = {};
      return post('/app-center/api/sources/create')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });
  });
});
