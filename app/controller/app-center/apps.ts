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
import { I_Response } from '../../lib/interface';
import { E_CanvasEditorState, E_ErrorCode,  } from '../../lib/enum';
import { publishAppRule, updateAppRule } from '../../validate/app-center/app';

const i18nRule = {
  id: {
    type: 'id',
    required: true,
  }
};
/**
 * @controller AppsController
 */
class AppsController extends Controller {

  /**
   * @router get /api/apps/detail/:id  路径
   * @summary 应用信息
   * @description 获取应用信息
   */
  async detail() {
    const { id } = this.ctx.params;
    this.ctx.validate({ id: 'id' }, { id });
    const { apps } = this.ctx.service.appCenter;
    this.ctx.body = await apps.getAppById(id);
  }

  /**
   * @router get /api/apps/update/:id  路径
   * @summary 应用修改
   * @description 修改应用
   */
  async update() {
    const { id } = this.ctx.params;
    const { body } = this.ctx.request;
    const updateParam = this.ctx.helper.pickObject({ id, ...body }, [
      'platform',
      'obs_url',
      'created_at',
      'updated_at',
      'createdBy',
      'updatedBy',
      'tenant',
      'platform_history',
      'framework',
      'data_hash'
    ], false)
    const { apps } = this.ctx.service.appCenter;
    this.ctx.validate(updateAppRule, updateParam);
    this.ctx.body = await apps.updateApp(updateParam);
  }


  /**
   * @router get  /api/apps/i18n/:id  路径
   * @summary 应用的国际化词条信息
   * @description 应用的国际化词条信息
   */
  async i18n() {
    const { id } = this.ctx.params;
    this.ctx.validate(i18nRule, { id });
    const { apps } = this.ctx.service.appCenter;
    this.ctx.body = await apps.getI18n(id);
  }

  // 修改应用国际化语种关联
  async updateI18n() {
    const { id } = this.ctx.params;
    const { body } = this.ctx.request;
    this.ctx.validate(
      {
        id: 'id',
        i18n_langs: {
          type: 'array',
          itemType: 'number',
        }
      },
      { id, ...body }
    );
    const { apps } = this.ctx.service.appCenter;
    this.ctx.body = await apps.updateI18n(id, body.i18n_langs);
  }
  /**
   * @router get  /api/apps/schema/:id  路径
   * @summary 应用的schema
   * @description 应用的schema
   */
  async schema() {
    const { id } = this.ctx.params;
    this.ctx.validate({ id: 'id' }, { id });
    const { appSchema } = this.ctx.service.appCenter;
    this.ctx.body = await appSchema.getSchema(id);
  }

  /**
   * @router get  /api/apps/relations/:id  路径
   * @summary 获取app关联的原始数据
   * @description app关联数据（生成schema的原始数据）
   */
  async relations() {
    const { id } = this.ctx.params;
    this.ctx.validate({ id: 'id' }, { id });
    const { appSchema } = this.ctx.service.appCenter;
    this.ctx.body = await appSchema.getAppRelations(id, this.ctx.request.queries);
  }


  /**
   * @router get  /api/apps/schema/components/:id
   * @summary vscode 特供 只查询componetsMap 数据片段
   */
  async schemaFragment() {
    const { id } = this.ctx.params;
    this.ctx.validate({ id: 'id' }, { id });
    const { appSchema } = this.ctx.service.appCenter;
    this.ctx.body = await appSchema.getSchemaFragment(id);
  }
  

  /**
   * @router get  /api/apps/extension/list
   * @summary 获取应用的桥接源或工具类列表
   * @description 获取应用的桥接源或工具类列表
   */

  async getExtensions() {
    const { query } = this.ctx.request;
    // 参数校验 app 必传
    this.ctx.validate(
      {
        app: { type: 'id' },
      },
      query
    );
    this.ctx.body = await this.service.appCenter.appExtensions.find(query);
  }

  /**
   * @router get  /api/apps/extension
   * @summary 获取单个应用的桥接源或工具类列表
   * @description 获取单个应用的桥接源或工具类列表
   */
  async getExtension() {
    const { query } = this.ctx.request;
    // 参数校验 app category name必传
    this.ctx.validate(
      {
        app: { type: 'id' },
        name: { type: 'string' },
        category: { type: 'string' },
      },
      query
    );
    this.ctx.body = await this.service.appCenter.appExtensions.findOne(query);
  }

  /**
   * @router get  /api/apps/extensions/delete2
   * @summary 删除桥接或工具
   * @description 可单个删除也可批量删除，谨慎使用（暂无使用，暂时保留）
   */
  async delExtensions() {
    const { query } = this.ctx.request;
    // 参数校验 app 必传
    this.ctx.validate(
      {
        app: { type: 'id' },
      },
      query
    );
    this.ctx.body = await this.service.appCenter.appExtensions.del(query);
  }

  /**
   * @router get  /api/apps/extensions/delete
   * @summary 删除单个桥接或工具
   * @description 只能通过传递id删除
   */
  async delExtensionsById() {
    const { query } = this.ctx.request;
    // 参数校验 app 必传
    this.ctx.validate(
      {
        id: 'id',
      },
      query
    );
    this.ctx.body = await this.service.appCenter.appExtensions.delete(query.id);
  }


  /**
   * @router post  /api/apps/extension/update
   * @summary 修改桥接或工具
   * @description id 和 uk（app+name+category+type） 必传其一
   */
  async updateExtension() {
    const { body } = this.ctx.request;
    if (!/^[0-9]+$/.test(body.id)) {
      this.ctx.validate(
        {
          app: { type: 'id' },
          name: { type: 'string' },
          category: { type: 'string' },
        },
        body
      );
    }

    this.ctx.body = await this.service.appCenter.appExtensions.update(body);
  }

  /**
   * @router post  /api/apps/extension/create
   * @summary 新建桥接或工具
   * @description app name type content category 必传
   */
  async createExtension() {
    const { body } = this.ctx.request;
    // 参数校验  app name type content category 必传
    this.ctx.validate(
      {
        type: { type: 'string' },
        app: { type: 'id' },
        name: { type: 'string' },
        category: { type: 'string' },
        content: { type: "object", rule: {} },
      },
      body
    );
    this.ctx.body = await this.service.appCenter.appExtensions.create(body);
  }

  // 画布锁
  async lock() {
    const { query } = this.ctx.request;
    const states = [E_CanvasEditorState.Occupy, E_CanvasEditorState.Release];
    // 缺省参数设置
    query.type = query.type || 'page';
    if (!states.includes(query.state as E_CanvasEditorState)) {
      this.ctx.body = this.getMissingParamsRes(`The 'state' field can only take a value of [${states}]`);
    } else {
      this.ctx.body = await this.service.appCenter.apps.lockCanvas(query);
    }
  }

  /**
   * @router get  /api/apps/preview/:id  路径
   * @summary 应用预览
   * @description 根据模板生成应用代码，并且构建前端代码生成静态资源上传到obs
   */

  async preview() {
    const { id } = this.ctx.params;
    this.ctx.validate({ id: 'id' }, { id });
    this.ctx.body = await this.service.appCenter.preview.start(id);
  }

  /**
   * @router get  /api/apps/publish/:id  路径
   * @summary 应用发布
   * @description 根据模板生成应用代码，并且构建前端代码生成静态资源上传到git库
   */

  async publish() {
    const { body } = this.ctx.request;
    const { id } = this.ctx.params;
    const publishParam = this.ctx.helper.pickObject(
      { id, ...body },
      ['id', 'commitMsg', 'branch', 'canCreateNewBranch', 'allGenerate']
    );
    this.ctx.validate(publishAppRule, publishParam);
    this.ctx.body = await this.service.appCenter.publish.start(publishParam);
  }
  /**
   * @router get  /api/apps/download/:id  路径
   * @summary 应用下载
   * @description 根据模板生成应用代码，上传obs, 返回下载地址
   */

  async publishDown() {
    const { id } = this.ctx.params;
    this.ctx.validate({ id: 'id' }, { id });
    const appCodeUrl = await this.service.appCenter.preview.generateAndUpload(id);
    this.ctx.body = this.ctx.helper.getResponseData(appCodeUrl);
  }

  async associate() {
    this.ctx.body = await this.service.appCenter.apps.associate(this.ctx.queries);
  }

  private getMissingParamsRes(message: string): I_Response {
    const error = {
      code: E_ErrorCode.BadRequest,
      message
    };
    return this.ctx.helper.getResponseData(null, error);
  }
}

export default AppsController;
