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
import { createBlockGroupRule, updateBlockGroupRule } from '../../validate/material-center/blockGroup';

export default class BlockGroupController extends Controller {
  async find() {
    const queries = this.ctx.queries;
    this.ctx.body = await this.service.materialCenter.blockGroup.find(queries);
  }
  async create() {
    this.ctx.validate(createBlockGroupRule);
    const payload = this.ctx.helper.pickObject(this.ctx.request.body, ['app', 'name', 'desc']);
    this.ctx.body = await this.service.materialCenter.blockGroup.create(payload);
  }
  async update() {
    const { id } = this.ctx.params;
    const { body } = this.ctx.request;
    this.ctx.validate(updateBlockGroupRule, { id, ...body });
    const payload = this.ctx.helper.pickObject(body, ['app', 'name', 'desc', 'blocks']);
    this.ctx.body = await this.service.materialCenter.blockGroup.update({ ...payload, id });
  }
  async delete() {
    const { id } = this.ctx.params;
    const { isIntegerId } = this.ctx.helper;
    if (!isIntegerId(id)) {
      this.ctx.body = this.ctx.helper.getBadRequestResponse('id should be integer');
      return;
    }
    this.ctx.body = await this.service.materialCenter.blockGroup.delete(id);
  }
}
