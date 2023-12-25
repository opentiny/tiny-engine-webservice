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
import { E_Method } from '../../lib/enum';
import { I_CreateBlockHistoryParam, I_Response, I_UpdateBlockHistoryParam } from '../../lib/interface';
export default class BlockHistoryService extends DataService{
  create(param: I_CreateBlockHistoryParam) {
    return this.query({
      url: 'block-histories',
      method: E_Method.Post,
      data: param
    });
  }
  update(param: I_UpdateBlockHistoryParam) {
    return this.query({
      url: 'block-histories',
      method: E_Method.Put,
      data: param
    });
  }
  delete(id) {
    return this.query({
      url: `block-histories/${id}`,
      method: E_Method.Delete
    });
  }
  find(param) {
    const query = qs.stringify(param);
    return this.query({ url: `block-histories?${query}` });
  }
  
  async isHistoryExisted(blockId: string | number, version: string): Promise<boolean> {
    const history: I_Response = await this.find({block_id: blockId, version});
    return !!history.data.length;
  }
}
