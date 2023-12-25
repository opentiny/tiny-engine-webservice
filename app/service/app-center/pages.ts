/**
* Copyright (c) 2023 - present TinyEngine Authors.
* Copyright (c) 2023 - present Huawei Cloud Computing Technologies Co., Ltd.
*
* Use of this source code is governed by an MIT-style license.
*
* THE OPEN SOURCE SOFTWARE IN THIS PRODUCT IS DISTRIBUTED IN THE HOPE THAT IT WILL BE USEFUL,
* BUT WITHOUT ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS FOR
* A PARTICULAR PURPOSE. SEE THE APPLICABLE LICENSES FOR MORE DETAILS.
*
*/
import { StatusCodes } from 'http-status-codes';
import * as qs from 'querystring';
import { ApiError, throwApiError } from '../../lib/ApiError';
import { E_AppErrorCode, E_ErrorCode, E_Framework, E_Method, E_Schema2CodeType, E_TYPES } from '../../lib/enum';
import { I_CreatePageParam, I_GetOutcomeParam, I_Response, I_TranslateSchemaParam, I_UpdatePageParam } from '../../lib/interface';
import DataService from '../dataService';

class Pages extends DataService {
  paramKeys: string[] = ['isBody', 'parentId', 'isPage', 'isDefault'];
  resKeys: string[] = ['is_body', 'parent_id', 'is_page', 'is_default'];

  async find(param) {
    const query = typeof param === 'string' ? param : qs.stringify(param);
    return await this.fQuery({ url: `pages?${query}` });
  }

  async getPageById(id: number) {
    const { appCenter, materialCenter } = this.ctx.service;
    const pageInfo: I_Response = await this.fQuery({
      url: `pages/${id}`
    });
    
    const appSchemaMate: I_Response = await appCenter.apps.schemaMeta(pageInfo.data.app, {
      part: ['materialHistory']
    });
    
    const { framework } = appSchemaMate.data.materialHistory || {};
    if (!framework) {
      throwApiError('', Number(E_ErrorCode.BadRequest), E_AppErrorCode.CM312);
    }
    if (pageInfo.data?.isPage) {
      // 这里不保证能成功获取区块的列表，没有区块或获取区块列表不成功返回 {}
      pageInfo.data.assets = await materialCenter.block.getBlockAssets(pageInfo.data.page_content, framework);
      return this.addIsHome(pageInfo);
    }
    return pageInfo;
  }

  async getPagesByAppId(aid: number) {
    const pageList: I_Response = await this.fQuery({
      url: `pages/list/${aid}`
    });

    const res: Array<any> = [];
    pageList.data.forEach(item => {
      if (item.isHome === '1') {
        item.isHome = true;
        res.unshift(item);
      } else {
        item.isHome = false;
        res.push(item);
      }
    });

    pageList.data = res;
    return pageList;
  }

  async delPage(id: number) {
    // 获取页面信息
    const pageInfo = await this.getPageById(id);
    // 判断是页面还是文件夹
    if (!pageInfo.data.isPage) {
      // 如果是文件夹，调folder service的处理逻辑
      return await this.service.appCenter.folders.del(id);
    }

    // 保护默认页面
    await this.protectDefaultPage(pageInfo, pageInfo.data.app);

    return await this.fQuery({
      url: `pages/${id}`,
      method: E_Method.Delete
    });
  }

  async updatePage(param: I_UpdatePageParam) {
    const id = param.id;
    const { folderTree } = this.ctx.service.appCenter;
    let isHomeVal = false;
    const pageInfo = await this.getPageById(id);
    if (!this.validateIsHome(param, pageInfo)) {
      return folderTree.getErrorRes('isHome parameter error');
    }

    const { app } = pageInfo.data;

    // 保护默认页面
    await this.protectDefaultPage(pageInfo, app);

    let res: any = {};
    // 针对参数中isHome的传值进行isHome字段的判定
    if (param.isHome === true) {
      res = await this.setAppHomePage(app, id);
      isHomeVal = true;
    } else if (param.isHome === false) {
      // 判断页面原始信息中是否为首页
      const { isHome } = pageInfo.data;
      if (isHome === true) {
        res = await this.setAppHomePage(app, 0);
      }
      isHomeVal = false;
    } else {
      res = await this.getAppHomePageId(app);
      if (typeof res === 'number') {
        isHomeVal = Number(id) === res;
      }
    }

    const updatePageInfo = await this.fQuery({
      url: `pages/${id}`,
      method: E_Method.Put,
      data: param
    });

    updatePageInfo.data.isHome = isHomeVal;
    pageInfo.data.message = param.message;
    // 保存成功，异步生成页面历史记录快照,不保证生成成功
    this.service.appCenter.pageHistories.save(pageInfo);
    return updatePageInfo;
  }

  async protectDefaultPage(pageInfo: I_Response, id: number) {
    if (pageInfo.data.isDefault){
      // 查询是否是模板应用，不是的话不能删除或修改
      const app = await this.service.appCenter.apps.findOne({id});
      if (!app.data?.template_type) {
        throw (new ApiError('', E_ErrorCode.BadRequest, E_AppErrorCode.CM301));
      }
    }
  }

  async createPage(param: I_CreatePageParam) {
    const { folderTree } = this.ctx.service.appCenter;
    // 判断isHome 为true时，parentId 不为0，禁止创建
    if (param.isHome && Number(param.parentId) !== 0) {
      return folderTree.getErrorRes('Homepage can only be set in the root directory');
    }
    // 将前端创建页面传递过来的staic/public 设置为 staticPages/publicPages
    if (param.group && ['static', 'public'].includes(param.group)) {
      param.group += 'Pages';
    }
    const pageInfo: I_Response = await this.fQuery({
      url: 'pages',
      method: E_Method.Post,
      data: param
    });

    // 对isHome 字段进行特殊处理
    if (param.isHome === true) {
      const res = await this.setAppHomePage(param.app, pageInfo.data.id);
      if (res !== true) {
        return res;
      }
    }
    pageInfo.data.isHome = !!param.isHome;
    return pageInfo;
  }

  async getGeneratorNgCode(pageId: number | string): Promise<I_Response> {
    //  获取页面原始数据详情
    const pageInfo: I_Response = await this.getInitialPageById(pageId);
    const { app: appId, page_content: schema, name } = pageInfo.data;
    const codeData = await this.translateSchema({
      schema,
      appId,
      type: E_Schema2CodeType.PAGE,
      name,
      framework: E_Framework.Angular
    });
    if (!codeData.data) {
      throwApiError('', StatusCodes.BAD_REQUEST, E_AppErrorCode.CM313);
    }

    pageInfo.data.page_content = codeData.data;
    return pageInfo;
  }

  /**
   * 调用dsl转换页面或区块的schema为代码
   * @param { I_GetOutcomeParam } params 
   * @returns { Promise<I_Response> } dsl库返回解析代码的对象
   */
  async getOutcome(params: I_GetOutcomeParam): Promise<I_Response> {
    const { type, id, app: appId, history } = params;
    let schema: any;
    let name = '';
     // 如果history参数存在，则要获取对应历史记录的schema
    if (type === E_Schema2CodeType.BLOCK) {
      const url = history ? `block-histories/${history}` : `blocks/${id}`;
      const blockInfo: I_Response = await this.query({ url });
      schema = blockInfo.data.content;
      name = blockInfo.data.label;
    } else {
      const url = history ? `pages-histories/${history}` : `pages/${id}`;
      const pageInfo: I_Response = await this.query({ url });
      schema = pageInfo.data.page_content;
      name = pageInfo.data.name;
    }

    return this.translateSchema({
      schema,
      name,
      type,
      appId
    });
  }

  /**
   * 通过dsl 将参数传入的页面/区块schema数据生成对应代码
   * @param { string|number } appId 应用id
   * @param { any } pageInfo 页面内容数据
   * @param { E_Schema2CodeType } type 处理数据类型， 默认 Page
   * @return { Promise<I_Response> } dsl函数返回数据
  */
  schema2code(appId: string | number, pageInfo: any, type: E_Schema2CodeType = E_Schema2CodeType.PAGE): Promise<any> {
    const { schema, name } = pageInfo;
    return this.translateSchema({
      schema,
      name,
      type,
      appId
    });
  }

  /**
   * 获取 页面（虽然这个接口数据跟页面没啥关系）/区块的预览元数据
   * @param { E_Schema2CodeType } type 页面还是区块
   * @param { number|string } id 页面或区块id
   * @param { number|string } app 应用id
   * @return { Promise<I_Response> }
  */
  getPreviewMetaData(type: E_Schema2CodeType, id: number | string, app: number | string): Promise<I_Response> {
    const { appCenter, materialCenter } = this.service;
    if (type === E_Schema2CodeType.BLOCK) {
      return materialCenter.block.getBlockPreviewMetaData(id);
    }
    return appCenter.apps.getAppPreviewMetaData(app);
  }

  // 通过页面id获取页面/区块的 content json中 包含的全部显示/隐式 引用的区块构建产物数据
  protected getAllBlockHistories(hostId: string | number, hostType: E_Schema2CodeType) {
    const url = hostType === E_Schema2CodeType.PAGE ? 'pages/blockhistories' : 'blocks/blockhistories';
    return this.query({
      url: `${url}/${hostId}`
    });
  }

  /**
   * 通过appId 获取 dsl 必须的 components 和 blocksData数据
   * @param { string|number } appId 应用id
   * @return {any} 返回对应参数
  */
  protected async getDslParamByAppId(appId: string | number) {
    const { appCenter } = this.service;
    // 获取应用下的物料资产包
    const appMetaData: I_Response = await appCenter.apps.schemaMeta(appId, {
      part: ['blockHistories', 'materialHistory']
    });

    const { blockHistories, materialHistory } = appMetaData.data;
    const { framework, components } = materialHistory;
    return {
      blockHistories,
      framework,
      components,
      materialHistory
    };
  }

  /**
   * 通过dsl 将页面/区块schema数据生成对应代码
   * @param { I_TranslateSchemaParam } params
   * @return {Promise<I_Response>} dsl函数返回数据
  */
  protected async translateSchema(params: I_TranslateSchemaParam): Promise<I_Response> {
    const { appCenter } = this.service;
    const {schema, name, type = E_Schema2CodeType.PAGE, appId, framework: customFramework } = params;
    const { blockHistories = [], components = [], framework: materialFramework } = await this.getDslParamByAppId(appId);
    // 页面/区块 预览只需将页面、区块路径和区块构建产物路径统一设置为 ./components 即可
    const defaultMain = './components';
    let componentsMap: Array<any> = appCenter.appSchema.getComponentSchema(components);
    componentsMap = componentsMap.concat(appCenter.appSchema.getBlockSchema(blockHistories));
    componentsMap.forEach((component) => {
      if (component.main !== undefined) {
        component.main = defaultMain;
      }
    });
    if (type === E_Schema2CodeType.PAGE) {
      componentsMap.push({
        componentName: name,
        main: defaultMain
      });
    }
    const framework = customFramework ?? materialFramework ?? E_Framework.Vue;
    const gpkg = this.app.config.dsl[E_TYPES[framework]];
    const { generateCode } = require(gpkg.dslPkgCore);
    const code = await this.getPromiseCode(generateCode, { 
      pageInfo: { schema, name }, 
      blocksData:blockHistories, 
      componentsMap 
    }).catch((e) => {
      this.logger.error('generateCode failed to execute：', e);
      throwApiError('', StatusCodes.BAD_REQUEST, E_AppErrorCode.CM313);
    });
    return this.ctx.helper.getResponseData(code);
  }

  private async setAppHomePage(appId: number | string, pageId: number | string) {
    await this.service.appCenter.apps.updateApp({
      id: appId,
      home_page: pageId
    });
    return true;
  }

  private async getAppHomePageId(appId: number): Promise<I_Response | number> {
    const appInfo = await this.service.appCenter.apps.getAppById(appId);

    // appHomePageId 存在为null的情况，即app没有设置首页
    const id = Number(appInfo.data.home_page || 0);
    if (isNaN(id)) {
      return this.service.appCenter.folderTree.getErrorRes(`无法获得id为${appId}的应用所配置的首页信息`);
    }
    return id;
  }

  private validateIsHome(param: I_UpdatePageParam, pageInfo: I_Response): boolean {
    const { isHome: isHomeOld, parentId: parentIdOld } = pageInfo.data;
    const { isHome, parentId } = param;
    // 当isHome 为 true ， 但是 parentId 大于0时 非法
    if (isHome === true && parentId > 0) {
      return false;
    }

    // 当isHome 为 true parentId 不存在  parentIdOld 大于0时 非法
    if (isHome === true && parentId === undefined && parentIdOld > 0) {
      return false;
    }

    // 当isHome 不存在 且 isHomeOld 为true时 将parentId 设为其他id 时非法
    if (isHome === undefined && isHomeOld === true && parentId > 0) {
      return false;
    }

    return true;
  }

  private async addIsHome(pageInfo: I_Response): Promise<I_Response> {
    const { data } = pageInfo;
    const isArray = Array.isArray(data);
    // 如果页面列表是空数组 直接返回
    if (isArray && data.length < 1) {
      return pageInfo;
    }
    const appId: number = isArray ? data[0].app : data.app;
    const appHomePageId = await this.getAppHomePageId(Number(appId));
    if (typeof appHomePageId !== 'number') {
      return appHomePageId;
    }
    if (isArray) {
      const collection: Array<any> = [];
      for (let i = 0; i < data.length; i++) {
        const page = data[i];
        // 调整一下group命名
        if (['static', 'public'].includes(page.group)) {
          page.group = `${page.group}Pages`;
        }
        if (Number(page.id) === Number(appHomePageId)) {
          page.isHome = true;
          // 对isHome进行排序 让首页排在最前面
          collection.unshift(page);
        } else {
          page.isHome = false;
          collection.push(page);
        }
      }
      pageInfo.data = collection;
    } else {
      data.isHome = Number(data.id) === Number(appHomePageId);
    }
    return pageInfo;
  }

  // 获取页面原始数据
  private getInitialPageById(id: number | string) {
    return this.query({
      url:`pages/${id}`
    });
  }

  // 将同步函数求值promise化
  protected getPromiseCode(fn, ...params) {
    return new Promise((resolve, reject) => {
      process.nextTick(() => {
        try {
          const result = fn(...params);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });
  }
}

export default Pages;
