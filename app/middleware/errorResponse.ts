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
import { E_ThrowCode } from '../lib/enum';

import { Context } from 'egg';
import { ApiError } from '../lib/ApiError';

const catchApiError = (err: ApiError, ctx: Context) => {
  if (err.status === 401 && !err.code) {
    ctx.service.w3SSOLCService.setForbiddenRes();
  } else {
    ctx.status = err.status;
    ctx.body = ctx.helper.getResponseData(null, {
      message: err.msg,
      code: err.code
    });
  }
};

const catchError = (err: any, ctx: Context) => {
  switch (err.code) {
    case E_ThrowCode.PERMISSION_DENIED:
      ctx.helper.commonJson({}, 403, 'CM008');
      break;
    case E_ThrowCode.INVALID_PARAM:
      ctx.helper.commonJson(
        {},
        200,
        'CM002',
        `${err.errors[0].field} ${ctx.__(err.errors[0].message) || err.errors[0].message}`
      );
      break;
    default:
      ctx.helper.commonJson({}, Number(err.status) || 500, err.code || 'CM001');
  }
};

const errorTrace = async (ctx: Context, next) => {
  try {
    await next();
  } catch (err: any) {
    ctx.logger.error(err);
    if (err instanceof ApiError) {
      catchApiError(err, ctx);
    } else {
      catchError(err, ctx);
    }
  }
};

module.exports = () => errorTrace;