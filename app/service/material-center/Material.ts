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
import { E_Method } from '../../lib/enum';
import DataService from '../dataService';
import * as qs from 'querystring';

export default class Material extends DataService{

  private base = 'materials';

  async update(param) {
    const {id} = param;
    return this.query({
      url: `materials/${id}`,
      method: E_Method.Put,
      data: param
    });

  }

  async find(param) {
    const query = typeof param === 'string' ? param : qs.stringify(param);
    return this.fQuery({
      url: `${this.base}?${query}`
    });
  }

}
