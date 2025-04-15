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

  const ROUTER_PREFIX = '/material-center/api';
  const subRouter = router.namespace(ROUTER_PREFIX);


  // 区块接口
  subRouter.get('/blocks', controller.materialCenter.block.listNew);
  subRouter.get('/block/list', controller.materialCenter.block.list);
  subRouter.get('/block/list2', controller.materialCenter.block.getBlocks);
  subRouter.get('/block/count', controller.materialCenter.block.count);
  subRouter.get('/block', controller.materialCenter.block.find);
  // 通过id查询区块
  subRouter.get('/block/detail/:id', controller.materialCenter.block.findById);
  subRouter.get('/block/tags', controller.materialCenter.block.allTags);
  subRouter.get('/block/users', controller.materialCenter.block.allAuthor);
  subRouter.get('/block/tenants', controller.materialCenter.block.allTenant);
  subRouter.get('/block/notgroup/:groupId', controller.materialCenter.block.findBlocksNotInGroup);
  subRouter.post('/block/create', controller.materialCenter.block.create);
  subRouter.post('/block/update/:id', controller.materialCenter.block.update);
  subRouter.get('/block/delete/:id', controller.materialCenter.block.delete);
  subRouter.get('/block/code/:id', controller.materialCenter.block.genSourceCode);
  subRouter.post('/block/deploy', controller.materialCenter.block.build);

  // 区块分组接口
  subRouter.get('/block-groups', controller.materialCenter.blockGroup.find);
  subRouter.post('/block-groups/create', controller.materialCenter.blockGroup.create);
  subRouter.post('/block-groups/update/:id', controller.materialCenter.blockGroup.update);
  subRouter.get('/block-groups/delete/:id', controller.materialCenter.blockGroup.delete);

  // 区块分类接口
  subRouter.get('/block-categories', controller.materialCenter.blockCategory.list);
  subRouter.post('/block-categories', controller.materialCenter.blockCategory.create);
  subRouter.put('/block-categories/:id', controller.materialCenter.blockCategory.update);
  subRouter.delete('/block-categories/:id', controller.materialCenter.blockCategory.delete);


  // 区块历史记录
  subRouter.get('/block-history', controller.materialCenter.blockHistory.find);
  subRouter.post('/block-history/create', controller.materialCenter.blockHistory.create);
  subRouter.get('/block-history/delete/:id', controller.materialCenter.blockHistory.delete);


  // 任务记录查询
  subRouter.get('/tasks/status', controller.materialCenter.task.status);
  subRouter.get('/tasks/:id', controller.materialCenter.task.findById);

  //组件库
  subRouter.post('/component-library/update/:id',controller.materialCenter.componentLibrary.update);
  subRouter.post('/component-library/create',controller.materialCenter.componentLibrary.create);
  subRouter.delete('/component-library/delete/:id',controller.materialCenter.componentLibrary.delete);
  subRouter.get('/component-library/find',controller.materialCenter.componentLibrary.find);


  // 拆分bundle.json
  subRouter.post('/component/bundle/create',controller.materialCenter.userComponents.bundleCreate);
};
