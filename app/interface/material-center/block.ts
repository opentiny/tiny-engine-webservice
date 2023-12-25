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
export interface I_CreateBlock {
  label: string;
  name_cn: string;
  framework: string;
  content: object;
  description?: string;
  path?: string;
  screenshot?: string;
  created_app: string | number;
  tags: string[];
  public: number;
  public_scope_tenants: number[];
  categories: number[];
  occupier: object;
  isDefault: boolean;
  isOfficial: boolean;
  content_blocks?: any;
}

export interface I_UpdateBlock {
  id: string;
  label?: string;
  name_cn?: string;
  framework?: string;
  content?: object;
  description?: string;
  screenshot?: string;
  tags?: string[];
  public?: number;
  public_scope_tenants?: number[];
  categories?: number[];
  isDefault?: boolean;
  isOfficial?: boolean;
  histories?: number[];
  content_blocks?: any;
  last_build_info?: any;
}