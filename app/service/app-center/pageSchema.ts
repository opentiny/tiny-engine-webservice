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

class PageSchema extends SchemaService {
  public appId: number;
  public appInfo: any = null;
  // 获取页面的schema
  async getSchema(param: any): Promise<I_Response> {
    const paramType = typeof param;
    let pageInfo = param;
    let pageInfoData: I_Response = {
      data: pageInfo
    };
    // 如果传入的页面id，查询该页面信息
    if (['number', 'string'].includes(paramType)) {
      pageInfoData = await this.service.appCenter.pages.getPageById(param);
      if (pageInfoData.error) {
        return pageInfoData;
      }
      pageInfo = pageInfoData.data;
    }
    // 如果appInfo 为null， 获取一下
    const flag = await this.ensureAppInfo(pageInfo);
    if (flag.error) {
      return flag;
    }
    if (!pageInfo.isPage) {
      return this.getFolderSchema(pageInfo);
    }
    const schema = this.getSchemaBase(pageInfoData).data;
    // 从page_schema中获取基本字段
    schema.meta = this.getSchemaMeta(pageInfoData).data;
    return this.ctx.helper.getResponseData(schema);
  }

  // 获取当前应用信息下所有页面/文件夹的schema信息
  async getPagesSchema(appInfo: any): Promise<I_Response> {
    this.appId = Number(appInfo.id);
    this.appInfo = appInfo;
    const pageList = await this.service.appCenter.pages.getPagesByAppId(this.appId);
    if (pageList.error) {
      return pageList;
    }
    const pageSchemas: Array<any> = [];
    for (const pageInfo of pageList.data) {
      const pageSchema = await this.getSchema(pageInfo);
      if (pageSchema.error) {
        return pageSchema;
      }
      pageSchemas.push(pageSchema.data);
    }
    return this.ctx.helper.getResponseData(pageSchemas);
  }

  // 获取folder schema数据 
  getFolderSchema(param: any): I_Response {
    const schema: I_Response = this.assembleFields(
      {
        data: param
      },
      'folder'
    );
    schema.data.componentName = 'Folder';
    return schema;
  }

  // 通过传入页面信息数据 确保应用参数是否存在
  private async ensureAppInfo(pageInfo: any): Promise<any> {
    this.appId = this.appId || pageInfo.app;
    if (this.appInfo === null) {
      const appData = await this.service.appCenter.apps.getAppById(this.appId);
      if (appData.error) {
        return appData;
      }
      this.appInfo = appData.data;
    }
    return {};
  }

  // 获取页面元数据
  getSchemaMeta(pageData: I_Response): I_Response {
    return this.assembleFields(pageData, 'pageMeta');
  }

  // 提取page_schema
  getSchemaBase(pageData: I_Response): I_Response {
    const pageMate = JSON.parse(JSON.stringify(pageData.data));
    const pageContent = pageMate.page_content || {};
    pageContent.fileName = pageMate.name;
    return this.assembleFields(
      {
        data: pageContent
      },
      'pageContent'
    );
  }
}

export default PageSchema;
