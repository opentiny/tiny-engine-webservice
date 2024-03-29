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
import { EggAppConfig, PowerPartial } from 'egg';
export default () => {
  const config = {} as PowerPartial<EggAppConfig>;
  config.dataCenter = {
    host: process.env.DATA_CENTER_URL || 'http://localhost:1337',
    sessionKeyPrefix: 'lowcode:data:'
  };

  return config;
};
