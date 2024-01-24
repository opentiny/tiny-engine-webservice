
import assert from 'power-assert';
import { E_ErrorCode } from '../../../../app/lib/enum';
import { get, post } from '../../utils/request';

const tempAppId = 918;
const tempCategoryId = 2;
const tempGroupId = 1;
let tempBlockId = 0;
let tempBlock: any;
const now = Date.now();
describe('test/app/controller/material-center/block.test.ts', () => {
  describe('GET /material-center/blocks', () => {
    it('should get blocks success', async () => {
      const res = await get(`/material-center/api/blocks?appId=${tempAppId}`).expect(200);
      assert.ok(!res.body.error, 'res.body.error should not be exist');
      assert.ok(Array.isArray(res.body.data), 'res.body.data should be array');
    });

    it('should get blocks list success with categoryId', async () => {
      const res = await get(`/material-center/api/blocks?appId=${tempAppId}&categoryId=${tempCategoryId}`).expect(200);
      assert.ok(!res.body.error, 'res.body.error should not be exist');
      assert.ok(Array.isArray(res.body.data), 'res.body.data should be array');
    });

    it('should get blocks failed with invalid categoryId', async () => {
      const res = await get(`/material-center/api/blocks?appId=${tempAppId}&categoryId=4`).expect(200);
      assert.ok(res.body.error, 'res.body.error should be exist');
      assert.ok(res.body.error.code, 'res.body.error.code should be CM206');
    });
  })

  describe('GET /material-center/api/block/list', () => {
    it('should get block list success', async () => {
      const res = await get('/material-center/api/block/list').expect(200);
      assert.ok(!res.body.error, 'res.body.error should not be exist');
      assert.ok(Array.isArray(res.body.data), 'res.body.data should be array');
    });

    it('should get block list success with appId', async () => {
      const res = await get(`/material-center/api/block/list?appId=${tempAppId}`).expect(200);
      assert.ok(!res.body.error, 'res.body.error should not be exist');
      assert.ok(Array.isArray(res.body.data), 'res.body.data should be array');
    });

    it('should get block list  success with invalid appId', async () => {
      const res = await get('/material-center/api/block/list?appId=abc').expect(200);
      assert.ok(!res.body.error, 'res.body.error should not be exist');
      assert.ok(Array.isArray(res.body.data), 'res.body.data should be array');
    });
  })

  describe('GET /material-center/api/block', () => {
    it('should find success', async () => {
      const res = await get('/material-center/api/block').expect(200);
      assert.ok(!res.body.error, 'res.body.error should not be exist');
      assert.ok(Array.isArray(res.body.data), 'res.body.data should be array');
    });
  })

  describe('GET /material-center/api/block/count', () => {
    it('should get count success', async () => {
      const res = await get('/material-center/api/block/count').expect(200);
      assert.ok(!res.body.error, 'res.body.error should not be exist');
      assert.ok(res.body.data, 'res.body.data should be exist');
    });
  })

  describe('GET /material-center/api/block/notgroup/:groupId', () => {
    it('should get notgroup block success', async () => {
      const res = await get(`/material-center/api/block/notgroup/${tempGroupId}`).expect(200);
      assert.ok(!res.body.error, 'res.body.error should not be exist');
      assert.ok(Array.isArray(res.body.data), 'res.body.data should be array');
    });
  })

  describe('POST /material-center/api/block/create', () => {
    it('should create block success', async () => {
      const mockData = {
        label: `UnitTest${now}`,
        name_cn: `单测_${now}`,
        framework: 'Vue',
        content: {},
        description: 'ut_desc',
        path: `path_${now}`,
        created_app: tempAppId,
        tags: ['ut'],
        public: 0,
        screenshot: 'test'
      }
      const res = await post('/material-center/api/block/create')
        .send(mockData)
        .expect(200);
      assert.ok(!res.body.error, 'res.body.error should not be exist');
      assert.ok(res.body.data, 'res.body.error should be exist');
      assert.ok(res.body.data.id, 'res.body.error should be exist');
      tempBlockId = res.body.data.id;
    });
    it('should create block failed with appId', async () => {
      const mockData = {
        label: 'BlockTest',
        name_cn: 'BlockTest',
        framework: 'Vue',
        content: {},
        description: 'ut_desc',
        path: `path_${now}`,
        created_app: 'appId',
        tags: ['ut'],
        public: 0,
        screenshot: 'test'
      }
      return post('/material-center/api/block/create')
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const code = response.body.error.code;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    it('should create block failed and get 400 code', async () => {
      const mockData = {
        label: `unit_test${now}`,
        name_cn: `单测_${now}`,
        framework: 'Vue',
        content: {},
        description: 'ut_desc',
        path: `path_${now}`,
        created_app: tempAppId,
        tags: ['ut'],
        public: 0,
        screenshot: 'test'
      }
      return post('/material-center/api/block/create')
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

  describe('GET /material-center/api/block/detail:id', () => {
    it('should get block detail by id success', async () => {
      const res = await get(`/material-center/api/block/detail/${tempBlockId}`).expect(200);
      assert.ok(!res.body.error, 'res.body.error should not be exist');
      assert.ok(res.body.data, 'res.body.error should be exist');
      assert.equal(res.body.data.id, tempBlockId, 'res.body.data.id should equal to tempBlockId');
      tempBlock = res.body.data;
    })
  })

  describe('POST /material-center/api/block/update:id', () => {
    it('should update block success', async () => {
      const mockDate = {
        description: 'ut_block_update'
      }
      const res = await post(`/material-center/api/block/update/${tempBlockId}?${tempAppId}`)
        .send(mockDate)
        .expect(200);
      assert.ok(!res.body.error, 'res.body.error should not be exist');
      assert.ok(res.body.data, 'res.body.error should be exist');
      assert.equal(res.body.data.id, tempBlockId, 'res.body.data.id should equal to tempBlockId');
      assert.equal(res.body.data.description, mockDate.description, 'res.body.data.description should equal to mockData.description');
    });

    it('should update block failed and get 400 code', async () => {
      const mockData = {
        name_cn: `name${now}`,
        content: {
          componentName: ['block']
        },
      }
      return post(`/material-center/api/block/update/${tempBlockId}`)
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const code = response.body.error.code;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    })

    it('should update block failed and get 500 code', async () => {
      const mockData = {
        name_cn: `name${now}`,
      }
      return post(`/material-center/api/block/update/0`)
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const code = response.body.error.code;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM001);
        });
    })
  })

  describe('GET /material-center/api/block/code/:id', () => {
    it('should get code failed without current_history', async () => {
      const res = await get(`/material-center/api/block/code/${tempBlockId}`).expect(200);
      assert.ok(res.body.error, 'res.body.error should be exist');
      assert.equal(res.body.error.code, E_ErrorCode.CM002, 'res.body.error.code should equal to E_ErrorCode.CM002');
    });
  })

  describe('GET /material-center/api/block/delete/:id', () => {
    it('should delete block success', async () => {
      const res = await get(`/material-center/api/block/delete/${tempBlockId}`).expect(200);
      assert.ok(!res.body.error, 'res.body.error should be exist');
      assert.ok(res.body.data, 'res.body.error should be exist');
      assert.equal(res.body.data.id, tempBlockId, 'res.body.data.id should equal to tempBlockId');
    });

    it('should delete failed and get code 404', async () => {
      return get('/material-center/api/block/delete/abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const code = response.body.error.code;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM001);
        });
    })
  })

  describe('block with tags|users|tenants', () => {
    it('should status 200 and get allTags', async () => {
      return get('/material-center/api/block/tags')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { data } = response.body;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(Array.isArray(data), true);
        });
    })

    it('should status 200 and get allAuthor', async () => {
      return get('/material-center/api/block/users')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should not be exist');
          assert.equal(code, E_ErrorCode.CM001);
        });
    })

    it('should status 200 and get allTenants', async () => {
      return get('/material-center/api/block/tenants')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { data } = response.body;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(Array.isArray(data), true);
        });
    })
  })

  describe('POST /material-center/api/block/deploy', () => {
    it('should block deploy failed with blockId', async () => {
      const mockData = {
        block: tempBlock,
        version: '1.0.0',
        deploy_info: 'deploy block 1.0.0',
        is_compile: true,
      }
      const res = await post('/material-center/api/block/deploy')
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/);
      const code = res.body.error.code;
      assert.ok(res.body.error, 'res.body.error should be exist');
      assert.equal(code, E_ErrorCode.CM001);
    })

    it('should block deploy failed', async () => {
      const mockData = {
        block: tempBlock,
        deploy_info: 'deploy block 1.0.0',
        is_compile: true,
      }
      const res = await post('/material-center/api/block/deploy')
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/);
      const code = res.body.error.code;
      assert.ok(res.body.error, 'res.body.error should be exist');
      assert.equal(code, E_ErrorCode.CM002);
    })
  })
})