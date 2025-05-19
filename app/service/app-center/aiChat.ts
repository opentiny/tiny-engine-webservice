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
import { Service } from 'egg';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import OpenApiUtil from '@alicloud/openapi-util';
import * as $Util from '@alicloud/tea-util';
import Credential, { Config } from '@alicloud/credentials';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export type AiMessage = {
  role: string; // 角色
  name?: string; // 名称
  content: string; // 聊天内容
  partial?: boolean;
};

export default class AiChat extends Service {
  /**
   * 获取ai的答复
   *
   * @param messages
   * @param model
   * @return
   */

  async getAnswerFromAi(messages: ChatCompletionMessageParam[], chatConfig: any) {
    let result: any = null;

    try {
      const openai = new OpenAI({
        apiKey: chatConfig.apiKey || process.env.OPEN_AI_API_KEY,
        baseURL: chatConfig.baseUrl || process.env.OPEN_AI_BASE_URL
      });

      result = await openai.chat.completions.create({
        model: chatConfig.model || process.env.OPEN_AI_MODEL,
        messages,
        stream: chatConfig.streamStatus
      });

      return result;
    } catch (e: any) {
      this.ctx.logger.debug(`调用AI大模型接口失败: ${(e as Error).message}`);
      return this.ctx.helper.getResponseData(`调用AI大模型接口失败: ${(e as Error).message}`);
    }
  }

  /**
   * 知识库检索
   * @remarks
   * 使用凭据初始化账号Client
   * @returns Client
   *
   * @throws Exception
   */
  private createClient(): OpenApi {
    const credentialsConfig1 = new Config({
      type: 'access_key',
      accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET
    });
    let credential = new Credential(credentialsConfig1);
    let config = new $OpenApi.Config({
      credential: credential
    });

    config.endpoint = `bailian.cn-beijing.aliyuncs.com`;
    return new OpenApi(config);
  }

  /**
   * @remarks
   * API 相关
   *
   * @param path - string Path parameters
   * @returns OpenApi.Params
   */
  private createApiInfo(WorkspaceId): $OpenApi.Params {
    let params = new $OpenApi.Params({
      // 接口名称
      action: 'Retrieve',
      // 接口版本
      version: '2023-12-29',
      // 接口协议
      protocol: 'HTTPS',
      // 接口 HTTP 方法
      method: 'POST',
      authType: 'AK',
      style: 'ROA',
      // 接口 PATH
      pathname: `/${WorkspaceId}/index/retrieve`,
      // 接口请求体内容格式
      reqBodyType: 'json',
      // 接口响应体内容格式
      bodyType: 'json'
    });
    return params;
  }

  private getSearchList(res) {
    const list = res?.body?.Data?.Nodes ?? [];

    return {
      data: list.map((node) => {
        return {
          score: node.Score,
          content: node.Text,
          doc_name: node.Metadata.doc_name
        };
      })
    };
  }

  async search(content: string[]) {
    let res: any = null;
    let client = this.createClient();
    let params = this.createApiInfo(process.env.ALIBABA_CLOUD_WORKSPACE_ID);
    // query params
    let queries: { [key: string]: any } = {};
    const QUERY = 'Query';
    const ENABLE_REWRITE = 'EnableRewrite';
    const INDEX_ID = 'IndexId';
    queries[QUERY] = content;
    queries[ENABLE_REWRITE] = true;
    queries[INDEX_ID] = process.env.ALIBABA_CLOUD_INDEX_ID;
    // runtime options
    let runtime = new $Util.RuntimeOptions({});
    let request = new $OpenApi.OpenApiRequest({
      query: OpenApiUtil.query(queries)
    });

    try {
      res = await client.callApi(params, request, runtime);
    } catch (e) {
      this.ctx.logger.debug('Alibaba Cloud search failed', e);
      return this.ctx.helper.getResponseData('知识库检索接口调用失败');
    }

    return this.getSearchList(res);
  }
}
