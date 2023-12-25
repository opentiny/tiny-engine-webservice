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
import { createProxyMiddleware } from 'http-proxy-middleware';
import koaConnect from 'koa-connect';
interface ProxyConfig {
  target: string;
  proxyUrlList: string[];
}

class Proxy {
  app: Application;
  target: string;
  proxyUrlList: string[];
  constructor(app: Application, config: ProxyConfig) {
    this.app = app;
    this.target = config.target;
    this.proxyUrlList = config.proxyUrlList;
  }
  createProxyMiddleware() {
    const { router } = this.app;
    this.proxyUrlList.forEach((proxyUrl) => {
      const pm: any = createProxyMiddleware({
        target: this.target,
        followRedirects: true,
        changeOrigin: true,
        secure: false
      });
      const middleware = koaConnect(pm);
      router.all(proxyUrl, middleware);
    });
  }
}

export default Proxy;
