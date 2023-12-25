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
import * as fs from 'fs-extra';
import * as qs from 'querystring';
import DataService from '../dataService';
import { E_ErrorCode, E_i18Belongs, E_MaterialErrorCode, E_Method } from '../../lib/enum';
import { I_Response } from '../../lib/interface';
import { ApiError } from '../../lib/ApiError';
import { I_CreateBlock, I_UpdateBlock } from '../../interface/material-center/block';

export default class BlockService extends DataService {
  private base = 'blocks';
  async listNew(queries) {
    const query = qs.stringify(queries);
    return this.query({
      url: `${this.base}/listNew?${query}`
    });
  }
  async list(param) {
    if (!param.appId) {
      const query = qs.stringify(param);
      return this.query({
        url: `${this.base}/list?${query}`
      });
    }
    return this.filterByBlockGroup(param);
  }
  create(param: I_CreateBlock) {
    return this.query({
      url: this.base,
      method: E_Method.Post,
      data: param
    });
  }
  update(param: I_UpdateBlock, query: any = null) {
    const { id } = param;
    let url = `${this.base}/${id}`;
    if (query) {
      url += `?${qs.stringify(query)}`;
    }
    return this.query({
      url,
      method: E_Method.Put,
      data: param
    });
  }
  async delete({ id }) {
    const materials: I_Response = await this.query({
      url: `${this.base}/${id}/materials`
    });
    if (materials.data?.count > 0) {
      throw new ApiError('', E_ErrorCode.BadRequest, E_MaterialErrorCode.CM203);
    } else {
      return this.query({
        url: `${this.base}/${id}`,
        method: E_Method.Delete
      });
    }
  }

  getBlocks(param) {
    const query = qs.stringify(param);
    return this.query({
      url: `${this.base}/list2?${query}`
    });
  }

  users(param) {
    const query = qs.stringify(param);
    return this.query({ url: `${this.base}/users?${query}` });
  }

  findById(id: number | string) {
    return this.query({ url: `${this.base}/${Number(id)}` });
  }

  find(param) {
    const query = typeof param === 'string' ? param : qs.stringify(param);
    return this.query({ url: `${this.base}?${query}` });
  }

  async findOne(param) {
    const res = await this.find(param);
    const blockInfo = res.data[0];
    if (!blockInfo) {
      return this.ctx.helper.getResponseData(blockInfo ?? null);
    }
    const { id: blockId } = blockInfo;
    blockInfo.i18n = await this.getBlockI18n(blockId);
    return this.ctx.helper.getResponseData(blockInfo);
  }

  findBlocksNotInGroup(id, queries) {
    return this.query({ url: `${this.base}/notgroup/${id}?${qs.stringify(queries)}` });
  }
  allTags() {
    return this.query({ url: `${this.base}/tags` });
  }

  lock(id, state) {
    return this.query({
      method: E_Method.Put,
      url: `${this.base}/lock/${id}?state=${state}`
    });
  }

  getBlockInfo(blockLabelName: string | string[], framework: string) {
    if (Array.isArray(blockLabelName)) {
      const query = blockLabelName
        .map((name) => {
          return `label=${name}`;
        })
        .concat(`framework=${framework}`)
        .join('&');
      return this.find(query);
    }
    return this.findOne(`label=${blockLabelName}&framework=${framework}`);
  }

  findContentBlocks(id) {
    return this.query({
      url: `blocks/contentblocks/${id}`
    });
  }

  // 获取区块分组中的区块id
  private async getAppBlocksId(app: number | string): Promise<Array<number>> {
    const blockGroups: I_Response = await this.service.materialCenter.blockGroup.tinyFind({ app });
    let blocks = [];
    for (const { blocks: gBlocks } of blockGroups.data) {
      blocks = blocks.concat(gBlocks);
    }
    const ids = blocks.map((item: any) => item.id);
    return Array.from(new Set(ids));
  }

  // 从区块分组的id中筛选列表数据
  private async filterByBlockGroup(param) {
    const ids: Array<number> = await this.getAppBlocksId(param.appId);
    delete param.appId;
    const list: I_Response = await this.query({
      url: `${this.base}/list?${qs.stringify(param)}`
    });
    return this.ctx.helper.getResponseData(list.data.filter((item) => ids.includes(item.id)));
  }

  // 获取区块国际化词条
  async getBlockI18n(blockId: string | number): Promise<any> {
    const { appCenter } = this.service;
    const i18nEntries = await appCenter.i18nEntries.find({
      host: blockId,
      host_type: 'block'
    });
    return appCenter.apps.formatI18nEntrites(i18nEntries, E_i18Belongs.BLOCK, blockId);
  }

  // 查找多个区块的国际化语种
  findI18nLangsWithBlocks(ids: Array<number>): Promise<I_Response> {
    return this.query({
      url: `${this.base}/i18nLangs/list?blocks=${ids.join(',')}`
    });
  }

  // 修改区块的国际化语种
  updateI18n(id: string | number, i18n_langs: Array<number>): Promise<I_Response> {
    return this.query({
      url: `${this.base}/i18n/${id}`,
      method: E_Method.Post,
      data: { i18n_langs }
    });
  }

  async getBlockAssets(pageContent, framework: string): Promise<any> {
    const blocks = [];
    this.traverseBlocks(pageContent, blocks);
    if (!blocks.length) {
      return {};
    }
    // 获取区块列表
    const list: I_Response = await this.getBlockInfo(blocks, framework);
    return list.data
      .map((b) => b.assets)
      .reduce(
        (a, b) => {
          return {
            material: [...a.material, ...(b?.material || [])],
            scripts: [...a.scripts, ...(b?.scripts || [])],
            styles: [...a.styles, ...(b?.styles || [])]
          };
        },
        {
          material: [],
          scripts: [],
          styles: []
        }
      );
  }
  /**
   * @description 将dataUrl形式的区块截图转换成文件上传OBS,上传obs 仅供参考，实际使用请替换为自己的存储服务
   * @param block 包含screenshot和label属性的对象
   * @returns 上传后的obs地址
   */
  async handleScreenshot(block: Pick<I_CreateBlock, 'screenshot' | 'label'>) {
    const { screenshot = '', label = '' } = block;
    if (!screenshot || !label) {
      this.logger.error('screenshot or label exception');
      return '';
    }
    const regex = /^data:.+\/(.+);base64,(.*)$/;
    const matches = screenshot.match(regex);
    if (!matches) {
      this.logger.error('screenshot data url format error');
      return '';
    }
    const ext = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');
    const fileName = `${label}_${Date.now()}.${ext}`;
    const imagePath = `${this.config.tmpPath.imageCache}/${fileName}`;
    await fs.outputFile(imagePath, buffer);
    // 上传
    const Key = `assets/images/block_screenshot/${label}/${fileName}`;
    await this.service.obs.upload({
      Key,
      SourceFile: imagePath
    });
    return `${this.config.obs.url}/${Key}`;
  }
  // 获取区块预览元数据
  async getBlockPreviewMetaData(blockId: number | string) {
    const blockInfoData: I_Response = await this.findById(blockId);
    const {
      content: { dataSource, utils }
    } = blockInfoData.data;
    const i18n = await this.getBlockI18n(blockId);
    return this.ctx.helper.getResponseData({
      dataSource,
      utils,
      i18n
    });
  }

  private traverseBlocks(schema, blocks) {
    if (Array.isArray(schema)) {
      schema.forEach((prop) => this.traverseBlocks(prop, blocks));
    } else if (typeof schema === 'object') {
      if (this.isBlock(schema) && !blocks.includes(schema.componentName)) {
        blocks.push(schema.componentName);
      }
      if (Array.isArray(schema.children)) {
        this.traverseBlocks(schema.children, blocks);
      }
    }
  }

  private isBlock(schema): boolean {
    return !!(schema && schema.componentType === 'Block');
  }
}
