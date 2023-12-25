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
import { E_ErrorCode } from '../../lib/enum';
import { I_Response } from '../../lib/interface';
import DataService from '../dataService';

interface Collection {
  range: Array<number | string>;
  data: Array<Array<any>>;
}

interface I_GetTreeNodes {
  pids: Array<string | number>;
  level: number;
  collection: Collection;
}

class FolderTree extends DataService {
  public folderService = this.service.appCenter.folders;
  // 获取 parentId 数组下的所有子节点
  async getChildrenId(pids: Array<string | number>): Promise<any> {
    const qString: string = pids.map((id) => `parent_id=${id}`).join('&');
    const children: I_Response = await this.folderService.find(qString);
    if (children.error) {
      return children;
    }
    if (!children.data.length) {
      return [];
    }
    return children.data.map((child) => child.id);
  }

  // 主函数
  async getUpdateTree(pid: string | number, target: number): Promise<string | I_Response> {
    const collection: Collection = {
      range: [],
      data: []
    };
    const res = await this.getTreeNodes({
      collection,
      pids: [pid],
      level: target + 1
    });
    if (res.error) {
      return res;
    }
    if (!res.range.length) {
      return 'N/A';
    }
    return res;
  }

  // 拼装失败信息
  getErrorRes(message: string, errorCode?: E_ErrorCode): I_Response {
    const code = errorCode || E_ErrorCode.BadRequest;
    const error = {
      code,
      message
    };
    return this.ctx.helper.getResponseData(null, error);
  }

  // 计算当前parent的深度信息
  private async getTreeNodes(param: I_GetTreeNodes): Promise<any> {
    const { pids, level, collection } = param;
    // 没有子节点，返回收集的节点信息
    if (!pids.length) {
      return collection;
    }
    // 当前的节点深度超过 配置的最大深度，返回失败信息
    if (level > this.config.maxFolderDepth) {
      return this.getErrorRes('Exceeded depth');
    }
    // 获取子节点的id
    const childrenId = await this.getChildrenId(pids);
    // 子节点获取失败
    if (childrenId.error) {
      return childrenId;
    }
    // 收集 id depth 信息
    const dps = childrenId.map((id) => [id, level]);
    collection.range = collection.range.concat(childrenId);
    collection.data = collection.data.concat(dps);
    // 递归
    return this.getTreeNodes.bind(this)({
      pids: childrenId,
      level: level + 1,
      collection
    });
  }
}

export default FolderTree;
