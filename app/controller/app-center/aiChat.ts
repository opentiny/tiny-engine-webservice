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
import { E_FOUNDATION_MODEL } from '../../lib/enum';

export default class AiChatController extends Controller {
  public async aiChat() {
    const { ctx } = this;
    const { foundationModel, messages } = ctx.request.body;
    this.ctx.logger.info('ai接口请求参参数 model选型:', foundationModel);
    if (!messages || !Array.isArray(messages)) {
      ctx.helper.throwError('Not passing the correct message parameter');
    }
    const model = foundationModel?.model ?? E_FOUNDATION_MODEL.GPT_35_TURBO;
    ctx.body = await ctx.service.appCenter.aiChat.getAnswerFromAi(messages, { model });
  }
}
