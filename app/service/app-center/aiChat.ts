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
import Transformer from '@opentiny/tiny-engine-transform';
import { E_FOUNDATION_MODEL } from '../../lib/enum';
import * as fs from 'fs';
import * as path from 'path';

const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: 'sk-uORejJaJs7ZXP6MFQkY9FzYhgPWZms1iOTCBUHA0ipQJRhRt',
  baseURL: 'https://api.moonshot.cn/v1'
});

export type AiMessage = {
  role: string; // 角色
  name?: string; // 名称
  content: string; // 聊天内容
};

interface ConfigModel {
  model: string;
  token: string;
}

export default class AiChat extends Service {
  /**
   * 获取ai的答复
   *
   * 根据后续引进的大模型情况决定，是否通过重构来对不同大模型进行统一的适配
   *
   * @param messages
   * @param model
   * @return
   */

  async getAnswerFromAi(messages: Array<AiMessage>, chatConfig: any) {
    const answer = await this.requestAnswerFromAi(messages, chatConfig);
    const answerContent = answer.choices[0]?.message.content;
    // 从ai回复中提取页面的代码
    const codes = this.extractCode(answerContent);
    const schema = codes ? Transformer.translate(codes) : null;
    const replyWithoutCode = this.removeCode(answerContent);
    return this.ctx.helper.getResponseData({
      originalResponse: answer,
      replyWithoutCode,
      schema
    });
  }

  async requestAnswerFromAi(messages: Array<AiMessage>, chatConfig: any) {
    const { ctx } = this;
    this.formatMessage(messages);
    let res: any = null;
    try {
      // 根据大模型的不同匹配不同的配置
      const aiChatConfig = this.config.aiChat(messages, chatConfig.token);
      const { httpRequestUrl, httpRequestOption } = aiChatConfig[chatConfig.model];
      this.ctx.logger.debug(httpRequestOption);

      res = await ctx.curl(httpRequestUrl, httpRequestOption);
    } catch (e: any) {
      this.ctx.logger.debug(`调用AI大模型接口失败: ${(e as Error).message}`);
      return this.ctx.helper.getResponseData(`调用AI大模型接口失败: ${(e as Error).message}`);
    }

    if (!res) {
      return this.ctx.helper.getResponseData(`调用AI大模型接口未返回正确数据.`);
    }

    // 适配文心一言的响应数据结构，文心的部分异常情况status也是200，需要转为400，以免前端无所适从
    if (res.data?.error_code) {
      return this.ctx.helper.getResponseData(res.data?.error_msg);
    }

    // 适配chatgpt的响应数据结构
    if (res.status !== 200) {
      return this.ctx.helper.getResponseData(res.data?.error?.message, res.status);
    }

    // 适配文心一言的响应数据结构
    if (chatConfig.model === E_FOUNDATION_MODEL.ERNIE_BOT_TURBO) {
      return {
        ...res.data,
        choices: [
          {
            message: {
              role: 'assistant',
              content: res.data.result
            }
          }
        ]
      };
    }

    return res.data;
  }

  /**
   * 提取回复中的代码
   *
   * 暂且只满足回复中只包括一个代码块的场景
   *
   * @param content ai回复的内容
   * @return 提取的文本
   */
  private extractCode(content: string) {
    const { start, end } = this.getStartAndEnd(content);
    if (start < 0 || end < 0) {
      return '';
    }
    return content.substring(start, end);
  }

  /**
   * 去除回复中的代码
   *
   * 暂且只满足回复中只包括一个代码块的场景
   *
   * @param content ai回复的内容
   * @return 去除代码后的回复内容
   */
  private removeCode(content: string) {
    const { start, end } = this.getStartAndEnd(content);
    if (start < 0 || end < 0) {
      return content;
    }
    return content.substring(0, start) + '<代码在画布中展示>' + content.substring(end);
  }

  private getStartAndEnd(str: string) {
    const start = str.search(/```|<template>/);

    // 匹配对应的结束标记
    const endMarkerRegex = /```|<\/template>|<\/script>|<\/style>/g;
    let match;
    // 如果找不到匹配的结束标记，返回-1
    let end = -1;
    while ((match = endMarkerRegex.exec(str)) !== null) {
      if (match.index > start) {
        end = match.index + match[0].length;
      }
    }

    return { start, end };
  }

  private formatMessage(messages: Array<any>) {
    const defaultWords: any = {
      role: 'user',
      content: `你是一名前端开发专家，编码时遵从以下几条要求:
      ###
      1. 只使用 element-ui组件库的el-button 和 el-table组件
      2. el-table表格组件的使用方式为 <el-table :columns="columnData" :data="tableData"></el-table> columns的columnData表示列数据，其中用title表示列名，field表示表格数据字段； data的tableData表示表格展示的数据。 el-table标签内不得出现子元素
      3. 使用vue2技术栈
      4. 回复中只能有一个代码块
      5. 不要加任何注释
      6. el-table标签内不得出现el-table-column
      ###`
    };
    const reg = /.*\u7f16\u7801\u65f6\u9075\u4ece\u4ee5\u4e0b\u51e0\u6761\u8981\u6c42.*/;
    const { role, content } = messages[0];
    if (role !== 'user') {
      messages.unshift(defaultWords);
    } else if (!reg.test(content)) {
      messages[0].content = `${defaultWords.content}\n${messages[0].content}`;
    }
    return messages;
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
    // // @ts-ignore
    const filename = Math.random().toString(36).substr(2) + new Date().getTime() + path.extname(file.filename).toLocaleLowerCase();
    const savePath = path.join(__dirname, filename);
    const writeStream = fs.createWriteStream(savePath);
    file.pipe(writeStream);
    await new Promise(resolve => writeStream.on('close', resolve));

    let res: any = null;
    try {
      //上传文件
      const fileObject = await client.files.create({
        file: fs.createReadStream(savePath),
        purpose: 'file-extract'
      });

      // 文件解析
      const imageAnalysisConfig = this.config.parsingFile(fileObject.id, chatConfig.token);
      const { analysisImageHttpRequestUrl, analysisImageHttpRequestOption } = imageAnalysisConfig[chatConfig.model];
      res = await ctx.curl(analysisImageHttpRequestUrl, analysisImageHttpRequestOption);
      res.data = JSON.parse(res.res.data.toString());
      console.log(res.data);
    } catch (e: any) {
      this.ctx.logger.debug(`调用上传图片接口失败: ${(e as Error).message}`);
      return this.ctx.helper.getResponseData(`调用上传图片接口失败: ${(e as Error).message}`);
    } finally {
      // 删除本地文件
      try {
        await fs.promises.unlink(savePath);
        console.log('文件已删除:', savePath);
      } catch (err) {
        console.error('文件删除失败:', err);
      }
    }

    if (!res) {
      return this.ctx.helper.getResponseData(`调用上传图片接口未返回正确数据.`);
    }

    return res.data;
  }
}

