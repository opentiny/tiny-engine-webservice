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

export default class UserComponentController extends Controller {

  /**
   * @summary 创建组件库
   * @router POST /component/bundle/create
   */
  async bundleCreate(){
    const ctx = this.ctx;
    try {
      const fileStream = await ctx.getFileStream();
      this.ctx.body = await this.ctx.service.materialCenter.userComponents.bundleCreate(fileStream);
    } catch (error) {
      ctx.logger.error('[UserComponentController] bundleCreate error:', error);
    };
  }
  
}
