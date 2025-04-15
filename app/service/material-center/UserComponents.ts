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
import { E_AppErrorCode, E_MimeType, E_Method } from '../../lib/enum';
import { pipeline } from 'stream';
import * as path from 'path';
import { promisify } from 'util';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { StatusCodes } from 'http-status-codes';
import sendToWormhole from 'stream-wormhole';
import { throwApiError } from '../../lib/ApiError';
import DataService from '../dataService';
import { I_Response } from '../../lib/interface';
import * as qs from 'querystring';


const pump = promisify(pipeline);

export default class UserComponent extends DataService{

  capitalize = (str) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
  toPascalCase = (str) => str.split('-').map(this.capitalize).join('');

  private base = 'user-components';
  protected paramKeys = [
    'docUrl',
    'devMode',
    {
      key: 'schema',
      value: () => 'schema_fragment'
    }
  ];
  protected resKeys = [
    'doc_url',
    'dev_mode',
    {
      key: 'schema_fragment',
      value: () => 'schema'
    }
  ];

  async bundleCreate (fileStream) {
    const splitResult = await this.splitMaterials(fileStream);
    const componentList = splitResult.components;
    const packageList = splitResult.packages;
    if(!packageList) {
      return this.bulkComponentCreate(componentList);
    }
    await Promise.all(packageList.map(async (componentLibrary) => {
      // 查询是否存在组件库
      const paramComponentLibrary = {
        name: componentLibrary.name,
        version: componentLibrary.version
      }
      const componentLibraryList = await this.service.materialCenter.componentLibrary.find(paramComponentLibrary);
      componentLibrary.packageName = componentLibrary.package;
      componentLibrary.framework = 'Vue';
      componentLibrary.isOfficial = true;
      componentLibrary.isDefault = true;
      if(componentLibraryList.data.length) {
        // 修改组件库
        componentLibrary.id = componentLibraryList.data[0].id;
        await this.service.materialCenter.componentLibrary.update(componentLibrary);
      }else {
        // 新增组件库
        await this.service.materialCenter.componentLibrary.create(componentLibrary);
      }
    }))
    return await this.bulkComponentCreate(componentList);
  }

  // 批量新增或者修改组件
  async bulkComponentCreate(componentList) {
    let componentLibraryListResult: any = [];
    const fileResult = {
      addNum: 0,
      updateNum: 0
    }
     
     await Promise.all(componentList.map(async (component) => {
      // 查询是否存在组件
      component.component = (typeof component.component === 'string') 
                      ? component.component 
                      : (Array.isArray(component.component) ? component.component.join(',') : '');
      const paramComponent = {
        component: component.component,
        version: component.version
      };

      const componentQueryList = await this.find(paramComponent);  // 异步查询组件
      let packageName = '';
      if (component.npm && component.npm.package) {
        packageName = component.npm.package;
      }

      // 根据包名和版本去查询组件库是否存在
      const paramComponentLibrary = {
        packageName: packageName,
        version: component.version
      };
      
      const componentLibraryList = await this.service.materialCenter.componentLibrary.find(paramComponentLibrary);
      let libraryId = componentLibraryList.data[0] ? componentLibraryList.data[0].id : null;
      component.library = libraryId;

      if (!componentQueryList.data.length) {
        fileResult.addNum += 1;
        // 新增组件
        component.id = null;
        const componentObject: I_Response = await this.create(component);
        componentLibraryListResult.push(componentObject);
      } else {
        fileResult.updateNum += 1;
        // 修改组件
        component.id = componentQueryList.data[0].id;
        const componentObject: I_Response = await this.update(component);
        componentLibraryListResult.push(componentObject);
      }
    }));

    // 返回新增或者修改的条数
    return fileResult;
  }

  async create(param) {
    return this.fQuery({
      url: this.base,
      method: E_Method.Post,
      data: param
    });
  }

  async update(param) {
    const {id} = param;
    return this.fQuery({
      url: `${this.base}/${id}`,
      method: E_Method.Put,
      data: param
    });

  }

  async find(param) {
    const query = typeof param === 'string' ? param : qs.stringify(param);
    return this.fQuery({
      url: `${this.base}?${query}`
    });
  }

  async splitMaterials(fileStream) {
    let bundleDefault = {
      data: {
        framework: 'Vue',
        materials: {
          components: [],
          blocks: [],
          snippets: [],
          packages: []
        }
      }
    }
    const bundle = await this.parseJsonFileStream(fileStream) || bundleDefault;
    const { components, snippets, packages } = bundle?.data.materials;
    try {
        // 预处理 snippets
        const snippetsMap = {}
        if(snippets != null && snippets.length != 0){
          snippets.forEach((snippetItem) => {
            if (!Array.isArray(snippetItem?.children)) {
              return
            }
            
            snippetItem.children.forEach((item) => {
              const key = item?.schema?.componentName || item.snippetName
              if (!key) {
                return
              }
              const realKey = this.toPascalCase(key)
              if (!snippetsMap[realKey]) {
                snippetsMap[realKey] = []
              }
              snippetsMap[realKey].push({
                ...item,
                category: snippetItem.group
              })
            })
          })
        }
        
        // 处理组件
        components.forEach((comp) => {
          const matchKey = Array.isArray(comp.component) 
            ? this.toPascalCase(comp.component[0])
            : this.toPascalCase(comp.component)
          
          const matchedSnippets = snippetsMap[matchKey]

          if (matchedSnippets?.length) {
            comp.snippets = matchedSnippets
          }
        })
        
      } catch (error) {
        this.ctx.logger.error(`failed to split materials: ${error}.`)
      }
      return {components,packages};
  }

  async parseJsonFileStream(fileStream) {
      const { filename, fieldname, encoding, mime } = fileStream;
      this.logger.info(`parseJsonFileStream field: ${fieldname}, filename:${filename}, encoding: ${encoding}, mime: ${mime}`);
      // 校验文件流合法性
      await this.validateFileStream(fileStream, E_AppErrorCode.CM308, [E_MimeType.Json]);
      const jsonFileName = `${uuidv4()}_${filename.toLowerCase()}`;
      const target = path.resolve(this.config.baseDir, '.tmp', jsonFileName);
      try {
        await fs.ensureDir(path.parse(target).dir);
        const writeStream = fs.createWriteStream(target);
        await pump(fileStream, writeStream);
        return await fs.readJson(target);
      } catch (err) {
        await sendToWormhole(fileStream);
        throwApiError((err as Error).message, StatusCodes.INTERNAL_SERVER_ERROR, E_AppErrorCode.CM309);
      } finally {
        await fs.remove(target);
      }
    }

  /**
   * 校验文件流是否合法
   * @param { any } fileStream 文件流
   * @param { E_AppErrorCode } condition 报错码
   * @param { Array<E_MimeType> } mimeTypes 文件类型集合
   */
  async validateFileStream(fileStream, code: E_AppErrorCode, mimeTypes: Array<E_MimeType>) {
    const { filename, mime } = fileStream;
    const condition = filename && mimeTypes.includes(mime);
    if (condition) {
      return;
    }
    // 只要文件不合法就throw error， 无论是批量还是单个
    await sendToWormhole(fileStream);
    throwApiError('', StatusCodes.BAD_REQUEST, code);
  }

}
