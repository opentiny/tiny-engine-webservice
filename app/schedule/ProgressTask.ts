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
import { Subscription } from 'egg';
import { E_TaskStatus, E_TaskType } from '../lib/enum';

class ProgressTask extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '10m', // 10 分钟间隔
      type: 'worker', // 指定所有的 worker 都需要执行
      env: ['alpha', 'prod']
    };
  }

  async subscribe() {
    // 按id逆序查询最新的50个未完成的平台构建任务
    const query = {
      taskTypeId: E_TaskType.PLATFORM_BUILD,
      taskStatus_eq: E_TaskStatus.running,
      _limit: 50,
      _sort: 'id:desc'
    };
    const res = await this.service.platformCenter.taskRecordService.queryTaskList(query);
    for (const task of res.data) {
      // 更新时间超过15分钟的未完成的任务状态更新为 stopped
      if (Date.now() - Date.parse(task.updated_at) > 15 * 60 * 1000) {
        this.service.platformCenter.taskRecordService.updateTaskInfo(task.id, { taskStatus: E_TaskStatus.stopped });
      }
    }
  }
}

module.exports = ProgressTask;
