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
/**
 * @Controller Ecology 生态
 */
class OrgController extends Controller {
  /**
   * @Summary 获取组织列表
   * @Router GET /api/org/list
   */
  async orgs() {
    const { query } = this.ctx.request;
    this.ctx.body = await this.service.platformCenter.org.find(query);
  }

  /**
   * @Summary 获取分页的组织列表
   * @Router GET /api/org/list2
   */
  async list() {
    const { query } = this.ctx.request;
    this.ctx.body = await this.service.platformCenter.org.list(query);
  }

  /**
   * @Summary 获取组织详情
   * @Router GET /api/org
   */
  async org() {
    const { query } = this.ctx.request;
    this.ctx.body = await this.service.platformCenter.org.findOne(query);
  }

  /**
   * @Summary 删除一个组织
   * @Router GET /api/org/delete
   */
  async delete() {
    const { id } = this.ctx.request.query;
    this.ctx.validate({ id: 'id'}, { id });
    this.ctx.body = await this.service.platformCenter.org.del(id);
  }

  /**
   * @Summary 更新组织
   * @Router POST /api/org/update
   */
  async update() {
    const { body } = this.ctx.request;
    this.ctx.validate({ id: 'id' }, { id: body.id});
    this.ctx.body = await this.service.platformCenter.org.update(body);
  }

  /**
   * @Summary 创建组织
   * @Router post /api/org/create
   */
  async create() {
    const { body } = this.ctx.request;
    this.ctx.validate({ tenant_id: 'string' }, { tenant_id: body.tenant_id });
    this.ctx.body = await this.service.platformCenter.org.create(body);
  }
}

export default OrgController;
