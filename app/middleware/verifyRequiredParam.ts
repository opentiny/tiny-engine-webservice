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
import { E_ErrorCode } from '../lib/enum';
import { ParamPosition, getRequestParam } from './verifyRequestParam';

export interface I_SetParamPosition {
  [propsName: string]: ParamPosition;
}

export default function verifyRequiredParam(params: Array<string | I_SetParamPosition>): any {
  return async (ctx: Context, next: () => Promise<any>) => {
    const missingParams: Array<string> = [];
    for (const item of params) {
      let key = item;
      let pos: ParamPosition = 'body';
      if (typeof key !== 'string') {
        key = Object.keys(key)[0];
        pos = item[key];
      }
      const param = getRequestParam(ctx, key, pos);
      if (!param) {
        missingParams.push(key);
      }
    }
    if (missingParams.length) {
      const error = {
        code: E_ErrorCode.BadRequest,
        message: `${missingParams.join(',')} is required`
      };
      ctx.body = ctx.helper.getResponseData(null, error);
      return;
    }
    await next();
  };
}
