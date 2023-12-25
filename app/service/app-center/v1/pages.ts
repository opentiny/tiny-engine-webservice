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
import { throwApiError } from '../../../lib/ApiError';
import { E_AppErrorCode, E_Framework, E_Schema2CodeType, E_TYPES } from '../../../lib/enum';
import { I_GetOutcomeParam, I_Response, I_TranslateSchemaParam } from '../../../lib/interface';
import Pages from '../pages';
import { StatusCodes } from 'http-status-codes';

export default class PagesV1 extends Pages {
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
      appId,
      hostId: id
    });
  }

  /**
   * v1版本 通过dsl 将参数传入的页面/区块schema数据生成对应代码
   * @param { string|number } appId 应用id
   * @param { any } pageInfo 页面内容数据
   * @param { E_Schema2CodeType } type 处理数据类型， 默认 Page
   * @return { Promise<I_Response> } dsl函数返回数据
  */
  schema2code(appId: string | number, pageInfo: any, type: E_Schema2CodeType = E_Schema2CodeType.PAGE): Promise<any> {
    const { schema, name, id } = pageInfo;
    return this.translateSchema({
      schema,
      name,
      type,
      appId,
      hostId: id
    });
  }

  /**
   * 通过dsl 将页面/区块schema数据生成对应代码
   * @param { I_TranslateSchemaParam } params
   * @return {Promise<I_Response>} dsl函数返回数据
   */
  protected async translateSchema(params: I_TranslateSchemaParam): Promise<I_Response> {
    const { appCenter } = this.service;
    const { schema, name, type = E_Schema2CodeType.PAGE, appId, framework: customFramework, hostId = 0 } = params;
    // 页面/区块 预览只需将页面、区块路径和区块构建产物路径统一设置为 ./components 即可
    const defaultMain = './components';
    // 1. 从应用拿组件数据暂时不改，本次更改为 区块精细化筛选
    const { components = [], framework: materialFramework } = await this.getDslParamByAppId(appId, ['materialHistory']);
    // 2. 从数据中心/pages/blockhistories/:id 接口拿区块构建产物数据
    const blockHistoriesRes: I_Response = await this.getAllBlockHistories(hostId, type);
    // 3. 格式化数据
    let componentsMap: Array<any> = appCenter.appSchema.getComponentSchema(components);
    componentsMap = componentsMap.concat(appCenter.appSchema.getBlockSchema(blockHistoriesRes.data));
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
    // 4. 执行出码
    const framework = customFramework ?? materialFramework ?? E_Framework.Vue;
    const gpkg = this.app.config.dsl[E_TYPES[framework]];
    const { generateCode } = require(gpkg.dslPkgCore);
    const code = await this.getPromiseCode(generateCode, {
      pageInfo: { schema, name },
      blocksData: blockHistoriesRes.data,
      componentsMap
    }).catch((e) => {
      this.logger.error('generateCode failed to execute：', e);
      throwApiError('', StatusCodes.BAD_REQUEST, E_AppErrorCode.CM313);
    });
    return this.ctx.helper.getResponseData(code);
  }

  /**
   * 通过appId 获取dsl需要的参数，并能够通过part参数进行数据筛选
   * @param { string|number } appId 应用id
   * @param {Array<string>} part 获取的具体字段
   * @return {any} 返回对应参数
   */
  protected async getDslParamByAppId(
    appId: string | number,
    part: Array<string> = ['blockHistories', 'materialHistory']
  ) {
    const { appCenter } = this.service;
    // 获取应用下的物料资产包
    const appMetaData: I_Response = await appCenter.apps.schemaMeta(appId, {
      part
    });

    const { materialHistory = {} } = appMetaData.data;
    const { framework = null, components = null } = materialHistory;
    return {
      framework,
      components,
      ...appMetaData.data
    };
  }
}
