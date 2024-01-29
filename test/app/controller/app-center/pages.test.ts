import assert from 'power-assert';
import { E_ErrorCode } from '../../../../app/lib/enum';
import { get, post } from '../../utils/request';

let tempPageId = 0;
const appId = 918;
const tempPageRoute = `page-${Date.now()}`;
let tempFolderId = 0;
describe('test/app/controller/app-center/pages.test.ts', () => {
  describe('test page create', () => {
    it('should created page success', async () => {
      const mockData = {
        name: `ut_page_${Date.now()}`,
        app: appId,
        route: tempPageRoute,
        isPage: true,
        parentId: 1,
        group: 'staticPages',
        isDefault: false,
        isHome: false,
        isBody: false,
        message: 'create',
        page_content: {},
      }
      return post('/app-center/api/pages/create')
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id, name } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(name, mockData.name);
          tempPageId = id;
        });
    });

    it('should created page failed', async () => {
      const mockData = {
        name: `ut_page_${Date.now()}`,
        app: appId,
        isPage: true,
        parentId: 1,
        group: 'staticPages',
        isDefault: false,
        isHome: false,
        isBody: false,
        message: 'create',
        page_content: {},
      }
      return post('/app-center/api/pages/create')
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    //创建页面分支测试，isHome为true
    it('should created page success', async () => {
      const mockData = {
        name: `ut_page_${Date.now()}`,
        app: appId,
        route: tempPageRoute,
        isPage: true,
        parentId: 1,
        group: 'staticPages',
        isDefault: false,
        isHome: true,
        isBody: false,
        message: 'create',
        page_content: {},
      }
      return post('/app-center/api/pages/create')
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should not be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });

    //创建页面分支测试，isHome为true且parentId为0
    it('should created page success', async () => {
      const mockData = {
        name: `ut_page_${Date.now()}`,
        app: appId,
        route: tempPageRoute,
        isPage: true,
        parentId: 0,
        group: 'staticPages',
        isDefault: false,
        isHome: true,
        isBody: false,
        message: 'create',
        page_content: {},
      }
      return post('/app-center/api/pages/create')
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { route } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(route, mockData.route);
        });
    });

    it('should created folder success', async () => {
      const mockData = {
        name: `ut_folder_${Date.now()}`,
        app: appId,
        route: `ut_route_${Date.now()}`,
        isPage: false,
        parentId: 0,
      }
      return post('/app-center/api/pages/create')
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id, name } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(name, mockData.name);
          tempFolderId = id;
        });
    })

    it('should created folder failed', async () => {
      const mockData = {
        name: `ut_folder_${Date.now()}`,
        app: appId,
        isPage: false,
        parentId: 0,
      }
      return post('/app-center/api/pages/create')
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    });
  })

  describe('test code|metadata|schema2code', () => {
    // 获取页面或者区块代码
    it('should get dslcode success', async () => {
      return get(`/app-center/api/code?id=${tempPageId}&app=${appId}&type=Page`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { panelType } = response.body.data[0];
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(panelType, 'vue');
        });
    })

    it('should get dslcode failed', async () => {
      return get(`/app-center/api/code?id=${tempPageId}&app=abc&type=Page`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    })

    // 获取预览元数据
    it('should get preview metadata success', async () => {
      return get(`/app-center/api/preview/metadata?id=${tempPageId}&app=${appId}&type=Page`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.ok(response.body.data, 'response.body.data should be exist');
        });
    })

    it('should get preview metadata failed', async () => {
      return get(`/app-center/api/preview/metadata?id=${tempPageId}&app=abc&type=Page`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM009);
        });
    })

    // 获取页面代码
    it('should get schema2code success', async () => {
      const mockData = {
        app: appId,
        pageInfo: {
          schema: {},
          name: 'createVm',
        },
      }
      return post('/app-center/api/schema2code')
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { panelType } = response.body.data[0];
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(panelType, 'vue');
        });
    })

    it('should get schema2code failed', async () => {
      const mockData = {
        app: appId,
        pageInfo: 'test',
      }
      return post('/app-center/api/schema2code')
        .send(mockData)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    })
  })

  describe('test list|detail|update|delete', () => {
    const updateBody = {
      route: `ut_route${Date.now()}`
    };
    it('should get page list success', async () => {
      return get(`/app-center/api/pages/list/${appId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { data } = response.body;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(Array.isArray(data), true);
        });
    })

    it('should get page list failed', async () => {
      return get('/app-center/api/pages/list/abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    })

    it('should update page success', async () => {
      return post(`/app-center/api/pages/update/${tempPageId}`)
        .send(updateBody)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { route } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(route, updateBody.route);
        });
    })

    it('should update page failed', async () => {
      return post('/app-center/api/pages/update/abc')
        .send(updateBody)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    })

    it('should update folder success', async () => {
      return post(`/app-center/api/pages/update/${tempFolderId}`)
        .send(updateBody)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { route } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(route, updateBody.route);
        });
    })

    it('shoud get page detail success', async () => {
      return get(`/app-center/api/pages/detail/${tempPageId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(id, tempPageId);
        });
    })

    it('shoud get page detail failed', async () => {
      return get('/app-center/api/pages/detail/abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    })

    it('shoud deleted page success', async () => {
      return get(`/app-center/api/pages/delete/${tempPageId}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { id } = response.body.data;
          assert.ok(!response.body.error, 'response.body.error should not be exist');
          assert.equal(id, tempPageId);
        });
    })

    it('shoud deleted page failed', async () => {
      return get('/app-center/api/pages/delete/abc')
        .expect(200)
        .expect('Content-Type', /json/)
        .then((response) => {
          const { code } = response.body.error;
          assert.ok(response.body.error, 'response.body.error should be exist');
          assert.equal(code, E_ErrorCode.CM002);
        });
    })
  })

})