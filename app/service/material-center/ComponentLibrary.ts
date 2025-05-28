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
import { I_CreateComponentLibrary } from '../../lib/interface';
import * as qs from 'querystring';
import DataService from '../dataService';

export default class ComponentLibrary extends DataService{

  async create(param: I_CreateComponentLibrary) {
    return this.query({ 
      url: 'component-library' ,
      method: E_Method.Post,
      data: param
    });
  }

  async find(param){
    const query = qs.stringify(param);
    return this.query({
      url: `component-library?${query}`
    });
  }

  async list() {
    return this.query({ url: 'component-library' });
  }

  async update(param) {
    const { id } = param;
    return this.query({
      url: `component-library/${id}`,
      method: E_Method.Put,
      data: param
    });
  }

  delete({ id }){
    return this.query({
      url: `component-library/${id}`,
      method: E_Method.Delete
    });
  }
}
