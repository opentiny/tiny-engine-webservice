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
import { Controller } from 'egg';
import { E_Schema2CodeType } from '../../lib/enum';
import {
  dslCodeRule,
  schema2codeRule,
  createPageRule,
  createFolderRule,
  updatePageRule,
  updateFolderRule
} from '../../validate/app-center/pages';
/**
 * @controller PagesController
 */
class PagesController extends Controller {
  /**
   * @router get /api/pages/list/:aid  路径
   * @summary 页面列表
   * @description 通过应用id获取该平台下的全部页面列表(瘦身版本)
   */
  async pageList() {
    const { aid } = this.ctx.params;
    const { pages } = this.ctx.service.appCenter;
    this.ctx.validate({ id: 'id' }, { id: aid });
    this.ctx.body = await pages.getPagesByAppId(aid);
  }

  /**
   * @router get /api/pages/detail/:id  路径
   * @summary 页面信息
   * @description 获取页面/文件夹信息
   */
  async detail() {
    const { id } = this.ctx.params;
    const { pages } = this.ctx.service.appCenter;
    this.ctx.validate({ id: 'id' }, { id });
    this.ctx.body = await pages.getPageById(id);
  }

  /**
   * @router get /api/pages/delete/:id  路径
   * @summary 删除页面
   * @description 删除该id页面信息
   */
  async del() {
    const { id } = this.ctx.params;
    const { pages } = this.ctx.service.appCenter;
    this.ctx.validate({ id: 'id' }, { id });
    this.ctx.body = await pages.delPage(id);
  }

  /**
   * @router post /api/pages/create  路径
   * @summary 创建页面 或者 文件夹
   * @description 创建一个新的页面 或者文件夹
   */
  async create() {
    let { body } = this.ctx.request;
    const { isPage } = body;
    const { pages, folders } = this.ctx.service.appCenter;
    if (isPage) {
      // 创建页面
      const createPageParam = this.ctx.helper.pickObject(
        body,
        [
          'app',
          'group',
          'isBody',
          'isHome',
          'isPage',
          'message',
          'name',
          'parentId',
          'route',
          'page_content'
        ]
      );
      this.ctx.validate(createPageRule, createPageParam);
      this.ctx.body = await pages.createPage(createPageParam);
    } else {
      // 创建文件夹
      const createFolderParam = this.ctx.helper.pickObject(
        body,
        [
          'app',
          'name',
          'parentId',
          'route',
          'isPage'
        ]
      );
      this.ctx.validate(createFolderRule, createFolderParam);
      this.ctx.body = await folders.create(createFolderParam);
    }
  }

  /**
   * @router post /api/pages/update/:id  路径
   * @summary 修改页面 或 文件夹
   * @description 修改一个页面 或 文件夹
   * @request path integer id 页面id
   */
  async update() {
    const { id } = this.ctx.params;
    const { body } = this.ctx.request;
    const { pages, folders } = this.ctx.service.appCenter;
    this.ctx.validate({ id: 'id' }, { id });
    const { data: pageInfo } = await pages.getPageById(id);
    if (pageInfo.isPage) {
      // 更新页面
      const updatePageParam = this.ctx.helper.pickObject(
        { id, ...body },
        ['id', 'isBody', 'isHome', 'message', 'name', 'parentId', 'route', 'page_content', 'isDefault']
      );
      this.ctx.validate(updatePageRule, updatePageParam);
      this.ctx.body = await pages.updatePage(updatePageParam);
    } else {
      // 更新文件夹
      const updateFolderParam = this.ctx.helper.pickObject(
        { id, ...body },
        ['id', 'name', 'parentId', 'route']
      );
      this.ctx.validate(updateFolderRule, updateFolderParam);
      this.ctx.body = await folders.update(updateFolderParam);
    }
  }

  /**
   * @router GET /api/pages/code/:id
   * @summary 获取页面angular代码，vscode插件专用
   */
  async code() {
    const { id } = this.ctx.params;
    this.ctx.validate({ id: 'id' }, { id });
    this.ctx.body = await this.ctx.service.appCenter.pages.getGeneratorNgCode(id);
  }


  /**
   * @router GET /api/code
   * @summary 获取页面或者区块的代码
   */
  async dslCode() {
    const { type, id, history, app } = this.ctx.query;
    const { appCenter } = this.ctx.service;
    this.ctx.validate(dslCodeRule, this.ctx.query);
    this.ctx.body = await appCenter.pages.getOutcome({
      type: (type as E_Schema2CodeType),
      id,
      app,
      history
    });
  }

  /**
   * @router GET /api/schema2code
   * @summary 获取页面代码
   */
  async schema2code() {
    this.ctx.validate(schema2codeRule, this.ctx.request.body);
    const { app, pageInfo } = this.ctx.request.body;
    const { appCenter } = this.ctx.service;
    this.ctx.body = await appCenter.pages.schema2code(app, pageInfo);
  }

  /**
   * @router GET /api/preview/metadata
   * @summary 获取预览元数据
   */
  async previewData() {
    const { type, id, app } = this.ctx.query;
    this.ctx.body = await this.service.appCenter.pages.getPreviewMetaData((type as E_Schema2CodeType), id, app);
  }
}

export default PagesController;
