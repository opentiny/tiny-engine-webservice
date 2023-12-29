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
import * as path from 'path';
import * as fs from 'fs-extra';
import * as prettier from 'prettier';
import * as dsl from '@opentiny/tiny-engine-dsl-vue';
import { I_AppComplexInfo, I_Response } from '../../lib/interface';
import DataServcice from '../dataService';
import { E_ErrorCode, E_AppErrorCode } from '../../lib/enum';
import { throwApiError } from '../../lib/ApiError';

const WORDS = {
  initEnv: 'Initialize the creation code environment',
  copyTemplate: 'download preview template project from npm, and copy it to workspace of generator',
  saveCode: 'save the code locally',
  generateCode: 'Generate app preview code',
  dslParse: 'dsl parsing',
  generateDependencies: 'generate dependencies',
  generateGlobalState: 'generate global state'
};

const COMPONENT_NAME = {
  Page: 'Page',
  Block: 'Block',
  Folder: 'Folder'
};
const FOLDER_ROOT_ID = '0';

const prettierCommon = {
  printWidth: 120,
  semi: false,
  singleQuote: true,
  trailingComma: 'none'
};

class Generate extends DataServcice {
  public schema: any = {};
  public meta: any = {}; // 应用元数据
  public workspace = '';
  public codeFolder = '';
  public generatePath = '';
  private usedBlockNames: any = [];
  private pagesSchema: any = [];
  private allPathMap: any = [];
  private langMap = {
    en_US: 'en.json',
    zh_CN: 'zh.json'
  };
  // 初始化，为生成应用源码做好准备
  async init(app: I_AppComplexInfo | number | string) {
    // 获取应用元数据描述
    await this.setAppSchema(app);
    // 获取区块名字
    this.filterBlocks(this.schema.componentsMap);
    const appId = typeof app === 'number' || typeof app === 'string' ? app : app.appInfo.id;
    // 创建本次生成源码的工作空间目录
    return this.initEnv(appId);
  }

  generateCode() {
    this.getPagesSchema();
    this.parseBlocksInPage();

    // 生成代码任务列表
    const tasks = [
      this.generateI18n(),
      this.generateDataSource(),
      this.generatePage(),
      this.generateBlock(),
      this.generateUtils(),
      this.generateRouter(),
      this.generateDependencies(),
      this.generateGlobalState()
    ];

    // 执行生成代码任务，任何一个 reject 立即结束，并抛出错误，由调用方 catch
    return Promise.all(tasks);
  }

  // 清理此次临时工作空间，包括：生成的代码、压缩包
  clean() {
    const { workspace } = this;
    fs.remove(workspace);

    this.ctx.logger.info(`path: ${workspace} cleaned up`);
  }

  // 生成国际化词条
  private generateI18n() {
    const { i18n } = this.schema;
    Object.keys(i18n).forEach(key => {
      const fileName = this.langMap[key];
      if (!fileName) {
        const supportedLocales = Object.keys(this.langMap);
        const message = `failed to generate i18n: invalid locale: ${key}. Only support ${supportedLocales.join('/')}`;
        this.logger.error(message);

        throw new Error(message);
      }

      const filepath = path.resolve(this.generatePath, 'src/i18n', fileName);
      return this.saveCode(i18n[key], filepath, `i18n/${fileName}`);
    });
  }

  // 生成数据源
  private generateDataSource() {
    const {
      dataSource: { dataHandler, list: originList }
    } = this.schema;
    const fileName = 'dataSource.json';
    const filepath = path.resolve(this.generatePath, 'src/lowcode', fileName);

    const list = originList.map(({ id, name, data }) => ({ id, name, ...data }));
    const code = { dataHandler, list };

    return this.saveCode(code, filepath, fileName);
  }

  // 生成工具类
  private generateUtils() {
    const { utils } = this.schema;

    if (utils?.length) {
      const utilStr = this.generateExport(utils);
      const fileName = 'utils.js';
      const filepath = path.resolve(this.generatePath, 'src/lowcode', fileName);
      const content = this.formatCode(utilStr, { ...prettierCommon, parser: 'typescript' }, fileName);

      return this.saveCode(content, filepath, fileName);
    }
  }

  private generateRoutes() {
    const routes = this.pagesSchema.map(({ meta: { isHome, router }, fileName }) => ({
      fileName,
      isHome,
      path: router.startsWith('/') ? router : `/${router}`
    }));

    const hasRoot = routes.some(({ path }) => path === '/');

    if (!hasRoot && routes.length) {
      const { path: homePath } = routes.find(({ isHome }) => isHome) || {};

      if (homePath) {
        routes.unshift({ path: '/', redirect: homePath });
      } else {
        routes.unshift({ path: '/', redirect: routes[0].path });
      }
    }

    return routes;
  }

  // 生成路由文件
  private generateRouter() {
    const filepath = path.resolve(this.generatePath, 'src/router/index.js');

    const routes = this.generateRoutes();

    let content = '';

    content = `
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  ${routes
    .map(
      ({ fileName, path, redirect }) => `{
        path: '${path}',${redirect ? `redirect: '${redirect}',` : ''}
        ${
          fileName
            ? `component: () => import('../${
                this.allPathMap.find(({ componentName }) => componentName === fileName)?.main || 'views'
              }/${fileName}.vue'),`
            : ''
        }
      }`
    )
    .join(',')}
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})
  `;

    const fileName = 'routes.js';
    const codeStr = this.formatCode(content, { ...prettierCommon, parser: 'typescript' }, fileName);

    return this.saveCode(codeStr, filepath, fileName);
  }

  // 生成区块
  private async generateBlock() {
    // 获取使用的区块 schema
    const blocksSchema = this.meta.blockHistories.map((block) => block.content)
      .filter((schema) => schema && typeof schema === 'object');

    return this.schemasToCode(blocksSchema, this.allPathMap);
  }

  // 获取该应用所有页面的描述信息，支持文件夹，需更新 meta.router/filePath
  private getPagesSchema() {
    const { componentsTree } = this.schema;

    const folders = {};
    componentsTree.forEach((node) => {
      if (node.componentName === COMPONENT_NAME.Folder) {
        folders[node.id] = node;
      }
    });

    const pagesSchema = componentsTree.filter(({ componentName }) => componentName === COMPONENT_NAME.Page);
    pagesSchema.forEach(({ meta }) => {
      let { parentId, router } = meta;
      meta.router = String(router || '').trim();
      meta.filePath = '';

      if (parentId === FOLDER_ROOT_ID) {
        return;
      }

      while (parentId !== FOLDER_ROOT_ID) {
        const parent = folders[parentId];
        if (!parent) {
          break;
        }
        meta.router = `${parent.router}/${meta.router}`;
        meta.filePath = `${parent.folderName}${meta.filePath ? `/${meta.filePath}` : ''}`;
        parentId = parent.parentId;
      }
    });

    this.pagesSchema = pagesSchema;
  }

  private parseBlocksInPage() {
    const { componentsMap } = this.schema;

    // 页面放在 views 目录下，支持嵌套文件夹。区块平铺放在 components 目录下
    const pagePath = this.pagesSchema.map(({ fileName, meta }) => ({
      componentName: fileName,
      main: `views${meta.filePath ? `/${meta.filePath}` : ''}`
    }));
    // 通过区块分组及物料资产包关联关系获取全局区块

    const blocksPath = this.usedBlockNames.map((componentName) => ({ componentName, main: 'components' }));
    // 去重合并，componentsMap 中可能包含物料资产包中的区块，过滤掉，仅取出组件的路径映射
    const componentsPathMap = blocksPath.concat(
      componentsMap.filter(
        ({ componentName: inputName, package: pkg }) =>
          pkg && blocksPath.every(({ componentName: defaultName }) => defaultName !== inputName)
      )
    );
    this.allPathMap = [...componentsPathMap, ...pagePath];
  }

  // 生成页面
  private generatePage() {
    return this.schemasToCode(this.pagesSchema, this.allPathMap);
  }

  // 处理export
  private generateExport(list: any) {
    const strs: Array<string> = [];
    if (Array.isArray(list)) {
      const exportNames: Array<any> = [];
      const functionStrs: Array<any> = [];
      const imports: any = {};

      list.forEach((item: any) => {
        if (item.type === 'npm') {
          const importFrom = `${item.content.package || ''}${item.content.main || ''}`;

          if (importFrom) {
            const importItem = (imports[importFrom] = imports[importFrom] || {});

            if (item.content.destructuring) {
              importItem.destructurings = importItem.destructurings || [];
              importItem.destructurings.push(item.content.exportName);
            } else {
              importItem.exportName = item.content.exportName;
            }

            exportNames.push(item.content.exportName);
          }
        } else if (item.type === 'function') {
          functionStrs.push(`const ${item.name} = ${item.content.value}`);
          exportNames.push(item.name);
        }
      });

      const importStrs: Array<string> = [];

      Object.entries(imports).forEach(([key, value]: [any, any]) => {
        const list: Array<any> = [];

        if (value.exportName) {
          list.push(value.exportName);
        }

        if (Array.isArray(value.destructurings) && value.destructurings.length) {
          list.push(`{ ${value.destructurings.join(', ')} }`);
        }

        importStrs.push(`import ${list.join(', ')} from '${key}'`);
      });

      strs.push(...importStrs, ...functionStrs);

      if (exportNames.length) {
        strs.push(`export { ${exportNames.join(', ')} }`);
      }
    }

    return strs.join('\n');
  }

  // 获取传入schema 生成代码
  private schemasToCode(schemas: Array<any>, componentsMap: Array<any>) {
    const validCodes: any = [];

    for (const schema of schemas) {
      const code = this.dslGenerate(schema, componentsMap);
      if (code.error) {
        throw new Error(code.error.message);
      }

      // 对生成的源码字符串，添加校验，如果不是有效代码，跳过后续步骤，直接抛出错误
      const { errors } = code.data.find(({ errors }) => errors.length) || {};
      if (errors?.length) {
        const validatorMessages = errors.map(({ message }) => message).join('\n');
        const message = `failed to generate [${schema.componentName}] ${schema.fileName}:\n${validatorMessages}`;
        this.logger.error(message);

        throw new Error(message);
      }

      validCodes.push(code.data);
    }

    // 拆分：1. 生成源码字符串；2. 将字符串写入文件。
    // 收益：性能优化，相较而言第二步耗时高得多，如果第一步失败，提前 reject
    return Promise.all(validCodes.map(this.saveVueCodeFile, this));
  }

  // dsl生成代码
  private dslGenerate(schema, componentsMap): I_Response {
    // 校验dsl可用性
    if (typeof dsl.generateCode !== 'function') {
      return this.ctx.helper.getResponseData(null, {
        message: 'tiny-engine-dsl-vue generateCode is not a function',
        code: E_ErrorCode.Fail
      });
    }
    try {
      const code = dsl.generateCode({
        pageInfo: { schema, name: schema.fileName },
        blocksData: [],
        componentsMap
      });
      return this.ctx.helper.getResponseData(code);
    } catch (e) {
      this.logger.error(`failed to ${WORDS.dslParse} :`, e);
      return this.ctx.helper.getResponseData(null, {
        message: `failed to ${WORDS.dslParse} ${schema.componentName} ${schema.fileName}`,
        code: E_ErrorCode.Fail
      });
    }
  }

  // 保存Vue代码文件
  private saveVueCodeFile(codes: Array<any>) {
    for (const code of codes) {
      const { type, panelName, panelValue, filePath, prettierOpts } = code;
      const baseDir = `${this.generatePath}/src`;
      const subPath = filePath.split('/');

      const fileInfo = `${type} of ${panelName}`;
      const codeStr = this.formatCode(panelValue, prettierOpts, fileInfo);

      return this.saveCode(codeStr, path.resolve(baseDir, ...subPath, panelName), fileInfo);
    }
  }

  private formatCode(code, prettierOpts: any, fileName) {
    let formattedCode = '';

    try {
      formattedCode = prettier.format(code, prettierOpts);
    } catch (error) {
      const message = `failed to prettier.format ${fileName}: ${this.getMessage(error)}`;
      this.logger.error(message);

      throw new Error(message);
    }

    return formattedCode;
  }

  // 保存文件基础方法
  private saveCodeToLocal(code: string, filepath: string) {
    return fs.outputFile(filepath, code);
  }
  // 保存文件
  async saveCode(code: any, filepath, type = '') {
    let codeStr = code;

    if (typeof code !== 'string') {
      codeStr = JSON.stringify(code, null, 2);
    }

    try {
      return await this.saveCodeToLocal(codeStr, filepath);
    } catch (error) {
      const message = `generate ${type}: failed to ${WORDS.saveCode}`;
      this.logger.error(message);

      throw new Error(message);
    }
  }

  async zipPackage() {
    const compressing = require('compressing');
    const { generatePath, codeFolder } = this;

    try {
      await compressing.zip.compressDir(generatePath, `${generatePath}.zip`);
    } catch (error) {
      const message = `failed to compressDir: ${codeFolder}`;
      this.logger.error(message, error);

      throw new Error(message);
    }
  }

  // 初始化生成代码环境
  async initEnv(appId) {
    this.makeGenereateDir(appId);

    try {
      await fs.mkdirs(this.generatePath);
    } catch (error) {
      const message = `failed to ${WORDS.initEnv}: ${this.getMessage(error)}`;
      this.logger.error(message);

      throw new Error(message);
    }
  }

  private async findTgz(dir, pkgName): Promise<string> {
    const fileList = await fs.readdir(dir);

    // tgz 名称是 pkg 名称的变体：去掉 pkg 中的 @scope，并以 - 连接
    const tgzName = pkgName.replace(/^@/, '').replace(/\//, '-');
    const tgzVersionRE = '.+';
    const tgzRE = new RegExp(`^${tgzName}-${tgzVersionRE}.tgz$`);

    return fileList.find((fileName) => tgzRE.test(fileName)) || '';
  }

  // 拷贝模板代码到构建路径  
  async copyTemplate() {
    const { execCommand } = this.ctx.service.appCenter.git;

    const { extend_config } = this.meta.app;
    const defaultPreviewConf = this.app.config.previewTemplate.default;
    const business_type = extend_config?.app_type || 'default';
    const previewConf = this.app.config.previewTemplate[business_type] ?? defaultPreviewConf;
    const pkgName = previewConf.vue;

    // 下载模板代码 npm 包
    const npmPack = `npm pack ${pkgName} --strict-ssl=false`;
    try {
      await execCommand(npmPack, { cwd: this.workspace });
    } catch (error: any) {
      throwApiError(error.message, 200, E_AppErrorCode.CM317);
    }
    

    const tgz = await this.findTgz(this.workspace, pkgName);
    this.logger.info('获取到的应用预览模板 tgz 包：', tgz);

    // 如果成功获取 tgz 包路径
    if (tgz) {
      // 解压，npm 包中的内容，默认包在 package 文件夹下
      try {
        await execCommand(`tar -xzvf ${tgz}`, { cwd: this.workspace });
      } catch (error: any) {
        throwApiError(error.message, 200, E_AppErrorCode.CM319);
      }
      this.logger.info('succeed to decompress tgz.');

      await fs.copy(path.resolve(this.workspace, 'package'), this.generatePath);
      await this.writeAppExtendConfig();
    } else {
      throwApiError('', 200, E_AppErrorCode.CM318);
    }
  }

  private async writeAppExtendConfig() {
    const { extend_config } = this.meta.app;
    const { endpointName, router } = extend_config?.business || {};

    if (endpointName && router) {
      const fs = require('fs/promises');

      const indexHtmlPath = path.resolve(this.generatePath, 'index.html');
      const indexHtmlStr = await fs.readFile(indexHtmlPath, 'utf8');
      const newHtmlStr = indexHtmlStr
        /*eslint prefer-regex-literals: "off"*/
        .replace(new RegExp('<title>.*</title>'), `<title>${endpointName}</title>`)
        .replace(new RegExp('window.AppWebPath(.*?);'), `window.AppWebPath = '${router}';`);

      await fs.writeFile(indexHtmlPath, newHtmlStr);
    }
  }

  private getMessage(error): string {
    // Error | string
    return (error as Error)?.message || error;
  }

  // 设置代码临时目录
  private makeGenereateDir(appId) {
    const baseDir = this.app.baseDir;
    const timestamp = Date.now();

    this.workspace = path.resolve(baseDir, `.tmp/generate-${appId}-${timestamp}`);
    this.codeFolder = `app-${appId}-${timestamp}`;
    this.generatePath = path.resolve(this.workspace, this.codeFolder);
  }
  // 获取应用schema
  private async setAppSchema(app: number | string | I_AppComplexInfo): Promise<I_Response> {
    const { appSchema } = this.service.appCenter;
    let schemaData: any;
    if (typeof app === 'number' || typeof app === 'string') {
      schemaData = await appSchema.getSchema(app);
      this.schema = schemaData.data;
      this.meta = appSchema.meta;
    } else {
      schemaData = this.ctx.helper.getResponseData(app.schema);
      this.schema = app.schema;
      this.meta = app.meta;
    }
    return schemaData;
  }

  // 从appSchema中提炼区块数据
  private filterBlocks(componentsMap: Array<any>) {
    const blocks: Array<string> = [];
    componentsMap.forEach(item => {
      if (item.package === undefined) {
        blocks.push(item.componentName);
      }
    });
    this.usedBlockNames = blocks;
  }

  // 将 utils 的npm依赖声明到 Package.json
  private async generateDependencies () {
    const { utils } = this.schema;

    if (!utils?.length) {
      return;
    }

    const utilDependencies = {};

    for (const { type, content: { package: packageName, version } } of utils) {
      if (type !== 'npm') {
        continue;
      }

      utilDependencies[packageName] = version || 'latest';
    }

    const packageJsonFile = path.join(this.generatePath, 'package.json');

    try {
      const packageJson = await fs.readJson(packageJsonFile);
  
      packageJson.dependencies = {
        ...packageJson.dependencies,
        ...utilDependencies
      };

      await fs.writeJson(packageJsonFile, packageJson, { spaces: 2 });
    } catch (error) {
      const message = `failed to ${WORDS.generateDependencies}: ${this.getMessage(error)}`;
      this.logger.error(message);

      throw new Error(message);
    }
  }

  private async generateGlobalState () {
    const { global_state } = this.schema.meta;
    let globalState: {
      actions?: {
        [key:string]: {
          type: string;
          value: string
        }
      };
      getters?: {
        [key:string]: {
          type: string;
          value: string;
        }
      };
      id: string;
      state: { [key:string]: any }
    }[] = []

    if (Array.isArray(global_state)) {
      globalState = [...global_state]
    }

    const baseDir = `${this.generatePath}/src/stores`
    // write global state
    const res:any = []
    const ids:any[] = []

    const getStoreFnStrs = (getters: Record<string, { type?: string; value?: string }> = {}) =>
      Object.values(getters)
        .map(({ value }) => value?.replace(/function /, ''))
        .join(',\n');

    for (const stateItem of globalState) {
      let importStatement = "import { defineStore } from 'pinia'"
      const { id, state, getters, actions } = stateItem

      ids.push(id)

      const storeFiles = `
        ${importStatement}
        export const ${id} = defineStore({
          id: '${id}',
          state: () => (${JSON.stringify(state)}),
          getters: {
            ${getStoreFnStrs(getters)}
          },
          actions: {
            ${getStoreFnStrs(actions)}
          }
        })
      `
      const fileName = `${id}.js`
      
      res.push({
        fileName,
        fileContent: this.formatCode(storeFiles, { ...prettierCommon, parser: 'typescript' }, fileName)
      })
    }

    res.push({
      fileName: 'index.js',
      fileContent: ids.map((item) => `export { ${item} } from './${item}'`).join('\n')
    })

    try {
      for (const { fileName, fileContent } of res) {
        await this.saveCode(fileContent, path.resolve(baseDir, fileName))
      }

    } catch (error) {
      const message = `failed to ${WORDS.generateGlobalState}: ${this.getMessage(error)}`;
      this.logger.error(message);

      throw new Error(message);
    }

  }
}

export default Generate;
