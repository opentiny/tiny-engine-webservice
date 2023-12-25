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
import DataService from '../dataService';
import * as qs from 'querystring';
import {
  I_ListCategory,
  I_CreateCategory,
  I_UpdateCategory,
  I_QueryCategory
} from '../../interface/material-center/blockCategory';
import { E_Method } from '../../lib/enum';

export default class BlockCategoryService extends DataService {
  private base = 'block-categories';
  findById(id: string) {
    return this.query({ url: `${this.base}/${id}` });
  }
  list(params: I_ListCategory) {
    const query = qs.stringify({ ...params });
    return this.query({
      url: `${this.base}?${query}`
    });
  }
  create(categoryInfo: I_CreateCategory) {
    return this.query({
      url: `${this.base}`,
      method: E_Method.Post,
      data: categoryInfo
    });
  }
  update(id: string, updateInfo: I_UpdateCategory) {
    return this.query({
      url: `${this.base}/${id}`,
      method: E_Method.Put,
      data: updateInfo
    });
  }
  delete(id: string) {
    return this.query({
      url: `${this.base}/${id}`,
      method: E_Method.Delete
    });
  }
  tinyFind(params: I_QueryCategory) {
    const query = qs.stringify({ ...params });
    return this.query({
      url: `${this.base}/tiny/list?${query}`
    });
  }
}
