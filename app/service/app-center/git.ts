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
import { spawn } from 'cross-spawn';
import * as path from 'path';
import fs from 'fs-extra';
import DataService from '../dataService';
import { GitRepository, GitUser } from '../../lib/git';
import { throwApiError } from '../../lib/ApiError';
import { E_AppErrorCode } from '../../lib/enum';

const cwd = process.cwd();

class GitService extends DataService {
  public async setUserInfo(user: GitUser, repository: GitRepository) {
    const exist = await fs.pathExists(path.resolve(repository.codePath, '.git'));
    if (!exist) {
      throwApiError('', 200, E_AppErrorCode.CM316);
    }

    try {
      const commands = [
        `git config --global core.autocrlf true`,
        `git config --local user.name "${user.username}"`,
        `git config --local user.email "${user.email}"`
      ];

      for (const command of commands) {
        await this.execCommand(command, { cwd: path.resolve(repository.codePath) });
      }
    } catch (error: any) {
      throwApiError(error.message, 200, E_AppErrorCode.CM315);
    }
  }

  public generateGitUser({ username, email, userToken }): { downloadCodeUser: GitUser; uploadCodeUser: GitUser } {
    const loginUser = new GitUser(username, email, userToken); // 当前的登录用户

    return {
      downloadCodeUser: loginUser.isValidNormalUser() ? loginUser : new GitUser(), // 有配置git代码库token情况下，优先使用用户账号
      uploadCodeUser: loginUser
    };
  }

  public async fetchRepository(user: GitUser, repository: GitRepository) {
    try {
      const command = `git clone ${repository.url.replace(
        '//',
        `//${user.username}:${user.userToken}@`
      )} ${repository.codePath}`;
      await this.execCommand(command);
    } catch (error: any) {
      throwApiError(error.message, 200, E_AppErrorCode.CM302);
    }
  }

  public async checkoutBranch(repository: GitRepository) {
    try {
      const command = `git checkout ${repository.branch}`;
      await this.execCommand(command, { cwd: path.resolve(repository.codePath) });
    } catch (error: any) {
      if (!repository.canCreateNewBranch){
        throwApiError(error.message, 200, E_AppErrorCode.CM303);
      }
      await this.checkoutNewBranch(repository);
    }
  }

  public async checkoutNewBranch(repository: GitRepository) {
    try {
      const commands = [`git checkout -b ${repository.branch}`, `git push --set-upstream origin ${repository.branch}`];
      for (const command of commands) {
        await this.execCommand(command, { cwd: path.resolve(repository.codePath) });
      }
    } catch (error: any) {
      throwApiError(error.message, 200, E_AppErrorCode.CM304);
    }
  }

  public async updateLocalCode(repository) {
    try {
      await this.execCommand('git pull', { cwd: repository.codePath });
    } catch (error: any) {
      throwApiError(error.message, 200, E_AppErrorCode.CM305);
    }
  }

  public async upload2Remote(
    repository: GitRepository,
    commitInfo = '[lowcode auto] [ci skip] [WI2022062000245] update code'
  ) {
    try {
      const commands = ['git add .', 'git commit -m'.split(' ').concat(commitInfo), 'git push'];
      for (const command of commands) {
        await this.execCommand(command, { cwd: path.resolve(repository.codePath) });
      }
    } catch (error: any) {
      throwApiError(error.message, 200, E_AppErrorCode.CM306);
    }
  }

  public async execCommand(command: Array<string> | string, options = { cwd }) {
    const [cmd, ...params] = Array.isArray(command) ? command : command.split(' ');
    return new Promise((resolve, reject) => {
      const task = spawn(cmd, params, { ...options });
      let stderr = '';
      task.on('close', (code) => {
        if (code === 0) {
          return resolve({ success: true });
        }
        return reject(new Error(stderr.trim()));
      });
      task.on('error', reject);
      task.stderr?.on('data', (chunk) => {
        stderr += chunk;
      });
      task.stdout?.pipe(process.stdout);
      task.stderr?.pipe(process.stderr);
    });
  }
}

export default GitService;
