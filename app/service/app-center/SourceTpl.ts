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
import DataService from '../dataService';

export default class SourceTplService extends DataService {
  async find(param) {
    const query = qs.stringify(param);
    const res = await this.query({ url: `source-tpls?${query}` });
    return res;
  }
  async create(param) {
    const res = await this.query({
      url: 'source-tpls',
      method: E_Method.Post,
      data: param
    });
    return res;
  }
  async update(param) {
    const { id } = param;
    delete param.name;
    const res = await this.query({
      url: `source-tpls/${id}`,
      method: E_Method.Put,
      data: param
    });
    return res;
  }
  async delete(id) {
    const res = await this.query({
      url: `source-tpls/${id}`,
      method: E_Method.Delete
    });
    return res;
  }
}
