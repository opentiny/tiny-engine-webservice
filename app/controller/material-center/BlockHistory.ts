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

export default class BlockHistoryController extends Controller {
  async find() {
    const queries = this.ctx.queries;
    this.ctx.body = await this.service.materialCenter.blockHistory.find(queries);
  }

  async create() {
    const payload = this.ctx.request.body;
    if (!payload?.block) {
      this.ctx.body = this.ctx.helper.getBadRequestResponse('block should be required');
      return;
    }
    this.ctx.body = await this.service.materialCenter.blockHistory.create(payload);
  }
  
  async delete() {
    const { id } = this.ctx.params;
    const { isIntegerId } = this.ctx.helper;
    if (!isIntegerId(id)) {
      this.ctx.body = this.ctx.helper.getBadRequestResponse('id should be integer');
      return;
    }
    this.ctx.body = await this.service.materialCenter.blockHistory.delete(id);
  }
}
