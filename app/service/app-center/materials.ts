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
import { I_Response } from '../../lib/interface';
import DataService from '../dataService';

class Materials extends DataService {
  findBlockGroup(param): Promise<I_Response> {
    const query = qs.stringify(param);
    return this.query({ url: `block-groups?${query}` });
  }

  async getBlockGroupI18nEntries(appId: number | string): Promise<any> {
    // 获取应用下的区块组
    const blockGroups: I_Response = await this.findBlockGroup({
      app: appId
    });
    let blockIds: Array<string | number> = [];
    // 从区块组中获取区块id
    blockGroups.data.forEach((group) => {
      const blockList: Array<any> = group.blocks;
      blockIds = blockIds.concat(blockList.map((block) => block.id));
    });
    blockIds = Array.from(new Set(blockIds));
    const entries = await this.getBlocksI18nEntries(blockIds);
    return {
      blockIds,
      entries,
    };
  }

  getBlocksI18nEntries(blockIds: Array<number | string>) {
    if (!blockIds.length) {
      return this.ctx.helper.getResponseData([]);
    }
    const { i18nEntries } = this.ctx.service.appCenter;
    let query = blockIds.map((id) => `host=${id}`).join('&');
    query = `${query}&host_type=block`;
    return i18nEntries.find(query);
  }

  findMaterialHistories(param: any) {
    const query = typeof param === 'string' ? param : qs.stringify(param);
    return this.query({
      url: `material-histories?${query}`
    });
  }

  async findMaterialHistory(param: any) {
    const histories = await this.findMaterialHistories(param);
    const data = histories.data.length ? histories.data[0] : {};
    return this.ctx.helper.getResponseData(data);
  }

  // 通过平台id获取物料信息
  async findMaterialHistoryByPid(pid: string | number): Promise<I_Response> {
    const res = await this.getPlatformInfo(pid);
    return this.ctx.helper.getResponseData(res.data.material_history);
  }

  // 通过应用id获取物料资产包信息
  async getAppMaterialHistory(appId: string | number): Promise<I_Response> {
    const { appCenter } = this.ctx.service;
    const appInfo: I_Response = await appCenter.apps.getAppById(appId);
    return this.findMaterialHistoryByPid(appInfo.data.platform?.id ?? 0);
  }

  // 获取平台信息
  async getPlatformInfo(pid: string | number) {
    return this.query({
      url: `platforms/${pid}`
    });
  }
}

export default Materials;
