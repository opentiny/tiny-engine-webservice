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
import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  cors: {
    enable: true,
    package: 'egg-cors',
    env: ['alpha', 'local']
  },
  // 用于连接rocketmq 使用时请按需打开
  amqplib: {
    enable: false,
    package: 'egg-amqplib'
  },
  ejs: {
    enable: true,
    package: 'egg-view-ejs'
  },
  session: true,
  // 用于连接redis 使用时请按需打开
  redis: {
    enable: false,
    package: 'egg-redis'
  },
  validate: {
    enable: true,
    package: 'egg-validate'
  },
  i18n: {
    enable: true,
    package: 'egg-i18n'
  },
  routerPlus: {
    enable: true,
    package: 'egg-router-plus'
  }
};

export default plugin;
