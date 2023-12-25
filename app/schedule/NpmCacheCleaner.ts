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
import { spawn } from 'child_process';
import { Subscription } from 'egg';

export default class NpmCacheCleaner extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '1d', // 1 天间隔
      type: 'worker', // 指定所有的 worker 都需要执行
      env: ['alpha', 'prod']
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const task = spawn('npm', ['cache', 'verify']);
    task.on('exit', (code) => {
      if (code === 0) {
        this.logger.info('succeed to verify npm cache');
      }
      /* eslint prefer-promise-reject-errors: "off"*/
      this.logger.error('failed to verify npm cache');
    });
    task.on('error', (error) => {
      this.logger.error('failed to verify npm cache');
      this.logger.error(error.message);
    });
  }
}
