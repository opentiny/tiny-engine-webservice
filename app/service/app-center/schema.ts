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
import moment from 'moment';
import 'moment/locale/zh-cn';
import { I_Response, I_SchemaConvert } from '../../lib/interface';
import { E_ErrorCode, E_SchemaFormatFunc } from '../../lib/enum';
import DataService from '../dataService';
moment.locale('zh-cn');
abstract class Schema extends DataService {
  public moment = moment;
  abstract getSchema(id: string | number): Promise<I_Response>;
  assembleFields(originalData: I_Response, type = 'app'): I_Response {
    let dataCopy = JSON.parse(JSON.stringify(originalData.data));
    const conf: I_SchemaConvert = this.config.schema[type];
    if (conf.include || conf.exclude) {
      dataCopy = this.filterFields(dataCopy, conf);
    }
    if (conf.format) {
      dataCopy = this.formatFields(dataCopy, conf);
    }
    if (conf.convert) {
      dataCopy = this.convertFields(dataCopy, conf);
    }
    return this.ctx.helper.getResponseData(dataCopy);
  }
  // 转换数据表字段为schema中的字段命名
  private convertFields(data: any, conf: I_SchemaConvert): any {
    const convertConf = conf.convert ?? {};
    Object.keys(convertConf).forEach(key => {
      data[convertConf[key]] = data[key];
      delete data[key];
    });
    return data;
  }

  // 筛选数据
  private filterFields(data: any, conf: I_SchemaConvert): any {
    const excludeConf: Array<string> = conf.exclude ?? [];
    const includeConf: Array<string> = conf.include ?? [];
    let res = {};
    // include 优先级高于 exclude
    if (includeConf.length) {
      for (const key in data) {
        if (includeConf.includes(key)) {
          res[key] = data[key];
        }
      }
    } else if (excludeConf.length) {
      for (const key in data) {
        if (!excludeConf.includes(key)) {
          res[key] = data[key];
        }
      }
    } else {
      res = data;
    }

    return res;
  }

  // 格式化数据
  private formatFields(data: any, conf: I_SchemaConvert): any {
    const { format = {} } = conf;
    Object.keys(format).forEach(key => {
      const funcName: E_SchemaFormatFunc = format?.[key];
      const func: (param: any) => any | undefined = this[funcName];
      if (func) {
        data[key] = func(data[key]);
      }
    });
    return data;
  }

  // 拼装失败信息
  getErrorRes(message: string, errorCode?: E_ErrorCode): I_Response {
    const code = errorCode || E_ErrorCode.Fail;
    const error = {
      code,
      message
    };
    return this.ctx.helper.getResponseData(null, error);
  }

  // 工具转换函数
  // utc时间转换为本地时间
  protected toLocalTimestamp(time: string): string {
    return moment(time).format('YYYY-MM-DD hh:mm:ss');
  }

  // isBody属性转换
  protected toRootElement(isBody: boolean): 'body' | 'div' {
    return isBody ? 'body' : 'div';
  }

  // group名称转换
  protected toGroupName(group: string): string {
    // 调整一下group命名
    if (['static', 'public'].includes(group)) {
      return `${group}Pages`;
    }
    return group;
  }

  // createdBy 转换为用户名
  protected toCreatorName(createdBy: any): string {
    // 历史原因 数据库中有页面的createdBy为null
    return (createdBy || {}).username || '';
  }

  // 数字转字符串
  protected toFormatString(param: any): string {
    return param.toString();
  }

  // 给global_state设置默认值
  protected toArrayValue(state: any): Array<any> {
    
    return Array.isArray(state) ? state : [];
  }
}

export default Schema;
