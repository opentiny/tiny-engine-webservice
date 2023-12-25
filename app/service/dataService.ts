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
import { Service } from 'egg';
import { HttpClientResponse, RequestOptions2 } from 'urllib';
import { E_ErrorCode } from '../lib/enum';
import { I_QueryParam, I_Response, I_FieldItem } from '../lib/interface';
import { apiError, throwApiError } from '../lib/ApiError';
import * as qs from 'querystring';

const defaultOption: RequestOptions2 = {
  contentType: 'json',
  dataType: 'json',
  timeout: 100 * 1000
};

const SESSION_KEY = 'TINY_BUILDER_SESS';
const X_USER = 'x-tinybuilder-user';
const X_ORG = 'x-tinybuilder-tenant';
const X_ROLE = 'x-tinybuilder-role';

const roles: Array<string> = ['master', 'admin', 'tenantAdmin', 'platformAdmin', 'appAdmin', 'appDev', 'guest'];

class DataService extends Service {
  protected paramKeys: Array<string | I_FieldItem> = [];
  protected resKeys: Array<string | I_FieldItem> = [];

  /**
   * @param { I_QueryParam } param 查询数据中心请求参数
   * @param { boolean } authRequired 是否需要携带cookie鉴权
   * @param { string } type 请求数据源，目前都是 dataCenter 数据中心
   * @return { Promise<I_Response> } 
  */
  async query(param: I_QueryParam, authRequired = true, type = 'dataCenter'): Promise<I_Response> {
    const { host } = this.app.config[type];
    const { header } = this.ctx.request;
    const { url, method, data, option } = param;
    const curlOption = { method, data, ...option, ...defaultOption };

    // 添加cookie
    curlOption.headers = curlOption.headers || {};
    if (this.ctx.state.authMode === 'accessKey') {
      curlOption.headers.cookie = this.ctx.state.injectedCookie;
    } else {
      // x-lowcode-user 请求头 对于白名单 及 开发者模式分别为 whitelist 及 develop
      const emptyUser = header['x-lowcode-user'];
      if (emptyUser) {
        curlOption.headers[X_USER] = emptyUser;
        if (emptyUser === 'develop') {
          const role = header['x-lowcode-role'] || 'master';
          this.setDevelopCookie(curlOption, role as string);
        }
      } else if (!this.verifyCookie() || !authRequired) {
        // 此种情况经过中间件约束只出现在定时任务、队列任务请求上
        curlOption.headers[X_USER] = 'backend';
      } else {
        curlOption.headers.cookie = this.ctx.request.headers.cookie;
      }
    }

    // 添加request_id
    curlOption.headers.request_id = header.request_id;
    // 设置租户信息（任何权限用户均必须设置一个租户信息已确保操作数据的合法性）
    curlOption.headers[X_ORG] = header['x-lowcode-org'];
    const api = `${host}/${url}`;
    return await this.catchRequest(api, curlOption, type);
  }

  private async catchRequest(url: string, option: RequestOptions2, type: string): Promise<I_Response> {
    this.app.logger.info(
      `request ${type}: ${url}, 
      userIP: ${this.ctx.request.ip}, 
      option: ${JSON.stringify(option).slice(0, 2000)}`
    );
    let data: any = null;
    let result: HttpClientResponse<any>;
    try {
      result = await this.ctx.curl(url, option);
    } catch (e) {
      this.app.logger.error('请求数据中心出错:', e);
      throw apiError((e as Error).message, 200, E_ErrorCode.Fail, data);
    }
    // data-center返回鉴权失败时 添加401逻辑
    if (result.status === 401) {
      this.app.logger.warn('数据中心鉴权失败：', result);
      throwApiError(`数据中心鉴权失败: ${result}`, result.status);
    }
    /* istanbul ignore next */
    data = type === 'dataCenter' ? result.data : result.data.data;
    /* istanbul ignore if */
    if (result.status !== 200) {
      throwApiError(`${data?.message || '请求失败'}`, 200, result.status.toString(), data);
    }
    return this.ctx.helper.getResponseData(data);
  }

  public formatDataFields(data: any, fields: Array<string | I_FieldItem>, isToLine = false): any {
    const { toLine, toHump } = this.ctx.helper;
    const format = isToLine ? toLine : toHump;
    // 涉及到复杂场景，将fields转换为hashMap
    const fieldsMap = new Map();
    fields.forEach((field: string | I_FieldItem) => {
      if (typeof field === 'string') {
        fieldsMap.set(field, true);
      } else {
        fieldsMap.set(field.key, field.value);
      }
    });
    const res = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const val = fieldsMap.get(key);
        if (val) {
          const convert = val === true ? format : val;
          res[convert(key)] = data[key];
        } else {
          res[key] = data[key];
        }
      }
    }
    return res;
  }

  /**
   * 对query方法的二次封装，增加了对返回字段格式化的一些逻辑
   * @param { I_QueryParam } param 查询数据中心请求参数
   * @param { boolean } authRequired 是否需要携带cookie鉴权
   * @return { Promise<I_Response> } 
  */
  async fQuery(param, authRequired = true) {
    param.data = this.formatDataFields(param.data, this.paramKeys, true);
    const res = await this.query(param, authRequired);
    if (!res.error) {
      const data = res.data;
      if (Array.isArray(data)) {
        res.data = data.map((item) => this.formatDataFields(item, this.resKeys));
      } else {
        res.data = this.formatDataFields(data, this.resKeys);
      }
    }

    return res;
  }

    /**
   * 对query方法的二次封装，增加了对返回字段格式化的一些逻辑,针对分页列表
   * @param { I_QueryParam } param 查询数据中心请求参数
   * @param { boolean } authRequired 是否需要携带cookie鉴权
   * @return { Promise<I_Response> } 
  */
    async fQueryList(param, authRequired = true) {
      param.data = this.formatDataFields(param.data, this.paramKeys, true);
      const res = await this.query(param, authRequired);
      if (!res.error && res.data.list) {
        const data = res.data.list;
        if (Array.isArray(data)) {
          res.data.list = data.map((item) => this.formatDataFields(item, this.resKeys));
        }
      }
  
      return res;
    }

  private verifyCookie(): boolean {
    const sessionKey = this.ctx.cookies.get('TINY_BUILDER_SESS');
    if (!sessionKey) {
      const w3Key = this.ctx.cookies.get('hwsso_am', {
        signed: false
      });
      return !!w3Key;
    }
    return true;
  }

  private setDevelopCookie(curlOption, role: string) {
    if (!roles.includes(role)) {
      role = 'master';
    }
    curlOption.headers[X_ROLE] = role;
    const sessionValue = `tiny-builder-developer-${role}`;
    const currentValue = this.ctx.cookies.get(SESSION_KEY);
    if (sessionValue !== currentValue) {
      this.ctx.cookies.set(SESSION_KEY, sessionValue, {
        signed: true
      });
      const setCookie: Array<string> = this.ctx.response.headers['set-cookie'] as Array<string>;
      curlOption.headers.cookie = setCookie.join(';');
    } else {
      curlOption.headers.cookie = this.ctx.request.headers.cookie;
    }
  }

  _count(baseUrl = 'platforms', param) {
    const query = typeof param === 'string' ? param : qs.stringify(param);
    return this.query({ url: `${baseUrl}/count?${query}` });
  }

}

export default DataService;
