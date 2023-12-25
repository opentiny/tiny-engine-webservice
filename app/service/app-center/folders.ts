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
import { E_ErrorCode, E_Method } from '../../lib/enum';
import { I_CreatePageParam, I_Response, I_UpdatePageParam } from '../../lib/interface';
import DataService from '../dataService';
const numberReg = /^[0-9]+$/;
class Folders extends DataService {
  protected paramKeys: string[] = ['isBody', 'parentId', 'isPage'];
  protected resKeys: string[] = ['is_body', 'parent_id', 'is_page'];
  getFolder(id: number | string) {
    return this.fQuery({
      url: `pages/${id}`
    });
  }

  async del(id: number | string) {
    // 这里只需要判断page表中是否存在子节点即可
    const subFolders = await this.find(`parent_id=${id}`);
    const hasSubFolder = this.verifyDeletion(subFolders);
    if (hasSubFolder) {
      return hasSubFolder;
    }

    return await this.fQuery({
      url: `pages/${id}`,
      method: E_Method.Delete
    });
  }

  async create(param: I_CreatePageParam) {
    const { parentId } = param;
    // 通过parentId 计算depth
    const depthInfo: any = await this.getDepth(parentId);
    if (depthInfo.error) {
      return depthInfo;
    }
    const { depth } = depthInfo;
    const params = {
      ...param,
      parentId: Number(parentId),
      depth: depth + 1
    };
    return await this.fQuery({
      url: 'pages',
      method: E_Method.Post,
      data: params
    });
  }

  async update(param: I_UpdatePageParam): Promise<I_Response> {
    const { parentId } = param;
    // 校验parentId 带来的深度改变
    if (parentId !== undefined && parentId !== null) {
      const depthInfo = await this.verifyParentId(parentId);
      if (depthInfo.error) {
        return depthInfo;
      }
      param.depth = depthInfo.depth + 1;
    }
    const parentInfo = await this.getFolder(param.id);
    const { folderTree } = this.ctx.service.appCenter;
    if (parentInfo.error) {
      return parentInfo;
    }
    const updateParams = {
      url: `pages/${param.id}`,
      method: E_Method.Put,
      data: param
    };
    // 当更新参数中没有depth 或 depth没有发生改变时
    if (!param.depth || Number(param.depth) === Number(parentInfo.data.depth)) {
      return await this.fQuery(updateParams);
    }

    // 当文件夹改变父级且没有平级移动时
    const updateParam = await folderTree.getUpdateTree(param.id, Number(param.depth));
    // 文件夹没有子项，不涉及子文件夹变更
    if (updateParam === 'N/A') {
      return await this.fQuery(updateParams);
    }
    const bulkUpdateParam = {
      url: 'pages/raw',
      method: E_Method.Post,
      data: {
        res: updateParam,
        app: parentInfo.data.app
      }
    };
    const tasks = [this.fQuery(updateParams), this.query(bulkUpdateParam)];

    const results: Array<I_Response> = await Promise.all(tasks).catch((e) => {
      return [folderTree.getErrorRes(e.message ?? '执行出错', E_ErrorCode.Fail)];
    });
    for (const res of results) {
      if (res.error) {
        return res;
      }
    }

    return results[0];
  }

  private verifyDeletion(res: I_Response): I_Response | false {
    const { folderTree } = this.ctx.service.appCenter;
    const forbidenRes = folderTree.getErrorRes('Deletion is prohibited', E_ErrorCode.Forbidden);
    if (res.error) {
      return res;
    }
    if (res.data.length) {
      return forbidenRes;
    }
    return false;
  }

  private async verifyParentId(parentId): Promise<any> {
    const { folderTree } = this.ctx.service.appCenter;
    if (numberReg.test(parentId)) {
      return await this.getDepth(parentId);
    }
    return folderTree.getErrorRes('parentId is invalid');
  }

  private async getDepth(parentId: number | string): Promise<any> {
    const { folderTree } = this.ctx.service.appCenter;
    if (Number(parentId) === 0) {
      return { depth: 0 };
    }
    let parentInfo: I_Response = await this.getFolder(parentId);
    if (parentInfo.error) {
      if (/404/.test(parentInfo.error.message)) {
        parentInfo = folderTree.getErrorRes('parent does not exist', E_ErrorCode.NotFound);
      }
      return parentInfo;
    }
    const { depth } = parentInfo.data;
    if (depth < this.app.config.maxFolderDepth) {
      return { depth };
    }
    return folderTree.getErrorRes('Exceeded depth');
  }

  async find(param) {
    const query = typeof param === 'string' ? param : qs.stringify(param);
    return await this.fQuery({ url: `pages?${query}` });
  }
}

export default Folders;
