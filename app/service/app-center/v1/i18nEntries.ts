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
import I18nEntries from '../i18nEntries';
import { I_OperateI18nBatchEntries, I_OperateI18nEntries } from '../../../lib/interface';
import { E_Method } from '../../../lib/enum';

export default class I18nEntriesV1 extends I18nEntries {
    batchCreate(params: I_OperateI18nBatchEntries) {
        const entries = this.formateBatchCreateParams(params);
        return this.query({
            url: 'i18n-entries/bulk/create',
            method: E_Method.Post,
            data: {
                version: 'v1',
                entries
            }
        });
    }

    async batchUpdate(params: I_OperateI18nEntries) {
      const { host, host_type, key } = params;
      const entries = this.formateBatchUpdateParams(params);
      let url = 'i18n-entries';
      let method = E_Method.Put;
      if (host_type === 'app') {
        const existEntries = await this.find({ host, host_type, key });
        if (!existEntries.data.length) {
          url = 'i18n-entries/bulk/create';
          method = E_Method.Post;
        }
      }

      return this.query({
        url,
        method,
        data: {
          version: 'v1',
          entries
        }
      });
    }

    private formateBatchCreateParams(params: I_OperateI18nBatchEntries) {
        const {entries, host, host_type} = params;
        const formatedEntries = {};
    
        (entries as Array<any>).forEach(({contents, key}) => {
          const contentKeys = Object.keys(contents);
          for (const contentKey of contentKeys) {
            const entryItem = {
              key,
              host,
              host_type,
              content: contents[contentKey]
            };
            formatedEntries[contentKey] = formatedEntries[contentKey] ?? [];
            formatedEntries[contentKey].push(entryItem);
          }
        });
    
        return formatedEntries;
    }

    private formateBatchUpdateParams(params: I_OperateI18nEntries) {
      const { host, host_type, key, contents } = params;
      const langs = Object.keys(contents);
      const formatedEntries = {};
      langs.forEach((lang) => {
        formatedEntries[lang] = formatedEntries[lang] ?? [];
        formatedEntries[lang].push({
          host,
          host_type,
          key,
          content: contents[lang]
        });
      });
      return formatedEntries;
    }
}
