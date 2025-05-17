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

export default class AiChatController extends Controller {
  public async aiChat() {
    const { ctx } = this;
    const { foundationModel, messages } = ctx.request.body;
    this.ctx.logger.info('ai接口请求参参数 model选型:', foundationModel);
    if (!messages || !Array.isArray(messages)) {
      return this.ctx.helper.getResponseData('Not passing the correct message parameter');
    }
    const apiKey = foundationModel?.apiKey;
    const baseUrl = foundationModel?.baseUrl;
    const model = foundationModel?.model;
    const streamStatus = foundationModel?.stream || false;

    if (streamStatus) {
      ctx.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      });
      await ctx.service.appCenter.aiChat.getAnswerFromAi(
        messages,
        { apiKey, baseUrl, model, streamStatus },
        ctx.res
      );
      return;
    }

    // 非流式模式
    ctx.body = await ctx.service.appCenter.aiChat.getAnswerFromAi(messages, {
      apiKey,
      baseUrl,
      model,
      streamStatus
    });
  }

  public async uploadFile() {
    const { ctx } = this;
    const fileStream = await ctx.getFileStream();
    const foundationModelObject = JSON.parse(fileStream.fields.foundationModel);
    const { model, token } = foundationModelObject.foundationModel;
    ctx.body = await ctx.service.appCenter.aiChat.getFileContentFromAi(fileStream, { model, token });
  }

  public async search() {
    const { ctx } = this;
    const { content } = ctx.request.body;

    ctx.body = await ctx.service.appCenter.aiChat.search(content);
  }
}
