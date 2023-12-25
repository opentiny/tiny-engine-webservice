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
import { I_Response } from '../../lib/interface';
import SchemaService from './schema';

class AppSchema extends SchemaService {
  public appId: number;
  public meta: any = {};
  private exposedFields = ['config', 'constants', 'css'];
  // 将数据转换位固定格式
  private execMap = new Map([
    ['meta', this.getSchemaMeta],
    ['dataSource', this.getSchemaDataSource],
    ['i18n', this.getSchemaI18n],
    ['componentsTree', this.getSchemaComponentsTree],
    ['componentsMap', this.getSchemaComponentsMap]
  ]);

  // 获取schema数据
  async getSchema(appId: string | number): Promise<I_Response> {
    this.appId = Number(appId);
    const schema = await this.getSchemaById();
    return this.ctx.helper.getResponseData(schema);
  }

  // 获取app关联数据
  async getAppRelations(appId: string | number, query?): Promise<I_Response> {
    this.appId = Number(appId);
    const metaData = await this.setMeta(query);
    return this.ctx.helper.getResponseData(metaData.data);
  }

  // 获取schema片段-vscode 专用
  async getSchemaFragment(appId: string | number): Promise<I_Response> {
    this.appId = Number(appId);
    await this.setMeta();
    return this.getSchemaComponentsMap(true);
  }

  // 获取当前应用的schema
  protected async getSchemaById() {
    const schema: any = {};
    // 获取组装schema 的全部元数据
    await this.setMeta();
  
    // 设置复杂属性
    for (const [key, func] of this.execMap) {
      const res: I_Response = func.bind(this)();
      if (res.error) {
        return res;
      }
      schema[key] = res.data;
    }

    // 单独处理混合了bridge和utils的extensions
    const extensions = this.getSchemaExtensions();
    schema.bridge = extensions.data.bridge;
    schema.utils = extensions.data.utils;

    // 拷贝属性
    this.exposedFields.forEach((field) => {
      schema[field] = this.meta.app[field] || '';
    });

    schema.version = '';

    return schema;
  }

  // 获取应用信息
  private async setMeta(query?): Promise<I_Response> {
    const metaData: I_Response = await this.service.appCenter.apps.schemaMeta(this.appId, query);
    this.meta = metaData.data;
    return metaData;
  }

  // 获取元数据
  private getSchemaMeta(): I_Response {
    const appData = this.meta.app;
    // config属性当前为mock数据
    appData.config = {
      sdkVersion: '1.0.3',
      historyMode: 'hash',
      targetRootID: 'app'
    };
    const param = this.ctx.helper.getResponseData(appData);
    return this.assembleFields(param);
  }
  // 获取国际化
  private getSchemaI18n(): I_Response {
    const { apps } = this.service.appCenter;
    const { blockHistories = [], i18n} = this.meta;
    let blockEntries: any = null;
    // 提取区块构建产物中的国际化词条
    (blockHistories as Array<any>).forEach(item => {
      blockEntries = apps.mergeEntries(item.i18n, blockEntries);
    });


    // 序列化国际化词条
    const appEntries = this.formatI18nEntries(i18n);
    // 合并应用 区块词条
    const entries = apps.mergeEntries(appEntries, blockEntries);
    return this.ctx.helper.getResponseData(entries);
  }

  // 获取componentsMap
  private getSchemaComponentsMap(isVscode = false): I_Response {
    const {materialHistory:materialHistoryInfo, blockHistories = [] } = this.meta;
    const { components, id, name, framework, material, tenant } = materialHistoryInfo;

    // 转换区块数据为schema

    const blocksSchema = this.getBlockSchema(blockHistories);

    // 转换组件数据为schema
    const componentsSchema = this.getComponentSchema(components || []);
    const componentsMap = componentsSchema.concat(blocksSchema);
    if (isVscode) {
      return this.ctx.helper.getResponseData({
        materialHistory: {
          id,
          name,
          framework,
          material,
          tenant
        },
        componentsMap
      });
    }
    return this.ctx.helper.getResponseData(componentsMap);
  }

  // 获取componentsTree
  private getSchemaComponentsTree(): I_Response {
    const { pageSchema, pages } = this.service.appCenter;
    const { pages: pageList, app } = this.meta;
    const pageSchemas: Array<any> = [];
    for (let pageInfo of pageList) {
      pageInfo = pages.formatDataFields(pageInfo, pages.resKeys);
      pageInfo.isHome = pageInfo.id.toString() === app.home_page;
      const pageInfoData = this.ctx.helper.getResponseData(pageInfo);
      let schema;
      if (!pageInfo.isPage) {
        schema = pageSchema.getFolderSchema(pageInfo).data;
      } else {
        schema = pageSchema.getSchemaBase(pageInfoData).data;
        // 从page_schema中获取基本字段
        schema.meta = pageSchema.getSchemaMeta(pageInfoData).data;
      }
      pageSchemas.push(schema);
    }
    return this.ctx.helper.getResponseData(pageSchemas);
  }

  // 获取dataSource 改变数据源中的数据展示方式
  protected getSchemaDataSource(): I_Response {
    const { source, app } = this.meta;
    return this.ctx.helper.getResponseData({
      list: source,
      dataHandler: app.data_handler
    });
  }

  // 获取app的bridge 和 utils
  private getSchemaExtensions(): I_Response {
    const { extension } = this.meta;
    const list: Array<any> = extension;
    const bridge: Array<any> = [];
    const utils: Array<any> = [];
    list.forEach((item) => {
      const { name, type, content, category } = item;
      const data = { name, type, content };
      if (category === 'bridge') {
        bridge.push(data);
      } else {
        utils.push(data);
      }
    });
    return this.ctx.helper.getResponseData({
      bridge,
      utils
    });
  }

  // 转换组件schema数据
  getComponentSchema(components: Array<any>): Array<any> {
    return components.map((component) => {
      const {
        component: componentName,
        npm: { package: packageName, exportName, version, destructuring }
      } = component;
      return {
        componentName,
        package: packageName,
        exportName,
        destructuring,
        version
      };
    });
  }

  // 将区块组装成schema数据
  getBlockSchema(blockHistories: Array<any>): Array<any> {
    return blockHistories.map((blockHistory) => {
      const { path, version } = blockHistory;
      // 每个区块历史记录必有content
      const { fileName: componentName, dependencies } = blockHistory.content;
      return {
        componentName,
        dependencies,
        main: path ?? '',
        destructuring: false,
        version: version || 'N/A'
      };
    });
  }

  // 序列化国际化词条
  private formatI18nEntries( entries: Array<any> ): any {
    const i18n = {};
    entries.forEach(entry => {
      const {lang:langObj, key, content} = entry;
      i18n[langObj.lang] = i18n[langObj.lang] || {};
      i18n[langObj.lang][key] = content;
    });
    return i18n;
  }
}

export default AppSchema;
