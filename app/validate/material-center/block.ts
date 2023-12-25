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
export const createBlockRule = {
  label: 'blockName',
  name_cn: 'string',
  framework: ["Html", "Angular", "React", "Vue"],
  content: 'object',
  description: 'string?',
  // 设计器里传了,门户没传,估计是个问题
  path: 'string?',
  screenshot: 'string?',
  created_app: {
    type: 'createdApp',
    required: false
  },
  tags: {
    type: 'array',
    itemType: 'string',
    required: false
  },
  public: [0, 1, 2],
  categories: {
    type: 'array',
    itemType: 'int',
    required: false
  },
  // 当前锁定的用户
  occupier: {
    type: 'object',
    required: false
  },
  isDefault: {
    type: 'boolean',
    required: false
  },
  isOfficial: {
    type: 'boolean',
    required: false
  }
};

export const updateBlockRule = {
  id: 'id',
  name_cn: 'string?',
  description: 'string?',
  screenshot: 'string?',
  label: 'string?',
  framework: {
    type: 'enum',
    values:  ["Html", "Angular", "React", "Vue"],
    required: false
  },
  // 区块保存的时候前端有时候传对象数组，有时候传数字数组。避免业务直接不可用，暂时兼容。理论上需要传数字数组
  categories: {
    type: 'array',
    required: false
  },
  content: {
    type: 'object',
    rule: { componentName: ['Block'] },
    required: false
  },
  tags: {
    type: 'array',
    itemType: 'string',
    required: false
  },
  public: {
    type: 'enum',
    values: [0, 1, 2],
    required: false
  },
  isDefault: {
    type: 'boolean',
    required: false
  },
  isOfficial: {
    type: 'boolean',
    required: false
  }
};

export const buildBlockRule = {
  block: 'object',
  version: 'fixedVersion',
  deploy_info: 'string',
  is_compile: {
    type: 'boolean',
    required: false
  },
  needToSave: {
    type: 'boolean',
    required: false
  }
};

