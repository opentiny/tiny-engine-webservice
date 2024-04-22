import assert from 'power-assert';
import { E_ErrorCode } from '../../../../app/lib/enum';
import { get, post } from '../../utils/request';

describe('test/app/controller/app-center/pagesHistories.test.ts', () => {
  const pageId = 1538;
  let pagesHistoriesId: number | string;
  describe('test page history list|create|detail|delete case', () => {
    it('create: successfully created page history', () => {
      const body = {
        page: pageId,
        page_content: {
          pageId
        },
        message: 'test page history'
      }
      return post('/app-center/api/pages/histories/create')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id, page } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(page, body.page);
          pagesHistoriesId = id;
        });
    });

    it('list: successfully get page history list', () => {
      return get(`/app-center/api/pages/histories?page=${pageId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { data } = response.body;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(Array.isArray(data), true);
        });
    });

    it('detail: successfully get page history detail', () => {
      return get(`/app-center/api/pages/histories/${pagesHistoriesId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(id, pagesHistoriesId);
        });
    });

    it('delete: successfully deleted page history', () => {
      return get(`/app-center/api/pages/histories/delete/${pagesHistoriesId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(pagesHistoriesId, id);
        });
    });
  });

  describe('test page history list|create|detail|delete parameter error', () => {
    it('create: failed to create page history', () => {
      const body = {
        page: 'abc',
        page_content: {
          pageId: 'abc'
        },
        message: 'test page history'
      }
      return post('/app-center/api/pages/histories/create')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('list: failed to get page history list & response.error.code CM002', () => {
      return get('/app-center/api/pages/histories?app=abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('detail: failed to get page history detail & response.error.code CM002', () => {
      return get('/app-center/api/pages/histories/abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('delete: failed to delete page history & response.error.code CM002', () => {
      return get('/app-center/api/pages/histories/delete/abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });
  });

  describe('test page history create|delete missing param', () => {
    it('create: failed to create page history, missing parameter', () => {
      const body = {
        message: 'test page history'
      };
      return post('/app-center/api/pages/histories/create')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('create: failed to create page history, empty parameter', () => {
      const body = {};
      return post('/app-center/api/pages/histories/create')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('delete: failed to delete page history, enpty parameter', () => {
      return get('/app-center/api/pages/histories/delete')
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