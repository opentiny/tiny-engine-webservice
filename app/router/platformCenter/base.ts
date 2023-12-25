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
  } = app;

  const ROUTER_PREFIX = '/platform-center/api';
  const subRouter = router.namespace(ROUTER_PREFIX);

  // 组织管理 挂靠平台中心
  subRouter.post('/org/create', controller.platformCenter.org.create);
  subRouter.get('/org/delete', controller.platformCenter.org.delete);
  subRouter.get('/org/list', controller.platformCenter.org.orgs);
  subRouter.get('/org/list2', controller.platformCenter.org.list);
  subRouter.post('/org/update', controller.platformCenter.org.update);
  subRouter.get('/org', controller.platformCenter.org.org);

  
  // 用户管理
  subRouter.get('/user/list', controller.platformCenter.auth.users);
  subRouter.get('/user/me', controller.platformCenter.auth.me);

};

