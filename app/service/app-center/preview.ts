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
import { E_ErrorCode, E_TASK_STATUS, E_TASK_TYPE } from '../../lib/enum';
import { I_AppComplexInfo, I_Response } from '../../lib/interface';
import MqClass from '../../lib/MqClass';
import DataServcice from '../dataService';

class AppPreview extends DataServcice {
  async start(appId: string | number): Promise<I_Response> {
    const { apps } = this.ctx.service.appCenter;
    const { task } = this.ctx.service;
    const { logger } = this.ctx;
    // 暂时不考虑 应用已有版本的应用出码
    const appComplexInfo: I_AppComplexInfo = await apps.calculateHashValue(appId);
    const { obs_url } = appComplexInfo.appInfo;
    if (!appComplexInfo.isChanged && obs_url) {
      const latestTask: I_Response = await task.getLatestTask(E_TASK_TYPE.APP_BUILD, appId);
      // 当latestTask.data 为 null时，证明此应用从来未被构建过
      if (latestTask.data !== null) {
        const { id, taskResult } = latestTask.data;
        return this.ctx.helper.getResponseData({
          taskId: id,
          result: taskResult
        });
      }
    }


    // 如果有未完成的预览任务，直接返回该任务信息
    let taskInfo: I_Response | null = await task.getUnfinishedTask(E_TASK_TYPE.APP_BUILD, appId);
    if (taskInfo?.data) {
      return taskInfo;
    }

    const newTask = {
      taskTypeId: E_TASK_TYPE.APP_BUILD,
      taskStatus: E_TASK_STATUS.INIT,
      uniqueId: appId
    };
    taskInfo = await task.create(newTask);
    logger.info('start preview task:', taskInfo);

    if (taskInfo.error) {
      const { message, code } = taskInfo.error;
      return this.ctx.helper.getResponseData(null, { message: `failed to create preview task: ${message}`, code });
    }

    const { id: taskId } = taskInfo.data;
    task.update({ id: taskId, taskStatus: E_TASK_STATUS.RUNNING, progress: 'start to generate app code' });

    let appCodeUrl = '';
    try {
      // 应用出码并上传代码zip包到obs
      appCodeUrl = await this.generateAndUpload(appComplexInfo);
    } catch (error) {
      const message = (error as Error)?.message || error;
      task.update({ id: taskId, taskStatus: E_TASK_STATUS.STOPPED, result: message });

      return this.ctx.helper.getResponseData(null, { message, code: E_ErrorCode.Fail });
    }

    task.update({ id: taskId, progress: 'success to generate app code', progress_percent: 10 });

    // 将 task 放入任务队列
    const mqClient = MqClass.getInstance(this.app);
    const publishBool = await mqClient.publish('app', { appId, taskId, appCodeUrl });

    const progressMsg = `MQ: publish preview task ${publishBool ? 'success' : 'failed'}`;
    task.update({
      id: taskId,
      taskStatus: publishBool ? E_TASK_STATUS.RUNNING : E_TASK_STATUS.STOPPED,
      progress: progressMsg
    });
    logger.info(progressMsg);

    if (!publishBool) {
      return this.ctx.helper.getResponseData(null, { message: progressMsg, code: E_ErrorCode.Fail });
    }

    const data = {
      taskId,
      result: 'start preview task.'
    };

    return this.ctx.helper.getResponseData(data);
  }

  public async generateAndUpload(app: string | number | I_AppComplexInfo) {
    const { url, subFolder } = this.app.config.obs;
    const { generate, apps } = this.ctx.service.appCenter;
    const { obs } = this.ctx.service;
    let appComplexInfo: I_AppComplexInfo;
    if (typeof app === 'number' || typeof app === 'string') {
      appComplexInfo = await apps.calculateHashValue(app);
    } else {
      appComplexInfo = app;
    }
    const { id, assets_url } = appComplexInfo.appInfo;
    if (!appComplexInfo.isChanged && assets_url) {
      return assets_url;
    }

    const appId = id;
    try {
      await generate.init(appComplexInfo);
      await generate.copyTemplate();
      await generate.generateCode();

      await generate.zipPackage();
      const { generatePath, codeFolder } = generate;
      const { success } = await obs.upload({
        Key: `${subFolder}/${codeFolder}.zip`,
        SourceFile: `${generatePath}.zip`
      });

      if (!success) {
        const message = `failed to upload ${codeFolder}.zip`;
        this.logger.error(message);

        throw new Error(message);
      }
      const assetsUrl = `${url}/${subFolder}/${codeFolder}.zip`;
      // 回填数据到应用表
      await apps.updateApp({
        id: appId,
        assets_url: assetsUrl
      });
      return assetsUrl;
    } finally {
      // 无论是否成功，都清理本次生成代码的目录、压缩包
      generate.clean();
    }
  }
}

export default AppPreview;
