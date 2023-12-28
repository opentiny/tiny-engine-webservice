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
import { I_Response, I_publishParam } from '../../lib/interface';
import { GitRepository } from '../../lib/git';
import DataServcice from '../dataService';

class PublishApp extends DataServcice {
  public bodyParam: any = null;
  async start(body: I_publishParam): Promise<I_Response> {
    const appId = body.id;
    this.bodyParam = body;
    let remoteBranchUrl = '';

    this.logger.info('start publish app code to git repo.');

    remoteBranchUrl = await this.generateAndPush(appId);

    const success = {
      code: 200,
      url: remoteBranchUrl,
      result: 'success to publish app code to git repo!'
    };

    return this.ctx.helper.getResponseData(success);
  }

  private getUserInfo(): { username: string; email: string; userToken: string } {
    return {
      username: this.ctx.session.user?.uid,
      email: this.ctx.session.user?.email,
      userToken: this.bodyParam?.gitUserToken || ''
    };
  }

  private async generateAndPush(appId: string | number) {
    const { generate } = this.ctx.service.appCenter;

    try {
      await generate.init(appId);
      const project_name = this.config.projectName;
      const branch = this.config.gitBranch;
      const git_branch = this.bodyParam.branch || branch;
      const canCreateNewBranch = this.bodyParam.canCreateNewBranch || false;

      if (!project_name || !git_branch) {
        throw new Error(`git_repo url or branch of app ${appId} is invalid.`);
      }

      const { generatePath } = generate;
      // params: reposityUrl/branch/localDirPath
      const repository = new GitRepository(project_name, git_branch, canCreateNewBranch, generatePath);

      const { downloadCodeUser, uploadCodeUser } = this.service.appCenter.git.generateGitUser(this.getUserInfo());
      this.logger.info(`downloadUser: ${downloadCodeUser.username}; uploadUser: ${uploadCodeUser.username}`);

      await this.service.appCenter.git.fetchRepository(downloadCodeUser, repository);
      await this.service.appCenter.git.setUserInfo(uploadCodeUser, repository);
      await this.service.appCenter.git.checkoutBranch(repository);

      // 是否生成工程配置由前端来决定
      if (this.bodyParam.allGenerate) {
        await this.ctx.service.appCenter.generate.copyTemplate();
      }

      await generate.generateCode();
      await this.service.appCenter.git.upload2Remote(repository, this.bodyParam.commitMsg);

      // 最好能返回 commit_url，但当前获取不到。目前尽最大努力，返回 git push 完成后的 remote branch url
      const branch_url = `${project_name.replace(/\.git/, '')}/tree/${git_branch}`;

      return branch_url;
    } finally {
      // 无论是否成功，都清理本次生成代码的目录、压缩包
      generate.clean();
    }
  }
}

export default PublishApp;
