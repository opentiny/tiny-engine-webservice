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
  const { controller, router } = app;

  const API_VERSION = 'v1';
  const ROUTER_PREFIX = `/app-center/${API_VERSION}/api`;
  const subRouter = router.namespace(ROUTER_PREFIX);
  const versionController = controller.appCenter[API_VERSION];

  subRouter.get('/apps/schema/:id', versionController.apps.schema);
  subRouter.post('/i18n/entries/batch/create', versionController.i18n.createEntries);
  subRouter.post('/i18n/entries/update', versionController.i18n.updateEntry);
  
  subRouter.post('/pages/update/:id', versionController.pages.update);
  subRouter.get('/code', versionController.pages.dslCode);
  subRouter.post('/schema2code', versionController.pages.schema2code);
};