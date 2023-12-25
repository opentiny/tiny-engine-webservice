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
export interface I_CreateBlockGroup {
  app: string;
  name: string;
  desc?: string;
}

interface Blocks {
  id: number;
  version: string;
}

export interface I_UpdateBlockGroup {
  id: string;
  name?: string;
  desc?: string;
  blocks?: Blocks[];
}

export interface I_UpdatePayLoad {
  name?: string;
  desc?: string;
  blocks?: number[];
}