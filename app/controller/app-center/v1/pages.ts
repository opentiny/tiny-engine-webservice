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
import { dslCodeRule, updateFolderRule, updatePageRule, schema2codeRuleV1 } from '../../../validate/app-center/pages';
import { E_Schema2CodeType } from '../../../lib/enum';

const API_VERSION = 'v1';

export default class PagesV1Controller extends Controller {
  /**
   * @router post v1/api/pages/update/:id  路径
   * @summary 修改页面 或 文件夹
   * @description 修改一个页面 或 文件夹
   * @request path integer id 页面id
   */
  async update() {
    const { id } = this.ctx.params;
    const { body } = this.ctx.request;
    const { pages, folders } = this.ctx.service.appCenter;
    this.ctx.validate({ id: 'id' }, { id });
    const { data: pageInfo } = await pages.getPageById(id);
    if (pageInfo.isPage) {
      const updatePageRuleV1 = {
        ...updatePageRule, content_blocks: {
          type: 'array',
          itemType: 'object',
          required: false,
          rule: {
            block: {
              type: 'int',
              required: true
            },
            version: {
              type: 'string',
              required: true
            }
          }
        }
      };
      // 更新页面
      const updatePageParam = this.ctx.helper.pickObject(
        { id, ...body },
        ['id', 'isBody', 'isHome', 'message', 'name', 'parentId', 'route', 'page_content', 'content_blocks']
      );
      this.ctx.validate(updatePageRuleV1, updatePageParam);
      this.ctx.body = await pages.updatePage(updatePageParam);
    } else {
      // 更新文件夹
      const updateFolderParam = this.ctx.helper.pickObject(
        { id, ...body },
        ['id', 'name', 'parentId', 'route']
      );
      this.ctx.validate(updateFolderRule, updateFolderParam);
      this.ctx.body = await folders.update(updateFolderParam);
    }
  }

  /**
   * @router GET v1/api/code
   * @summary 获取页面或者区块的代码
   */
  async dslCode() {
    const { type, id, history, app } = this.ctx.query;
    const versionService = this.service.appCenter[API_VERSION];
    this.ctx.validate(dslCodeRule, this.ctx.query);
    this.ctx.body = await versionService.pages.getOutcome({
      type: (type as E_Schema2CodeType),
      id,
      app,
      history
    });
  }

  /**
   * @router GET v1/api/schema2code
   * @summary 获取页面代码
   */
  async schema2code() {
    this.ctx.validate(schema2codeRuleV1, this.ctx.request.body);
    const { app, pageInfo } = this.ctx.request.body;
    const versionService = this.service.appCenter[API_VERSION];
    this.ctx.body = await versionService.pages.schema2code(app, pageInfo);
  }
}