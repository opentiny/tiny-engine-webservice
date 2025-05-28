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
import { E_Schema2CodeType } from "../../lib/enum";

export const dslCodeRule = {
    id: 'id',
    type: [E_Schema2CodeType.BLOCK, E_Schema2CodeType.PAGE],
    history: 'id?',
    app: 'id'
};

export const schema2codeRule = {
    app: 'id',
    pageInfo: 'schemaContent'
};

export const schema2codeRuleV1 = {
    app: 'id',
    pageInfo: {
        type: 'object',
        required: true,
        rule: {
            schema: 'object',
            id: 'id',
            name: 'string'
        }
    }
};

export const createPageRule = {
    app: 'id',
    group: ['staticPages', 'publicPages'],
    isBody: 'boolean',
    isHome: 'boolean',
    isPage: 'boolean',
    message: 'string',
    name: 'string',
    parentId: 'pageParentId',
    route: 'string',
    page_content: 'object'
};

export const createFolderRule = {
    parentId: 'pageParentId',
    route: 'string',
    name: 'string',
    app: 'id',
    isPage: 'boolean'
};

export const updatePageRule = {
    id: 'id',
    isBody: {
        type: 'boolean',
        required: false
    },
    isHome: {
        type: 'boolean',
        required: false
    },
    message: 'string?',
    name: 'string?',
    parentId: {
        type: 'pageParentId',
        required: false
    },
    route: 'string?',
    page_content: {
        type: 'object',
        rule: { componentName: ['Page'] },
        required: false
    },
    isDefault: {
        type: 'boolean',
        required: false
    }
};

export const updateFolderRule = {
    id: 'id',
    name: 'string?',
    parentId: {
        type: 'pageParentId',
        required: false
    },
    route: 'string?',
};
