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

export default class userComponentController extends Controller {

  /**
   * @summary 注册组件库
   * @router POST /api/componentLibrary/create
   */
  async bundleCreate(){
    const ctx = this.ctx;
    const fileStream = await ctx.getFileStream();
    this.ctx.body = await this.ctx.service.materialCenter.userComponents.bundleCreate(fileStream);
  }
  
}
