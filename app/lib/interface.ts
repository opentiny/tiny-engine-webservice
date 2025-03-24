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
import { HttpMethod, RequestOptions2 as RequestOptions } from 'urllib';
import { E_Framework, E_ProjectState, E_Schema2CodeType, E_SchemaFormatFunc, E_TaskStatus, E_TaskType } from './enum';

/** **************系统接口*******************/
// service 数据中心通用参数
export interface I_QueryParam {
  url: string;
  data?: any;
  method?: HttpMethod;
  option?: RequestOptions;
}

export interface I_DataUnnecessary {
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

// 错误码
export interface I_ErrorData {
  message: string;
  code: string;
}

// 返回值
export interface I_Response {
  error?: I_ErrorData;
  data?: any;
  err_msg?: string;
  locale?: string;
}

/** ***************业务接口*******************/

// 平台
interface I_BuildInfo {
  result: boolean;
  platformVersion?: string;
  prevPlatformVersion?: string;
  versions?: string[];
  cost?: string;
  endTime?: string;
}

// OBS
export interface I_ObsPutParams {
  Key: string;
  SourceFile: string;
}

export interface I_ObsDelParams {
  Objects: { Key: string }[];
}

export interface I_UpdateTaskParam {
  taskStatus?: number;
  progress?: string;
  progress_percent?: number;
  taskResult?: string;
}

export interface I_TaskRecordInfo {
  id: number; // 任务ID
  teamId: number; // 团队id，默认0
  taskTypeId: E_TaskType; // 任务类型: 1 ASSETS_BUILD / 2 APP_BUILD / 3 PLATFORM_BUILD / 4 VSCODE_PLUGIN_BUILD
  uniqueId: number; // 该任务类型的唯一id，能根据该id和任务类型唯一区分该任务
  taskName?: string; // 任务名称
  taskStatus?: E_TaskStatus; // 任务状态：0 init / 1 running / 2 stopped / 3 finished
  taskResult?: string; // 当前执行进度结果信息
  progress?: string; // 当前进行的子任务名, 如正在安装依赖或正在构建
  progress_percent?: number;
  published_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface I_BuildMessage {
  platformId: string;
  taskId: string;
}

// 平台历史版本操作
export interface I_CreatePlatformHistoryParam {
  name: string;
  platform: string | number;
  description?: string;
  platform_url: string;
  vscode_url?: string; // vscode构建和平台构建是分开的
  material_history: string;
  version: string;
  sub_count: number;
}

// 创建组织
export interface I_CreateOrgParam {
  tenant_id: string;
  name_cn?: string;
  name_en?: string;
  description?: string;
}

// 权限管理
export interface I_CreateAuthParam {
  user: number | string;
  role: number | string;
}

// 参数转换函数接口
export interface I_FieldItem {
  key: string;
  value: () => {};
}

// 页面
export interface I_CreatePageParam {
  name: string;
  app: string | number;
  page_desc?: string;
  page_content?: string;
  isHome?: boolean;
  isBody?: boolean;
  group?: string;
  parentId: number;
  isPage: boolean;
}

export interface I_UpdatePageParam {
  id: number;
  name?: string;
  page_desc?: string;
  page_content?: string;
  isHome?: boolean;
  isBody?: boolean;
  group?: boolean;
  parentId: number;
  isPage?: boolean;
  depth?: number;
  message?: string;
  path_name?: string;
  isDefault?: boolean;
}

// 页面历史
export interface I_CreatePageHistoryParam {
  page: number | string;
  message?: string;
}

interface I_Field {
  name: string;
  title: string;
  type: string;
}

export interface I_CreateSourcesParam {
  name: string;
  app: number;
  tpl?: number;
  data?: Array<I_Field>;
}

export interface I_UpdateSourcesParam {
  id: number;
  name?: string;
  data?: Array<I_Field>;
}

// 文件夹相关
export interface I_CreateFolderParam {
  name: string;
  route: string;
  app: number | string;
  parentId: number | string;
}

export interface I_UpdateFolderParam {
  id: string | number;
  name?: string;
  route?: string;
  parentId?: number | string;
  depth?: string | number;
}

// 国际化相关

export interface I_CreateI18nLang {
  lang: string;
  label: string;
}

export interface I_UpdateI18nLang {
  lang?: string;
  label?: string;
  id: string | number;
}

export interface I_CreateI18nLangEntry {
  host: number | string;
  host_type: 'app' | 'block';
  key: string;
  content: string;
  lang: number | string;
}

export interface I_UpdateI18nLangEntry {
  key?: string;
  content?: string;
  lang?: number | string;
  id: number | string;
}

export interface I_OperateI18nEntries {
  key: string;
  contents: any;
  host: string | number;
  host_type: 'app' | 'block';
}

export interface I_OperateI18nBatchEntries {
  entries: {
    key: string;
    contents: any;
  }[];
  host: string | number;
  host_type: 'app' | 'block';
}

export interface I_OperateI18nEntry {
  key: string;
  content: string;
  host: string | number;
  host_type: 'app' | 'block';
  lang: string | number;
}

export interface I_DeleteI18nEntry {
  key_in: Array<string>;
  host: string | number;
  host_type: string;
}

// schema 操作接口
export interface I_SchemaFormatFunc {
  [propsName: string]: E_SchemaFormatFunc;
}
export interface I_SchemaConvert {
  include?: Array<string>;
  exclude?: Array<string>;
  convert?: any;
  format?: I_SchemaFormatFunc;
}

// 应用历史
export interface I_CreateAppHistoryParam {
  app: string | number;
  version: string;
  app_schema: any;
  name: string;
  platform: string | number;
  platform_history: string | number;
  tenant: string | number;
  app_website: string;
  obs_url: string;
  home_page: string;
  project_name: string;
  git_group: string;
  description?: string;
  sub_count: number;
  editor_url: string;
}

// 参数转换函数接口
export interface I_FieldItem {
  key: string;
  value: () => {};
}

// 应用发布
export interface I_publishParam {
  id: string | number;
  branch: string;
  commitMsg: string;
  allGenerate: string;
  canCreateNewBranch: boolean;
  gitUserToken?: string; // 前端如果传了该字段，即使用该token账号用于下载代码; 暂未用到，预留字段;
}

/** ***************业务接口*******************/

// OBS
export interface I_ObsPutParams {
  Key: string;
  SourceFile: string;
  // Body?: string
  // ContentType?: MimeType
}

export interface I_ObsDelParams {
  Objects: { Key: string }[];
}

// 项目
export interface I_UpdateProjectParam {
  id: number;
  name?: string;
  project_desc?: string;
  cdn_addr?: string;
  state?: E_ProjectState;
}

export interface I_CreateProjectParam {
  name: string;
  app: number;
  project_desc?: string;
  state: E_ProjectState;
  cdn_addr?: string;
}

// 页面
export interface I_CreatePageParam {
  name: string;
  project: number;
  path_name: string;
  page_desc?: string;
  page_content?: string;
}

export interface I_CreateComponent {
  label: string;
  framework: string;
}

// 任务记录
export interface I_UpdateTaskParam {
  taskStatus?: number;
  progress?: string;
  taskResult?: string;
}

// DSL转换后的源码数据结构
export interface I_SourceCode {
  panelName: string; // 文件名
  panelValue: string; // 文件内容
  panelType: string; // 文件类型，后续可以修改为枚举类型，e.g. html/js/css
  prettierOpt: any;
  type: string; // e.g. block/page/component
  filePath: string; // 文件相对路径
}

export interface I_WcBlockItem {
  name: string; // 等于 label 或者 blockName
  selector: string;
  className: string; // 从label转换而来的类名（非样式类）
  componentPath: string; // 等于 I_SourceCode.filePath
}

// 区块构建成webcomponent需要的配置
export interface I_WcBlockConfig {
  type: 'block';
  block: I_WcBlockItem;
}

interface I_BlockAssets {
  material: string[];
  scripts: string[];
  styles: string[];
}

// 历史记录
export interface I_CreateBlockHistoryParam {
  message: string; // 本次变动信息
  content: string; // 区块schema
  block_id?: number; // 区块的id
  assets?: I_BlockAssets;
  build_info?: I_BuildInfo;
  screenshot?: string;
  path?: string;
  description?: string;
  label?: string;
  mode?: 'vscode' | null;
  version?: string; // 版本号
  npm_name?: string;
  i18n?: any;
  created_app?: string | number; // 区块被哪个app创建
  content_blocks?: Array<any> | null;
}

export type I_UpdateBlockHistoryParam = Partial<I_CreateBlockHistoryParam> & { id: string };

export interface I_SchemaConvert {
  include?: Array<string>;
  exclude?: Array<string>;
  convert?: any;
  format?: I_SchemaFormatFunc;
}

// 参数转换函数接口
export interface I_FieldItem {
  key: string;
  value: () => {};
}

export interface I_ObsDownloadFolder {
  prefix: string;
  savePath: string;
}

export interface I_AppComplexInfo {
  schema: any;
  meta: any;
  hash: string;
  appInfo: any;
  isChanged: boolean;
}

// 区块/页面 schema转代码功能函数的参数格式定义
export interface I_GetOutcomeParam {
  type: E_Schema2CodeType;
  id: number | string;
  app: number | string; // 应用id
  history?: number | string; // 页面历史记录id
}

// 调用dsl 将schema生成对应代码
export interface I_TranslateSchemaParam {
  appId: number | string; // 应用id
  type: E_Schema2CodeType;
  schema: any;
  name: string; // 名称
  framework?: E_Framework; // 指定解析的前端框架
  hostId?: number | string; // 页面或区块id，根据E_Schema2CodeType区分
}

// 组件库参数定义
export interface I_CreateComponentLibrary {
  name: string, // 组件库名称
  packageName: string, // 包名
  version: string, // 版本号
  framework: E_Framework, // 技术栈
  script: string, // js cdn
  css: any, // css cdn
  registry: string, // 仓库地址
  description: string, // 描述
  thumbnail: string, // 缩略图地址
  isDefault: boolean, // 标识成默认组件库（构建物料包时，默认的会自动添加上）
  isOfficial: boolean, // 标识成官方组件库（用途未知，有个官方的标签显示）
  public: number | string, // 公开范围
  public_scope_tenants: any, // 公开范围为半公开时，选择的组织
  dependencies: any // 组件库的依赖
}

export interface I_CreateComponentLibraryParam {
  component: Array<any>,
  componentLibrary: I_CreateComponentLibrary
}
// AI聊天消息
export interface IAiMessage {
  role: string; // 角色
  name?: string; // 名称
  content: string; // 聊天内容
}
