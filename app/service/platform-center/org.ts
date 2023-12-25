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
import * as qs from 'qs';
import { E_Method } from '../../lib/enum';
import { I_CreateOrgParam, I_Response } from '../../lib/interface';
import DataServcice from '../dataService';

class Org extends DataServcice {
  private base = 'tenants';

  // 查询组织详情
  async findOne(param: any): Promise<I_Response> {
    const orgList: I_Response = await this.find(param);
    return orgList.data.length ? orgList.data[0] : {};
  }

  // 创建一个组织
  create(param: I_CreateOrgParam) {
    return this.query({
      url: this.base,
      method: E_Method.Post,
      data: param
    });
  }

  // 修改一个组织
  update(param) {
    const { id } = param;
    return this.query({
      url: `${this.base}/${id}`,
      method: E_Method.Put,
      data: param
    });
  }

  // 删除一个组织
  del(id: string | number) {
    return this.query({
      url: `${this.base}/${id}`,
      method: E_Method.Delete
    });
  }

  // 综合查询列表
  async find(param): Promise<I_Response> {
    const query = typeof param === 'string' ? param : qs.stringify(param);
    const res: I_Response = await this.query({ url: `${this.base}?${query}` });
    if (Number(this.ctx.query.add_admin_info) !== 1) {
      return res;
    }
    const {list, admins } = res.data;
    const newList = this.getExtraAdminOrgList(list, admins);
    return this.ctx.helper.getResponseData(newList);
  }

  // 分页查询列表
  async list(param): Promise<I_Response> {
    const query = typeof param === 'string' ? param : qs.stringify(param);
    const res: I_Response = await this.query({url: `${this.base}/list?${query}`});
    if (Number(this.ctx.query.add_admin_info) !== 1) {
      return res;
    }
    const {list, admins, total} = res.data;
    const newList = this.getExtraAdminOrgList(list, admins);
    return this.ctx.helper.getResponseData({
      list: newList,
      total
    });
  }

  private getExtraAdminOrgList(list, extra) {
    const adminsMap = this.objectArray2Map(extra, 'unit_id', ['user']);
    return list.map(item => {
      item.extra = adminsMap.get(item.id);
      return item;
    });
  }

  /**
   * 归纳相同属性的对象数组为以对象某属性为key的map
   * @param {Array<any>} objs 对象数组
   * @param {string} objKey 对象中用来做map key的属性名
   * @param {Array<string>} attrs 需要保存到map value 数组中的属性值
   * @return { Map<K,V> } 返回map
  */
  objectArray2Map(objs: Array<any>, objKey: string, attrs?: Array<string> ): Map<any, Array<any>> {
    const map = new Map();
    objs.forEach((obj) => {
      const key = obj[objKey] ?? 'N/A';
      let val: Array<any> = map.get(key);
      val = val || [];
      const item = attrs ? this.getObjectPartAttrs(obj, attrs) : obj;
      val.push(item);
      map.set(key, val);
    });
    return map;
  }

  // 根据数组属性值集合，过滤对象值
  getObjectPartAttrs(target: any, attrs: Array<string>): any {
    const res = {};
    for (const attr of attrs) {
      res[attr] = target[attr];
    }
    return res;
  }
}

export default Org;
