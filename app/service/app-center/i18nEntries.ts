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
import { pipeline } from 'stream';
import fs from 'fs-extra';
import * as path from 'path';
import { promisify } from 'util';
import { StatusCodes } from 'http-status-codes';
import * as compressing from 'compressing';
import { glob } from 'glob';
import sendToWormhole from 'stream-wormhole';
import { v4 as uuidv4 } from 'uuid';
import { throwApiError } from '../../lib/ApiError';
import { E_AppErrorCode, E_Method, E_MimeType } from '../../lib/enum';
import {
  I_OperateI18nEntries,
  I_Response,
  I_UpdateI18nLangEntry,
  I_CreateI18nLangEntry,
  I_OperateI18nEntry,
  I_OperateI18nBatchEntries,
  I_DeleteI18nEntry
} from '../../lib/interface';
import DataService from '../dataService';

const pump = promisify(pipeline);
class I18nEntries extends DataService {
  getEntry(id: number | string) {
    return this.query({
      url: `i18n-entries/${id}`
    });
  }

  del(id: number | string) {
    return this.query({
      url: `i18n-entries/${id}`,
      method: E_Method.Delete
    });
  }

  create(param: I_CreateI18nLangEntry) {
    // 校验当前app|block是否支持该类型语言
    return this.query({
      url: 'i18n-entries',
      method: E_Method.Post,
      data: param
    });
  }

  update(param: I_UpdateI18nLangEntry): Promise<I_Response> {
    // 校验当前词条所在的应用|区块是否支持该语言
    return this.query({
      url: `i18n-entries/${param.id}`,
      method: E_Method.Put,
      data: param
    });
  }

  find(param) {
    const query = typeof param === 'string' ? param : qs.stringify(param);
    return this.query({ url: `i18n-entries?${query}` });
  }

  async list(param) {
    // 获取所属应用/区块的 语言列表
    const langs = await this.getHostLangs();
    if (langs.error) {
      return langs;
    }
    // 获取词条列表
    const entries = await this.find(param);
    if (entries.error) {
      return entries;
    }
    const messages = this.formatEntriesList(entries);
    const locales = this.formatLangsList(langs);
    return this.ctx.helper.getResponseData({
      locales,
      messages
    });
  }

  bulkDel(params: I_DeleteI18nEntry) {
    return this.query({
      url: `i18n-entries/bulk/delete`,
      method: E_Method.Post,
      data: {
        params
      }
    });
  }

  async bulkCreate(params: I_OperateI18nEntries) {
    const entries: I_Response | Array<I_OperateI18nEntry> = await this.getEntriesParam(params);
    if (!Array.isArray(entries)) {
      return entries;
    }
    return this.query({
      url: 'i18n-entries/bulk/create',
      method: E_Method.Post,
      data: {
        entries
      }
    });
  }

  async bulkUpdate(params: I_OperateI18nEntries) {
    const { host, host_type, key } = params;
    if (host_type === 'app') {
      const existEntries = await this.find({ host, host_type, key });
      if (!existEntries.data.length) {
        return this.bulkCreate(params);
      }
    }

    const entries: I_Response | Array<I_OperateI18nEntry> = await this.getEntriesParam(params);
    if (!Array.isArray(entries)) {
      return entries;
    }
    return this.query({
      url: 'i18n-entries',
      method: E_Method.Put,
      data: {
        entries
      }
    });
  }

  // 批量上传词条数据
  async readFilesAndbulkCreate(parts, host): Promise<I_Response> {
    const entriesArr: Array<any> = [];
    let part: any;
    while (![null, undefined].includes(part = await parts())) {
      if (Array.isArray(part)) {
        continue;
      }
      const entriesItem = await this.parseJsonFileStream(part);
      entriesArr.push(entriesItem);
    }
    // 批量上传接口未提交任何文件流时报错
    if (!entriesArr.length) {
      throwApiError('', 200, E_AppErrorCode.CM307);
    }

    return this.bulkCreateOrUpdate(entriesArr, host);
  }

  // 上传单个文件
  async readSingleFileAndBulkCreate(fileStream, host): Promise<I_Response> {
    const { mime } = fileStream;
    let entriesArr: Array<any> = [];
    if (mime === E_MimeType.Json) {
      const entriesItem = await this.parseJsonFileStream(fileStream);
      entriesArr.push(entriesItem);
    } else {
      entriesArr = await this.parseZipFileStream(fileStream);
    }
    // 批量上传接口未提交任何文件流时报错
    if (!entriesArr.length) {
      throwApiError('', 200, E_AppErrorCode.CM307);
    }

    return this.bulkCreateOrUpdate(entriesArr, host);
  }

  // 解析zip 文件
  private async parseZipFileStream(fileStream): Promise<Array<any>> {
    const { filename, fieldname, encoding, mime } = fileStream;
    let entriesArr: Array<any> = [];
    this.logger.info(`parseZipFileStream field: ${fieldname}, filename:${filename}, encoding: ${encoding}, mime: ${mime}`);
    // 校验文件流合法性
    await this.validateFileStream(fileStream, E_AppErrorCode.CM314, [E_MimeType.Zip, E_MimeType.xZip]);
    // 解压zip文件
    const target = path.resolve(this.app.baseDir, '.tmp', `zip_${uuidv4()}`);
    try {
      await fs.ensureDir(path.parse(target).dir);
      await compressing.zip.uncompress(fileStream, target);
      // 提炼文件下的JSON文件
      entriesArr = await this.readJsonFile(target);
    } catch (err) {
      await sendToWormhole(fileStream);
      throwApiError((err as Error).message, StatusCodes.INTERNAL_SERVER_ERROR, E_AppErrorCode.CM309);
    } finally {
      await fs.remove(target);
    }

    return entriesArr;
  }

  // 解析json 文件
  private async parseJsonFileStream(fileStream) {
    const { filename, fieldname, encoding, mime } = fileStream;
    this.logger.info(`parseJsonFileStream field: ${fieldname}, filename:${filename}, encoding: ${encoding}, mime: ${mime}`);
    // 校验文件流合法性
    await this.validateFileStream(fileStream, E_AppErrorCode.CM308, [E_MimeType.Json]);
    // 解析国际化词条文件
    const entriesItem = {
      // fieldname 为i18n_langs的id
      lang: Number(fieldname),
      entries: {},
    };

    const jsonFileName = `${uuidv4()}_${filename.toLowerCase()}`;
    const target = path.resolve(this.config.baseDir, '.tmp', jsonFileName);
    try {
      await fs.ensureDir(path.parse(target).dir);
      const writeStream = fs.createWriteStream(target);
      await pump(fileStream, writeStream);
      const jsonData = await fs.readJson(target);
      entriesItem.entries = this.ctx.helper.flat(jsonData) || {};
    } catch (err) {
      await sendToWormhole(fileStream);
      throwApiError((err as Error).message, StatusCodes.INTERNAL_SERVER_ERROR, E_AppErrorCode.CM309);
    } finally {
      await fs.remove(target);
    }

    return entriesItem;
  }

  // 提炼文件夹下的全部json文件
  private async readJsonFile(folderPath: string) {
    // 获取全部的 json 文件
    const jsonFiles: Array<string> = await glob.sync('**/*.json', {
      cwd: folderPath
    });
    const entriesMap = new Map();

    for (const jsonFile of jsonFiles) {
      // 硬性规定 name 必须为 国际化语言编码，例如 zh_CN.json
      const { name } = path.parse(jsonFile);
      const jsonData = await fs.readJson(path.resolve(folderPath, jsonFile));
      const entries = this.ctx.helper.flat(jsonData) || {};
      const oldEntries = entriesMap.get(name) ?? {};
      entriesMap.set(name.toLocaleLowerCase(), { ...oldEntries, ...entries });
    }

    return this.formatEntriesMap(entriesMap);

  }

  // 序列化国际化词条map为入参数组
  private async formatEntriesMap(entriesMap: Map<string, any>): Promise<Array<any>> {
    const i18nLangs: I_Response = await this.ctx.service.appCenter.i18nLangs.find({});
    const langMap = new Map();
    const res: Array<any> = [];
    i18nLangs.data.forEach(({ id, lang }) => {
      langMap.set((lang as string).toLocaleLowerCase(), id);
    });

    for (const [key, value] of entriesMap) {
      res.push({
        lang: Number(langMap.get(key)),
        entries: value,
      });
    }

    return res;
  }

  /**
   * 校验文件流是否合法
   * @param { any } fileStream 文件流
   * @param { E_AppErrorCode } condition 报错码
   * @param { Array<E_MimeType> } mimeTypes 文件类型集合
   */
  private async validateFileStream(fileStream, code: E_AppErrorCode, mimeTypes: Array<E_MimeType>) {
    const { filename, fieldname, mime } = fileStream;
    const condition = filename && /^[0-9]+$/.test(fieldname) && mimeTypes.includes(mime);
    if (condition) {
      return;
    }
    // 只要文件不合法就throw error， 无论是批量还是单个
    await sendToWormhole(fileStream);
    throwApiError('', StatusCodes.BAD_REQUEST, code);
  }

  private bulkCreateOrUpdate(entriesArr, host): Promise<I_Response> {
    const entries: Array<any> = [];
    entriesArr.forEach(langEntry => {
      const keys = Object.keys(langEntry.entries);
      keys.forEach(key => {
        entries.push({
          key,
          lang: langEntry.lang,
          host,
          host_type: 'app',
          content: langEntry.entries[key],
        });
      });
    });
    return this.query({
      url: 'i18n-entries/bulk/insertOrUpdate',
      method: E_Method.Post,
      data: {
        entries,
      }
    });
  }


  // 格式化词条列表
  private formatEntriesList(entries: I_Response) {
    const list = entries.data;
    const messages = {};
    list.forEach((item) => {
      const { lang, key, content } = item;
      messages[lang.lang] = messages[lang.lang] ?? {};
      messages[lang.lang][key] = content;
    });
    return messages;
  }

  // 格式化语言列表
  private formatLangsList(langs: I_Response) {
    const list = langs.data;
    return list.map((item) => {
      const { lang, label } = item;
      return {
        lang,
        label
      };
    });
  }

  // 获取词条宿主支持的语言
  private getHostLangs() {
    // 先默认全部应用都支持中英文, 后续其他语言需要结合管理后台逻辑二次开发
    return this.service.appCenter.i18nLangs.find('lang=zh_CN&lang=en_US');
  }

  // 获取该词条下多语言的参数
  private async getEntriesParam(param: I_OperateI18nEntries): Promise<I_Response | Array<I_OperateI18nEntry>> {
    const langs = await this.getHostLangs();
    if (langs.error) {
      return langs;
    }
    return this.formatEntriesParam(param, langs.data as Array<any>);
  }

  // 格式化词条参数
  private formatEntriesParam(
    param: I_OperateI18nEntries | I_OperateI18nBatchEntries,
    langs: Array<any>
  ): Array<I_OperateI18nEntry> {
    const params: Array<I_OperateI18nEntry> = [];

    const { host, host_type } = param;

    const langsDic = {};
    langs.forEach((lang) => {
      langsDic[lang.lang] = lang.id;
    });

    if ((<I_OperateI18nBatchEntries>param).entries) {
      const { entries } = <I_OperateI18nBatchEntries>param;
      entries.forEach((entry) => {
        const { key, contents } = entry;
        this.fillParams({ contents, key, host, host_type }, langsDic, params);
      });
    } else {
      const { key, contents } = <I_OperateI18nEntries>param;
      this.fillParams({ contents, key, host, host_type }, langsDic, params);
    }
    return params;
  }

  private fillParams(entry: I_OperateI18nEntries, langsDic: {}, params: I_OperateI18nEntry[]) {
    const { contents, key, host, host_type } = entry;
    Object.keys(contents).forEach(item => {
      const lang = langsDic[item];
      // 接口限制传入语言必须以宿主支持的语言为准
      if (lang) {
        params.push({
          key,
          lang,
          content: contents[item],
          host,
          host_type
        });
      }
    });
  }
}

export default I18nEntries;
