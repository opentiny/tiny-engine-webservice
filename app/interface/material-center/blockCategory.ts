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
export interface I_ListCategory {
  app: string;
}

export interface I_CreateCategory {
  app: string;
  name: string;
  desc?: string;
  category_id: string;
}

export interface I_UpdateCategory {
  name?: string;
  desc?: string;
  app?: number;
  category_id?: string;
  blocks?: number[];
}

export interface I_QueryCategory {
  app: string;
  name: string;
  category_id: string;
}