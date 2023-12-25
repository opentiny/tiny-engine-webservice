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
import * as qs from 'qs';
import DataService from './dataService';
import { E_ErrorCode, E_Method, E_TaskStatus, E_TaskType, E_TASK_TYPE } from '../lib/enum';
import { I_Response } from '../lib/interface';

export default class Task extends DataService {
  async getUnfinishedTask(type, id): Promise<I_Response | null> {
    const res = await this.find({ taskTypeId: type, uniqueId: id, _sort: 'id:DESC', _limit: 1 });
    if (res.data.length > 0 && [0, 1].includes(res.data[0].taskStatus)) {
      return this.ctx.helper.getResponseData(res.data[0]);
    }
    return null;
  }

  // 获取最新一次构建成功的记录
  async getLatestTask(type: E_TASK_TYPE, uniqueId: string | number): Promise<I_Response> {
    const res: I_Response = await this.find({
      taskTypeId: type,
      uniqueId,
      _sort: 'id:DESC',
      _limit: 1,
      progress_percent: 100
    });
    const data = res.data[0] || null;
    return this.ctx.helper.getResponseData(data);
  }

  async list() {
    return this.query({
      url: 'tasks'
    });
  }
  
  async find(param) {
    const query = qs.stringify(param);
    return this.query({
      url: `tasks?${query}`
    });
  }

  async findById(id) {
    return this.query({
      url: `tasks/${id}`
    });
  }

  async status(param) {
    const query = qs.stringify(param);
    return this.query({
      url: `tasks/status?${query}`
    });
  }

  async create(param1, params2 = {}) {
    // vscode 默认只传uniqueId
    const payload = typeof param1 !== 'number' 
      ? param1
      : {
        taskTypeId: E_TaskType.VSCODE_PLUGIN_BUILD,
        taskName: '',
        taskStatus: E_TaskStatus.init,
        uniqueId: param1,
        ...params2
      };

      return this.query({
      url: 'tasks',
      method: E_Method.Post,
      data: payload
    });
  }

  async update(param) {
    const { id } = param;
    return this.query({
      url: `tasks/${id}`,
      method: E_Method.Put,
      data: param
    });
  }

  async delete({ id }) {
    return this.query({
      url: `tasks/${id}`,
      method: E_Method.Delete
    });
  }

  async queryTask(uniqueIds: string[] = []) {
    if (uniqueIds.length === 0) {
      return this.ctx.helper.getResponseData(null, { message: 'bad request', code: E_ErrorCode.Fail });
    }
    const isSingle = uniqueIds.length === 1;
    // 查询多个平台任务记录
    const condition = uniqueIds.map((id) => [{ uniqueId: id }, { taskTypeId: E_TaskType.VSCODE_PLUGIN_BUILD }]);
    const query = qs.stringify({
      _where: {
        _or: condition
      }
    });
    const resData = await this.query({
      url: `tasks?${query}`
    });
    /* istanbul ignore if  */
    if (resData.error) {
      // 该情形只有在data-center 服务出错时才能出现，超出测试范围
      return resData;
    }
    if (isSingle) {
      return { data: resData.data.pop() };
    }
    // 找出每个平台对应的最新一次任务
    const latestMap = {};
    for (const task of resData.data) {
      const { id, uniqueId } = task;
      if (!latestMap[uniqueId]) {
        latestMap[uniqueId] = task;
      } else {
        latestMap[uniqueId].id < id && (latestMap[uniqueId] = task);
      }
    }
    resData.data = Object.values(latestMap);
    return resData;
  }

  async updateRunningTask(taskId: string | number, progress: string) {
    await this.update({
      id: taskId,
      taskStatus: E_TaskStatus.running,
      progress
    });
    this.logger.info('[vscode build running]', taskId, progress);
  }

  /* istanbul ignore next  */
  async updateStopedTask(taskId: string | number, error: any) {
    // 代码只是针对update方法进行特定参数的固定 及 日志打印
    await this.update({
      id: taskId,
      taskStatus: E_TaskStatus.stopped,
      taskResult: JSON.stringify(error)
    });
    this.logger.error('[vscode build stopped]', taskId, error);
  }

  /* istanbul ignore next  */
  async updateFinishedTask(taskId: string | number, result: any) {
    // 代码只是针对update方法进行特定参数的固定 及 日志打印
    await this.update({
      id: taskId,
      taskStatus: E_TaskStatus.finished,
      taskResult: JSON.stringify(result)
    });
    this.logger.info('[vscode build finished]', taskId, result);
  }

}
