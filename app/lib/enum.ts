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
// 请求method
export enum E_Method {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Patch = 'PATCH',
  Delete = 'DELETE',
  Head = 'HEAD'
}

// 应用状态
export enum E_PlatformState {
  Created = 0,
  Generated = 1
}

// 返回值错误码
export enum E_ErrorCode {
  Fail = '500',
  NotFound = '404',
  BadRequest = '400',
  Forbidden = '403',
  PreconditionFailed = '412',

  CM001 = 'CM001',
  CM002 = 'CM002',
  CM003 = 'CM003',
  CM004 = 'CM004',
  CM005 = 'CM005',
  CM006 = 'CM006',
  CM007 = 'CM007',
  CM008 = 'CM008',
  CM009 = 'CM009'
}

// 平台中心业务错误码集锦
export enum E_PlatformErrorCode {
  CM101 = 'CM101', // 因平台关联应用故无法删除
  CM110 = 'CM110', // 申请的组织不存在
  CM120 = 'CM120',
  CM121 = 'CM121',
  CM122 = 'CM122',
  CM123 = 'CM123',
  CM124 = 'CM124',
  CM125 = 'CM125',
  CM126 = 'CM126'
}

// 物料中心业务错误码集锦
export enum E_MaterialErrorCode {
  CM201 = 'CM201',
  CM202 = 'CM202',
  CM203 = 'CM203',
  CM204 = 'CM204',
  CM205 = 'CM205',
  CM206 = 'CM206',
  CM207 = 'CM207',
  CM208 = 'CM208'
}

// 应用中心业务错误码集锦
export enum E_AppErrorCode {
  CM301 = 'CM301',
  CM302 = 'CM302',
  CM303 = 'CM303',
  CM304 = 'CM304',
  CM305 = 'CM305',
  CM306 = 'CM306',
  CM307 = 'CM307',
  CM308 = 'CM308',
  CM309 = 'CM309',
  CM310 = 'CM310',
  CM311 = 'CM311',
  CM312 = 'CM312',
  CM313 = 'CM313',
  CM314 = 'CM314',
  CM315 = 'CM315',
  CM316 = 'CM316',
  CM317 = 'CM317',
  CM318 = 'CM318',
  CM319 = 'CM319'
}

export enum E_ThrowCode {
  PERMISSION_DENIED = 'permission_denied',
  NOT_FOUND = 'not_found',
  DATA_DUPLICATE = 'data_duplicate',
  INVALID_PARAM = 'invalid_param'
}

// 国际化使用场景/对象
export enum E_i18Belongs {
  APP = 1,
  BLOCK = 2
}

// 出码相关单元类型
export enum E_Schema2CodeType {
  BLOCK = 'Block',
  PAGE = 'Page'
}

// 打包任务类型
export enum E_TaskType {
  ASSETS_BUILD = 1,
  APP_BUILD = 2,
  PLATFORM_BUILD = 3,
  VSCODE_PLUGIN_BUILD = 4,
  BLOCK_BUILD = 5
}

// 打包任务状态
export enum E_TaskStatus {
  init = 0,
  running = 1,
  stopped = 2,
  finished = 3
}

// 前端框架
export enum E_Framework {
  Vue = 'Vue',
  Angular = 'Angular',
  React = 'React',
  HTML = 'HTML'
}

// 时间范围
export enum E_TimeRange {
  All = 'all',
  Today = 'today',
  Week = 'week',
  Month = 'month',
  Longer = 'longer'
}

// 数据中心角色分类
export enum E_UserRoles {
  Admin = 'Tinybuilder_Admin',
  TenantAdmin = 'Tinybuilder_Tenant_Admin',
  PlatformAdmin = 'Tinybuilder_Platform_Admin',
  AppAdmin = 'Tinybuilder_App_Admin',
  AppDeveloper = 'Tinybuilder_App_Developer',
  Master = 'Master',
  Guest = 'Guest'
}

// 应用状态
export enum E_AppState {
  Created = 0,
  Published = 1
}

// schema转换支持的方法
export enum E_SchemaFormatFunc {
  ToLocalTimestamp = 'toLocalTimestamp',
  ToRootElement = 'toRootElement',
  ToGroupName = 'toGroupName',
  ToCreatorName = 'toCreatorName',
  ToFormatString = 'toFormatString',
  ToArrayValue = 'toArrayValue'
}

export enum E_TASK_TYPE {
  ASSETS_BUILD = 1,
  APP_BUILD = 2,
  PLATFORM_BUILD = 3,
  VSCODE_PLUGIN_BUILD = 4,
  BLOCK_BUILD = 5
}

export enum E_TASK_STATUS {
  INIT = 0,
  RUNNING = 1,
  STOPPED = 2,
  FINISHED = 3
}

// 页面编辑状态
export enum E_CanvasEditorState {
  Release = 'release',
  Occupy = 'occupy'
}

// 系统内置角色token一览
export enum E_SystemUserToken {
  Admin = 'developer-admin',
  TenantAdmin = 'developer-tenant',
  PlatformAdmin = 'developer-platform',
  AppAdmin = 'developer-app',
  AppDeveloper = 'developer-worker',
  Master = 'developer',
  Guest = 'developer-worker'
}

// 应用主题
export enum E_AppTheme {
  Light = 'light',
  Dark = 'Dark'
}

// 项目装填
export enum E_ProjectState {
  Created = 1,
  Published = 2
}

// 技术栈类型
export enum E_TYPES {
  Angular = 'ng-tiny',
  React = 'react-fusion',
  Vue = 'vue-tiny',
  Html = 'html-vanilla'
}

// task 的process 酌情增减
export enum E_Task_Progress {
  Init = 'Build environment initialization',
  Install = 'Install build dependencies',
  AfterInstall = 'Install dependencies complete',
  Build = 'Execute build logic',
  AfterBuild = 'The build logic is executed',
  Upload = 'Upload build result',
  Complete = 'Build task completed',
  Update = 'Update datasheet'
}

// 生态扩展分类
export enum E_Ecology_Category {
  Dsl = 'dsl',
  Plugin = 'plugin',
  Theme = 'theme',
  Toolbar = 'toolbar',
  AppExtend = 'appExtension'
}

// https://nodejs.org/api/buffer.html#buffers-and-character-encodings
export enum E_Encodings {
  Utf8 = 'utf8',
  Base64 = 'base64',
  Hex = 'hex',
  Ascii = 'ascii',
  Utf16le = 'utf16le',
  Latin1 = 'latin1',
  Base64url = 'base64url',
  Binary = 'binary',
  Ucs2 = 'ucs2'
}

// 常用国际化语言代码
export enum E_I18nLangs {
  en_US = 'en_US',
  zh_CN = 'zh_CN'
}

// MIME-TYPE 简易枚举
export enum E_MimeType {
  Json = 'application/json',
  xZip = 'application/x-zip-compressed',
  Zip = 'application/zip'
}

// 指标类型
export enum E_IndicatorType {
  Duration = 'duration',
  Cpu = 'cpu',
  Mem = 'mem'
}

// 生态公开状态
export enum E_Public {
  Private = 0,
  Public = 1,
  SemiPublic = 2
}

// AI大模型
export enum E_FOUNDATION_MODEL {
  GPT_35_TURBO = 'gpt-3.5-turbo', // openai
  ERNIE_BOT_TURBO = 'ERNIE-Bot-turbo' // 文心一言
}
