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
import { E_AppState } from '../../lib/enum';

export enum E_CreateAppAction {
  creatAppFromTpl = 'creatAppFromTpl'
}

export interface I_CreateAppParam {
  id?: number;
  name: string;
  description?: string;
  platform: number;
  image_url: string;
  action?: E_CreateAppAction
}

export interface I_UpdateAppParam {
  id: number | string;
  name?: string;
  description?: string;
  app_website?: string;
  editor_url?: string;
  state?: E_AppState;
  platfrom?: string;
  home_page?: string | number;
  latest?: string | number;
  data_hash?: string;
  assets_url?: string;
  extend_config?: object;
}