﻿/**
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
// import MqClass from "./app/lib/MqClass";
import addValidate from './app/validate/common';
export default class AppBootHook {
  private app;
  // private queueTypes = ['block', 'material', 'app', 'platform'];
  constructor(app) {
    this.app = app;
    this.app.logger.info('start to init app');
  }

  // 配置文件即将加载，这是最后动态修改配置的时机
  async configWillLoad() {
    this.app.logger.info('configWillLoad');
  }

  // 配置文件加载完成
  async beforeStart() {
    this.app.logger.info('beforeStart');
  }
  // 文件加载完成
  async didLoad() {
    this.app.logger.info('didLoad');
  }

  // 插件启动完毕
  async willReady() {
    this.app.logger.info('willReady');
    addValidate(this.app)
  }

  // worker 准备就绪
  async didReady() {
    // const mqClient = MqClass.getInstance(this.app);
    // await mqClient.initPublisher(this.queueTypes);
    this.app.logger.info('didReady');
  }

  // 应用启动完成
  async serverDidReady() {
    this.app.logger.info('serverDidReady');
  }

  // 应用即将关闭
  async beforeClose() {
    this.app.logger.info('beforeClose');
  }
}
