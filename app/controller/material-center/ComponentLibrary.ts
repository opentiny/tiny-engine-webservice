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
import { I_CreateComponentLibrary } from '../../lib/interface';

export default class ComponentController extends Controller {

  /**
   * @summary 注册组件库
   * @router POST /api/componentLibrary/create
   */
  async create(){
    const data: I_CreateComponentLibrary = this.ctx.request.body;
    this.ctx.body = await this.service.materialCenter.componentLibrary.create(data);
  }

  /**
   * @summary 查询组件库
   * @router GET
   */
  async find(){
    this.ctx.body = await this.service.materialCenter.componentLibrary.find(this.ctx.query);
  }

  /**
   * @summary 更新组件库
   * @router PUT
   */
  async update(){
    const { id } = this.ctx.params;
    const params = this.ctx.request.body;
    this.ctx.body = await this.service.materialCenter.componentLibrary.update({id, ...params });
  }


   /**
   * @summary 删除组件库
   * @router DELETE
   */
  async delete(){
    const { id } = this.ctx.params;
    this.ctx.body = await this.service.materialCenter.componentLibrary.delete({ id });
  }

}
