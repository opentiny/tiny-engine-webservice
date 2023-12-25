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
import { Controller } from 'egg';
import { I_Response } from '../../lib/interface';
import { E_ErrorCode } from '../../lib/enum';

const numberReg = /^[0-9]+$/;
/**
 * @controller PageHistoriesController
 */
class PageHistoriesController extends Controller {
  async find() {
    const { page } = this.ctx.request.query;
    if (!numberReg.test(page)) {
      this.ctx.body = this.getMissingParamsRes('page id is integer and required');
    } else {
      this.ctx.body = await this.service.appCenter.pageHistories.find(this.ctx.query);
    }
  }

  /**
   * @router get api/pages/histories/:id 路径
   * @summary 页面历史记录信息
   * @description 获取该页面历史记录
   */
  async detail() {
    const { id } = this.ctx.params;
    const { pageHistories } = this.ctx.service.appCenter;

    if (id && !numberReg.test(id)) {
      this.ctx.body = this.getMissingParamsRes('page id is integer and required');
    } else {
      this.ctx.body = await pageHistories.getHistory(id);
    }
  }

  /**
   * @router get  /api/pages/histories/delete/:id  路径
   * @summary 删除应用
   * @description 删除应用
   */
  async del() {
    const { id } = this.ctx.params;
    const { pageHistories } = this.ctx.service.appCenter;

    if (id && !numberReg.test(id)) {
      this.ctx.body = this.getMissingParamsRes('page id is integer and required');
    } else {
      this.ctx.body = await pageHistories.del(id);
    }
  }

  /**
   * @router post  /api/pages/histories/create  路径
   * @summary 新建页面历史记录
   * @description 新建页面历史记录
   */
  async create() {
    const { body } = this.ctx.request;
    const { pageHistories } = this.ctx.service.appCenter;
    const { page, page_content } = body;

    if (page !== undefined && numberReg.test(page) && page_content) {
      this.ctx.body = await pageHistories.create(body);
    } else {
      this.ctx.body = this.getMissingParamsRes('The request body is missing some parameters');
    }
  }

  private getMissingParamsRes(message: string): I_Response {
    const error = {
      code: E_ErrorCode.BadRequest,
      message
    };
    return this.ctx.helper.getResponseData(null, error);
  }
}

export default PageHistoriesController;
