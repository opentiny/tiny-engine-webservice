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
import { E_ErrorCode } from '../../lib/enum';

const numberReg = /^[0-9]+$/;
/**
 * @controller SourcesController
 */
class SourcesController extends Controller {
  /**
   * @router get /api/sources/list/:aid  路径
   * @summary dataSources列表
   * @description 通过应用id获取该应用下的全部应用
   */
  async list() {
    const { aid } = this.ctx.params;
    const { sources } = this.ctx.service.appCenter;

    let res: I_Response;
    if (numberReg.test(aid)) {
      res = await sources.getSourcesByAppId(aid);
    } else {
      res = this.getMissingParamsRes('app id is integer');
    }
    this.ctx.body = res;
  }

  /**
   * @router get /api/sources/detail/:id  路径
   * @summary dataSources信息
   * @description 获取dataSources信息
   */
  async detail() {
    const { id } = this.ctx.params;
    const { sources } = this.ctx.service.appCenter;

    if (numberReg.test(id)) {
      this.ctx.body = await sources.getSourcesById(id);
    } else {
      this.ctx.body = this.getMissingParamsRes('sources id is integer');
    }
  }

  /**
   * @router get /api/sources/delete/:id  路径
   * @summary 删除dataSources
   * @description 删除该id dataSources信息
   */
  async del() {
    const { id } = this.ctx.params;
    const { sources } = this.ctx.service.appCenter;

    if (numberReg.test(id)) {
      this.ctx.body = await sources.delSources(id);
    } else {
      this.ctx.body = this.getMissingParamsRes('sources id is integer');
    }
  }

  /**
   * @router post /api/sources/create  路径
   * @summary 创建dataSources
   * @description 创建一个新的dataSources
   */
  async create() {
    const { body } = this.ctx.request;
    const { sources } = this.ctx.service.appCenter;
    const { name, app } = body;

    if (app !== undefined && numberReg.test(app) && name) {
      this.ctx.body = await sources.createSources(body);
    } else {
      this.ctx.body = this.getMissingParamsRes('The request body is missing some parameters');
    }
  }

  /**
   * @router post /api/sources/update/:id  路径
   * @summary 修改dataSources
   * @description 修改dataSources
   * @request path integer id dataSources id
   */
  async update() {
    const { id } = this.ctx.params;
    const { body } = this.ctx.request;
    const { sources } = this.ctx.service.appCenter;

    let res: I_Response;
    if (!numberReg.test(id)) {
      res = this.getMissingParamsRes('sources id is integer');
    } else {
      body.id = id;
      res = await sources.updateSources(body);
    }
    this.ctx.body = res;
  }

  private getMissingParamsRes(message: string): I_Response {
    const error = {
      code: E_ErrorCode.BadRequest,
      message
    };
    return this.ctx.helper.getResponseData(null, error);
  }
}

export default SourcesController;
