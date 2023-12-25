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

export type ParamPosition = 'params' | 'query' | 'body';

export interface I_VerifyParam {
  [propsName: string]: {
    regExp: RegExp; // 遇到需要函数校验得再改，暂时不用变成通用的模式
    pos: ParamPosition;
  };
}

export const getRequestParam = (ctx: Context, name: string, pos: ParamPosition = 'body'): any => {
  const {
    params,
    request: { body, query }
  } = ctx;
  let param;
  switch (pos) {
    case 'body':
      param = body[name];
      break;
    case 'query':
      param = query[name];
      break;
    case 'params':
      param = params[name];
      break;
    default:
      param = undefined;
  }
  return param;
};

// 用于校验参数是否满足预期传值 与 verifyRequiredParam 比更复杂
export default function verifyRequestParam(params: I_VerifyParam): any {
  return async (ctx: Context, next: () => Promise<any>) => {
    const missingParams: Array<string> = [];
    Object.keys(params).forEach(key => {
      const { pos, regExp } = params[key];
      const param = getRequestParam(ctx, key, pos);
      if (!regExp.test(param)) {
        missingParams.push(key);
      }
    });
    
    if (missingParams.length) {
      const error = {
        code: E_ErrorCode.BadRequest,
        message: `${missingParams.join(',')} not found or type error!`
      };
      ctx.body = ctx.helper.getResponseData(null, error);
      return;
    }
    await next();
  };
}
