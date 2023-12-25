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
import { E_Method, E_i18Belongs, E_I18nLangs } from '../../lib/enum';
import { I_AppComplexInfo, I_Response } from '../../lib/interface';
import { I_UpdateAppParam } from '../../interface/app-center/app';
import DataService from '../dataService';
class Apps extends DataService {
  async getAppById(id: number | string) {
    
    const  res = await this.findOne({ id });
    
    if (res.data) {
      res.data = this.convertRes(res.data);
    }
    return res;
  }

  async updateApp(param: I_UpdateAppParam) {
    const id = param.id;
    const updateParams = { ...param };

    // 如果更新extend_config字段，从platform获取数据，继承非route部分
    if (param.extend_config) {
      const app = await this.findOne({ id });
      const { route, ...rest } = app.data.platform['app_extend_config'] || {};
      updateParams.extend_config = { ...param.extend_config, ...rest };
    }
    const res = await this.query({
      url: `apps/${id}`,
      method: E_Method.Put,
      data: updateParams
    });
    if (res.data) {
      res.data = this.convertRes(res.data);
    }
    return res;
  }


  async getI18n(appId: string | number): Promise<I_Response> {
    const { i18nEntries, materials } = this.ctx.service.appCenter;
    // 获取应用下的词条
    const appEntriesData: I_Response = await i18nEntries.find({
      host: appId,
      host_type: 'app'
    });
    const appEntries = await this.formatI18nEntrites(appEntriesData, E_i18Belongs.APP, appId);
    if (appEntries.error) {
      return appEntries;
    }

    // 获取区块词条
    // （区块在被没有放入区块组时不能被页面使用，所以获取到区块组即可得到该应用关联的全部区块）
    const { blockIds, entries: blockEntriesData } = await materials.getBlockGroupI18nEntries(appId);
    const blockEntries = await this.formatI18nEntrites(blockEntriesData, E_i18Belongs.BLOCK, blockIds);
    if (blockEntries.error) {
      return blockEntries;
    }
    // 合并应用 区块词条
    const entries = this.mergeEntries(appEntries, blockEntries);
    // 获取默认语言
    const res: I_Response = await this.findOne({ id: appId });
    entries.default_lang = res.data?.default_lang;
    return this.ctx.helper.getResponseData(entries);
  }

  // 修改应用的国际化关联
  updateI18n(id: string | number, i18n_langs: Array<number>): Promise<I_Response> {
    return this.query({
      url: `apps/i18n/${id}`,
      method: E_Method.Post,
      data: { i18n_langs }
    });
  }

  


  async findOne(param: any) {
    return this.query({ url: `apps/${param.id}` });
  }

  // 画布锁
  lockCanvas(param: any) {
    const { id, state, type } = param;
    const ctrl = type === 'block' ? 'blocks' : 'pages';
    return this.query({
      url: `${ctrl}/lock/${id}?state=${state}`,
      method: E_Method.Put
    });
  }

  // 获取区块schema必备数据
  schemaMeta(appId: string | number, query?): Promise<I_Response> {
    const queryStr = typeof query === 'string' ? query : qs.stringify(query);
    return this.query({
      url: `apps/schema/${appId}?${queryStr}`
    });
  }


  /**
   * 序列化国际化词条
   * @param { I_Response } entriesData 国际化词条标准请求返回数据
   * @param { E_i18Belongs } userdIn 国际化词条从属单元 （应用或区块）
   * @param { Array<number> | number | string } id 应用id或区块id或区块id集合
  */
  async formatI18nEntrites(entriesData: I_Response, userdIn: E_i18Belongs, id: Array<number> | number | string): Promise<any> {
    const entries = entriesData.data;
    // 中文和英文作为全局国际化语言，并没有和应用/区块建立关联关系
    const defaultLang = [
      { lang: E_I18nLangs.zh_CN },
      { lang: E_I18nLangs.en_US }
    ];
    if (!entries.length) {
      const relationLangs = {};

      // 没有词条的时候，查询应用和区块对应的国家化关联，把默认空的关联分组返回
      if (userdIn === E_i18Belongs.APP) {
        const appId = Array.isArray(id) ? id[0] : id;
        const appData = await this.getAppById(Number(appId));
        const appLangs = (appData.data?.i18n_langs ?? []).concat(defaultLang);
        appLangs.forEach(item => {
          if (item.lang) {
            relationLangs[item.lang] = {};
          }
        });
      } else {
        const blocks = await this.service.materialCenter.block.findI18nLangsWithBlocks([Number(id)]);
        const langsSet: Set<string> = new Set();
        blocks.data?.forEach(block => {
          const blockLangs = (block.i18n_langs ?? []).concat(defaultLang);
          blockLangs.forEach(i18n_lang => {
            langsSet.add(i18n_lang.lang);
          });
        });
        Array.from(langsSet).forEach(item => {
          if (item) {
            relationLangs[item] = {};
          }
        });
      }
      return relationLangs;
    }

    const res = {};
    entries.forEach((entry) => {
      const {
        key,
        lang: { lang },
        content
      } = entry;
      res[lang] = res[lang] || {};
      res[lang][key] = content;
    });
    return res;
  }

  mergeEntries(appEntries, blockEntries) {
    const res = JSON.parse(JSON.stringify(blockEntries));
    if (!appEntries || !blockEntries) {
      return appEntries || blockEntries;
    }
    // 遇到相同的key，用应用的词条覆盖区块的
    Object.keys(appEntries).forEach(lang => {
      const langEntries = appEntries[lang];
      Object.keys(langEntries).forEach(key => {
        // 有可能这个应用下面没有任何区块分组
        res[lang] = res[lang] || {};
        res[lang][key] = langEntries[key];
      });
      // 如果区块没有这个国际化分组，把应用的合并进来
      if (!res[lang]) {
        res[lang] = langEntries;
      }
    });

    return res;
  }

  // 计算应用必要元素的hash值，并返回应用的schema 等信息
  async calculateHashValue(appId: string | number): Promise<I_AppComplexInfo> {
    const { schema, detail, platform, meta } = await this.getAppKeyData(appId);
    const extendIds = platform;
    const appExtendConfig = detail['extend_config'];
    // 回填应用 data_hash数据会更新应用的update_at字段，需要删除 应用schema中的更新时间的字段 gmt_modified
    const schemaCopy = JSON.parse(JSON.stringify(schema));
    delete schemaCopy?.meta?.gmt_modified;
    const hash = this.service.convertMD5Value.getHexHash({
      schema: schemaCopy,
      extendIds,
      appExtendConfig
    });
    const { data_hash } = detail;
    const isChanged = hash !== data_hash;
    this.logger.info(`ID: ${appId} 应用关键数据hash, 新(${hash})旧(${data_hash})是否不同:`, isChanged);
    if (isChanged) {
      // 更新应用表中的hash值
      await this.updateApp({
        id: appId,
        data_hash: hash
      });
    }

    return {
      hash,
      meta,
      schema,
      appInfo: detail,
      isChanged
    };
  }

  // 计算应用下有多少页面/文件夹
  async getAppSubCount(appId: number): Promise<I_Response | number> {
    const pageRes = await this.service.appCenter.pages.find({
      _limit: -1,
      is_page: true,
      app: appId
    });
    return pageRes.data?.length ?? 0;
  }

  // 获取应用预览数据
  async getAppPreviewMetaData(appId: number | string) {
    const appMetaData: I_Response = await this.schemaMeta(appId, {
      part: ['i18n', 'source', 'extension']
    });
    const { i18n: i18nEntries, source = [], extension = [], app } = appMetaData.data;
    // 拼装数据源
    const dataSource = {
      list: source,
      dataHandler: app['data_handler']
    };
    // 拼装工具类
    const utils: Array<any> = [];
    extension.forEach(item => {
      const { name, type, content, category } = item;
      const data = { name, type, content };
      if (category === 'utils') {
        utils.push(data);
      }
    });
    // 拼装国际化词条
    const entriesData: I_Response = this.ctx.helper.getResponseData(i18nEntries);
    const i18n = await this.formatI18nEntrites(entriesData, E_i18Belongs.APP, appId);
    return this.ctx.helper.getResponseData({
      dataSource,
      globalState: app['global_state'],
      utils,
      i18n
    });
  }

  async associate(param: any) {
    const query = typeof param === 'string' ? param : qs.stringify(param);
    return this.query({ url: `apps/associate/blocks?${query}` });
  }

  private async getAppKeyData(appId: string | number): Promise<any> {
    /**
     * 计算要素：
     * 1. 应用schema
     * 2. 应用详情中的extend_config
     * 3. 应用所属设计器中应用扩展变化：app_extend
    */
    const { appSchema } = this.service.appCenter;
    const appSchemaData = await appSchema.getSchema(appId);
    const appData = await this.getAppById(appId);
    
    return {
      schema: appSchemaData.data,
      detail: appData.data,
      meta: appSchema.meta,
      platform: {}
    };
  }

  private convertRes(data) {
    return this.ctx.helper.convertAppResFieldType(data);
  }

  
}

export default Apps;
