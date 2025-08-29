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
    const options = ctx.request.body;
    this.ctx.logger.info('ai接口请求参数 model选型:', options);

    const messages = options.messages;
    if (!messages || !Array.isArray(messages)) {
      return this.ctx.helper.getResponseData('Not passing the correct message parameter');
    }
    const apiKey = ctx.request.header?.authorization?.replace('Bearer', '');
    const baseUrl = options?.baseUrl;
    const model = options?.model;
    const stream = options?.stream || false;
    const tools = options?.tools || [];

    if (stream) {
      ctx.status = 200;
      ctx.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      });
      try {
        const result = await ctx.service.appCenter.aiChat.getAnswerFromAi(messages, {
          apiKey,
          baseUrl,
          model,
          stream,
          tools
        });

        for await (const chunk of result) {
          ctx.res.write(`data: ${JSON.stringify(chunk)}\n\n`); // SSE 格式
        }

        // 添加结束标记
        ctx.res.write('data: [DONE]');
      } catch (e: any) {
        this.ctx.logger.error(`调用AI大模型接口失败: ${(e as Error).message}`);
      } finally {
        console.log('end');
        ctx.res.end(); // 关闭连接
      }

      return;
    }

    // 非流式模式
    ctx.body = await ctx.service.appCenter.aiChat.getAnswerFromAi(messages, {
      apiKey,
      baseUrl,
      model,
      stream,
      tools
    });
  }

  public async search() {
    const { ctx } = this;
    const { content } = ctx.request.body;

    ctx.body = await ctx.service.appCenter.aiChat.search(content);
  }

  public async uploadFile() {
    const { ctx } = this;
    const stream = await ctx.getFileStream();

    ctx.body = await ctx.service.appCenter.aiChat.uploadFile(stream);
  }
}
