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
import { I_ErrorData, I_Response, I_DataUnnecessary } from '../lib/interface';
import { I_UpdateAppParam } from '../interface/app-center/app';
import { E_ErrorCode, E_MaterialErrorCode } from '../lib/enum';

module.exports = {
  commonJson(data?: Record<string, any>, httpStatus?: number, errCode?: string, errMsg?: string) {
    const responseBody: I_Response = {
      data: data || {},
      locale: this.ctx.__getLocale(),
    };
    const err_code = errCode || '0';
    if (err_code !== '0') {
      responseBody.error = {
        code: err_code,
        message: errMsg || (errCode ? this.ctx.__(errCode) : ''),
      };
    }
    this.ctx.status = httpStatus || 200;
    this.ctx.body = responseBody;
  },

  /**
   * 持续补充
   * 400 bad request;
   * 401 unauthorized;
   * 403 forbidden;
   * 404 not found;
   * 406 not acceptable;
   * 409 conflict;
   * 415 unsupported media type;
   */
  errorCodes: {
    400: E_ErrorCode.CM002,
    401: E_ErrorCode.CM007,
    403: E_ErrorCode.CM007,
    404: E_ErrorCode.CM009,
    406: E_ErrorCode.CM002,
    409: E_ErrorCode.CM003,
    415: E_ErrorCode.CM002,
    412: E_MaterialErrorCode.CM201,
  },

  getResponseData(data: any, error?: I_ErrorData): I_Response {
    const res: I_Response = {
      data,
      locale: this.ctx.__getLocale(),
    };

    if (error) {
      this.ctx.logger.error(error);
      let err_code = error?.code;
      if (!String(err_code).startsWith('CM')) {
        err_code = this.errorCodes[error?.code] || E_ErrorCode.CM001;
      }
      res.error = {
        code: err_code,
        message: this.ctx.__(err_code),
      };
      res.err_msg = error?.message;
    }
    return res;
  },

  /**
   * 对准备返回的数据进行加工
   * @param response 准备返回的数据
   * @param uniqueParam 不可重复参数，可以是多个比如：name, url
   * @returns I_Response
   */
  formatResponse(response: I_Response, uniqueParam: string): I_Response {
    const res = { ...response };
    // 如果返回错误类型是重复插入，应该补充对应参数提示
    if (res?.error?.code === E_ErrorCode.CM003) {
      res.error.message = `${uniqueParam}: ${res.error.message}`;
    }
    return res;
  },

  // 该方法内包含this引用，无法通过解构 helper 使用
  getBadRequestResponse(message) {
    const error = {
      code: E_ErrorCode.BadRequest,
      message
    };
    return this.ctx.helper.getResponseData(null, error);
  },

  isIntegerId(id) {
    return /^\d+$/.test(id);
  },

  setBackendHeader(ctx) {
    ctx.request.header['x-lowcode-user'] = 'backend';
  },

  isSystemUser(): boolean {
    const mode = this.ctx.request.header['x-lowcode-mode'];
    return mode === 'develop';
  },

  kebabToPascalCase(param) {
    return param
      .split('-')
      .map((word) => word.replace(/^./, (c) => c.toUpperCase()))
      .join('');
  },

  convertAppResFieldType(data: I_UpdateAppParam & I_DataUnnecessary): any {
    const res: any = {};
    Object.keys(data).forEach(item => {
      switch (item) {
        case 'id':
          res[item] = data[item].toString();
          break;
        case 'app_website':
          res[item] = data[item] ?? '';
          break;
        case 'app_desc':
          res[item] = data[item] ?? '';
          break;
        default:
          res[item] = data[item];
      }
    });
    return res;
  },

  toHump(name: string): string {
    return name.replace(/\_(\w)/g, (_, letter: string) => letter.toLocaleUpperCase());
  },

  toLine(name: string): string {
    return name.replace(/([A-Z])/g, '_$1').toLocaleLowerCase();
  },

  loggerPaddingMessage(ctx: Context) {
    // format: '[$userId/$ip/$traceId/$use_ms $method $url]'
    const userId = ctx.userId || '-';
    const traceId = ctx.tracer && ctx.tracer.traceId || '-';
    let use = 0;
     /* istanbul ignore if  */
    if (ctx.performanceStarttime) {
      use = Math.floor((performance.now() - ctx.performanceStarttime) * 1000) / 1000;
    } else if (ctx.starttime) {
      use = Date.now() - ctx.starttime;
    }
    return '[' +
      userId + '/' +
      ctx.ip + '/' +
      traceId + '/' +
      use + 'ms ' +
      ctx.method + ' ' +
      ctx.url +
      ']';
  },

  /**
 * 返回拍平的数组对象
 *
 *     flat({ a: { b: 1 } })    //  { a.b: 1}
 *
 * @param {Object} param 数据源
 * @returns {Object}
 */

  flat(param) {
    if (!param || typeof param !== 'object') {
      return param;
    }
    const paramIsArray = Array.isArray(param);
    const result = paramIsArray ? [] : {}; // 设置全局变量

    const find = (param, parentKey = '') => {
      // 判断param的类型
      const isArray = Array.isArray(param);
      for (const key in param) {
        if (Object.prototype.hasOwnProperty.call(param, key)) {
          // 根据类型来拼接key
          const curKey = isArray ? `${parentKey}[${key}]` : `${parentKey}${parentKey === '' ? '' : '.'}${key}`;

          const item = param[key];
          if (item && typeof item === 'object') {
            // 若值为array或object，则继续递归
            find(item, curKey);
          } else {
            // 若为普通类型，本次递归结束，推送数据
            if (paramIsArray) {
              (result as Array<any>).push({[curKey]:item});
            } else {
              result[curKey] = item;
            }
            
          }
        }
      }
    };
    find(param);

    return result;
  },
  /**
   * 选择对象中的属性返回新对象
   * @param {Object} obj 被选择对象
   * @param {Array} fields 需要选择的属性数组
   * @param {Boolean} isInclude 是否为包含模式
   */
  pickObject(obj: any, fileds: string[], isInclude = true) {
    const toString = Object.prototype.toString.call(obj);
    const objType = toString.slice(8, toString.length - 1);
    if (objType !== 'Object') {
      throw new Error('first param must be an Object');
    }
    const result = {};
    const fieldsSet = new Set(fileds);
    Object.keys(obj).forEach(key => {
      const shouldCopyValue = isInclude ? fieldsSet.has(key) : !fieldsSet.has(key);
      if (shouldCopyValue) {
        result[key] = obj[key];
      }
    });
    return result;
  }
};
