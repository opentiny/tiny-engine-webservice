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
import { I_CreatePageHistoryParam, I_Response } from '../../lib/interface';
import DataService from '../dataService';
class PageHistories extends DataService {
  protected paramKeys = ['parentId', 'isHome', 'isBody'];
  protected resKeys = ['parent_id', 'is_home', 'is_body'];
  getHistory(id: number | string) {
    return this.fQuery({
      url: `pages-histories/${id}`
    });
  }

  del(id: number | string) {
    return this.fQuery({
      url: `pages-histories/${id}`,
      method: E_Method.Delete
    });
  }

  create(param: I_CreatePageHistoryParam) {
    const time = new Date();
    const data = { ...param, time };
    return this.fQuery({
      url: 'pages-histories',
      method: E_Method.Post,
      data
    });
  }

  async save(pageRes: I_Response) {
    if (pageRes.error) {
      this.logger.error('[pageHistories Error]: 保存页面历史记录失败,获取参数：', pageRes);
    }
    const pageInfo: any = pageRes.data;
    const message = pageInfo.message ?? `${pageInfo.name} page auto save`;
    const param = {
      ...pageInfo,
      message,
      page: pageInfo.id
    };
    await this.create(param);
  }

  async find(param) {
    const query = qs.stringify(param);
    return this.fQuery({ url: `pages-histories?${query}` });
  }

}

export default PageHistories;
