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
import { Context } from 'egg';
import { v4 as uuidV4 } from 'uuid';

const addRequestId =  async (ctx: Context, next) => {
    // 添加request_id
    if (ctx.request.header && !ctx.request.header.request_id) {
      ctx.request.header.request_id = uuidV4();
    }
    await next();
};

module.exports = () => addRequestId;