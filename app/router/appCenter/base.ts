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
import { Application } from 'egg';

export default (app: Application) => {
  const {
    controller,
    router,
    middleware: { verifyRequiredParam }
  } = app;

  const ROUTER_PREFIX = '/app-center/api';
  const subRouter = router.namespace(ROUTER_PREFIX);

  // 应用管理
  subRouter.get('/apps/detail/:id', controller.appCenter.apps.detail);
  subRouter.post('/apps/update/:id', controller.appCenter.apps.update);

  // 关联应用信息，主要是apps下block-histories
  subRouter.get('/apps/associate', controller.appCenter.apps.associate);

  // 画布锁
  subRouter.get(
    '/apps/canvas/lock',
    verifyRequiredParam([{ id: 'query', state: 'query' }]),
    controller.appCenter.apps.lock
  );
  // 应用预览
  subRouter.get('/apps/preview/:id', controller.appCenter.apps.preview);
  // 应用发布
  subRouter.post('/apps/publish/:id', controller.appCenter.apps.publish);
  // 应用下载
  subRouter.get('/apps/download/:id', controller.appCenter.apps.publishDown);
  // 获取应用下的全部国际化词条
  subRouter.get('/apps/i18n/:id', controller.appCenter.apps.i18n);
  // 修改应用对应的国际化语种关联
  subRouter.post('/apps/i18n/:id', controller.appCenter.apps.updateI18n);
  // 获取app的schema
  subRouter.get('/apps/schema/:id', controller.appCenter.apps.schema);
  subRouter.get('/apps/schema/components/:id', controller.appCenter.apps.schemaFragment);
  // 获取app关联的原始数据
  subRouter.get('/apps/relations/:id', controller.appCenter.apps.relations);

  // app的桥接|工具CRUD
  subRouter.post('/apps/extension/create', controller.appCenter.apps.createExtension);
  subRouter.post('/apps/extension/update', controller.appCenter.apps.updateExtension);
  subRouter.get('/apps/extension/delete', controller.appCenter.apps.delExtensionsById);
  subRouter.get('/apps/extension/list', controller.appCenter.apps.getExtensions);
  subRouter.get('/apps/extension', controller.appCenter.apps.getExtension);

  // 页面管理
  subRouter.get('/pages/list/:aid', controller.appCenter.pages.pageList);
  subRouter.get('/pages/detail/:id', controller.appCenter.pages.detail);
  subRouter.post('/pages/create', controller.appCenter.pages.create);
  subRouter.get('/pages/delete/:id', controller.appCenter.pages.del);
  subRouter.post('/pages/update/:id', controller.appCenter.pages.update);
  subRouter.get('/pages/code/:id', controller.appCenter.pages.code);

  // 页面历史记录管理
  subRouter.get('/pages/histories', controller.appCenter.pageHistories.find);
  subRouter.get('/pages/histories/:id', controller.appCenter.pageHistories.detail);
  subRouter.get('/pages/histories/delete/:id', controller.appCenter.pageHistories.del);
  subRouter.post('/pages/histories/create', controller.appCenter.pageHistories.create);

  // 数据源模板接口
  subRouter.get('/source_tpl', controller.appCenter.sourceTpl.find);
  subRouter.post('/source_tpl/create', controller.appCenter.sourceTpl.create);
  subRouter.post('/source_tpl/update/:id', controller.appCenter.sourceTpl.update);
  subRouter.get('/source_tpl/delete/:id', controller.appCenter.sourceTpl.delete);

  // dataSource
  subRouter.get('/sources/list/:aid', controller.appCenter.sources.list);
  subRouter.get('/sources/detail/:id', controller.appCenter.sources.detail);
  subRouter.post('/sources/create', controller.appCenter.sources.create);
  subRouter.get('/sources/delete/:id', controller.appCenter.sources.del);
  subRouter.post('/sources/update/:id', controller.appCenter.sources.update);

  // 国际化相关
  subRouter.get('/i18n/langs', controller.appCenter.i18n.langs);
  subRouter.get('/i18n/langs/:id', controller.appCenter.i18n.langDetail);
  subRouter.get('/i18n/langs/delete/:id', controller.appCenter.i18n.delLang);
  subRouter.post('/i18n/langs/create', controller.appCenter.i18n.createLang);
  subRouter.post('/i18n/langs/update/:id', controller.appCenter.i18n.updateLang);

  subRouter.get('/i18n/entries', controller.appCenter.i18n.entries);
  subRouter.get('/i18n/entries/:id', controller.appCenter.i18n.langEntryDetail);
  subRouter.post('/i18n/entries/bulk/delete', controller.appCenter.i18n.delEntry);
  // 应用下批量上传国际化词条文件
  subRouter.post('/apps/:id/i18n/entries/multiUpdate', controller.appCenter.i18n.updateI18nMultiFile);
  // 应用下上传单文件处理国际化词条
  subRouter.post('/apps/:id/i18n/entries/update', controller.appCenter.i18n.updateI18nSingleFile);

  subRouter.post('/i18n/entries/create', controller.appCenter.i18n.createEntry);
  subRouter.post('/i18n/entries/batch/create', controller.appCenter.i18n.createEntries);
  subRouter.post('/i18n/entries/update/:id', controller.appCenter.i18n.updateLangEntry);
  subRouter.post('/i18n/entries/update', controller.appCenter.i18n.updateEntry);
  // 任务查询
  subRouter.get('/tasks/status/:id', controller.materialCenter.task.findById);

  // 通用接口
  subRouter.get('/code', controller.appCenter.pages.dslCode);
  subRouter.post('/schema2code', controller.appCenter.pages.schema2code);
  subRouter.get('/preview/metadata', controller.appCenter.pages.previewData);

  // AI大模型聊天接口
  subRouter.post('/ai/chat', controller.appCenter.aiChat.aiChat);
  subRouter.post('/ai/search', controller.appCenter.aiChat.search);
  subRouter.post('/ai/uploadFile', controller.appCenter.aiChat.uploadFile);
};
