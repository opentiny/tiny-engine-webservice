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
import * as qs from 'querystring';
import { E_Method } from '../../lib/enum';
import { I_Response } from '../../lib/interface';
import DataService from '../dataService';

class AppExtensions extends DataService {
  private base = 'app-extensions';
  // 综合查询列表
  find(param): Promise<I_Response> {
    const query = typeof param === 'string' ? param : qs.stringify(param);
    return this.query({ url: `${this.base}?${query}` });
  }

  // 综合查询一条数据
  async findOne(param: any) {
    const res = await this.find(param);
    if (res.data.length) {
      return this.ctx.helper.getResponseData(res.data[0]);
    }
    return this.ctx.helper.getResponseData({});
  }

  // 数据库操作
  create(param): Promise<I_Response> {
    return this.query({
      url: this.base,
      method: E_Method.Post,
      data: param
    });
  }

  // 综合删除一条或多条记录 (因为schema中并没有id信息，所有需要额外添加综合条件查询删除的接口)
  del(param: any) {
    const query = typeof param === 'string' ? param : qs.stringify(param);
    return this.query({
      url: `${this.base}/bulk?${query}`,
      method: E_Method.Delete
    });
  }

  // 通过id删除一条数据
  delete(id) {
    return this.query({
      url: `${this.base}/${id}`,
      method: E_Method.Delete
    });
  }

  // 更新一条数据
  update(param: any) {
    let url = `${this.base}/uk/update`;
    if (param.id) {
      url = `${this.base}/${param.id}`;
    }
    return this.query({
      url,
      method: E_Method.Put,
      data: param
    });
  }
}

export default AppExtensions;
