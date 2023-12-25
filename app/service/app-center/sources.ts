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
import { I_CreateSourcesParam, I_UpdateSourcesParam } from '../../lib/interface';
import DataService from '../dataService';

class Sources extends DataService {
  getSourcesByAppId(aid: number) {
    return this.query({
      url: `sources?app=${aid}`
    });
  }

  getSourcesById(id: number) {
    return this.query({
      url: `sources/${id}`
    });
  }

  delSources(id: number) {
    return this.query({
      url: `sources/${id}`,
      method: E_Method.Delete
    });
  }

  updateSources(param: I_UpdateSourcesParam) {
    const id = param.id;
    return this.query({
      url: `sources/${id}`,
      method: E_Method.Put,
      data: param
    });
  }

  createSources(param: I_CreateSourcesParam) {
    return this.query({
      url: 'sources',
      method: E_Method.Post,
      data: param
    });
  }
}

export default Sources;
