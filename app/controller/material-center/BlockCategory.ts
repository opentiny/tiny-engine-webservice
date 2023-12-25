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
import { createRule, updateRule } from '../../validate/material-center/blockCategory';
import { ApiError } from '../../lib/ApiError';
import { E_ErrorCode } from '../../lib/enum';
export default class BlockCategoryController extends Controller {
  async list() {
    const { appId } = this.ctx.query;
    this.ctx.validate({ appId: 'id' }, { appId });
    this.ctx.body = await this.service.materialCenter.blockCategory.list({ app: appId });
  }

  async create() {
    const { body } = this.ctx.request;
    this.ctx.validate(createRule, body);
    const queries = this.ctx.helper.pickObject(body, [
      'app',
      'name',
      'category_id',
    ]);
    const resp = await this.service.materialCenter.blockCategory.tinyFind(queries);
    if (resp.data.length === 0) {
      this.ctx.body = await this.service.materialCenter.blockCategory.create(body);
    } else {
        throw (new ApiError('', E_ErrorCode.BadRequest, E_ErrorCode.CM003));
    }
  }

  async update() {
    const { request: { body }, params: { id } } = this.ctx;
    this.ctx.validate({ id: 'id' }, { id });
    this.ctx.validate(updateRule, body);
    this.ctx.body = await this.service.materialCenter.blockCategory.update(id, body);
  }

  async delete() {
    const { id } = this.ctx.params;
    this.ctx.validate({ id: 'id' }, { id });
    this.ctx.body = await this.service.materialCenter.blockCategory.delete(id);
  }
}