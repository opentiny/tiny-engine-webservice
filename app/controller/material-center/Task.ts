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
import { E_TASK_TYPE } from '../../lib/enum';
import { I_TaskRecordInfo, I_UpdatePageParam } from '../../lib/interface';

export default class TaskController extends Controller {
  /* istanbul ignore next */
  async list() {
    this.ctx.body = await this.service.task.list();
  }
  /* istanbul ignore next */
  async find() {
    this.ctx.body = await this.service.task.find(this.ctx.query);
  }
  async findById() {
    const { id } = this.ctx.params;
    this.ctx.body = await this.service.task.findById(id);
  }
  async status() {
    // 使用 queries 上下文支持批量查询。若未指定 taskTypeId，则默认查询物料打包任务状态
    const { taskTypeId } = this.ctx.queries;
    const query = taskTypeId ? this.ctx.queries : { ...this.ctx.queries, taskTypeId: E_TASK_TYPE.ASSETS_BUILD };
    const res = await this.service.task.status(query);

    if (res.error) {
      this.ctx.body = res;
    } else {
      const tasks = res.data;
      // 调用方约定，只有一个元素时，直接以对象的格式返回该元素
      this.ctx.body = tasks.length === 1 ? { data: tasks[0] } : res;
    }
  }
  /* istanbul ignore next */
  async create() {
    const data: I_TaskRecordInfo = this.ctx.request.body;
    this.ctx.body = await this.service.task.create(data);
  }
  /* istanbul ignore next */
  async update() {
    const { id } = this.ctx.params;
    const params: I_UpdatePageParam = this.ctx.request.body;
    this.ctx.body = await this.service.task.update({ ...params, id });
  }
  /* istanbul ignore next */
  async delete() {
    const { id } = this.ctx.params;
    this.ctx.body = await this.service.task.delete({ id });
  }
}
