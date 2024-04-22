
import assert from 'power-assert';
import { E_ErrorCode } from '../../../../app/lib/enum';
import mockConst from '../../mockData/const.json';
import { get, post } from '../../utils/request';

describe('test/app/controller/app-center/sourceTpl.test.ts', () => {
  let sourceTplId: number | string;
  const platformId = mockConst.platformId;
  describe('test create|detail|update|delete case', () => {
    it('create: should get created success ', () => {
      const body = {
        name: 'testCreate2',
        data: { name: 'bbox' },
        platform: '835',
        desc: 'testCreate2'
      }
      return post('/app-center/api/source_tpl/create')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id, name } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(name, body.name);
          sourceTplId = id;
        });
    });

    it('detail: should get sourceTpl detail', () => {
      return get(`/app-center/api/source_tpl/${sourceTplId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(id, sourceTplId);
        });
    });

    it('update: successfully update sourceTpl', () => {
      const updateBody = {
        name: 'testCreate2',
        data: { name: 'bbox' },
        platform: '835',
        desc: 'testCreate2'
      }
      return post(`/app-center/api/source_tpl/update/${sourceTplId}`)
        .send(updateBody)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { name } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(name, updateBody.name);
        });
    });

    it('delete: successfully delete sourceTpl', () => {
      return get(`/app-center/api/source_tpl/delete/${sourceTplId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(id, sourceTplId);
        });
    });
  });

  describe('test data sources create|detail|update|delete parameter error', () => {
    it('create: failed to create data sources', () => {
      const body = {
        name: 'testCreate2',
        data: { name: 'bbox' },
        platform: platformId,
        desc: 'testCreate2'
      }
      return post('/app-center/api/source_tpl/create')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('update: successfully update sourceTpl', () => {
      const updateBody = {
        name: 'testCreate2',
        data: { name: 'bbox' },
        platform: platformId,
        desc: 'testCreate2'
      }
      return post('/app-center/api/source_tpl/update/abc')
        .send(updateBody)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });
    it('detail: failed to get sourceTpl detail & response.error.code CM002', () => {
      return get('/app-center/api/source_tpl/abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('delete: failed to delete source_tpl & response.error.code CM002', () => {
      return get('/app-center/api/source_tpl/delete/abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });
  });

  describe('test sourceTpl create|delete missing param', () => {
    it('create: failed to create sourceTpl, missing parameter', () => {
      const body = {
        message: 'test page history'
      };
      return post('/app-center/api/source_tpl/create')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('create: failed to create sourceTpl, empty parameter', () => {
      const body = {};
      return post('/app-center/api/source_tpl/create')
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
