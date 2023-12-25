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

export default class MessageQueue {
  private static channel;
  static async getChannel(app: Application) {
    if (!MessageQueue.channel) {
      const res = await MessageQueue.getAgentChannel(app);
      MessageQueue.channel = res;
    }
    return MessageQueue.channel;
  }

  static getAgentChannel(app: Application): Promise<any> {
    app.messenger.sendToAgent('get-amqplib-channel', null);
    return new Promise((resolve) => {
      app.once('receive-ampqlib-channel', (channel) => {
        resolve(channel);
      });
    })
      .then((res) => {
        return res;
      })
      .catch((e) => {
        app.logger.error(e);
        return null;
      });
  }
}
