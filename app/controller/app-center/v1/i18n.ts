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
import { createEntriesRule, updateEntryRule } from '../i18n';

const API_VERSION = 'v1';



export default class I18nV1Controller extends Controller {
  private versionService = this.service.appCenter[API_VERSION];

  async createEntries() {
    const { body } = this.ctx.request;
    this.ctx.validate(createEntriesRule, body);
    this.ctx.body = await this.versionService.i18nEntries.batchCreate(body);
  }

  async updateEntry() {
    const { body } = this.ctx.request;
    this.ctx.validate(updateEntryRule, body);
    this.ctx.body = await this.versionService.i18nEntries.batchUpdate(body);
  }
}