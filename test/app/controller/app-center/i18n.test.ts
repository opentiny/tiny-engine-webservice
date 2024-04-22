import assert from 'power-assert';
import { E_ErrorCode } from '../../../../app/lib/enum';
import { get, post } from '../../utils/request';

describe('test/app/controller/app-center/i18n.test.ts', () => {
  let tempId: number | string;
  let tempEntriesId: number | string;
  describe('test create|list|detail|update|delete case', () => {
    it('create: should get created success ', () => {
      const createBody = {
        lang: 'en-UT',
        label: '英语(测试)'
      }
      return post('/app-center/api/i18n/langs/create')
        .send(createBody)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id, lang } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(lang, createBody.lang);
          tempId = id;
        });
    });

    it('list: should get i18n lang list', () => {
      return get('/app-center/api/i18n/langs')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { data } = response.body;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(Array.isArray(data), true);
        });
    });

    it('detail: should get i18 lang detail', () => {
      return get(`/app-center/api/i18n/langs/${tempId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { data } = response.body;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(tempId, data.id);
        });
    });

    it(`update: update i18n lang shoud status 200`, () => {
      const body = {
        lang: 'en-UT',
        label: '英语(测试1)'
      };
      return post(`/app-center/api/i18n/langs/update/${tempId}`)
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { label } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(label, body.label);
        });
    });

    it('delete: should delete i18n lang success', () => {
      return get(`/app-center/api/i18n/langs/delete/${tempId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { data } = response.body;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(tempId, data.id);
        });
    });
  });

  describe('test i18n lang detail|update|delete, id parameter error', () => {
    it('detail: should status 200', () => {
      return get(`/app-center/api/i18n/langs?id=abc`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { data } = response.body;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(Array.isArray(data) && data.length === 0, true);
        });
    });

    it('update: should status 200 and response.error.code 400', () => {
      const body = {
        lang: 'en-UT',
        lable: '英语(测试2)'
      };
      return post('/app-center/api/i18n/langs/update/abc')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('update: should status 200 and response.error.code 404', () => {
      const body = {
        lang: 'en-UT',
        lable: '英语(测试2)'
      };
      return post(`/app-center/api/i18n/langs/update/${Date.now()}`)
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM009);
        });
    });

    it('delete: should status 200 and response.error.code 400', () => {
      return get('/app-center/api/i18n/langs/delete/abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('delete: should status 200 and response.error.code 500', () => {
      return get(`/app-center/api/i18n/langs/delete/${Date.now()}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM001);
        });
    });
  });

  describe('test i18n lang create missing parameter', () => {
    it('create: send error parameter, should status 200 & response.errpr.code CM002', () => {
      const createBody = {
        message: '英语(测试)'
      };
      return post('/app-center/api/i18n/langs/create')
        .send(createBody)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('create: send empty parameter, should status 200 & response.errpr.code CM002', () => {
      const createBody = {};
      return post('/app-center/api/i18n/langs/create')
        .send(createBody)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });
  });

  describe('test i18n entries create|detail|update|delete case', () => {
    it('create: should get created success ', () => {
      const createBody = {
        host: 1510,
        host_type: 'app',
        key: 'tinyEngine.3c761',
        contents: {
          zh_CN: '测试2',
          en_US: 'test2'
        }
      }
      return post('/app-center/api/i18n/entries/create')
        .send(createBody)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id, host } = response.body.data[0];
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(host, createBody.host);
          tempEntriesId = id;
        });
    });

    it('detail: should get i18n entries detail', () => {
      return get(`/app-center/api/i18n/entries/${tempEntriesId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { data } = response.body;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(tempEntriesId, data.id);
        });
    })

    // 修改国际化多语言词条
    it('update: update i18n entries, should status 200', () => {
      const body = {
        host: 1510,
        host_type: 'app',
        key: 'tinyEngine.3c761',
        contents: {
          zh_CN: '测试3',
          en_US: 'test3'
        }
      };
      return post('/app-center/api/i18n/entries/update')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { content } = response.body.data[0];
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(content, body.contents.zh_CN);
        });
    });

    // 修改国际化单语言词条
    it('update: update i18n entries, should status 200', () => {
      const body = {
        lang: 1,
        content: '测试3',
      };
      return post(`/app-center/api/i18n/entries/update/${tempEntriesId}`)
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { content } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(content, body.content);
        });
    });

    it('delete: should delete i18n entries', () => {
      const body = {
        host: 1510,
        host_type: 'app',
        key_in: ['tinyEngine.3c761'],
      };
      return post('/app-center/api/i18n/entries/bulk/delete')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id } = response.body.data[0];
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(tempEntriesId, id);
        });
    });
  });

  describe('test i18n entries create|delete missing parameter', () => {
    it('create: send error parameter,should status 200 & response.error.code CM0002', () => {
      const createBody = {
        messages: '测试',
      };
      return post('/app-center/api/i18n/entries/create')
        .send(createBody)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('create: send empty parameter,should status 200 & response.error.code CM0002', () => {
      const createBody = {};
      return post('/app-center/api/i18n/entries/create')
        .send(createBody)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('delete: send empty parameter,should status 200 & response.error.code CM0002', () => {
      const body = {};
      return post('/app-center/api/i18n/entries/bulk/delete')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('delete: send error parameter,should status 200 & response.error.code CM0002', () => {
      const body = {
        messages: '测试',
      };
      return post('/app-center/api/i18n/entries/bulk/delete')
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

  describe('test i18n entries update|detail missing parameter', () => {
    it('multiUpdate: should status & response.error.code CM0002', () => {
      const body = {
        id: 'abc',
      };
      return post('/app-center/api/apps/abc/i18n/entries/multiUpdate')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('entries update: should status & response.error.code CM0002', () => {
      const body = {
        id: 'abc',
      };
      return post('/app-center/api/apps/abc/i18n/entries/update')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('update: should status & response.error.code CM0002', () => {
      const body = {
        lang: 1,
        contents: '测试3',
      };
      return post('/app-center/api/i18n/entries/update/abc')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('update: should status & response.error.code CM0009', () => {
      const body = {
        lang: 1,
        contents: '测试3',
      };
      return post(`/app-center/api/i18n/entries/update/${Date.now()}`)
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM009);
        });
    });

    it('detail: should status & response.error.code CM0002', () => {
      return get('/app-center/api/i18n/entries?id=abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { data } = response.body;
          assert.equal(Array.isArray(data), false);
        });
    });
  });

  describe('test i18n entries batch create|delete case', () => {
    it('create: should get created success ', () => {
      const createBody = {
        host: 1510,
        host_type: 'app',
        entries: [{
          key: 'tinyEngine.3c761',
          contents: {
            zh_CN: '测试1',
            en_US: 'test1'
          },
        },
        {
          key: 'tinyEngine.3c762',
          contents: {
            zh_CN: '测试2',
            en_US: 'test2'
          },
        },
        {
          key: 'tinyEngine.3c763',
          contents: {
            zh_CN: '测试3',
            en_US: 'test3'
          },
        }]
      }
      return post('/app-center/api/i18n/entries/batch/create')
        .send(createBody)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { host } = response.body.data[0];
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(host, createBody.host);
        });
    });

    it('delete: should delete i18n entries', () => {
      const body = {
        host: 1510,
        host_type: 'app',
        key_in: ['tinyEngine.3c761', 'tinyEngine.3c762', 'tinyEngine.3c763'],
      };
      return post('/app-center/api/i18n/entries/bulk/delete')
        .send(body)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { host } = response.body.data[0];
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(body.host, host);
        });
    });
  });

  describe('test i18n entris batch create missing parameter', () => {
    it('create: send error parameter, should status 200 & response.error.code CM0002', () => {
      const createBody = {
        host: 'abc',
        host_type: 'app',
        entries: [{
          key: '',
          contents: {
            zh_CN: '测试1',
            en_US: 'test1'
          },
        },
        {
          key: '',
          contents: {
            zh_CN: '测试2',
            en_US: 'test2'
          },
        },
        {
          key: '',
          contents: {
            zh_CN: '测试3',
            en_US: 'test3'
          },
        }]
      }
      return post('/app-center/api/i18n/entries/batch/create')
        .send(createBody)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });
  });
})
