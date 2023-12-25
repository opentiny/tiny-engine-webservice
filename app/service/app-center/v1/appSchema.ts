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
import AppSchema from '../appSchema';

export default class AppSchemaV1 extends AppSchema {
  // 获取schema数据
  async getSchema(appId: number) {
    this.appId = Number(appId);
    let schema = await this.getSchemaById();
    return this.ctx.helper.getResponseData(schema);
  }

  // 获取 dataSource
  protected getSchemaDataSource() {
    const { source, app } = this.meta;
    return this.ctx.helper.getResponseData({
      list: source,
      ...app.data_source_global
    });
  }
}
