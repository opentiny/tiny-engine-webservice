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
import { throwApiError } from '../../lib/ApiError';
import { E_ErrorCode, E_MaterialErrorCode, E_TASK_STATUS, E_TASK_TYPE, E_Public } from '../../lib/enum';
import { apiError } from '../../lib/ApiError';
import { createBlockRule, updateBlockRule, buildBlockRule } from '../../validate/material-center/block';


export default class BlockController extends Controller {
  async listNew() {
    const { categoryId, appId } = this.ctx.query;
    this.ctx.validate({ categoryId: 'id?', appId: 'id' }, { categoryId, appId });
    if (categoryId) {
      const { data: category } = await this.service.materialCenter.blockCategory.findById(categoryId);
      if (category.app.id !== Number(appId)) {
        throw apiError('', 403, E_MaterialErrorCode.CM206);
      }
    }
    this.ctx.body = await this.service.materialCenter.block.listNew({ categoryId, appId });
  }
  async list() {
    const { query } = this.ctx.request;
    const {appId} = query;
    if (appId && !/^[1-9]+[0-9]*$/.test(appId)) {
      delete query.appId;
    }
    this.ctx.body = await this.service.materialCenter.block.list(query);
  }

  async getBlocks() {
    this.ctx.body = await this.service.materialCenter.block.getBlocks(this.ctx.queries);
  }
  
  async find() {
    this.ctx.body = await this.service.materialCenter.block.find(this.ctx.queries);
  }

  async count() {
    this.ctx.body = await this.service.materialCenter.block._count('blocks', this.ctx.queries);
  }

  async findById() {
    const { id } = this.ctx.params;
    this.ctx.validate({
        id: 'id'
    },
    {id}
    );
    this.ctx.body = await this.service.materialCenter.block.findById(id);
  }

  async findBlocksNotInGroup() {
    const { groupId } = this.ctx.params;
    this.ctx.body = await this.service.materialCenter.block.findBlocksNotInGroup(groupId, this.ctx.queries);
  }

  async allTags() {
    this.ctx.body = await this.service.materialCenter.block.allTags();
  }
  async allAuthor() {
    const { query } = this.ctx.request;
    this.ctx.body = await this.service.materialCenter.block.users(query);
  }
  async allTenant() {
    this.ctx.body = await this.service.materialCenter.tenant.list();
  }

  async genSourceCode() {
    const { id } = this.ctx.params;
    const res = await this.service.materialCenter.block.findById(id);
    const block = res.data;
    if (!block.current_history) {
      this.ctx.body = this.ctx.helper.getBadRequestResponse('no related history');
      return;
    }
    try {
      // 调用DSL转换方法生成代码
      const sourceCode = await this.service.materialCenter.build.translate(block, block.current_history);
      this.ctx.body = this.ctx.helper.getResponseData(sourceCode);
    } catch (error) {
      this.ctx.body = this.ctx.helper.getResponseData(null, error);
    }
  }
  
  async create() {
    const { body } = this.ctx.request;
    this.ctx.validate(
      createBlockRule,
      body
    );
    const createParam = this.ctx.helper.pickObject(body, [
      'label',
      'name_cn',
      'framework',
      'content',
      'description',
      'path',
      'screenshot',
      'created_app',
      'tags',
      'public',
      'public_scope_tenants',
      'categories',
      'occupier',
      'isDefault',
      'isOfficial'
    ]);
    // public 不是部分公开, 则public_scope_tenants为空数组
    if (createParam.public !== E_Public.SemiPublic) {
      createParam.public_scope_tenants = [];
    }
    // 对传入的tags 进行过滤
    if (createParam.tags) {
      createParam.tags = createParam.tags.filter((tag) => !!tag);
    }
    // 处理区块截图
    // if (createParam.screenshot) {
    //  const url = await this.service.materialCenter.block.handleScreenshot(createParam);
    //  createParam.screenshot = url;
    //  }
    this.ctx.body = await this.service.materialCenter.block.create(createParam);
  }
  
  async update() {
    const { id } = this.ctx.params;
    const { body } = this.ctx.request;
    this.ctx.validate(updateBlockRule, { id, ...body });
    const updateParam = this.ctx.helper.pickObject(body, [
      'id',
      'name_cn',
      'description',
      'screenshot',
      'label',
      'categories',
      'content',
      'tags',
      'isDefault',
      'isOfficial',
      'public',
      'public_scope_tenants',
    ]);
    // public 不是部分公开, 则public_scope_tenants为空数组
    if (updateParam.public !== E_Public.SemiPublic) {
      updateParam.public_scope_tenants = [];
    }
    // 处理区块截图
    if (updateParam.screenshot && updateParam.label) {
      //const url = await this.service.materialCenter.block.handleScreenshot(updateParam);
      updateParam.screenshot = '';
    } else {
      // 不更新 screenshot, 避免screenshot为空字符串覆盖上次值
      delete updateParam.screenshot;
    }
    this.ctx.body = await this.service.materialCenter.block.update({ id, ...updateParam }, this.ctx.query);
  }

  async delete() {
    const { id } = this.ctx.params;
    //const { obs } = this.service;
    const res = await this.service.materialCenter.block.delete({ id });
    // 批量删除obs资源
    /*
    const { label } = res.data;
    const keyObjs: Array<any> = await obs.list(label, 'block');
    if (keyObjs.length > 0) {
      await obs.delete({ Objects: keyObjs });
    }
    */
    this.ctx.body = res;
  }
  async build() {
    // post参数校验二次丰富
    this.ctx.validate(buildBlockRule);
    const { deploy_info: message, block, version, needToSave = false } = this.ctx.request.body;
    const { materialCenter, task } = this.ctx.service;
    const { content } = block;
    
    if (!content) {
      throwApiError('', Number(E_ErrorCode.BadRequest), E_MaterialErrorCode.CM204);
    }

    // 区块不存在的情况下先创建新区块
    const id = await this.ensureBlockId(block);

    // 对版本号是否存在进行校验
    const hasHistory = await materialCenter.blockHistory.isHistoryExisted(id, version);
    if (hasHistory) {
      throwApiError('', Number(E_ErrorCode.BadRequest), E_MaterialErrorCode.CM205);
    }
    // 处理区块截图
    // block.screenshot = await materialCenter.block.handleScreenshot(block);
    block.screenshot = '';
    // 更新i18n 信息
    block.i18n = await materialCenter.block.getBlockI18n(id);
    // 如果有未完成的任务直接返回该任务信息
    let taskInfo: any = await task.getUnfinishedTask(E_TASK_TYPE.BLOCK_BUILD, id);
    if (taskInfo?.data) {
      this.ctx.body = taskInfo;
      return;
    }

    const newTask = {
      taskTypeId: E_TASK_TYPE.BLOCK_BUILD,
      taskStatus: E_TASK_STATUS.INIT,
      uniqueId: id
    };
    taskInfo = await task.create(newTask);
    // 执行构建
    const body = { message, block, version, needToSave };
    await this.service.materialCenter.blockBuilder.start(id, taskInfo.data.id, body )
    this.ctx.body = taskInfo;

  }
  
  private async ensureBlockId(blockData): Promise<number | string> {
    const { auth, materialCenter } = this.ctx.service;
    const { id, label, framework } = blockData; 
    if (id) {
      return id;
    }
    // 如果区块不存在查询区块
    const userInfo = await auth.me();
    const uk = {
      label,
      framework,
      createdBy: userInfo.data.id
    };
    const blockInfo = await materialCenter.block.find(uk);
    const block = blockInfo.data[0] ?? {};
    if (block.id) {
      return block.id;
    }
    // 区块不存在创建
    const newBlock = await materialCenter.block.create(blockData);
    return newBlock.data.id ?? 0;
  }
  
}
