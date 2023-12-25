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
export const createBlockGroupRule = {
  app: 'string',
  name: 'string',
  desc: 'string?'
};

export const updateBlockGroupRule = {
  id: 'id',
  app: 'string?',
  name: 'string?',
  desc: 'string?',
  blocks: {
    type: 'array',
    itemType: 'object',
    rule: {
      id: 'id',
      version: 'version'
    },
    required: false
  }
};