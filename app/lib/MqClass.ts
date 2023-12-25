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

import { Buffer } from 'buffer';
import * as amqplib from 'amqplib';
import { Application } from 'egg';
import { strict as assert } from 'power-assert';
import { v4 as uuidv4 } from 'uuid';

declare module 'egg' {
  interface Application {
    amqplib: amqplib.Connection;
  }
}

export type consumeCallback = (data: any) => Promise<boolean>;

export interface Content {
  queueType: string;
  uuid: string;
  data: any;
}

export default class MqClass {
  private static instance: MqClass;
  private app: Application;
  private config: any = {};
  private client: amqplib.Connection;
  private publishChannel: amqplib.ConfirmChannel;
  private consumeChannel: amqplib.Channel;
  private publishQueueTypes: string[] = [];
  private consumeQueueTypes: string[] = [];

  public static getInstance(app: Application) {
    if (!MqClass.instance) {
      MqClass.instance = new MqClass(app);
    }
    return MqClass.instance;
  }

  constructor(app: Application) {
    this.app = app;
    this.setConfig();
    this.connect();
  }

  private setConfig() {
    const defaultConfig = {
      prefix: '',
      prefetchCount: 1,
      expiration: 3600000,
      retryTimes: 1,
      connectOptions: {
        protocol: 'amqps',
        hostname: 'localhost',
        port: 5672,
        username: '',
        password: '',
        locale: 'en_US',
        frameMax: 0,
        heartbeat: 0,
        vhost: '/'
      },
      socketOptions: {
        rejectUnauthorized: false
      }
    };
    const config: any = this.app.config.amqplib.client;
    assert(config?.prefix, 'mq prefix is empty');
    this.config = Object.assign(defaultConfig, config);
  }

  private async connect() {
    assert(this.app.amqplib, 'MqClass depend on egg-amqplib, please install it.');
    this.client = this.app.amqplib;
    this.app.logger.info('MqClass connect success');
  }

  private getNames(queueType: string) {
    const queueName = `${this.config.prefix}.mq.${queueType}`;
    const dlxQueueName = `${this.config.prefix}.mq.dlx.${queueType}`;
    const exchangeName = `${this.config.prefix}.ex`;
    const dlxExchangeName = `${this.config.prefix}.ex.dlx`;
    const routingKey = `*.*.mq.${queueType}`;
    const dlxRoutingKey = dlxQueueName;

    const names = { exchangeName, queueName, routingKey, dlxExchangeName, dlxQueueName, dlxRoutingKey };
    return names;
  }

  private wrapMessage(queueType: string, data: any): Content {
    const msg = {
      uuid: uuidv4(),
      queueType,
      data
    };

    return msg;
  }

  private async createPublishChannel(queueTypes: string[]): Promise<amqplib.ConfirmChannel> {
    const channel = await this.client.createConfirmChannel();
    await this.initExchangeAndQueue(channel, queueTypes);
    this.app.logger.info('MqClass create publish channel success');
    return channel;
  }

  private async createConsumeChannel(queueTypes: string[]): Promise<amqplib.Channel> {
    const channel = await this.client.createChannel();
    channel.prefetch(this.config.prefetchCount, true);
    await this.initExchangeAndQueue(channel, queueTypes);
    this.app.logger.info('MqClass create consume channel success');
    return channel;
  }

  private async initExchangeAndQueue(channel: amqplib.Channel, queueTypes: string[]) {
    const exchangeType = 'topic';
    const dlxExchangeType = 'direct';
    for (const queueType of queueTypes) {
      const names = this.getNames(queueType);
      // 注册业务队列
      await channel.assertExchange(names.exchangeName, exchangeType, { durable: true });
      await channel.assertQueue(names.queueName, {
        exclusive: false,
        deadLetterExchange: names.dlxExchangeName,
        deadLetterRoutingKey: names.dlxRoutingKey,
        expires: this.config.expiration
      });
      await channel.bindQueue(names.queueName, names.exchangeName, names.routingKey);
      // 注册死信队列
      await channel.assertExchange(names.dlxExchangeName, dlxExchangeType, { durable: true });
      await channel.assertQueue(names.dlxQueueName, {
        exclusive: false
      });
      await channel.bindQueue(names.dlxQueueName, names.dlxExchangeName, names.dlxRoutingKey);
    }
    this.app.logger.info('MqClass initialize exchange and queue success');
  }

  public async initPublisher(queueTypes: string[]) {
    assert(queueTypes.length, 'queueTypes is empty');
    this.publishQueueTypes = queueTypes;
    this.publishChannel = await this.createPublishChannel(queueTypes);
    this.app.logger.info('MqClass initPublisher success');
  }

  public async initConsumer(queueTypes: string[]) {
    assert(queueTypes.length, 'queueTypes is empty');
    this.consumeQueueTypes = queueTypes;
    this.consumeChannel = await this.createConsumeChannel(queueTypes);
    this.app.logger.info('MqClass initConsumer success');
  }

  public async publish(queueType: string, data: any) {
    const names = this.getNames(queueType);
    const content = this.wrapMessage(queueType, data);
    const bufferMsg = Buffer.from(JSON.stringify(content));

    const publishBool = await this.publishChannel.publish(names.exchangeName, names.queueName, bufferMsg, {
      persistent: true,
      mandatory: true,
      expiration: this.config.expiration
    });
    await this.publishChannel.waitForConfirms();
    this.app.logger.info(`MqClass publish success, queueType:${queueType}`);

    return publishBool;
  }

  public async consume(queueType: string, callback: consumeCallback) {
    const names = this.getNames(queueType);

    await this.consumeChannel.consume(
      names.queueName,
      async (msg: any) => {
        const content: Content = this.parseContent(msg);
        this.app.logger.info(
          `MqClass consume, queueType: ${queueType}, queueName: ${names.queueName}, uuid: ${content.uuid}`
        );

        const consumeSuccess = await callback(content);
        if (consumeSuccess) {
          await this.consumeChannel.ack(msg);
          this.app.logger.info(`MqClass consume success, queueType:${queueType}, queueName: ${names.queueName}`);
        } else {
          this.consumeChannel.nack(msg, false, false); // 死信队列
          this.app.logger.info(`MqClass consume failed, queueType:${queueType}, queueName: ${names.queueName}`);
        }
      },
      {
        noAck: false
      }
    );
  }

  public async dlxConsume(queueType: string, callback: consumeCallback) {
    const names = this.getNames(queueType);

    await this.consumeChannel.consume(
      names.dlxQueueName,
      async (msg: any) => {
        const content: Content = this.parseContent(msg);
        this.app.logger.info(
          `MqClass dlxConsume, queueType: ${queueType}, queueName: ${names.dlxQueueName}, uuid: ${content.uuid}`
        );

        const consumeSuccess = await callback(content);
        if (consumeSuccess) {
          await this.consumeChannel.ack(msg);
          this.app.logger.info(`MqClass dlxConsume success, queueType:${queueType}, queueName: ${names.queueName}`);
        } else {
          this.consumeChannel.nack(msg);
          this.app.logger.info(`MqClass dlxConsume failed, queueType:${queueType}, queueName: ${names.queueName}`);
        }
      },
      {
        noAck: false
      }
    );
  }

  public async publishAll(data: any) {
    let publishBool = true;
    for (const queueType of this.publishQueueTypes) {
      if (!(await this.publish(queueType, data))) {
        publishBool = false;
        break;
      }
    }
    return publishBool;
  }

  public async consumeAll(callback: consumeCallback) {
    for (const queueType of this.consumeQueueTypes) {
      await this.consume(queueType, callback);
    }
  }

  public async dlxConsumeAll(callback: consumeCallback) {
    for (const queueType of this.consumeQueueTypes) {
      await this.dlxConsume(queueType, callback);
    }
  }

  private parseContent(msg: amqplib.ConsumeMessage): Content {
    let content = {
      queueType: '',
      uuid: '',
      data: {}
    };
    try {
      content = JSON.parse(msg.content.toString());
    } catch (e) {
      this.app.logger.info('MqClass parseContent error');
      this.app.logger.error(e);
    }
    return content;
  }
}
