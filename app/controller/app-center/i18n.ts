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

const idValidateRule = {
  id: {
    type: 'id',
    required: true,
  }
};
const createLangRule = {
  lang: {
    type: 'string',
    required: true,
  },
  label: {
    type: 'string',
    required: true,
  }
};

const hostRule = {
  host: {
    type: 'id',
    required: true,
  },
  host_type: {
    type: 'enum',
    values: ['app', 'block'],
    required: true,
  }
};

const delEntryRule = {
  key_in: {
    type: 'array',
    itemType: 'string',
  },
  ...hostRule
};

const createLangEntryRule = {
  ...hostRule,
  key: {
    type: 'string',
    required: true,
  },
  content: {
    type: 'string',
    required: true,
  },
  lang: {
    type: 'id',
    required: true,
  }
};

export const updateEntryRule = {
  ...hostRule,
  key: {
    type: 'string',
    required: true,
  },
  contents: {
    type: 'object',
    required: true,
  }
};
const createEntryRule = updateEntryRule;

export const createEntriesRule = {
  host: {
    type: 'id',
    required: true,
  },
  host_type: {
    type: 'enum',
    values: ['app', 'block'],
    required: true,
  },
  entries: {
    type: 'array',
    itemType: 'object',
    rule: {
      contents: 'object',
      key: 'string',
    },
    required: true,
  }
};

/**
 * @controller PagesController
 */
class I18nController extends Controller {
  /**
   * @router get /api/i18n/langs  筛选
   * @summary 国际化语言列表 可筛选
   */
  async langs() {
    const { i18nLangs } = this.ctx.service.appCenter;
    this.ctx.body = await i18nLangs.find(this.ctx.query);
  }

  /**
   * @router get /api/i18n/langs/:id  路径
   * @summary 语言信息
   * @description 获取改国际化语言的详情
   */
  async langDetail() {
    const { id } = this.ctx.params;
    this.ctx.validate(idValidateRule, { id });
    const { i18nLangs } = this.ctx.service.appCenter;
    this.ctx.body = await i18nLangs.getLang(id);
  }

  /**
   * @router get /api/i18n/langs/delete/:id  路径
   * @summary 删除语言
   * @description 删除该id的语言
   */
  async delLang() {
    const { id } = this.ctx.params;
    this.ctx.validate(idValidateRule, { id });
    const { i18nLangs } = this.ctx.service.appCenter;
    this.ctx.body = await i18nLangs.del(id);
  }

  /**
   * @router post /api/i18n/langs/create  路径
   * @summary 创建语言
   */
  async createLang() {
    const { body } = this.ctx.request;
    this.ctx.validate(createLangRule, body);
    const { i18nLangs } = this.ctx.service.appCenter;
    this.ctx.body = await i18nLangs.create(body);
  }

  /**
   * @router post /api/i18n/langs/update/:id  路径
   * @summary 修改国际化语言
   */
  async updateLang() {
    const { id } = this.ctx.params;
    this.ctx.validate(idValidateRule, { id });
    const { body } = this.ctx.request;
    const { i18nLangs } = this.ctx.service.appCenter;
    body.id = id;
    this.ctx.body = await i18nLangs.update(body);
  }

  /**
   * @router get /api/i18n/entries  筛选
   * @summary 国际化词条列表 可筛选
   */
  async entries() {
    const { i18nEntries } = this.ctx.service.appCenter;
    this.ctx.body = await i18nEntries.list(this.ctx.query);
  }

  /**
   * @router get /api/i18n/entries/:id  路径
   * @summary 词条信息
   * @description 获取改国际化语言的详情
   */
  async langEntryDetail() {
    const { id } = this.ctx.params;
    this.ctx.validate(idValidateRule, { id });
    const { i18nEntries } = this.ctx.service.appCenter;
    this.ctx.body = await i18nEntries.getEntry(id);
  }

  /**
   * @router get /api/i18n/entries/delete/:id  路径
   * @summary 删除单语言词条
   * @description 删除该id的词条
   */
  /* istanbul ignore next */
  async delLangEntry() {
    const { id } = this.ctx.params;
    this.ctx.validate(idValidateRule, { id });
    const { i18nEntries } = this.ctx.service.appCenter;
    this.ctx.body = await i18nEntries.del(id);
  }

  /**
   * @router get /api/i18n/entries/bulk/delete  路径
   * @summary 删除多语言词条
   * @description 删除该id的词条
   */
  async delEntry() {
    this.ctx.validate(delEntryRule, this.ctx.request.body);
    const { i18nEntries } = this.ctx.service.appCenter;
    this.ctx.body = await i18nEntries.bulkDel(this.ctx.request.body);
  }

  /**
   * @router post /app-center/api/apps/:id/i18n/entries/multiUpdate  路径
   * @summary 应用下批量上传国际化词条文件
   * @description 上传多个国际化词条文件，文件名为语种，如en_US,内容为词条json，可能有多层，拍平存入
   */
  async updateI18nMultiFile() {
    const ctx = this.ctx;
    const host = this.ctx.params.id;
    this.ctx.validate(
      {
        host: 'id',
      },
      { host }
    );
    const parts = ctx.multipart();
    const  res = await this.ctx.service.appCenter.i18nEntries.readFilesAndbulkCreate(parts, host);
    this.ctx.body = res;
  }

  /**
   * @router post /app-center/api/apps/:id/i18n/entries/update  路径
   * @summary 应用下单文件上传国际化词条文件
   * @description 上传单个个国际化词条json文件或zip压缩包，json文件名为语种，如en_US,内容为词条json，可能有多层，拍平存入; zip 文件加压后需要为国际化语言的json文件集合
   */
  async updateI18nSingleFile() {
    const ctx = this.ctx;
    const host = this.ctx.params.id;
    this.ctx.validate(
      {
        host: 'id',
      },
      { host }
    );
    const fileStream = await ctx.getFileStream();
    this.ctx.body = await this.ctx.service.appCenter.i18nEntries.readSingleFileAndBulkCreate(fileStream, host);
  }


  /**
   * @router post
   * @summary 创建单语言词条
   */
  /* istanbul ignore next */
  async createLangEntry() {
    const { body } = this.ctx.request;
    this.ctx.validate(createLangEntryRule, body);
    const { i18nEntries } = this.ctx.service.appCenter;
    this.ctx.body = await i18nEntries.create(body);
  }

  /**
   * @router post /api/i18n/entries/update/:id  路径
   * @summary 修改国际化单语言词条
   */
  async updateLangEntry() {
    const { id } = this.ctx.params;
    this.ctx.validate(idValidateRule, { id });
    const { body } = this.ctx.request;
    const { i18nEntries } = this.ctx.service.appCenter;
    // 删除掉约束词条的数据归属的信息
    delete body.host;
    delete body.host_type;
    body.id = id;
    this.ctx.body = await i18nEntries.update(body);
  }

  /**
   * @router post /api/i18n/entries/update 路径
   * @summary 修改国际化多语言词条
   */
  async updateEntry() {
    const { body } = this.ctx.request;
    this.ctx.validate(updateEntryRule, body);
    this.ctx.body = await this.service.appCenter.i18nEntries.bulkUpdate(body);
  }

  /**
   * @router post /api/i18n/entries/create 路径
   * @summary 创建国际化多语言词条
   */
  async createEntry() {
    const { body } = this.ctx.request;
    this.ctx.validate(createEntryRule, body);
    this.ctx.body = await this.service.appCenter.i18nEntries.bulkCreate(body);
  }

  /**
   * @router post /api/i18n/entries/batch/create 路径
   * @summary 批量创建国际化多语言词条
   */
  async createEntries() {
    const { body } = this.ctx.request;
    this.ctx.validate(createEntriesRule, body);
    this.ctx.body = await this.service.appCenter.i18nEntries.bulkCreate(body);
  }
}

export default I18nController;
