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
import { EggAppConfig, PowerPartial } from 'egg';
import * as path from 'path';
import { E_FOUNDATION_MODEL, E_SchemaFormatFunc } from '../app/lib/enum';
import { I_SchemaConvert } from '../app/lib/interface';


export default (appInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  config.dataCenter = {
    developerToken: 'developer'
  };
  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = 'tiny_engine';

  // add your egg config in here
  config.middleware = ['errorResponse', 'beforRequest'];

  config.logger = {
    dir: `/opt/cloud/logs/${appInfo.name}`,
    // @ts-ignore
    contextFormatter: (meta: any) => {
      const { level, date, pid, message } = meta;
      return `${date} ${level} ${pid} ${meta.ctx.request.header.request_id} ${meta.ctx.helper.loggerPaddingMessage(
        meta.ctx
      )} ${message}]`;
    }
  };

  // 根据环境取获取代理服务器
  config.httpclient = {
    request: {
      enableProxy: !!process.env.PROXY_SERVER,
      rejectUnauthorized: false,
      proxy: process.env.PROXY_SERVER
    }
  };

  config.deploy = {
    baseDir: path.resolve(appInfo.baseDir, './deploy'),
    obsOrigin: process.env.obsAccessUrl,
    obsPathKey: 'materials'
  };

  // obs配置，请自行配置自己的云存储服务及相关代码替换
  config.obs = {
    url: process.env.OBS_ACCESS_URL,
    serviceUrl: process.env.OBS_SERVICE_URL,
    subFolder: 'app-preview/source-code',
    bucket: 'tiny-engine',
  };

  config.queueName = 'tinyengine.build.platform'; // 构建设计器 rabbitMq 队列名称



  config.security = {
    csrf: {
      enable: false,
      useSession: false,
      cookieName: 'csrfToken', // Cookie 中的字段名，默认为 csrfToken
      sessionName: 'csrfToken' // Session 中的字段名，默认为 csrfToken
    },
    domainWhiteList: ['']
  };

  config.dsl = {
    'vue-tiny': {
      dslGeneratorPkg: '@opentiny/tiny-engine-dsl-vue',
      dslPkgCore: '@opentiny/tiny-engine-dsl-vue'
    }
  };

  config.previewTemplate = {
    default: {
      vue: '@opentiny/tiny-engine-preview-vue'
    },
    common: {
      vue: '@opentiny/tiny-engine-preview-vue'
    },
    bigScreen: {
      vue: '@opentiny/tiny-engine-preview-vue'
    },
    priceCalculator: {
      vue: '@opentiny/tiny-engine-preview-vue'
    },
    mobile: {
      vue: '@opentiny/tiny-engine-preview-vue'
    },
    taihu: {
      vue: '@opentiny/tiny-engine-preview-vue'
    }
  };


  config.proxy = true;

  // 消息队列配置,请配置自己的服务或者删除该配置及相关代码, 本代码仅供连接 rabbitMQ 参考
  config.amqplib = {
    client: {
      prefix: 'tinyengine.build',
      prefetchCount: 1,
      expiration: 3600000,
      connectOptions: {
        protocol: 'amqps',
        hostname: process.env.MQ_IP,
        port: parseInt(process.env.MQ_PORT || '5671', 10),
        username: process.env.MQ_USERNAME, // 使用时替换为自己的mq用户名
        password: process.env.MQ_PASSWORD,
        locale: 'en_US',
        frameMax: 0,
        heartbeat: 0,
        vhost: '/tinyEngine'
      },
      // other plugin config for more safe to the client if you have
      socketOptions: {
        rejectUnauthorized: false
      }
    }
  };

  config.i18n = {
    // 默认语言，默认 "en_US"
    defaultLocale: 'zh-cn',
    // URL 参数，默认 "locale"
    queryField: 'locale',
    // Cookie 记录的 key, 默认："locale"
    cookieField: 'locale',
    // Cookie 的 domain 配置，默认为空，代表当前域名有效
    // cookieDomain:'this',
    // Cookie 默认 `1y` 一年后过期， 如果设置为 Number，则单位为 ms
    cookieMaxAge: '1y'
  };

  config.maxFolderDepth = 5;

  // schema 转换配置对象
  // 拼装字段执行顺序： include/exclude -> format -> convert
  const schemaConf: Record<string, I_SchemaConvert> = {
    app: {
      convert: {
        id: 'appId',
        createdBy: 'creator',
        created_at: 'gmt_create',
        updated_at: 'gmt_modified'
      },
      include: [
        'id',
        'name',
        'tenant',
        'git_group',
        'project_name',
        'is_demo',
        'description',
        'createdBy',
        'created_at',
        'updated_at',
        'branch',
        'global_state'
      ],
      format: {
        id: E_SchemaFormatFunc.ToFormatString,
        created_at: E_SchemaFormatFunc.ToLocalTimestamp,
        updated_at: E_SchemaFormatFunc.ToLocalTimestamp,
        createdBy: E_SchemaFormatFunc.ToCreatorName,
        global_state: E_SchemaFormatFunc.ToArrayValue
      }
    },
    pageMeta: {
      convert: {
        page_desc: 'description',
        route: 'router',
        isBody: 'rootElement',
        createdBy: 'creator',
        created_at: 'gmt_create',
        updated_at: 'gmt_modified'
      },
      include: [
        'id',
        'title',
        'page_desc',
        'createdBy',
        'parentId',
        'created_at',
        'updated_at',
        'isHome',
        'isBody',
        'group',
        'route',
        'occupier'
      ],
      format: {
        created_at: E_SchemaFormatFunc.ToLocalTimestamp,
        updated_at: E_SchemaFormatFunc.ToLocalTimestamp,
        isBody: E_SchemaFormatFunc.ToRootElement,
        group: E_SchemaFormatFunc.ToGroupName,
        createdBy: E_SchemaFormatFunc.ToCreatorName
      }
    },
    pageContent: {
      include: ['fileName', 'componentName', 'props', 'css', 'children', 'methods', 'state', 'lifeCycles']
    },
    folder: {
      convert: {
        name: 'folderName',
        route: 'router',
        created_at: 'gmt_create',
        updated_at: 'gmt_modified'
      },
      include: ['name', 'route', 'created_at', 'updated_at', 'id', 'parentId', 'depth'],
      format: {
        created_at: E_SchemaFormatFunc.ToLocalTimestamp,
        updated_at: E_SchemaFormatFunc.ToLocalTimestamp
      }
    }
  };
  config.schema = schemaConf;

  config.tmpPath = {
    base: '/tmp',
    imageCache: '/tmp/image_cache',
    buildground: '/tmp/buildground'
  };

  // 屏蔽掉需要转发 console 的接口
  config.bodyParser = {
    jsonLimit: '10mb'
  };

  const commonRequestOption = {
    method: 'POST',
    dataType: 'json',
    contentType: 'json',
    timeout: 10 * 60 * 1000, // 这里与当前大模型接口的最大响应时长保持一致
  };

  //ai大模型相关配置，请自行替换服务配置
  config.aiChat = (messages = []) => {
    return {
      [E_FOUNDATION_MODEL.GPT_35_TURBO]: {
        httpRequestUrl: (process.env.OPENAI_API_URL || 'https://api.openai.com')+'/v1/chat/completions',
        httpRequestOption: {
          ...commonRequestOption,
          data: {
            model: E_FOUNDATION_MODEL.GPT_35_TURBO,
            messages,
          },
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        },
        manufacturer: 'openai',
      },
      ////本地兼容opanai-api接口的 大语言模型，如chatGLM6b,通义千问 等。你也可以分开成多个
      [E_FOUNDATION_MODEL.Local_GPT]: {
        httpRequestUrl: (process.env.Local_GPT_API_URL || 'http://127.0.0.1:8000')+'/v1/chat/completions',
        httpRequestOption: {
          ...commonRequestOption,
          data: {
            model: E_FOUNDATION_MODEL.Local_GPT,
            messages,
          },
          headers: {
            Authorization: `Bearer ${process.env.Local_GPT_API_KEY}`,
          },
        },
        manufacturer: '!openai',
      },
      [E_FOUNDATION_MODEL.ERNIE_BOT_TURBO]: {
        httpRequestUrl: `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/eb-instant?access_token=${process.env.WENXIN_ACCESS_TOKEN}`,
        httpRequestOption: {
          ...commonRequestOption,
          data: {
            model: E_FOUNDATION_MODEL.ERNIE_BOT_TURBO,
            messages,
          },
        },
        manufacturer: 'baidu',
      },
    };
  };

  config.npmRegistryOptions = [
    '--registry=https://registry.npmjs.org/',
  ];

  config.cnpmRegistryOptions = [
    '--registry=http://registry.npmmirror.com/'
  ];
  config.buildground = '/tmp/buildground';
  config.baseNpm = '@opentiny/tiny-engine-block-build';
  config.authToken = process.env.NPM_AUTH_TOKEN; // 替换为自己的npm token
  config.registry = 'https://registry.npmjs.org/';
  config.tokenRegistry = 'registry.npmjs.org/';
  config.projectName = process.env.GIT_REPO;     // 应用发布git仓库地址
  config.gitBranch = process.env.GIT_BRANCH;     // 应用发布git代码默认提交分支
  config.userName = process.env.GIT_USERNAME;
  config.userToken = process.env.GIT_USER_TOKEN;
  config.email = process.env.GIT_EMAIL;

  return config;
};
