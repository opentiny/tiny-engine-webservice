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
import * as fs from 'fs';
import * as path from 'path';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import OpenApiUtil from '@alicloud/openapi-util';
import * as $Util from '@alicloud/tea-util';
import Credential, { Config } from '@alicloud/credentials';

const to = require('await-to-js').default;
const OpenAI = require('openai');

export type AiMessage = {
  role: string; // 角色
  name?: string; // 名称
  content: string; // 聊天内容
  partial?: boolean;
};

interface ConfigModel {
  model: string;
  token: string;
}

export default class AiChat extends Service {
  /**
   * 获取ai的答复
   *
   * @param messages
   * @param model
   * @return
   */

  async getAnswerFromAi(messages: Array<AiMessage>, chatConfig: any, res: any = null) {
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

      // 逐块发送数据到前端
      if (chatConfig.streamStatus) {
        for await (const chunk of result) {
          const content = chunk.choices[0]?.delta?.content || '';
          res.write(`data: ${JSON.stringify({ content })}\n\n`); // SSE 格式
        }
      } else {
        return result;
      }
    } catch (e: any) {
      this.ctx.logger.debug(`调用AI大模型接口失败: ${(e as Error).message}`);
      return this.ctx.helper.getResponseData(`调用AI大模型接口失败: ${(e as Error).message}`);
    } finally {
      if (res) {
        res.end(); // 关闭连接
      }
    }

    if (!res) {
      return this.ctx.helper.getResponseData(`调用AI大模型接口未返回正确数据.`);
    }
  }

  /**
   * 文件上传
   *
   * @param model
   * @return
   */

  async getFileContentFromAi(fileStream: any, chatConfig: ConfigModel) {
    const answer = await this.requestFileContentFromAi(fileStream, chatConfig);
    return this.ctx.helper.getResponseData({
      originalResponse: answer
    });
  }

  async requestFileContentFromAi(file: any, chatConfig: ConfigModel) {
    const { ctx } = this;
    const filename = Date.now() + path.extname(file.filename).toLowerCase();
    const savePath = path.join(__dirname, filename);
    const writeStream = fs.createWriteStream(savePath);
    file.pipe(writeStream);
    await new Promise((resolve) => writeStream.on('close', resolve));

    const client = new OpenAI({
      apiKey: chatConfig.token,
      baseURL: 'https://api.moonshot.cn/v1'
    });

    // 上传文件
    const [fileError, fileObject] = await to(
      client.files.create({
        file: fs.createReadStream(savePath),
        purpose: 'file-extract'
      })
    );

    if (fileError) {
      this.ctx.logger.debug(`调用上传图片接口失败: ${fileError.message}`);
      await fs.promises.unlink(savePath).catch((err) => console.error('文件删除失败:', err));
      return this.ctx.helper.getResponseData(`调用上传图片接口失败: ${fileError.message}`);
    }

    // 文件解析
    const imageAnalysisConfig = this.config.parsingFile(fileObject.id, chatConfig.token);
    const { analysisImageHttpRequestUrl, analysisImageHttpRequestOption } = imageAnalysisConfig[chatConfig.model];

    const [analysisError, res] = await to(ctx.curl(analysisImageHttpRequestUrl, analysisImageHttpRequestOption));

    if (analysisError) {
      this.ctx.logger.debug(`调用解析文件接口失败: ${analysisError.message}`);
      await fs.promises.unlink(savePath).catch((err) => console.error('文件删除失败:', err));
      return this.ctx.helper.getResponseData(`调用解析文件接口失败: ${analysisError.message}`);
    }

    // 删除文件
    await fs.promises.unlink(savePath).catch((err) => console.error('文件删除失败:', err));
    await to(client.files.del(fileObject.id));

    // 返回结果
    res.data = JSON.parse(res.res.data.toString());
    return res.data || this.ctx.helper.getResponseData('调用上传图片接口未返回正确数据.');
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
    const list = res?.body?.Data?.Nodes;

    return {
      data: list.map((node) => {
        return {
          score: node.Score,
          content: node.Text
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
    queries['Query'] = content;
    queries['EnableRewrite'] = true;
    queries['IndexId'] = process.env.ALIBABA_CLOUD_INDEX_ID;
    // runtime options
    let runtime = new $Util.RuntimeOptions({});
    let request = new $OpenApi.OpenApiRequest({
      query: OpenApiUtil.query(queries)
    });

    res = await client.callApi(params, request, runtime);

    return this.getSearchList(res);
  }
}
