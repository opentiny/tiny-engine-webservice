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
export const createMaterialRule = {
  name: 'materialName',
  name_cn: 'string',
  framework: 'framework',
  description: 'string?',
  image_url: {
    type: 'url',
    required: false,
    allowEmpty: true
  },
  isDefault: 'boolean',
  isOfficial: 'boolean',
  public: [0, 1, 2],
  public_scope_tenants: {
    type: 'array',
    itemType: 'object',
    rule: {
      id: 'id'
    },
    required: false
  },
  business_categories: {
    type: 'array',
    itemType: 'int',
    required: true
  }
};

export const updateMaterialRule = {
  id: 'id',
  name_cn: 'string?',
  description: 'string?',
  image_url: {
    type: 'url',
    required: false,
    allowEmpty: true
  },
  isDefault: {
    type: 'boolean',
    required: false
  },
  isOfficial: {
    type: 'boolean',
    required: false
  },
  public: {
    type: 'enum',
    values: [0, 1, 2],
    required: false
  },
  public_scope_tenants: {
    type: 'array',
    itemType: 'object',
    rule: {
      id: 'id'
    },
    required: false
  },
  componentLibrary: {
    type: 'array',
    itemType: 'int',
    required: false
  }
};

export const buildMaterialRule = {
  id: 'id',
  version: 'fixedVersion',
  description: 'string',
  blockVersions: {
    type: 'array',
    itemType: 'object',
    rule: {
      block_id: 'id',
      version: 'version'
    }
  }
};