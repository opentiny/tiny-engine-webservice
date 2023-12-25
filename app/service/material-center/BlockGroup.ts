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
import { I_CreateBlockGroup, I_UpdateBlockGroup, I_UpdatePayLoad } from '../../interface/material-center/blockGroup';

export default class BlockGroupService extends DataService{
  find(param) {
    const query = typeof param === 'string' ? param : qs.stringify(param);
    return this.query({ url: `block-groups?${query}` });
  }

  tinyFind(param) {
    const query = typeof param === 'string' ? param : qs.stringify(param);
    return this.query({ url: `block-groups/tiny?${query}` });
  }

  async create(param: I_CreateBlockGroup) {
    const res = await this.query({
      url: 'block-groups',
      method: E_Method.Post,
      data: param
    });
    return res;
  }
  async update(param: I_UpdateBlockGroup) {
    const { id, blocks, ...rest} = param;
    const blockIds: Array<number> = [];
    const blockRelations: Array<any> = [];
    let payload: I_UpdatePayLoad = {...rest};

    if (blocks?.length) {
      blocks.forEach((block: any) => {
        blockIds.push(block.id);
        blockRelations.push({
          block: block.id,
          host: id,
          host_type: 'blockGroup',
          version: block.version,
        });
      });
  
      // 更新区块分组和区块历史版本关系
      await this.query({
        url: 'blocks-carriers-relations/bulk/create',
        method: E_Method.Post,
        data: blockRelations
      });
    }

    if (blocks) {
      payload = {
        blocks: blockIds,
        ...rest
      };
    }

    const res = await this.query({
      url: `block-groups/${id}`,
      method: E_Method.Put,
      data: payload
    });
    return res;
  }
  async delete(id) {
    const res = await this.query({
      url: `block-groups/${id}`,
      method: E_Method.Delete
    });
    return res;
  }
}
