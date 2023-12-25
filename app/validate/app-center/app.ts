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
export const createAppRule = {
  name: 'string',
  description: 'string?',
  platform: 'int',
  image_url: {
    type: 'url',
    required: false,
    allowEmpty: true
  }
};

export const createAppByTemplateRule = {
  id: 'int',
  ...createAppRule
};

export const updateAppRule = {
  id: 'id',
  name: 'string?',
  description: 'string?',
  git_group: 'string?',
  // git 仓库地址
  project_name: {
    type: 'url',
    required: false,
    allowEmpty: true
  },
  branch: 'string?',
  visit_url: {
    type: 'url',
    required: false,
    allowEmpty: true
  },
  image_url: {
    type: 'url',
    required: false,
    allowEmpty: true
  },
  extend_config: {
    type: 'object',
    required: false
  }
};

export const publishAppRule = {
  id: 'id',
  commitMsg: 'commit',
  branch: 'string',
  canCreateNewBranch: 'boolean',
  allGenerate: 'boolean'
};