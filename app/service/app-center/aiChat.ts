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
import path from 'path';
import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';
import pump from 'mz-modules/pump';

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
        baseURL: chatConfig.baseUrl || process.env.OPEN_AI_BASE_URL,
        defaultHeaders: {
          'X-DashScope-OssResourceResolve': 'enable'
        },
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
      console.log('res',res);
      
    } catch (e) {
      this.ctx.logger.debug('Alibaba Cloud search failed', e);
      return this.ctx.helper.getResponseData('知识库检索接口调用失败');
    }

    return this.getSearchList(res);
  }

  /**
   * 获取上传凭证
   * @param {string} modelName - 模型名称
   * @param {string} apiKey
   */
  async getUploadPolicy(modelName, apiKey) {
    try {
      const result = await this.ctx.curl('https://dashscope.aliyuncs.com/api/v1/uploads', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        data: {
          action: 'getPolicy',
          model: modelName
        },
        dataType: 'json',
        timeout: 5000
      });

      return result.data.data;
    } catch (error) {
      this.ctx.logger.error('获取上传凭证失败:', error);
      throw new Error('获取上传凭证失败');
    }
  }

  /**
   * 上传文件到OSS
   * @param {Object} policyData - 上传凭证
   * @param {string} filePath - 本地文件路径
   * @param {string} filename - 文件名
   */
  async uploadToOSS(policyData, filePath, filename) {
    const key = `${policyData.upload_dir}/${filePath}`;

    const formData = new FormData();
    formData.append('OSSAccessKeyId', policyData.oss_access_key_id);
    formData.append('Signature', policyData.signature);
    formData.append('policy', policyData.policy);
    formData.append('x-oss-object-acl', policyData.x_oss_object_acl);
    formData.append('x-oss-forbid-overwrite', policyData.x_oss_forbid_overwrite);
    formData.append('key', key);
    formData.append('success_action_status', '200');
    formData.append('file', fs.createReadStream(filePath), filename);

    try {
      const response = await axios.post(policyData.upload_host, formData, {
        headers: formData.getHeaders(),
        timeout: 10000
      });

      if (response.status !== 200) {
        throw new Error('上传文件到OSS失败');
      }

      return {
        ossUrl: `oss://${key}`,
        expireTime: new Date(Date.now() + 48 * 60 * 60 * 1000)
      };
    } catch (error) {
      this.ctx.logger.error('上传文件到OSS失败:', error);
      throw new Error('上传文件到OSS失败');
    }
  }

  /**
   * 完整上传流程
   * @param stream - 文件对象
   */
  async uploadFile(stream) {
    const { modelName, apiKey } = stream.fields;
    const filename = stream.filename;
    const tmpDir = path.join(this.config.baseDir, 'tmp');

    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    const tmpFilePath = path.join(tmpDir, filename);

    try {
      const writeStream = fs.createWriteStream(tmpFilePath);
      await pump(stream, writeStream);
      await new Promise((resolve) => writeStream.on('close', resolve));

      const policyData = await this.getUploadPolicy(modelName, apiKey);
      const { ossUrl, expireTime } = await this.uploadToOSS(policyData, tmpFilePath, filename);

      fs.unlinkSync(tmpFilePath);

      return {
        success: true,
        data: {
          url: ossUrl,
          expireTime: expireTime.toISOString()
        }
      };
    } catch (error) {
      if (fs.existsSync(tmpFilePath)) {
        fs.unlinkSync(tmpFilePath);
      }
      this.ctx.logger.error('上传文件到OSS失败:', error);
    }
  }
}
