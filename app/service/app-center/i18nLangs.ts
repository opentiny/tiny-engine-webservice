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
import { I_CreateI18nLang, I_Response, I_UpdateI18nLang } from '../../lib/interface';
import DataService from '../dataService';
class I18nLangs extends DataService {
  getLang(id: number | string) {
    // 去掉所属 blocks apps等冗余数据
    return this.query({
      url: `i18n-langs/${id}`
    });
  }

  del(id: number | string) {
    return this.query({
      url: `i18n-langs/${id}`,
      method: E_Method.Delete
    });
  }

  create(param: I_CreateI18nLang) {
    return this.query({
      url: 'i18n-langs',
      method: E_Method.Post,
      data: param
    });
  }

  update(param: I_UpdateI18nLang): Promise<I_Response> {
    return this.query({
      url: `i18n-langs/${param.id}`,
      method: E_Method.Put,
      data: param
    });
  }

  find(param) {
    const query = typeof param === 'string' ? param : qs.stringify(param);
    return this.query({ url: `i18n-langs?${query}` });
  }
}

export default I18nLangs;
