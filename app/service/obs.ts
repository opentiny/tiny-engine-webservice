
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
import * as path from 'path';
import { Stream } from 'stream';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import { Service } from 'egg';
import ObsClient from 'esdk-obs-nodejs';
import { E_ErrorCode } from '../lib/enum';
import { I_ObsDelParams, I_ObsPutParams, I_Response, I_ObsDownloadFolder } from '../lib/interface';

class Obs extends Service {
  public obsClient: any;
  private Bucket = this.config.obs.bucket;

  constructor(opts) {
    super(opts);
    this.obsClient = new ObsClient({
      access_key_id: process.env.OBS_AK, // 配置AK
      secret_access_key: process.env.OBS_SK, // 配置SK
      server: this.config.obs.serviceUrl, // 配置服务地址
      max_retry_count: 1,
      timeout: 20,
      ssl_verify: false,
      long_conn_param: 0
    });
  }

  upload(options: I_ObsPutParams): Promise<any> {
    const { logger } = this.app;
    return this.obsClient
      .putObject({
        Bucket: this.Bucket,
        ...options
      })
      .then((result) => {
        let success = false;

        if (result.CommonMsg.Status < 300) {
          if (result.InterfaceResult) {
            success = true;
            logger.info(`ObsService Operation ${options.Key} Succeed`);
          }
        } else {
          logger.info('ObsService Code-->' + result.CommonMsg.Code);
          logger.info('ObsService Message-->' + result.CommonMsg.Message);
          logger.info('ObsService HostId-->' + result.CommonMsg.HostId);
          logger.info('ObsService RequestId-->' + result.CommonMsg.RequestId);
        }
        return { success, result };
      })
      .catch((err) => {
        logger.error('Error-->' + err);
        return err;
      });
  }

  delete(options: I_ObsDelParams): Promise<any> {
    const { logger } = this.app;
    return this.obsClient
      .deleteObjects({
        Bucket: this.Bucket,
        ...options
      })
      .then((result) => {
        let success = false;

        if (result.CommonMsg.Status < 300) {
          success = true;
          logger.info('ObsService RequestId-->' + result.InterfaceResult.RequestId);
          logger.info('ObsService VersionId-->' + result.InterfaceResult.VersionId);
        } else {
          logger.info('ObsService Code-->' + result.CommonMsg.Code);
          logger.info('ObsService Message-->' + result.CommonMsg.Message);
        }
        return { success, result };
      })
      .catch((err) => {
        logger.error('ObsService Error-->' + err);
        return err;
      });
  }

  async downloadFolder(params: I_ObsDownloadFolder) {
    const { prefix, savePath } = params;
    const filelist = await this.getFilelist(prefix);
    /**
     * 当该平台没有任何静态资源时返回错误
     * obs SDK listObjects api在选择文件夹下载时,会将prefix也当做下载对象返回
     * 因此当返回的filelist 长度小于2时，证明该prefix 为空文件夹 或 prefix不存在
     */

    if (filelist.length < 2) {
      return this.ctx.helper.getResponseData(null, {
        code: E_ErrorCode.NotFound,
        message: 'No available static resources were found'
      });
    }
    // 确保savePath 目录一定存在
    fs.ensureDirSync(savePath);
    const tasks = filelist.map((item) => {
      const filename = path.relative(prefix, item.Key);
      return this.download(item.Key, path.join(savePath, filename));
    });

    return await this.runDownloadTask(tasks);
  }

  async download(obsFile: string, filepath: string): Promise<any> {
    // 这里应该判断key是否存在
    const res = {
      obsFile,
      status: false
    };
    const stream = await this.getFileStream(obsFile);
    if (stream !== null) {
      try {
        const pathObj = path.parse(filepath);
        fs.ensureDirSync(pathObj.dir);
        const writerStream = fs.createWriteStream(filepath);
        stream.pipe(writerStream);
        res.status = true;
      } catch (e) {
        this.logger.error('ObsService download error:', e);
        res.status = false;
      }
    }
    return res;
  }

  getFileStream(filename: string): Promise<Stream | null> {
    const { logger } = this.app;
    return this.obsClient
      .getObject({
        Bucket: this.Bucket,
        Key: filename,
        SaveAsStream: true
      })
      .then((result) => {
        if (result.CommonMsg.Status < 300 && result.InterfaceResult) {
          return result.InterfaceResult.Content;
        }
        logger.error(result, 'downloadFile');
        return null;
      })
      .catch((err) => {
        logger.error(err, 'downloadFile');
        return null;
      });
  }

  // 获取项目下文件列表
  getFilelist(prefix: string): Promise<Array<any>> {
    return this.obsClient
      .listObjects({
        Bucket: this.Bucket,
        Prefix: prefix
      })
      .then((result) => {
        let res = [];
        if (result.CommonMsg.Status < 300) {
          res = result?.InterfaceResult?.Contents || [];
        } else {
          this.logger.error(result);
        }
        return res;
      })
      .catch((err) => {
        this.logger.error(err);
        return [];
      });
  }

  async uploadFolderForBlock(appFolder: string, KeyPrefix?: string): Promise<string[]> {
    const files = glob.sync('**/*.*', {
      cwd: appFolder,
      ignore: ['**/*.svg']
    });
    if (!files.length) {
      return this.ctx.helper.getResponseData(null, {
        code: E_ErrorCode.NotFound,
        message: '未获取该目录下文件信息'
      });
    }
    const prefix = KeyPrefix || this.app.config.deploy.obsPathKey;
    const tasks = files.map((file: string) => {
      const Key = this.getFileKeyForBlock(appFolder, file, appFolder);
      const SourceFile = path.join(appFolder, `./${file}`);
      return this.upload({
        Key: `${prefix}/${Key}`,
        SourceFile
      });
    });
    await this.runTask(tasks);
    return files;
  }

  private getFileKeyForBlock(folder: string, file: string, baseDir): string {
    const fpath = path.join(folder, `./${file}`);
    const pathNames = path.relative(baseDir, fpath).split(path.sep);
    return pathNames.join('/');
  }

  async uploadFolder(appFolder: string, baseDir?: string): Promise<I_Response> {
    const files = glob.sync('**/*.*', {
      cwd: appFolder
    });
    if (!files.length) {
      return this.ctx.helper.getResponseData(null, {
        code: E_ErrorCode.NotFound,
        message: '未获取该目录下文件信息'
      });
    }
    const tasks = files.map((file: string) => {
      const Key = this.getFileKey(appFolder, file, baseDir);
      const SourceFile = path.join(appFolder, `./${file}`);
      return this.upload({
        Key,
        SourceFile
      });
    });
    return await this.runTask(tasks);
  }

  private getFileKey(folder: string, file: string, dir?: string): string {
    const { baseDir, obsPathKey } = this.app.config.deploy;
    const relativeDir = dir || baseDir;
    const fpath = path.join(folder, `./${file}`);
    const pathNames = path.relative(relativeDir, fpath).split(path.sep);
    return `${obsPathKey}/${pathNames.join('/')}`;
  }

  private runTask(tasks: Array<Promise<any>>): Promise<I_Response> {
    return Promise.all(tasks)
      .then((uploadResults) => {
        const res = uploadResults.map((uploadResult) => {
          const { success, result } = uploadResult;
          if (success === true) {
            return {
              Status: 200
            };
          }
          return (
            result?.CommonMsg ?? {
              Status: 500,
              Message: '上传失败'
            }
          );
        });
        return this.ctx.helper.getResponseData(res);
      })
      .catch((e) => {
        this.app.logger.error('ObsService Error -->', e);
        return this.ctx.helper.getResponseData(null, {
          code: E_ErrorCode.Fail,
          message: e.message
        });
      });
  }

  async list(name: string, prefix = 'block') {
    const obsClient = this.obsClient;
    return obsClient
      .listObjects({
        Bucket: this.config.obs.bucket,
        Prefix: `${prefix}/${name}`
      })
      .then((result) => {
        console.log('Status-->' + result.CommonMsg.Status);
        if (result.CommonMsg.Status < 300 && result.InterfaceResult) {
          for (let j = 0; j < result.InterfaceResult.Contents.length; j++) {
            console.log('Contents[' + j + ']:');
            console.log('Key-->' + result.InterfaceResult.Contents[j].Key);
            console.log('Owner[ID]-->' + result.InterfaceResult.Contents[j].Owner.ID);
          }
        }
        return result.InterfaceResult.Contents.map((c) => ({
          Key: c.Key
        }));
      })
      .catch((err) => {
        console.error('Error-->' + err);
        return err;
      });
  }

  private runDownloadTask(tasks: Array<Promise<any>>): Promise<I_Response> {
    return Promise.all(tasks)
      .then((results) => {
        const errors: Array<any> = [];
        results.forEach((result) => {
          if (result.status === false) {
            errors.push(result.obsFile);
          }
        });
        if (errors.length) {
          this.logger.error('obs download error:', errors);
          return this.ctx.helper.getResponseData(null, {
            code: E_ErrorCode.Fail,
            message: '文件下载失败',
            errors
          });
        }
        return this.ctx.helper.getResponseData({
          status: 200
        });
      })
      .catch((e) => {
        this.app.logger.error('ObsService Error -->', e);
        return this.ctx.helper.getResponseData(null, {
          code: E_ErrorCode.Fail,
          message: e.message
        });
      });
  }
}

export default Obs;
