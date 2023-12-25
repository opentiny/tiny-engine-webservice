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
import { E_Method, E_TaskStatus, E_TaskType } from '../../lib/enum';
import { I_Response, I_UpdateTaskParam } from '../../lib/interface';
import DataService from '../dataService';

class TaskRecordService extends DataService {
  async createNewTask(uniqueId: number, params = {}) {
    return this.query({
      url: 'tasks',
      method: E_Method.Post,
      data: {
        taskTypeId: E_TaskType.PLATFORM_BUILD,
        taskName: '',
        taskStatus: E_TaskStatus.init,
        uniqueId,
        ...params
      }
    });
  }

  async updateTaskInfo(taskId: number, param: I_UpdateTaskParam) {
    return this.query({
      url: `tasks/${taskId}`,
      method: E_Method.Put,
      data: param
    });
  }

  async queryTaskList(query) {
    const querystring = qs.stringify(query);
    return this.query({ url: `tasks?${querystring}` });
  }

  // 查询当前设计器最新的构建任务数据
  async queryTask(uniqueId: string | number) {
    // 重构去掉无用的多个设计器的id数组查询功能
    const query = {
      uniqueId: Number(uniqueId),
      taskTypeId: E_TaskType.PLATFORM_BUILD,
      _limit: 1,
      _sort: 'created_at:DESC'
    };
    const result: I_Response = await this.query({
      url: `tasks?${qs.stringify(query)}`
    });
    return this.ctx.helper.getResponseData(result.data[0]);
  }

  async queryTaskByTaskId(taskId: number) {
    return this.query({
      url: `tasks/${taskId}`
    });
  }
}

export default TaskRecordService;
